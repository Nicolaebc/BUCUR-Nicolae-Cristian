<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT * FROM events
    WHERE user_id = ?
    ORDER BY date ASC, start_time ASC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode(["success" => true, "events" => $events]);

$stmt->close();
$conn->close();