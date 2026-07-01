<?php
// delete_menu.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);

    if ($id > 0) {
        try {
            // Hapus file gambar dari server sebelum menghapus data dari database
            $sql_select_gambar = "SELECT gambar FROM menu_items WHERE id = ?";
            $stmt_select = $conn->prepare($sql_select_gambar);
            $stmt_select->execute([$id]);
            $row = $stmt_select->fetch();
            
            if ($row) {
                $gambar_nama_file = $row['gambar'];
                if (!empty($gambar_nama_file) && file_exists("Gambar/" . $gambar_nama_file)) {
                    unlink("Gambar/" . $gambar_nama_file);
                }
            }

            // Hapus item dari database
            $sql_delete = "DELETE FROM menu_items WHERE id = ?";
            $stmt_delete = $conn->prepare($sql_delete);
            
            if ($stmt_delete->execute([$id])) {
                $response['success'] = true;
                $response['message'] = 'Item menu berhasil dihapus.';
            } else {
                $response['message'] = 'Gagal menghapus dari database.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error: ' . $e->getMessage();
        }
    } else {
        $response['message'] = 'ID item tidak valid.';
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn = null;
?>