import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('dashtu_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('dashtu_user');
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/60 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Cari surat, kegiatan, atau disposisi..." 
          className="w-full bg-slate-900/50 border border-slate-800/80 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800/50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200 leading-tight">{user.nama || 'Administrator'}</span>
            <span className="text-xs text-slate-500 font-medium">{user.role || 'Admin'}</span>
          </div>
          <button onClick={handleLogout} className="p-1 text-slate-500 hover:text-slate-300 ml-1">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
