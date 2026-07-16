import React, { useState, useEffect } from 'react';
import './TVDisplay.css';
import { LayoutDashboard, Mail, Calendar, FileText, CheckSquare, Image as ImageIcon } from 'lucide-react';

const API_URL = '/api';

export default function TVDisplay() {
  const [time, setTime] = useState(new Date());
  
  // Data states
  const [metrics, setMetrics] = useState({
    total_surat: 0,
    total_laporan: 0,
    total_agenda: 0,
    tindak_lanjut_pending: 0
  });
  const [agenda, setAgenda] = useState<any[]>([]);
  const [tindakLanjut, setTindakLanjut] = useState<any[]>([]);
  const [dokumentasi, setDokumentasi] = useState<any[]>([]);

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch metrics
        const resMetrics = await fetch(`${API_URL}/dashboard/metrics`);
        if (resMetrics.ok) {
          const data = await resMetrics.json();
          setMetrics(data.metrics || {
            total_surat: 0,
            total_laporan: 0,
            total_agenda: 0,
            tindak_lanjut_pending: 0
          });
        }
        
        // Fetch agenda
        const resAgenda = await fetch(`${API_URL}/agenda`);
        if (resAgenda.ok) {
          const data = await resAgenda.json();
          // Sort by time and take top 5
          setAgenda(data.slice(0, 5));
        }

        // Fetch tindak lanjut
        const resTl = await fetch(`${API_URL}/tindak_lanjut`);
        if (resTl.ok) {
          const data = await resTl.json();
          setTindakLanjut(data.slice(0, 6));
        }

        // Fetch dokumentasi
        const resDoc = await fetch(`${API_URL}/dokumentasi`);
        if (resDoc.ok) {
          const data = await resDoc.json();
          setDokumentasi(data.slice(0, 4));
        }

      } catch (err) {
        console.error("Failed to fetch TV display data", err);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatting date/time
  const days = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
  const months = ["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"];
  const dateStr = `${days[time.getDay()]}, ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;
  const timeStr = time.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

  const getStatusColor = (status: string) => {
    if (status === 'selesai') return 'var(--ok)';
    if (status === 'proses') return 'var(--proc)';
    return 'var(--wait)';
  };
  
  const getBadgeClass = (status: string) => {
    if (status === 'selesai') return 'selesai';
    if (status === 'proses') return 'proses';
    return 'belum';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'selesai') return 'SELESAI';
    if (status === 'proses') return 'PROSES';
    return 'BELUM';
  };

  return (
    <div className="tv-dashboard-body">
      <div className="tv-board">
        
        {/* ================= HEADER ================= */}
        <header className="tv-header">
          <div className="tv-header-left">
            <img src="/assets/logo-kemendagri.png" alt="Logo Kemendagri" />
            <div className="titles">
              <h2>KEMENTERIAN DALAM NEGERI</h2>
              <p>REPUBLIK INDONESIA</p>
            </div>
          </div>

          <div className="tv-header-mid">
            <h1>DASHTU SUPD II</h1>
            <div className="sub1">DASHBOARD TATA USAHA TERPADU</div>
            <div className="sub2">
              DIREKTORAT SINKRONISASI URUSAN PEMERINTAHAN DAERAH II<br/>
              DITJEN BINA PEMBANGUNAN DAERAH
            </div>
          </div>

          <div className="tv-header-time">
            <div className="date">📅 {dateStr}</div>
            <div className="clock">{timeStr}</div>
            <div className="wib">WIB</div>
          </div>

          <div className="tv-header-right">
            <img className="berakhlak" src="/assets/logo-berakhlak.png" alt="BerAKHLAK" />
            <div className="tag"># bangga melayani bangsa</div>
          </div>
        </header>

        {/* ================= STAT STRIP ================= */}
        <section className="tv-stats">
          <div className="tv-stat masuk">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div>
              <div className="tv-title">SURAT & DISPOSISI</div>
              <div className="tv-num">{metrics.total_surat}</div>
              <div className="tv-label">Total Record</div>
            </div>
          </div>
          
          <div className="tv-stat keluar">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </div>
            <div>
              <div className="tv-title">LAPORAN</div>
              <div className="tv-num">{metrics.total_laporan}</div>
              <div className="tv-label">Dokumen</div>
            </div>
          </div>
          
          <div className="tv-stat disposisi">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 9-2 2-1-1-1.5 1.5L11.5 15 14 12.5 17.5 16 19 14.5z"/></svg>
            </div>
            <div>
              <div className="tv-title">AGENDA</div>
              <div className="tv-num">{metrics.total_agenda}</div>
              <div className="tv-label">Kegiatan</div>
            </div>
          </div>
          
          <div className="tv-stat dokumen">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>
            </div>
            <div>
              <div className="tv-title">TINDAK LANJUT</div>
              <div className="tv-num">{metrics.tindak_lanjut_pending}</div>
              <div className="tv-label">Pending</div>
            </div>
          </div>
          
          <div className="tv-stat agenda">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8H5v10h14V10z"/></svg>
            </div>
            <div>
              <div className="tv-title">STATUS SISTEM</div>
              <div className="tv-num">OK</div>
              <div className="tv-label">Online</div>
            </div>
          </div>
          
          <div className="tv-stat tindak">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
            </div>
            <div>
              <div className="tv-title">SINKRONISASI</div>
              <div className="tv-num">Aktif</div>
              <div className="tv-label">Auto Backup</div>
            </div>
          </div>
        </section>

        {/* ================= MAIN GRID ================= */}
        <section className="tv-main">
          
          {/* AGENDA HARI INI */}
          <div className="tv-panel">
            <div className="tv-panel-head">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8H5v10h14V10z"/></svg>
              AGENDA HARI INI
            </div>
            <div className="tv-panel-body">
              {agenda.length > 0 ? agenda.map((item, idx) => (
                <div className="tv-agenda-item" key={item.id || idx}>
                  <div className="tv-agenda-time">{item.waktu_mulai || '00:00'}</div>
                  <div className="tv-agenda-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <div className="tv-agenda-text">
                    <div className="t">{item.judul_acara || '-'}</div>
                    <div className="r">{item.lokasi || '-'}</div>
                  </div>
                  <div className={`tv-badge ${getBadgeClass(item.status_kehadiran?.toLowerCase() || 'belum')}`}>
                    {getStatusLabel(item.status_kehadiran?.toLowerCase() || 'belum')}
                  </div>
                </div>
              )) : (
                <div style={{textAlign:'center', padding:'20px', color:'var(--muted)', fontSize:'13px'}}>Tidak ada agenda hari ini</div>
              )}
            </div>
          </div>

          {/* TINDAK LANJUT KEGIATAN */}
          <div className="tv-panel">
            <div className="tv-panel-head">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M19 3h-4.2A3 3 0 0 0 12 1a3 3 0 0 0-2.8 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM12 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg> 
              TINDAK LANJUT KEGIATAN
            </div>
            <div className="tv-panel-body">
              <table className="tv-table">
                <thead>
                  <tr>
                    <th>KEGIATAN / ARAHAN</th>
                    <th>TARGET</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {tindakLanjut.length > 0 ? tindakLanjut.map((tl, idx) => (
                    <tr key={tl.id || idx}>
                      <td className="tv-kegiatan-title">{tl.tindakan}</td>
                      <td>{tl.batas_waktu || '-'}</td>
                      <td>
                        <span className="tv-status-pill" style={{background: getStatusColor(tl.status)}}>
                          {getStatusLabel(tl.status)}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} style={{textAlign:'center', padding:'20px', color:'var(--muted)'}}>Belum ada data tindak lanjut</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DOKUMENTASI KEGIATAN */}
          <div className="tv-panel">
            <div className="tv-panel-head">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M9 2 7.2 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.2L15 2H9zm3 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/></svg> 
              DOKUMENTASI KEGIATAN
            </div>
            <div className="tv-panel-body">
              <div className="tv-doc-grid">
                {dokumentasi.length > 0 ? dokumentasi.map((doc, idx) => (
                  <div className="tv-doc-card" key={doc.id || idx}>
                    <img src={`${doc.file_path}`} alt={doc.judul_kegiatan} onError={(e) => { e.currentTarget.src='/assets/logo-kemendagri.png'; e.currentTarget.style.objectFit='contain'; }} />
                    <div className="tv-doc-caption">{doc.judul_kegiatan}</div>
                  </div>
                )) : (
                  <div style={{gridColumn:'1 / span 2', textAlign:'center', padding:'30px', color:'var(--muted)'}}>Belum ada dokumentasi</div>
                )}
              </div>
            </div>
          </div>

        </section>

        {/* ================= FOOTER ================= */}
        <footer className="tv-footer">
          <img src="/assets/gedung_kantor.png" alt="Gedung Kantor" onError={(e) => e.currentTarget.style.display='none'} />
          <div className="tv-footer-text">
            <h3>Direktorat Sinkronisasi Urusan Pemerintahan Daerah II</h3>
            <p>Ditjen Bina Pembangunan Daerah &nbsp;–&nbsp; Kementerian Dalam Negeri</p>
          </div>
          <div className="tv-footer-values">
            <div className="tv-fv"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 21s-7-4.4-9.4-8.8C.9 8.6 3 5 6.6 5c2 0 3.4 1 4.4 2.4C12 6 13.4 5 15.4 5 19 5 21.1 8.6 19.4 12.2 17 16.6 12 21 12 21z"/></svg>Melayani</div>
            <div className="tv-fv"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>Profesional</div>
            <div className="tv-fv"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5"/><path d="M12 20c0-3 3-5 6-5"/></svg>Kolaboratif</div>
            <div className="tv-fv"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11c.6.4 1 1.2 1 2h4c0-.8.4-1.6 1-2a6 6 0 0 0-3-11z"/></svg>Inovatif</div>
          </div>
        </footer>

      </div>
    </div>
  );
}
