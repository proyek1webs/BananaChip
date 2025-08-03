// Fungsi untuk memuat item menu dari database
async function loadMenuItems() {
    const menuItemsContainer = document.querySelector('.menu-items');
    menuItemsContainer.innerHTML = 'Loading menu items...';

    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    const adminControls = document.querySelector('.admin-controls');
    if (adminControls) {
        adminControls.style.display = isAdmin ? 'block' : 'none';
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.style.display = isAdmin ? 'list-item' : 'none';
    }

    try {
        const response = await fetch('get_menu.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const menuItems = await response.json();

        menuItemsContainer.innerHTML = '';

        if (menuItems.length === 0) {
            menuItemsContainer.innerHTML = '<p>Tidak ada item menu yang tersedia.</p>';
        } else {
            menuItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');
                itemDiv.innerHTML = `
                    <img src="Gambar/${item.gambar || 'placeholder.png'}" alt="${item.nama_item}">
                    <h3>${item.nama_item}</h3>
                    <p>${item.deskripsi}</p>
                    <p><strong>Harga:</strong> Rp ${parseInt(item.harga).toLocaleString('id-ID')}</p>
                    <div class="quantity-control">
                        <button onclick="kurangi(this)">-</button>
                        <input type="number" value="0" min="0" data-nama="${item.nama_item}" data-harga="${item.harga}">
                        <button onclick="tambah(this)">+</button>
                    </div>
                    <div class="admin-buttons" style="display:${isAdmin ? 'block' : 'none'};">
                        <button class="btn-edit" data-id="${item.id}">Edit</button>
                        <button class="btn-delete" data-id="${item.id}">Delete</button>
                    </div>
                `;
                menuItemsContainer.appendChild(itemDiv);
            });
            
            if (isAdmin) {
                document.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        deleteMenuItem(id);
                    });
                });
                document.querySelectorAll('.btn-edit').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        // Logika edit akan muncul di sini (misalnya: menampilkan form edit)
                        alert(`Fitur edit untuk ID: ${id} akan segera ditambahkan.`);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Gagal memuat item menu:', error);
        menuItemsContainer.innerHTML = '<p>Maaf, gagal memuat menu. Silakan coba lagi nanti.</p>';
    }
}

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadMenuItems);


// Fungsi untuk menambah item menu baru
document.getElementById('btn-add-item').addEventListener('click', async function() {
    const namaItem = document.getElementById('add-nama-item').value;
    const deskripsi = document.getElementById('add-deskripsi').value;
    const harga = document.getElementById('add-harga').value;
    const gambarInput = document.getElementById('add-gambar');
    
    if (!gambarInput.files.length) {
        alert("Mohon pilih file gambar.");
        return;
    }

    if (!namaItem || !harga) {
        alert("Nama item dan harga tidak boleh kosong!");
        return;
    }

    const formData = new FormData();
    formData.append('nama_item', namaItem);
    formData.append('deskripsi', deskripsi);
    formData.append('harga', parseFloat(harga));
    formData.append('gambar', gambarInput.files[0]);

    try {
        const response = await fetch('add_menu.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            // Bersihkan form
            document.getElementById('add-nama-item').value = '';
            document.getElementById('add-deskripsi').value = '';
            document.getElementById('add-harga').value = '';
            gambarInput.value = '';
            document.getElementById('file-name-display').textContent = 'No file chosen';
            loadMenuItems(); // Muat ulang menu setelah penambahan
        } else {
            alert("Gagal menambah item: " + result.message);
        }
    } catch (error) {
        console.error('Error saat menambah item menu:', error);
        alert('Terjadi kesalahan saat mencoba menambah item menu.');
    }
});


// Fungsi tambah dan kurangi yang sudah ada dari menu.html asli
function tambah(el){
    var input = el.parentNode.querySelector('input');
    input.value = parseInt(input.value) + 1;
}

function kurangi(el){
    var input = el.parentNode.querySelector('input');
    if(parseInt(input.value) > 0){
        input.value = parseInt(input.value) - 1;
    }
}

document.getElementById('pesan-sekarang').addEventListener('click', function(){
    var inputs = document.querySelectorAll('.menu-items input');
    var pesan = "Halo Banana King%0ASaya ingin memesan:%0A";
    var adaPesanan = false;
    var totalHargaKeseluruhan = 0;

    inputs.forEach(function(input){
        var jumlah = parseInt(input.value);
        if(jumlah > 0){
            adaPesanan = true;
            var nama = input.getAttribute('data-nama');
            var harga = parseFloat(input.getAttribute('data-harga'));
            var total = jumlah * harga;
            totalHargaKeseluruhan += total;
            pesan += "- " + nama + " (" + jumlah + " x Rp " + harga.toLocaleString('id-ID') + ") = Rp " + total.toLocaleString('id-ID') + "%0A";
        }
    });

    var note = document.getElementById('note').value;
    if(note){
        pesan += "%0ANote: " + encodeURIComponent(note);
    }

    if(adaPesanan){
        pesan += "%0ATotal Keseluruhan: Rp " + totalHargaKeseluruhan.toLocaleString('id-ID');
        window.open('https://wa.me/6282122339125?text=' + pesan, '_blank');
    } else {
        alert("Silakan pilih minimal 1 produk untuk dipesan.");
    }
});


// Kode untuk form kontak di index.html (jika ada, sesuaikan)
document.addEventListener('DOMContentLoaded', function() {
    const kirimWaButton = document.getElementById('kirim-wa');
    if (kirimWaButton) { // Pastikan tombol ada (hanya di index.html)
        kirimWaButton.addEventListener('click', function() {
            var nama = document.getElementById('nama').value;
            var email = document.getElementById('email').value;
            var pesan = document.getElementById('pesan').value;

            if(nama && email && pesan){
                var text = "Halo Banana King%0ASaya ingin memberikan saran.%0ANama: " + encodeURIComponent(nama) + "%0AEmail: " + encodeURIComponent(email) + "%0APesan: " + encodeURIComponent(pesan);
                window.open('https://wa.me/6281234567890?text=' + text, '_blank');
            } else {
                alert("Mohon isi semua kolom sebelum mengirim.");
            }
        });
    }
});