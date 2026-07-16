import sqlite3

DB_NAME = "/home/aseps/MCP/workspace/DASHTU-SUPD-II/dashtu_supd2.db"

def fix_schema():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Check current schema
    c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='surat'")
    print("Old Schema:", c.fetchone()[0])
    
    # We will create a new table without the CHECK constraint
    c.execute('''
        CREATE TABLE surat_new (
            id TEXT PRIMARY KEY,
            no_surat TEXT,
            perihal TEXT,
            deskripsi TEXT,
            jenis TEXT,
            status TEXT,
            tgl_surat TEXT,
            pengirim TEXT,
            tujuan TEXT,
            created_by TEXT,
            file_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Copy data
    c.execute("INSERT INTO surat_new SELECT * FROM surat")
    
    # Drop old table
    c.execute("DROP TABLE surat")
    
    # Rename new to old
    c.execute("ALTER TABLE surat_new RENAME TO surat")
    
    conn.commit()
    conn.close()
    print("Schema fixed!")

if __name__ == "__main__":
    fix_schema()
