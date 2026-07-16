import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Pengaturan() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan saat sinkronisasi');
      }
      
      setSyncResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Pengaturan Sistem</h1>
          <p className="text-slate-400 mt-1">Kelola konfigurasi dan pemeliharaan aplikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sinkronisasi Supabase Card */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Database className="text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-200">Sinkronisasi Database</h3>
              <p className="text-sm text-slate-400">Backup data lokal ke Supabase (Cloud)</p>
            </div>
          </div>
          
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Fitur ini akan menyalin seluruh data dari database SQLite lokal dan memperbaruinya ke proyek Supabase yang terhubung secara on-demand.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="text-rose-400 mt-0.5 shrink-0" size={18} />
              <div className="text-sm text-rose-200">{error}</div>
            </div>
          )}

          {syncResult && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={18} />
              <div className="text-sm text-emerald-200">
                <p className="font-semibold mb-1">{syncResult.message}</p>
                <div className="text-xs space-y-1 opacity-80">
                  {syncResult.details && Object.entries(syncResult.details).map(([table, stat]: [string, any]) => (
                    <div key={table} className="flex justify-between">
                      <span className="capitalize">{table.replace('_', ' ')}</span>
                      <span>{stat.status === 'success' ? `${stat.count} baris` : stat.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Menyinkronkan Data...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Jalankan Sinkronisasi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
