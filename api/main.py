from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api.routers import users, surat, agenda, kegiatan, tindak_lanjut, laporan, paparan, arsip, dokumentasi, dashboard, auth

app = FastAPI(title="DASHTU SUPD II API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/laporan", exist_ok=True)
os.makedirs("uploads/paparan", exist_ok=True)
os.makedirs("uploads/arsip", exist_ok=True)
os.makedirs("uploads/dokumentasi", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(surat.router)
app.include_router(agenda.router)
app.include_router(kegiatan.router)
app.include_router(tindak_lanjut.router)
app.include_router(laporan.router)
app.include_router(paparan.router)
app.include_router(arsip.router)
app.include_router(dokumentasi.router)
app.include_router(dashboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
