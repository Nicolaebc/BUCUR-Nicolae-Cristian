<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT * FROM journal
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$entries = [];
while ($row = $result->fetch_assoc()) {
    $entries[] = $row;
}

echo json_encode(["success" => true, "entries" => $entries]);

$stmt->close();
$conn->close();