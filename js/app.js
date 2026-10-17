/**
 * TaskMaster - Application Entry & Orchestrator
 * Connects Storage, Theme, State, and UI modules with event listeners.
 */

(function (root) {
  'use strict';

  const TaskMaster = root.TaskMaster || {};
  const Storage = TaskMaster.Storage;
  const Theme = TaskMaster.Theme;
  const State = TaskMaster.State;
  const UI = TaskMaster.UI;

  function init() {
    if (typeof document === 'undefined') return;

    // Default sample tasks for initial onboarding
    const defaultTasks = [
      { id: '1', text: 'Welcome to your modular TaskMaster app', completed: false, createdAt: Date.now() - 2000 },
      { id: '2', text: 'Check tasks complete or click their text', completed: true, createdAt: Date.now() - 1000 },
      { id: '3', text: 'Try switching between Light and Dark themes', completed: false, createdAt: Date.now() }
    ];

    // Initialize Subsystems
    const storage = Storage.createStorage();
    const themeManager = Theme.createThemeManager();
    const ui = UI.createRenderer(document);

    // Application State
    let todos = storage.load(defaultTasks);
    let currentFilter = 'all';

    function refresh() {
      const stats = State.getStats(todos);
      const filtered = State.filterTasks(todos, currentFilter);
      ui.updateView({ todos, filtered, stats }, currentFilter);
    }

    function setFilter(filter) {
      currentFilter = filter;
      ui.hideFilterHint();
      refresh();
    }

    function handleAddTask(text) {
      const validation = State.validateText(text);
      if (!validation.valid) {
        ui.setFormError(validation.error);
        ui.elements.todoInput.focus();
        return;
      }

      ui.setFormError('');
      const newTask = State.createTask(validation.text);
      todos.unshift(newTask);
      storage.save(todos);
      refresh();

      ui.elements.todoInput.value = '';
      ui.elements.todoInput.focus();

      if (currentFilter === 'completed') {
        ui.showFilterHint();
      }
    }

    function handleToggleTask(id) {
      todos = State.toggleTask(todos, id);
      storage.save(todos);
      refresh();
    }

    function handleDeleteTask(id, rowElement) {
      if (rowElement) {
        rowElement.classList.add('removing');
        rowElement.addEventListener('animationend', () => {
          todos = State.deleteTask(todos, id);
          storage.save(todos);
          refresh();
        }, { once: true });
      } else {
        todos = State.deleteTask(todos, id);
        storage.save(todos);
        refresh();
      }
    }

    function handleClearCompleted() {
      todos = State.clearCompletedTasks(todos);
      storage.save(todos);
      refresh();
    }

    // --- Wire Events ---

    // Form Submit
    if (ui.elements.todoForm) {
      ui.elements.todoForm.addEventListener('submit', e => {
        e.preventDefault();
        handleAddTask(ui.elements.todoInput.value);
      });
    }

    // Form Input typing clears error
    if (ui.elements.todoInput) {
      ui.elements.todoInput.addEventListener('input', () => {
        ui.setFormError('');
      });
    }

    // Checkbox toggling delegation
    if (ui.elements.todoList) {
      ui.elements.todoList.addEventListener('change', e => {
        if (e.target.classList.contains('todo-checkbox-input')) {
          const item = e.target.closest('.todo-item');
          if (item) handleToggleTask(item.dataset.id);
        }
      });

      // Delete button delegation
      ui.elements.todoList.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
          e.stopPropagation();
          const id = deleteBtn.dataset.deleteId;
          const item = deleteBtn.closest('.todo-item');
          handleDeleteTask(id, item);
        }
      });
    }

    // Filter Buttons
    ui.elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
      });
    });

    // Clear Completed Button
    if (ui.elements.clearCompletedBtn) {
      ui.elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);
    }

    // Filter Hint Action Button ("Switch to Active")
    if (ui.elements.hintActionBtn) {
      ui.elements.hintActionBtn.addEventListener('click', () => {
        setFilter('active');
      });
    }

    // Theme Switcher Buttons
    ui.elements.themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        themeManager.apply(btn.dataset.themeVal);
      });
    });

    // Theme state subscriber
    themeManager.subscribe(pref => {
      ui.syncThemeButtons(pref);
    });

    // Theme bootstrap
    const themeState = themeManager.init();
    ui.syncThemeButtons(themeState.preference);

    // Initial render
    refresh();

    return {
      storage,
      themeManager,
      ui,
      getTodos: () => todos,
      setFilter
    };
  }

  // Auto-boot in browser
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  TaskMaster.init = init;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
