import React, { useState, useEffect } from 'react';
import { X, Send, History, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface SuratDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: any;
  onSuccess: () => void;
}

export default function SuratDetailModal({ isOpen, onClose, surat, onSuccess }: SuratDetailModalProps) {
  const [disposisiList, setDisposisiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diteruskan_kepada: '',
    arahan: '',
    catatan: '',
    tgl_disposisi: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && surat) {
      fetchDisposisi();
    }
  }, [isOpen, surat]);

  const fetchDisposisi = async () => {
    try {
      const res = await axios.get(`/api/surat/${surat.id}/disposisi`);
      setDisposisiList(res.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat disposisi", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/disposisi', {
        ...formData,
        surat_id: surat.id
      });
      fetchDisposisi();
      setFormData({
        diteruskan_kepada: '',
        arahan: '',
        catatan: '',
        tgl_disposisi: new Date().toISOString().split('T')[0]
      });
      onSuccess();
    } catch (error) {
      console.error("Gagal menambahkan disposisi", error);
      alert("Gagal menambahkan disposisi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !surat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="text-indigo-400" /> Detail Surat & Disposisi
            </h2>
            <p className="text-slate-400 text-sm mt-1">{surat.no_surat}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bagian Kiri: Info Surat & Form Disposisi */}
          <div className="space-y-6">
            <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-700 pb-2">Informasi Surat</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-slate-500">Perihal</span>
                <span className="col-span-2 text-slate-200">{surat.perihal}</span>
                <span className="text-slate-500">Pengirim</span>
                <span className="col-span-2 text-slate-200">{surat.pengirim}</span>
                <span className="text-slate-500">Tujuan</span>
                <span className="col-span-2 text-slate-200">{surat.tujuan}</span>
                <span className="text-slate-500">Tanggal</span>
                <span className="col-span-2 text-slate-200">{surat.tgl_surat}</span>
                <span className="text-slate-500">Status</span>
                <span className="col-span-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {surat.status}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Send size={16} className="text-indigo-400"/> Tambah Disposisi (Internal)
              </h3>
              <form onSubmit={handleSubmit} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Diteruskan Kepada</label>
                  <input required name="diteruskan_kepada" value={formData.diteruskan_kepada} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Contoh: Kasubdit PEIPD" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Arahan</label>
                  <input required name="arahan" value={formData.arahan} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Tindak Lanjuti Segera" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Catatan Tambahan (Opsional)</label>
                  <textarea name="catatan" value={formData.catatan} onChange={handleChange} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="..."></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                  {loading ? 'Menyimpan...' : 'Simpan Disposisi'}
                </button>
              </form>
            </div>
          </div>

          {/* Bagian Kanan: Riwayat Disposisi */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4">
              <History size={16} className="text-amber-400"/> Riwayat Pelacakan Disposisi
            </h3>
            
            <div className="relative border-l border-slate-700/50 ml-3 pl-5 space-y-6">
              {disposisiList.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Belum ada riwayat disposisi untuk surat ini.</p>
              ) : (
                disposisiList.filter((v, i, a) => a.findIndex(t => (
                  t.catatan === v.catatan && 
                  t.tgl_disposisi === v.tgl_disposisi && 
                  t.diteruskan_kepada === v.diteruskan_kepada &&
                  t.arahan === v.arahan
                )) === i).map((d, idx) => (
                  <div key={d.id} className="relative">
                    <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></span>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {d.tgl_disposisi || "Waktu tidak dicatat"}
                        </span>
                      </div>
                      {d.diteruskan_kepada && d.diteruskan_kepada !== 'nan' && d.diteruskan_kepada !== '-' && (
                        <p className="text-sm text-slate-200 mt-2">
                          {d.dispo_dari ? `Dari ` : `Diteruskan kepada `}
                          {d.dispo_dari && <><strong className="text-slate-100">{d.dispo_dari}</strong> kepada </>}
                          <strong className="text-slate-100">{d.diteruskan_kepada}</strong>
                        </p>
                      )}
                      {d.arahan && d.arahan !== 'nan' && d.arahan !== '-' && (
                        <div className="mt-2 text-sm bg-slate-900/50 border border-slate-700/50 p-2 rounded text-slate-300">
                          <span className="text-slate-500 text-xs block mb-1">Arahan:</span>
                          {d.arahan}
                        </div>
                      )}
                      {d.catatan && d.catatan !== 'nan' && d.catatan !== '-' && (
                        <p className="text-xs text-slate-400 mt-2 italic">"{d.catatan}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
