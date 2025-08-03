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
                        showEditForm(id);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Gagal memuat item menu:', error);
        menuItemsContainer.innerHTML = '<p>Maaf, gagal memuat menu. Silakan coba lagi nanti.</p>';
    }
}

async function showEditForm(id) {
    try {
        // Ambil data item berdasarkan ID
        const response = await fetch(`get_menu_item.php?id=${id}`);
        const item = await response.json();
        
        if (item) {
            // Sembunyikan form tambah, tampilkan form edit
            document.getElementById('add-form').style.display = 'none';
            document.getElementById('edit-form').style.display = 'block';

            // Isi form edit dengan data yang diambil
            document.getElementById('edit-id-item').value = item.id;
            document.getElementById('edit-nama-item').value = item.nama_item;
            document.getElementById('edit-deskripsi').value = item.deskripsi;
            document.getElementById('edit-harga').value = item.harga;
            document.getElementById('edit-file-name-display').textContent = item.gambar || 'No file chosen';

            const preview = document.getElementById('current-image-preview');
            preview.innerHTML = `<img src="Gambar/${item.gambar}" alt="${item.nama_item}" style="max-width:150px; margin-top: 10px;">`;
        }
    } catch (error) {
        console.error('Gagal mengambil data item untuk diedit:', error);
        alert('Gagal memuat data item untuk diedit.');
    }
}

document.getElementById('btn-cancel-edit').addEventListener('click', function() {
    // Sembunyikan form edit, tampilkan form tambah
    document.getElementById('add-form').style.display = 'block';
    document.getElementById('edit-form').style.display = 'none';
});

// Event listener untuk tombol "Perbarui Menu"
document.getElementById('btn-update-item').addEventListener('click', async function() {
    const id = document.getElementById('edit-id-item').value;
    const namaItem = document.getElementById('edit-nama-item').value;
    const deskripsi = document.getElementById('edit-deskripsi').value;
    const harga = document.getElementById('edit-harga').value;
    const gambarInput = document.getElementById('edit-gambar');

    if (!namaItem || !harga) {
        alert("Nama item dan harga tidak boleh kosong!");
        return;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('nama_item', namaItem);
    formData.append('deskripsi', deskripsi);
    formData.append('harga', parseFloat(harga));

    if (gambarInput.files.length > 0) {
        formData.append('gambar', gambarInput.files[0]);
    }

    try {
        const response = await fetch('update_menu.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('add-form').style.display = 'block';
            loadMenuItems();
        } else {
            alert("Gagal memperbarui item: " + result.message);
        }
    } catch (error) {
        console.error('Error saat memperbarui item menu:', error);
        alert('Terjadi kesalahan saat mencoba memperbarui item menu.');
    }
});


async function deleteMenuItem(id) {
    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
        try {
            const response = await fetch('delete_menu.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                loadMenuItems();
            } else {
                alert("Gagal menghapus item: " + result.message);
            }
        } catch (error) {
            console.error('Error saat menghapus item menu:', error);
            alert('Terjadi kesalahan saat menghapus item.');
        }
    }
}

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
            document.getElementById('add-nama-item').value = '';
            document.getElementById('add-deskripsi').value = '';
            document.getElementById('add-harga').value = '';
            gambarInput.value = '';
            document.getElementById('file-name-display').textContent = 'No file chosen';
            loadMenuItems();
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


document.addEventListener('DOMContentLoaded', function() {
    const kirimWaButton = document.getElementById('kirim-wa');
    if (kirimWaButton) {
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