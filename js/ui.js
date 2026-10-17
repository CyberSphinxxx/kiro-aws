/**
 * TaskMaster - UI & DOM View Module
 * Renders templates, updates badges, and handles dynamic empty states.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TaskMaster = root.TaskMaster || {};
    root.TaskMaster.UI = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FILTER_META = {
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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createRenderer(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc) return { FILTER_META, escapeHtml };

    const elements = {
      todoForm: doc.getElementById('todo-form'),
      todoInput: doc.getElementById('todo-input'),
      formError: doc.getElementById('form-error'),
      todoList: doc.getElementById('todo-list'),
      emptyState: doc.getElementById('empty-state'),
      emptyTitle: doc.getElementById('empty-title'),
      emptyDesc: doc.getElementById('empty-desc'),
      statsCounter: doc.getElementById('stats-counter'),
      filterButtons: doc.querySelectorAll('.filter-btn'),
      clearCompletedBtn: doc.getElementById('clear-completed-btn'),
      countAll: doc.getElementById('count-all'),
      countActive: doc.getElementById('count-active'),
      countCompleted: doc.getElementById('count-completed'),
      pageTitle: doc.getElementById('page-title'),
      pageSubtitle: doc.getElementById('page-subtitle'),
      filterHint: doc.getElementById('filter-hint'),
      hintActionBtn: doc.getElementById('hint-action-btn'),
      themeButtons: doc.querySelectorAll('.theme-btn')
    };

    let hintTimer = null;

    function renderList(filteredTodos) {
      if (filteredTodos.length === 0) {
        elements.todoList.innerHTML = '';
        return;
      }

      elements.todoList.innerHTML = filteredTodos.map(todo => {
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

    function updateView(state, filter) {
      const meta = FILTER_META[filter] || FILTER_META.all;
      const stats = state.stats;
      const filtered = state.filtered;

      // Header labels
      if (elements.pageTitle) elements.pageTitle.textContent = meta.title;
      if (elements.pageSubtitle) elements.pageSubtitle.textContent = meta.subtitle;

      // Stats and badges
      if (elements.statsCounter) {
        elements.statsCounter.textContent = `${stats.active} ${stats.active === 1 ? 'item' : 'items'} left`;
      }
      if (elements.countAll) elements.countAll.textContent = stats.all;
      if (elements.countActive) elements.countActive.textContent = stats.active;
      if (elements.countCompleted) elements.countCompleted.textContent = stats.completed;

      // Clear Completed Button visibility
      if (elements.clearCompletedBtn) {
        elements.clearCompletedBtn.style.display = stats.completed > 0 ? 'inline-block' : 'none';
      }

      // Filter Tabs selection state
      elements.filterButtons.forEach(btn => {
        const isCurrent = btn.dataset.filter === filter;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      // Empty State vs List
      if (filtered.length === 0) {
        elements.todoList.innerHTML = '';
        if (elements.emptyTitle) elements.emptyTitle.textContent = meta.emptyTitle;
        if (elements.emptyDesc) elements.emptyDesc.textContent = meta.emptyDesc;
        elements.emptyState.hidden = false;
      } else {
        elements.emptyState.hidden = true;
        renderList(filtered);
      }
    }

    function showFilterHint() {
      if (!elements.filterHint) return;
      if (hintTimer) clearTimeout(hintTimer);
      elements.filterHint.hidden = false;
      hintTimer = setTimeout(() => {
        elements.filterHint.hidden = true;
      }, 7000);
    }

    function hideFilterHint() {
      if (!elements.filterHint) return;
      if (hintTimer) clearTimeout(hintTimer);
      elements.filterHint.hidden = true;
    }

    function setFormError(msg) {
      if (!elements.formError) return;
      if (msg) {
        elements.formError.textContent = msg;
        elements.formError.hidden = false;
      } else {
        elements.formError.hidden = true;
        elements.formError.textContent = '';
      }
    }

    function syncThemeButtons(preference) {
      elements.themeButtons.forEach(btn => {
        const isSelected = btn.dataset.themeVal === preference;
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });
    }

    return {
      elements,
      updateView,
      showFilterHint,
      hideFilterHint,
      setFormError,
      syncThemeButtons,
      FILTER_META,
      escapeHtml
    };
  }

  return {
    FILTER_META,
    escapeHtml,
    createRenderer
  };
});
