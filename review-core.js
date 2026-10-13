(function (root) {
  const core = typeof module !== 'undefined' && module.exports ? require('./game-core.js') : root.GameCore;
  const keyFor = (topic, word) => `${topic || 'animals'}:${core.normalize(word)}`;
  const restore = saved => {
    const result = {};
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return result;
    for (const [key, value] of Object.entries(saved)) {
      const [topic, word] = key.split(':');
      if (!Object.hasOwn(core.topics, topic) || !core.getWords(topic).some(entry => entry.word === word) || !value || typeof value !== 'object') continue;
      result[key] = { mistakes: Math.max(1, Math.floor(Number(value.mistakes) || 1)), resolved: value.resolved === true };
    }
    return result;
  };
  const record = (saved, topic, word) => {
    const key = keyFor(topic, word);
    return { ...saved, [key]: { mistakes: (saved[key]?.mistakes || 0) + 1, resolved: false } };
  };
  const answer = (saved, topic, word, input) => {
    const key = keyFor(topic, word);
    if (!saved[key]) return saved;
    return core.matchesWord(input, word)
      ? { ...saved, [key]: { ...saved[key], resolved: true } }
      : record(saved, topic, word);
  };
  const entries = saved => Object.entries(saved).map(([key, progress]) => {
    const [topic, word] = key.split(':');
    return { ...core.getWords(topic).find(entry => entry.word === word), ...progress, topic, key };
  });
  const typingTarget = (items, previousInput) => {
    const candidates = items.filter(item => core.isTypingPrefix(previousInput, item.text));
    return candidates.length === 1 ? candidates[0].text : items.length === 1 ? items[0].text : null;
  };
  const api = { keyFor, restore, record, answer, entries, typingTarget };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ReviewCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
