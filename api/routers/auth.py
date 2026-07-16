from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
import bcrypt
import hashlib
from api.database import get_db

router = APIRouter(tags=["Authentication & Sync"])

class LoginRequest(BaseModel):
    email: str
    password: str

def check_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return hashlib.sha256(password.encode()).hexdigest() == hashed

@router.post("/api/login")
def login(req: LoginRequest, conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    c.execute("SELECT id, nama, role, password_hash FROM users WHERE email=?", (req.email,))
    user_record = c.fetchone()
    
    if user_record:
        user_id, nama, role, pwd_hash = user_record
        if check_password(req.password, pwd_hash):
            return {"user_id": user_id, "nama": nama, "role": role}
            
    raise HTTPException(status_code=401, detail="Email atau password salah")

@router.post("/api/sync")
def trigger_sync():
    from api.sync_supabase import sync_to_supabase
    result = sync_to_supabase()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Sinkronisasi gagal"))
    return result
