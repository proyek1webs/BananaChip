<?php
// delete_menu.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);

    if ($id > 0) {
        // Hapus file gambar dari server sebelum menghapus data dari database
        $sql_select_gambar = "SELECT gambar FROM menu_items WHERE id = ?";
        if ($stmt_select = $conn->prepare($sql_select_gambar)) {
            $stmt_select->bind_param("i", $id);
            $stmt_select->execute();
            $result = $stmt_select->get_result();
            if ($row = $result->fetch_assoc()) {
                $gambar_nama_file = $row['gambar'];
                if (!empty($gambar_nama_file) && file_exists("Gambar/" . $gambar_nama_file)) {
                    unlink("Gambar/" . $gambar_nama_file);
                }
            }
            $stmt_select->close();
        }

        // Hapus item dari database
        $sql_delete = "DELETE FROM menu_items WHERE id = ?";
        if ($stmt_delete = $conn->prepare($sql_delete)) {
            $stmt_delete->bind_param("i", $id);

            if ($stmt_delete->execute()) {
                $response['success'] = true;
                $response['message'] = 'Item menu berhasil dihapus.';
            } else {
                $response['message'] = 'Error: ' . $stmt_delete->error;
            }
            $stmt_delete->close();
        } else {
            $response['message'] = 'Error: ' . $conn->error;
        }
    } else {
        $response['message'] = 'ID item tidak valid.';
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn->close();
?>