<?php
// add_menu.php

header('Content-Type: application/json');
include 'db_config.php';

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_item = trim($_POST['nama_item'] ?? '');
    $deskripsi = trim($_POST['deskripsi'] ?? '');
    $harga = floatval($_POST['harga'] ?? 0);
    $gambar_nama_file = '';

    // Tangani unggahan file gambar
    if (isset($_FILES['gambar'])) {
        if ($_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
            $file_tmp_name = $_FILES['gambar']['tmp_name'];
            $file_name = $_FILES['gambar']['name'];
            $upload_dir = __DIR__ . '/Gambar/';

            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    $response['message'] = 'Gagal membuat direktori Gambar. Periksa izin folder.';
                    echo json_encode($response);
                    $conn = null;
                    exit();
                }
            }

            $upload_path = $upload_dir . basename($file_name);
            $gambar_nama_file = basename($file_name);

            if (!move_uploaded_file($file_tmp_name, $upload_path)) {
                $response['message'] = 'Gagal memindahkan file gambar yang diunggah. Periksa izin folder.';
                echo json_encode($response);
                $conn = null;
                exit();
            }
        } else {
            $response['message'] = 'Terjadi kesalahan saat mengunggah file gambar. Kode error: ' . $_FILES['gambar']['error'];
            echo json_encode($response);
            $conn = null;
            exit();
        }
    } else {
        $response['message'] = 'File gambar tidak diterima di server.';
        echo json_encode($response);
        $conn = null;
        exit();
    }

    // Validasi input
    if (empty($nama_item) || $harga <= 0) {
        $response['message'] = 'Nama item dan harga tidak boleh kosong dan harga harus lebih dari 0.';
    } else {
        try {
            $sql = "INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            
            if ($stmt->execute([$nama_item, $deskripsi, $harga, $gambar_nama_file])) {
                $response['success'] = true;
                $response['message'] = 'Item menu berhasil ditambahkan.';
                $response['id'] = $conn->lastInsertId();
            } else {
                $response['message'] = 'Gagal menyimpan ke database.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error: ' . $e->getMessage();
        }
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn = null;
?>