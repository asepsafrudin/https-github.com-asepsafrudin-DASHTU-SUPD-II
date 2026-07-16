import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, FileText, User, Archive, Key } from 'lucide-react';

interface ArsipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ArsipModal({ isOpen, onClose, onSuccess }: ArsipModalProps) {
  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Surat Keputusan',
    kode_klasifikasi: '',
    no_dokumen: '',
    uploader: '',
    status: 'Aktif'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      alert("File arsip wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('judul', formData.judul);
      data.append('kategori', formData.kategori);
      data.append('kode_klasifikasi', formData.kode_klasifikasi);
      data.append('no_dokumen', formData.no_dokumen);
      data.append('uploader', formData.uploader);
      data.append('status', formData.status);
      data.append('file', selectedFile);

      await axios.post('/api/arsip', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to upload arsip", error);
      alert("Terjadi kesalahan saat mengunggah arsip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/30 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Archive className="text-indigo-400" />
              Unggah Arsip Digital
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Simpan regulasi, SK, atau dokumen resmi lainnya.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="arsipForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Judul Dokumen</label>
              <input 
                required
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                placeholder="Misal: Perdirjen Bina Bangda Tahun 2026..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Kategori</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Surat Keputusan">Surat Keputusan (SK)</option>
                  <option value="Regulasi">Regulasi / Aturan</option>
                  <option value="Surat Edaran">Surat Edaran (SE)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Key size={16} className="text-emerald-400" />
                  Kode Klasifikasi
                </label>
                <input 
                  type="text"
                  name="kode_klasifikasi"
                  value={formData.kode_klasifikasi}
                  onChange={handleChange}
                  placeholder="Opsional (Misal: HM.01.02)"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">No. Dokumen Resmi</label>
                <input 
                  type="text"
                  name="no_dokumen"
                  value={formData.no_dokumen}
                  onChange={handleChange}
                  placeholder="Misal: 100.3.3/200/V/2026"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <User size={16} className="text-amber-400" />
                  Nama Pengunggah
                </label>
                <input 
                  required
                  type="text"
                  name="uploader"
                  value={formData.uploader}
                  onChange={handleChange}
                  placeholder="Nama staf"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-sky-400" />
                File Dokumen (PDF/Word) <span className="text-rose-400">*</span>
              </label>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/80 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                
                {selectedFile ? (
                  <>
                    <FileText size={32} className="text-emerald-400 mb-2" />
                    <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-slate-500 mb-2" />
                    <p className="text-sm font-medium text-slate-300">Klik untuk memilih file dokumen</p>
                    <p className="text-xs text-slate-500 mt-1">Mendukung PDF dan Word (Maks 15MB)</p>
                  </>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 bg-slate-800/30 flex justify-end gap-3 shrink-0">
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
            form="arsipForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Mengunggah...' : 'Unggah Arsip'}
          </button>
        </div>

      </div>
    </div>
  );
}
