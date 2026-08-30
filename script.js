const STORAGE_KEY = "todo-app-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const startDateInput = document.getElementById("start-date-input");
const dueDateInput = document.getElementById("due-date-input");
const list = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDday(dueDateStr) {
  const due = parseDateOnly(dueDateStr);
  if (!due) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "D-DAY", type: "today" };
  if (diffDays > 0) return { label: `D-${diffDays}`, type: "upcoming" };
  return { label: `D+${Math.abs(diffDays)}`, type: "overdue" };
}

function render() {
  list.innerHTML = "";
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "표시할 항목이 없습니다";
    list.appendChild(empty);
  } else {
    filtered.forEach((todo) => {
      list.appendChild(createTodoItem(todo));
    });
  }

  const remaining = todos.filter((t) => !t.completed).length;
  itemsLeftEl.textContent = `${remaining}개 남음`;
}

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const main = document.createElement("div");
  main.className = "todo-main";

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;
  text.addEventListener("dblclick", () => startEdit(li, todo));
  main.appendChild(text);

  if (todo.startDate || todo.dueDate) {
    const meta = document.createElement("div");
    meta.className = "todo-meta";

    if (todo.startDate || todo.dueDate) {
      const range = document.createElement("span");
      range.className = "date-range";
      range.textContent = `${todo.startDate || "?"} ~ ${todo.dueDate || "?"}`;
      meta.appendChild(range);
    }

    if (todo.dueDate && !todo.completed) {
      const dday = formatDday(todo.dueDate);
      if (dday) {
        const badge = document.createElement("span");
        badge.className = "dday-badge" + (dday.type === "upcoming" ? "" : ` ${dday.type}`);
        badge.textContent = dday.label;
        meta.appendChild(badge);
      }
    }

    main.appendChild(meta);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(main);
  li.appendChild(deleteBtn);
  return li;
}

function startEdit(li, todo) {
  const editInput = document.createElement("input");
  editInput.className = "todo-text-input";
  editInput.type = "text";
  editInput.value = todo.text;

  const textEl = li.querySelector(".todo-text");
  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  const commit = () => {
    const value = editInput.value.trim();
    if (value) {
      todo.text = value;
      saveTodos();
    }
    render();
  };

  editInput.addEventListener("blur", commit);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") editInput.blur();
    if (e.key === "Escape") render();
  });
}

function addTodo(text, startDate, dueDate) {
  todos.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text,
    completed: false,
    startDate: startDate || null,
    dueDate: dueDate || null,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  const startDate = startDateInput.value;
  const dueDate = dueDateInput.value;

  if (startDate && dueDate && startDate > dueDate) {
    alert("마감일은 시작일보다 이후여야 합니다.");
    return;
  }

  addTodo(value, startDate, dueDate);
  input.value = "";
  startDateInput.value = "";
  dueDateInput.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
