const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Theme = require('../js/theme.js');

describe('Theme Module - Theme System Engine', () => {
  function createMockStorage() {
    let store = {};
    return {
      getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, val) { store[key] = String(val); }
    };
  }

  function createMockElement() {
    let attrs = {};
    return {
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return attrs[k] || null; }
    };
  }

  test('resolveSystemTheme maps dark mode query correctly', () => {
    assert.equal(Theme.resolveSystemTheme(true), 'dark');
    assert.equal(Theme.resolveSystemTheme(false), 'light');
  });

  test('apply theme updates document attribute and saves preference', () => {
    const storage = createMockStorage();
    const docElem = createMockElement();
    const mediaQuery = { matches: true }; // system is dark
    const mgr = Theme.createThemeManager({ storage, documentElement: docElem, mediaQuery });

    // Explicit light
    mgr.apply('light');
    assert.equal(mgr.getPreference(), 'light');
    assert.equal(docElem.getAttribute('data-theme'), 'light');
    assert.equal(storage.getItem(Theme.THEME_STORAGE_KEY), 'light');

    // Explicit dark
    mgr.apply('dark');
    assert.equal(mgr.getPreference(), 'dark');
    assert.equal(docElem.getAttribute('data-theme'), 'dark');

    // System mode (matches dark)
    mgr.apply('system');
    assert.equal(mgr.getPreference(), 'system');
    assert.equal(docElem.getAttribute('data-theme'), 'dark');
  });

  test('subscribe fires when theme preference changes', () => {
    const storage = createMockStorage();
    const docElem = createMockElement();
    const mgr = Theme.createThemeManager({ storage, documentElement: docElem, mediaQuery: { matches: false } });

    let notifiedPref = null;
    let notifiedEff = null;
    const unsubscribe = mgr.subscribe((pref, eff) => {
      notifiedPref = pref;
      notifiedEff = eff;
    });

    mgr.apply('dark');
    assert.equal(notifiedPref, 'dark');
    assert.equal(notifiedEff, 'dark');

    mgr.apply('system');
    assert.equal(notifiedPref, 'system');
    assert.equal(notifiedEff, 'light'); // matches: false -> light

    unsubscribe();
    mgr.apply('light');
    // Notification shouldn't change after unsubscribe
    assert.equal(notifiedPref, 'system');
  });
});
