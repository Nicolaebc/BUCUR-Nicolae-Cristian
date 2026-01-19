<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_POST["user_id"] ?? null;
$title = $_POST["title"] ?? null;
$content = $_POST["content"] ?? null;

if (!$user_id || !$title || !$content) {
    echo json_encode(["success" => false, "message" => "Completează toate câmpurile."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO journal (user_id, title, content)
    VALUES (?, ?, ?)
");
$stmt->bind_param("iss", $user_id, $title, $content);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Însemnare adăugată.",
        "id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la inserare."]);
}

$stmt->close();
$conn->close();