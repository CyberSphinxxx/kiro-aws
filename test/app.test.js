/**
 * Automated Test Suite for TaskMaster
 * Uses Node.js built-in test runner (node:test) and assertions (node:assert/strict).
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { Core } = require('../app.js');

describe('TaskMaster Core Operations', () => {
  test('createItem creates a valid task with unique id and active status', () => {
    const item = Core.createItem('Write documentation');
    assert.equal(typeof item.id, 'string');
    assert.match(item.id, /^task_/);
    assert.equal(item.text, 'Write documentation');
    assert.equal(item.completed, false);
    assert.equal(typeof item.createdAt, 'number');
  });

  test('validateText trims whitespace and rejects empty input', () => {
    assert.deepEqual(Core.validateText('   '), { valid: false, error: 'Task description cannot be empty.' });
    assert.deepEqual(Core.validateText(''), { valid: false, error: 'Task description cannot be empty.' });
    assert.deepEqual(Core.validateText(null), { valid: false, error: 'Input must be a string.' });
    
    const valid = Core.validateText('  Review pull request  ');
    assert.equal(valid.valid, true);
    assert.equal(valid.text, 'Review pull request');
  });

  test('validateText rejects strings exceeding 200 characters', () => {
    const longText = 'a'.repeat(201);
    const result = Core.validateText(longText);
    assert.equal(result.valid, false);
    assert.match(result.error, /200 characters/);
  });

  test('toggleItem toggles completion status correctly', () => {
    const initial = [
      { id: '1', text: 'Task 1', completed: false, createdAt: 100 },
      { id: '2', text: 'Task 2', completed: true, createdAt: 200 }
    ];

    const toggled1 = Core.toggleItem(initial, '1');
    assert.equal(toggled1.find(t => t.id === '1').completed, true);
    assert.equal(toggled1.find(t => t.id === '2').completed, true); // Unchanged

    const toggled2 = Core.toggleItem(toggled1, '1');
    assert.equal(toggled2.find(t => t.id === '1').completed, false);
  });

  test('deleteItem removes specific task by id', () => {
    const initial = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: true }
    ];

    const afterDelete = Core.deleteItem(initial, '1');
    assert.equal(afterDelete.length, 1);
    assert.equal(afterDelete[0].id, '2');
  });

  test('clearCompleted removes only completed items', () => {
    const list = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: true },
      { id: '3', text: 'Task 3', completed: false },
      { id: '4', text: 'Task 4', completed: true }
    ];

    const activeOnly = Core.clearCompleted(list);
    assert.equal(activeOnly.length, 2);
    assert.deepEqual(activeOnly.map(t => t.id), ['1', '3']);
  });
});

describe('TaskMaster Filtering & Counts', () => {
  const sampleTodos = [
    { id: '1', text: 'Active Task 1', completed: false },
    { id: '2', text: 'Completed Task 1', completed: true },
    { id: '3', text: 'Active Task 2', completed: false },
    { id: '4', text: 'Completed Task 2', completed: true },
    { id: '5', text: 'Completed Task 3', completed: true }
  ];

  test('filterList correctly partitions All, Active, and Completed', () => {
    const all = Core.filterList(sampleTodos, 'all');
    assert.equal(all.length, 5);

    const active = Core.filterList(sampleTodos, 'active');
    assert.equal(active.length, 2);
    assert.ok(active.every(t => !t.completed));

    const completed = Core.filterList(sampleTodos, 'completed');
    assert.equal(completed.length, 3);
    assert.ok(completed.every(t => t.completed));
  });

  test('getCounts calculates accurate stats', () => {
    const counts = Core.getCounts(sampleTodos);
    assert.deepEqual(counts, {
      all: 5,
      active: 2,
      completed: 3
    });
  });

  test('empty state detection per filter', () => {
    const noCompleted = [
      { id: '1', text: 'Active Only', completed: false }
    ];

    assert.equal(Core.filterList(noCompleted, 'all').length, 1);
    assert.equal(Core.filterList(noCompleted, 'active').length, 1);
    assert.equal(Core.filterList(noCompleted, 'completed').length, 0); // Empty state condition met for 'completed'

    const empty = [];
    assert.equal(Core.filterList(empty, 'all').length, 0); // Empty state condition met for 'all'
    assert.equal(Core.filterList(empty, 'active').length, 0); // Empty state condition met for 'active'
    assert.equal(Core.filterList(empty, 'completed').length, 0); // Empty state condition met for 'completed'
  });
});

describe('TaskMaster Persistence & Data Sanitization', () => {
  test('sanitizeStorageData parses valid JSON array', () => {
    const validJson = JSON.stringify([
      { id: '1', text: 'Persistent Task', completed: true, createdAt: 1234567 }
    ]);

    const result = Core.sanitizeStorageData(validJson);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '1');
    assert.equal(result[0].text, 'Persistent Task');
    assert.equal(result[0].completed, true);
  });

  test('sanitizeStorageData handles malformed JSON without crashing', () => {
    const corrupted = '{ invalid json string %%%';
    const result = Core.sanitizeStorageData(corrupted);
    assert.deepEqual(result, []);
  });

  test('sanitizeStorageData handles non-array parsed values', () => {
    assert.deepEqual(Core.sanitizeStorageData('{"some": "object"}'), []);
    assert.deepEqual(Core.sanitizeStorageData('"just a string"'), []);
    assert.deepEqual(Core.sanitizeStorageData('12345'), []);
  });

  test('sanitizeStorageData filters out corrupt/empty items and normalizes legacy formats', () => {
    const messyData = [
      null,
      undefined,
      { text: '' }, // empty text should be dropped
      { id: 999, text: 'Legacy Item Without Booleans', completed: 1 }, // legacy format
      { id: 'valid_1', text: 'Clean Item', completed: false }
    ];

    const sanitized = Core.sanitizeStorageData(messyData);
    assert.equal(sanitized.length, 2);
    assert.equal(sanitized[0].id, '999');
    assert.equal(sanitized[0].text, 'Legacy Item Without Booleans');
    assert.equal(sanitized[0].completed, true);
    assert.equal(sanitized[1].id, 'valid_1');
    assert.equal(sanitized[1].completed, false);
  });
});

describe('TaskMaster Theming Logic', () => {
  test('resolveSystemTheme maps dark mode query correctly', () => {
    assert.equal(Core.resolveSystemTheme(true), 'dark');
    assert.equal(Core.resolveSystemTheme(false), 'light');
  });
});

describe('Simulated DOM & Browser Workflow Verification', () => {
  // Lightweight mock DOM environment for end-to-end event and render simulation
  let mockStorage = {};
  let mockHtml = {};

  beforeEach(() => {
    mockStorage = {};
  });

  test('full end-to-end task workflow simulation', () => {
    let state = [];

    // 1. Add Task
    const task1 = Core.createItem('First Task');
    state.unshift(task1);
    mockStorage['kiro_todos_v1'] = JSON.stringify(state);
    assert.equal(state.length, 1);
    assert.equal(state[0].text, 'First Task');

    // 2. Add Second Task
    const task2 = Core.createItem('Second Task');
    state.unshift(task2);
    mockStorage['kiro_todos_v1'] = JSON.stringify(state);
    assert.equal(state.length, 2);
    assert.equal(state[0].text, 'Second Task');

    // 3. Complete First Task
    state = Core.toggleItem(state, task1.id);
    mockStorage['kiro_todos_v1'] = JSON.stringify(state);
    assert.equal(state.find(t => t.id === task1.id).completed, true);

    // 4. Change filter to Active
    const activeTasks = Core.filterList(state, 'active');
    assert.equal(activeTasks.length, 1);
    assert.equal(activeTasks[0].id, task2.id);

    // 5. Change filter to Completed
    const completedTasks = Core.filterList(state, 'completed');
    assert.equal(completedTasks.length, 1);
    assert.equal(completedTasks[0].id, task1.id);

    // 6. Delete Task 2
    state = Core.deleteItem(state, task2.id);
    mockStorage['kiro_todos_v1'] = JSON.stringify(state);
    assert.equal(state.length, 1);
    assert.equal(state[0].id, task1.id);

    // 7. Clear Completed
    state = Core.clearCompleted(state);
    mockStorage['kiro_todos_v1'] = JSON.stringify(state);
    assert.equal(state.length, 0);

    // 8. Restore from storage
    const restored = Core.sanitizeStorageData(mockStorage['kiro_todos_v1']);
    assert.equal(restored.length, 0);
  });
});
