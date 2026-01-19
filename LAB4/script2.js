const detalii = document.getElementById("detalii");
const btn = document.getElementById("btnDetalii");
const dataProdus = document.getElementById("dataProdus");

const luni = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];
detalii.classList.add("ascuns");
const d = new Date();
const zi = d.getDate();
const luna = luni[d.getMonth()];
const an = d.getFullYear();
dataProdus.textContent = `${zi} ${luna} ${an}`;
btn.addEventListener("click", function() {
  detalii.classList.toggle("ascuns");
  if (detalii.classList.contains("ascuns")) {
    btn.textContent = "Afișează detalii";
  } else {
    btn.textContent = "Ascunde detalii";
  }
});