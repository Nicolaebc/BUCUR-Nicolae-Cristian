<?php
$host = "lamp_mysql";  // numele containerului MySQL
$user = "root";
$pass = "root";
$db   = "studenti";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Conexiune esuata: " . $conn->connect_error);
}
?>