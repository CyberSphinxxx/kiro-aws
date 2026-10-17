/**
 * TaskMaster - Legacy / Monolithic compatibility facade
 * Re-exports the modular architecture for external tooling and backwards compatibility.
 */

const Storage = require('./js/storage.js');
const Theme = require('./js/theme.js');
const State = require('./js/state.js');
const UI = require('./js/ui.js');
const App = require('./js/app.js');

module.exports = {
  Storage,
  Theme,
  State,
  UI,
  App,
  // Direct compatibility mapping for previous tests
  Core: {
    validateText: State.validateText,
    createItem: State.createTask,
    toggleItem: State.toggleTask,
    deleteItem: State.deleteTask,
    clearCompleted: State.clearCompletedTasks,
    filterList: State.filterTasks,
    getCounts: State.getStats,
    sanitizeStorageData: Storage.sanitize,
    resolveSystemTheme: Theme.resolveSystemTheme
  }
};
