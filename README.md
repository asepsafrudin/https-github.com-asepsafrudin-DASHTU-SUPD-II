# DASHTU SUPD II (Dashboard Tata Usaha Terpadu SUPD II)

> **Catatan Arsitektur Baru**: Repositori ini sedang bertransisi dari aplikasi tunggal **Streamlit** menuju arsitektur modern menggunakan **React + Vite** (Frontend) dan **FastAPI** (Backend). 
> Kode Streamlit versi purwarupa sebelumnya telah dipindahkan ke dalam folder `legacy/`.
> Panduan di bawah ini mungkin sebagian besar masih merujuk pada versi Streamlit. Untuk menjalankan versi baru, gunakan `npm run dev` untuk frontend, dan `uvicorn api.main:app --reload` untuk backend.

Prototipe aplikasi web interaktif untuk manajemen dokumen, kegiatan, laporan, dan tindak lanjut di lingkungan SUPD II.

## Prasyarat
- Python 3.10 atau lebih baru.
- Pip (Python Package Installer).

## Langkah Instalasi & Persiapan

1. **Persiapkan Folder**
   Pastikan Anda berada di direktori proyek `DASHTU-SUPD-II`.
   
   ```bash
   cd path/to/project_folder
   ```

2. **Instalasi Dependensi**
   Instal dependensi untuk frontend (React) dan backend (FastAPI):
   
   ```bash
   # Frontend
   npm install

   # Backend
   pip install -r requirements.txt
   ```

3. **Inisialisasi & Seeding Data**
   Jalankan script untuk mengisi database SQLite bawaan:
   ```bash
   python seed_data.py
   ```

4. **Konfigurasi Environment**
   Buat file `.env` dengan menyalin template dari `.env.example`. Pastikan untuk mengonfigurasi rahasia JWT untuk keamanan API:
   ```env
   # JWT Configuration
   JWT_SECRET_KEY="generate_secret_key_anda"
   JWT_ALGORITHM="HS256"

   # Supabase Sync (Opsional)
   SUPABASE_URL="..."
   ```

5. **Menjalankan Aplikasi**
   Jalankan backend dan frontend secara terpisah:
   
   ```bash
   # Terminal 1: Backend
   bash start_api.sh
   # atau: uvicorn api.main:app --reload
   
   # Terminal 2: Frontend
   npm run dev
   ```
   
   Frontend akan berjalan di `http://localhost:3000` atau `http://localhost:5173`.

## Panduan Pengujian (Login)
Database akan otomatis terisi dengan 5 akun default untuk diuji coba. Gunakan email dan password berikut untuk login berdasarkan role yang diinginkan:

- **Admin (Akses Penuh):**
  - Email: `admin@supd2.id`
  - Password: `admin123`

- **Operator 1 (Modul Surat & Arsip):**
  - Email: `op1@supd2.id`
  - Password: `op123`

- **Operator 2 (Modul Paparan, Laporan & Tindak Lanjut):**
  - Email: `op2@supd2.id`
  - Password: `op234`

- **Viewer (Hanya Lihat Arsip & Agenda):**
  - Email: `viewer@supd2.id`
  - Password: `viewer123`

## Struktur Direktori
- `api/main.py`: File utama backend FastAPI.
- `src/`: Direktori utama frontend React (Pages, Components).
- `api/sync_supabase.py`: Skrip untuk sinkronisasi SQLite ke Supabase.
- `seed_data.py`: Skrip untuk memasukkan data simulasi (seeding).
- `requirements.txt` & `package.json`: Daftar pustaka Python dan Node.js.
- `uploads/`: Direktori penyimpanan file lokal.
- `dashtu_supd2.db`: File database SQLite lokal.
- `docs/`: Direktori dokumentasi proyek (Source of Truth untuk AI Agent).
