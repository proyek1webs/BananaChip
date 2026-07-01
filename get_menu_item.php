<?php
// get_menu_item.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array();

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    try {
        $sql = "SELECT id, nama_item, deskripsi, harga, gambar FROM menu_items WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        
        $result = $stmt->fetch();
        
        if ($result) {
            $response = $result;
        } else {
            http_response_code(404);
            $response['error'] = 'Item not found';
        }
    } catch (PDOException $e) {
        http_response_code(500);
        $response['error'] = 'Database query failed';
    }
} else {
    http_response_code(400);
    $response['error'] = 'Invalid request, ID is required';
}

echo json_encode($response);
$conn = null;
?>