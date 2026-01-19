<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_POST["user_id"] ?? null;
$title = $_POST["title"] ?? null;
$description = $_POST["description"] ?? null;
$date = $_POST["date"] ?? null;
$color = $_POST["color"] ?? "#3B82F6";

if (!$user_id || !$title) {
    echo json_encode(["success" => false, "message" => "Titlul este obligatoriu."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO todos (user_id, text, description, date, color)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("issss", $user_id, $title, $description, $date, $color);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Task adăugat.",
        "id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la inserare."]);
}

$stmt->close();
$conn->close();