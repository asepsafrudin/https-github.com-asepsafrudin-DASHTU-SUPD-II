from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
import uuid
import os
import shutil
from datetime import datetime
from api.database import get_db
import sqlite3
from typing import Optional

router = APIRouter(prefix="/api/arsip", tags=["Arsip"])

@router.get("")
def get_arsip(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM arsip ORDER BY diunggah_pada DESC")
    return [dict(row) for row in c.fetchall()]

@router.post("")
async def create_arsip(
    judul: str = Form(...),
    kategori: str = Form(...),
    kode_klasifikasi: str = Form(""),
    no_dokumen: str = Form(""),
    uploader: str = Form(...),
    status: str = Form("Aktif"),
    file: UploadFile = File(...),
    conn: sqlite3.Connection = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    filename = f"{file_id}.{ext}"
    os.makedirs("uploads/arsip", exist_ok=True)
    file_path = f"uploads/arsip/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_file_path = f"/api/uploads/arsip/{filename}"
    diunggah_pada = datetime.now().isoformat()
    
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO arsip (id, judul, kategori, kode_klasifikasi, no_dokumen, file_path, diunggah_pada, uploader, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (file_id, judul, kategori, kode_klasifikasi, no_dokumen, db_file_path, diunggah_pada, uploader, status))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Arsip berhasil diunggah", "id": file_id}

@router.put("/{arsip_id}")
def update_arsip(
    arsip_id: str,
    judul: Optional[str] = Form(None),
    kategori: Optional[str] = Form(None),
    kode_klasifikasi: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    conn: sqlite3.Connection = Depends(get_db)
):
    c = conn.cursor()
    fields = []
    values = []
    
    if judul is not None:
        fields.append("judul=?")
        values.append(judul)
    if kategori is not None:
        fields.append("kategori=?")
        values.append(kategori)
    if kode_klasifikasi is not None:
        fields.append("kode_klasifikasi=?")
        values.append(kode_klasifikasi)
    if status is not None:
        fields.append("status=?")
        values.append(status)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(arsip_id)
    try:
        c.execute(f"UPDATE arsip SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Arsip berhasil diupdate"}

@router.delete("/{arsip_id}")
def delete_arsip(arsip_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT file_path FROM arsip WHERE id=?", (arsip_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Arsip tidak ditemukan")
        
    db_file_path = row[0]
    physical_path = db_file_path.replace("/api/uploads/", "uploads/")
    
    c.execute("DELETE FROM arsip WHERE id=?", (arsip_id,))
    conn.commit()
    
    if os.path.exists(physical_path):
        os.remove(physical_path)
        
    return {"message": "Arsip berhasil dihapus"}
