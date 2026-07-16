import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, FileText, User } from 'lucide-react';

interface PaparanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaparanModal({ isOpen, onClose, onSuccess }: PaparanModalProps) {
  const [formData, setFormData] = useState({
    judul_paparan: '',
    uploader: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert("File bahan paparan wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('judul_paparan', formData.judul_paparan);
      data.append('uploader', formData.uploader);
      data.append('file', selectedFile);

      await axios.post('/api/paparan', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to upload paparan", error);
      alert("Terjadi kesalahan saat mengunggah bahan paparan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-white">Unggah Bahan Paparan</h2>
            <p className="text-sm text-slate-400 mt-0.5">Simpan materi presentasi ke repositori pusat.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="paparanForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Judul Paparan</label>
              <input 
                required
                type="text"
                name="judul_paparan"
                value={formData.judul_paparan}
                onChange={handleChange}
                placeholder="Misal: Paparan SPBE 2026..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                placeholder="Nama staf atau bagian"
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-sky-400" />
                File Presentasi (PDF/PPT)
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
                  accept=".pdf,.ppt,.pptx"
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
                    <p className="text-xs text-slate-500 mt-1">Hanya mendukung PDF dan PPT (Maks 20MB)</p>
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
            form="paparanForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Mengunggah...' : 'Unggah ke Repositori'}
          </button>
        </div>

      </div>
    </div>
  );
}
