<?php
// db_config.php

$host = "localhost";
$username = "renzipmy_renzdata";
$password = "renz747412"; 
$database = "renzipmy_bananaking";

// Membuat koneksi ke database
$conn = new mysqli($host, $username, $password, $database);

// Memeriksa koneksi
if ($conn->connect_error) {
    // Memberikan pesan error yang lebih jelas dan menghentikan eksekusi
    error_log("Koneksi database gagal: " . $conn->connect_error);
    http_response_code(500); // Mengirimkan status kode error 500
    die(json_encode(array("error" => "Koneksi database gagal", "details" => $conn->connect_error)));
}

// Mengatur charset menjadi UTF-8
$conn->set_charset("utf8");
?>