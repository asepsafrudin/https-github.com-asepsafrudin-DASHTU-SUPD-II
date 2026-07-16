import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { Plus, Search, MapPin, Calendar, Users, Building2, ChevronRight, Activity, Filter } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import KegiatanModal from '../components/KegiatanModal';

interface KegiatanItem {
  id: string;
  nama_kegiatan: string;
  bidang: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  penyelenggara: string;
  deskripsi: string;
  status: string;
}

export default function Kegiatan() {
  const [kegiatans, setKegiatans] = useState<KegiatanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanItem | undefined>(undefined);

  useEffect(() => {
    fetchKegiatans();
  }, []);

  const fetchKegiatans = async () => {
    try {
      const res = await axios.get('/api/kegiatan');
      setKegiatans(res.data);
    } catch (error) {
      console.error("Gagal mengambil data kegiatan", error);
    }
  };

  const handleOpenModal = (kegiatan?: KegiatanItem) => {
    setSelectedKegiatan(kegiatan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKegiatan(undefined);
  };

  const handleSuccessModal = () => {
    handleCloseModal();
    fetchKegiatans();
  };

  const filteredKegiatan = kegiatans.filter(k => {
    const matchSearch = k.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        k.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBidang = filterBidang === 'Semua' || k.bidang === filterBidang;
    return matchSearch && matchBidang;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Direncanakan': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Berlangsung': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Selesai': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Dibatalkan': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const uniqueBidangs = ['Semua', ...Array.from(new Set(kegiatans.map(k => k.bidang)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-indigo-500" /> Manajemen Kegiatan
          </h1>
          <p className="text-slate-400 mt-1">Basis data terpadu untuk pencatatan pelaksanaan acara, rapat internal, dan dinas luar lintas subdirektorat.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3 text-slate-400" size={16} />
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full sm:w-auto bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
            >
              {uniqueBidangs.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Tambah Kegiatan
          </button>
        </div>
      </div>

      {/* Grid of Kegiatan Cards */}
      {filteredKegiatan.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <Search size={24} className="text-slate-500" />
          </div>
          <p>Belum ada data kegiatan yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredKegiatan.map(kegiatan => (
            <GlassCard key={kegiatan.id} className="p-5 flex flex-col group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(kegiatan.status)}`}>
                  {kegiatan.status}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-1 rounded-lg">
                  <Building2 size={14} /> {kegiatan.bidang}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2">
                {kegiatan.nama_kegiatan}
              </h3>
              
              <div className="space-y-2.5 mb-5 flex-1">
                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <Calendar size={16} className="text-indigo-400/80 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-300 font-medium">
                      {format(new Date(kegiatan.tanggal_mulai), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                    <span className="text-xs">
                      s/d {format(new Date(kegiatan.tanggal_selesai), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <MapPin size={16} className="text-rose-400/80 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{kegiatan.lokasi}</span>
                </div>

                <div className="flex items-start gap-2.5 text-sm text-slate-400">
                  <Users size={16} className="text-emerald-400/80 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{kegiatan.penyelenggara}</span>
                </div>
              </div>

              <button 
                onClick={() => handleOpenModal(kegiatan)}
                className="w-full mt-auto py-2.5 rounded-xl text-sm font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-500/20"
              >
                Detail & Update <ChevronRight size={16} />
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal */}
      <KegiatanModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccessModal}
        kegiatanData={selectedKegiatan}
      />
      
    </div>
  );
}
