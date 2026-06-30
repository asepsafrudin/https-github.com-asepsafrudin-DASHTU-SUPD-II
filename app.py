import streamlit as st
import sqlite3
import hashlib
import os
import pandas as pd
import uuid
import bcrypt
from datetime import datetime

# --- 1. INISIALISASI DATABASE & SKEMA ---
DB_NAME = "dashtu_supd2.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # users
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            nama TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'op1', 'op2', 'op3', 'viewer')),
            nip TEXT UNIQUE,
            jabatan TEXT,
            unit_kerja TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # surat
    c.execute('''
        CREATE TABLE IF NOT EXISTS surat (
            id TEXT PRIMARY KEY,
            no_surat TEXT UNIQUE NOT NULL,
            perihal TEXT NOT NULL,
            deskripsi TEXT,
            jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
            status TEXT DEFAULT 'diterima' CHECK (status IN ('diterima', 'didisposisi', 'selesai')),
            tgl_surat TEXT NOT NULL,
            tgl_terima TEXT,
            pengirim TEXT,
            tujuan TEXT,
            created_by TEXT,
            file_path TEXT,
            FOREIGN KEY(created_by) REFERENCES users(id)
        )
    ''')

    # disposisi
    c.execute('''
        CREATE TABLE IF NOT EXISTS disposisi (
            id TEXT PRIMARY KEY,
            surat_id TEXT NOT NULL,
            isi_disposisi TEXT NOT NULL,
            prioritas TEXT DEFAULT 'biasa',
            ditujukan_kepada TEXT,
            created_by TEXT,
            batas_waktu TEXT,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(surat_id) REFERENCES surat(id) ON DELETE CASCADE
        )
    ''')

    # kegiatan
    c.execute('''
        CREATE TABLE IF NOT EXISTS kegiatan (
            id TEXT PRIMARY KEY,
            nama_kegiatan TEXT NOT NULL,
            deskripsi TEXT,
            bidang TEXT NOT NULL CHECK (bidang IN ('PU', 'Perkim', 'Perhubungan', 'KP', 'Kominfo', 'Statistik')),
            tgl_mulai TEXT,
            tgl_selesai TEXT,
            status TEXT DEFAULT 'planned',
            lokasi TEXT
        )
    ''')

    # bahan_paparan
    c.execute('''
        CREATE TABLE IF NOT EXISTS bahan_paparan (
            id TEXT PRIMARY KEY,
            judul TEXT NOT NULL,
            deskripsi TEXT,
            jenis TEXT DEFAULT 'paparan',
            mitra_terkait TEXT,
            tgl_paparan TEXT,
            status TEXT DEFAULT 'draf',
            created_by TEXT
        )
    ''')

    # laporan
    c.execute('''
        CREATE TABLE IF NOT EXISTS laporan (
            id TEXT PRIMARY KEY,
            judul TEXT NOT NULL,
            deskripsi TEXT,
            jenis TEXT NOT NULL,
            kegiatan_id TEXT,
            status TEXT DEFAULT 'draf',
            created_by TEXT,
            FOREIGN KEY(kegiatan_id) REFERENCES kegiatan(id)
        )
    ''')

    # tindak_lanjut
    c.execute('''
        CREATE TABLE IF NOT EXISTS tindak_lanjut (
            id TEXT PRIMARY KEY,
            surat_id TEXT,
            kegiatan_id TEXT,
            tindakan TEXT NOT NULL,
            prioritas TEXT,
            batas_waktu TEXT,
            status TEXT DEFAULT 'belum',
            hasil TEXT,
            FOREIGN KEY(surat_id) REFERENCES surat(id),
            FOREIGN KEY(kegiatan_id) REFERENCES kegiatan(id)
        )
    ''')

    # agenda
    c.execute('''
        CREATE TABLE IF NOT EXISTS agenda (
            id TEXT PRIMARY KEY,
            judul TEXT NOT NULL,
            deskripsi TEXT,
            jenis TEXT DEFAULT 'rapat',
            tgl_mulai TEXT NOT NULL,
            jam_mulai TEXT NOT NULL,
            lokasi TEXT,
            peserta TEXT,
            status TEXT DEFAULT 'direncanakan'
        )
    ''')

    # dokumentasi
    c.execute('''
        CREATE TABLE IF NOT EXISTS dokumentasi (
            id TEXT PRIMARY KEY,
            kegiatan_id TEXT,
            judul TEXT NOT NULL,
            jenis_media TEXT NOT NULL CHECK (jenis_media IN ('foto', 'video', 'audio', 'dokumen')),
            file_path TEXT NOT NULL,
            tgl_dokumentasi TEXT,
            FOREIGN KEY(kegiatan_id) REFERENCES kegiatan(id)
        )
    ''')

    # arsip
    c.execute('''
        CREATE TABLE IF NOT EXISTS arsip (
            id TEXT PRIMARY KEY,
            judul TEXT NOT NULL,
            kategori TEXT,
            kode_klasifikasi TEXT,
            jenis TEXT NOT NULL,
            no_dokumen TEXT,
            status TEXT DEFAULT 'aktif'
        )
    ''')
    
    # Try adding new columns if they don't exist
    try:
        c.execute('ALTER TABLE kegiatan ADD COLUMN progres_persen INTEGER DEFAULT 0')
    except:
        pass
        
    try:
        c.execute('ALTER TABLE bahan_paparan ADD COLUMN file_path TEXT')
    except:
        pass

    conn.commit()
    conn.close()

# --- 2. DATA SEEDING ---
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        # Fallback to check sha256 if the database was seeded previously
        return hashlib.sha256(password.encode()).hexdigest() == hashed

def seed_data():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    users_to_seed = [
        ('u1', 'Administrator', 'admin@supd2.id', hash_password('admin123'), 'admin', '19800101', 'Admin System', 'Pusat'),
        ('u2', 'Operator 1', 'op1@supd2.id', hash_password('op123'), 'op1', '19850202', 'Staff OP1', 'Bidang 1'),
        ('u3', 'Operator 2', 'op2@supd2.id', hash_password('op234'), 'op2', '19860303', 'Staff OP2', 'Bidang 2'),
        ('u4', 'Operator 3', 'op3@supd2.id', hash_password('op345'), 'op3', '19870404', 'Staff OP3', 'Bidang 3'),
        ('u5', 'Viewer User', 'viewer@supd2.id', hash_password('viewer123'), 'viewer', '19900505', 'Viewer', 'Umum'),
    ]
    
    try:
        c.execute("SELECT COUNT(*) FROM users")
        if c.fetchone()[0] == 0:
            c.executemany('''
                INSERT INTO users (id, nama, email, password_hash, role, nip, jabatan, unit_kerja)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', users_to_seed)
            conn.commit()
    except Exception as e:
        st.error(f"Error seeding data: {e}")
    finally:
        conn.close()

# --- FUNGSI AUTHENTICATION ---
def apply_custom_css():
    st.markdown(
        """
        <style>
        /* Main app background */
        .stApp {
            background: linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81);
            color: #f1f5f9;
            font-family: sans-serif;
        }
        
        /* Typography overrides */
        h1, h2, h3, h4, h5, h6, .st-emotion-cache-10trblm {
            color: #ffffff !important;
        }
        p, div, span, label {
            color: #f1f5f9;
        }

        /* Sidebar background */
        [data-testid="stSidebar"] {
            background-color: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(24px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        [data-testid="stSidebar"] * {
            color: #f1f5f9;
        }

        /* Header and Toolbar */
        [data-testid="stHeader"] {
            background-color: transparent;
        }

        /* Cards and containers (stForm and metrics) */
        div[data-testid="stForm"], div[data-testid="stMetric"] {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 1.5rem;
        }

        /* Buttons */
        .stButton>button, .stDownloadButton>button, div[data-testid="stFormSubmitButton"]>button {
            background-color: #6366f1;
            color: #ffffff;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1);
            transition: all 0.3s ease;
        }
        .stButton>button:hover, div[data-testid="stFormSubmitButton"]>button:hover {
            background-color: #4f46e5;
            color: #ffffff;
            border: none;
        }

        /* Inputs */
        .stTextInput>div>div>input, .stSelectbox>div>div>select {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 0.5rem;
        }
        .stTextInput>div>div>input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 1px #6366f1;
        }
        
        /* Alerts/Info */
        .stAlert {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f1f5f9;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

def authenticate(email, password):
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT id, nama, role, password_hash FROM users WHERE email=?", (email,))
        user_record = c.fetchone()
        conn.close()
        
        if user_record:
            user_id, nama, role, pwd_hash = user_record
            if check_password(password, pwd_hash):
                return (user_id, nama, role)
        return None
    except Exception as e:
        st.error(f"Database error: {e}")
        return None

def login_ui():
    st.title("Login DASHTU SUPD II")
    st.write("Silakan masukkan email dan password Anda.")
    
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submit = st.form_submit_button("Login")
        
        if submit:
            if not email or not password:
                st.warning("Email dan password harus diisi!")
            else:
                user = authenticate(email, password)
                if user:
                    st.session_state['logged_in'] = True
                    st.session_state['user_id'] = user[0]
                    st.session_state['user_name'] = user[1]
                    st.session_state['role'] = user[2]
                    st.success("Login berhasil!")
                    st.rerun()
                else:
                    st.error("Email atau password salah!")

def logout():
    for key in ['logged_in', 'user_id', 'user_name', 'role']:
        if key in st.session_state:
            del st.session_state[key]
    st.rerun()

# --- STRUKTUR MENU DINAMIS ---
def sidebar_menu():
    st.sidebar.title("DASHTU SUPD II")
    st.sidebar.write(f"Halo, **{st.session_state.get('user_name', '')}**")
    st.sidebar.write(f"Role: *{st.session_state.get('role', '').upper()}*")
    
    st.sidebar.markdown("---")
    
    role = st.session_state.get('role')
    menu_options = ["Dashboard"]
    
    if role in ['admin', 'op1', 'op2', 'op3']:
        menu_options.extend(["Manajemen Surat", "Agenda & Kegiatan"])
        
    if role in ['admin', 'op1']:
        menu_options.extend(["Repositori Arsip Digital", "Dokumentasi Media"])
        
    if role in ['admin', 'op2']:
        menu_options.extend(["Pengelolaan Bahan Paparan", "Laporan Kegiatan", "Monitoring Tindak Lanjut"])
    
    if role == 'admin':
        menu_options.extend(["Manajemen Pengguna", "Pengaturan Sistem"])
        
    if role == 'viewer':
        menu_options.extend(["Lihat Arsip", "Lihat Agenda"])
    
    selected_menu = st.sidebar.radio("Navigasi", menu_options)
    
    st.sidebar.markdown("---")
    if st.sidebar.button("Logout"):
        logout()
        
    return selected_menu

# --- RENDER PAGES ---
def render_dashboard():
    st.title("Dashboard Utama DASHTU SUPD II")
    
    conn = sqlite3.connect(DB_NAME)
    
    # Get metrics
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM surat")
    total_surat = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM laporan")
    total_laporan = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM agenda")
    total_agenda = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM tindak_lanjut WHERE status != 'selesai'")
    total_tindak_lanjut = cur.fetchone()[0]
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Surat", total_surat)
    with col2:
        st.metric("Total Laporan", total_laporan)
    with col3:
        st.metric("Total Agenda", total_agenda)
    with col4:
        st.metric("Tindak Lanjut Pending", total_tindak_lanjut)
        
    st.markdown("---")
    st.subheader("Distribusi Kegiatan per Bidang")
    
    # Query for bar chart
    df_kegiatan = pd.read_sql_query("SELECT bidang, COUNT(*) as jumlah FROM kegiatan GROUP BY bidang", conn)
    
    if not df_kegiatan.empty:
        st.bar_chart(df_kegiatan.set_index("bidang"))
    else:
        st.info("Belum ada data kegiatan untuk divisualisasikan.")
        
    conn.close()

def render_manajemen_surat():
    st.title("Manajemen Surat & Disposisi")
    
    if st.session_state.get('role') not in ['admin', 'op1']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    tab1, tab2, tab3, tab4 = st.tabs(["Daftar Surat", "Tambah Surat", "Tambah Disposisi", "Hapus Surat"])
    
    conn = sqlite3.connect(DB_NAME)
    
    with tab1:
        st.subheader("Daftar Surat Masuk & Keluar")
        df_surat = pd.read_sql_query("SELECT id, no_surat, perihal, jenis, status, tgl_surat, pengirim, tujuan FROM surat ORDER BY tgl_surat DESC", conn)
        if not df_surat.empty:
            st.dataframe(df_surat, use_container_width=True)
            csv_surat = df_surat.to_csv(index=False).encode('utf-8')
            st.download_button(label="Unduh Data Surat (CSV)", data=csv_surat, file_name="data_surat.csv", mime="text/csv")
        else:
            st.info("Belum ada data surat.")
            
        st.subheader("Daftar Disposisi")
        df_disposisi = pd.read_sql_query("SELECT d.id, s.no_surat, d.isi_disposisi, d.prioritas, d.ditujukan_kepada, d.status, d.batas_waktu FROM disposisi d JOIN surat s ON d.surat_id = s.id", conn)
        if not df_disposisi.empty:
            st.dataframe(df_disposisi, use_container_width=True)
            csv_disposisi = df_disposisi.to_csv(index=False).encode('utf-8')
            st.download_button(label="Unduh Data Disposisi (CSV)", data=csv_disposisi, file_name="data_disposisi.csv", mime="text/csv")
        else:
            st.info("Belum ada data disposisi.")
            
    with tab2:
        st.subheader("Form Tambah Surat Baru")
        with st.form("form_tambah_surat"):
            col1, col2 = st.columns(2)
            with col1:
                no_surat = st.text_input("Nomor Surat *")
                jenis = st.selectbox("Jenis Surat", ["masuk", "keluar"])
                tgl_surat = st.date_input("Tanggal Surat")
            with col2:
                perihal = st.text_input("Perihal *")
                pengirim = st.text_input("Pengirim")
                tujuan = st.text_input("Tujuan")
            
            deskripsi = st.text_area("Deskripsi Singkat")
            uploaded_file = st.file_uploader("Upload Berkas Surat (PDF/Doc/Image)", type=['pdf', 'jpg', 'png', 'doc', 'docx'])
            
            submitted = st.form_submit_button("Simpan Surat")
            
            if submitted:
                if no_surat and perihal:
                    surat_id = str(uuid.uuid4())
                    file_path = ""
                    
                    if uploaded_file is not None:
                        os.makedirs("uploads/surat", exist_ok=True)
                        file_path = os.path.join("uploads/surat", f"{surat_id}_{uploaded_file.name}")
                        with open(file_path, "wb") as f:
                            f.write(uploaded_file.getbuffer())
                            
                    try:
                        c = conn.cursor()
                        c.execute('''
                            INSERT INTO surat (id, no_surat, perihal, deskripsi, jenis, tgl_surat, pengirim, tujuan, created_by, file_path)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (surat_id, no_surat, perihal, deskripsi, jenis, tgl_surat.strftime("%Y-%m-%d"), pengirim, tujuan, st.session_state['user_id'], file_path))
                        conn.commit()
                        st.success(f"Surat '{no_surat}' berhasil ditambahkan!")
                    except sqlite3.IntegrityError:
                        st.error("Nomor Surat sudah terdaftar di database!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan: {e}")
                else:
                    st.warning("Nomor Surat dan Perihal wajib diisi!")
                    
    with tab3:
        st.subheader("Form Disposisi Surat")
        df_surat_masuk = pd.read_sql_query("SELECT id, no_surat || ' - ' || perihal as label FROM surat WHERE jenis = 'masuk'", conn)
        
        if not df_surat_masuk.empty:
            with st.form("form_disposisi"):
                surat_dict = dict(zip(df_surat_masuk['label'], df_surat_masuk['id']))
                selected_surat_label = st.selectbox("Pilih Surat Masuk", list(surat_dict.keys()))
                isi_disposisi = st.text_area("Isi Disposisi *")
                
                col1, col2 = st.columns(2)
                with col1:
                    prioritas = st.selectbox("Prioritas", ["biasa", "segera", "sangat segera"])
                with col2:
                    ditujukan_kepada = st.text_input("Ditujukan Kepada")
                    
                batas_waktu = st.date_input("Batas Waktu Tindak Lanjut")
                
                submit_disposisi = st.form_submit_button("Simpan Disposisi")
                
                if submit_disposisi:
                    if selected_surat_label and isi_disposisi:
                        disposisi_id = str(uuid.uuid4())
                        surat_id = surat_dict[selected_surat_label]
                        try:
                            c = conn.cursor()
                            c.execute('''
                                INSERT INTO disposisi (id, surat_id, isi_disposisi, prioritas, ditujukan_kepada, created_by, batas_waktu)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            ''', (disposisi_id, surat_id, isi_disposisi, prioritas, ditujukan_kepada, st.session_state['user_id'], batas_waktu.strftime("%Y-%m-%d")))
                            
                            c.execute("UPDATE surat SET status = 'didisposisi' WHERE id = ?", (surat_id,))
                            
                            conn.commit()
                            st.success("Disposisi berhasil ditambahkan!")
                        except Exception as e:
                            st.error(f"Terjadi kesalahan: {e}")
                    else:
                        st.warning("Pilih Surat dan isi Disposisi wajib dilengkapi!")
        else:
            st.info("Tidak ada surat masuk yang tersedia untuk didisposisi.")
            
    with tab4:
        st.subheader("Hapus Data Surat")
        df_surat_all = pd.read_sql_query("SELECT id, no_surat || ' - ' || perihal as label, file_path FROM surat", conn)
        
        if not df_surat_all.empty:
            with st.form("form_hapus_surat"):
                surat_dict_hapus = dict(zip(df_surat_all['label'], df_surat_all['id']))
                selected_surat_hapus = st.selectbox("Pilih Surat yang akan dihapus", list(surat_dict_hapus.keys()))
                
                submit_hapus = st.form_submit_button("Hapus Surat")
                if submit_hapus:
                    surat_id_to_delete = surat_dict_hapus[selected_surat_hapus]
                    
                    # Cek apakah ada file fisik
                    file_path_to_delete = df_surat_all[df_surat_all['id'] == surat_id_to_delete]['file_path'].values[0]
                    
                    try:
                        c = conn.cursor()
                        # Hapus dari database
                        c.execute("DELETE FROM surat WHERE id = ?", (surat_id_to_delete,))
                        conn.commit()
                        
                        # Hapus file fisik jika ada
                        if file_path_to_delete and os.path.exists(file_path_to_delete):
                            os.remove(file_path_to_delete)
                            
                        st.success(f"Surat '{selected_surat_hapus}' beserta berkasnya (jika ada) berhasil dihapus!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan saat menghapus surat: {e}")
        else:
            st.info("Belum ada data surat.")
            
    conn.close()

def render_repositori_arsip():
    st.title("Repositori Arsip Digital")
    
    if st.session_state.get('role') not in ['admin', 'op1']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    conn = sqlite3.connect(DB_NAME)
    
    st.subheader("Pencarian Arsip")
    col1, col2 = st.columns(2)
    with col1:
        search_query = st.text_input("Pencarian (Judul / No. Dokumen)")
    with col2:
        kategori_filter = st.selectbox("Filter Kategori", ["Semua", "Surat", "Laporan", "Paparan", "Lainnya"])
        
    query = "SELECT * FROM arsip WHERE 1=1"
    params = []
    
    if search_query:
        query += " AND (judul LIKE ? OR no_dokumen LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%"])
        
    if kategori_filter != "Semua":
        query += " AND kategori = ?"
        params.append(kategori_filter)
        
    df_arsip = pd.read_sql_query(query, conn, params=params)
    
    if not df_arsip.empty:
        st.dataframe(df_arsip, use_container_width=True)
    else:
        st.info("Tidak ditemukan arsip yang sesuai dengan kriteria pencarian.")
        
    st.markdown("---")
    st.subheader("Tambah Arsip Manual")
    with st.form("form_tambah_arsip"):
        col_a, col_b = st.columns(2)
        with col_a:
            judul = st.text_input("Judul Arsip *")
            kategori = st.selectbox("Kategori", ["Surat", "Laporan", "Paparan", "Lainnya"])
        with col_b:
            no_dokumen = st.text_input("Nomor Dokumen")
            kode_klasifikasi = st.text_input("Kode Klasifikasi")
            
        jenis = st.selectbox("Format Ekstensi/Media", ["PDF", "Word", "Excel", "Gambar", "Lainnya"])
        
        submit_arsip = st.form_submit_button("Simpan Arsip ke Repositori")
        if submit_arsip:
            if judul:
                arsip_id = str(uuid.uuid4())
                try:
                    c = conn.cursor()
                    c.execute('''
                        INSERT INTO arsip (id, judul, kategori, kode_klasifikasi, jenis, no_dokumen)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (arsip_id, judul, kategori, kode_klasifikasi, jenis, no_dokumen))
                    conn.commit()
                    st.success(f"Arsip '{judul}' berhasil disimpan!")
                except Exception as e:
                    st.error(f"Terjadi kesalahan: {e}")
            else:
                st.warning("Judul arsip wajib diisi!")
                
    conn.close()

def render_bahan_paparan():
    st.title("Pengelolaan Bahan Paparan")
    if st.session_state.get('role') not in ['admin', 'op2']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    conn = sqlite3.connect(DB_NAME)
    
    tab1, tab2, tab3 = st.tabs(["Daftar Paparan", "Tambah Paparan", "Hapus Paparan"])
    
    with tab1:
        st.subheader("Daftar Bahan Paparan")
        status_filter = st.selectbox("Filter Status", ["Semua", "draf", "final", "disetujui"])
        
        query = "SELECT id, judul, jenis, mitra_terkait, tgl_paparan, status FROM bahan_paparan WHERE 1=1"
        params = []
        if status_filter != "Semua":
            query += " AND status = ?"
            params.append(status_filter)
            
        df_paparan = pd.read_sql_query(query, conn, params=params)
        if not df_paparan.empty:
            st.dataframe(df_paparan, use_container_width=True)
        else:
            st.info("Belum ada data bahan paparan.")
            
    with tab2:
        st.subheader("Form Tambah Bahan Paparan")
        with st.form("form_tambah_paparan"):
            judul = st.text_input("Judul Paparan *")
            deskripsi = st.text_area("Deskripsi")
            
            col1, col2 = st.columns(2)
            with col1:
                jenis = st.selectbox("Jenis", ["paparan", "presentasi", "briefing"])
                mitra_terkait = st.text_input("Mitra Terkait")
            with col2:
                tgl_paparan = st.date_input("Tanggal Paparan")
                status = st.selectbox("Status", ["draf", "final", "disetujui"])
                
            uploaded_file = st.file_uploader("Upload File Paparan (PPT/PDF)", type=['ppt', 'pptx', 'pdf'])
            
            submit_paparan = st.form_submit_button("Simpan Bahan Paparan")
            
            if submit_paparan:
                if judul:
                    paparan_id = str(uuid.uuid4())
                    file_path = ""
                    if uploaded_file is not None:
                        os.makedirs("uploads/paparan", exist_ok=True)
                        file_path = os.path.join("uploads/paparan", f"{paparan_id}_{uploaded_file.name}")
                        with open(file_path, "wb") as f:
                            f.write(uploaded_file.getbuffer())
                            
                    try:
                        c = conn.cursor()
                        c.execute('''
                            INSERT INTO bahan_paparan (id, judul, deskripsi, jenis, mitra_terkait, tgl_paparan, status, created_by, file_path)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (paparan_id, judul, deskripsi, jenis, mitra_terkait, tgl_paparan.strftime("%Y-%m-%d"), status, st.session_state['user_id'], file_path))
                        conn.commit()
                        st.success(f"Bahan paparan '{judul}' berhasil ditambahkan!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan: {e}")
                else:
                    st.warning("Judul wajib diisi!")
                    
    with tab3:
        st.subheader("Hapus Data Bahan Paparan")
        df_paparan_all = pd.read_sql_query("SELECT id, judul, file_path FROM bahan_paparan", conn)
        
        if not df_paparan_all.empty:
            with st.form("form_hapus_paparan"):
                paparan_dict_hapus = dict(zip(df_paparan_all['judul'], df_paparan_all['id']))
                selected_paparan_hapus = st.selectbox("Pilih Paparan yang akan dihapus", list(paparan_dict_hapus.keys()))
                
                submit_hapus_paparan = st.form_submit_button("Hapus Paparan")
                if submit_hapus_paparan:
                    paparan_id_to_delete = paparan_dict_hapus[selected_paparan_hapus]
                    
                    file_path_to_delete = df_paparan_all[df_paparan_all['id'] == paparan_id_to_delete]['file_path'].values[0]
                    
                    try:
                        c = conn.cursor()
                        c.execute("DELETE FROM bahan_paparan WHERE id = ?", (paparan_id_to_delete,))
                        conn.commit()
                        
                        if file_path_to_delete and os.path.exists(file_path_to_delete):
                            os.remove(file_path_to_delete)
                            
                        st.success(f"Bahan paparan '{selected_paparan_hapus}' beserta berkasnya (jika ada) berhasil dihapus!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan saat menghapus paparan: {e}")
        else:
            st.info("Belum ada data paparan.")
            
    conn.close()

def render_laporan_kegiatan():
    st.title("Laporan Kegiatan & Monitoring")
    if st.session_state.get('role') not in ['admin', 'op2']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    conn = sqlite3.connect(DB_NAME)
    
    st.subheader("Pembaruan Progres Kegiatan")
    df_kegiatan = pd.read_sql_query("SELECT id, nama_kegiatan || ' - ' || bidang as label, progres_persen FROM kegiatan WHERE status != 'selesai'", conn)
    
    if not df_kegiatan.empty:
        kegiatan_dict = dict(zip(df_kegiatan['label'], df_kegiatan['id']))
        selected_kegiatan_label = st.selectbox("Pilih Kegiatan", list(kegiatan_dict.keys()))
        selected_kegiatan_id = kegiatan_dict[selected_kegiatan_label]
        
        current_progres = df_kegiatan[df_kegiatan['id'] == selected_kegiatan_id]['progres_persen'].values[0]
        
        with st.form("form_update_progres"):
            new_progres = st.slider("Progres Kegiatan (%)", min_value=0, max_value=100, value=int(current_progres))
            if st.form_submit_button("Update Progres"):
                try:
                    c = conn.cursor()
                    c.execute("UPDATE kegiatan SET progres_persen = ? WHERE id = ?", (new_progres, selected_kegiatan_id))
                    if new_progres == 100:
                         c.execute("UPDATE kegiatan SET status = 'selesai' WHERE id = ?", (selected_kegiatan_id,))
                    conn.commit()
                    st.success("Progres kegiatan berhasil diperbarui!")
                except Exception as e:
                    st.error(f"Terjadi kesalahan: {e}")
    else:
        st.info("Tidak ada kegiatan aktif untuk di-monitor.")
        
    st.markdown("---")
    st.subheader("Catat Laporan Kegiatan")
    with st.form("form_tambah_laporan"):
        judul = st.text_input("Judul Laporan *")
        deskripsi = st.text_area("Deskripsi Laporan")
        
        col1, col2 = st.columns(2)
        with col1:
            jenis_laporan = st.selectbox("Jenis Laporan", ["bulanan", "triwulan", "tahunan", "insidental"])
        with col2:
            status = st.selectbox("Status Laporan", ["draf", "review", "final", "terbit"])
            
        kegiatan_id = None
        if not df_kegiatan.empty:
            kegiatan_opsional = ["Tidak Terkait Kegiatan"] + list(kegiatan_dict.keys())
            terkait_label = st.selectbox("Terkait Kegiatan (Opsional)", kegiatan_opsional)
            if terkait_label != "Tidak Terkait Kegiatan":
                kegiatan_id = kegiatan_dict[terkait_label]
                
        if st.form_submit_button("Simpan Laporan"):
            if judul:
                laporan_id = str(uuid.uuid4())
                try:
                    c = conn.cursor()
                    c.execute('''
                        INSERT INTO laporan (id, judul, deskripsi, jenis, kegiatan_id, status, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (laporan_id, judul, deskripsi, jenis_laporan, kegiatan_id, status, st.session_state['user_id']))
                    conn.commit()
                    st.success(f"Laporan '{judul}' berhasil disimpan!")
                except Exception as e:
                    st.error(f"Terjadi kesalahan: {e}")
            else:
                st.warning("Judul laporan wajib diisi!")
                
    st.markdown("---")
    st.subheader("Daftar Laporan")
    df_laporan = pd.read_sql_query("SELECT l.judul, l.jenis, l.status, k.nama_kegiatan as terkait_kegiatan FROM laporan l LEFT JOIN kegiatan k ON l.kegiatan_id = k.id", conn)
    if not df_laporan.empty:
        st.dataframe(df_laporan, use_container_width=True)
        csv_laporan = df_laporan.to_csv(index=False).encode('utf-8')
        st.download_button(label="Unduh Data Laporan (CSV)", data=csv_laporan, file_name="data_laporan.csv", mime="text/csv")
    else:
        st.info("Belum ada laporan yang tercatat.")

    conn.close()

def render_tindak_lanjut():
    st.title("Monitoring Tindak Lanjut")
    if st.session_state.get('role') not in ['admin', 'op2']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    conn = sqlite3.connect(DB_NAME)
    
    st.subheader("Tindak Lanjut Aktif")
    df_tl = pd.read_sql_query("SELECT id, tindakan, prioritas, batas_waktu, status FROM tindak_lanjut WHERE status IN ('belum', 'proses')", conn)
    
    if not df_tl.empty:
        st.dataframe(df_tl, use_container_width=True)
        
        st.markdown("---")
        st.subheader("Pembaruan Tindak Lanjut")
        
        tl_dict = dict(zip(df_tl['tindakan'], df_tl['id']))
        selected_tl_tindakan = st.selectbox("Pilih Tindak Lanjut", list(tl_dict.keys()))
        selected_tl_id = tl_dict[selected_tl_tindakan]
        
        with st.form("form_update_tl"):
            hasil = st.text_area("Hasil Tindak Lanjut *")
            
            if st.form_submit_button("Tandai Selesai"):
                if hasil:
                    try:
                        c = conn.cursor()
                        c.execute("UPDATE tindak_lanjut SET hasil = ?, status = 'selesai' WHERE id = ?", (hasil, selected_tl_id))
                        conn.commit()
                        st.success("Tindak Lanjut berhasil diperbarui menjadi selesai!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan: {e}")
                else:
                    st.warning("Hasil Tindak Lanjut wajib diisi!")
    else:
        st.info("Tidak ada Tindak Lanjut aktif (belum/proses) saat ini.")
        
    conn.close()

def render_dokumentasi_media():
    st.title("Dokumentasi Media")
    if st.session_state.get('role') not in ['admin', 'op1']:
        st.error("Insufficient Permissions. Anda tidak memiliki hak akses ke modul ini.")
        return
        
    conn = sqlite3.connect(DB_NAME)
    
    tab1, tab2, tab3 = st.tabs(["Daftar Dokumentasi", "Tambah Dokumentasi", "Hapus Dokumentasi"])
    
    with tab1:
        st.subheader("Daftar Dokumentasi")
        df_dok = pd.read_sql_query("SELECT d.id, d.judul, d.jenis_media, k.nama_kegiatan as terkait_kegiatan, d.tgl_dokumentasi FROM dokumentasi d LEFT JOIN kegiatan k ON d.kegiatan_id = k.id", conn)
        
        if not df_dok.empty:
            st.dataframe(df_dok, use_container_width=True)
            csv_dok = df_dok.to_csv(index=False).encode('utf-8')
            st.download_button(label="Unduh Data Dokumentasi (CSV)", data=csv_dok, file_name="data_dokumentasi.csv", mime="text/csv")
        else:
            st.info("Belum ada data dokumentasi.")
            
    with tab2:
        st.subheader("Tambah Dokumentasi Media Baru")
        df_kegiatan = pd.read_sql_query("SELECT id, nama_kegiatan FROM kegiatan", conn)
        
        with st.form("form_tambah_dokumentasi"):
            judul = st.text_input("Judul Dokumentasi *")
            
            kegiatan_id = None
            if not df_kegiatan.empty:
                kegiatan_dict = dict(zip(df_kegiatan['nama_kegiatan'], df_kegiatan['id']))
                kegiatan_opsional = ["Tidak Terkait Kegiatan"] + list(kegiatan_dict.keys())
                terkait_label = st.selectbox("Terkait Kegiatan (Opsional)", kegiatan_opsional)
                if terkait_label != "Tidak Terkait Kegiatan":
                    kegiatan_id = kegiatan_dict[terkait_label]
                    
            col1, col2 = st.columns(2)
            with col1:
                jenis_media = st.selectbox("Jenis Media", ["foto", "video", "audio", "dokumen"])
            with col2:
                tgl_dokumentasi = st.date_input("Tanggal Dokumentasi")
                
            uploaded_file = st.file_uploader("Upload Berkas Media", type=['png', 'jpg', 'jpeg', 'mp4', 'mp3', 'pdf', 'zip'])
            
            submit_dok = st.form_submit_button("Simpan Dokumentasi")
            
            if submit_dok:
                if judul and uploaded_file is not None:
                    dok_id = str(uuid.uuid4())
                    os.makedirs("uploads/dokumentasi", exist_ok=True)
                    file_path = os.path.join("uploads/dokumentasi", f"{dok_id}_{uploaded_file.name}")
                    
                    with open(file_path, "wb") as f:
                        f.write(uploaded_file.getbuffer())
                        
                    try:
                        c = conn.cursor()
                        c.execute('''
                            INSERT INTO dokumentasi (id, kegiatan_id, judul, jenis_media, file_path, tgl_dokumentasi)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (dok_id, kegiatan_id, judul, jenis_media, file_path, tgl_dokumentasi.strftime("%Y-%m-%d")))
                        conn.commit()
                        st.success(f"Dokumentasi '{judul}' berhasil disimpan!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan: {e}")
                else:
                    st.warning("Judul dan File Media wajib dilengkapi!")
                    
    with tab3:
        st.subheader("Hapus Data Dokumentasi")
        df_dok_all = pd.read_sql_query("SELECT id, judul, file_path FROM dokumentasi", conn)
        
        if not df_dok_all.empty:
            with st.form("form_hapus_dokumentasi"):
                dok_dict_hapus = dict(zip(df_dok_all['judul'], df_dok_all['id']))
                selected_dok_hapus = st.selectbox("Pilih Dokumentasi yang akan dihapus", list(dok_dict_hapus.keys()))
                
                submit_hapus_dok = st.form_submit_button("Hapus Dokumentasi")
                if submit_hapus_dok:
                    dok_id_to_delete = dok_dict_hapus[selected_dok_hapus]
                    file_path_to_delete = df_dok_all[df_dok_all['id'] == dok_id_to_delete]['file_path'].values[0]
                    
                    try:
                        c = conn.cursor()
                        c.execute("DELETE FROM dokumentasi WHERE id = ?", (dok_id_to_delete,))
                        conn.commit()
                        
                        if file_path_to_delete and os.path.exists(file_path_to_delete):
                            os.remove(file_path_to_delete)
                            
                        st.success(f"Dokumentasi '{selected_dok_hapus}' beserta berkasnya berhasil dihapus!")
                    except Exception as e:
                        st.error(f"Terjadi kesalahan saat menghapus dokumentasi: {e}")
        else:
            st.info("Belum ada data dokumentasi.")
            
    conn.close()

# --- APLIKASI UTAMA ---
def main():
    st.set_page_config(page_title="DASHTU SUPD II", page_icon="🏢", layout="wide")
    
    # Apply custom Frosted Glass CSS
    apply_custom_css()
    
    # Inisialisasi dan Seeding
    try:
        init_db()
        seed_data()
        
        # Buat folder uploads jika belum ada
        if not os.path.exists('uploads'):
            os.makedirs('uploads')
            
    except Exception as e:
        st.error(f"Gagal inisialisasi sistem: {e}")
        return

    # Routing
    if not st.session_state.get('logged_in', False):
        login_ui()
    else:
        menu = sidebar_menu()
        
        if menu == "Dashboard":
            render_dashboard()
            
        elif menu == "Manajemen Surat":
            render_manajemen_surat()
            
        elif menu == "Agenda & Kegiatan":
            st.title("Agenda & Kegiatan")
            st.write("Modul untuk mencatat kegiatan dan agenda rapat.")
            
        elif menu == "Pengelolaan Bahan Paparan":
            render_bahan_paparan()
            
        elif menu == "Laporan Kegiatan":
            render_laporan_kegiatan()
            
        elif menu == "Monitoring Tindak Lanjut":
            render_tindak_lanjut()
            
        elif menu == "Repositori Arsip Digital":
            render_repositori_arsip()
            
        elif menu == "Dokumentasi Media":
            render_dokumentasi_media()
            
        elif menu == "Manajemen Pengguna":
            st.title("Manajemen Pengguna")
            st.write("Modul administrator untuk mengelola hak akses.")
            
        elif menu == "Pengaturan Sistem":
            st.title("Pengaturan Sistem")
            st.write("Modul untuk pengaturan referensi sistem.")
            
        elif menu == "Lihat Arsip":
            st.title("Arsip Dokumen")
            st.write("Daftar arsip yang dapat dilihat oleh Viewer.")
            
        elif menu == "Lihat Agenda":
            st.title("Lihat Agenda")
            st.write("Daftar agenda yang dapat dilihat oleh Viewer.")

if __name__ == "__main__":
    main()
