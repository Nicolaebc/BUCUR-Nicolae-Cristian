document.getElementById("contactForm").addEventListener("submit", function(event) {
    let valid = true;

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let message = document.getElementById("message").value.trim();

    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("messageError").textContent = "";
    document.getElementById("successMessage").textContent = "";

    if (name.length < 3) {
        document.getElementById("nameError").textContent = "Numele trebuie sa aiba minim 3 caractere.";
        valid = false;
    }

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    if (!email.match(emailPattern)) {
        document.getElementById("emailError").textContent = "Introduceti un email valid.";
        valid = false;
    }

    if (message.length < 10) {
        document.getElementById("messageError").textContent = "Mesajul trebuie sa aiba minim 10 caractere.";
        valid = false;
    }

    if (valid) {
        event.preventDefault();
        document.getElementById("successMessage").textContent =
            `Multumim, ${name}! Mesajul tau a fost primit: \"${message}\"`;
    } else {
        event.preventDefault();
    }
});