<?php
// get_menu.php

header('Content-Type: application/json'); // Mengatur header untuk respons JSON
include 'db_config.php'; // Memasukkan file konfigurasi database

try {
    $sql = "SELECT id, nama_item, deskripsi, harga, gambar FROM menu_items ORDER BY id ASC";
    $stmt = $conn->query($sql);
    
    $menu_items = array();
    
    if ($stmt) {
        while($row = $stmt->fetch()) {
            $menu_items[] = $row;
        }
    }
    
    echo json_encode($menu_items);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Query gagal", "details" => $e->getMessage()));
}

// Menutup koneksi database (opsional di PDO)
$conn = null; 
?>