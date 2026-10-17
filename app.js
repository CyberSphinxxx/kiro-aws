/**
 * TaskMaster - Production-Quality To-Do Application
 * Refined architecture, accessible interactions, theming, and resilient persistence.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js test environment
    module.exports = factory();
  } else {
    // Browser environment
    root.TaskMaster = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'kiro_todos_v1';
  const THEME_STORAGE_KEY = 'taskmaster_theme_pref';

  // Filter display metadata
  const filterMeta = {
    all: {
      title: 'All Tasks',
      subtitle: 'Everything on your list.',
      emptyTitle: 'No tasks yet.',
      emptyDesc: 'Add your first task to get started.'
    },
    active: {
      title: 'Active',
      subtitle: 'Tasks that still need your attention.',
      emptyTitle: "You're all caught up.",
      emptyDesc: 'No active tasks remaining.'
    },
    completed: {
      title: 'Completed',
      subtitle: 'Tasks you have finished.',
      emptyTitle: 'No completed tasks yet.',
      emptyDesc: 'Tasks you finish will appear here.'
    }
  };

  /**
   * Pure Core Logic Helpers (Unit Testable)
   */
  const Core = {
    validateText(text) {
      if (typeof text !== 'string') return { valid: false, error: 'Input must be a string.' };
      const trimmed = text.trim();
      if (trimmed.length === 0) return { valid: false, error: 'Task description cannot be empty.' };
      if (trimmed.length > 200) return { valid: false, error: 'Task description cannot exceed 200 characters.' };
      return { valid: true, text: trimmed };
    },

    createItem(text) {
      const validation = this.validateText(text);
      if (!validation.valid) throw new Error(validation.error);
      return {
        id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        text: validation.text,
        completed: false,
        createdAt: Date.now()
      };
    },

    toggleItem(todos, id) {
      return todos.map(item => {
        if (item.id === id) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
    },

    deleteItem(todos, id) {
      return todos.filter(item => item.id !== id);
    },

    clearCompleted(todos) {
      return todos.filter(item => !item.completed);
    },

    filterList(todos, filter) {
      switch (filter) {
        case 'active':
          return todos.filter(t => !t.completed);
        case 'completed':
          return todos.filter(t => t.completed);
        case 'all':
        default:
          return todos;
      }
    },

    getCounts(todos) {
      const all = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const active = all - completed;
      return { all, active, completed };
    },

    sanitizeStorageData(rawData) {
      if (!rawData) return null;
      try {
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        if (!Array.isArray(parsed)) return [];
        // Preserve and normalize valid task objects
        return parsed
          .filter(item => item && typeof item === 'object')
          .map((item, idx) => ({
            id: String(item.id || 'task_legacy_' + idx),
            text: String(item.text || '').trim(),
            completed: Boolean(item.completed),
            createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now()
          }))
          .filter(item => item.text.length > 0);
      } catch (err) {
        console.warn('Failed to parse stored tasks, resetting gracefully:', err);
        return [];
      }
    },

    resolveSystemTheme(isDarkMode) {
      return isDarkMode ? 'dark' : 'light';
    }
  };

  /**
   * Browser Controller
   */
  function initApp() {
    // Check if running in browser with DOM
    if (typeof document === 'undefined') return Core;

    // DOM References
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const formError = document.getElementById('form-error');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const emptyTitle = document.getElementById('empty-title');
    const emptyDesc = document.getElementById('empty-desc');
    const statsCounter = document.getElementById('stats-counter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const countAll = document.getElementById('count-all');
    const countActive = document.getElementById('count-active');
    const countCompleted = document.getElementById('count-completed');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const filterHint = document.getElementById('filter-hint');
    const hintActionBtn = document.getElementById('hint-action-btn');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // State
    let todos = [];
    let currentFilter = 'all';
    let currentThemePref = 'system'; // 'light' | 'dark' | 'system'
    let hintTimeoutId = null;

    // --- Theme Management ---
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function applyTheme(pref) {
      currentThemePref = pref;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } catch (e) {
        // LocalStorage might be disabled or restricted
      }

      let effectiveTheme = pref;
      if (pref === 'system') {
        const isDark = mediaQuery ? mediaQuery.matches : true;
        effectiveTheme = Core.resolveSystemTheme(isDark);
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme);

      // Update theme toggle buttons UI
      themeButtons.forEach(btn => {
        const isSelected = btn.dataset.themeVal === pref;
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });
    }

    function initTheme() {
      let savedPref = 'system';
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          savedPref = stored;
        }
      } catch (e) {
        savedPref = 'system';
      }

      applyTheme(savedPref);

      // Listen for OS changes
      if (mediaQuery) {
        const listener = () => {
          if (currentThemePref === 'system') {
            applyTheme('system');
          }
        };
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', listener);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(listener);
        }
      }

      // Theme button click events
      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          applyTheme(btn.dataset.themeVal);
        });
      });
    }

    // --- Data Persistence ---
    function loadTodos() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          todos = Core.sanitizeStorageData(raw);
        } else {
          // Default initial onboarding tasks
          todos = [
            { id: '1', text: 'Welcome to your refined TaskMaster app', completed: false, createdAt: Date.now() - 2000 },
            { id: '2', text: 'Check tasks complete or click their text', completed: true, createdAt: Date.now() - 1000 },
            { id: '3', text: 'Try switching between Light and Dark themes', completed: false, createdAt: Date.now() }
          ];
          saveTodos();
        }
      } catch (err) {
        console.error('Error reading localStorage:', err);
        todos = [];
      }
    }

    function saveTodos() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (err) {
        console.error('Error writing to localStorage:', err);
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // --- Core Operations ---
    function addTodo(text) {
      const validation = Core.validateText(text);
      if (!validation.valid) {
        if (formError) {
          formError.textContent = validation.error;
          formError.hidden = false;
        }
        todoInput.focus();
        return;
      }

      if (formError) {
        formError.hidden = true;
        formError.textContent = '';
      }

      const newItem = Core.createItem(validation.text);
      todos.unshift(newItem);
      saveTodos();
      render();

      todoInput.value = '';
      todoInput.focus();

      // If user added a task while in "completed" filter view, show helpful feedback
      if (currentFilter === 'completed') {
        showFilterHint();
      }
    }

    function showFilterHint() {
      if (!filterHint) return;
      if (hintTimeoutId) clearTimeout(hintTimeoutId);
      filterHint.hidden = false;
      hintTimeoutId = setTimeout(() => {
        filterHint.hidden = true;
      }, 7000);
    }

    function hideFilterHint() {
      if (!filterHint) return;
      if (hintTimeoutId) clearTimeout(hintTimeoutId);
      filterHint.hidden = true;
    }

    function toggleTodo(id) {
      todos = Core.toggleItem(todos, id);
      saveTodos();
      render();
    }

    function deleteTodo(id, rowElement) {
      if (rowElement) {
        rowElement.classList.add('removing');
        rowElement.addEventListener('animationend', () => {
          todos = Core.deleteItem(todos, id);
          saveTodos();
          render();
        }, { once: true });
      } else {
        todos = Core.deleteItem(todos, id);
        saveTodos();
        render();
      }
    }

    function clearCompleted() {
      todos = Core.clearCompleted(todos);
      saveTodos();
      render();
    }

    function setFilter(filter) {
      if (!filterMeta[filter]) return;
      currentFilter = filter;
      hideFilterHint();

      filterButtons.forEach(btn => {
        const isCurrent = btn.dataset.filter === filter;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      render();
    }

    // --- Rendering ---
    function render() {
      const filtered = Core.filterList(todos, currentFilter);
      const counts = Core.getCounts(todos);

      // Update sidebar counts
      if (countAll) countAll.textContent = counts.all;
      if (countActive) countActive.textContent = counts.active;
      if (countCompleted) countCompleted.textContent = counts.completed;

      // Update header
      if (pageTitle) pageTitle.textContent = filterMeta[currentFilter].title;
      if (pageSubtitle) pageSubtitle.textContent = filterMeta[currentFilter].subtitle;
      if (statsCounter) {
        statsCounter.textContent = `${counts.active} ${counts.active === 1 ? 'item' : 'items'} left`;
      }

      // Update Clear Completed button visibility
      if (clearCompletedBtn) {
        clearCompletedBtn.style.display = counts.completed > 0 ? 'inline-block' : 'none';
      }

      // Empty State check
      if (filtered.length === 0) {
        todoList.innerHTML = '';
        if (emptyTitle) emptyTitle.textContent = filterMeta[currentFilter].emptyTitle;
        if (emptyDesc) emptyDesc.textContent = filterMeta[currentFilter].emptyDesc;
        emptyState.hidden = false;
        return;
      }

      emptyState.hidden = true;

      // Render items with accessible structure
      todoList.innerHTML = filtered.map(todo => {
        const escaped = escapeHtml(todo.text);
        return `
          <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" role="listitem">
            <label class="todo-content" for="check-${todo.id}">
              <input
                type="checkbox"
                id="check-${todo.id}"
                class="todo-checkbox-input sr-only"
                ${todo.completed ? 'checked' : ''}
                aria-label="Mark task '${escaped}' as ${todo.completed ? 'incomplete' : 'complete'}"
              >
              <span class="todo-checkbox" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                  <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="todo-text">${escaped}</span>
            </label>
            <button
              type="button"
              class="delete-btn"
              data-delete-id="${todo.id}"
              aria-label="Delete task: ${escaped}"
              title="Delete task"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
              </svg>
            </button>
          </li>
        `;
      }).join('');
    }

    // --- Event Listeners ---

    // Form Submit
    todoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addTodo(todoInput.value);
    });

    // Clear form error when user begins typing
    todoInput.addEventListener('input', function () {
      if (formError && !formError.hidden) {
        formError.hidden = true;
        formError.textContent = '';
      }
    });

    // Delegated Change Event on Checkboxes
    todoList.addEventListener('change', function (e) {
      if (e.target.classList.contains('todo-checkbox-input')) {
        const item = e.target.closest('.todo-item');
        if (item) {
          toggleTodo(item.dataset.id);
        }
      }
    });

    // Delegated Click Event for Delete Button
    todoList.addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.dataset.deleteId;
        const item = deleteBtn.closest('.todo-item');
        deleteTodo(id, item);
      }
    });

    // Navigation Filter Buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        setFilter(this.dataset.filter);
      });
    });

    // Clear Completed Button
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Filter Hint Switch to Active Button
    if (hintActionBtn) {
      hintActionBtn.addEventListener('click', function () {
        setFilter('active');
      });
    }

    // Initialize
    initTheme();
    loadTodos();
    render();

    return {
      Core,
      getTodos: () => todos,
      setFilter,
      applyTheme
    };
  }

  // Auto-init in browser
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }

  return {
    Core,
    initApp
  };
});
