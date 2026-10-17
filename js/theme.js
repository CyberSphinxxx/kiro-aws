/**
 * TaskMaster - Theme System Module
 * Manages theme states (light, dark, system), OS media queries, and persistence.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TaskMaster = root.TaskMaster || {};
    root.TaskMaster.Theme = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const THEME_STORAGE_KEY = 'taskmaster_theme_pref';
  const VALID_THEMES = ['light', 'dark', 'system'];

  function resolveSystemTheme(isDarkMode) {
    return isDarkMode ? 'dark' : 'light';
  }

  function createThemeManager(options = {}) {
    const storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    const mediaQuery = options.mediaQuery !== undefined ? options.mediaQuery : (
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    );
    const documentElement = options.documentElement || (
      typeof document !== 'undefined' ? document.documentElement : null
    );

    let currentPreference = 'system';
    const listeners = new Set();

    function getEffectiveTheme(pref) {
      if (pref === 'system') {
        const isDark = mediaQuery ? Boolean(mediaQuery.matches) : true;
        return resolveSystemTheme(isDark);
      }
      return pref;
    }

    function apply(pref) {
      if (!VALID_THEMES.includes(pref)) {
        pref = 'system';
      }
      currentPreference = pref;

      if (storage) {
        try {
          storage.setItem(THEME_STORAGE_KEY, pref);
        } catch {
          // LocalStorage restricted or disabled
        }
      }

      const effective = getEffectiveTheme(pref);

      if (documentElement) {
        documentElement.setAttribute('data-theme', effective);
      }

      listeners.forEach(fn => fn(pref, effective));
      return { preference: pref, effective };
    }

    function init() {
      let saved = 'system';
      if (storage) {
        try {
          const stored = storage.getItem(THEME_STORAGE_KEY);
          if (VALID_THEMES.includes(stored)) {
            saved = stored;
          }
        } catch {
          saved = 'system';
        }
      }

      // Listen for OS system theme changes
      if (mediaQuery) {
        const osChangeListener = () => {
          if (currentPreference === 'system') {
            apply('system');
          }
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', osChangeListener);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(osChangeListener);
        }
      }

      return apply(saved);
    }

    function subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }

    function getPreference() {
      return currentPreference;
    }

    return {
      init,
      apply,
      subscribe,
      getPreference,
      getEffectiveTheme,
      resolveSystemTheme
    };
  }

  return {
    THEME_STORAGE_KEY,
    VALID_THEMES,
    resolveSystemTheme,
    createThemeManager
  };
});
