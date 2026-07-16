from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
import uuid
import os
import shutil
from api.database import get_db
import sqlite3
from typing import Optional

router = APIRouter(prefix="/api/dokumentasi", tags=["Dokumentasi"])

@router.get("")
def get_dokumentasi(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM dokumentasi ORDER BY tanggal_kegiatan DESC")
    return [dict(row) for row in c.fetchall()]

@router.post("")
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
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Dokumentasi berhasil diunggah", "id": file_id}

@router.put("/{dok_id}")
def update_dokumentasi(
    dok_id: str,
    judul_kegiatan: Optional[str] = Form(None),
    lokasi: Optional[str] = Form(None),
    kategori: Optional[str] = Form(None),
    conn: sqlite3.Connection = Depends(get_db)
):
    c = conn.cursor()
    fields = []
    values = []
    
    if judul_kegiatan is not None:
        fields.append("judul_kegiatan=?")
        values.append(judul_kegiatan)
    if lokasi is not None:
        fields.append("lokasi=?")
        values.append(lokasi)
    if kategori is not None:
        fields.append("kategori=?")
        values.append(kategori)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(dok_id)
    try:
        c.execute(f"UPDATE dokumentasi SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Dokumentasi berhasil diupdate"}

@router.delete("/{dok_id}")
def delete_dokumentasi(dok_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT file_path FROM dokumentasi WHERE id=?", (dok_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Dokumentasi tidak ditemukan")
        
    db_file_path = row[0]
    physical_path = db_file_path.replace("/api/uploads/", "uploads/")
    
    c.execute("DELETE FROM dokumentasi WHERE id=?", (dok_id,))
    conn.commit()
    
    if os.path.exists(physical_path):
        os.remove(physical_path)
        
    return {"message": "Dokumentasi berhasil dihapus"}
