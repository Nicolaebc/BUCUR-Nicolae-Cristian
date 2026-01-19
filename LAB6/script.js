async function loadStudents() {
    const res = await fetch("http://localhost:8080/cataloglab6/api/get_students.php");
    const students = await res.json();

    const list = document.getElementById("studentsList");
    list.innerHTML = "";

    students.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} - Anul ${s.year} - Media ${s.grade}`;
        list.appendChild(li);
    });
}

document.getElementById("addBtn").addEventListener("click", async () => {
    const name = document.getElementById("name").value;
    const year = document.getElementById("year").value;
    const grade = document.getElementById("grade").value;

    await fetch("http://localhost:8080/cataloglab6/api/add_student.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, year, grade })
    });

    loadStudents();
});

loadStudents();