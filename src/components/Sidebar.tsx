import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mail, Calendar, FileText, CheckSquare, Settings, BookOpen, Archive, Image as ImageIcon, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Mail, label: 'Surat', path: '/surat' },
    { icon: Calendar, label: 'Agenda Pimpinan', path: '/agenda' },
    { icon: FileText, label: 'Kegiatan', path: '/kegiatan' },
    { icon: FileText, label: 'Laporan', path: '/laporan' },
    { icon: CheckSquare, label: 'Tindak Lanjut', path: '/tindak-lanjut' },
    { icon: BookOpen, label: 'Bank Paparan', path: '/paparan' },
    { icon: Archive, label: 'Arsip Digital', path: '/arsip' },
    { icon: ImageIcon, label: 'Dokumentasi', path: '/dokumentasi' },
    { icon: Monitor, label: 'Output Display (TV)', path: '/tv-display' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 backdrop-blur-lg flex flex-col transition-all">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <LayoutDashboard size={18} className="text-indigo-400" />
          </div>
          DASHTU SUPD II
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
            )}
          >
            <item.icon size={18} className="group-hover:scale-110 transition-transform" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/60">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent transition-all group"
        >
          <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          Pengaturan
        </NavLink>
      </div>
    </aside>
  );
}
