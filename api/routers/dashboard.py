from fastapi import APIRouter, Depends
from api.database import get_db
import sqlite3

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_metrics(conn: sqlite3.Connection = Depends(get_db)):
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM surat")
    total_surat = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM laporan")
    total_laporan = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM agenda")
    total_agenda = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM tindak_lanjut WHERE status != 'selesai'")
    total_tindak_lanjut = c.fetchone()[0]
    
    # Get kegiatan by bidang for chart
    c.execute("SELECT bidang, COUNT(*) as jumlah FROM kegiatan GROUP BY bidang")
    kegiatan_chart = [{"bidang": row[0], "jumlah": row[1]} for row in c.fetchall()]
    
    return {
        "metrics": {
            "total_surat": total_surat,
            "total_laporan": total_laporan,
            "total_agenda": total_agenda,
            "tindak_lanjut_pending": total_tindak_lanjut
        },
        "chart_data": kegiatan_chart
    }
