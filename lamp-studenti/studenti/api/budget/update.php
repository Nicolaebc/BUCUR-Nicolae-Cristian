<?php
header("Content-Type: application/json");
require_once "../../config.php";

$id = $_POST["id"] ?? null;
$type = $_POST["type"] ?? null;
$amount = $_POST["amount"] ?? null;
$title = $_POST["title"] ?? null;
$date = $_POST["date"] ?? null;
$category = $_POST["category"] ?? null;
$note = $_POST["note"] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID lipsă."]);
    exit;
}

$stmt = $conn->prepare("
    UPDATE budget
    SET type = ?, amount = ?, title = ?, date = ?, category = ?, note = ?
    WHERE id = ?
");
$stmt->bind_param("sdssssi", $type, $amount, $title, $date, $category, $note, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Tranzacție actualizată."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la actualizare."]);
}

$stmt->close();
$conn->close();