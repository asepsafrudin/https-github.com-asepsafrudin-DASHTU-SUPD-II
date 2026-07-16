import sqlite3
import os

DB_PATH = '/home/aseps/MCP/workspace/DASHTU-SUPD-II/dashtu_supd2.db'

def migrate_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Tambahkan kolom no_agenda ke tabel surat
    try:
        cursor.execute("ALTER TABLE surat ADD COLUMN no_agenda TEXT")
        print("Kolom no_agenda berhasil ditambahkan ke tabel surat.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Kolom no_agenda sudah ada di tabel surat.")
        else:
            print(f"Gagal menambahkan kolom: {e}")
            
    # 2. Buat tabel disposisi
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS disposisi (
        id TEXT PRIMARY KEY,
        surat_id TEXT NOT NULL,
        dispo_dari TEXT,
        diteruskan_kepada TEXT,
        arahan TEXT,
        catatan TEXT,
        tgl_disposisi TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(surat_id) REFERENCES surat(id) ON DELETE CASCADE
    )
    """)
    print("Tabel disposisi siap (atau sudah ada).")
    
    conn.commit()
    conn.close()
    print("Migrasi selesai.")

if __name__ == "__main__":
    migrate_db()
