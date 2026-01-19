document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  // Reset mesaj eroare
  error.textContent = "";

  // Validare câmpuri
  if (!email || !password) {
    error.textContent = "Completează toate câmpurile.";
    return;
  }

  // Pregătim datele pentru backend
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  // Trimitem cererea către backend
  fetch("http://localhost:8080/api/auth/login.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // Salvăm userul logat pentru sesiune
        localStorage.setItem("loggedUser", JSON.stringify(data.user));

        // Redirect către dashboard
        window.location.href = "dashboard.html";
      } else {
        error.textContent = data.message;
      }
    })
    .catch(() => {
      error.textContent = "Eroare de server. Încearcă din nou.";
    });
});