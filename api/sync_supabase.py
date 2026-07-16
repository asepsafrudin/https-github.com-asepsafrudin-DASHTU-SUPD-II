import sqlite3
import os
import json
import urllib.request
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DB_NAME = "dashtu_supd2.db"

TABLES_TO_SYNC = [
    "users",
    "kegiatan",
    "surat",
    "disposisi",
    "agenda",
    "tindak_lanjut",
    "laporan",
    "bahan_paparan",
    "relasi_paparan",
    "arsip",
    "dokumentasi"
]

def sync_to_supabase() -> Dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return {"success": False, "error": "Kredensial Supabase tidak dikonfigurasi di .env"}
        
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    results = {}
    total_synced = 0
    
    try:
        for table in TABLES_TO_SYNC:
            query = f"SELECT * FROM {table}"
            if table == "disposisi" or table == "agenda":
                query += " WHERE surat_id IN (SELECT id FROM surat)"
            elif table == "tindak_lanjut":
                query += " WHERE surat_id IN (SELECT id FROM surat) AND (kegiatan_id IS NULL OR kegiatan_id IN (SELECT id FROM kegiatan))"
            elif table == "relasi_paparan":
                query += " WHERE paparan_id IN (SELECT id FROM bahan_paparan)"
                
            cursor.execute(query)
            rows = []
            for row in cursor.fetchall():
                row_dict = dict(row)
                for key, value in row_dict.items():
                    if value == "":
                        row_dict[key] = None
                    elif isinstance(value, str) and key in ["waktu_mulai", "waktu_selesai", "tanggal_mulai", "tanggal_selesai", "tanggal_kegiatan", "diunggah_pada", "tanggal_laporan", "created_at"]:
                        # Fix invalid timestamp format like "2026-06-30 09.00" -> "2026-06-30 09:00:00"
                        if len(value) >= 16 and value[13] == '.':
                            row_dict[key] = value[:13] + ':' + value[14:]
                rows.append(row_dict)
            
            if not rows:
                results[table] = {"status": "skipped", "count": 0, "message": "No data"}
                continue
                
            # Prepare payload
            payload = json.dumps(rows).encode('utf-8')
            
            url = f"{SUPABASE_URL}/rest/v1/{table}"
            headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            }
            
            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            
            try:
                with urllib.request.urlopen(req) as response:
                    if response.status in (200, 201):
                        results[table] = {"status": "success", "count": len(rows)}
                        total_synced += len(rows)
                    else:
                        results[table] = {"status": "error", "message": f"HTTP {response.status}"}
            except Exception as e:
                results[table] = {"status": "error", "message": str(e)}
                
        return {
            "success": True,
            "message": f"Sinkronisasi selesai. Total {total_synced} baris diproses.",
            "details": results
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    print("Memulai sinkronisasi manual ke Supabase...")
    result = sync_to_supabase()
    print(json.dumps(result, indent=2))
