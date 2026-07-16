import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import TindakLanjutModal from '../components/TindakLanjutModal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

interface TindakLanjutItem {
  id: string;
  surat_id: string;
  kegiatan_id: string;
  tindakan: string;
  prioritas: string;
  batas_waktu: string;
  status: string;
  hasil: string;
  no_surat?: string;
  perihal?: string;
}

export default function TindakLanjut() {
  const [tasks, setTasks] = useState<TindakLanjutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TindakLanjutItem | null>(null);
  
  // Available surat for new tasks
  const [suratList, setSuratList] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tlRes, suratRes] = await Promise.all([
        axios.get('/api/tindak_lanjut'),
        axios.get('/api/surat')
      ]);
      setTasks(tlRes.data);
      // Only keep incoming letters for potential tasks
      setSuratList(suratRes.data.filter((s: any) => s.jenis.startsWith('masuk') || s.status === 'didisposisi'));
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`/api/tindak_lanjut/${taskId}`, {
        status: newStatus,
        hasil: tasks.find(t => t.id === taskId)?.hasil || ''
      });
      fetchData();
    } catch (error) {
      console.error("Gagal mengubah status", error);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.tindakan.toLowerCase().includes(search.toLowerCase()) || 
    (task.no_surat && task.no_surat.toLowerCase().includes(search.toLowerCase())) ||
    (task.perihal && task.perihal.toLowerCase().includes(search.toLowerCase()))
  );

  const columnBelum = filteredTasks.filter(t => t.status === 'belum');
  const columnProses = filteredTasks.filter(t => t.status === 'proses');
  const columnSelesai = filteredTasks.filter(t => t.status === 'selesai');

  const getPriorityColor = (prio: string) => {
    switch(prio?.toLowerCase()) {
      case 'tinggi': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'sedang': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rendah': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const TaskCard = ({ task }: { task: TindakLanjutItem }) => (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 shadow-sm hover:border-indigo-500/30 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-md uppercase tracking-wider ${getPriorityColor(task.prioritas)}`}>
          {task.prioritas || 'N/A'}
        </span>
        <button 
          onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
          className="text-slate-400 hover:text-white text-xs underline opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Edit / Update
        </button>
      </div>
      
      <p className="text-slate-200 text-sm font-medium leading-snug mb-3">
        {task.tindakan}
      </p>
      
      {task.perihal && (
        <div className="mb-3 p-2 bg-slate-900/50 rounded-lg border border-slate-800/80">
          <p className="text-[11px] text-indigo-300 font-medium mb-0.5">{task.no_surat}</p>
          <p className="text-[11px] text-slate-400 line-clamp-1">{task.perihal}</p>
        </div>
      )}

      {task.batas_waktu && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80 mb-3 font-medium">
          <Clock size={12} />
          {format(new Date(task.batas_waktu), 'dd MMM yyyy', { locale: id })}
        </div>
      )}

      {/* Kanban Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
        {task.status !== 'belum' ? (
          <button 
            onClick={() => handleStatusChange(task.id, task.status === 'selesai' ? 'proses' : 'belum')}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 transition-colors"
            title="Pindah Mundur"
          >
            <ChevronLeft size={16} />
          </button>
        ) : <div />}
        
        {task.status !== 'selesai' ? (
          <button 
            onClick={() => handleStatusChange(task.id, task.status === 'belum' ? 'proses' : 'selesai')}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 transition-colors"
            title="Pindah Maju"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <CheckCircle2 size={16} className="text-emerald-500" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="text-indigo-500" /> Tindak Lanjut & Disposisi
          </h1>
          <p className="text-slate-400 mt-1">Kanban board interaktif untuk memantau eksekusi pekerjaan, disposisi pimpinan, dan tugas harian staf secara *real-time*.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari tugas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        
        {/* Kolom Belum */}
        <GlassCard className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-200">Belum Mulai</h2>
            </div>
            <span className="bg-slate-700 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">{columnBelum.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {loading ? <p className="text-slate-500 text-sm text-center">Loading...</p> : 
             columnBelum.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">Tidak ada tugas.</p> :
             columnBelum.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </GlassCard>

        {/* Kolom Proses */}
        <GlassCard className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-indigo-500/10 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              <h2 className="font-semibold text-indigo-300">Sedang Proses</h2>
            </div>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs py-0.5 px-2 rounded-full font-medium">{columnProses.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {loading ? <p className="text-slate-500 text-sm text-center">Loading...</p> : 
             columnProses.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">Tidak ada tugas diproses.</p> :
             columnProses.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </GlassCard>

        {/* Kolom Selesai */}
        <GlassCard className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-emerald-500/10 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h2 className="font-semibold text-emerald-300">Selesai</h2>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs py-0.5 px-2 rounded-full font-medium">{columnSelesai.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {loading ? <p className="text-slate-500 text-sm text-center">Loading...</p> : 
             columnSelesai.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">Belum ada yang selesai.</p> :
             columnSelesai.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </GlassCard>

      </div>

      <TindakLanjutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={selectedTask}
        suratList={suratList}
        onSuccess={fetchData}
      />
    </div>
  );
}
