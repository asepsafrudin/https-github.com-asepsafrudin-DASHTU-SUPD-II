import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Plus, Search, Filter, Mail, FileText, CheckCircle2, Clock, Inbox, Send } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import SuratModal from '../components/SuratModal';
import SuratDetailModal from '../components/SuratDetailModal';
import { cn } from '../lib/utils';

export default function Surat() {
  const [activeTab, setActiveTab] = useState<'masuk_internal' | 'masuk_eksternal' | 'undangan' | 'keluar' | 'keluar_manual'>('masuk_internal');
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'masuk_internal', label: 'Masuk (Internal)', icon: Inbox },
    { id: 'masuk_eksternal', label: 'Masuk (Eksternal)', icon: Inbox },
    { id: 'undangan', label: 'Undangan', icon: Inbox },
    { id: 'keluar', label: 'Keluar', icon: Send },
    { id: 'keluar_manual', label: 'Keluar (Manual)', icon: FileText },
  ];

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await axios.get(`/api/surat?jenis=${activeTab}${searchParam}`);
      setSuratList(res.data);
    } catch (error) {
      console.error("Gagal mengambil data surat", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSurat();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchQuery]);

  const filteredSurat = suratList;

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">-</span>;
    switch(status.toLowerCase()) {
      case 'selesai':
      case 'diterima':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center w-fit gap-1"><CheckCircle2 size={12}/> {status}</span>;
      case 'didisposisi':
      case 'proses':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center w-fit gap-1"><Clock size={12}/> {status}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="text-indigo-500" /> Surat Masuk & Keluar
          </h1>
          <p className="text-slate-400 mt-1">Monitoring administrasi surat masuk dan keluar secara tersentralisasi. Data surat terintegrasi dengan SRIKANDI (Sistem Informasi Kearsipan Dinamis Terintegrasi).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Tambah {activeTab === 'keluar_manual' ? 'Booking' : activeTab === 'undangan' ? 'Undangan' : 'Surat'}
        </button>
      </div>

      <GlassCard className="p-1">
        <div className="flex items-center gap-2 p-3 border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          
          <div className="ml-auto relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari surat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/30">
                <th className="px-6 py-4 font-medium">No. Surat</th>
                <th className="px-6 py-4 font-medium">Perihal</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">{activeTab.startsWith('masuk') ? 'Pengirim' : 'Tujuan'}</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-slate-800/10">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-700/50 rounded-full w-20"></div></td>
                  </tr>
                ))
              ) : filteredSurat.length > 0 ? (
                filteredSurat.map((surat) => (
                  <tr 
                    key={surat.id} 
                    onClick={() => { setSelectedSurat(surat); setIsDetailModalOpen(true); }}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{surat.no_surat}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        {surat.perihal}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{surat.tgl_surat}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{activeTab.startsWith('masuk') ? surat.pengirim : surat.tujuan}</td>
                    <td className="px-6 py-4">{getStatusBadge(surat.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data surat ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <SuratModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        jenis={activeTab}
        onSuccess={fetchSurat}
      />

      <SuratDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedSurat(null); }}
        surat={selectedSurat}
        onSuccess={fetchSurat}
      />
    </div>
  );
}
