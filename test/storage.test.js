const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Storage = require('../js/storage.js');

describe('Storage Module - Resilience and Persistence', () => {
  function createMockBackend() {
    let store = {};
    return {
      getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, val) { store[key] = String(val); },
      clear() { store = {}; }
    };
  }

  test('sanitize handles null, non-array, and corrupted JSON', () => {
    assert.deepEqual(Storage.sanitize(null), null);
    assert.deepEqual(Storage.sanitize('not valid json {['), []);
    assert.deepEqual(Storage.sanitize('{"some":"object"}'), []);
    assert.deepEqual(Storage.sanitize('42'), []);
  });

  test('sanitize cleans corrupted array items and preserves valid ones', () => {
    const raw = [
      null,
      undefined,
      { text: '' }, // empty text dropped
      { id: '10', text: 'Valid task', completed: true },
      { id: 20, text: 'Number id task', completed: 0 } // normalized
    ];

    const sanitized = Storage.sanitize(raw);
    assert.equal(sanitized.length, 2);
    assert.equal(sanitized[0].id, '10');
    assert.equal(sanitized[0].text, 'Valid task');
    assert.equal(sanitized[0].completed, true);
    assert.equal(sanitized[1].id, '20');
    assert.equal(sanitized[1].completed, false);
  });

  test('load and save with mock backend', () => {
    const mock = createMockBackend();
    const storage = Storage.createStorage(mock);

    const initial = storage.load([{ id: 'default', text: 'Default', completed: false }]);
    assert.equal(initial.length, 1);
    assert.equal(initial[0].id, 'default');

    storage.save([{ id: 'saved_1', text: 'Saved task', completed: true }]);
    const reloaded = storage.load();
    assert.equal(reloaded.length, 1);
    assert.equal(reloaded[0].text, 'Saved task');
    assert.equal(reloaded[0].completed, true);
  });
});
