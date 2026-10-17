# TaskMaster • Production-Quality Spec-Driven To-Do App

TaskMaster is a fast, accessible, responsive, and persistent task management application built using pure modular vanilla web standards (HTML5, CSS3, ES6+ JavaScript) without heavy external dependencies or bundlers.

---

## 🌟 Core Features

- **Task Management**: Create tasks with validation (max 200 chars, trimmed), toggle completion status, delete tasks, and bulk clear completed items.
- **Accessible Interactions**: 
  - Accessible native checkbox pattern using `<input type="checkbox">` wrapped in semantic `<label>`.
  - Non-conflicting event delegation: clicking task text or checkbox toggles completion; delete button operates as an independent sibling control.
  - Visible keyboard focus rings (`:focus-visible`) meeting WCAG AA requirements.
  - Screen reader announcements via `aria-live="polite"` and accessible ARIA attributes.
- **Dedicated Theme System (`js/theme.js` & `css/themes.css`)**:
  - Light mode, Dark mode, and System (auto-detection via `prefers-color-scheme`).
  - Persistent preference in `localStorage`.
  - Dynamically responds to OS theme changes in real time.
- **Context-Aware Views**:
  - Filter by **All Tasks**, **Active**, and **Completed**.
  - Dynamic empty-state messaging tailored to each active view.
  - Non-disruptive feedback banner when a task is added while viewing Completed tasks, with quick navigation to Active tasks.
- **Resilient Persistence (`js/storage.js`)**:
  - Automatic synchronization with `localStorage` (`kiro_todos_v1`).
  - Graceful sanitization of corrupted or legacy data format.
- **Responsive Layout (`css/responsive.css`)**:
  - **Desktop (>1024px)**: Persistent sidebar navigation, 720px optimized line-length workspace.
  - **Tablet (641px - 1024px)**: Streamlined sidebar and comfortable padding.
  - **Mobile (<=640px)**: Compact mobile header with touch-friendly navigation tabs (>= 44px touch targets), tested across 320px–1920px viewports.
  - Zero horizontal overflow.
- **Reduced Motion Support**:
  - Respects `@media (prefers-reduced-motion: reduce)` by bypassing animations.

---

## 📁 Modular Project Structure

```text
kiro-aws/
├── css/
│   ├── tokens.css            # Base typography, radii, transitions, & touch targets
│   ├── themes.css            # Theme System tokens for Dark & Light modes
│   ├── base.css              # Reset, font smoothing, & .sr-only accessibility
│   ├── layout.css            # Shell, sidebar, workspace, & header structures
│   ├── components.css        # Form, todo item, checkbox, delete button, empty state
│   └── responsive.css        # Media queries (Tablet, Mobile, Ultra-narrow, Reduced motion)
├── js/
│   ├── storage.js            # Persistence, serialization, & error recovery
│   ├── theme.js              # Theme engine (Light, Dark, System OS queries)
│   ├── state.js              # Pure task state mutations & validation
│   ├── ui.js                 # DOM rendering, templates, escaping, & banner
│   └── app.js                # Application entry point & event orchestrator
├── test/
│   ├── state.test.js         # Pure state unit tests
│   ├── storage.test.js       # Persistence & sanitization tests
│   ├── theme.test.js         # Theme system unit tests
│   └── app.test.js           # Integration & regression tests
├── .kiro/
│   └── specs/
│       ├── requirements.md   # User stories & acceptance criteria
│       ├── design.md         # Technical architecture & design specifications
│       └── tasks.md          # Implementation checklist & milestones
├── index.html                # Semantic HTML layout loading modular scripts & styles
├── style.css                 # Clean CSS manifest importing css/*.css modules
├── app.js                    # Legacy facade re-exporting modular JS subsystems
├── package.json              # NPM scripts for development & testing
├── .editorconfig             # Code style & formatting rules
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

Watch mode for rapid development:
```bash
npm run test:watch
```

---

## 🧩 Module Responsibilities

The codebase follows strict single-responsibility separation of concerns:

- **`js/storage.js`**: Persistence layer. Manages `localStorage`, fallback defaults, and sanitizes corrupted records into safe, typed objects.
- **`js/theme.js`**: Theme engine. Controls active color mode (`light`, `dark`, `system`), monitors OS `prefers-color-scheme` changes, and dispatches change events to subscribers.
- **`js/state.js`**: Pure business logic. Contains validation, task creation, toggle, deletion, filtering, and stats calculations with 100% pure functions.
- **`js/ui.js`**: View and DOM rendering. Manages templates, HTML sanitization, badge counts, dynamic empty states, and banner notifications.
- **`js/app.js`**: Main orchestrator. Glues modules together, sets up delegated DOM event listeners, and synchronizes application lifecycle.
- **`css/`**: Segmented stylesheets ensuring no monolith file exceeds ~120 lines, fully modularized by concern.
