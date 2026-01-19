<?php
header("Content-Type: application/json");
require_once "../../config.php";

$user_id = $_POST["user_id"] ?? null;
$type = $_POST["type"] ?? null;
$amount = $_POST["amount"] ?? null;
$title = $_POST["title"] ?? null;
$date = $_POST["date"] ?? null;
$category = $_POST["category"] ?? null;
$note = $_POST["note"] ?? null;

if (!$user_id || !$type || !$amount || !$title || !$date) {
    echo json_encode(["success" => false, "message" => "Completează câmpurile obligatorii."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO budget (user_id, type, amount, title, date, category, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("isdssss", $user_id, $type, $amount, $title, $date, $category, $note);


if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Tranzacție adăugată.",
        "id" => $stmt->insert_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la inserare."]);
}

$stmt->close();
$conn->close();