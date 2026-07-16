import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import axios from 'axios';

interface SuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  jenis: 'masuk_internal' | 'masuk_eksternal' | 'undangan' | 'keluar' | 'keluar_manual';
  onSuccess: () => void;
}

export default function SuratModal({ isOpen, onClose, jenis, onSuccess }: SuratModalProps) {
  const [formData, setFormData] = useState({
    no_surat: '',
    subdit: '',
    perihal: '',
    deskripsi: '',
    tgl_surat: new Date().toISOString().split('T')[0],
    pengirim: '',
    tujuan: '',
    sifat: 'Biasa',
    lampiran: '',
    no_referensi: '',
    kode_ula: '',
    tgl_diterima: new Date().toISOString().split('T')[0],
    no_agenda: '',
    dispo_dari: '',
    diteruskan_kepada: '',
    arahan: '',
    catatan: '',
    tgl_disposisi: new Date().toISOString().split('T')[0],
    judul_acara: '',
    penyelenggara: '',
    lokasi: '',
    waktu_mulai: '',
    waktu_selesai: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/surat', {
        ...formData,
        jenis
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan surat", error);
      alert("Gagal menyimpan surat");
    } finally {
      setLoading(false);
    }
  };

  // Rendering for Surat Masuk (Internal & Eksternal) which has Disposisi and Undangan which has Agenda
  if (jenis.startsWith('masuk') || jenis === 'undangan') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
            <h2 className="text-xl font-bold text-white">
              {jenis === 'masuk_internal' ? 'Ingest Surat Masuk (Internal) + Disposisi' : 
               jenis === 'undangan' ? 'Ingest Surat Undangan + Agenda' :
               'Ingest Surat Masuk (Eksternal) + Disposisi'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* KOLOM KIRI: METADATA SURAT */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-700 pb-2">Bagian A: Metadata Surat</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Pengirim (Dari)</label>
                    <input required name="pengirim" value={formData.pengirim} onChange={handleChange} list={jenis === 'masuk_internal' ? 'pengirim-internal' : 'pengirim-eksternal'} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Pilih instansi..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tujuan (Kepada)</label>
                    <input required name="tujuan" value={formData.tujuan} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Direktur SUPD II" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">No. Surat</label>
                    <input required name="no_surat" value={formData.no_surat} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Nomor fisik surat..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tanggal Surat</label>
                    <input required type="date" name="tgl_surat" value={formData.tgl_surat} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Perihal (Hal)</label>
                  <input required name="perihal" value={formData.perihal} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ringkasan perihal surat..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Sifat</label>
                    <input required name="sifat" value={formData.sifat} onChange={handleChange} list="sifat-options" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    <datalist id="sifat-options">
                      <option value="Biasa" />
                      <option value="Segera" />
                      <option value="Sangat Segera" />
                      <option value="Rahasia" />
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Lampiran</label>
                    <input name="lampiran" value={formData.lampiran} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Misal: 1 Berkas" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Nomor Referensi (Awal Paragraf)</label>
                    <input name="no_referensi" value={formData.no_referensi} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Nomor referensi..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Catatan Kaki (Kode & Tgl ULA)</label>
                    <input name="kode_ula" value={formData.kode_ula} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Kode ULA..." />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: LEMBAR DISPOSISI / AGENDA */}
              <div className="space-y-4">
                {jenis === 'undangan' ? (
                  <>
                    <h3 className="text-sm font-semibold text-amber-400 border-b border-slate-700 pb-2">Bagian B: Detail Acara & Agenda</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Judul Acara / Rapat</label>
                      <input required name="judul_acara" value={formData.judul_acara} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Rapat Pembahasan..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Penyelenggara / Pengundang</label>
                      <input required name="penyelenggara" value={formData.penyelenggara} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Kementerian X..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Lokasi Acara</label>
                      <input required name="lokasi" value={formData.lokasi} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Zoom / Hotel Y..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Waktu Mulai</label>
                        <input required type="datetime-local" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Waktu Selesai</label>
                        <input required type="datetime-local" name="waktu_selesai" value={formData.waktu_selesai} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-amber-400 border-b border-slate-700 pb-2">Bagian B: Lembar Disposisi Pimpinan</h3>
                    
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">No. Agenda Pimpinan</label>
                    <input required name="no_agenda" value={formData.no_agenda} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="0001/L" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tgl Diterima Pimpinan</label>
                    <input required type="date" name="tgl_diterima" value={formData.tgl_diterima} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tgl Paraf Disposisi</label>
                    <input required type="date" name="tgl_disposisi" value={formData.tgl_disposisi} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Pemberi Disposisi</label>
                    <select required name="dispo_dari" value={formData.dispo_dari} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                      <option value="" disabled>Pilih...</option>
                      <option value="Dirjen">Dirjen</option>
                      <option value="Sekretaris Ditjen">Sekretaris Ditjen</option>
                      <option value="TU Pimpinan">TU Pimpinan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Diteruskan Kepada <span className="text-slate-500 font-normal">(bisa lebih dari satu)</span></label>
                  <input required name="diteruskan_kepada" value={formData.diteruskan_kepada} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Contoh: Direktur SUPD II, Direktur SUPD III" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Arahan</label>
                  <input required name="arahan" value={formData.arahan} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Proses lebih lanjut sesuai ketentuan" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Catatan</label>
                  <textarea name="catatan" value={formData.catatan} onChange={handleChange} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Catatan tambahan dari pimpinan..."></textarea>
                </div>
                </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/60 mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Batal</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2">
                {loading ? 'Menyimpan...' : <><Send size={16} /> Simpan {jenis === 'undangan' ? 'Surat & Agenda' : 'Surat & Disposisi'}</>}
              </button>
            </div>
            
            {/* Datalists for Pengirim */}
            <datalist id="pengirim-internal">
              <option value="Sekretariat Ditjen Bina Bangda" />
              <option value="Direktorat SUPD I" />
              <option value="Direktorat SUPD III" />
              <option value="Direktorat SUPD IV" />
              <option value="Direktorat PEIPD" />
            </datalist>
            <datalist id="pengirim-eksternal">
              <option value="Kementerian PPN/Bappenas" />
              <option value="Sekretariat Jenderal Kemendagri" />
              <option value="Biro SDM Kemendagri" />
              <option value="Biro Hukum Kemendagri" />
              <option value="Biro Perencanaan Kemendagri" />
              <option value="Pusat Fasilitasi Kerja Sama Kemendagri" />
              <option value="BPKP" />
              <option value="Menteri LH/BPLH" />
            </datalist>
          </form>
        </div>
      </div>
    );
  }

  // Original Rendering for Surat Keluar
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">
            {jenis === 'keluar_manual' ? 'Booking Nomor Surat Keluar' : 'Tambah Surat Keluar (dari Srikandi)'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {jenis === 'keluar_manual' ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Subdit</label>
                <select required name="subdit" value={formData.subdit} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                  <option value="" disabled>Pilih Subdit</option>
                  <option value="SD.I">Subdit I (SD.I)</option>
                  <option value="SD.II">Subdit II (SD.II)</option>
                  <option value="SD.III">Subdit III (SD.III)</option>
                  <option value="SD.IV">Subdit IV (SD.IV)</option>
                  <option value="SD.V">Subdit V (SD.V)</option>
                  <option value="SD.VI">Subdit VI (SD.VI)</option>
                  <option value="TU">Tata Usaha (TU)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">No. Surat</label>
                <input required name="no_surat" value={formData.no_surat} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="001/XYZ/2023" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Tanggal Surat</label>
              <input required type="date" name="tgl_surat" value={formData.tgl_surat} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Perihal {jenis === 'keluar_manual' && <span className="text-slate-500 text-xs">(Opsional)</span>}</label>
            <input required={jenis !== 'keluar_manual'} name="perihal" value={formData.perihal} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Undangan Rapat Koordinasi" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Pengirim {jenis === 'keluar_manual' && <span className="text-slate-500 text-xs">(Opsional)</span>}</label>
              <input 
                required={jenis !== 'keluar_manual'} 
                name="pengirim" 
                value={formData.pengirim} 
                onChange={handleChange} 
                list="pengirim-options"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                placeholder="Pilih atau ketik pengirim..." 
              />
              <datalist id="pengirim-options">
                <option value="Direktur SUPD II" />
                <option value="PPK Direktorat SUPD II" />
                <option value="Kasubag TU" />
                <option value="PPTK" />
                <option value="BPP" />
                <option value="PLH Direktur SUPD II" />
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Tujuan {jenis === 'keluar_manual' && <span className="text-slate-500 text-xs">(Opsional)</span>}</label>
              <input 
                required={jenis !== 'keluar_manual'} 
                name="tujuan" 
                value={formData.tujuan} 
                onChange={handleChange} 
                list="tujuan-options"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                placeholder="Pilih atau ketik tujuan..." 
              />
              <datalist id="tujuan-options">
                <option value="Sekretaris Ditjen" />
                <option value="Kuasa Pengguna Anggaran" />
                <option value="Direktur SUPD II" />
                <option value="Dirjen Bangda" />
                <option value="PPK" />
                <option value="PPSPM" />
                <option value="PPBJ" />
                <option value="Kepala Bagian Umum" />
                <option value="UKPBJ" />
              </datalist>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Deskripsi Singkat / Catatan</label>
            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={3} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ringkasan atau catatan tambahan..."></textarea>
          </div>
          
          {jenis === 'keluar_manual' && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300 mt-2">
              <strong>Info:</strong> Nomor Surat dan Register akan di-generate otomatis saat disimpan.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2">
              {loading ? 'Menyimpan...' : <><Send size={16} /> Simpan Surat</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
