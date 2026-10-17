# TaskMaster • Production-Quality Spec-Driven To-Do App

TaskMaster is a fast, accessible, responsive, and persistent task management application built using pure vanilla web standards (HTML5, CSS3, ES6+ JavaScript) without heavy external dependencies.

---

## 🌟 Core Features

- **Task Management**: Create tasks with validation (max 200 chars, trimmed), toggle completion status, delete tasks, and bulk clear completed items.
- **Accessible Interactions**: 
  - Accessible native checkbox pattern using `<input type="checkbox">` wrapped in semantic `<label>`.
  - Non-conflicting event delegation: clicking task text or checkbox toggles completion; delete button operates as an independent sibling control.
  - Visible keyboard focus rings (`:focus-visible`) meeting WCAG AA requirements.
  - Screen reader announcements via `aria-live="polite"` and accessible ARIA attributes.
- **Adaptive Theming**:
  - Light mode, Dark mode, and System (auto-detection via `prefers-color-scheme`).
  - Saved theme preference in `localStorage`.
  - Dynamically responds to OS theme changes.
- **Context-Aware Views**:
  - Filter by **All Tasks**, **Active**, and **Completed**.
  - Dynamic empty-state messaging tailored to each active view.
  - Non-disruptive feedback banner when a task is added while viewing Completed tasks, with quick navigation to Active tasks.
- **Resilient Persistence**:
  - Automatic synchronization with `localStorage` (`kiro_todos_v1`).
  - Graceful sanitization of corrupted or legacy data format.
- **Responsive Layout**:
  - **Desktop (>1024px)**: Persistent sidebar navigation, 720px optimized line-length workspace.
  - **Tablet (641px - 1024px)**: Streamlined sidebar and comfortable padding.
  - **Mobile (<=640px)**: Compact mobile header with brand and touch-friendly navigation tabs (>= 44px touch targets), tested across 320px–1920px viewports.
  - Zero horizontal overflow.
- **Reduced Motion Support**:
  - Respects `@media (prefers-reduced-motion: reduce)` by bypassing animations.

---

## 📁 Project Structure

```text
kiro-aws/
├── .kiro/
│   └── specs/
│       ├── requirements.md   # User stories & acceptance criteria
│       ├── design.md         # Technical architecture & design specifications
│       └── tasks.md          # Implementation checklist & milestones
├── test/
│   └── app.test.js           # Automated regression tests (Node test runner)
├── index.html                # Semantic HTML layout & accessibility tree
├── style.css                 # Design tokens, Light/Dark themes, responsive CSS
├── app.js                    # Modular Core logic & browser controller
├── package.json              # NPM scripts for development & testing
├── .editorconfig             # Consistent formatting configuration
└── README.md                 # Project documentation
```

---

## 🛠️ Development & Local Setup

### Direct Browser Launch (No server required)
Simply double-click [`index.html`](index.html) or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Development Server
Run using the included npm script:
```bash
npm start
```
This runs `npx serve -p 3000 .` and serves the app at `http://localhost:3000`.

---

## 🧪 Running Automated Tests

TaskMaster includes an automated test suite executed via Node.js's built-in test runner (`node:test` and `node:assert/strict`):

```bash
npm test
```

### What the test suite covers:
1. **Core Operations**: Task creation, unique ID generation, text validation, empty/whitespace rejection, 200-char limits, toggle operations, deletions, clear completed.
2. **Filtering & Statistics**: Partitioning by All, Active, Completed, accurate counts calculation, filter-specific empty state trigger conditions.
3. **Data Sanitization & Persistence**: Valid JSON deserialization, malformed JSON recovery, legacy format normalization, null/invalid item filtering.
4. **Theming Logic**: OS dark-mode preference resolution to theme tokens.
5. **Simulated Workflow**: End-to-end task lifecycle (add, complete, filter, delete, clear, persist, restore).

---

## 🧩 Module Responsibilities

The codebase follows a clean separation of concerns:

- **`index.html`**:
  - Provides semantic structure (`<aside>`, `<main>`, `<nav>`, `<header>`, `<ul>`, `<li>`).
  - Sets up the accessibility tree (`role="tablist"`, `role="tab"`, `role="radiogroup"`, `aria-live="polite"`).
  - Includes a visually-hidden `.sr-only` input label and alert containers.

- **`style.css`**:
  - **CSS Custom Properties**: Curated palette for `:root[data-theme="dark"]` and `:root[data-theme="light"]`.
  - **Layout & Typography**: Fluid layout, Inter font, optimal readability width, tabular numerals for counters.
  - **Responsive Breakpoints**: Breakpoints at 1024px, 640px, and 360px ensuring seamless behavior from 320px up to 1920px+.

- **`app.js`**:
  - **`Core`**: Pure, deterministic utility functions for state mutations (`validateText`, `createItem`, `toggleItem`, `deleteItem`, `clearCompleted`, `filterList`, `getCounts`, `sanitizeStorageData`, `resolveSystemTheme`). Completely decoupled from DOM for instant unit testing.
  - **`initApp`**: Browser controller handling DOM queries, theme listeners, event delegation, and reactive rendering.
  - **Universal Export**: Compatible with both direct browser execution and Node.js CommonJS test environments.

---

## 🎨 Theme Customization

Themes are controlled via CSS custom properties on the `<html>` element using the `data-theme` attribute:

```css
:root[data-theme="dark"] {
  --bg-app: #0e1116;
  --bg-sidebar: #131720;
  --text-primary: #e6edf3;
  --accent: #6366f1;
}

:root[data-theme="light"] {
  --bg-app: #f8fafc;
  --bg-sidebar: #ffffff;
  --text-primary: #0f172a;
  --accent: #4f46e5;
}
```

To add custom branding or tokens, modify the CSS variables in [`style.css`](style.css).

---

## 🚀 Future Extension Guidelines

If extending TaskMaster in the future:
1. **Adding Task Metadata** (e.g. Due Dates, Priority):
   - Update `Core.createItem` to accept optional `priority` or `dueDate`.
   - Update `Core.sanitizeStorageData` to validate the new properties while preserving backward compatibility.
2. **Search / Filter Query**:
   - Add a search input in the workspace header.
   - Extend `Core.filterList` with a `searchQuery` filter condition.
3. **Drag & Drop Reordering**:
   - Leverage native HTML5 Drag and Drop API (`draggable="true"` on `.todo-item`) and persist order indices.
