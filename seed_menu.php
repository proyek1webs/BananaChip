<?php
// seed_menu.php

header('Content-Type: text/plain'); // Mengatur header untuk respons teks biasa
include 'db_config.php'; // Memasukkan file konfigurasi database

echo "Memulai proses seeding menu...\n";

// Array data menu yang akan di-seed
// Data ini sesuai dengan menu Best Seller Anda
$menu_data = [
    ['Original', 'Keripik pisang dengan rasa klasik yang renyah dan gurih.', 15000, 'banana original.png'],
    ['Chocolate', 'Perpaduan pisang renyah dengan cokelat premium yang menggoda.', 15000, 'coklat.png'],
    ['Matcha', 'Pisang renyah dengan aroma matcha yang menyegarkan.', 15000, 'Matcha.png'],
    ['Balado', 'Sensasi pedas manis khas balado yang unik.', 15000, 'balado.png'],
    ['Redvelvet', 'Pisang renyah dengan rasa redvelvet yang lembut.', 15000, 'redvelvet.png'],
    ['Barbecue', 'Rasa barbeku yang gurih dan lezat.', 15000, 'barbeque.png'],
    ['Greentea', 'Pisang crispy dengan sentuhan rasa greentea.', 15000, 'greentea.png'],
    ['Strawberry', 'Perpaduan strawberry yang lembut dan manis.', 15000, 'strawberry.png'],
    ['Tiramisu', 'Perpaduan pisang crispy dengan aroma tiramisu yang nikmat.', 15000, 'Tiramishu.png'],
    ['Vanilla', 'Pisang crispy dengan aroma vanilla yang lembut.', 15000, 'Vanila.png']
];

$stmt = $conn->prepare("INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES (?, ?, ?, ?)");

$seeded_count = 0;
foreach ($menu_data as $item) {
    $nama_item = $item[0];
    $deskripsi = $item[1];
    $harga = $item[2];
    $gambar = $item[3];

    $stmt->bind_param("ssds", $nama_item, $deskripsi, $harga, $gambar);

    if ($stmt->execute()) {
        echo "Berhasil menambahkan: " . $nama_item . "\n";
        $seeded_count++;
    } else {
        echo "Gagal menambahkan " . $nama_item . ": " . $stmt->error . "\n";
    }
}

$stmt->close();

echo "\nProses seeding selesai. " . $seeded_count . " item berhasil ditambahkan.\n";

$conn->close();
?>