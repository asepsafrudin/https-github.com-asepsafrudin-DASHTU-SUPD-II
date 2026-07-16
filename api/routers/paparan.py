from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import shutil
from datetime import datetime
from api.database import get_db
import sqlite3

router = APIRouter(prefix="/api/paparan", tags=["Paparan"])

class RelasiPaparanCreate(BaseModel):
    entitas_tipe: str
    entitas_id: str

@router.get("/")
def get_paparan(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM bahan_paparan ORDER BY diunggah_pada DESC")
    return [dict(row) for row in c.fetchall()]

@router.post("/")
async def create_paparan(
    judul_paparan: str = Form(...),
    uploader: str = Form(...),
    file: UploadFile = File(...),
    conn: sqlite3.Connection = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    filename = f"{file_id}.{ext}"
    os.makedirs("uploads/paparan", exist_ok=True)
    file_path = f"uploads/paparan/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_file_path = f"/api/uploads/paparan/{filename}"
    diunggah_pada = datetime.now().isoformat()
    
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO bahan_paparan (id, judul_paparan, format_file, file_path, diunggah_pada, uploader)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (file_id, judul_paparan, ext.upper(), db_file_path, diunggah_pada, uploader))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Bahan Paparan berhasil diunggah", "id": file_id}

@router.put("/{paparan_id}")
def update_paparan(paparan_id: str, judul_paparan: str = Form(...), conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    try:
        c.execute("UPDATE bahan_paparan SET judul_paparan=? WHERE id=?", (judul_paparan, paparan_id))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Bahan Paparan berhasil diupdate"}

@router.delete("/{paparan_id}")
def delete_paparan(paparan_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT file_path FROM bahan_paparan WHERE id=?", (paparan_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Bahan paparan tidak ditemukan")
        
    db_file_path = row[0]
    physical_path = db_file_path.replace("/api/uploads/", "uploads/")
    
    c.execute("DELETE FROM bahan_paparan WHERE id=?", (paparan_id,))
    # Delete relations
    c.execute("DELETE FROM relasi_paparan WHERE paparan_id=?", (paparan_id,))
    conn.commit()
    
    # Remove physical file
    if os.path.exists(physical_path):
        os.remove(physical_path)
        
    return {"message": "Bahan paparan berhasil dihapus beserta file fisiknya"}

# === RELASI PAPARAN ===

@router.get("/{paparan_id}/relasi")
def get_relasi_paparan(paparan_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM relasi_paparan WHERE paparan_id=?", (paparan_id,))
    return [dict(ix) for ix in c.fetchall()]

@router.post("/{paparan_id}/relasi")
def create_relasi_paparan(paparan_id: str, req: RelasiPaparanCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    relasi_id = str(uuid.uuid4())
    try:
        c.execute('''
            INSERT INTO relasi_paparan (id, paparan_id, entitas_tipe, entitas_id)
            VALUES (?, ?, ?, ?)
        ''', (relasi_id, paparan_id, req.entitas_tipe, req.entitas_id))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Relasi paparan berhasil ditambahkan", "id": relasi_id}

@router.delete("/relasi/{relasi_id}")
def delete_relasi_paparan(relasi_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("DELETE FROM relasi_paparan WHERE id=?", (relasi_id,))
    conn.commit()
    return {"message": "Relasi paparan berhasil dihapus"}
