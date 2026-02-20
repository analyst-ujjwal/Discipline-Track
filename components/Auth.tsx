
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User | null;
      if (isLogin) {
        user = await authService.login(email, password);
        if (!user) setError('Invalid credentials.');
      } else {
        user = await authService.signup(email, password);
        if (!user) setError('User already exists.');
      }

      if (user) {
        onAuthSuccess(user);
      }
    } catch (err) {
      setError('A system error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-indigo-500 mb-2 uppercase">Discipline Track</h1>
          <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">Behavioral Management System</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6">{isLogin ? 'Initialize Session' : 'Create User Entity'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Electronic Mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="identity@discipline.track"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'AUTHORIZE' : 'REGISTER')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 text-xs font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Switch to Registration' : 'Return to Login'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
          Strict Isolation Protocol Active • Encrypted Session
        </p>
      </div>
    </div>
  );
};

export default Auth;
