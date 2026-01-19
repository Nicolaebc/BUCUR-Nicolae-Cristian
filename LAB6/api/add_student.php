<?php
require "../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name  = $data["name"]  ?? "";
$year  = $data["year"]  ?? 0;
$grade = $data["grade"] ?? 0;

$stmt = $conn->prepare("INSERT INTO students (name, year, grade) VALUES (?, ?, ?)");
$stmt->bind_param("sid", $name, $year, $grade);
$stmt->execute();

echo json_encode(["success" => true]);
?>