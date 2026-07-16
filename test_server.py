from fastapi import FastAPI, Depends, File, UploadFile, Form
from fastapi.testclient import TestClient
import sqlite3
import uuid, os, shutil
from typing import Optional

app = FastAPI()

def get_db():
    conn = sqlite3.connect("dashtu_supd2.db")
    try:
        yield conn
    finally:
        conn.close()

@app.post("/api/dokumentasi/")
async def create_dokumentasi(
    judul_kegiatan: str = Form(...),
    tanggal_kegiatan: str = Form(...),
    lokasi: str = Form(...),
    kategori: str = Form(...),
    uploader: str = Form(...),
    file: UploadFile = File(...),
    conn: sqlite3.Connection = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    filename = f"{file_id}.{ext}"
    os.makedirs("uploads/dokumentasi", exist_ok=True)
    file_path = f"uploads/dokumentasi/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_file_path = f"/api/uploads/dokumentasi/{filename}"
    
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO dokumentasi (id, judul_kegiatan, tanggal_kegiatan, lokasi, kategori, file_path, uploader)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (file_id, judul_kegiatan, tanggal_kegiatan, lokasi, kategori, db_file_path, uploader))
        conn.commit()
    except Exception as e:
        return {"error": str(e)}
    return {"message": "Dokumentasi berhasil diunggah", "id": file_id}

client = TestClient(app)
try:
    response = client.post(
        "/api/dokumentasi/",
        data={
            "judul_kegiatan": "test",
            "tanggal_kegiatan": "2026-07-16",
            "lokasi": "test",
            "kategori": "test",
            "uploader": "test"
        },
        files={
            "file": ("test.txt", b"hello world", "text/plain")
        }
    )
    print("STATUS", response.status_code)
    print("TEXT", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
