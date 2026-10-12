(() => {
  const core = window.GameCore;
  const $ = id => document.getElementById(id);
  const state = { mode: 'catch', score: 0, lives: 3, round: 0, order: [], current: null, collected: [], typedBuffer: '', typedCount: 0, items: [], playerX: 50, running: false, sound: true, learned: new Set(), timer: null, raf: null, lastSpawn: 0, lastFrame: 0, completedWords: [], vocabIndex: 0, cardFlipped: false, paused: false, selectedTopic: null };
  const activeWords = () => core.getWords(state.selectedTopic);
  const topicLabels = { animals: 'Động vật', farm: 'Nông trại', family: 'Gia đình', ocean: 'Đại dương', fruit: 'Trái cây', objects: 'Đồ vật', space: 'Không gian', nature: 'Thiên nhiên' };
  const learnedKey = (entry, topic = state.selectedTopic) => `${topic || 'animals'}:${entry.word}`;
  const isLearned = entry => state.learned.has(learnedKey(entry)) || (state.selectedTopic === 'animals' && state.learned.has(entry.word));
  const storageKey = 'littlewords-progress-v2';
  const legacyStorageKey = 'littlewords-progress-v1';
  const readSaved = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const currentSaved = readSaved(storageKey);
  const saved = currentSaved || readSaved(legacyStorageKey) || {};
  state.highScore = Number(currentSaved?.highScore) || 0;
  state.learned = new Set(Array.isArray(saved.learned) ? saved.learned : []);
  state.sound = saved.sound !== false;
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify({ highScore: state.highScore, learned: [...state.learned], sound: state.sound })); } catch {} };
  const updateHome = () => {
    $('home-star-points').textContent = state.highScore;
    const words = activeWords(); const learnedCount = words.filter(isLearned).length;
    $('words-learned').textContent = `Bé đã gặp ${learnedCount}/${words.length} từ`;
    const percent = Math.round(learnedCount / words.length * 100);
    $('progress-fill').style.width = `${percent}%`;
    $('progress-count').textContent = `${percent}%`;
  };
  const showScreen = screen => { for (const id of ['home-screen', 'play-screen', 'result-screen', 'vocab-screen']) $(id).classList.toggle('hidden', id !== screen); document.body.classList.toggle('home-mode', screen === 'home-screen'); document.body.classList.toggle('vocabulary-mode', screen === 'vocab-screen'); };
  const renderFlashcard = () => {
    const words = activeWords(); state.vocabIndex %= words.length; const learnedCount = words.filter(isLearned).length; const entry = words[state.vocabIndex];
    $('vocab-emoji').textContent = entry.emoji; $('vocab-back-emoji').textContent = entry.emoji;
    $('vocab-word').textContent = entry.word; $('vocab-spelling').textContent = entry.word; $('vocab-meaning').textContent = entry.meaning; $('vocab-back-meaning').textContent = entry.meaning;
    const article = /^[aeiou]/i.test(entry.word) ? 'an' : 'a';
    $('vocab-example-en').textContent = `This is ${article} ${entry.word}.`;
    $('vocab-example-vi').textContent = `Đây là ${entry.meaning.charAt(0).toLowerCase()}${entry.meaning.slice(1)}.`;
    $('vocab-count').textContent = `${state.vocabIndex + 1} / ${words.length}`;
    $('vocab-back-count').textContent = `${state.vocabIndex + 1} / ${words.length}`;
    $('vocab-star-points').textContent = state.highScore;
    document.querySelectorAll('[data-vocab-topic]').forEach(button => { const selected = button.dataset.vocabTopic === (state.selectedTopic || 'animals'); button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('topic-active', selected); });
    $('vocab-learned-count').textContent = `${learnedCount} / ${words.length} từ đã gặp`;
    $('vocab-progress-fill').style.width = `${Math.round(learnedCount / words.length * 100)}%`;
    $('flashcard').classList.toggle('flipped', state.cardFlipped); $('flashcard').setAttribute('aria-pressed', String(state.cardFlipped));
  };
  const flipFlashcard = () => { state.cardFlipped = !state.cardFlipped; renderFlashcard(); };
  const nextFlashcard = known => {
    if (known) { state.learned.add(learnedKey(activeWords()[state.vocabIndex])); save(); updateHome(); }
    state.vocabIndex = (state.vocabIndex + 1) % activeWords().length; state.cardFlipped = false; renderFlashcard();
  };
  const shuffle = list => [...list].sort(() => Math.random() - .5);
  const setFeedback = (text, kind = '') => { $('feedback').textContent = text; $('feedback').className = `feedback ${kind}`; };
  const speak = word => {
    if (!state.sound || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; utterance.rate = .78; utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };
  const renderSlots = () => {
    const answerSlots = $('answer-slots'); const promptRow = $('prompt-row'); const letterCount = state.current.word.length;
    answerSlots.innerHTML = [...state.current.word].map((letter, index) => `<span class="answer-slot ${state.collected[index] ? 'filled' : ''}">${state.collected[index] || ''}</span>`).join('');
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth; const compact = viewportWidth <= 700;
    const maxWidth = viewportWidth * .92; const baseWidth = compact ? Math.min(viewportWidth * .72, 310) : Math.min(Math.max(255, viewportWidth * .34), 360);
    const gap = compact ? Math.min(6, Math.max(3, viewportWidth * .01)) : 6; const preferredSlot = compact ? Math.min(31, Math.max(22, viewportWidth * .07)) : Math.min(43, Math.max(31, viewportWidth * .04));
    const usableWidth = maxWidth * .88 - 12; const slotWidth = Math.min(preferredSlot, (usableWidth - gap * (letterCount - 1)) / letterCount);
    answerSlots.style.setProperty('--answer-slot-size', `${slotWidth}px`); answerSlots.style.setProperty('--answer-slot-gap', `${gap}px`);
    const slotsWidth = slotWidth * letterCount + gap * (letterCount - 1);
    promptRow.style.width = `${Math.min(maxWidth, Math.max(baseWidth, (slotsWidth + 12) / .88))}px`;
  };
  window.addEventListener('resize', () => { if (state.mode === 'catch' && state.current) renderSlots(); });
  const updateStats = () => {
    $('score-value').textContent = state.score; $('life-icons').textContent = '❤️'.repeat(state.lives) + '🤍'.repeat(3 - state.lives); $('lives-value').setAttribute('aria-label', `${state.lives} lượt chơi còn lại`);
    $('space-score').textContent = state.score; $('space-lives').textContent = '❤️'.repeat(state.lives) + '🤍'.repeat(3 - state.lives); $('space-lives').setAttribute('aria-label', `${state.lives} lượt chơi còn lại`);
  };
  const setupRound = () => {
    if (state.mode === 'type') {
      if (state.completedWords.length >= state.order.length || state.lives <= 0) return finishGame();
      state.current = null; state.collected = []; state.typedCount = 0; state.typedBuffer = ''; state.items = []; state.lastSpawn = 0;
      $('falling-items').innerHTML = ''; $('game-panel').classList.add('space-game'); $('game-panel').classList.remove('catch-game'); document.body.classList.remove('orchard-mode'); document.body.classList.add('space-mode'); $('space-hud').classList.remove('hidden');
      $('prompt-row').classList.add('hidden'); $('space-round').textContent = `Mốc ${state.completedWords.length + 1}/${state.order.length}`;
      document.getElementById('space-theme').textContent = topicLabels[state.selectedTopic] || topicLabels.animals;
      $('word-input').value = ''; $('word-input').classList.remove('hidden'); $('word-input').focus();
      setFeedback('Gõ các chữ cái để bắn vào từ đang rơi. 🚀'); updateStats(); return;
    }
    if (state.round >= state.order.length || state.lives <= 0) return finishGame();
    state.current = state.order[state.round]; state.collected = []; state.typedCount = 0; state.items = []; state.playerX = 50; state.lastSpawn = 0;
    $('falling-items').innerHTML = ''; $('basket-player').style.left = '50%'; $('round-label').textContent = `TỪ ${state.round + 1} / ${state.order.length}`;
    $('prompt-meaning').textContent = state.current.meaning; renderSlots();
    document.body.classList.remove('space-mode'); document.body.classList.add('orchard-mode'); $('game-panel').classList.remove('space-game'); $('game-panel').classList.add('catch-game'); $('space-hud').classList.add('hidden');
    $('prompt-row').classList.remove('hidden'); $('word-input').classList.add('hidden');
    $('instruction-text').textContent = 'Di chuyển sóc để hứng chữ cái theo đúng thứ tự!';
    $('instruction-icon').textContent = '💡'; $('playfield-hint').textContent = '← → · Kéo sóc bằng chuột hoặc vuốt trên màn hình';
    $('answer-slots').classList.remove('hidden'); $('move-left').classList.remove('hidden'); $('move-right').classList.remove('hidden'); $('controls-label').classList.remove('hidden');
    setFeedback(''); updateStats();
  };
  const movePlayer = direction => {
    if (!state.running || state.mode !== 'catch') return;
    state.playerX = Math.max(7, Math.min(93, state.playerX + direction * 4)); $('basket-player').style.left = `${state.playerX}%`;
  };
  const movePlayerToPointer = event => {
    if (!state.running || state.mode !== 'catch') return;
    const rect = $('playfield').getBoundingClientRect();
    state.playerX = Math.max(7, Math.min(93, (event.clientX - rect.left) / rect.width * 100));
    $('basket-player').style.left = `${state.playerX}%`;
  };
  const spawnItem = () => {
    const el = document.createElement('span'); el.className = `falling-item ${state.mode === 'type' ? 'word-item' : ''}`;
    let text;
    if (state.mode === 'type') {
      const activeWords = state.items.map(item => item.text);
      const completed = state.completedWords.map(word => word.word);
      const available = state.order.filter(word => !activeWords.includes(word.word) && !completed.includes(word.word));
      if (!available.length) return;
      text = shuffle(available)[0].word;
    }
    else {
      const expected = core.nextLetter(state.current.word, state.collected);
      text = Math.random() < .68 ? expected : String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    if (state.mode === 'catch') {
      el.classList.add('apple-item');
      const apple = document.createElement('span'); apple.className = 'apple-letter';
      const fruit = document.createElement('span'); fruit.className = 'apple-fruit';
      const appleArt = document.createElement('img'); appleArt.className = 'apple-art'; appleArt.src = 'assets/wordland/game1-apple.png'; appleArt.alt = ''; appleArt.setAttribute('aria-hidden', 'true');
      const letter = document.createElement('b'); letter.className = 'apple-letter-label'; letter.textContent = text;
      fruit.appendChild(appleArt); apple.append(fruit, letter); el.appendChild(apple);
    } else el.textContent = text;
    const field = $('playfield');
    let x = 7 + Math.random() * 86;
    if (state.mode === 'catch' && state.items.length) {
      const appleWidth = Math.max(58, Math.min(112, field.clientWidth * .05));
      const minSpacing = appleWidth / field.clientWidth * 150;
      let bestX = x; let bestSpacing = -1;
      for (let attempt = 0; attempt < 24; attempt++) {
        const candidate = 7 + Math.random() * 86;
        const nearest = Math.min(...state.items.map(item => Math.abs(candidate - item.x)));
        if (nearest > bestSpacing) { bestX = candidate; bestSpacing = nearest; }
        if (nearest >= minSpacing) { bestX = candidate; break; }
      }
      x = bestX;
    }
    el.style.left = `${x}%`; $('falling-items').appendChild(el);
    const catchSpeed = Math.min(105, 48 + Math.random() * 15 + state.round * 5 + state.collected.length * 2);
    state.items.push({ el, x, y: state.mode === 'type' ? -42 : Math.max(112, $('playfield').clientHeight * .22), speed: state.mode === 'type' ? 45 + Math.random() * 22 : catchSpeed, text });
    if (state.mode === 'type') el.style.setProperty('--word-glow', ['#f6f3ff', '#c2a8ff', '#ff9bf1', '#84e8ff', '#b5ffb2'][Math.floor(Math.random() * 5)]);
  };
  const collect = item => {
    if (state.mode !== 'catch') return;
    const result = core.catchLetter(state.current.word, state.collected, item.text);
    if (result.correct) {
      state.collected = result.collected; state.score += 10; renderSlots(); setFeedback('Đúng chữ rồi! Cố hứng chữ tiếp theo nhé! ✨', 'success');
      if (result.complete) completeWord();
    } else {
      loseLife(`Hứng nhầm rồi! Cần chữ ${result.expected}. Mất một tim nhé!`);
    }
    updateStats();
  };
  const showWordBurst = (item, meaning = '') => {
    const burst = document.createElement('span');
    burst.className = 'word-burst';
    burst.textContent = '💥';
    burst.style.left = item.el.style.left;
    burst.style.top = item.el.style.top;
    $('falling-items').appendChild(burst);
    setTimeout(() => burst.remove(), 650);
    if (meaning) {
      const label = document.createElement('span'); label.className = 'word-pop-meaning'; label.textContent = meaning;
      label.style.left = item.el.style.left; label.style.top = `${item.y + 38}px`; $('falling-items').appendChild(label);
      setTimeout(() => label.remove(), 1500);
    }
  };
  const fireTypingBeam = item => {
    const field = $('playfield'); const beam = document.createElement('span'); beam.className = 'typing-beam';
    const dx = item.x / 100 * field.clientWidth - field.clientWidth / 2 + 15;
    const distance = Math.max(60, field.clientHeight - item.y - 68);
    beam.style.height = `${distance}px`; beam.style.left = '50%'; beam.style.bottom = '68px';
    beam.style.transform = `translateX(-50%) rotate(${Math.atan2(dx, distance) * 180 / Math.PI}deg)`;
    field.appendChild(beam); setTimeout(() => beam.remove(), 230);
  };
  const completeWord = () => {
    state.running = false; state.learned.add(learnedKey(state.current)); state.completedWords.push(state.current); state.score = core.scoreForWord(state.score, 5); save(); updateStats();
    $('falling-items').innerHTML = ''; speak(state.current.word); setFeedback(`✨ ${state.current.word}! ${state.current.meaning}!`, 'success');
    state.timer = setTimeout(() => { state.round++; setupRound(); if (state.lives > 0 && state.round < state.order.length) startLoop(); }, 1600);
  };
  const loseLife = (message = 'Một chữ cái đã rơi mất. Cố lên nhé!') => {
    state.lives--; updateStats();
    if (state.lives <= 0) { finishGame(); return; }
    if (state.mode === 'type') {
      $('word-input').value = ''; state.typedBuffer = ''; state.typedCount = 0;
      state.items.forEach(item => { item.el.textContent = item.text; item.el.classList.remove('target-word'); });
      setFeedback('Ôi, một từ đã chạm đất. Mình thử từ khác nhé!', 'gentle');
    }
    else setFeedback(message, 'gentle');
  };
  const frame = timestamp => {
    if (!state.running) return;
    const delta = Math.min((timestamp - (state.lastFrame || timestamp)) / 1000, .06); state.lastFrame = timestamp;
    const spawnInterval = state.mode === 'catch' ? Math.max(430, 930 - state.round * 85 - state.collected.length * 16) : 930;
    if (timestamp - state.lastSpawn > spawnInterval) { spawnItem(); state.lastSpawn = timestamp; }
    const field = $('playfield'); const catcherRect = state.mode === 'catch' ? $('basket-player').getBoundingClientRect() : null;
    state.items = state.items.filter(item => {
      item.y += item.speed * delta; item.el.style.top = `${item.y}px`;
      if (state.mode === 'catch') {
        const appleRect = item.el.getBoundingClientRect();
        const touchesCatcher = appleRect.right >= catcherRect.left && appleRect.left <= catcherRect.right && appleRect.bottom >= catcherRect.top && appleRect.top <= catcherRect.bottom;
        if (touchesCatcher) { item.el.remove(); collect(item); return false; }
      }
      if (item.y > field.clientHeight - 40) { item.el.remove(); if (state.mode === 'type') loseLife(); return false; }
      return true;
    });
    state.raf = requestAnimationFrame(frame);
  };
  const startLoop = () => { if (state.lives <= 0 || state.round >= state.order.length) return finishGame(); state.running = true; state.lastFrame = 0; state.raf = requestAnimationFrame(frame); };
  const startGame = mode => {
    document.body.classList.remove('space-result', 'garden-result');
    clearTimeout(state.timer); cancelAnimationFrame(state.raf); state.running = false; state.paused = false; $('pause-overlay').classList.add('hidden'); state.mode = mode; state.score = 0; state.lives = 3; state.round = 0; state.completedWords = [];
    state.order = shuffle(activeWords()).slice(0, mode === 'type' ? activeWords().length : 5);
    $('play-mode-icon').textContent = mode === 'catch' ? '🧺' : '⌨️'; $('play-eyebrow').textContent = mode === 'catch' ? 'TRÒ CHƠI 01' : 'TRÒ CHƠI 02'; $('play-title').textContent = mode === 'catch' ? 'Hứng chữ cái' : 'Gõ từ thật nhanh';
    showScreen('play-screen'); setupRound(); startLoop();
  };
  const finishGame = () => {
    state.running = false; cancelAnimationFrame(state.raf); clearTimeout(state.timer); state.highScore = Math.max(state.highScore, state.score); save(); updateHome();
    document.body.classList.remove('space-mode', 'orchard-mode'); $('game-panel').classList.remove('space-game', 'catch-game'); $('space-hud').classList.add('hidden');
    $('final-score').textContent = state.score; $('result-heading').textContent = state.lives > 0 ? 'Tuyệt vời lắm!' : 'Bé đã cố gắng rồi!';
    document.body.classList.toggle('space-result', state.mode === 'type');
    document.body.classList.toggle('garden-result', state.mode === 'catch');
    $('garden-result-scene').classList.toggle('hidden', state.mode !== 'catch');
    $('garden-result-score').textContent = `${state.score} điểm`;
    $('space-result-scene').classList.toggle('hidden', state.mode !== 'type');
    $('space-result-score').textContent = `${state.score} điểm`;
    $('result-copy').textContent = state.lives > 0 ? 'Bé đã hoàn thành chuyến phiêu lưu hôm nay.' : 'Chơi thêm một lần nữa để học thêm nhé!';
    $('result-learned').textContent = `Bé đã gặp ${state.completedWords.length} từ mới: ${state.completedWords.map(word => word.word).join(', ') || 'Hẹn bé ở lượt sau nhé!'}`;
    showScreen('result-screen');
  };
  const handleTypingInput = () => {
    if (!state.running || state.mode !== 'type') return;
    const input = core.normalize($('word-input').value);
    if (!input) {
      state.typedBuffer = ''; state.typedCount = 0;
      state.items.forEach(item => { item.el.textContent = item.text; item.el.classList.remove('target-word'); }); return;
    }
    const candidates = state.items.filter(item => core.isTypingPrefix(input, item.text));
    if (!candidates.length) {
      $('word-input').value = ''; state.typedBuffer = ''; state.typedCount = 0;
      state.items.forEach(item => { item.el.textContent = item.text; item.el.classList.remove('target-word'); });
      setFeedback('Chữ cái này chưa khớp với từ nào đang rơi. Thử lại nhé!', 'gentle'); return;
    }
    state.typedBuffer = input; state.typedCount = input.length;
    state.items.forEach(item => {
      if (candidates.includes(item)) {
        item.el.innerHTML = `<span class="typed-prefix">${item.text.slice(0, input.length)}</span>${item.text.slice(input.length)}`;
        item.el.classList.toggle('target-word', candidates.length === 1);
      } else { item.el.textContent = item.text; item.el.classList.remove('target-word'); }
    });
    if (candidates.length === 1) for (let count = 0; count < input.length; count++) fireTypingBeam(candidates[0]);
    const completed = candidates.find(item => item.text === input);
    if (!completed) { setFeedback('Đúng hướng rồi! Gõ tiếp nhé. 🚀', 'success'); return; }
    const entry = activeWords().find(word => word.word === completed.text);
    const index = state.items.indexOf(completed); if (index >= 0) state.items.splice(index, 1);
    showWordBurst(completed, entry.meaning); completed.el.remove();
    state.completedWords.push(entry);
    state.score += core.scoreForWord(20, Math.max(0, 10 - Math.floor(completed.y / 35)));
    $('word-input').value = ''; state.typedBuffer = ''; state.typedCount = 0;
    $('space-round').textContent = `Mốc ${Math.min(state.completedWords.length + 1, state.order.length)}/${state.order.length}`;
    state.learned.add(learnedKey(entry)); speak(entry.word); setFeedback(`+ điểm · ${entry.meaning}`, 'success'); updateStats(); save(); updateHome();
    if (state.completedWords.length >= state.order.length) {
      state.running = false; cancelAnimationFrame(state.raf); state.timer = setTimeout(finishGame, 1500);
    }
  };
  const backHome = () => { document.body.classList.remove('space-result', 'garden-result'); state.running = false; state.paused = false; $('pause-overlay').classList.add('hidden'); clearTimeout(state.timer); cancelAnimationFrame(state.raf); document.body.classList.remove('space-mode', 'orchard-mode'); $('game-panel').classList.remove('space-game', 'catch-game'); $('space-hud').classList.add('hidden'); showScreen('home-screen'); document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.nav === 'home')); updateHome(); };
  const openSettings = () => { if (!$('settings-dialog').open) $('settings-dialog').showModal(); };
  const navigate = destination => {
    if (destination === 'settings') { openSettings(); return; }
    if (destination === 'vocabulary') { if (!state.selectedTopic) { state.selectedTopic = 'fruit'; state.vocabIndex = 1; } state.cardFlipped = false; renderFlashcard(); showScreen('vocab-screen'); }
    else { showScreen('home-screen'); if (destination === 'games') { if (state.selectedTopic) $('wordland-games').classList.remove('hidden'); else $('topic-board').classList.add('attention-pulse'); } else if (destination === 'achievements') $('word-progress').classList.add('attention-pulse'); window.setTimeout(() => document.querySelectorAll('.attention-pulse').forEach(item => item.classList.remove('attention-pulse')), 1200); }
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.nav === destination));
  };
  const togglePause = () => {
    if (state.paused) { state.paused = false; $('pause-overlay').classList.add('hidden'); $('game-pause').textContent = 'Ⅱ'; $('space-pause').textContent = 'Ⅱ'; startLoop(); if (state.mode === 'type') $('word-input').focus(); }
    else if (state.running) { state.running = false; state.paused = true; cancelAnimationFrame(state.raf); $('pause-overlay').classList.remove('hidden'); $('game-pause').textContent = '▶'; $('space-pause').textContent = '▶'; }
  };
  document.querySelectorAll('[data-nav]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.nav)));
  document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    state.selectedTopic = button.dataset.topic;
    $('topic-board').classList.add('has-selection'); document.body.classList.add('topic-selected');
    state.vocabIndex = 0; state.cardFlipped = false; renderFlashcard(); updateHome();
    document.querySelectorAll('[data-topic]').forEach(topic => { const selected = topic === button; topic.setAttribute('aria-pressed', String(selected)); topic.classList.toggle('topic-active', selected); });
    $('wordland-games').classList.remove('hidden');
  }));
  const finishTopicBoardOpen = () => {
    const board = $('topic-board');
    if (board.classList.contains('closed')) return;
    $('topic-open').classList.add('hidden'); $('topic-close').focus();
  };
  $('topic-board').addEventListener('transitionend', event => {
    if (event.target === $('topic-board') && event.propertyName === 'transform') finishTopicBoardOpen();
  });
  $('topic-close').addEventListener('click', () => {
    $('topic-board').classList.add('closed'); $('topic-board').inert = true;
    $('topic-close').setAttribute('aria-expanded', 'false'); $('topic-open').setAttribute('aria-expanded', 'false'); $('topic-open').classList.remove('hidden');
    $('topic-open').focus();
  });
  $('topic-open').addEventListener('click', () => {
    $('topic-board').classList.remove('closed'); $('topic-board').inert = false;
    $('topic-close').setAttribute('aria-expanded', 'true'); $('topic-open').setAttribute('aria-expanded', 'true');
    window.setTimeout(finishTopicBoardOpen, 300);
  });
  $('flashcard').addEventListener('click', event => { if (!event.target.closest('button')) flipFlashcard(); });
  $('flashcard').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flipFlashcard(); } });
  const speakCurrentVocab = event => { event?.stopPropagation(); speak(activeWords()[state.vocabIndex].word); };
  $('vocab-speak').addEventListener('click', speakCurrentVocab);
  $('vocab-example-speak').addEventListener('click', event => { event.stopPropagation(); const word = activeWords()[state.vocabIndex].word; speak(`This is ${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}.`); });
  document.querySelectorAll('[data-vocab-topic]').forEach(button => button.addEventListener('click', () => { state.selectedTopic = button.dataset.vocabTopic; state.vocabIndex = 0; state.cardFlipped = false; renderFlashcard(); updateHome(); }));
  $('prompt-speak').addEventListener('click', () => { if (state.current) speak(state.current.word); });
  $('vocab-prev').addEventListener('click', () => { state.vocabIndex = (state.vocabIndex - 1 + activeWords().length) % activeWords().length; state.cardFlipped = false; renderFlashcard(); });
  $('vocab-next').addEventListener('click', () => nextFlashcard(false));
  $('vocab-again').addEventListener('click', () => nextFlashcard(false));
  $('vocab-known').addEventListener('click', () => nextFlashcard(true));
  $('close-settings').addEventListener('click', () => $('settings-dialog').close());
  $('settings-dialog').addEventListener('click', event => { if (event.target === $('settings-dialog')) $('settings-dialog').close(); });
  $('settings-sound').addEventListener('click', () => toggleSound());
  $('game-pause').addEventListener('click', togglePause); $('space-pause').addEventListener('click', togglePause); $('resume-game').addEventListener('click', togglePause);
  document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => startGame(button.dataset.start)));
  $('back-home').addEventListener('click', backHome); $('result-home').addEventListener('click', backHome); $('space-exit').addEventListener('click', backHome);
  $('play-again').addEventListener('click', () => startGame(state.mode)); $('space-result-replay').addEventListener('click', () => startGame(state.mode)); $('space-result-home').addEventListener('click', backHome); $('garden-result-replay').addEventListener('click', () => startGame(state.mode)); $('garden-result-home').addEventListener('click', backHome); $('skip-word').addEventListener('click', () => { if (!state.running) return; state.round++; setupRound(); if (state.round < state.order.length) startLoop(); else finishGame(); });
  $('move-left').addEventListener('pointerdown', () => movePlayer(-1)); $('move-right').addEventListener('pointerdown', () => movePlayer(1));
  $('playfield').addEventListener('pointerdown', event => { if (state.mode !== 'catch') return; $('playfield').setPointerCapture?.(event.pointerId); movePlayerToPointer(event); });
  $('playfield').addEventListener('pointermove', event => { if (state.mode === 'catch' && event.buttons) movePlayerToPointer(event); });
  $('word-input').addEventListener('input', handleTypingInput);
  document.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); movePlayer(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); movePlayer(1); } });
  const toggleSound = () => { state.sound = !state.sound; $('space-sound-icon').textContent = state.sound ? '🔊' : '🔇'; $('space-sound-toggle').setAttribute('aria-pressed', String(state.sound)); $('settings-sound-icon').textContent = state.sound ? '🔊' : '🔇'; $('settings-sound').setAttribute('aria-pressed', String(state.sound)); save(); if (state.mode === 'type' && state.running) $('word-input').focus(); };
  document.addEventListener('pointerdown', event => { if (state.mode === 'type' && state.running && !event.target.closest('button')) $('word-input').focus(); });
  $('space-sound-toggle').addEventListener('click', toggleSound);
  $('space-sound-icon').textContent = state.sound ? '🔊' : '🔇'; $('space-sound-toggle').setAttribute('aria-pressed', String(state.sound)); $('settings-sound-icon').textContent = state.sound ? '🔊' : '🔇'; $('settings-sound').setAttribute('aria-pressed', String(state.sound)); document.body.classList.add('home-mode'); renderFlashcard(); updateHome();
})();
