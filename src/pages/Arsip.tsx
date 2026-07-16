import React, { useState, useEffect } from 'react';
import { Download, Plus, Search, Filter, Archive, Calendar, User, FileText } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import ArsipModal from '../components/ArsipModal';

interface ArsipItem {
  id: string;
  judul: string;
  kategori: string;
  kode_klasifikasi: string;
  no_dokumen: string;
  file_path: string;
  diunggah_pada: string;
  uploader: string;
  status: string;
}

export default function Arsip() {
  const [arsips, setArsips] = useState<ArsipItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchArsips();
  }, []);

  const fetchArsips = async () => {
    try {
      const res = await axios.get('/api/arsip');
      setArsips(res.data);
    } catch (error) {
      console.error("Gagal mengambil data arsip", error);
    }
  };

  const filteredArsips = arsips.filter(a => {
    const matchSearch = a.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.no_dokumen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = filterKategori === 'Semua' || a.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const getKategoriColor = (kategori: string) => {
    if (kategori === 'Surat Keputusan') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (kategori === 'Regulasi') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (kategori === 'Surat Edaran') return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Archive className="text-indigo-500" /> Arsip Digital
          </h1>
          <p className="text-slate-400 mt-1">Gudang penyimpanan dokumen resmi (SK, Regulasi, Surat Edaran). Mohon perhatikan penulisan Kode Klasifikasi agar sesuai tata naskah dinas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul / no dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3 text-slate-400" size={16} />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full sm:w-auto bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Surat Keputusan">Surat Keputusan</option>
              <option value="Regulasi">Regulasi</option>
              <option value="Surat Edaran">Surat Edaran</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Plus size={18} /> Unggah Arsip
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Judul & No. Dokumen</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Diunggah</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredArsips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Archive size={48} className="text-slate-600 mb-3" />
                      <p>Belum ada arsip digital.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArsips.map((arsip) => (
                  <tr key={arsip.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white mb-1 flex items-start gap-2">
                        <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-tight">{arsip.judul}</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1 pl-6">
                        No: <span className="font-mono text-slate-300">{arsip.no_dokumen || '-'}</span> 
                        {arsip.kode_klasifikasi && ` • Klasifikasi: ${arsip.kode_klasifikasi}`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getKategoriColor(arsip.kategori)}`}>
                        {arsip.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          {format(new Date(arsip.diunggah_pada), 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <User size={12} className="text-slate-500" /> {arsip.uploader}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        arsip.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {arsip.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a 
                        href={`${arsip.file_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                        title="Unduh Dokumen"
                      >
                        <Download size={16} /> Unduh
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ArsipModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchArsips();
        }}
      />
      
    </div>
  );
}
