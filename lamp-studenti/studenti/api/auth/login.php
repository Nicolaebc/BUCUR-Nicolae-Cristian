<?php
header("Content-Type: application/json");
require_once "../../config.php";

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Completează toate câmpurile."
    ]);
    exit;
}

// Căutăm userul după email
$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Email sau parolă incorecte."
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verificăm parola
if (!password_verify($password, $user['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Email sau parolă incorecte."
    ]);
    exit;
}

// Scoatem parola din răspuns
unset($user['password']);

echo json_encode([
    "success" => true,
    "message" => "Autentificare reușită.",
    "user" => $user
]);

$stmt->close();
$conn->close();
?>