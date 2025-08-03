<?php
// get_menu.php

header('Content-Type: application/json'); // Mengatur header untuk respons JSON
include 'db_config.php'; // Memasukkan file konfigurasi database

// Memeriksa koneksi yang telah dibuat di db_config.php
if ($conn->connect_error) {
    // Logika ini akan terpicu jika db_config.php gagal
    die(json_encode(array("error" => "Koneksi database gagal")));
}

$sql = "SELECT id, nama_item, deskripsi, harga, gambar FROM menu_items ORDER BY id ASC";
$result = $conn->query($sql);

$menu_items = array();

// Pastikan query berhasil dan ada hasil
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $menu_items[] = $row;
    }
} else if (!$result) {
    // Jika query gagal, kirimkan error
    http_response_code(500);
    die(json_encode(array("error" => "Query gagal", "details" => $conn->error)));
}

echo json_encode($menu_items); // Mengembalikan data dalam format JSON

$conn->close(); // Menutup koneksi database
?>