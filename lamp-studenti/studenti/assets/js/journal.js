/* ============================================================
   GLOBAL STATE
   ============================================================ */

let notes = [];
let editingNoteId = null;

const user = JSON.parse(localStorage.getItem("loggedUser"));

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  loadNotesFromBackend();
  setupModal();
});

/* ============================================================
   LOAD NOTES FROM BACKEND
   ============================================================ */

function loadNotesFromBackend() {
  fetch(`http://localhost:8080/api/journal/get.php?user_id=${user.id}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        notes = data.entries.map(n => ({
          id: n.id,
          title: n.title,
          date: n.created_at.split(" ")[0], // YYYY-MM-DD
          content: n.content
        }));
        renderNotes();
      }
    });
}

/* ============================================================
   RENDER NOTES
   ============================================================ */

function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes.forEach(n => {
    const card = document.createElement("div");
    card.classList.add("note-card");

    const title = document.createElement("div");
    title.classList.add("note-title");
    title.textContent = n.title;

    const date = document.createElement("div");
    date.classList.add("note-date");
    date.textContent = formatDate(n.date);

    const preview = document.createElement("div");
    preview.classList.add("note-preview");
    preview.textContent = n.content;

    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(preview);

    card.addEventListener("click", () => openModalForEdit(n));

    list.appendChild(card);
  });
}

/* ============================================================
   DATE FORMATTER
   ============================================================ */

function formatDate(dateString) {
  const d = new Date(dateString);
  const monthName = d.toLocaleString("ro-RO", { month: "long" });
  return `${d.getDate()} ${monthName} ${d.getFullYear()}`;
}

/* ============================================================
   MODAL LOGIC
   ============================================================ */

function setupModal() {
  document.getElementById("addNoteBtn").addEventListener("click", () => {
    editingNoteId = null;

    document.getElementById("noteModalTitle").textContent = "Adaugă notiță";
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteDate").value = "";
    document.getElementById("noteContent").value = "";

    showNoteModal();
  });

  document.getElementById("closeNoteModal").addEventListener("click", closeNoteModal);
  document.getElementById("deleteNote").addEventListener("click", deleteNote);
  document.getElementById("saveNote").addEventListener("click", saveNote);
}

function showNoteModal() {
  document.getElementById("noteModalBackdrop").style.display = "flex";
}

function closeNoteModal() {
  document.getElementById("noteModalBackdrop").style.display = "none";
}

/* ============================================================
   ADD / EDIT NOTE (BACKEND)
   ============================================================ */

function saveNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const date = document.getElementById("noteDate").value;
  const content = document.getElementById("noteContent").value.trim();

  if (!title || !date || !content) return;

  const formData = new FormData();
  formData.append("user_id", user.id);
  formData.append("title", title);
  formData.append("content", content);

  // EDITARE
  if (editingNoteId) {
    formData.append("id", editingNoteId);

    fetch("http://localhost:8080/api/journal/update.php", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(() => {
        closeNoteModal();
        loadNotesFromBackend();
      });

    return;
  }

  // ADAUGARE
  fetch("http://localhost:8080/api/journal/add.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeNoteModal();
      loadNotesFromBackend();
    });
}

function openModalForEdit(n) {
  editingNoteId = n.id;

  document.getElementById("noteModalTitle").textContent = "Editează notiță";
  document.getElementById("noteTitle").value = n.title;
  document.getElementById("noteDate").value = n.date;
  document.getElementById("noteContent").value = n.content;

  showNoteModal();
}

/* ============================================================
   DELETE NOTE (BACKEND)
   ============================================================ */

function deleteNote() {
  if (!editingNoteId) return;

  const formData = new FormData();
  formData.append("id", editingNoteId);

  fetch("http://localhost:8080/api/journal/delete.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeNoteModal();
      loadNotesFromBackend();
    });
}