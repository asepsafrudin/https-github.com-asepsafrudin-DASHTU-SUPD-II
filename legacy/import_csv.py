import csv
import sqlite3
import uuid
from datetime import datetime

DB_NAME = "/home/aseps/MCP/workspace/DASHTU-SUPD-II/dashtu_supd2.db"
CSV_PATH = "/home/aseps/MCP/storage/office/raw/Agenda TU SUPD II 2026 - Form booking nomor.csv"

def import_csv():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    count_success = 0
    count_error = 0
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        # Assuming it has a header row
        reader = csv.reader(f)
        headers = next(reader)
        
        for row in reader:
            if not row or len(row) < 10:
                continue
                
            try:
                # Convert Date from DD/MM/YYYY to YYYY-MM-DD
                tgl_raw = row[1].strip()
                tgl_surat = datetime.strptime(tgl_raw, "%d/%m/%Y").strftime("%Y-%m-%d")
                
                tujuan = row[3].strip()
                perihal = row[4].strip()
                catatan = row[6].strip()
                pengirim = row[7].strip()
                no_surat = row[9].strip()
                
                # If no_surat is empty, this might be a malformed row or not generated yet
                if not no_surat:
                    continue
                    
                surat_id = str(uuid.uuid4())
                jenis = "keluar_manual"
                status = "selesai"
                
                c.execute('''
                    INSERT INTO surat (id, no_surat, perihal, deskripsi, jenis, status, tgl_surat, pengirim, tujuan, created_by, file_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (surat_id, no_surat, perihal, catatan, jenis, status, tgl_surat, pengirim, tujuan, "system_import", ""))
                
                count_success += 1
            except Exception as e:
                print(f"Error pada baris: {row} -> {e}")
                count_error += 1
                
    conn.commit()
    conn.close()
    
    print(f"Import selesai! Berhasil: {count_success}, Gagal/Dilewati: {count_error}")

if __name__ == "__main__":
    import_csv()
