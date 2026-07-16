import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface TindakLanjutModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: any | null;
  suratList: any[];
  onSuccess: () => void;
}

export default function TindakLanjutModal({ isOpen, onClose, taskToEdit, suratList, onSuccess }: TindakLanjutModalProps) {
  const [formData, setFormData] = useState({
    surat_id: '',
    tindakan: '',
    prioritas: 'Sedang',
    batas_waktu: '',
    status: 'belum',
    hasil: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        surat_id: taskToEdit.surat_id || '',
        tindakan: taskToEdit.tindakan || '',
        prioritas: taskToEdit.prioritas || 'Sedang',
        batas_waktu: taskToEdit.batas_waktu ? taskToEdit.batas_waktu.split('T')[0] : '',
        status: taskToEdit.status || 'belum',
        hasil: taskToEdit.hasil || ''
      });
    } else {
      setFormData({
        surat_id: '',
        tindakan: '',
        prioritas: 'Sedang',
        batas_waktu: '',
        status: 'belum',
        hasil: ''
      });
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (taskToEdit) {
        // Edit mode (status & hasil)
        await axios.put(`/api/tindak_lanjut/${taskToEdit.id}`, {
          status: formData.status,
          hasil: formData.hasil
        });
      } else {
        // Create mode
        await axios.post('/api/tindak_lanjut', {
          surat_id: formData.surat_id,
          tindakan: formData.tindakan,
          prioritas: formData.prioritas,
          batas_waktu: formData.batas_waktu,
          status: 'belum'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan tindak lanjut", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {taskToEdit ? 'Update Tindak Lanjut' : 'Tambah Tindak Lanjut Baru'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {!taskToEdit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Terkait Surat / Disposisi <span className="text-rose-500">*</span></label>
              <select 
                required 
                name="surat_id" 
                value={formData.surat_id} 
                onChange={handleChange} 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                <option value="" disabled>Pilih Surat...</option>
                {suratList.map(s => (
                  <option key={s.id} value={s.id}>{s.no_surat} - {s.perihal}</option>
                ))}
              </select>
            </div>
          )}

          {taskToEdit && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-2">
              <p className="text-xs font-semibold text-indigo-400 mb-1">Terkait Surat</p>
              <p className="text-sm text-slate-200">{taskToEdit.no_surat}</p>
              <p className="text-sm text-slate-400 line-clamp-2">{taskToEdit.perihal}</p>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Tindakan / Penugasan <span className="text-rose-500">*</span></label>
            <input 
              required 
              name="tindakan" 
              value={formData.tindakan} 
              onChange={handleChange} 
              disabled={!!taskToEdit}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50" 
              placeholder="Contoh: Menyusun draft balasan..." 
            />
          </div>

          {!taskToEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Prioritas</label>
                <select 
                  name="prioritas" 
                  value={formData.prioritas} 
                  onChange={handleChange} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Batas Waktu</label>
                <input 
                  type="date" 
                  name="batas_waktu" 
                  value={formData.batas_waktu} 
                  onChange={handleChange} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
          )}

          {taskToEdit && (
            <>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <AlertCircle size={16} /> Update Progres
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, status: 'belum'}))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.status === 'belum' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  Belum Mulai
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, status: 'proses'}))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.status === 'proses' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-indigo-900/30'}`}
                >
                  Proses
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, status: 'selesai'}))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.status === 'selesai' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-emerald-900/30'}`}
                >
                  Selesai
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Hasil / Keterangan</label>
                <textarea 
                  name="hasil" 
                  value={formData.hasil} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="Deskripsikan hasil pengerjaan atau kendala..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/60 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2">
              {loading ? 'Menyimpan...' : <><Save size={16} /> Simpan Data</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
