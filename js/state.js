/**
 * TaskMaster - State Module
 * Pure business logic for task data manipulation, validation, and filtering.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TaskMaster = root.TaskMaster || {};
    root.TaskMaster.State = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function validateText(text) {
    if (typeof text !== 'string') return { valid: false, error: 'Input must be a string.' };
    const trimmed = text.trim();
    if (trimmed.length === 0) return { valid: false, error: 'Task description cannot be empty.' };
    if (trimmed.length > 200) return { valid: false, error: 'Task description cannot exceed 200 characters.' };
    return { valid: true, text: trimmed };
  }

  function createTask(text) {
    const check = validateText(text);
    if (!check.valid) throw new Error(check.error);

    return {
      id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      text: check.text,
      completed: false,
      createdAt: Date.now()
    };
  }

  function toggleTask(todos, id) {
    return todos.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
  }

  function deleteTask(todos, id) {
    return todos.filter(item => item.id !== id);
  }

  function clearCompletedTasks(todos) {
    return todos.filter(item => !item.completed);
  }

  function filterTasks(todos, filter) {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      case 'all':
      default:
        return todos;
    }
  }

  function getStats(todos) {
    const all = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = all - completed;
    return { all, active, completed };
  }

  return {
    validateText,
    createTask,
    toggleTask,
    deleteTask,
    clearCompletedTasks,
    filterTasks,
    getStats
  };
});
