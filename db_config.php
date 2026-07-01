<?php
// db_config.php

// URL Supabase: postgresql://postgres:[YOUR-PASSWORD]@db.bypenbqchlorpuybmihd.supabase.co:5432/postgres
$host = "db.bypenbqchlorpuybmihd.supabase.co";
$port = "5432";
$username = "postgres";
$password = "B4nanaK1ng5Ch1p"; // Ganti dengan password Supabase kamu
$database = "postgres";

try {
    // Membuat koneksi PDO ke PostgreSQL
    $dsn = "pgsql:host=$host;port=$port;dbname=$database";
    $conn = new PDO($dsn, $username, $password);
    
    // Mengatur mode error PDO menjadi exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Mengatur default fetch mode menjadi associative array
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    error_log("Koneksi database gagal: " . $e->getMessage());
    http_response_code(500);
    die(json_encode(array("error" => "Koneksi database gagal", "details" => $e->getMessage())));
}
?>