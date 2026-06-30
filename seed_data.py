import sqlite3
import uuid
import bcrypt
from datetime import datetime, timedelta

DB_NAME = "dashtu_supd2.db"

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_data():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # 0. Seed Users (if not exists)
    users_to_seed = [
        ('u1', 'Administrator', 'admin@supd2.id', hash_password('admin123'), 'admin', '19800101', 'Admin System', 'Pusat'),
        ('u2', 'Operator 1', 'op1@supd2.id', hash_password('op123'), 'op1', '19850202', 'Staff OP1', 'Bidang 1'),
        ('u3', 'Operator 2', 'op2@supd2.id', hash_password('op234'), 'op2', '19860303', 'Staff OP2', 'Bidang 2'),
        ('u4', 'Operator 3', 'op3@supd2.id', hash_password('op345'), 'op3', '19870404', 'Staff OP3', 'Bidang 3'),
        ('u5', 'Viewer User', 'viewer@supd2.id', hash_password('viewer123'), 'viewer', '19900505', 'Viewer', 'Umum'),
    ]
    try:
        c.execute("SELECT COUNT(*) FROM users")
        if c.fetchone()[0] == 0:
            c.executemany('''
                INSERT INTO users (id, nama, email, password_hash, role, nip, jabatan, unit_kerja)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', users_to_seed)
            print("Seed data users berhasil dimasukkan.")
    except Exception as e:
        print(f"Error seeding users or table does not exist: {e}")

    # 1. Seed Kegiatan (6 data)
    kegiatans = [
        (str(uuid.uuid4()), "Rakor Pembangunan Infrastruktur Jalan", "Rapat koordinasi dengan Kementerian PUPR", "PU", "2023-10-01", "2023-10-02", "selesai", "Jakarta", 100),
        (str(uuid.uuid4()), "Evaluasi Program BSPS", "Evaluasi Bantuan Stimulan Perumahan Swadaya", "Perkim", "2023-10-05", "2023-10-07", "selesai", "Bandung", 100),
        (str(uuid.uuid4()), "Penyusunan Rencana Induk Transportasi", "Penyusunan blueprint transportasi darat", "Perhubungan", "2023-11-01", "2023-11-30", "proses", "Surabaya", 50),
        (str(uuid.uuid4()), "Pembahasan RTRW Kawasan Pesisir", "Revisi tata ruang pesisir dan pulau kecil", "KP", "2023-11-15", "2023-11-16", "planned", "Semarang", 0),
        (str(uuid.uuid4()), "Integrasi Sistem SPBE Daerah", "Bimbingan teknis integrasi SPBE", "Kominfo", "2023-12-01", "2023-12-05", "proses", "Yogyakarta", 30),
        (str(uuid.uuid4()), "Bimtek Satu Data Indonesia", "Bimbingan teknis SDI tingkat provinsi", "Statistik", "2023-12-10", "2023-12-12", "planned", "Bali", 0),
    ]
    
    # Need to check if table kegiatan has progres_persen
    try:
        c.execute('ALTER TABLE kegiatan ADD COLUMN progres_persen INTEGER DEFAULT 0')
    except:
        pass

    try:
        c.executemany('''
            INSERT INTO kegiatan (id, nama_kegiatan, deskripsi, bidang, tgl_mulai, tgl_selesai, status, lokasi, progres_persen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', kegiatans)
    except Exception as e:
        print(f"Error seeding kegiatan: {e}")

    # 2. Seed Surat (10 data)
    surats = [
        (str(uuid.uuid4()), "001/PU/X/2023", "Undangan Rakor PU", "Undangan rapat koordinasi", "masuk", "diterima", "2023-10-01", "2023-10-02", "Kementerian PUPR", "Dirjen Bina Bangda", "u1", ""),
        (str(uuid.uuid4()), "002/PK/X/2023", "Laporan BSPS", "Laporan evaluasi program", "masuk", "didisposisi", "2023-10-05", "2023-10-06", "Kementerian Perkim", "Dirjen Bina Bangda", "u2", ""),
        (str(uuid.uuid4()), "003/PH/XI/2023", "Draft Rencana Transportasi", "Penyampaian draft", "masuk", "diterima", "2023-11-01", "2023-11-02", "Kemenhub", "Dirjen Bina Bangda", "u3", ""),
        (str(uuid.uuid4()), "004/KP/XI/2023", "Revisi RTRW Pesisir", "Pengajuan revisi", "masuk", "diterima", "2023-11-15", "2023-11-16", "KKP", "Dirjen Bina Bangda", "u4", ""),
        (str(uuid.uuid4()), "005/KI/XII/2023", "Integrasi SPBE", "Permohonan dukungan", "masuk", "didisposisi", "2023-12-01", "2023-12-02", "Kominfo", "Dirjen Bina Bangda", "u1", ""),
        (str(uuid.uuid4()), "006/ST/XII/2023", "Data Kemiskinan", "Penyampaian data", "masuk", "selesai", "2023-12-10", "2023-12-11", "BPS", "Dirjen Bina Bangda", "u2", ""),
        (str(uuid.uuid4()), "101/SUPD2/X/2023", "Balasan Rakor PU", "Konfirmasi kehadiran", "keluar", "selesai", "2023-10-03", None, "Dirjen Bina Bangda", "Kementerian PUPR", "u1", ""),
        (str(uuid.uuid4()), "102/SUPD2/X/2023", "Tindak Lanjut BSPS", "Arahan tindak lanjut", "keluar", "selesai", "2023-10-08", None, "Dirjen Bina Bangda", "Gubernur Jabar", "u2", ""),
        (str(uuid.uuid4()), "103/SUPD2/XI/2023", "Persetujuan RTRW", "Surat persetujuan", "keluar", "selesai", "2023-11-20", None, "Dirjen Bina Bangda", "Gubernur Jateng", "u3", ""),
        (str(uuid.uuid4()), "104/SUPD2/XII/2023", "Edaran SPBE", "Surat edaran integrasi", "keluar", "selesai", "2023-12-05", None, "Dirjen Bina Bangda", "Gubernur Seluruh Indonesia", "u1", ""),
    ]
    try:
        c.executemany('''
            INSERT INTO surat (id, no_surat, perihal, deskripsi, jenis, status, tgl_surat, tgl_terima, pengirim, tujuan, created_by, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', surats)
    except Exception as e:
        print(f"Error seeding surat: {e}")

    # 3. Seed Bahan Paparan (5 data)
    paparans = [
        (str(uuid.uuid4()), "Paparan Rakor PU", "Materi paparan infrastruktur", "paparan", "Kementerian PUPR", "2023-10-01", "final", "u1", ""),
        (str(uuid.uuid4()), "Evaluasi BSPS", "Materi evaluasi perumahan", "presentasi", "Kementerian Perkim", "2023-10-05", "disetujui", "u2", ""),
        (str(uuid.uuid4()), "Rencana Induk Transportasi", "Materi draft blueprint", "paparan", "Kemenhub", "2023-11-01", "draf", "u3", ""),
        (str(uuid.uuid4()), "Revisi RTRW Kawasan Pesisir", "Materi tata ruang", "briefing", "KKP", "2023-11-15", "final", "u4", ""),
        (str(uuid.uuid4()), "Bimtek SDI", "Materi satu data", "presentasi", "BPS", "2023-12-10", "draf", "u1", ""),
    ]
    try:
        c.execute('ALTER TABLE bahan_paparan ADD COLUMN file_path TEXT')
    except:
        pass
        
    try:
        c.executemany('''
            INSERT INTO bahan_paparan (id, judul, deskripsi, jenis, mitra_terkait, tgl_paparan, status, created_by, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', paparans)
    except Exception as e:
        print(f"Error seeding bahan_paparan: {e}")

    # 4. Seed Agenda (5 data)
    agendas = [
        (str(uuid.uuid4()), "Rapat Pimpinan Awal Bulan", "Membahas target bulanan", "rapat", "2023-11-01", "09:00", "Ruang Rapat Utama", "Semua Direktur", "selesai"),
        (str(uuid.uuid4()), "Koordinasi Lintas Kementerian", "Membahas isu strategis", "kunjungan", "2023-11-10", "10:00", "Gedung Kementerian B", "Tim Satgas", "selesai"),
        (str(uuid.uuid4()), "Evaluasi Kinerja Kuartal", "Review capaian KPI", "rapat", "2023-12-15", "13:00", "Ruang Rapat 2", "Manajemen", "direncanakan"),
        (str(uuid.uuid4()), "Sosialisasi Kebijakan Baru", "Penyampaian SOP baru", "sosialisasi", "2023-12-20", "08:30", "Auditorium", "Seluruh Staf", "direncanakan"),
        (str(uuid.uuid4()), "Rapat Akhir Tahun", "Penutupan program", "rapat", "2023-12-28", "14:00", "Ruang Rapat Utama", "Semua Direktur", "direncanakan"),
    ]
    try:
        c.executemany('''
            INSERT INTO agenda (id, judul, deskripsi, jenis, tgl_mulai, jam_mulai, lokasi, peserta, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', agendas)
    except Exception as e:
        print(f"Error seeding agenda: {e}")

    # 5. Seed Tindak Lanjut (beberapa data)
    kegiatan_id_1 = kegiatans[0][0]
    kegiatan_id_2 = kegiatans[1][0]
    surat_id_1 = surats[0][0]
    
    tls = [
        (str(uuid.uuid4()), surat_id_1, None, "Menyiapkan materi balasan surat", "segera", "2023-10-02", "selesai", "Materi sudah disiapkan dan dikirim via email"),
        (str(uuid.uuid4()), None, kegiatan_id_1, "Menyusun laporan hasil rakor", "biasa", "2023-10-05", "selesai", "Laporan telah diserahkan ke pimpinan"),
        (str(uuid.uuid4()), None, kegiatan_id_2, "Monitoring implementasi BSPS di lapangan", "segera", "2023-10-15", "proses", ""),
        (str(uuid.uuid4()), surats[4][0], None, "Mempelajari draft SPBE", "biasa", "2023-12-05", "belum", ""),
        (str(uuid.uuid4()), None, kegiatans[2][0], "Koordinasi lanjutan dengan Kemenhub", "segera", "2023-11-15", "proses", ""),
    ]
    try:
        c.executemany('''
            INSERT INTO tindak_lanjut (id, surat_id, kegiatan_id, tindakan, prioritas, batas_waktu, status, hasil)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', tls)
    except Exception as e:
        print(f"Error seeding tindak_lanjut: {e}")
        
    conn.commit()
    conn.close()
    print("Seed data berhasil dimasukkan ke dalam database!")

if __name__ == "__main__":
    seed_data()
