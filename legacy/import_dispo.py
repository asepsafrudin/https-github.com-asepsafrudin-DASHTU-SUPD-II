import pandas as pd
import sqlite3
import uuid
import datetime

DB_PATH = '/home/aseps/MCP/workspace/DASHTU-SUPD-II/dashtu_supd2.db'
SURAT_MASUK_CSV = '/home/aseps/MCP/storage/office/raw/data surat luar 2026 - Surat Masuk.csv'
DISPO_CSV = '/home/aseps/MCP/storage/office/raw/data surat luar 2026 - Dispo DJ_TU Pim.csv'

def format_date(d):
    if pd.isna(d):
        return None
    # Usually in DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
    s = str(d).split(' ')[0]
    try:
        parts = s.split('/')
        if len(parts) == 3:
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
    except Exception:
        pass
    return s

def import_data():
    print("Membaca file CSV...")
    # Read CSVs
    df_dispo = pd.read_csv(DISPO_CSV, skiprows=1, names=[
        'Timestamp', 'Dispo_Dari', 'No_Agenda', 'Tgl_Disposisi', 
        'Diteruskan_Kepada', 'Arahan', 'Unggahan', 'Catatan', 'Kasubbag'
    ])
    
    df_surat = pd.read_csv(SURAT_MASUK_CSV, skiprows=1, names=[
        'Timestamp', 'Surat_Dari', 'No_Surat', 'Tgl_Surat', 'Tgl_Terima', 
        'Perihal', 'Arahan_Menteri', 'Arahan_Sekjen', 'Agenda_ULA', 'Status'
    ])
    
    # Filter Dispo that went to SUPD II
    # Some strings might contain "SUPD II" or "SUPD 2"
    df_dispo_supd2 = df_dispo[df_dispo['Diteruskan_Kepada'].astype(str).str.contains('SUPD II', case=False, na=False)]
    agendas_supd2 = df_dispo_supd2['No_Agenda'].unique().tolist()
    
    print(f"Ditemukan {len(agendas_supd2)} agenda yang didisposisikan ke SUPD II.")
    
    # Filter Surat Masuk matching those agendas
    df_surat_supd2 = df_surat[df_surat['Agenda_ULA'].isin(agendas_supd2)]
    print(f"Ditemukan {len(df_surat_supd2)} surat masuk yang cocok.")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    inserted_surat = 0
    inserted_dispo = 0
    
    for idx, row in df_surat_supd2.iterrows():
        agenda = row['Agenda_ULA']
        # Check if already exists by no_agenda
        cursor.execute("SELECT id FROM surat WHERE no_agenda=?", (agenda,))
        existing = cursor.fetchone()
        
        if existing:
            surat_id = existing[0]
        else:
            surat_id = str(uuid.uuid4())
            # Insert into surat
            tgl_surat = format_date(row['Tgl_Surat']) or datetime.date.today().strftime('%Y-%m-%d')
            cursor.execute("""
                INSERT INTO surat (id, no_surat, perihal, deskripsi, jenis, status, tgl_surat, pengirim, tujuan, created_by, no_agenda)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                surat_id,
                str(row['No_Surat'])[:100] if not pd.isna(row['No_Surat']) else '-',
                str(row['Perihal']) if not pd.isna(row['Perihal']) else '-',
                '',
                'masuk_eksternal',
                'didisposisi',
                tgl_surat,
                str(row['Surat_Dari']) if not pd.isna(row['Surat_Dari']) else '-',
                'Direktur SUPD II',
                'system_import',
                agenda
            ))
            inserted_surat += 1
            
        # Get disposisi for this agenda
        dispo_rows = df_dispo_supd2[df_dispo_supd2['No_Agenda'] == agenda]
        for _, d_row in dispo_rows.iterrows():
            dispo_id = str(uuid.uuid4())
            tgl_dispo = format_date(d_row['Tgl_Disposisi'])
            
            # Check if this precise dispo exists to avoid duplicates (naive check)
            cursor.execute("SELECT id FROM disposisi WHERE surat_id=? AND dispo_dari=? AND tgl_disposisi=?", 
                          (surat_id, str(d_row['Dispo_Dari']), tgl_dispo))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO disposisi (id, surat_id, dispo_dari, diteruskan_kepada, arahan, catatan, tgl_disposisi)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    dispo_id,
                    surat_id,
                    str(d_row['Dispo_Dari']) if not pd.isna(d_row['Dispo_Dari']) else '-',
                    str(d_row['Diteruskan_Kepada']) if not pd.isna(d_row['Diteruskan_Kepada']) else '-',
                    str(d_row['Arahan']) if not pd.isna(d_row['Arahan']) else '',
                    str(d_row['Catatan']) if not pd.isna(d_row['Catatan']) else '',
                    tgl_dispo
                ))
                inserted_dispo += 1
                
    conn.commit()
    conn.close()
    print(f"Selesai! {inserted_surat} surat dan {inserted_dispo} disposisi berhasil diimpor.")

if __name__ == '__main__':
    import_data()
