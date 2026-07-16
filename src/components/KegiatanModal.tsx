import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, Users, Info, Building2, AlignLeft } from 'lucide-react';

interface KegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kegiatanData?: any;
}

const BIDANG_OPTIONS = [
  'SD.I (Perencanaan)',
  'SD.II (Infrastruktur)',
  'SD.III (Pembangunan)',
  'TU (Tata Usaha)',
  'Lainnya'
];

export default function KegiatanModal({ isOpen, onClose, onSuccess, kegiatanData }: KegiatanModalProps) {
  const isEdit = !!kegiatanData;
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    bidang: 'SD.I (Perencanaan)',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    penyelenggara: '',
    deskripsi: '',
    status: 'Direncanakan'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && kegiatanData) {
      setFormData({
        nama_kegiatan: kegiatanData.nama_kegiatan || '',
        bidang: kegiatanData.bidang || 'SD.I (Perencanaan)',
        tanggal_mulai: kegiatanData.tanggal_mulai ? kegiatanData.tanggal_mulai.slice(0, 16) : '',
        tanggal_selesai: kegiatanData.tanggal_selesai ? kegiatanData.tanggal_selesai.slice(0, 16) : '',
        lokasi: kegiatanData.lokasi || '',
        penyelenggara: kegiatanData.penyelenggara || '',
        deskripsi: kegiatanData.deskripsi || '',
        status: kegiatanData.status || 'Direncanakan'
      });
    } else {
      setFormData({
        nama_kegiatan: '',
        bidang: 'SD.I (Perencanaan)',
        tanggal_mulai: '',
        tanggal_selesai: '',
        lokasi: '',
        penyelenggara: '',
        deskripsi: '',
        status: 'Direncanakan'
      });
    }
  }, [kegiatanData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`/api/kegiatan/${kegiatanData.id}`, formData);
      } else {
        await axios.post('/api/kegiatan', formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save kegiatan", error);
      alert("Terjadi kesalahan saat menyimpan data kegiatan.");
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
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Detail / Edit Kegiatan' : 'Tambah Kegiatan Baru'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Formulir pencatatan pelaksanaan kegiatan (Rapat, FGD, Dinas Luar).
            </p>
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
          <form id="kegiatanForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nama Kegiatan</label>
              <input 
                required
                type="text"
                name="nama_kegiatan"
                value={formData.nama_kegiatan}
                onChange={handleChange}
                placeholder="Misal: Rapat Koordinasi Penyusunan RKPD"
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Building2 size={16} className="text-indigo-400" />
                  Bidang Pengampu
                </label>
                <select
                  name="bidang"
                  value={formData.bidang}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {BIDANG_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Info size={16} className="text-amber-400" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Direncanakan">Direncanakan</option>
                  <option value="Berlangsung">Berlangsung</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-400" />
                  Waktu Mulai
                </label>
                <input 
                  required
                  type="datetime-local"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar size={16} className="text-rose-400" />
                  Waktu Selesai
                </label>
                <input 
                  required
                  type="datetime-local"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <MapPin size={16} className="text-blue-400" />
                  Lokasi
                </label>
                <input 
                  required
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  placeholder="Misal: Hotel Borobudur"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Users size={16} className="text-purple-400" />
                  Penyelenggara
                </label>
                <input 
                  required
                  type="text"
                  name="penyelenggara"
                  value={formData.penyelenggara}
                  onChange={handleChange}
                  placeholder="Instansi / Direktorat"
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <AlignLeft size={16} className="text-slate-400" />
                Deskripsi / Catatan
              </label>
              <textarea 
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsi singkat kegiatan, hasil yang diharapkan, dsb..."
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
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
            form="kegiatanForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Kegiatan')}
          </button>
        </div>

      </div>
    </div>
  );
}
