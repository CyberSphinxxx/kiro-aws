# Technical Design Document: Simple To-Do List Application

## 1. System Architecture
The application is a client-side Single Page Application (SPA) built purely with vanilla web standards:
- **`index.html`**: Semantic document structure, meta tags, and accessibility markup (`role="tablist"`, `role="radiogroup"`, `aria-live`).
- **`style.css`**: Design tokens for Light and Dark themes, responsive layout (Desktop persistent sidebar, mobile touch header), WCAG AA focus rings, and prefers-reduced-motion query.
- **`app.js`**: Decoupled architecture with a pure `Core` engine (unit-testable in Node.js) and a reactive browser DOM controller with `localStorage` persistence and theme synchronization.
- **`test/app.test.js`**: Built-in automated regression test suite using Node.js `node:test` and `node:assert/strict`.

---

## 2. Component Structure

```text
+-----------------------------------------------------------------------+
| .app-shell                                                            |
|                                                                       |
|  [ Aside: .sidebar ]                 [ Main: .workspace ]             |
|   +--------------------------+        +-----------------------------+ |
|   | Brand: TaskMaster        |        | Workspace Header            | |
|   | Nav: All, Active, Done   |        |   Page Title & Subtitle     | |
|   |                          |        |   Item Counter Badge        | |
|   | [ Theme Radio Controls ] |        | Form: Input + Add Button    | |
|   | (Light / Auto / Dark)    |        | Filter Hint Banner          | |
|   +--------------------------+        | List: <ul> .todo-list       | |
|                                       |   [ ] Task text       [ X ] | |
|                                       | Empty State (Context-Aware) | |
|                                       | Clear Completed Action      | |
|                                       +-----------------------------+ |
+-----------------------------------------------------------------------+
```

### HTML Elements & Accessibility Tree
- `.sidebar`: Persistent navigation on desktop (>1024px); adapts to compact touch header on mobile (<=640px).
- `.theme-switch-group`: Radiogroup toggling Light, System (OS preference), and Dark modes.
- `#todo-form`: Clean input form with visually hidden `<label>` (`.sr-only`) and dynamic validation feedback.
- `#todo-list`: Unordered list element (`<ul role="list">`) displaying items.
- `.todo-item`: Accessible row with an accessible `<input type="checkbox">` wrapped in `<label>`, and an independent delete `<button>`.
- `#filter-hint`: Non-disruptive feedback banner when tasks are added in Completed filter view.
- `#empty-state`: Context-aware empty state with dynamic headings for All, Active, and Completed filters.

---

## 3. Data Shapes

### `TodoItem` Object
```typescript
interface TodoItem {
  id: string;          // Unique identifier (timestamp-based or crypto.randomUUID)
  text: string;        // Task description string (sanitized)
  completed: boolean;  // Task completion status
  createdAt: number;   // Epoch timestamp for creation ordering
}
```

### Application State
```javascript
const state = {
  todos: [] // Array of TodoItem objects
};
```

---

## 4. Data Flow

1. **Add Flow**:
   User input -> `submit` event -> `addTodo(text)` -> Validate -> Append to `state.todos` -> `saveToLocalStorage()` -> `render()`.

2. **Toggle Completion Flow**:
   User clicks item / checkbox -> `click` event delegation -> Find ID -> Toggle `completed = !completed` -> `saveToLocalStorage()` -> `render()`.

3. **Delete Flow**:
   User clicks delete button -> Stop propagation -> Filter out ID from `state.todos` -> `saveToLocalStorage()` -> `render()`.

4. **Initial Hydration**:
   Page loads -> `DOMContentLoaded` -> `loadFromLocalStorage()` -> Parse JSON -> Populate `state.todos` -> `render()`.

---

## 5. Technical Decisions & Storage
- **Storage Key**: `'kiro_todo_list'`
- **Persistence Mechanism**: `window.localStorage.setItem()` and `window.localStorage.getItem()` wrapped in `try...catch` blocks for resilient quota and privacy mode handling.
- **Security**: Sanitize task text before rendering to prevent Cross-Site Scripting (XSS).
- **Styling**: Modern dark theme with CSS custom properties (`--bg-primary`, `--accent`, `--text-main`, etc.), Inter typography, and smooth CSS cubic-bezier transitions.
