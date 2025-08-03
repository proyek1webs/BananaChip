<?php
// get_menu_item.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array();

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    $sql = "SELECT id, nama_item, deskripsi, harga, gambar FROM menu_items WHERE id = ?";
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 1) {
            $response = $result->fetch_assoc();
        } else {
            http_response_code(404);
            $response['error'] = 'Item not found';
        }
        $stmt->close();
    } else {
        http_response_code(500);
        $response['error'] = 'Database query failed';
    }
} else {
    http_response_code(400);
    $response['error'] = 'Invalid request, ID is required';
}

echo json_encode($response);
$conn->close();
?>