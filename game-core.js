(function (root) {
  const words = [
    { word: 'cat', meaning: 'Mèo', emoji: '🐱' }, { word: 'dog', meaning: 'Chó', emoji: '🐶' },
    { word: 'pig', meaning: 'Heo', emoji: '🐷' }, { word: 'cow', meaning: 'Bò', emoji: '🐮' },
    { word: 'hen', meaning: 'Gà mái', emoji: '🐔' }, { word: 'fox', meaning: 'Cáo', emoji: '🦊' },
    { word: 'bat', meaning: 'Dơi', emoji: '🦇' }, { word: 'bee', meaning: 'Ong', emoji: '🐝' },
    { word: 'ant', meaning: 'Kiến', emoji: '🐜' }, { word: 'owl', meaning: 'Cú mèo', emoji: '🦉' },
    { word: 'duck', meaning: 'Vịt', emoji: '🦆' }, { word: 'frog', meaning: 'Ếch', emoji: '🐸' },
    { word: 'bear', meaning: 'Gấu', emoji: '🐻' }, { word: 'lion', meaning: 'Sư tử', emoji: '🦁' },
    { word: 'tiger', meaning: 'Hổ', emoji: '🐯' }, { word: 'zebra', meaning: 'Ngựa vằn', emoji: '🦓' },
    { word: 'panda', meaning: 'Gấu trúc', emoji: '🐼' }, { word: 'horse', meaning: 'Ngựa', emoji: '🐴' },
    { word: 'sheep', meaning: 'Cừu', emoji: '🐑' }, { word: 'rabbit', meaning: 'Thỏ', emoji: '🐰' }
  ];
  const topics = {
    animals: words,
    farm: [
      ['barn','Nhà kho','🏠'],['farmer','Nông dân','🧑‍🌾'],['tractor','Máy kéo','🚜'],['farm','Nông trại','🚜'],['field','Cánh đồng','🌾'],['fence','Hàng rào','🪵'],['hay','Cỏ khô','🌾'],['seed','Hạt giống','🌱'],['corn','Ngô','🌽'],['wheat','Lúa mì','🌾'],['tomato','Cà chua','🍅'],['potato','Khoai tây','🥔'],['carrot','Cà rốt','🥕'],['pumpkin','Bí ngô','🎃'],['apple','Quả táo','🍎'],['milk','Sữa','🥛'],['egg','Trứng','🥚'],['cheese','Phô mai','🧀'],['wheel','Bánh xe','⚙️'],['water','Nước','💧']
    ],
    family: [
      ['family','Gia đình','👨‍👩‍👧'],['mother','Mẹ','👩'],['father','Bố','👨'],['parent','Cha mẹ','👨‍👩‍👧'],['sister','Chị/em gái','👧'],['brother','Anh/em trai','👦'],['baby','Em bé','👶'],['sibling','Anh chị em','🧒'],['grandma','Bà','👵'],['grandpa','Ông','👴'],['grandparent','Ông bà','👴'],['aunt','Cô/dì','👩'],['uncle','Chú/bác','👨'],['cousin','Anh chị em họ','🧒'],['son','Con trai','👦'],['daughter','Con gái','👧'],['home','Nhà','🏠'],['hug','Cái ôm','🤗'],['love','Tình yêu','❤️'],['together','Cùng nhau','🫶']
    ],
    ocean: [
      ['ocean','Đại dương','🌊'],['whale','Cá voi','🐋'],['shark','Cá mập','🦈'],['dolphin','Cá heo','🐬'],['octopus','Bạch tuộc','🐙'],['crab','Cua','🦀'],['shrimp','Tôm','🦐'],['turtle','Rùa biển','🐢'],['seal','Hải cẩu','🦭'],['shell','Vỏ sò','🐚'],['coral','San hô','🪸'],['jellyfish','Sứa','🪼'],['seahorse','Cá ngựa','🐴'],['starfish','Sao biển','⭐'],['fish','Cá','🐟'],['wave','Sóng','🌊'],['island','Hòn đảo','🏝️'],['boat','Thuyền','🛶'],['submarine','Tàu ngầm','🚢'],['diver','Thợ lặn','🤿']
    ],
    fruit: [
      ['fruit','Trái cây','🍎'],['apple','Táo','🍎'],['banana','Chuối','🍌'],['orange','Cam','🍊'],['grape','Nho','🍇'],['pear','Lê','🍐'],['peach','Đào','🍑'],['mango','Xoài','🥭'],['lemon','Chanh vàng','🍋'],['cherry','Anh đào','🍒'],['strawberry','Dâu tây','🍓'],['watermelon','Dưa hấu','🍉'],['pineapple','Dứa','🍍'],['coconut','Dừa','🥥'],['kiwi','Kiwi','🥝'],['papaya','Đu đủ','🍈'],['plum','Mận','🫐'],['melon','Dưa lưới','🍈'],['lime','Chanh xanh','🍋'],['apricot','Mơ','🍑']
    ],
    objects: [
      ['backpack','Ba lô','🎒'],['book','Sách','📘'],['pencil','Bút chì','✏️'],['pen','Bút mực','🖊️'],['crayon','Bút sáp màu','🖍️'],['ruler','Thước kẻ','📏'],['eraser','Cục tẩy','🧽'],['chair','Ghế','🪑'],['table','Cái bàn','🪵'],['door','Cửa ra vào','🚪'],['window','Cửa sổ','🪟'],['clock','Đồng hồ','🕒'],['phone','Điện thoại','📱'],['cup','Cái cốc','🥤'],['plate','Cái đĩa','🍽️'],['spoon','Cái thìa','🥄'],['ball','Quả bóng','⚽'],['toy','Đồ chơi','🧸'],['lamp','Đèn','💡'],['box','Cái hộp','📦']
    ],
    space: [
      ['space','Không gian','🌌'],['rocket','Tên lửa','🚀'],['planet','Hành tinh','🪐'],['star','Ngôi sao','⭐'],['moon','Mặt trăng','🌙'],['sun','Mặt trời','☀️'],['earth','Trái đất','🌍'],['mars','Sao Hỏa','🔴'],['saturn','Sao Thổ','🪐'],['venus','Sao Kim','🟠'],['jupiter','Sao Mộc','🟤'],['comet','Sao chổi','☄️'],['asteroid','Tiểu hành tinh','☄️'],['galaxy','Thiên hà','🌌'],['orbit','Quỹ đạo','🛰️'],['astronaut','Phi hành gia','👩‍🚀'],['spacesuit','Bộ đồ vũ trụ','🧑‍🚀'],['spaceship','Tàu vũ trụ','🛸'],['telescope','Kính thiên văn','🔭'],['meteor','Sao băng','🌠']
    ],
    nature: [
      ['nature','Thiên nhiên','🌳'],['tree','Cây','🌳'],['flower','Bông hoa','🌼'],['leaf','Lá cây','🍃'],['grass','Cỏ','🌱'],['forest','Rừng','🌲'],['mountain','Núi','⛰️'],['river','Sông','🏞️'],['lake','Hồ','🏞️'],['waterfall','Thác nước','💦'],['rain','Mưa','🌧️'],['cloud','Đám mây','☁️'],['rainbow','Cầu vồng','🌈'],['wind','Gió','💨'],['sunshine','Ánh nắng','☀️'],['rock','Đá','🪨'],['soil','Đất','🟫'],['seed','Hạt giống','🌰'],['mushroom','Nấm','🍄'],['butterfly','Bướm','🦋']
    ]
  };
  for (const [topic, entries] of Object.entries(topics)) {
    if (topic !== 'animals') topics[topic] = entries.map(([word, meaning, emoji]) => ({ word, meaning, emoji }));
  }
  const getWords = topic => topics[topic] || words;
  const normalize = value => String(value || '').trim().toLowerCase();
  const matchesWord = (input, word) => normalize(input) === normalize(word);
  const isTypingPrefix = (input, word) => normalize(input).length > 0 && normalize(word).startsWith(normalize(input));
  const nextLetter = (word, collected) => String(word || '').charAt((collected || []).length).toUpperCase();
  const isWordComplete = (word, collected) => normalize(word) === (collected || []).join('').toLowerCase();
  const catchLetter = (word, collected, letter) => {
    const expected = nextLetter(word, collected);
    const correct = String(letter || '').toUpperCase() === expected;
    const nextCollected = correct ? [...(collected || []), expected] : [...(collected || [])];
    return { correct, expected, collected: nextCollected, complete: correct && isWordComplete(word, nextCollected) };
  };
  const scoreForWord = (base, speedBonus) => Math.max(0, Number(base) || 0) + Math.max(0, Number(speedBonus) || 0);
  const api = { words, topics, getWords, normalize, matchesWord, isTypingPrefix, nextLetter, isWordComplete, catchLetter, scoreForWord };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GameCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
