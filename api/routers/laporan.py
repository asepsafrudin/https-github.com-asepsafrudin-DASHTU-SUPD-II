from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
import uuid
import os
import shutil
from api.database import get_db
import sqlite3
from typing import Optional

router = APIRouter(prefix="/api/laporan", tags=["Laporan"])

@router.get("/")
def get_laporan(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM laporan ORDER BY tanggal_laporan DESC")
    return [dict(row) for row in c.fetchall()]

@router.post("/")
async def create_laporan(
    judul_laporan: str = Form(...),
    sumber: str = Form(...),
    sumber_id: Optional[str] = Form(None),
    tanggal_laporan: str = Form(...),
    pembuat: str = Form(...),
    deskripsi: Optional[str] = Form(""),
    status: str = Form("Draft"),
    file: UploadFile = File(...),
    conn: sqlite3.Connection = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    filename = f"{file_id}.{ext}"
    os.makedirs("uploads/laporan", exist_ok=True)
    file_path = f"uploads/laporan/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_file_path = f"/api/uploads/laporan/{filename}"
    
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO laporan (id, judul_laporan, sumber, sumber_id, tanggal_laporan, pembuat, file_path, deskripsi, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (file_id, judul_laporan, sumber, sumber_id, tanggal_laporan, pembuat, db_file_path, deskripsi, status))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Laporan berhasil ditambahkan", "id": file_id}

@router.put("/{laporan_id}")
def update_laporan(
    laporan_id: str,
    judul_laporan: Optional[str] = Form(None),
    deskripsi: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    conn: sqlite3.Connection = Depends(get_db)
):
    c = conn.cursor()
    fields = []
    values = []
    
    if judul_laporan is not None:
        fields.append("judul_laporan=?")
        values.append(judul_laporan)
    if deskripsi is not None:
        fields.append("deskripsi=?")
        values.append(deskripsi)
    if status is not None:
        fields.append("status=?")
        values.append(status)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(laporan_id)
    try:
        c.execute(f"UPDATE laporan SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Laporan berhasil diupdate"}

@router.delete("/{laporan_id}")
def delete_laporan(laporan_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT file_path FROM laporan WHERE id=?", (laporan_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        
    db_file_path = row[0]
    physical_path = db_file_path.replace("/api/uploads/", "uploads/")
    
    c.execute("DELETE FROM laporan WHERE id=?", (laporan_id,))
    conn.commit()
    
    if os.path.exists(physical_path):
        os.remove(physical_path)
        
    return {"message": "Laporan berhasil dihapus"}
