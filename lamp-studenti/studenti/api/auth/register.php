<?php
header("Content-Type: application/json");
require_once "../../config.php";

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$name || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Completează toate câmpurile."]);
    exit;
}

// Verificăm dacă emailul există deja
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Există deja un cont cu acest email."]);
    exit;
}

$stmt->close();

// Criptăm parola
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Inserăm user-ul
$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashed);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cont creat cu succes."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la crearea contului."]);
}

$stmt->close();
$conn->close();
?>