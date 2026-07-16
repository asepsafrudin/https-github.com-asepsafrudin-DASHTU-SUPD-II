import React, { useState, useEffect } from 'react';
import { Download, Plus, Search, Filter, FileText, Calendar, Link as LinkIcon, Database, User } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import LaporanModal from '../components/LaporanModal';

interface LaporanItem {
  id: string;
  judul_laporan: string;
  sumber: string;
  sumber_id: string;
  tanggal_laporan: string;
  pembuat: string;
  file_path: string;
  deskripsi: string;
  status: string;
}

export default function Laporan() {
  const [laporans, setLaporans] = useState<LaporanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSumber, setFilterSumber] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLaporans();
  }, []);

  const fetchLaporans = async () => {
    try {
      const res = await axios.get('/api/laporan');
      setLaporans(res.data);
    } catch (error) {
      console.error("Gagal mengambil data laporan", error);
    }
  };

  const filteredLaporans = laporans.filter(l => {
    const matchSearch = l.judul_laporan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        l.pembuat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSumber = filterSumber === 'Semua' || l.sumber === filterSumber;
    return matchSearch && matchSumber;
  });

  const getSumberColor = (sumber: string) => {
    if (sumber === 'Kegiatan') return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    if (sumber === 'Tindak Lanjut') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="text-indigo-500" /> Arsip Laporan Pelaksanaan
          </h1>
          <p className="text-slate-400 mt-1">Sentralisasi pengelolaan dokumen pertanggungjawaban atas setiap Kegiatan, Dinas Luar, dan hasil eksekusi Tindak Lanjut.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute left-3 text-slate-400" size={16} />
            <select
              value={filterSumber}
              onChange={(e) => setFilterSumber(e.target.value)}
              className="w-full sm:w-auto bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="Semua">Semua Sumber</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Tindak Lanjut">Tindak Lanjut</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Unggah Laporan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Judul & Pembuat</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Modul Terkait</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredLaporans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-slate-600 mb-3" />
                      <p>Belum ada arsip laporan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLaporans.map((laporan) => (
                  <tr key={laporan.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white mb-1">{laporan.judul_laporan}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-1.5">
                        <User size={14} /> {laporan.pembuat}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getSumberColor(laporan.sumber)}`}>
                        {laporan.sumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-500" />
                        {format(new Date(laporan.tanggal_laporan), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                        {laporan.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a 
                        href={`${laporan.file_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                        title="Unduh / Lihat Dokumen"
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

      <LaporanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchLaporans();
        }}
      />
      
    </div>
  );
}
