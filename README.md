# Spec it, Build it, Ship it: Kiro Demonstration

A lightweight, modern, and persistent To-Do application built using **Spec-Driven Development** with HTML5, CSS3, and Vanilla JavaScript.

---

## 🚀 Features

- **Add Tasks**: Quickly add tasks using text input and submit button or <kbd>Enter</kbd> key.
- **Toggle Completion**: Click any task to toggle its completed state with visual strikethrough and emerald checkmark.
- **Delete Tasks**: Remove tasks with the dedicated trash action.
- **LocalStorage Persistence**: All tasks and status changes automatically sync to browser `localStorage`.
- **Filters & Status**: Filter between All, Active, and Completed tasks with real-time remaining item counters.
- **Zero Dependencies**: Pure Vanilla Web stack (no frameworks, no build steps required).

---

## 📁 Project Structure

```text
kiro-aws/
├── .kiro/
│   └── specs/
│       ├── requirements.md   # User stories & acceptance criteria (Phase 1)
│       ├── design.md         # Technical architecture & data shapes (Phase 2)
│       └── tasks.md          # Ordered implementation checklist (Phase 3)
├── index.html                # Semantic HTML layout
├── style.css                 # Modern dark UI theme with micro-interactions
├── app.js                    # Core logic and localStorage management
└── README.md                 # Project documentation
```

---

## 💻 How to Run Locally

### Option 1: Direct Browser Launch
Simply double-click [`index.html`](index.html) or open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Live Server via Node.js
If you have `npx` installed:
```bash
npx serve .
```
Then navigate to `http://localhost:3000`.
