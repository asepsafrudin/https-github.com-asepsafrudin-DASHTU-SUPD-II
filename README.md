# DASHTU SUPD II (Dashboard Tata Usaha Terpadu SUPD II)

Prototipe aplikasi web interaktif menggunakan Python dan Streamlit untuk manajemen dokumen, kegiatan, laporan, dan tindak lanjut di lingkungan SUPD II.

## Prasyarat
- Python 3.10 atau lebih baru.
- Pip (Python Package Installer).

## Langkah Instalasi & Persiapan

1. **Persiapkan Folder**
   Pastikan Anda berada di direktori proyek yang berisi file `app.py`, `seed_data.py`, dan `requirements.txt`.
   
   ```bash
   cd path/to/project_folder
   ```

2. **Instalasi Dependensi**
   Jalankan perintah berikut untuk menginstal semua library Python yang dibutuhkan (seperti Streamlit dan Pandas):
   
   ```bash
   pip install -r requirements.txt
   ```

3. **Inisialisasi & Seeding Data (Mock Data)**
   Sebelum menjalankan aplikasi utama, jalankan skrip seeding data untuk mengisi database `dashtu_supd2.db` dengan data simulasi (surat, kegiatan, laporan, agenda, tindak lanjut). Hal ini penting agar dashboard dapat menampilkan visualisasi grafik dan metrik saat pertama kali dibuka.
   
   ```bash
   python seed_data.py
   ```

4. **Menjalankan Aplikasi**
   Setelah data berhasil dimasukkan, jalankan aplikasi Streamlit dengan perintah:
   
   ```bash
   streamlit run app.py
   ```
   
   Perintah ini akan membuka tab browser baru dengan URL lokal (biasanya `http://localhost:8501`).

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
- `app.py`: File utama aplikasi Streamlit (mencakup UI, logika, dan autentikasi).
- `seed_data.py`: Skrip untuk memasukkan data simulasi (seeding).
- `requirements.txt`: Daftar pustaka yang dibutuhkan.
- `uploads/`: Direktori yang dibuat otomatis untuk menyimpan file yang diunggah (surat, paparan, dll).
- `dashtu_supd2.db`: File database SQLite lokal (terbuat secara otomatis).
