<?php
header("Content-Type: application/json");
require_once "../../config.php";

$id = $_POST["id"] ?? null;
$title = $_POST["title"] ?? null;
$content = $_POST["content"] ?? null;

if (!$id || !$title || !$content) {
    echo json_encode(["success" => false, "message" => "Date incomplete."]);
    exit;
}

$stmt = $conn->prepare("
    UPDATE journal
    SET title = ?, content = ?
    WHERE id = ?
");
$stmt->bind_param("ssi", $title, $content, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Însemnare actualizată."]);
} else {
    echo json_encode(["success" => false, "message" => "Eroare la actualizare."]);
}

$stmt->close();
$conn->close();