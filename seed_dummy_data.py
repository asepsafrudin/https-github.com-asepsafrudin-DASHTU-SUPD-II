import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = "/home/aseps/MCP/workspace/DASHTU-SUPD-II/dashtu_supd2.db"

def seed_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Insert Agenda
    for i in range(5):
        waktu_mulai = (datetime.now() + timedelta(hours=i)).strftime("%H:%M")
        waktu_selesai = (datetime.now() + timedelta(hours=i+2)).strftime("%H:%M")
        cursor.execute("""
            INSERT INTO agenda (judul_acara, lokasi, waktu_mulai, waktu_selesai, status_kehadiran)
            VALUES (?, ?, ?, ?, ?)
        """, (
            f"Rapat Koordinasi Bidang {['PU', 'Kesehatan', 'Pendidikan', 'Sosial', 'Ekonomi'][i]}",
            f"Ruang Rapat {['A', 'B', 'Utama', 'VIP', 'Zoom'][i]}",
            waktu_mulai,
            waktu_selesai,
            random.choice(['belum', 'proses', 'selesai'])
        ))

    # 2. Insert Tindak Lanjut
    for i in range(5):
        cursor.execute("""
            INSERT INTO tindak_lanjut (tindakan, batas_waktu, status)
            VALUES (?, ?, ?)
        """, (
            f"Penyusunan draft laporan evaluasi {i+1}",
            (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d"),
            random.choice(['belum', 'proses', 'selesai'])
        ))

    # 3. Insert Surat (untuk metrics)
    for i in range(15):
        cursor.execute("""
            INSERT INTO surat (nomor_surat, tipe_surat, pengirim, perihal, tanggal_terima)
            VALUES (?, ?, ?, ?, ?)
        """, (
            f"SRT/{2026}/{i+1:03d}",
            random.choice(['masuk', 'keluar']),
            "Instansi Dummy",
            f"Perihal Dummy Surat {i+1}",
            datetime.now().strftime("%Y-%m-%d")
        ))

    # 4. Insert Laporan (untuk metrics)
    for i in range(8):
        cursor.execute("""
            INSERT INTO laporan (judul, tanggal_upload, file_path)
            VALUES (?, ?, ?)
        """, (
            f"Laporan Kinerja {i+1}",
            datetime.now().strftime("%Y-%m-%d"),
            f"/uploads/laporan_{i+1}.pdf"
        ))

    # 5. Insert Dokumentasi
    # We will just point them to the assets we uploaded so they look like real photos
    photos = [
        ('/assets/gedung_kantor.png', 'Gedung Kantor Utama'),
        ('/assets/logo-berakhlak.png', 'Kegiatan BerAKHLAK'),
        ('/assets/logo-kemendagri.png', 'Logo Kemendagri')
    ]
    for photo, title in photos:
        cursor.execute("""
            INSERT INTO dokumentasi (judul_kegiatan, file_path, tanggal)
            VALUES (?, ?, ?)
        """, (
            title,
            photo,
            datetime.now().strftime("%Y-%m-%d")
        ))

    conn.commit()
    conn.close()
    print("Berhasil menambahkan data dummy ke dalam database.")

if __name__ == "__main__":
    seed_data()
