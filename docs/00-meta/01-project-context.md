# DASHTU-SUPD-II: Project Context & Meta-Information

> **Tiered Source of Truth**: Dokumen ini merupakan referensi tertinggi (Tier 2 setelah LTM Agent) bagi seluruh AI Agent yang beroperasi di repositori ini. 
> Semua agen **WAJIB** membaca dokumen ini sebelum melakukan refaktorisasi besar atau penambahan arsitektur baru.

---

## 1. Asal Usul & Latar Belakang (Origin)
**DASHTU-SUPD-II** (Dashboard Tata Usaha Terpadu SUPD II) awalnya dibangun sebagai sebuah *prototype* (purwarupa) menggunakan framework **Streamlit** (Python). Tujuannya adalah mendigitalisasi proses tata usaha, manajemen persuratan, pengarsipan, hingga pemantauan tindak lanjut laporan di lingkungan Subdirektorat (SUPD II).

Seiring dengan berkembangnya kebutuhan interaktivitas UI dan skalabilitas performa, proyek ini telah **bermigrasi** menjadi aplikasi *Full-Stack* yang menggunakan:
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
- **Backend**: FastAPI (Python).

Kode lama versi Streamlit masih disimpan di dalam folder `legacy/` untuk keperluan referensi jika dibutuhkan (tidak digunakan di *production*).

## 2. Tujuan & Fungsi Utama Aplikasi
Aplikasi ini ditujukan untuk memusatkan informasi dan administrasi (*Single Source of Truth*) di lingkungan SUPD II dengan modul-modul berikut:
1. **Dashboard & Agenda**: Menampilkan ringkasan data, statistik kegiatan, dan jadwal penting.
2. **Surat & Disposisi**: Manajemen surat masuk, surat keluar, dan rantai disposisi.
3. **Dokumentasi & Arsip**: Repositori file statis dan foto-foto kegiatan.
4. **Paparan & Laporan**: Penyimpanan bahan presentasi, notulensi rapat, dan hasil tindak lanjut.
5. **Sinkronisasi Cloud**: Backup data lokal ke Supabase secara *on-demand*.

## 3. Topologi Arsitektur (Hybrid Local-Cloud)
Proyek ini mengadopsi pendekatan **Local-First / Edge Computing**:
- **Primary Database (Local)**: Menggunakan **SQLite** (`dashtu_supd2.db`). Semua operasi CRUD dari pengguna akan menulis dan membaca dari SQLite lokal ini terlebih dahulu agar aplikasi berjalan sangat cepat tanpa latensi internet.
- **Backup/Sync Database (Cloud)**: Menggunakan **PostgreSQL di Supabase**. Pengguna memiliki tombol "Sinkronisasi" di menu Pengaturan yang akan menjalankan *script* ETL (`api/sync_supabase.py`) untuk memindahkan data secara searah (One-Way Sync) dari SQLite lokal ke Supabase sebagai *backup*.

## 4. AI Agent Guidelines (Aturan Khusus Agent)
Bagi semua agen AI (termasuk Antigravity / Cline) yang bekerja pada repositori ini, patuhi aturan berikut:
1. **UI/UX Aesthetics**: Tampilan antarmuka Frontend wajib mempertahankan nuansa *Dashboard* modern (Tailwind CSS, Glassmorphism, Dark/Light Mode adaptif) yang terlihat mewah, bukan sekadar MVP sederhana.
2. **Database Changes**: Jika Anda menambahkan tabel baru atau kolom baru pada SQLite, Anda **wajib** memperbarui skrip `api/sync_supabase.py` agar tabel/kolom tersebut ikut masuk ke dalam *pipeline* sinkronisasi ke Supabase.
3. **API Endpoints**: Seluruh logika bisnis harus dienkapsulasi di dalam FastAPI (`api/main.py` atau pecahannya). Jangan menulis *query* database secara langsung di Frontend React.
4. **Dependency Management**: Gunakan `npm` untuk React dan `pip` (`requirements.txt`) untuk FastAPI. Jangan memasukkan dependensi yang tidak perlu, patuhi prinsip *minimalist dependencies*.
5. **No Data Loss Protocol**: Jangan pernah melakukan penghapusan tabel (*drop table*) tanpa meminta izin eksplisit kepada pengguna (merujuk pada Skill `accidental-data-loss-prevention`).

---
*Dokumen ini merupakan kompas arah pengembangan. Jangan biarkan aplikasi ini melenceng menjadi sistem yang terlalu kompleks atau kehilangan fokus pada kemudahan tata usaha lokal.*
