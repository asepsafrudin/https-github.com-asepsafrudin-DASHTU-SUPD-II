import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Login() {
  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_EMAIL || '');
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_PASSWORD || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to our FastAPI backend
      const response = await axios.post('/api/login', {
        email,
        password
      });
      
      localStorage.setItem('dashtu_user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      
      <div className="w-full max-w-md p-6 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] mb-6 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DASHTU SUPD II</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">Dashboard Terpadu Tata Usaha<br/>Direktorat Sinkronisasi Urusan Pemerintahan Daerah II</p>
        </div>

        <GlassCard className="p-8 border-slate-700/60">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1">Email Pegawai</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="admin@supd2.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Masuk Sistem
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </GlassCard>
        
        <p className="text-center text-xs text-slate-500 mt-8">
          Sistem Pemerintahan Berbasis Elektronik (SPBE)<br/>© 2026 Kemendagri RI
        </p>
      </div>
    </div>
  );
}
