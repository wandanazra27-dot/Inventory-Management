# 🔍 Sistem Pencarian Barang & Penunjuk Lokasi Rak Gudang (Search & Locate)

Branch ini khusus didedikasikan untuk **Modul Pencarian Barang** (*Smart Item Locator*) yang dilengkapi dengan fitur pencarian teks, pemindaian visual gambar berbasis Google Gemini AI Vision, riwayat pencarian harian, serta penunjuk denah lokasi rak gudang secara interaktif.

---

## 🌟 Fitur Utama

1. **Pencarian Teks Cerdas (Text Search)**:
   - Pencarian berdasarkan nama barang, kode SKU, spesifikasi, atau kategori.
   - Hasil pencarian menampilkan informasi stok, kategori, foto produk, dan posisi rak secara instan.

2. **Pemindaian Visual AI (Image & Camera Scan)**:
   - Dukungan upload gambar atau pemotretan langsung via kamera perangkat.
   - Menggunakan AI Vision untuk mengenali produk dan mencocokkannya ke database inventaris secara otomatis.

3. **Peta & Penunjuk Lokasi Rak (Interactive Warehouse Locator)**:
   - Memvisualisasikan posisi rak barang di denah gudang (*grid mapping*).
   - Menyorot (*highlight*) lokasi rak barang yang sedang dicari agar mempermudah tim gudang menemukan fisik barang dengan cepat.

4. **Riwayat & Log Pencarian (Search History & Analytics)**:
   - Menyimpan riwayat pencarian teks dan pemindaian visual.
   - Menampilkan metrik frekuensi pencarian barang harian.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Backend (NestJS)
```bash
cd backend
npm install
npm run dev
# Backend berjalan di http://localhost:3000
```

### 2. Menjalankan Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## 📁 Struktur Khusus Modul Pencarian
- `frontend/src/pages/SearchLocate.tsx`: Antarmuka utama pencarian teks & kamera/visual scan.
- `frontend/src/pages/ReportsLogs.tsx`: Riwayat pencarian teks dan visual harian.
- `frontend/src/components/WarehouseMap.tsx`: Komponen denah visualisasi posisi rak barang.
- `backend/src/search/`: Layanan query pencarian barang & pencocokan lokasi rak.
- `backend/src/scan/`: Layanan pemindaian visual gambar berbasis AI Vision.
- `backend/src/riwayat-pencarian/`: Modul penyimpanan data riwayat pencarian.
