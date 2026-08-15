import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { verifyPassword, setAuthed } from '@/lib/auth';

interface LoginScreenProps {
  onSuccess: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPassword(password)) {
      setAuthed(true);
      onSuccess();
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0f1e] via-[#0d1424] to-[#0a0f1e] px-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121828] to-[#0e1420] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-400">Enter your password to access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Password"
                autoFocus
                className="w-full rounded-xl border border-sky-500/30 bg-[#0a0f1e] px-4 py-3.5 pr-12 text-sm font-semibold text-white placeholder-slate-600 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400">
                Incorrect password. {attempts >= 3 ? 'Please try again carefully.' : 'Please try again.'}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
            >
              <Lock className="h-4 w-4" />
              Login
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-600">
            Default password: admin123 (change it after login from Site Settings)
          </p>
        </div>
      </div>
    </div>
  );
}
