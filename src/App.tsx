import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Surat from './pages/Surat';
import Agenda from './pages/Agenda';
import TindakLanjut from './pages/TindakLanjut';
import Kegiatan from './pages/Kegiatan';
import Laporan from './pages/Laporan';
import BahanPaparan from './pages/BahanPaparan';
import Arsip from './pages/Arsip';
import Dokumentasi from './pages/Dokumentasi';
import Pengaturan from './pages/Pengaturan';
import TVDisplay from './pages/TVDisplay';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/tv-display" element={<TVDisplay />} />
        
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="surat" element={<Surat />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="tindak-lanjut" element={<TindakLanjut />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="paparan" element={<BahanPaparan />} />
          <Route path="kegiatan" element={<Kegiatan />} />
          <Route path="arsip" element={<Arsip />} />
          <Route path="dokumentasi" element={<Dokumentasi />} />
          <Route path="settings" element={<Pengaturan />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
