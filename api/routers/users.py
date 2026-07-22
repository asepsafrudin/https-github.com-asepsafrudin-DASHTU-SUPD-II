from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import uuid
import bcrypt
from api.database import get_db
import sqlite3
from api.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

class UserCreate(BaseModel):
    nama: str
    email: str
    password: str
    role: str
    nip: Optional[str] = None
    jabatan: Optional[str] = None
    unit_kerja: Optional[str] = None

class UserUpdate(BaseModel):
    nama: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    nip: Optional[str] = None
    jabatan: Optional[str] = None
    unit_kerja: Optional[str] = None

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak: Hanya admin yang diizinkan")
    return current_user

@router.get("")
def get_users(conn: sqlite3.Connection = Depends(get_db), user: dict = Depends(require_admin)):
    c = conn.cursor()
    c.execute("SELECT id, nama, email, role, nip, jabatan, unit_kerja, created_at FROM users ORDER BY created_at DESC")
    rows = c.fetchall()
    return [dict(row) for row in rows]

@router.post("")
def create_user(req: UserCreate, conn: sqlite3.Connection = Depends(get_db), user: dict = Depends(require_admin)):
    c = conn.cursor()
    # Check if email exists
    c.execute("SELECT id FROM users WHERE email=?", (req.email,))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        
    user_id = str(uuid.uuid4())
    pwd_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        c.execute('''
            INSERT INTO users (id, nama, email, password_hash, role, nip, jabatan, unit_kerja)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, req.nama, req.email, pwd_hash, req.role, req.nip, req.jabatan, req.unit_kerja))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return {"message": "User berhasil dibuat", "id": user_id}

@router.put("/{user_id}")
def update_user(user_id: str, req: UserUpdate, conn: sqlite3.Connection = Depends(get_db), user: dict = Depends(require_admin)):
    c = conn.cursor()
    fields = []
    values = []
    
    allowed_keys = {"nama", "email", "role", "nip", "jabatan", "unit_kerja"}
    
    for key, val in req.dict(exclude_unset=True).items():
        if key == "password" and val:
            fields.append("password_hash=?")
            pwd_hash = bcrypt.hashpw(val.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            values.append(pwd_hash)
        elif key in allowed_keys:
            fields.append(f"{key}=?")
            values.append(val)
            
    if not fields:
        return {"message": "Tidak ada data yang diupdate"}
        
    values.append(user_id)
    try:
        c.execute(f"UPDATE users SET {', '.join(fields)} WHERE id=?", tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "User berhasil diupdate"}

@router.delete("/{user_id}")
def delete_user(user_id: str, conn: sqlite3.Connection = Depends(get_db), user: dict = Depends(require_admin)):
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    return {"message": "User berhasil dihapus"}
