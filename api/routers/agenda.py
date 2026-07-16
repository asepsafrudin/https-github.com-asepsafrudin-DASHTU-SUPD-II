from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from api.database import get_db
import sqlite3

router = APIRouter(prefix="/api/agenda", tags=["Agenda"])

class AgendaCreate(BaseModel):
    surat_id: Optional[str] = None
    judul_acara: str
    penyelenggara: str
    lokasi: str
    waktu_mulai: str
    waktu_selesai: str
    status_kehadiran: Optional[str] = "Belum Ditentukan"
    diwakilkan_kepada: Optional[str] = None

class AgendaUpdate(BaseModel):
    judul_acara: Optional[str] = None
    penyelenggara: Optional[str] = None
    lokasi: Optional[str] = None
    waktu_mulai: Optional[str] = None
    waktu_selesai: Optional[str] = None
    status_kehadiran: Optional[str] = None
    diwakilkan_kepada: Optional[str] = None

@router.get("/")
def get_agenda(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM agenda ORDER BY waktu_mulai ASC")
    return [dict(ix) for ix in c.fetchall()]

@router.post("/")
def create_agenda(req: AgendaCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    agenda_id = str(uuid.uuid4())
    try:
        c.execute('''
            INSERT INTO agenda (id, surat_id, judul_acara, penyelenggara, lokasi, waktu_mulai, waktu_selesai, status_kehadiran, diwakilkan_kepada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (agenda_id, req.surat_id, req.judul_acara, req.penyelenggara, req.lokasi, req.waktu_mulai, req.waktu_selesai, req.status_kehadiran, req.diwakilkan_kepada))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Agenda berhasil ditambahkan", "id": agenda_id}

@router.put("/{agenda_id}")
def update_agenda(agenda_id: str, req: AgendaUpdate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    fields = []
    values = []
    for key, val in req.dict(exclude_unset=True).items():
        fields.append(f"{key}=?")
        values.append(val)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(agenda_id)
    try:
        c.execute(f"UPDATE agenda SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Agenda berhasil diupdate"}

@router.delete("/{agenda_id}")
def delete_agenda(agenda_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("DELETE FROM agenda WHERE id=?", (agenda_id,))
    conn.commit()
    return {"message": "Agenda berhasil dihapus"}
