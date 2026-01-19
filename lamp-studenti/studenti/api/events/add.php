<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_POST["user_id"] ?? null;
$title = $_POST["title"] ?? null;
$date = $_POST["date"] ?? null;
$start = $_POST["start_time"] ?? null;
$end = $_POST["end_time"] ?? null;
$color = $_POST["color"] ?? "#3B82F6";
$description = $_POST["description"] ?? null;

if (!$user_id || !$title || !$date || !$start || !$end) {
    echo json_encode(["success" => false, "message" => "Completează toate câmpurile obligatorii."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO events (user_id, title, date, start_time, end_time, color, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("issssss", $user_id, $title, $date, $start, $end, $color, $description);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Eveniment adăugat.",
        "id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la inserare."]);
}

$stmt->close();
$conn->close();