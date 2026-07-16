import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Image as ImageIcon, MapPin, Calendar, User, Download, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import DokumentasiModal from '../components/DokumentasiModal';

interface DokumentasiItem {
  id: string;
  judul_kegiatan: string;
  tanggal_kegiatan: string;
  lokasi: string;
  kategori: string;
  file_path: string;
  uploader: string;
  is_visible: number;
}

export default function Dokumentasi() {
  const [doks, setDoks] = useState<DokumentasiItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('dashtu_user') || '{}');
  const isSuperAdmin = user.role === 'admin' || user.role === 'superadmin';

  useEffect(() => {
    fetchDoks();
  }, []);

  const fetchDoks = async () => {
    try {
      const res = await axios.get('/api/dokumentasi');
      setDoks(res.data);
    } catch (error) {
      console.error("Gagal mengambil data dokumentasi", error);
    }
  };

  const toggleVisibility = async (id: string, currentVisible: number) => {
    try {
      const data = new FormData();
      data.append('is_visible', currentVisible === 1 ? '0' : '1');
      await axios.put(`/api/dokumentasi/${id}/visibility`, data);
      fetchDoks();
    } catch (error) {
      console.error("Gagal mengubah visibilitas", error);
      alert("Gagal mengubah visibilitas foto.");
    }
  };

  const filteredDoks = doks.filter(d => {
    const matchSearch = d.judul_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        d.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = filterKategori === 'Semua' || d.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="text-pink-500" /> Galeri Dokumentasi
          </h1>
          <p className="text-slate-400 mt-1">Kumpulan foto dokumentasi pelaksanaan kegiatan. Pastikan mengunggah gambar yang jelas, tidak blur, dan merepresentasikan substansi acara (Batas maksimal 5MB).</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kegiatan / lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
            />
          </div>
          
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3 text-slate-400" size={16} />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full sm:w-auto bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500 appearance-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Rapat">Rapat / Koordinasi</option>
              <option value="Kunjungan Lapangan">Kunjungan Lapangan</option>
              <option value="Sosialisasi">Sosialisasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 whitespace-nowrap"
          >
            <Plus size={18} /> Unggah Foto
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredDoks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={40} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Belum Ada Dokumentasi</h3>
            <p className="text-slate-400 max-w-sm">Galeri dokumentasi masih kosong. Klik 'Unggah Foto' untuk menambahkan gambar kegiatan.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoks.map((dok) => (
            <div 
              key={dok.id} 
              className="bg-slate-900 border border-slate-700/50 hover:border-pink-500/50 rounded-2xl overflow-hidden group transition-all duration-300 shadow-xl flex flex-col"
            >
              {/* Image Container with strict aspect ratio */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img 
                  src={`${dok.file_path}`} 
                  alt={dok.judul_kegiatan}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${dok.is_visible === 0 ? 'opacity-40 grayscale' : ''}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white border border-white/10 w-fit">
                    {dok.kategori}
                  </span>
                  {dok.is_visible === 0 && (
                    <span className="px-2.5 py-1 bg-rose-500/80 backdrop-blur-md rounded-lg text-xs font-medium text-white border border-rose-400/20 w-fit flex items-center gap-1">
                      <EyeOff size={12} /> Disembunyikan
                    </span>
                  )}
                </div>
                
                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={() => toggleVisibility(dok.id, dok.is_visible)}
                      className="p-2 bg-black/60 hover:bg-slate-700 backdrop-blur-md rounded-lg text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                      title={dok.is_visible === 1 ? "Sembunyikan dari TV" : "Tampilkan di TV"}
                    >
                      {dok.is_visible === 1 ? <Eye size={16} className="text-sky-400" /> : <EyeOff size={16} className="text-rose-400" />}
                    </button>
                  )}
                  <a 
                    href={`${dok.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-black/60 hover:bg-pink-600 backdrop-blur-md rounded-lg text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    title="Unduh HD"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-medium line-clamp-2 leading-tight mb-3 group-hover:text-pink-400 transition-colors">
                  {dok.judul_kegiatan}
                </h3>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <MapPin size={14} className="text-rose-400 shrink-0 mt-0.5" /> 
                    <span className="line-clamp-1">{dok.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} className="text-sky-400 shrink-0" /> 
                    {format(new Date(dok.tanggal_kegiatan), 'dd MMMM yyyy', { locale: id })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 mt-2 border-t border-slate-800">
                    <User size={14} className="text-amber-400 shrink-0" /> 
                    <span className="truncate">Fotografer: {dok.uploader}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DokumentasiModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDoks();
        }}
      />
      
    </div>
  );
}
