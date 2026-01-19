<?php
header("Content-Type: application/json");
require_once "../../config.php";

$id = $_POST["id"] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Eveniment șters."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la ștergere."]);
}

$stmt->close();
$conn->close();