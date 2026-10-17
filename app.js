/**
 * Task Master - Vanilla JavaScript To-Do App
 * Built following Kiro Spec-Driven Development
 */

(function () {
  'use strict';

  // Storage key constant
  const STORAGE_KEY = 'kiro_todos_v1';

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const statsCounter = document.getElementById('stats-counter');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Sidebar count badges
  const countAll = document.getElementById('count-all');
  const countActive = document.getElementById('count-active');
  const countCompleted = document.getElementById('count-completed');

  // Page header elements
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  // Filter display metadata for the page header
  const filterMeta = {
    all: { title: 'All Tasks', subtitle: 'Everything on your list.' },
    active: { title: 'Active', subtitle: 'Tasks that still need your attention.' },
    completed: { title: 'Completed', subtitle: 'Tasks you have finished.' }
  };

  // Application State
  let todos = [];
  let currentFilter = 'all';

  /**
   * Load todos from browser localStorage
   */
  function loadTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        todos = JSON.parse(data);
      } else {
        // Initial sample tasks if empty
        todos = [
          { id: '1', text: 'Welcome to your Kiro To-Do app!', completed: false, createdAt: Date.now() - 2000 },
          { id: '2', text: 'Click anywhere on a task to mark it complete', completed: true, createdAt: Date.now() - 1000 },
          { id: '3', text: 'Click the trash icon to delete a task', completed: false, createdAt: Date.now() }
        ];
        saveTodos();
      }
    } catch (err) {
      console.error('Error loading tasks from localStorage:', err);
      todos = [];
    }
  }

  /**
   * Persist current todos state to localStorage
   */
  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.error('Error saving tasks to localStorage:', err);
    }
  }

  /**
   * Escape HTML to prevent XSS injection
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Add a new todo item
   * @param {string} text - Task description
   */
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      completed: false,
      createdAt: Date.now()
    };

    todos.unshift(newTodo);
    saveTodos();
    render();

    // Reset input
    todoInput.value = '';
    todoInput.focus();
  }

  /**
   * Toggle completion state of a todo item
   * @param {string} id - Todo item identifier
   */
  function toggleTodo(id) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    saveTodos();
    render();
  }

  /**
   * Delete a todo item
   * @param {string} id - Todo item identifier
   * @param {HTMLElement} itemElement - The DOM element to animate before removal
   */
  function deleteTodo(id, itemElement) {
    if (itemElement) {
      itemElement.classList.add('removing');
      itemElement.addEventListener('animationend', () => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        render();
      }, { once: true });
    } else {
      todos = todos.filter(todo => todo.id !== id);
      saveTodos();
      render();
    }
  }

  /**
   * Clear all completed tasks
   */
  function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    render();
  }

  /**
   * Filter todos based on active filter
   */
  function getFilteredTodos() {
    switch (currentFilter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'all':
      default:
        return todos;
    }
  }

  /**
   * Render the UI based on current state
   */
  function render() {
    const filtered = getFilteredTodos();
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;

    // Update stats counter
    statsCounter.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;

    // Toggle clear completed button visibility
    clearCompletedBtn.style.display = completedCount > 0 ? 'inline-block' : 'none';

    // Update sidebar navigation counts
    if (countAll) countAll.textContent = todos.length;
    if (countActive) countActive.textContent = activeCount;
    if (countCompleted) countCompleted.textContent = completedCount;

    // Update page header title and subtitle for current filter
    if (pageTitle) pageTitle.textContent = filterMeta[currentFilter].title;
    if (pageSubtitle) pageSubtitle.textContent = filterMeta[currentFilter].subtitle;

    // Handle Empty State
    if (filtered.length === 0) {
      todoList.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // Render list items
    todoList.innerHTML = filtered.map(todo => {
      return `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" role="listitem" tabindex="0" aria-label="${escapeHtml(todo.text)}, ${todo.completed ? 'completed' : 'not completed'}">
          <div class="todo-checkbox" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <button type="button" class="delete-btn" aria-label="Delete task ${escapeHtml(todo.text)}" title="Delete task">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
            </svg>
          </button>
        </li>
      `;
    }).join('');
  }

  // --- Event Listeners ---

  // Handle Form Submission
  todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addTodo(todoInput.value);
  });

  // Handle Item Clicks (Delegation for complete toggle and deletion)
  todoList.addEventListener('click', function (e) {
    const deleteBtn = e.target.closest('.delete-btn');
    const todoItem = e.target.closest('.todo-item');

    if (!todoItem) return;

    const id = todoItem.dataset.id;

    if (deleteBtn) {
      e.stopPropagation();
      deleteTodo(id, todoItem);
    } else {
      toggleTodo(id);
    }
  });

  // Keyboard accessibility for list items (Space or Enter to toggle)
  todoList.addEventListener('keydown', function (e) {
    if (e.target.classList.contains('todo-item')) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const id = e.target.dataset.id;
        toggleTodo(id);
      }
    }
  });

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      currentFilter = this.dataset.filter;
      render();
    });
  });

  // Clear completed button
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Initial Boot
  loadTodos();
  render();
})();
