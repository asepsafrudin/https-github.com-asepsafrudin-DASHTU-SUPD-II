from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from api.database import get_db
import sqlite3
from api.dependencies import get_current_user

router = APIRouter(prefix="/api/kegiatan", tags=["Kegiatan"], dependencies=[Depends(get_current_user)])

class KegiatanCreate(BaseModel):
    nama_kegiatan: str
    bidang: str
    tanggal_mulai: str
    tanggal_selesai: str
    lokasi: str
    penyelenggara: str
    deskripsi: str
    status: str = "Direncanakan"

class KegiatanUpdate(BaseModel):
    nama_kegiatan: Optional[str] = None
    bidang: Optional[str] = None
    tanggal_mulai: Optional[str] = None
    tanggal_selesai: Optional[str] = None
    lokasi: Optional[str] = None
    penyelenggara: Optional[str] = None
    deskripsi: Optional[str] = None
    status: Optional[str] = None

@router.get("")
def get_kegiatan(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM kegiatan ORDER BY tanggal_mulai DESC")
    return [dict(row) for row in c.fetchall()]

@router.post("")
def create_kegiatan(req: KegiatanCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    kegiatan_id = str(uuid.uuid4())
    try:
        c.execute('''
            INSERT INTO kegiatan (id, nama_kegiatan, bidang, tanggal_mulai, tanggal_selesai, lokasi, penyelenggara, deskripsi, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (kegiatan_id, req.nama_kegiatan, req.bidang, req.tanggal_mulai, req.tanggal_selesai, req.lokasi, req.penyelenggara, req.deskripsi, req.status))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Kegiatan berhasil ditambahkan", "id": kegiatan_id}

@router.put("/{kegiatan_id}")
def update_kegiatan(kegiatan_id: str, req: KegiatanUpdate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    fields = []
    values = []
    for key, val in req.dict(exclude_unset=True).items():
        fields.append(f"{key}=?")
        values.append(val)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(kegiatan_id)
    try:
        c.execute(f"UPDATE kegiatan SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Kegiatan berhasil diupdate"}

@router.delete("/{kegiatan_id}")
def delete_kegiatan(kegiatan_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("DELETE FROM kegiatan WHERE id=?", (kegiatan_id,))
    conn.commit()
    return {"message": "Kegiatan berhasil dihapus"}
