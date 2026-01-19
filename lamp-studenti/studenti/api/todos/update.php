<?php
header("Content-Type: application/json");
require_once "../../config.php";

$id = $_POST["id"] ?? null;
$title = $_POST["title"] ?? null;
$description = $_POST["description"] ?? null;
$date = $_POST["date"] ?? null;
$color = $_POST["color"] ?? null;
$completed = $_POST["completed"] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    UPDATE todos
    SET text = ?, description = ?, date = ?, color = ?, completed = ?
    WHERE id = ?
");
$stmt->bind_param("ssssii", $title, $description, $date, $color, $completed, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Task actualizat."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la actualizare."]);
}

$stmt->close();
$conn->close();