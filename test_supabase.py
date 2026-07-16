import urllib.request
import urllib.error
import sqlite3
import json
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

conn = sqlite3.connect("dashtu_supd2.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def test_table_all(table):
    cursor.execute(f"SELECT * FROM {table}")
    rows = []
    for row_t in cursor.fetchall():
        row = dict(row_t)
        for k, v in row.items():
            if v == "": row[k] = None
        rows.append(row)
    
    if not rows:
        return
        
    payload = json.dumps(rows).encode('utf-8')
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"{table} All Success:", response.status)
    except urllib.error.HTTPError as e:
        print(f"{table} All Error:", e.status)
        print(f"{table} Body:", e.read().decode())

test_table_all("agenda")
