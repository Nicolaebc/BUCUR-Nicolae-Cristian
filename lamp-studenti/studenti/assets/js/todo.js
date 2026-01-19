/* ============================================================
   GLOBAL STATE
   ============================================================ */

let tasks = [];
const user = JSON.parse(localStorage.getItem("loggedUser"));
let editingTaskId = null;
let selectedTaskColor = "#3B82F6";

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromBackend();
  setupModal();
  setupColorPicker();
  setupFilters();
});

/* ============================================================
   LOAD TASKS FROM BACKEND
   ============================================================ */

function loadTasksFromBackend() {
  fetch(`http://localhost:8080/api/todos/get.php?user_id=${user.id}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        tasks = data.todos.map(t => ({
          id: t.id,
          title: t.text,
          desc: t.description,
          date: t.date,
          color: t.color,
          done: t.completed == 1
        }));
        renderTasks();
      }
    });
}

/* ============================================================
   RENDER TASKS
   ============================================================ */

function renderTasks(filter = "all") {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  let filtered = tasks;

  if (filter === "today") {
    filtered = tasks.filter(t => t.date && isToday(t.date));
  }

  if (filter === "upcoming") {
    filtered = tasks.filter(t => t.date && isFuture(t.date));
  }

  if (filter === "done") {
    filtered = tasks.filter(t => t.done);
  }

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.style.borderLeftColor = task.color;

    const check = document.createElement("div");
    check.classList.add("task-check");
    if (task.done) check.classList.add("checked");

    check.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTaskDone(task.id);
    });

    const content = document.createElement("div");
    content.classList.add("task-content");

    const title = document.createElement("div");
    title.classList.add("task-title");
    title.textContent = task.title;

    const desc = document.createElement("div");
    desc.classList.add("task-desc");
    desc.textContent = task.desc;

    const date = document.createElement("div");
    date.classList.add("task-date");
    if (task.date) date.textContent = formatDate(task.date);

    content.appendChild(title);
    if (task.desc) content.appendChild(desc);
    if (task.date) content.appendChild(date);

    card.appendChild(check);
    card.appendChild(content);

    card.addEventListener("click", () => openModalForEdit(task));

    list.appendChild(card);
  });
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

function isToday(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isFuture(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d > today;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return `${d.getDate()} ${d.toLocaleString("ro-RO", { month: "long" })} ${d.getFullYear()}`;
}

/* ============================================================
   MODAL LOGIC
   ============================================================ */

function setupModal() {
  document.getElementById("addTaskBtn").addEventListener("click", () => {
    editingTaskId = null;
    selectedTaskColor = "#3B82F6";
    updateColorPickerSelection();

    document.getElementById("taskModalTitle").textContent = "Adaugă task";
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskDate").value = "";

    showTaskModal();
  });

  document.getElementById("closeTaskModal").addEventListener("click", closeTaskModal);
  document.getElementById("deleteTask").addEventListener("click", deleteTask);
  document.getElementById("saveTask").addEventListener("click", saveTask);
}

function showTaskModal() {
  document.getElementById("taskModalBackdrop").style.display = "flex";
}

function closeTaskModal() {
  document.getElementById("taskModalBackdrop").style.display = "none";
}

/* ============================================================
   ADD / EDIT TASK (BACKEND)
   ============================================================ */

function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;

  if (!title) return;

  const formData = new FormData();
  formData.append("user_id", user.id);
  formData.append("title", title);
  formData.append("description", desc);
  formData.append("date", date);
  formData.append("color", selectedTaskColor);

  // EDITARE
  if (editingTaskId) {
    const t = tasks.find(t => t.id == editingTaskId);

    formData.append("id", editingTaskId);
    formData.append("completed", t.done ? 1 : 0);

    fetch("http://localhost:8080/api/todos/update.php", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(() => {
        closeTaskModal();
        loadTasksFromBackend();
      });

    return;
  }

  // ADAUGARE
  fetch("http://localhost:8080/api/todos/add.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeTaskModal();
      loadTasksFromBackend();
    });
}

function openModalForEdit(task) {
  editingTaskId = task.id;
  selectedTaskColor = task.color;
  updateColorPickerSelection();

  document.getElementById("taskModalTitle").textContent = "Editează task";
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc;
  document.getElementById("taskDate").value = task.date || "";

  showTaskModal();
}

/* ============================================================
   DELETE TASK (BACKEND)
   ============================================================ */

function deleteTask() {
  if (!editingTaskId) return;

  const formData = new FormData();
  formData.append("id", editingTaskId);

  fetch("http://localhost:8080/api/todos/delete.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeTaskModal();
      loadTasksFromBackend();
    });
}

/* ============================================================
   CHECK / UNCHECK TASK (BACKEND)
   ============================================================ */

function toggleTaskDone(id) {
  const task = tasks.find(t => t.id == id);

  const formData = new FormData();
  formData.append("id", id);
  formData.append("title", task.title);
  formData.append("description", task.desc);
  formData.append("date", task.date);
  formData.append("color", task.color);
  formData.append("completed", task.done ? 0 : 1);

  fetch("http://localhost:8080/api/todos/update.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => loadTasksFromBackend());
}

/* ============================================================
   COLOR PICKER
   ============================================================ */

function setupColorPicker() {
  document.querySelectorAll("#taskColorPicker .color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      selectedTaskColor = dot.dataset.color;
      updateColorPickerSelection();
    });
  });
}

function updateColorPickerSelection() {
  document.querySelectorAll("#taskColorPicker .color-dot").forEach(dot => {
    dot.classList.remove("selected");
    if (dot.dataset.color === selectedTaskColor) {
      dot.classList.add("selected");
    }
  });
}

/* ============================================================
   FILTERS
   ============================================================ */

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      renderTasks(filter);
    });
  });
}