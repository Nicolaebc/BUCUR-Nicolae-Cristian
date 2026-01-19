<?php
$nameErr = $emailErr = $messageErr = "";
$name = $email = $message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["name"]) || strlen(trim($_POST["name"])) < 3) {
        $nameErr = "Numele trebuie sa aiba minim 3 caractere.";
    } else {
        $name = htmlspecialchars($_POST["name"]);
    }

    if (empty($_POST["email"]) || !filter_var($_POST["email"], FILTER_VALIDATE_EMAIL)) {
        $emailErr = "Introduceti un email valid.";
    } else {
        $email = htmlspecialchars($_POST["email"]);
    }

    if (empty($_POST["message"]) || strlen(trim($_POST["message"])) < 10) {
        $messageErr = "Mesajul trebuie sa aiba minim 10 caractere.";
    } else {
        $message = htmlspecialchars($_POST["message"]);
    }
    
    if ($nameErr == "" && $emailErr == "" && $messageErr == "") {
        echo "<p class='success'>Multumim, $name! Mesajul tau a fost primit: \"$message\"</p>";
    } else {
        echo "<p class='error'>Formularul contine erori:</p>";
        echo "<p class='error'>$nameErr</p>";
        echo "<p class='error'>$emailErr</p>";
        echo "<p class='error'>$messageErr</p>";
    }
}
?>