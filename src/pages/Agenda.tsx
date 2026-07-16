import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { id } from 'date-fns/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { Calendar as CalendarIcon, MapPin, Users, Info, LayoutList, CalendarDays, Clock, CheckCircle2, UserX } from 'lucide-react';
import './CalendarOverrides.css';

const locales = {
  'id': id,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface AgendaItem {
  id: string;
  judul_acara: string;
  penyelenggara: string;
  lokasi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  status_kehadiran: string;
  diwakilkan_kepada: string;
}

export default function Agenda() {
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kalender' | 'kanban'>('kanban');

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    try {
      const res = await axios.get('/api/agenda');
      setAgendas(res.data);
    } catch (error) {
      console.error("Gagal mengambil data agenda", error);
    }
  };

  const handleUpdateKehadiran = async (status: string, wakil: string = '') => {
    if (!selectedEvent) return;
    try {
      await axios.put(`/api/agenda/${selectedEvent.id || selectedEvent.resource?.id}`, {
        status_kehadiran: status,
        diwakilkan_kepada: wakil
      });
      fetchAgendas();
      setSelectedEvent(null);
    } catch (error) {
      console.error("Gagal update agenda", error);
    }
  };

  const events = agendas.map(agenda => ({
    id: agenda.id,
    title: agenda.judul_acara,
    start: new Date(agenda.waktu_mulai),
    end: new Date(agenda.waktu_selesai),
    resource: agenda
  }));

  const EventComponent = ({ event }: any) => {
    const statusColor = 
      event.resource.status_kehadiran === 'Hadir' ? 'bg-emerald-500' :
      event.resource.status_kehadiran === 'Diwakilkan' ? 'bg-amber-500' :
      event.resource.status_kehadiran === 'Tidak Hadir' ? 'bg-rose-500' :
      'bg-slate-400';

    return (
      <div className="flex items-center gap-1.5 p-1 h-full w-full">
        <div className={`w-1.5 h-full rounded-full ${statusColor} shrink-0`} />
        <div className="flex flex-col overflow-hidden text-xs">
          <span className="font-semibold truncate leading-tight">{event.title}</span>
          <span className="truncate text-white/70 leading-tight">{event.resource.lokasi}</span>
        </div>
      </div>
    );
  };

  // KANBAN GROUPING
  const colBelum = agendas.filter(a => a.status_kehadiran === 'Belum Ditentukan');
  const colHadir = agendas.filter(a => a.status_kehadiran === 'Hadir');
  const colWakil = agendas.filter(a => a.status_kehadiran === 'Diwakilkan');
  const colTidak = agendas.filter(a => a.status_kehadiran === 'Tidak Hadir');

  const openKanbanModal = (agenda: AgendaItem) => {
    setSelectedEvent({
      id: agenda.id,
      title: agenda.judul_acara,
      start: new Date(agenda.waktu_mulai),
      end: new Date(agenda.waktu_selesai),
      resource: agenda
    });
  };

  const AgendaKanbanCard = ({ agenda }: { agenda: AgendaItem }) => (
    <div 
      onClick={() => openKanbanModal(agenda)}
      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 shadow-sm hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
    >
      <p className="text-slate-200 text-sm font-semibold leading-snug mb-2 group-hover:text-indigo-400 transition-colors">
        {agenda.judul_acara}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock size={14} className="text-indigo-400/70 shrink-0" />
          <span className="truncate">
            {agenda.waktu_mulai && !isNaN(new Date(agenda.waktu_mulai).getTime()) 
              ? format(new Date(agenda.waktu_mulai), 'dd MMM yyyy, HH:mm', { locale: id }) 
              : 'Waktu tidak tersedia'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin size={14} className="text-rose-400/70 shrink-0" />
          <span className="truncate">{agenda.lokasi}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users size={14} className="text-emerald-400/70 shrink-0" />
          <span className="truncate">{agenda.penyelenggara}</span>
        </div>
      </div>
      
      {agenda.status_kehadiran === 'Diwakilkan' && agenda.diwakilkan_kepada && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-start gap-1.5">
          <Info size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <span className="text-[11px] text-amber-300 font-medium">Oleh: {agenda.diwakilkan_kepada}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-indigo-500" /> Agenda Pimpinan
          </h1>
          <p className="text-slate-400 mt-1">Mengelola penjadwalan rapat dan kegiatan pimpinan, mencakup detail acara, lokasi, waktu, serta delegasi kehadiran (Disposisi Agenda).</p>
        </div>
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700/50 self-start">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <LayoutList size={16} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('kalender')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kalender' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <CalendarDays size={16} /> Kalender
          </button>
        </div>
      </div>

      {viewMode === 'kalender' ? (
        <GlassCard className="p-4 h-[700px] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="id"
            components={{ event: EventComponent }}
            onSelectEvent={setSelectedEvent}
            className="flex-1 custom-calendar"
            messages={{
              next: "Selanjutnya",
              previous: "Sebelumnya",
              today: "Hari Ini",
              month: "Bulan",
              week: "Minggu",
              day: "Hari",
              agenda: "Agenda",
              noEventsInRange: "Tidak ada jadwal di rentang waktu ini.",
            }}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
          
          <GlassCard className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 shrink-0 flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Belum Ditentukan</h2>
              <span className="bg-slate-700 text-slate-300 text-xs py-0.5 px-2 rounded-full">{colBelum.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {colBelum.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Kosong.</p>}
              {colBelum.map(a => <AgendaKanbanCard key={a.id} agenda={a} />)}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-emerald-500/10 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h2 className="font-semibold text-emerald-300">Hadir</h2>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs py-0.5 px-2 rounded-full">{colHadir.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {colHadir.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Kosong.</p>}
              {colHadir.map(a => <AgendaKanbanCard key={a.id} agenda={a} />)}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-amber-500/10 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                <h2 className="font-semibold text-amber-300">Diwakilkan</h2>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs py-0.5 px-2 rounded-full">{colWakil.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {colWakil.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Kosong.</p>}
              {colWakil.map(a => <AgendaKanbanCard key={a.id} agenda={a} />)}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-rose-500/10 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX size={16} className="text-rose-400" />
                <h2 className="font-semibold text-rose-300">Tidak Hadir</h2>
              </div>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs py-0.5 px-2 rounded-full">{colTidak.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {colTidak.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Kosong.</p>}
              {colTidak.map(a => <AgendaKanbanCard key={a.id} agenda={a} />)}
            </div>
          </GlassCard>

        </div>
      )}

      {/* Modal Detail Agenda & Disposisi Kehadiran */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-white leading-tight">
                {selectedEvent.title}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Waktu</p>
                    <p className="text-sm text-slate-400">
                      {selectedEvent.start && !isNaN(selectedEvent.start.getTime()) 
                        ? format(selectedEvent.start, 'dd MMM yyyy, HH:mm', { locale: id }) 
                        : 'Waktu tidak valid'} - {selectedEvent.end && !isNaN(selectedEvent.end.getTime()) 
                        ? format(selectedEvent.end, 'HH:mm', { locale: id }) 
                        : 'Waktu tidak valid'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Lokasi</p>
                    <p className="text-sm text-slate-400">{selectedEvent.resource.lokasi}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Penyelenggara</p>
                    <p className="text-sm text-slate-400">{selectedEvent.resource.penyelenggara}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Status Saat Ini</p>
                    <p className="text-sm text-slate-400">
                      {selectedEvent.resource.status_kehadiran} 
                      {selectedEvent.resource.status_kehadiran === 'Diwakilkan' && ` (Oleh: ${selectedEvent.resource.diwakilkan_kepada})`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/60">
                <p className="text-sm font-medium text-slate-300 mb-3">Tentukan Delegasi / Kehadiran:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleUpdateKehadiran('Hadir')} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-sm font-medium transition-colors">
                    Direktur Hadir
                  </button>
                  <button onClick={() => handleUpdateKehadiran('Tidak Hadir')} className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-sm font-medium transition-colors">
                    Tidak Hadir
                  </button>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <input 
                    id="input-wakil"
                    type="text" 
                    placeholder="Diwakilkan oleh (Misal: Kasubdit Pekerjaan Umum)"
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    defaultValue={selectedEvent.resource.diwakilkan_kepada}
                  />
                  <button 
                    onClick={() => {
                      const wakil = (document.getElementById('input-wakil') as HTMLInputElement).value;
                      if(wakil) handleUpdateKehadiran('Diwakilkan', wakil);
                    }}
                    className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Wakilkan
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/50 border-t border-slate-700/60 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
