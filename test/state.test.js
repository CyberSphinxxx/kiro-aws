const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const State = require('../js/state.js');

describe('State Module - Pure Task Operations', () => {
  test('createTask generates valid task structure', () => {
    const task = State.createTask('Plan architecture refactoring');
    assert.equal(typeof task.id, 'string');
    assert.match(task.id, /^task_/);
    assert.equal(task.text, 'Plan architecture refactoring');
    assert.equal(task.completed, false);
    assert.equal(typeof task.createdAt, 'number');
  });

  test('validateText rejects invalid, empty, or oversized input', () => {
    assert.equal(State.validateText('').valid, false);
    assert.equal(State.validateText('   ').valid, false);
    assert.equal(State.validateText(123).valid, false);
    assert.equal(State.validateText('x'.repeat(201)).valid, false);
    
    const valid = State.validateText('  Valid input  ');
    assert.equal(valid.valid, true);
    assert.equal(valid.text, 'Valid input');
  });

  test('toggleTask toggles completion state immutably', () => {
    const list = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: false }
    ];

    const toggled = State.toggleTask(list, '1');
    assert.equal(toggled[0].completed, true);
    assert.equal(toggled[1].completed, false);
    assert.notEqual(list, toggled); // immutable
  });

  test('deleteTask removes target task immutably', () => {
    const list = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: false }
    ];

    const updated = State.deleteTask(list, '1');
    assert.equal(updated.length, 1);
    assert.equal(updated[0].id, '2');
  });

  test('clearCompletedTasks leaves only active items', () => {
    const list = [
      { id: '1', text: 'Active', completed: false },
      { id: '2', text: 'Done', completed: true }
    ];

    const result = State.clearCompletedTasks(list);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '1');
  });

  test('filterTasks correctly filters by all, active, completed', () => {
    const list = [
      { id: '1', text: 'A', completed: false },
      { id: '2', text: 'B', completed: true },
      { id: '3', text: 'C', completed: false }
    ];

    assert.equal(State.filterTasks(list, 'all').length, 3);
    assert.equal(State.filterTasks(list, 'active').length, 2);
    assert.equal(State.filterTasks(list, 'completed').length, 1);
  });

  test('getStats returns accurate counts', () => {
    const list = [
      { id: '1', text: 'A', completed: false },
      { id: '2', text: 'B', completed: true }
    ];

    assert.deepEqual(State.getStats(list), { all: 2, active: 1, completed: 1 });
  });
});
