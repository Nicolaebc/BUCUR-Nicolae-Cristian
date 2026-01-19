const input = document.getElementById("inputActivitate");
const btn = document.getElementById("btnAdauga");
const lista = document.getElementById("listaActivitati");

const luni = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

btn.addEventListener("click", function() {
  const activitate = input.value.trim();
  if (activitate !== "") {
    const d = new Date();
    const zi = d.getDate();
    const luna = luni[d.getMonth()];
    const an = d.getFullYear();

    const li = document.createElement("li");
    li.textContent = `${activitate} - adaugata la: ${zi} ${luna} ${an}`;
    lista.appendChild(li);

    input.value = "";
  }
});
