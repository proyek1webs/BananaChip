/* ===== Supabase Config ===== */
const SUPABASE_URL = 'https://bypenbqchlorpuybmihd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cGVuYnFjaGxvcnB1eWJtaWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDIzMDksImV4cCI6MjA5ODQ3ODMwOX0.CNU8r-6FicLx21rHNSxzBDFx-V_AA2fhSdilT1iYnXQ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===== Helper ===== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const isAdmin = () => localStorage.getItem('isAdmin') === 'true';

/* ===== Load Menu Items ===== */
async function loadMenuItems() {
    const container = $('.menu-items');
    if (!container) return;

    const isHomePage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || document.querySelector('.hero') !== null;

    container.innerHTML = '<p>Loading menu items...</p>';

    const admin = isAdmin();
    const adminPanel = $('.admin-controls');
    const logoutLink = $('#logout-link');

    if (adminPanel) adminPanel.style.display = admin ? 'block' : 'none';
    if (logoutLink) {
        logoutLink.style.display = admin ? 'list-item' : 'none';
        logoutLink.href = '#';
        logoutLink.onclick = () => {
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        };
    }

    try {
        let query = db.from('menu_items').select('*').order('id', { ascending: true });
        
        // Hanya ambil 5 item pertama jika di halaman Home
        if (isHomePage) {
            query = query.limit(5);
        }

        const { data, error } = await query;
        if (error) throw error;

        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Tidak ada item menu yang tersedia.</p>';
            return;
        }

        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('item');
            div.innerHTML = `
                <img src="Gambar/${item.gambar || 'placeholder.png'}" alt="${item.nama_item}" onerror="this.src='https://via.placeholder.com/150'">
                <h3>${item.nama_item}</h3>
                <p>${item.deskripsi}</p>
                ${!isHomePage ? `<p><strong>Harga:</strong> Rp ${parseInt(item.harga).toLocaleString('id-ID')}</p>
                <div class="quantity-control">
                    <button onclick="kurangi(this)">-</button>
                    <input type="number" value="0" min="0" data-nama="${item.nama_item}" data-harga="${item.harga}">
                    <button onclick="tambah(this)">+</button>
                </div>
                <div class="admin-buttons" style="display:${admin ? 'flex' : 'none'};">
                    <button class="btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn-delete" data-id="${item.id}">Delete</button>
                </div>` : ''}`;
            container.appendChild(div);
        });

        if (admin) {
            $$('.btn-delete').forEach(btn =>
                btn.addEventListener('click', () => deleteMenuItem(btn.dataset.id)));
            $$('.btn-edit').forEach(btn =>
                btn.addEventListener('click', () => showEditForm(btn.dataset.id)));
        }
    } catch (err) {
        console.error('Gagal memuat menu:', err);
        container.innerHTML = '<p>Maaf, gagal memuat menu. Pastikan koneksi internet stabil.</p>';
    }
}

/* ===== Show Edit Form ===== */
async function showEditForm(id) {
    try {
        const { data: item, error } = await db
            .from('menu_items').select('*').eq('id', id).single();
        if (error) throw error;
        if (!item) return;

        $('#add-form').style.display = 'none';
        $('#edit-form').style.display = 'block';
        $('#edit-id-item').value = item.id;
        $('#edit-nama-item').value = item.nama_item;
        $('#edit-deskripsi').value = item.deskripsi;
        $('#edit-harga').value = item.harga;
        $('#edit-gambar-text').value = item.gambar || '';

        const preview = $('#current-image-preview');
        if (preview) {
            preview.innerHTML = `<img src="Gambar/${item.gambar}" alt="${item.nama_item}" style="max-width:150px;margin-top:10px;" onerror="this.src='https://via.placeholder.com/150'">`;
        }
    } catch (err) {
        console.error('Gagal memuat data edit:', err);
        alert('Gagal memuat data item.');
    }
}

/* ===== Update Menu Item ===== */
function initUpdateForm() {
    const btn = $('#btn-update-item');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const id = $('#edit-id-item').value;
        const nama = $('#edit-nama-item').value;
        const deskripsi = $('#edit-deskripsi').value;
        const harga = $('#edit-harga').value;
        const gambar = $('#edit-gambar-text').value;

        if (!nama || !harga) return alert('Nama item dan harga tidak boleh kosong!');

        try {
            const { error } = await db.from('menu_items')
                .update({ nama_item: nama, deskripsi, harga: parseFloat(harga), gambar })
                .eq('id', id);
            if (error) throw error;

            alert('Item berhasil diperbarui!');
            $('#edit-form').style.display = 'none';
            $('#add-form').style.display = 'block';
            loadMenuItems();
        } catch (err) {
            console.error('Error update:', err);
            alert('Gagal memperbarui item menu.');
        }
    });
}

/* ===== Cancel Edit ===== */
function initCancelEdit() {
    const btn = $('#btn-cancel-edit');
    if (!btn) return;
    btn.addEventListener('click', () => {
        $('#add-form').style.display = 'block';
        $('#edit-form').style.display = 'none';
    });
}

/* ===== Delete Menu Item ===== */
async function deleteMenuItem(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
        const { error } = await db.from('menu_items').delete().eq('id', id);
        if (error) throw error;
        alert('Item berhasil dihapus!');
        loadMenuItems();
    } catch (err) {
        console.error('Error hapus:', err);
        alert('Gagal menghapus item.');
    }
}

/* ===== Add Menu Item ===== */
function initAddForm() {
    const btn = $('#btn-add-item');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const nama = $('#add-nama-item').value;
        const deskripsi = $('#add-deskripsi').value;
        const harga = $('#add-harga').value;
        const gambar = $('#add-gambar-text').value;

        if (!nama || !harga) return alert('Nama item dan harga tidak boleh kosong!');

        try {
            const { error } = await db.from('menu_items')
                .insert([{ nama_item: nama, deskripsi, harga: parseFloat(harga), gambar: gambar || 'placeholder.png' }]);
            if (error) throw error;

            alert('Menu berhasil ditambahkan!');
            $('#add-nama-item').value = '';
            $('#add-deskripsi').value = '';
            $('#add-harga').value = '';
            $('#add-gambar-text').value = '';
            loadMenuItems();
        } catch (err) {
            console.error('Error tambah:', err);
            alert('Gagal menambah item menu.');
        }
    });
}

/* ===== Quantity Controls ===== */
function tambah(el) {
    const input = el.parentNode.querySelector('input');
    input.value = parseInt(input.value) + 1;
}

function kurangi(el) {
    const input = el.parentNode.querySelector('input');
    if (parseInt(input.value) > 0) input.value = parseInt(input.value) - 1;
}

/* ===== Order via WhatsApp ===== */
function initOrderButton() {
    const btn = $('#pesan-sekarang');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const namaPembeli = ($('#nama-pembeli')?.value || '').trim();
        if (!namaPembeli) return alert('Mohon isi Nama Pembeli terlebih dahulu.');

        const inputs = $$('.menu-items input[type="number"]');
        let pesan = `Halo Banana King%0ASaya ingin memesan:%0A%0ANama: ${encodeURIComponent(namaPembeli)}%0A%0APesanan:%0A`;
        let adaPesanan = false;
        let total = 0;

        inputs.forEach(input => {
            const qty = parseInt(input.value);
            if (qty > 0) {
                adaPesanan = true;
                const nama = input.dataset.nama;
                const harga = parseFloat(input.dataset.harga);
                const subtotal = qty * harga;
                total += subtotal;
                pesan += `- ${nama} (${qty} x Rp ${harga.toLocaleString('id-ID')}) = Rp ${subtotal.toLocaleString('id-ID')}%0A`;
            }
        });

        const note = $('#note')?.value;
        if (note) pesan += `%0ANote: ${encodeURIComponent(note)}`;

        if (adaPesanan) {
            pesan += `%0ATotal Keseluruhan: Rp ${total.toLocaleString('id-ID')}`;
            window.open(`https://wa.me/6285722087434?text=${pesan}`, '_blank');
        } else {
            alert('Silakan pilih minimal 1 produk untuk dipesan.');
        }
    });
}

/* ===== Contact Form (index.html) ===== */
function initContactForm() {
    const btn = $('#kirim-wa');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const nama = $('#nama')?.value;
        const email = $('#email')?.value;
        const pesan = $('#pesan')?.value;

        if (nama && email && pesan) {
            const text = `Halo Banana King%0ASaya ingin memberikan saran.%0ANama: ${encodeURIComponent(nama)}%0AEmail: ${encodeURIComponent(email)}%0APesan: ${encodeURIComponent(pesan)}`;
            window.open(`https://wa.me/6285722087434?text=${text}`, '_blank');
        } else {
            alert('Mohon isi semua kolom sebelum mengirim.');
        }
    });
}

/* ===== Init on DOM Ready ===== */
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    initAddForm();
    initUpdateForm();
    initCancelEdit();
    initOrderButton();
    initContactForm();
});