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
                    $conn->close();
                    exit();
                }
            }

            $upload_path = $upload_dir . basename($file_name);
            $gambar_nama_file = basename($file_name);

            if (!move_uploaded_file($file_tmp_name, $upload_path)) {
                $response['message'] = 'Gagal memindahkan file gambar yang diunggah. Periksa izin folder.';
                echo json_encode($response);
                $conn->close();
                exit();
            }
        } else {
            $response['message'] = 'Terjadi kesalahan saat mengunggah file gambar. Kode error: ' . $_FILES['gambar']['error'];
            echo json_encode($response);
            $conn->close();
            exit();
        }
    } else {
        $response['message'] = 'File gambar tidak diterima di server.';
        echo json_encode($response);
        $conn->close();
        exit();
    }

    // Validasi input
    if (empty($nama_item) || $harga <= 0) {
        $response['message'] = 'Nama item dan harga tidak boleh kosong dan harga harus lebih dari 0.';
    } else {
        // Menggunakan prepared statement untuk keamanan
        $sql = "INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES (?, ?, ?, ?)";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ssds", $nama_item, $deskripsi, $harga, $gambar_nama_file);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Item menu berhasil ditambahkan.';
                $response['id'] = $conn->insert_id;
            } else {
                $response['message'] = 'Error: ' . $stmt->error;
            }

            $stmt->close();
        } else {
            $response['message'] = 'Error: ' . $conn->error;
        }
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn->close();
?>