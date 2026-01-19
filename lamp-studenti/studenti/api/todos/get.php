<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT * FROM todos
    WHERE user_id = ?
    ORDER BY id DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$todos = [];
while ($row = $result->fetch_assoc()) {
    $todos[] = $row;
}

echo json_encode(["success" => true, "todos" => $todos]);

$stmt->close();
$conn->close();