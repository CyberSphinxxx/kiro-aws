/**
 * TaskMaster - Storage Module
 * Handles persistence, schema normalization, and resilient error recovery.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TaskMaster = root.TaskMaster || {};
    root.TaskMaster.Storage = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'kiro_todos_v1';

  /**
   * Normalize and sanitize stored task records.
   * Tolerates malformed JSON, legacy keys, and missing fields.
   */
  function sanitize(rawData) {
    if (!rawData) return null;
    try {
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(item => item && typeof item === 'object')
        .map((item, index) => ({
          id: String(item.id || 'task_legacy_' + index),
          text: String(item.text || '').trim(),
          completed: Boolean(item.completed),
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now()
        }))
        .filter(item => item.text.length > 0);
    } catch {
      // Gracefully fall back to empty list on corrupted data
      return [];
    }
  }

  function createStorage(backend = typeof localStorage !== 'undefined' ? localStorage : null) {
    return {
      load(defaultTasks = []) {
        if (!backend) return [...defaultTasks];
        try {
          const raw = backend.getItem(STORAGE_KEY);
          if (raw !== null) {
            return sanitize(raw);
          }
          if (defaultTasks.length > 0) {
            this.save(defaultTasks);
          }
          return [...defaultTasks];
        } catch (err) {
          console.warn('Storage read warning:', err);
          return [...defaultTasks];
        }
      },

      save(todos) {
        if (!backend) return;
        try {
          backend.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (err) {
          console.error('Storage write error:', err);
        }
      },

      sanitize
    };
  }

  return {
    STORAGE_KEY,
    sanitize,
    createStorage
  };
});
