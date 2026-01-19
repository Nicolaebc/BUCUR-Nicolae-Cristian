/* ============================================================
   GLOBAL STATE
   ============================================================ */

let transactions = [];
let editingTransactionId = null;

let currentDate = new Date();
let selectedType = "income"; // implicit: Venit

const user = JSON.parse(localStorage.getItem("loggedUser"));

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  updateMonthLabel();
  loadTransactionsFromBackend();
  setupModal();
  setupFilters();
  setupMonthNavigation();
  setupTypeToggle();
});

/* ============================================================
   LOAD FROM BACKEND
   ============================================================ */

function loadTransactionsFromBackend() {
  fetch(`http://localhost:8080/api/budget/get.php?user_id=${user.id}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        transactions = data.items.map(t => ({
          id: t.id,
          title: t.title,
          amount: t.amount,
          type: t.type,
          date: t.date,
          category: t.category,
          desc: t.note
        }));
        renderTransactions();
        updateStats();
      }
    });
}

/* ============================================================
   MONTH NAVIGATION
   ============================================================ */

function setupMonthNavigation() {
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthLabel();
    renderTransactions();
    updateStats();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthLabel();
    renderTransactions();
    updateStats();
  });
}

function updateMonthLabel() {
  const monthName = currentDate.toLocaleString("ro-RO", { month: "long" });
  const formatted = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  document.getElementById("monthLabel").textContent =
    `${formatted} ${currentDate.getFullYear()}`;
}

/* ============================================================
   RENDER TRANSACTIONS
   ============================================================ */

function renderTransactions(filter = "all") {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  let filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  if (filter === "income") {
    filtered = filtered.filter(t => t.type === "income");
  }

  if (filter === "expense") {
    filtered = filtered.filter(t => t.type === "expense");
  }

  filtered.forEach(t => {
    const card = document.createElement("div");
    card.classList.add("transaction-card");
    card.style.borderLeftColor = t.type === "income" ? "#22C55E" : "#EF4444";

    const left = document.createElement("div");
    left.classList.add("trans-left");

    const title = document.createElement("div");
    title.classList.add("trans-title");
    title.textContent = t.title;

    const category = document.createElement("div");
    category.classList.add("trans-category");
    category.textContent = t.category;

    const date = document.createElement("div");
    date.classList.add("trans-date");
    date.textContent = formatDate(t.date);

    left.appendChild(title);
    left.appendChild(category);
    left.appendChild(date);

    const amount = document.createElement("div");
    amount.classList.add("trans-amount", t.type);
    amount.textContent = `${t.amount} RON`;

    card.appendChild(left);
    card.appendChild(amount);

    card.addEventListener("click", () => openModalForEdit(t));

    list.appendChild(card);
  });
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

function formatDate(dateString) {
  const d = new Date(dateString);
  const monthName = d.toLocaleString("ro-RO", { month: "long" });
  return `${d.getDate()} ${monthName} ${d.getFullYear()}`;
}

/* ============================================================
   STATISTICS
   ============================================================ */

function updateStats() {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income = filtered
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = filtered
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  document.getElementById("totalIncome").textContent = `${income} RON`;
  document.getElementById("totalExpense").textContent = `${expense} RON`;
  document.getElementById("totalBalance").textContent = `${balance} RON`;
}

/* ============================================================
   TYPE TOGGLE (Venit / Cheltuială)
   ============================================================ */

function setupTypeToggle() {
  document.querySelectorAll(".type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.dataset.type;
    });
  });
}

/* ============================================================
   MODAL LOGIC
   ============================================================ */

function setupModal() {
  document.getElementById("addTransactionBtn").addEventListener("click", () => {
    editingTransactionId = null;

    document.getElementById("transactionModalTitle").textContent = "Adaugă tranzacție";
    document.getElementById("transTitle").value = "";
    document.getElementById("transAmount").value = "";
    document.getElementById("transDate").value = "";
    document.getElementById("transCategory").value = "Altele";
    document.getElementById("transDesc").value = "";

    selectedType = "income";
    resetTypeToggle();

    showTransactionModal();
  });

  document.getElementById("closeTransactionModal").addEventListener("click", closeTransactionModal);
  document.getElementById("deleteTransaction").addEventListener("click", deleteTransaction);
  document.getElementById("saveTransaction").addEventListener("click", saveTransaction);
}

function resetTypeToggle() {
  document.querySelectorAll(".type-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.type === selectedType) btn.classList.add("active");
  });
}

function showTransactionModal() {
  document.getElementById("transactionModalBackdrop").style.display = "flex";
}

function closeTransactionModal() {
  document.getElementById("transactionModalBackdrop").style.display = "none";
}

/* ============================================================
   ADD / EDIT TRANSACTION (BACKEND)
   ============================================================ */

function saveTransaction() {
  const title = document.getElementById("transTitle").value.trim();
  const amount = document.getElementById("transAmount").value;
  const date = document.getElementById("transDate").value;
  const category = document.getElementById("transCategory").value;
  const desc = document.getElementById("transDesc").value.trim();

  if (!title || !amount || !date) return;

  const formData = new FormData();
  formData.append("user_id", user.id);
  formData.append("title", title);
  formData.append("amount", amount);
  formData.append("type", selectedType);
  formData.append("date", date);
  formData.append("category", category);
  formData.append("note", desc);

  // EDITARE
  if (editingTransactionId) {
    formData.append("id", editingTransactionId);

    fetch("http://localhost:8080/api/budget/update.php", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(() => {
        closeTransactionModal();
        loadTransactionsFromBackend();
      });

    return;
  }

  // ADAUGARE
  fetch("http://localhost:8080/api/budget/add.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeTransactionModal();
      loadTransactionsFromBackend();
    });
}

function openModalForEdit(t) {
  editingTransactionId = t.id;

  document.getElementById("transactionModalTitle").textContent = "Editează tranzacție";
  document.getElementById("transTitle").value = t.title;
  document.getElementById("transAmount").value = t.amount;
  document.getElementById("transDate").value = t.date;
  document.getElementById("transCategory").value = t.category;
  document.getElementById("transDesc").value = t.desc;

  selectedType = t.type;
  resetTypeToggle();

  showTransactionModal();
}

/* ============================================================
   DELETE TRANSACTION (BACKEND)
   ============================================================ */

function deleteTransaction() {
  if (!editingTransactionId) return;

  const formData = new FormData();
  formData.append("id", editingTransactionId);

  fetch("http://localhost:8080/api/budget/delete.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(() => {
      closeTransactionModal();
      loadTransactionsFromBackend();
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
      renderTransactions(filter);
      updateStats();
    });
  });
}