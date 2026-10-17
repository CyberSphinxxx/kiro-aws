# Technical Design Document: Simple To-Do List Application

## 1. System Architecture
The application is a client-side Single Page Application (SPA) built purely with vanilla web standards:
- **`index.html`**: Semantic document structure, meta tags, and accessibility markup.
- **`style.css`**: Design tokens (CSS custom properties), dark-mode-first aesthetic, glassmorphic card design, and micro-animations.
- **`app.js`**: Core state management, DOM event handling, and localStorage synchronization.

---

## 2. Component Structure

```text
+---------------------------------------------------+
|               .todo-app-container                 |
|                                                   |
|  [ Header: App Title, Subtitle & Badge ]          |
|                                                   |
|  [ Form: Input Field + "Add Task" Button ]        |
|                                                   |
|  [ Filters & Stats Bar: Count, Filter Tabs ]      |
|                                                   |
|  [ List: <ul> .todo-list ]                         |
|    +-------------------------------------------+  |
|    | [ ] Task text                       [ X ] |  |
|    | [/] Completed task text             [ X ] |  |
|    +-------------------------------------------+  |
|                                                   |
|  [ Empty State Placeholder (when no items) ]      |
+---------------------------------------------------+
```

### HTML Elements & Classes
- `#todo-form`: Container form element for input and submission.
- `#todo-input`: Accessible text input element with `maxlength="200"`.
- `#todo-list`: Unordered list element (`<ul role="list">`) displaying items.
- `.todo-item`: Individual task item wrapper containing:
  - `.todo-checkbox`: Custom toggle button or checkbox input.
  - `.todo-text`: The label containing the task description.
  - `.delete-btn`: Action button to delete the task.
- `#todo-stats`: Summary showing active items remaining.

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
