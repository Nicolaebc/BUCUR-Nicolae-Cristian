// Animatie subtila la intrare pentru carduri
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".dash-card");

  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(10px)";

    setTimeout(() => {
      card.style.transition = "0.35s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 120 + index * 120);
  });
});

// Efect de highlight pe cardul selectat
const cards = document.querySelectorAll(".dash-card");

cards.forEach(card => {
  card.addEventListener("mousedown", () => {
    card.classList.add("active-card");
  });

  card.addEventListener("mouseup", () => {
    card.classList.remove("active-card");
  });

  card.addEventListener("mouseleave", () => {
    card.classList.remove("active-card");
  });
});

// Protecție acces dashboard
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
  window.location.href = "login.html";
}

document.getElementById("welcomeUser").textContent =
  `Bun venit, ${loggedUser.name}!`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
});
