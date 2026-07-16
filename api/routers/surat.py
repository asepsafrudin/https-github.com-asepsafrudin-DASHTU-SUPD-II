from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, date, timedelta
from api.database import get_db
import sqlite3

router = APIRouter(tags=["Surat"])

class SuratCreate(BaseModel):
    no_surat: Optional[str] = None
    subdit: Optional[str] = None
    perihal: Optional[str] = ""
    deskripsi: Optional[str] = ""
    jenis: str
    tgl_surat: str
    pengirim: Optional[str] = ""
    tujuan: Optional[str] = ""
    sifat: Optional[str] = ""
    lampiran: Optional[str] = ""
    no_referensi: Optional[str] = ""
    kode_ula: Optional[str] = ""
    tgl_diterima: Optional[str] = ""
    no_agenda: Optional[str] = ""
    dispo_dari: Optional[str] = ""
    diteruskan_kepada: Optional[str] = ""
    arahan: Optional[str] = ""
    catatan: Optional[str] = ""
    tgl_disposisi: Optional[str] = ""
    
    judul_acara: Optional[str] = ""
    penyelenggara: Optional[str] = ""
    lokasi: Optional[str] = ""
    waktu_mulai: Optional[str] = ""
    waktu_selesai: Optional[str] = ""

class SuratUpdate(BaseModel):
    no_surat: Optional[str] = None
    perihal: Optional[str] = None
    deskripsi: Optional[str] = None
    jenis: Optional[str] = None
    status: Optional[str] = None
    tgl_surat: Optional[str] = None
    pengirim: Optional[str] = None
    tujuan: Optional[str] = None
    sifat: Optional[str] = None
    lampiran: Optional[str] = None
    no_referensi: Optional[str] = None
    kode_ula: Optional[str] = None
    tgl_diterima: Optional[str] = None
    no_agenda: Optional[str] = None

class DisposisiCreate(BaseModel):
    surat_id: str
    diteruskan_kepada: str
    arahan: Optional[str] = ""
    catatan: Optional[str] = ""
    tgl_disposisi: str

def get_workdays(target_date: date) -> int:
    start_date = date(target_date.year, 1, 1)
    workdays = 0
    curr = start_date
    while curr <= target_date:
        if curr.weekday() < 5:
            workdays += 1
        curr += timedelta(days=1)
    return workdays

@router.get("/api/surat")
def get_surat(jenis: Optional[str] = None, search: Optional[str] = None, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    query = "SELECT * FROM surat WHERE 1=1"
    params = []
    
    if jenis:
        query += " AND jenis=?"
        params.append(jenis)
        
    if search:
        search_term = f"%{search}%"
        query += " AND (perihal LIKE ? OR no_surat LIKE ? OR pengirim LIKE ? OR tujuan LIKE ?)"
        params.extend([search_term, search_term, search_term, search_term])
        
    if search:
        query += " ORDER BY tgl_surat DESC LIMIT 50"
    else:
        query += " ORDER BY tgl_surat DESC LIMIT 50"
        
    c.execute(query, params)
    rows = c.fetchall()
    return [dict(ix) for ix in rows]

@router.post("/api/surat")
def create_surat(req: SuratCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    surat_id = str(uuid.uuid4())
    status = "masuk" if req.jenis == "masuk" else "keluar"
    created_by = "u1"
    
    final_no_surat = req.no_surat or ""
    
    if req.jenis == "keluar_manual":
        try:
            target_date = datetime.strptime(req.tgl_surat, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format tanggal tidak valid")
            
        if target_date.weekday() >= 5:
            raise HTTPException(status_code=400, detail="Ganti tanggal sesuai hari kerja (Sabtu/Minggu dilarang).")
            
        help3 = get_workdays(target_date)
        c.execute("SELECT COUNT(*) FROM surat WHERE jenis='keluar_manual' AND tgl_surat=?", (req.tgl_surat,))
        count = c.fetchone()[0]
        help2 = count + 1
        nomor_register = f"{help3:03d}-{help2:02d}"
        
        config_map = {
            "SD.I":   ["600.9", "SD.I"],
            "SD.II":  ["600.10", "SD.II"],
            "SD.III": ["500.5", "SD.III"],
            "SD.IV":  ["500.7", "SD.IV"],
            "SD.V":   ["500.8", "SD.V"],
            "SD.VI":  ["700.1", "SD.VI"],
            "TU":     ["UM/TU.SUPD II", "TU"]
        }
        
        if not req.subdit or req.subdit not in config_map:
            raise HTTPException(status_code=400, detail="Subdit tidak valid atau kosong.")
            
        klasifikasi, label_sd = config_map[req.subdit]
        tahun = target_date.year
        
        if req.subdit == "TU":
            final_no_surat = f"{nomor_register}/{klasifikasi}/{tahun}"
        else:
            final_no_surat = f"{klasifikasi}/{nomor_register}/{label_sd}/SUPD II/{tahun}"
    
    try:
        c.execute('''
            INSERT INTO surat (id, no_surat, perihal, deskripsi, jenis, status, tgl_surat, pengirim, tujuan, created_by, file_path, sifat, lampiran, no_referensi, kode_ula, tgl_diterima, no_agenda)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (surat_id, final_no_surat, req.perihal, req.deskripsi, req.jenis, status, req.tgl_surat, req.pengirim, req.tujuan, created_by, "", req.sifat, req.lampiran, req.no_referensi, req.kode_ula, req.tgl_diterima, req.no_agenda))
        
        if req.jenis.startswith("masuk") and not req.jenis == "undangan":
            dispo_id = str(uuid.uuid4())
            c.execute('''
                INSERT INTO disposisi (id, surat_id, dispo_dari, diteruskan_kepada, arahan, catatan, tgl_disposisi)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (dispo_id, surat_id, req.dispo_dari, req.diteruskan_kepada, req.arahan, req.catatan, req.tgl_disposisi))
            c.execute("UPDATE surat SET status='didisposisi' WHERE id=?", (surat_id,))
            
        if req.jenis == "undangan":
            agenda_id = str(uuid.uuid4())
            c.execute('''
                INSERT INTO agenda (id, surat_id, judul_acara, penyelenggara, lokasi, waktu_mulai, waktu_selesai)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (agenda_id, surat_id, req.judul_acara, req.penyelenggara, req.lokasi, req.waktu_mulai, req.waktu_selesai))
            c.execute("UPDATE surat SET status='diagendakan' WHERE id=?", (surat_id,))
            
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Surat berhasil ditambahkan", "id": surat_id}

@router.put("/api/surat/{surat_id}")
def update_surat(surat_id: str, req: SuratUpdate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    fields = []
    values = []
    for key, val in req.dict(exclude_unset=True).items():
        fields.append(f"{key}=?")
        values.append(val)
        
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(surat_id)
    try:
        c.execute(f"UPDATE surat SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Surat berhasil diupdate"}

@router.delete("/api/surat/{surat_id}")
def delete_surat(surat_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    # hapus anak-anaknya juga jika on delete cascade belum diset dengan pragma
    c.execute("PRAGMA foreign_keys = ON")
    c.execute("DELETE FROM surat WHERE id=?", (surat_id,))
    conn.commit()
    return {"message": "Surat berhasil dihapus"}

@router.get("/api/disposisi")
def get_all_disposisi(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute('''
        SELECT d.*, s.no_surat, s.perihal 
        FROM disposisi d
        LEFT JOIN surat s ON d.surat_id = s.id
        ORDER BY d.tgl_disposisi DESC
    ''')
    return [dict(ix) for ix in c.fetchall()]

@router.get("/api/surat/{surat_id}/disposisi")
def get_disposisi_surat(surat_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT * FROM disposisi WHERE surat_id=? ORDER BY tgl_disposisi ASC, created_at ASC", (surat_id,))
    return [dict(ix) for ix in c.fetchall()]

@router.post("/api/disposisi")
def create_disposisi(req: DisposisiCreate, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    dispo_id = str(uuid.uuid4())
    c.execute("SELECT id FROM surat WHERE id=?", (req.surat_id,))
    if not c.fetchone():
        raise HTTPException(status_code=404, detail="Surat tidak ditemukan")
        
    try:
        c.execute('''
            INSERT INTO disposisi (id, surat_id, dispo_dari, diteruskan_kepada, arahan, catatan, tgl_disposisi)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (dispo_id, req.surat_id, "Direktur SUPD II", req.diteruskan_kepada, req.arahan, req.catatan, req.tgl_disposisi))
        c.execute("UPDATE surat SET status='didisposisi' WHERE id=?", (req.surat_id,))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Disposisi berhasil ditambahkan", "id": dispo_id}

@router.delete("/api/disposisi/{dispo_id}")
def delete_disposisi(dispo_id: str, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("DELETE FROM disposisi WHERE id=?", (dispo_id,))
    conn.commit()
    return {"message": "Disposisi berhasil dihapus"}
