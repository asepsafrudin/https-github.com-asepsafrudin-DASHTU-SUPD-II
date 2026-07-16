import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, FileText, Calendar, User, AlignLeft, UploadCloud } from 'lucide-react';

interface LaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LaporanModal({ isOpen, onClose, onSuccess }: LaporanModalProps) {
  const [formData, setFormData] = useState({
    judul_laporan: '',
    sumber: 'Kegiatan',
    sumber_id: '',
    tanggal_laporan: new Date().toISOString().slice(0, 10),
    pembuat: '',
    deskripsi: '',
    status: 'Final'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("File lampiran wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('judul_laporan', formData.judul_laporan);
      data.append('sumber', formData.sumber);
      data.append('sumber_id', formData.sumber_id);
      data.append('tanggal_laporan', formData.tanggal_laporan);
      data.append('pembuat', formData.pembuat);
      data.append('deskripsi', formData.deskripsi);
      data.append('status', formData.status);
      data.append('file', selectedFile);

      await axios.post('/api/laporan', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to upload laporan", error);
      alert("Terjadi kesalahan saat mengunggah laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-white">Unggah Laporan Baru</h2>
            <p className="text-sm text-slate-400 mt-0.5">Arsipkan dokumen hasil kegiatan atau tindak lanjut.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="laporanForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Judul Laporan</label>
              <input 
                required
                type="text"
                name="judul_laporan"
                value={formData.judul_laporan}
                onChange={handleChange}
                placeholder="Misal: Notulensi Rapat Koordinasi..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-400" />
                  Sumber Modul
                </label>
                <select
                  name="sumber"
                  value={formData.sumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Kegiatan">Manajemen Kegiatan</option>
                  <option value="Tindak Lanjut">Tindak Lanjut</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-400" />
                  Tanggal Laporan
                </label>
                <input 
                  required
                  type="date"
                  name="tanggal_laporan"
                  value={formData.tanggal_laporan}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <User size={16} className="text-amber-400" />
                Pembuat Laporan
              </label>
              <input 
                required
                type="text"
                name="pembuat"
                value={formData.pembuat}
                onChange={handleChange}
                placeholder="Nama penyusun atau bagian terkait"
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <AlignLeft size={16} className="text-slate-400" />
                Deskripsi
              </label>
              <textarea 
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={3}
                placeholder="Keterangan opsional mengenai lampiran dokumen..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-sky-400" />
                Unggah File Laporan <span className="text-rose-400">*wajib</span>
              </label>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${
                  selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/80 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                
                {selectedFile ? (
                  <>
                    <FileText size={32} className="text-emerald-400 mb-2" />
                    <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button type="button" className="text-xs text-indigo-400 mt-3 hover:underline">
                      Ganti file
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-slate-500 mb-2" />
                    <p className="text-sm font-medium text-slate-300">Klik untuk memilih file dokumen</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, Word, Excel (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 bg-slate-800/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="laporanForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Mengunggah...' : 'Unggah & Simpan'}
          </button>
        </div>

      </div>
    </div>
  );
}
