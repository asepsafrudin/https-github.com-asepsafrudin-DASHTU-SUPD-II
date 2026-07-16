import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, CheckSquare, FileText, Calendar, Activity, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

interface Metrics {
  total_surat: number;
  total_laporan: number;
  total_agenda: number;
  tindak_lanjut_pending: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/dashboard/metrics');
      setMetrics(res.data.metrics);
      setChartData(res.data.chart_data);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const statCards = [
    { title: 'Total Surat', value: metrics?.total_surat || 0, icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%', trendUp: true },
    { title: 'Laporan Paparan', value: metrics?.total_laporan || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+4%', trendUp: true },
    { title: 'Agenda Berjalan', value: metrics?.total_agenda || 0, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: 'Stabil', trendUp: null },
    { title: 'Tindak Lanjut Pending', value: metrics?.tindak_lanjut_pending || 0, icon: CheckSquare, color: 'text-rose-400', bg: 'bg-rose-400/10', trend: '-2%', trendUp: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-400 mt-1">Pantau seluruh progres pekerjaan, surat, dan kegiatan organisasi dalam satu tampilan ringkas.</p>
        </div>
        <button 
          onClick={fetchMetrics} 
          disabled={loading}
          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/50 transition-all flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <GlassCard key={index} className="p-6 relative group overflow-hidden">
            {/* Ambient hover glow */}
            <div className={cn("absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500", stat.bg.replace('/10', ''))}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-slate-700/50", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              {stat.trendUp !== null && (
                <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700/50", stat.trendUp ? "text-emerald-400" : "text-rose-400")}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </span>
              )}
            </div>
            
            <h3 className="text-slate-400 font-medium text-sm">{stat.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{loading ? '-' : stat.value}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts & Lists Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="col-span-2 p-6 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Distribusi Kegiatan per Bidang</h3>
          </div>
          <div className="flex-1 flex items-end gap-4 pt-8">
            {/* Simple CSS Bar Chart representation */}
            {chartData.length > 0 ? chartData.map((d, i) => {
              const max = Math.max(...chartData.map(x => x.jumlah));
              const height = `${(d.jumlah / max) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="text-xs text-slate-400 font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{d.jumlah}</div>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500/20 to-indigo-400/80 rounded-t-md transition-all duration-1000 border-x border-t border-indigo-400/50 group-hover:to-indigo-300"
                    style={{ height: loading ? '0%' : height, minHeight: '10%' }}
                  ></div>
                  <span className="mt-3 text-xs font-medium text-slate-300 truncate w-full text-center">{d.bidang}</span>
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
                <Activity className="w-8 h-8 opacity-20" />
                Belum ada data kegiatan
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Aktivitas Terkini</h3>
          </div>
          <div className="space-y-4">
            {/* Mock recent activities since we don't have a real audit log yet */}
            {[
              { text: "Surat 004/KP/XI/2023 masuk", time: "10 menit lalu", icon: Mail, color: "text-blue-400" },
              { text: "Rapat Pimpinan selesai", time: "1 jam lalu", icon: Calendar, color: "text-emerald-400" },
              { text: "Laporan BSPS direview", time: "3 jam lalu", icon: FileText, color: "text-purple-400" },
              { text: "Tindak Lanjut SPBE diupdate", time: "5 jam lalu", icon: CheckSquare, color: "text-amber-400" }
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-700/50">
                <div className="mt-0.5 p-1.5 rounded-md bg-slate-800/80 border border-slate-700">
                  <act.icon className={cn("w-4 h-4", act.color)} />
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium leading-tight">{act.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
