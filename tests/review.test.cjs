const test = require('node:test');
const assert = require('node:assert/strict');
const review = require('../review-core.js');
test('mistakes are deduplicated, counted and separated by topic', () => {
  let saved = review.record({}, 'farm', 'apple');
  saved = review.record(saved, 'farm', 'apple');
  saved = review.record(saved, 'fruit', 'apple');
  assert.equal(review.entries(saved).length, 2);
  assert.equal(saved['farm:apple'].mistakes, 2);
  assert.equal(saved['fruit:apple'].mistakes, 1);
});
test('only a correct answer resolves a word; new mistakes reopen it', () => {
  let saved = review.record({}, 'animals', 'cat');
  saved = review.answer(saved, 'animals', 'cat', 'dog');
  assert.equal(saved['animals:cat'].resolved, false);
  saved = review.answer(saved, 'animals', 'cat', ' CAT ');
  assert.equal(saved['animals:cat'].resolved, true);
  assert.equal(saved['animals:cat'].mistakes, 2);
  saved = review.record(saved, 'animals', 'cat');
  assert.equal(saved['animals:cat'].resolved, false);
  assert.equal(saved['animals:cat'].mistakes, 3);
});
test('saved progress survives JSON round trip and rejects unknown words', () => {
  const saved = review.record({}, 'animals', 'cat');
  assert.deepEqual(review.restore(JSON.parse(JSON.stringify(saved))), saved);
  assert.deepEqual(review.restore(null), {});
  assert.deepEqual(review.restore({'fake:cat': {}, 'animals:unknown': {}, 'animals:cat': null}), {});
});
test('typing mistakes use the selected word without guessing between ambiguous targets', () => {
  const items = [{text:'cat'}, {text:'cow'}, {text:'dog'}];
  assert.equal(review.typingTarget(items, 'ca'), 'cat');
  assert.equal(review.typingTarget(items, 'c'), null);
  assert.equal(review.typingTarget(items, ''), null);
  assert.equal(review.typingTarget([{text:'dog'}], ''), 'dog');
});
