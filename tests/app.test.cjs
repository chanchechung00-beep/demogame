const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function boot(storage = new Map(), failWrites = false) {
  class Element {
    constructor() {
      this.handlers = {}; this.children = []; this.dataset = {}; this.value = ''; this.disabled = false;
      this.classes = new Set(); this.style = {setProperty() {}};
      this.classList = {add: (...names) => names.forEach(n => this.classes.add(n)), remove: (...names) => names.forEach(n => this.classes.delete(n)), contains: n => this.classes.has(n), toggle: (n, on) => { const flag = on ?? !this.classes.has(n); flag ? this.classes.add(n) : this.classes.delete(n); return flag; }};
      this.clientHeight = 500; this.clientWidth = 800;
    }
    addEventListener(name, handler) { (this.handlers[name] ||= []).push(handler); }
    trigger(name) { for (const handler of this.handlers[name] || []) handler({preventDefault() {}, stopPropagation() {}, target:this}); }
    setAttribute(name,value) { this[name] = value; }
    append(...nodes) { this.children.push(...nodes); }
    appendChild(node) { this.append(node); }
    replaceChildren(...nodes) { this.children = nodes; }
    remove() {} focus() {} select() {} showModal() { this.open = true; } close() { this.open = false; }
    getBoundingClientRect() { return {left:0,right:0,top:0,bottom:0,width:800,height:500}; }
  }
  const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const elements = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(match => {
    const element = new Element();
    for (const attribute of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const [,name,value=''] = attribute;
      if (name === 'id') element.id = value;
      if (name === 'class') value.split(' ').forEach(c=>element.classes.add(c));
      if (name.startsWith('data-')) element.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())] = value;
    }
    return element;
  });
  const byId = new Map(elements.filter(e=>e.id).map(e=>[e.id,e]));
  const document = {body:new Element(), documentElement:{clientWidth:1000}, getElementById: id => { if (!byId.has(id)) throw new Error('Missing DOM id '+id); return byId.get(id); }, createElement:()=>new Element(), addEventListener(){}, querySelectorAll: selector => selector.startsWith('.') ? elements.filter(e=>e.classes.has(selector.slice(1))) : elements.filter(e=>Object.hasOwn(e.dataset,selector.slice(6,-1).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()))) };
  const context = vm.createContext({document, console, setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},innerWidth:1000,addEventListener(){},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>{if(failWrites)throw Error('blocked');storage.set(key,value);}}});
  context.window=context;
  for (const file of ['game-core.js','review-core.js','app.js']) {
    let source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
    if(file==='app.js') source=source.replace(/\}\)\(\);\s*$/, 'window.testGame = {state, collect, frame, handleTypingInput, finishGame};})();');
    vm.runInContext(source,context,{filename:file});
  }
  return {context, storage, el:id=>byId.get(id), button:(key,value)=>elements.find(e=>e.dataset[key]===value), element:()=>new Element()};
}
test('selecting topic opens learning and learning buttons launch each game',()=>{
  const app=boot(); app.button('topic','fruit').trigger('click');
  assert.equal(app.el('vocab-screen').classList.contains('hidden'),false);
  assert.equal(app.el('vocab-word').textContent,'fruit');
  app.button('learnPlay','catch').trigger('click');
  assert.equal(app.context.testGame.state.mode,'catch');
  assert.equal(app.el('play-screen').classList.contains('hidden'),false);
  app.el('back-home').trigger('click'); app.button('nav','vocabulary').trigger('click'); app.button('learnPlay','type').trigger('click');
  assert.equal(app.context.testGame.state.mode,'type');
});
test('vocabulary navigation hides game toolbar mode, topic selection enables it',()=>{
  const app=boot();
  app.button('topic','fruit').trigger('click');
  assert.equal(app.context.document.body.classList.contains('learning-for-game'),true);
  app.button('nav','vocabulary').trigger('click');
  assert.equal(app.context.document.body.classList.contains('learning-for-game'),false);
  app.button('vocabTopic','animals').trigger('click');
  assert.equal(app.context.document.body.classList.contains('learning-for-game'),false);
  app.button('nav','review').trigger('click');
  assert.equal(app.context.document.body.classList.contains('review-mode'),true);
  assert.equal(app.el('review-empty').classList.contains('hidden'),false);
});
test('catch mistake persists across reload and can be reviewed to completion',()=>{
  const app=boot(); app.button('topic','animals').trigger('click'); app.button('learnPlay','catch').trigger('click');
  const word=app.context.testGame.state.current.word;
  app.context.testGame.collect({text:'!'});
  assert.equal(JSON.parse(app.storage.get('littlewords-progress-v2')).reviewWords['animals:'+word].mistakes,1);
  const reloaded=boot(app.storage); reloaded.button('nav','review').trigger('click');
  assert.equal(reloaded.el('review-list').children.length,1);
  reloaded.el('review-start').trigger('click'); reloaded.el('review-answer').value='wrong'; reloaded.el('review-form').trigger('submit');
  assert.match(reloaded.el('review-feedback').textContent,/Chưa đúng/);
  reloaded.el('review-answer').value=word.toUpperCase(); reloaded.el('review-form').trigger('submit');
  assert.equal(JSON.parse(app.storage.get('littlewords-progress-v2')).reviewWords['animals:'+word].resolved,true);
  reloaded.el('review-next').trigger('click');
  assert.equal(reloaded.el('review-start').disabled,true);
  assert.equal(reloaded.el('review-list').classList.contains('hidden'),false);
});
test('typing errors and fallen words persist; game stops at zero lives',()=>{
  const app=boot(); app.button('topic','animals').trigger('click'); app.button('learnPlay','type').trigger('click');
  const state=app.context.testGame.state;
  state.items=[{text:'cat',el:app.element(),y:0,x:20,speed:40}];
  app.el('word-input').value='cx'; app.el('word-input').trigger('input');
  assert.equal(state.reviewWords['animals:cat'].mistakes,1);
  state.lives=1; state.lastSpawn=100; state.items=[{text:'dog',el:app.element(),y:600,x:20,speed:40},{text:'cow',el:app.element(),y:600,x:30,speed:40}];
  app.context.testGame.frame(101);
  assert.equal(state.lives,0); assert.equal(state.running,false);
  assert.equal(state.reviewWords['animals:dog'].mistakes,1);
  assert.equal(state.reviewWords['animals:cow'],undefined);
  assert.equal(app.el('result-screen').classList.contains('hidden'),false);
});
test('blocked storage keeps session review and displays a notice',()=>{
  const app=boot(new Map(),true); app.button('topic','animals').trigger('click'); app.button('learnPlay','catch').trigger('click'); app.context.testGame.collect({text:'!'});
  assert.equal(app.el('storage-notice').classList.contains('hidden'),false);
  assert.equal(Object.keys(app.context.testGame.state.reviewWords).length,1);
});
test('legacy learned words are preserved when saving review progress',()=>{
  const storage=new Map([['littlewords-progress-v1',JSON.stringify({learned:['cat'],sound:false})]]);
  const app=boot(storage); app.button('topic','animals').trigger('click'); app.button('learnPlay','catch').trigger('click'); app.context.testGame.collect({text:'!'});
  const saved=JSON.parse(storage.get('littlewords-progress-v2'));
  assert.deepEqual(saved.learned,['cat']); assert.equal(saved.sound,false);
});

test('start button opens a chooser before a normal game starts',()=>{
 const app=boot(); app.button('topic','fruit').trigger('click');
 assert.equal(app.context.testGame.state.running,false);
 assert.equal(Boolean(app.el('game-picker').open),false);
 app.el('choose-game').trigger('click');
 assert.equal(app.el('game-picker').open,true);
 assert.equal(app.context.testGame.state.running,false);
 app.button('learnPlay','catch').trigger('click');
 assert.equal(app.el('game-picker').open,false);
 assert.equal(app.context.testGame.state.practice,false);
 app.context.testGame.collect({text:'!'});
 assert.equal(app.context.testGame.state.lives,2);
});
test('home practice allows repeated catch mistakes and replay without losing lives',()=>{
 const app=boot(); app.button('nav','practice').trigger('click');
 assert.equal(app.el('game-picker').open,true);
 app.button('learnPlay','catch').trigger('click');
 const state=app.context.testGame.state;
 for(let i=0;i<6;i++) app.context.testGame.collect({text:'!'});
 assert.equal(state.practice,true); assert.equal(state.lives,3); assert.equal(state.running,true);
 assert.match(app.el('feedback').textContent,/không mất mạng/);
 state.score=999; app.context.testGame.finishGame(); assert.equal(state.highScore,0);
 app.el('play-again').trigger('click'); assert.equal(state.practice,true);
 app.el('back-home').trigger('click'); assert.equal(app.el('practice-badge').classes.has('hidden'),true);
 app.button('topic','fruit').trigger('click'); app.el('choose-game').trigger('click'); app.button('learnPlay','catch').trigger('click');
 assert.equal(state.practice,false); app.context.testGame.collect({text:'!'}); assert.equal(state.lives,2);
});
test('practice typing can miss more than three words and keeps going',()=>{
 const app=boot(); app.button('nav','practice').trigger('click'); app.button('learnPlay','type').trigger('click');
 const state=app.context.testGame.state;
 for(let i=0;i<6;i++) {state.lastSpawn=100;state.items=[{text:'cat',el:app.element(),y:600,x:20,speed:40}]; app.context.testGame.frame(101);}
 assert.equal(state.lives,3); assert.equal(state.running,true); assert.equal(state.practice,true);
 assert.equal(app.el('space-lives').textContent,'💚 ∞');
});
