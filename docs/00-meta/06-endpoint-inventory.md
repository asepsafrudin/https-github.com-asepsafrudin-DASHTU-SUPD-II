# Inventaris Endpoint & Tabel Database DASHTU-SUPD-II

Dokumen ini memetakan ketersediaan tabel database SQLite (`dashtu_supd2.db`) terhadap endpoint FastAPI (di dalam `api/routers/`) yang melayani operasi CRUD penuh. Pemetaan ini ditujukan untuk mempermudah integrasi front-end. Seluruh modul API telah direfactor menggunakan arsitektur modular (`APIRouter`) dan mendukung metode Hard Delete sesuai standardisasi terbaru.

## 🟢 Pemetaan Modul API ke Database

Berikut adalah tabel database yang sudah dipetakan ke dalam router secara lengkap:

| Modul Router (`api/routers/`) | Endpoint Base | Tabel Terkait | Metode Tersedia (CRUD) | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `auth.py` | `/api/login`, `/api/sync` | `users` | `POST` | Menangani otentikasi login statis dan sinkronisasi ke Supabase. |
| `users.py` | `/api/users` | `users` | `GET`, `POST`, `PUT`, `DELETE` | **Dilindungi Autentikasi Admin.** Membutuhkan header `X-User-Role: admin` untuk operasi manipulasi. Hash password menggunakan bcrypt. |
| `surat.py` | `/api/surat`, `/api/disposisi` | `surat`, `disposisi` | `GET`, `POST`, `PUT`, `DELETE` | Menangani surat masuk, keluar, dan riwayat disposisi. Mendukung Hard Delete dan pencarian. |
| `agenda.py` | `/api/agenda` | `agenda` | `GET`, `POST`, `PUT`, `DELETE` | Pengelolaan agenda acara. Terhubung otomatis jika surat berjenis 'undangan'. |
| `kegiatan.py` | `/api/kegiatan` | `kegiatan` | `GET`, `POST`, `PUT`, `DELETE` | Pengelolaan data kegiatan berdasarkan subdit/bidang. |
| `tindak_lanjut.py` | `/api/tindak_lanjut` | `tindak_lanjut` | `GET`, `POST`, `PUT`, `DELETE` | Tracking prioritas dan batas waktu instruksi/disposisi. |
| `paparan.py` | `/api/paparan` | `bahan_paparan`, `relasi_paparan` | `GET`, `POST`, `PUT`, `DELETE` | Mengunggah dokumen bahan paparan, dilengkapi endpoint `/relasi` untuk mengaitkan dokumen ke entitas lain. Penghapusan akan menghapus file fisik di storage. |
| `laporan.py` | `/api/laporan` | `laporan` | `GET`, `POST`, `PUT`, `DELETE` | Penyimpanan dokumen laporan kegiatan (hapus fisik tersedia). |
| `arsip.py` | `/api/arsip` | `arsip` | `GET`, `POST`, `PUT`, `DELETE` | Arsip dokumen statis berdasarkan kode klasifikasi (hapus fisik tersedia). |
| `dokumentasi.py` | `/api/dokumentasi` | `dokumentasi` | `GET`, `POST`, `PUT`, `DELETE` | Galeri foto/kegiatan (hapus fisik tersedia). |
| `dashboard.py` | `/api/dashboard/metrics` | *(Semua Tabel)* | `GET` | Agregasi data (count, statistik kegiatan) untuk disajikan pada halaman dashboard utama dan TV Display. |

---

## 🔒 Kebijakan Keamanan & Penghapusan

1. **Autentikasi:** API `POST /api/users`, `PUT /api/users`, dan `DELETE /api/users` dilindungi dengan _dependency_ statis. Front-end wajib menyertakan header `X-User-Role: admin` saat memanggil endpoint tersebut.
2. **Hard Delete:** Metode `DELETE` pada semua modul di atas akan secara permanen menghapus *row* di dalam SQLite. 
3. **Pembersihan Storage:** Jika data yang dihapus terkait dengan sebuah *file* (pada entitas Laporan, Arsip, Dokumentasi, Bahan Paparan), sistem akan secara otomatis memanggil fungsi `os.remove()` untuk menghapus file tersebut dari folder fisik (`uploads/`) agar storage tidak mengalami kebocoran (leak).

---

## 🛠 Integrasi Side Panel Televisi

Seluruh endpoint di atas (terutama `/api/dashboard/metrics`, `/api/agenda`, `/api/tindak_lanjut`) digunakan secara asinkron (polling) pada halaman `dashboard_untuk_televisi.html` dan `TVDisplay.tsx` guna menyajikan laporan agregat terkini.

*(Dokumentasi ini otomatis dibuat sesuai SOP Kebijakan Dokumentasi - Agent Ops)*
