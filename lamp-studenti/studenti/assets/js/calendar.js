/* ============================================================
   DATE NORMALIZATION
   ============================================================ */

function makeLocalDate(y, m, d) {
  return new Date(y, m, d, 12, 0, 0);
}

function normalizeDate(date) {
  return makeLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return makeLocalDate(y, m - 1, d);
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

/* ============================================================
   GLOBAL STATE
   ============================================================ */

let currentDate = normalizeDate(new Date());
let miniCurrent = normalizeDate(new Date());

let events = [];
let editingEventId = null;
let selectedColor = "#EF4444";

const user = JSON.parse(localStorage.getItem("loggedUser"));

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  setupButtons();
  setupColorPicker();
  loadEventsFromBackend();
  generateWeek();
});

/* ============================================================
   LOAD EVENTS FROM BACKEND
   ============================================================ */

function loadEventsFromBackend() {
  fetch(`http://localhost:8080/api/events/get.php?user_id=${user.id}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        events = data.events.map(ev => ({
          id: ev.id,
          title: ev.title,
          date: ev.date,
          start: ev.start_time,
          end: ev.end_time,
          color: ev.color,
          desc: ev.description
        }));
        renderEvents();
        renderMiniCalendar();
      }
    });
}

/* ============================================================
   WEEK GENERATION
   ============================================================ */

function getMonday(date) {
  const d = normalizeDate(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return normalizeDate(d);
}

function generateWeek() {
  const header = document.getElementById("daysHeader");
  const body = document.getElementById("daysBody");
  const timeColumn = document.getElementById("timeColumn");

  header.innerHTML = "";
  body.innerHTML = "";
  timeColumn.innerHTML = "";

  const startOfWeek = getMonday(currentDate);
  const endOfWeek = makeLocalDate(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);

  document.getElementById("weekLabel").textContent =
    `${formatLocalDate(startOfWeek)} – ${formatLocalDate(endOfWeek)}`;

  for (let h = 0; h < 24; h++) {
    const hourDiv = document.createElement("div");
    hourDiv.textContent = `${String(h).padStart(2, "0")}:00`;
    timeColumn.appendChild(hourDiv);
  }

  for (let i = 0; i < 7; i++) {
    const d = makeLocalDate(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);

    const div = document.createElement("div");
    div.textContent = `${dayName(d)} ${d.getDate()}`;
    div.classList.add("day-header-cell");

    if (isToday(d)) div.classList.add("today");

    div.addEventListener("click", () => selectDayHeader(div));

    header.appendChild(div);
  }

  for (let h = 0; h < 24; h++) {
    for (let i = 0; i < 7; i++) {
      const cell = document.createElement("div");
      cell.classList.add("hour-row");
      cell.addEventListener("click", () => openModalForNewEvent(i, h));
      body.appendChild(cell);
    }
  }
}

/* ============================================================
   DAY HEADER SELECTION
   ============================================================ */

function selectDayHeader(cell) {
  document.querySelectorAll(".day-header-cell").forEach(c =>
    c.classList.remove("selected")
  );

  cell.classList.add("selected");
  cell.style.animation = "selectPop 0.25s ease-out";
}

/* ============================================================
   MINI CALENDAR
   ============================================================ */

function renderMiniCalendar() {
  const container = document.getElementById("miniCalendarContainer");
  container.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const d = makeLocalDate(miniCurrent.getFullYear(), miniCurrent.getMonth() + i, 1);

    const monthDiv = document.createElement("div");
    monthDiv.classList.add("mini-month");

    const title = document.createElement("h4");
    title.textContent = `${monthName(d)} ${d.getFullYear()}`;
    monthDiv.appendChild(title);

    const grid = document.createElement("div");
    grid.classList.add("mini-grid");

    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let j = 0; j < offset; j++) {
      grid.appendChild(document.createElement("div"));
    }

    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.classList.add("mini-day");
      cell.textContent = day;

      cell.addEventListener("click", () => selectMiniDate(d.getFullYear(), d.getMonth(), day));

      grid.appendChild(cell);
    }

    monthDiv.appendChild(grid);
    container.appendChild(monthDiv);
  }

  document.getElementById("miniMonthLabel").textContent =
    `${monthName(miniCurrent)} ${miniCurrent.getFullYear()}`;
}

function selectMiniDate(year, month, day) {
  document.querySelectorAll(".mini-day").forEach(d => d.classList.remove("selected"));

  const selected = [...document.querySelectorAll(".mini-day")]
    .find(d => d.textContent == day);

  if (selected) selected.classList.add("selected");

  currentDate = makeLocalDate(year, month, day);
  generateWeek();
  renderEvents();
}

/* ============================================================
   MODAL
   ============================================================ */

function openModalForNewEvent(dayIndex, hour) {
  editingEventId = null;

  const startOfWeek = getMonday(currentDate);
  const date = makeLocalDate(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + dayIndex);

  document.getElementById("modalTitle").textContent = "Adaugă eveniment";
  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = formatLocalDate(date);
  document.getElementById("eventStart").value = `${String(hour).padStart(2, "0")}:00`;
  document.getElementById("eventEnd").value = `${String(hour + 1).padStart(2, "0")}:00`;
  document.getElementById("eventDesc").value = "";

  selectedColor = "#EF4444";
  updateColorPickerSelection();

  showModal();
}

function openModalForEdit(ev) {
  editingEventId = ev.id;

  document.getElementById("modalTitle").textContent = "Editează eveniment";
  document.getElementById("eventTitle").value = ev.title;
  document.getElementById("eventDate").value = ev.date;
  document.getElementById("eventStart").value = ev.start;
  document.getElementById("eventEnd").value = ev.end;
  document.getElementById("eventDesc").value = ev.desc;

  selectedColor = ev.color;
  updateColorPickerSelection();

  showModal();
}

function showModal() {
  document.getElementById("eventModalBackdrop").style.display = "flex";
}

function closeModal() {
  document.getElementById("eventModalBackdrop").style.display = "none";
}

document.getElementById("closeModal").addEventListener("click", closeModal);

/* ============================================================
   COLOR PICKER
   ============================================================ */

function setupColorPicker() {
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      selectedColor = dot.dataset.color;
      updateColorPickerSelection();
    });
  });
}

function updateColorPickerSelection() {
  document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
  const active = [...document.querySelectorAll(".color-dot")]
    .find(d => d.dataset.color === selectedColor);
  if (active) active.classList.add("selected");
}

/* ============================================================
   SAVE EVENT (BACKEND)
   ============================================================ */

document.getElementById("saveEvent").addEventListener("click", () => {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  const start = document.getElementById("eventStart").value;
  const end = document.getElementById("eventEnd").value;
  const desc = document.getElementById("eventDesc").value.trim();

  if (!title || !date || !start || !end) return;

  const formData = new FormData();
  formData.append("user_id", user.id);
  formData.append("title", title);
  formData.append("date", date);
  formData.append("start_time", start);
  formData.append("end_time", end);
  formData.append("color", selectedColor);
  formData.append("description", desc);

  if (editingEventId) {
    formData.append("id", editingEventId);

    fetch("http://localhost:8080/api/events/update.php", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(() => {
        closeModal();
        loadEventsFromBackend();
      });

    return;
  }

  fetch("http://localhost:8080/api/events/add.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeModal();
      loadEventsFromBackend();
    });
});

/* ============================================================
   DELETE EVENT (BACKEND)
   ============================================================ */

document.getElementById("deleteEvent").addEventListener("click", () => {
  if (!editingEventId) return;

  const formData = new FormData();
  formData.append("id", editingEventId);

  fetch("http://localhost:8080/api/events/delete.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeModal();
      loadEventsFromBackend();
    });
});

/* ============================================================
   RENDER EVENTS
   ============================================================ */

function renderEvents() {
  const daysBody = document.getElementById("daysBody");
  const startOfWeek = getMonday(currentDate);

  document.querySelectorAll(".event-block").forEach(e => e.remove());

  events.forEach(ev => {
    const evDate = parseLocalDate(ev.date);
    const diff = Math.floor((evDate - startOfWeek) / (1000 * 60 * 60 * 24));

    if (diff < 0 || diff > 6) return;

    const startHour = parseInt(ev.start.split(":")[0]);
    const startMin = parseInt(ev.start.split(":")[1]);
    const endHour = parseInt(ev.end.split(":")[0]);
    const endMin = parseInt(ev.end.split(":")[1]);

    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const height = (duration / 60) * 60;

    const index = startHour * 7 + diff;
    const cell = daysBody.children[index];

    if (!cell) return;

    const block = document.createElement("div");
    block.classList.add("event-block");
    block.style.top = `${(startMin / 60) * 60}px`;
    block.style.height = `${height}px`;
    block.style.background = ev.color;
    block.style.borderLeftColor = darken(ev.color);

    block.innerHTML = `<strong>${ev.title}</strong><br>${ev.start} – ${ev.end}`;

    block.addEventListener("click", (e) => {
      e.stopPropagation();
      openModalForEdit(ev);
    });

    cell.appendChild(block);
  });
}

/* ============================================================
   HELPERS
   ============================================================ */

function darken(hex) {
  const c = parseInt(hex.slice(1), 16);
  const r = (c >> 16) * 0.7;
  const g = ((c >> 8) & 0xff) * 0.7;
  const b = (c & 0xff) * 0.7;
  return `rgb(${r}, ${g}, ${b})`;
}

function dayName(d) {
  return ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"][d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function monthName(d) {
  return d.toLocaleString("ro-RO", { month: "long" });
}

function isToday(d) {
  const t = normalizeDate(new Date());
  return d.getTime() === t.getTime();
}

/* ============================================================
   NAVIGATION BUTTONS
   ============================================================ */

function setupButtons() {
  document.getElementById("prevWeek").addEventListener("click", () => {
    currentDate = makeLocalDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
    generateWeek();
    renderEvents();
  });

  document.getElementById("nextWeek").addEventListener("click", () => {
    currentDate = makeLocalDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
    generateWeek();
    renderEvents();
  });

  document.getElementById("todayBtn").addEventListener("click", () => {
    const now = new Date();
    currentDate = makeLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
    generateWeek();
    renderEvents();

    setTimeout(() => {
      const todayCell = document.querySelector(".day-header-cell.today");
      if (todayCell) selectDayHeader(todayCell);
    }, 10);
  });
}