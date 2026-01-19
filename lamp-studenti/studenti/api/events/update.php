<?php
header("Content-Type: application/json");
require_once "../../config.php";

$id = $_POST["id"] ?? null;
$title = $_POST["title"] ?? null;
$date = $_POST["date"] ?? null;
$start = $_POST["start_time"] ?? null;
$end = $_POST["end_time"] ?? null;
$color = $_POST["color"] ?? null;
$description = $_POST["description"] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    UPDATE events
    SET title = ?, date = ?, start_time = ?, end_time = ?, color = ?, description = ?
    WHERE id = ?
");
$stmt->bind_param("ssssssi", $title, $date, $start, $end, $color, $description, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Eveniment actualizat."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la actualizare."]);
}

$stmt->close();
$conn->close();