-- ============================================
-- Banana King Chips - Supabase Database Schema
-- Database: Bananaking_db (recreated for Supabase/PostgreSQL)
-- ============================================

-- ============================================
-- 1. TABEL USERS (untuk login admin)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TABEL MENU_ITEMS (untuk CRUD menu)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    nama_item VARCHAR(100) NOT NULL,
    deskripsi TEXT DEFAULT '',
    harga DECIMAL(10, 2) NOT NULL DEFAULT 0,
    gambar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. SEED DATA - Admin User
-- Password: admin123 (hashed dengan bcrypt)
-- Kamu bisa ganti password ini nanti via PHP password_hash()
-- ============================================
INSERT INTO users (username, password) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- NOTE: password di atas = "password" (default Laravel bcrypt)
-- Ganti dengan hash dari password yang kamu mau pakai.
-- Untuk generate hash baru, jalankan di PHP:
--   echo password_hash('admin123', PASSWORD_DEFAULT);

-- ============================================
-- 4. SEED DATA - Menu Items (5 varian keripik)
-- ============================================
INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES
('Original',   'Keripik pisang dengan rasa klasik yang renyah dan gurih.',                15000, 'banana original.png'),
('Chocolate',  'Perpaduan pisang renyah dengan cokelat premium yang menggoda.',           20000, 'coklat.png'),
('Tiramishu',  'Perpaduan pisang crispy dengan aroma tiramishu yang nikmat.',              20000, 'Tiramishu.png'),
('Vanilla',    'Pisang crispy dengan aroma vanilla yang lembut.',                          18000, 'Vanila.png'),
('Matcha',     'Pisang renyah dengan aroma matcha yang menyegarkan.',                      20000, 'Matcha.png');

-- ============================================
-- 5. (OPSIONAL) Enable Row Level Security (RLS)
--    Untuk keamanan di Supabase
-- ============================================

-- Aktifkan RLS pada tabel menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa READ (public menu)
CREATE POLICY "Menu items bisa dilihat semua orang"
ON menu_items FOR SELECT
USING (true);

-- Policy: Hanya authenticated users bisa INSERT/UPDATE/DELETE
CREATE POLICY "Hanya authenticated bisa insert menu"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Hanya authenticated bisa update menu"
ON menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Hanya authenticated bisa delete menu"
ON menu_items FOR DELETE
TO authenticated
USING (true);

-- Aktifkan RLS pada tabel users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya authenticated bisa akses tabel users
CREATE POLICY "Users hanya bisa diakses authenticated"
ON users FOR SELECT
TO authenticated
USING (true);
