import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, Image as ImageIcon, User, MapPin } from 'lucide-react';

interface DokumentasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DokumentasiModal({ isOpen, onClose, onSuccess }: DokumentasiModalProps) {
  const [formData, setFormData] = useState({
    judul_kegiatan: '',
    tanggal_kegiatan: new Date().toISOString().slice(0, 10),
    lokasi: '',
    kategori: 'Rapat',
    uploader: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validasi max 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setSelectedFile(file);
      
      // Buat preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Foto dokumentasi wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('judul_kegiatan', formData.judul_kegiatan);
      data.append('tanggal_kegiatan', formData.tanggal_kegiatan);
      data.append('lokasi', formData.lokasi);
      data.append('kategori', formData.kategori);
      data.append('uploader', formData.uploader);
      data.append('file', selectedFile);

      await axios.post('/api/dokumentasi', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to upload dokumentasi", error);
      alert("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/30 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="text-pink-400" />
              Unggah Dokumentasi Kegiatan
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Simpan bukti foto kegiatan (Maksimal 5MB).</p>
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
          <form id="dokForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nama Acara / Kegiatan</label>
              <input 
                required
                type="text"
                name="judul_kegiatan"
                value={formData.judul_kegiatan}
                onChange={handleChange}
                placeholder="Misal: Kunjungan Kerja ke Balikpapan..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tanggal Kegiatan</label>
                <input 
                  required
                  type="date"
                  name="tanggal_kegiatan"
                  value={formData.tanggal_kegiatan}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Kategori</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="Rapat">Rapat / Koordinasi</option>
                  <option value="Kunjungan Lapangan">Kunjungan Lapangan</option>
                  <option value="Sosialisasi">Sosialisasi / Bimbingan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <MapPin size={16} className="text-rose-400" />
                  Lokasi
                </label>
                <input 
                  required
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  placeholder="Misal: Hotel Borobudur"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <User size={16} className="text-amber-400" />
                  Nama Fotografer / Uploader
                </label>
                <input 
                  required
                  type="text"
                  name="uploader"
                  value={formData.uploader}
                  onChange={handleChange}
                  placeholder="Nama staf"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <UploadCloud size={16} className="text-sky-400" />
                Pilih Foto <span className="text-rose-400">*</span>
              </label>
              
              <div 
                className={`relative border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
                  previewUrl ? 'border-pink-500/50 bg-black/50 p-1' : 'border-slate-700/80 bg-slate-900/50 hover:border-pink-500/50 hover:bg-slate-800 p-8 min-h-[200px]'
                }`}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-[300px] object-contain rounded-lg" />
                    <button 
                      type="button" 
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 transition-colors shadow-lg backdrop-blur-sm"
                      title="Hapus foto"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 text-xs text-white rounded-md backdrop-blur-md font-medium flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                      <span className="text-slate-300 border-l border-slate-600 pl-2">
                        {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-3">
                      <ImageIcon size={32} className="text-pink-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">Klik untuk memilih foto dari perangkat</p>
                    <p className="text-xs text-slate-500 mt-1.5 text-center max-w-xs">
                      Mendukung JPG, PNG, WEBP.<br/>Ukuran file maksimal dibatasi 5MB untuk menghemat ruang server.
                    </p>
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
            form="dokForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-pink-600 hover:bg-pink-500 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Mengunggah...' : 'Unggah Foto'}
          </button>
        </div>

      </div>
    </div>
  );
}
