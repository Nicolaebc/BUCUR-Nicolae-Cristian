document.getElementById("registerBtn").addEventListener("click", () => {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value.trim();
  const pass2 = document.getElementById("regPassword2").value.trim();
  const error = document.getElementById("regError");

  // Validări simple
  if (!name || !email || !pass || !pass2) {
    error.textContent = "Completează toate câmpurile.";
    return;
  }

  if (pass !== pass2) {
    error.textContent = "Parolele nu coincid.";
    return;
  }

  // Trimitem datele către backend
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", pass);

  fetch("http://localhost:8080/api/auth/register.php", {
    method: "POST",
    body: formData
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        window.location.href = "login.html";
      } else {
        error.textContent = data.message;
      }
    })
    .catch(() => {
      error.textContent = "Eroare de server. Încearcă din nou.";
    });
});