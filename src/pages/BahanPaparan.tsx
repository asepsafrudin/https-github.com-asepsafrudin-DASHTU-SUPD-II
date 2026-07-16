import React, { useState, useEffect } from 'react';
import { Download, Plus, Search, FileText, File, Calendar, User, BookOpen } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import PaparanModal from '../components/PaparanModal';

interface PaparanItem {
  id: string;
  judul_paparan: string;
  format_file: string;
  file_path: string;
  diunggah_pada: string;
  uploader: string;
}

export default function BahanPaparan() {
  const [paparans, setPaparans] = useState<PaparanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPaparans();
  }, []);

  const fetchPaparans = async () => {
    try {
      const res = await axios.get('/api/paparan');
      setPaparans(res.data);
    } catch (error) {
      console.error("Gagal mengambil data paparan", error);
    }
  };

  const filteredPaparans = paparans.filter(p => 
    p.judul_paparan.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.uploader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (formatStr: string) => {
    if (formatStr.toLowerCase().includes('pdf')) {
      return <FileText size={48} className="text-rose-500 group-hover:scale-110 transition-transform duration-300" />;
    }
    return <File size={48} className="text-amber-500 group-hover:scale-110 transition-transform duration-300" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-500" /> Bank Paparan
          </h1>
          <p className="text-slate-400 mt-1">Repositori terpusat khusus bahan tayang (PPT/PDF). Dokumen yang disimpan di sini nantinya dapat ditautkan berulang kali ke berbagai Kegiatan atau Agenda Rapat.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul paparan atau uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Plus size={18} /> Unggah Paparan
          </button>
        </div>
      </div>

      {/* Grid Kartu File */}
      {filteredPaparans.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center">
            <BookOpen size={64} className="text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Belum Ada Dokumen</h3>
            <p className="text-slate-400 max-w-md">Repositori masih kosong atau tidak ada dokumen yang cocok dengan pencarian Anda.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPaparans.map((paparan) => (
            <div 
              key={paparan.id} 
              className="bg-slate-900/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col group transition-all duration-300 hover:bg-slate-800/60 backdrop-blur-md"
            >
              <div className="flex justify-center items-center h-32 bg-slate-950/50 rounded-xl mb-4 border border-slate-800">
                {getFileIcon(paparan.format_file)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium line-clamp-2 leading-tight mb-2 group-hover:text-indigo-400 transition-colors">
                  {paparan.judul_paparan}
                </h3>
                
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center text-xs text-slate-400 gap-1.5">
                    <User size={13} className="text-slate-500" /> 
                    <span className="truncate">{paparan.uploader}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 gap-1.5">
                    <Calendar size={13} className="text-slate-500" /> 
                    {format(new Date(paparan.diunggah_pada), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </div>
                  <div className="flex items-center text-xs text-slate-400 gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 font-medium text-slate-300">
                      {paparan.format_file}
                    </span>
                  </div>
                </div>
              </div>

              <a 
                href={`${paparan.file_path}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Unduh File
              </a>
            </div>
          ))}
        </div>
      )}

      <PaparanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPaparans();
        }}
      />
      
    </div>
  );
}
