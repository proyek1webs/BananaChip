<?php
// update_menu.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mengambil data dari $_POST dan $_FILES
    $id = intval($_POST['id'] ?? 0);
    $nama_item = trim($_POST['nama_item'] ?? '');
    $deskripsi = trim($_POST['deskripsi'] ?? '');
    $harga = floatval($_POST['harga'] ?? 0);
    $gambar_nama_file = '';

    // Validasi input
    if ($id <= 0 || empty($nama_item) || $harga <= 0) {
        $response['message'] = 'ID, nama item, dan harga tidak boleh kosong, dan harga harus lebih dari 0.';
        echo json_encode($response);
        $conn = null;
        exit();
    }

    try {
        // Dapatkan nama gambar lama untuk kasus update tanpa unggah gambar baru
        $sql_old_image = "SELECT gambar FROM menu_items WHERE id = ?";
        $stmt_old_image = $conn->prepare($sql_old_image);
        $stmt_old_image->execute([$id]);
        $old_image_row = $stmt_old_image->fetch();
        $old_gambar_nama_file = $old_image_row['gambar'] ?? '';
        
        // Tangani unggahan file baru (jika ada)
        if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
            $file_tmp_name = $_FILES['gambar']['tmp_name'];
            $file_name = $_FILES['gambar']['name'];
            $upload_dir = __DIR__ . '/Gambar/';

            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $upload_path = $upload_dir . basename($file_name);
            $gambar_nama_file = basename($file_name);

            if (!move_uploaded_file($file_tmp_name, $upload_path)) {
                $response['message'] = 'Gagal memindahkan file gambar baru yang diunggah.';
                echo json_encode($response);
                $conn = null;
                exit();
            }

            if ($old_gambar_nama_file && file_exists($upload_dir . $old_gambar_nama_file)) {
                unlink($upload_dir . $old_gambar_nama_file);
            }

        } else {
            $gambar_nama_file = $old_gambar_nama_file;
        }

        // Perbarui item di database
        $sql_update = "UPDATE menu_items SET nama_item = ?, deskripsi = ?, harga = ?, gambar = ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);

        if ($stmt_update->execute([$nama_item, $deskripsi, $harga, $gambar_nama_file, $id])) {
            $response['success'] = true;
            $response['message'] = 'Item menu berhasil diperbarui.';
        } else {
            $response['message'] = 'Gagal memperbarui database.';
        }
    } catch (PDOException $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn = null;
?>