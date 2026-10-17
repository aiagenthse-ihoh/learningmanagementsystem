import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { UserRole } from '../../types/lcms';
import {
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, canDismiss = true }) => {
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDeptId, setRegDeptId] = useState('');
  const [regPosId, setRegPosId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('employee');

  const departments = store.getDepartments();
  const positions = store.getPositions();
  const users = store.getUsers();

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error('Masukkan alamat email');
      return;
    }

    const res = store.login(loginEmail, loginPassword);
    if (res.success && res.user) {
      toast.success(
        'Login Berhasil!',
        `Selamat datang kembali, ${res.user.name} (${res.user.role.toUpperCase()}).`
      );
      if (onClose) onClose();
    } else {
      toast.error('Login Gagal', res.error || 'Email atau kata sandi tidak valid.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error('Nama lengkap dan email wajib diisi');
      return;
    }

    const res = store.register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword || 'password123',
      department_id: regDeptId || departments[0]?.id,
      position_id: regPosId || positions[0]?.id,
      role: regRole,
    });

    if (res.success && res.user) {
      toast.success(
        'Pendaftaran Berhasil!',
        `Akun ${res.user.name} berhasil didaftarkan dan langsung masuk ke sistem.`
      );
      if (onClose) onClose();
    } else {
      toast.error('Pendaftaran Gagal', res.error || 'Terjadi kesalahan.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (canDismiss && onClose) onClose();
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">LCMS Enterprise Portal</h3>
              <p className="text-xs text-slate-400">Autentikasi & Pemantauan Peserta</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Terdaftar *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="nama@lcms.corp"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full font-bold shadow-md"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Masuk ke Aplikasi
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendra Wijaya"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Perusahaan *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="hendra@lcms.corp"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Departemen
                  </label>
                  <select
                    value={regDeptId}
                    onChange={(e) => setRegDeptId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Posisi Jabatan
                  </label>
                  <select
                    value={regPosId}
                    onChange={(e) => setRegPosId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_jabatan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Peran Awal
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-teal-900"
                  >
                    <option value="employee">Peserta / Karyawan</option>
                    <option value="trainer">Trainer Pengajar</option>
                    <option value="supervisor">Supervisor Tim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                variant="emerald"
                type="submit"
                className="w-full font-bold shadow-md mt-2"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Daftar & Masuk Sekarang
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
