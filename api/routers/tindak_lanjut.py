from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from api.database import get_db
import sqlite3

router = APIRouter(prefix="/api/tindak_lanjut", tags=["Tindak Lanjut"])

class TindakLanjutCreate(BaseModel):
    surat_id: Optional[str] = None
    kegiatan_id: Optional[str] = None
    tindakan: str
    prioritas: Optional[str] = "Sedang"
    batas_waktu: Optional[str] = None
    status: Optional[str] = "belum"

class TindakLanjutUpdate(BaseModel):
    status: Optional[str] = None
    hasil: Optional[str] = None
    tindakan: Optional[str] = None
    prioritas: Optional[str] = None
    batas_waktu: Optional[str] = None

@router.get("")
def get_tindak_lanjut(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute('''
        SELECT tl.*, s.no_surat, s.perihal 
        FROM tindak_lanjut tl
        LEFT JOIN surat s ON tl.surat_id = s.id
        ORDER BY 
            CASE tl.status WHEN 'belum' THEN 1 WHEN 'proses' THEN 2 ELSE 3 END ASC,
            tl.batas_waktu ASC
    ''')
    return [dict(ix) for ix in c.fetchall()]

@router.post("")
def create_tindak_lanjut(req: TindakLanjutCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    tl_id = str(uuid.uuid4())
    try:
        c.execute('''
            INSERT INTO tindak_lanjut (id, surat_id, kegiatan_id, tindakan, prioritas, batas_waktu, status, hasil)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (tl_id, req.surat_id, req.kegiatan_id, req.tindakan, req.prioritas, req.batas_waktu, req.status, ""))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Tindak lanjut berhasil ditambahkan", "id": tl_id}

@router.put("/{tl_id}")
def update_tindak_lanjut(tl_id: str, req: TindakLanjutUpdate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    fields = []
    values = []
    for key, val in req.dict(exclude_unset=True).items():
        fields.append(f"{key}=?")
        values.append(val)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(tl_id)
    try:
        c.execute(f"UPDATE tindak_lanjut SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Tindak lanjut berhasil diupdate"}

@router.delete("/{tl_id}")
def delete_tindak_lanjut(tl_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("DELETE FROM tindak_lanjut WHERE id=?", (tl_id,))
    conn.commit()
    return {"message": "Tindak lanjut berhasil dihapus"}
