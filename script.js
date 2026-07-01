// Inisialisasi Supabase
const supabaseUrl = 'https://bypenbqchlorpuybmihd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cGVuYnFjaGxvcnB1eWJtaWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDIzMDksImV4cCI6MjA5ODQ3ODMwOX0.CNU8r-6FicLx21rHNSxzBDFx-V_AA2fhSdilT1iYnXQ';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fungsi untuk mengecek status admin (apakah sudah login di localStorage)
function checkAdminStatus() {
    return localStorage.getItem('isAdmin') === 'true';
}

// Fungsi untuk memuat item menu dari database Supabase
async function loadMenuItems() {
    const menuItemsContainer = document.querySelector('.menu-items');
    if(menuItemsContainer) menuItemsContainer.innerHTML = 'Loading menu items...';

    const isAdmin = checkAdminStatus();

    const adminControls = document.querySelector('.admin-controls');
    if (adminControls) {
        adminControls.style.display = isAdmin ? 'block' : 'none';
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.style.display = isAdmin ? 'list-item' : 'none';
        logoutLink.href = "#";
        logoutLink.onclick = function() {
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        };
    }

    try {
        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if(menuItemsContainer) menuItemsContainer.innerHTML = '';

        if (!menuItems || menuItems.length === 0) {
            if(menuItemsContainer) menuItemsContainer.innerHTML = '<p>Tidak ada item menu yang tersedia.</p>';
        } else {
            menuItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');
                itemDiv.innerHTML = `
                    <img src="Gambar/${item.gambar || 'placeholder.png'}" alt="${item.nama_item}" onerror="this.src='https://via.placeholder.com/150'">
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
                if(menuItemsContainer) menuItemsContainer.appendChild(itemDiv);
            });
            
            if (isAdmin && menuItemsContainer) {
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
        if(menuItemsContainer) menuItemsContainer.innerHTML = '<p>Maaf, gagal memuat menu. Pastikan koneksi internet stabil.</p>';
    }
}

async function showEditForm(id) {
    try {
        const { data: item, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (item) {
            const addForm = document.getElementById('add-form');
            const editForm = document.getElementById('edit-form');
            if(addForm) addForm.style.display = 'none';
            if(editForm) editForm.style.display = 'block';

            document.getElementById('edit-id-item').value = item.id;
            document.getElementById('edit-nama-item').value = item.nama_item;
            document.getElementById('edit-deskripsi').value = item.deskripsi;
            document.getElementById('edit-harga').value = item.harga;
            
            // Kita ubah input gambar jadi text saja untuk kemudahan tanpa backend
            document.getElementById('edit-gambar-text').value = item.gambar || '';

            const preview = document.getElementById('current-image-preview');
            if(preview) preview.innerHTML = `<img src="Gambar/${item.gambar}" alt="${item.nama_item}" style="max-width:150px; margin-top: 10px;" onerror="this.src='https://via.placeholder.com/150'">`;
        }
    } catch (error) {
        console.error('Gagal mengambil data item untuk diedit:', error);
        alert('Gagal memuat data item untuk diedit.');
    }
}

const btnCancelEdit = document.getElementById('btn-cancel-edit');
if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', function() {
        document.getElementById('add-form').style.display = 'block';
        document.getElementById('edit-form').style.display = 'none';
    });
}

const btnUpdateItem = document.getElementById('btn-update-item');
if (btnUpdateItem) {
    btnUpdateItem.addEventListener('click', async function() {
        const id = document.getElementById('edit-id-item').value;
        const namaItem = document.getElementById('edit-nama-item').value;
        const deskripsi = document.getElementById('edit-deskripsi').value;
        const harga = document.getElementById('edit-harga').value;
        const gambar = document.getElementById('edit-gambar-text').value;

        if (!namaItem || !harga) {
            alert("Nama item dan harga tidak boleh kosong!");
            return;
        }

        try {
            const { error } = await supabase
                .from('menu_items')
                .update({ 
                    nama_item: namaItem, 
                    deskripsi: deskripsi, 
                    harga: parseFloat(harga), 
                    gambar: gambar 
                })
                .eq('id', id);

            if (error) throw error;

            alert("Item berhasil diperbarui!");
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('add-form').style.display = 'block';
            loadMenuItems();
        } catch (error) {
            console.error('Error saat memperbarui item menu:', error);
            alert('Terjadi kesalahan saat mencoba memperbarui item menu.');
        }
    });
}

async function deleteMenuItem(id) {
    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert("Item berhasil dihapus!");
            loadMenuItems();
        } catch (error) {
            console.error('Error saat menghapus item menu:', error);
            alert('Terjadi kesalahan saat menghapus item.');
        }
    }
}

const btnAddItem = document.getElementById('btn-add-item');
if (btnAddItem) {
    btnAddItem.addEventListener('click', async function() {
        const namaItem = document.getElementById('add-nama-item').value;
        const deskripsi = document.getElementById('add-deskripsi').value;
        const harga = document.getElementById('add-harga').value;
        const gambar = document.getElementById('add-gambar-text').value;

        if (!namaItem || !harga) {
            alert("Nama item dan harga tidak boleh kosong!");
            return;
        }

        try {
            const { error } = await supabase
                .from('menu_items')
                .insert([{ 
                    nama_item: namaItem, 
                    deskripsi: deskripsi, 
                    harga: parseFloat(harga), 
                    gambar: gambar || 'placeholder.png'
                }]);

            if (error) throw error;

            alert("Menu berhasil ditambahkan!");
            document.getElementById('add-nama-item').value = '';
            document.getElementById('add-deskripsi').value = '';
            document.getElementById('add-harga').value = '';
            document.getElementById('add-gambar-text').value = '';
            loadMenuItems();
        } catch (error) {
            console.error('Error saat menambah item menu:', error);
            alert('Terjadi kesalahan saat mencoba menambah item menu.');
        }
    });
}

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

const pesanSekarangBtn = document.getElementById('pesan-sekarang');
if (pesanSekarangBtn) {
    pesanSekarangBtn.addEventListener('click', function(){
        var inputs = document.querySelectorAll('.menu-items input[type="number"]');
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
            window.open('https://wa.me/6285722087434?text=' + pesan, '_blank');
        } else {
            alert("Silakan pilih minimal 1 produk untuk dipesan.");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();

    const kirimWaButton = document.getElementById('kirim-wa');
    if (kirimWaButton) {
        kirimWaButton.addEventListener('click', function() {
            var nama = document.getElementById('nama').value;
            var email = document.getElementById('email').value;
            var pesan = document.getElementById('pesan').value;

            if(nama && email && pesan){
                var text = "Halo Banana King%0ASaya ingin memberikan saran.%0ANama: " + encodeURIComponent(nama) + "%0AEmail: " + encodeURIComponent(email) + "%0APesan: " + encodeURIComponent(pesan);
                window.open('https://wa.me/6285722087434?text=' + text, '_blank');
            } else {
                alert("Mohon isi semua kolom sebelum mengirim.");
            }
        });
    }
});