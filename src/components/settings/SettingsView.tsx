import React, { useState, useEffect } from 'react';
import { store } from '../../lib/storage';
import { ConfigOption, User, UserRole, UserPermissions, PermissionDefinition } from '../../types/lcms';
import {
  Settings,
  Database,
  Users,
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Shield,
  Layers,
  KeyRound,
  ShieldAlert,
  Info,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { getDefaultPermissionsForRole } from '../../lib/storage';

export const SettingsView: React.FC = () => {
  const toast = useToast();
  const [tab, setTab] = useState<'checklists' | 'users' | 'schema'>('checklists');

  // Trigger state for re-rendering on store updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  // Master options & permissions
  const users = store.getUsers();
  const allConfigOptions = store.getConfigOptions(undefined, true);
  const categories = store.getConfigCategories();
  const permissionDefs = store.getPermissionDefs();

  // Category filter for checklist tab
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Option Modal State
  const [optModalOpen, setOptModalOpen] = useState(false);
  const [editingOpt, setEditingOpt] = useState<ConfigOption | null>(null);
  const [optCategory, setOptCategory] = useState<string>('pemenuhan');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [optLabel, setOptLabel] = useState('');

  // User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [userPassword, setUserPassword] = useState('password123');

  // Permission Checklist Modal State
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [userPermsDraft, setUserPermsDraft] = useState<UserPermissions>(
    getDefaultPermissionsForRole('employee')
  );

  // New Custom Permission Modal State
  const [newPermModalOpen, setNewPermModalOpen] = useState(false);
  const [newPermTitle, setNewPermTitle] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');

  // Confirm Delete Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Copy Schema State
  const [copiedSchema, setCopiedSchema] = useState(false);

  const sampleSchema = `-- LCMS Enterprise - Supabase PostgreSQL Schema & RLS DDL
-- Auto-generated from PRD Specifications

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_jabatan TEXT NOT NULL,
  kode TEXT,
  department_id UUID,
  deskripsi TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS competency_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_level TEXT NOT NULL,
  urutan INT NOT NULL,
  deskripsi TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS position_competency_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID REFERENCES positions(id),
  competency_id UUID REFERENCES competencies(id),
  required_level_id UUID REFERENCES competency_levels(id),
  wajib BOOLEAN DEFAULT true,
  pemenuhan_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  tindakan_gap JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_position_competency UNIQUE (position_id, competency_id)
);

ALTER TABLE position_competency_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_manage_matrix ON position_competency_requirements
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');
`;

  // Toggle active/inactive status for checklist option
  const handleToggleOptionStatus = (opt: ConfigOption) => {
    store.toggleConfigOptionStatus(opt.id);
    const newStatus = opt.status === 'active' ? 'dinonaktifkan' : 'diaktifkan';
    toast.success('Status Checklist Diubah', `Opsi "${opt.label}" ${newStatus}.`);
  };

  // Handle Option Save
  const handleSaveOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optLabel.trim()) {
      toast.error('Label opsi checklist wajib diisi');
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim().toLowerCase().replace(/\s+/g, '_')
      : optCategory;

    if (!finalCategory) {
      toast.error('Kategori checklist wajib diisi');
      return;
    }

    try {
      if (editingOpt) {
        store.updateConfigOption(editingOpt.id, optLabel.trim());
        toast.success('Opsi Diperbarui');
      } else {
        store.addConfigOption(finalCategory, optLabel.trim());
        toast.success(
          'Opsi Checklist Baru Tersimpan',
          `"${optLabel}" kini langsung muncul di checklist sistem.`
        );
      }
      setOptModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Opsi', err.message);
    }
  };

  const handleDeleteOption = (opt: ConfigOption) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Opsi Checklist',
      message: `Apakah Anda yakin ingin menghapus opsi "${opt.label}" dari checklist ${opt.category}? Tindakan ini permanen.`,
      onConfirm: () => {
        store.deleteConfigOption(opt.id);
        toast.success('Opsi Dihapus', `Opsi "${opt.label}" berhasil dihapus.`);
      },
    });
  };

  // Handle User Save
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Nama dan email wajib diisi');
      return;
    }

    try {
      if (editingUser) {
        store.updateUser(editingUser.id, {
          name: userName.trim(),
          email: userEmail.trim(),
          role: userRole,
          password: userPassword,
        });
        toast.success('Pengguna Diperbarui');
      } else {
        store.addUser({
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword,
          role: userRole,
          status: 'active',
          permissions: getDefaultPermissionsForRole(userRole),
        });
        toast.success('Pengguna Baru Dibuat');
      }
      setUserModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Pengguna', err.message);
    }
  };

  const handleDeleteUser = (u: User) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      message: `Apakah Anda yakin ingin menghapus akun "${u.name}" (${u.email})?`,
      onConfirm: () => {
        try {
          store.deleteUser(u.id);
          toast.success('Pengguna Dihapus', `Akun "${u.name}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Open Permission Checklist Modal
  const handleOpenPermModal = (user: User) => {
    setPermUser(user);
    setUserPermsDraft({
      ...(user.permissions || getDefaultPermissionsForRole(user.role)),
    });
    setPermModalOpen(true);
  };

  // Save Permission Checklist
  const handleSavePermissions = () => {
    if (!permUser) return;
    store.updateUserPermissions(permUser.id, userPermsDraft);
    toast.success(
      'Hak Akses Berhasil Disimpan!',
      `Pengaturan izin checklist untuk ${permUser.name} telah diperbarui dan langsung aktif di seluruh fitur.`
    );
    setPermModalOpen(false);
  };

  // Permission toggler
  const handleTogglePerm = (key: string) => {
    setUserPermsDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Bulk check/uncheck all
  const handleCheckAllPerms = () => {
    const updated: UserPermissions = { ...userPermsDraft };
    permissionDefs.forEach((p) => {
      updated[p.key] = true;
    });
    setUserPermsDraft(updated);
    toast.info('Semua Izin Dicentang');
  };

  const handleUncheckAllPerms = () => {
    const updated: UserPermissions = { ...userPermsDraft };
    permissionDefs.forEach((p) => {
      updated[p.key] = false;
    });
    setUserPermsDraft(updated);
    toast.info('Semua Centang Dihapus');
  };

  // Presets
  const applyPreset = (presetRole: UserRole) => {
    setUserPermsDraft(getDefaultPermissionsForRole(presetRole));
    toast.info('Preset Diterapkan', `Hak akses disetel ke default ${presetRole.toUpperCase()}`);
  };

  // Handle Add Custom Permission
  const handleSaveNewPerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermTitle.trim()) {
      toast.error('Nama izin wajib diisi');
      return;
    }
    const created = store.addPermissionDef(newPermTitle, newPermDesc);
    setUserPermsDraft((prev) => ({
      ...prev,
      [created.key]: true,
    }));
    toast.success('Izin Kustom Ditambahkan', `Izin "${created.title}" kini ada di checklist sistem.`);
    setNewPermModalOpen(false);
    setNewPermTitle('');
    setNewPermDesc('');
  };

  const handleDeleteCustomPerm = (perm: PermissionDefinition) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Izin Kustom',
      message: `Hapus izin "${perm.title}" dari daftar checklist sistem?`,
      onConfirm: () => {
        store.deletePermissionDef(perm.id);
        toast.info('Izin Dihapus', `Izin "${perm.title}" telah dihapus.`);
      },
    });
  };

  // Handle Reset Factory Data
  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Database Pabrik',
      message: 'PERINGATAN: Tindakan ini akan mengembalikan seluruh database LCMS, master data, dan matriks ke kondisi awal pabrik. Lanjutkan?',
      onConfirm: () => {
        store.resetToDefault();
        toast.success('Database Direset', 'Seluruh master data dan matriks telah dikembalikan ke kondisi awal.');
      },
    });
  };

  // Copy Schema SQL
  const handleCopySchema = () => {
    navigator.clipboard.writeText(sampleSchema);
    setCopiedSchema(true);
    toast.success('Disalin ke Clipboard', 'Skema SQL PostgreSQL telah disalin.');
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // Filtered config options
  const displayedOptions =
    selectedCategoryFilter === 'all'
      ? allConfigOptions
      : allConfigOptions.filter((o) => o.category === selectedCategoryFilter);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'pemenuhan':
        return 'Bukti Pemenuhan';
      case 'tindakan_gap':
        return 'Tindakan Bila Gap';
      case 'training_kategori':
        return 'Kategori Training';
      default:
        return cat.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Checklist Kustom</h1>
            <p className="text-xs text-slate-500">
              PRD 6.1 & 10: Kustomisasi manual seluruh checklist, centang/uncheck opsi, tambah/hapus checklist dinamis, dan kelola izin akses.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTab('checklists')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'checklists' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Checklist Dinamis ({allConfigOptions.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'users' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengguna & Hak Akses ({users.length})
          </button>
          <button
            onClick={() => setTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'schema' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skema DB & Migration
          </button>
        </div>
      </div>

      {/* --- TAB 1: DYNAMIC CHECKLIST OPTIONS (FULL CRUD & TOGGLE) --- */}
      {tab === 'checklists' && (
        <div className="space-y-6">
          {/* Action bar & Category Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Filter Kategori:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua ({allConfigOptions.length})
              </button>
              {categories.map((cat) => {
                const count = allConfigOptions.filter((o) => o.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {getCategoryLabel(cat)} ({count})
                  </button>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingOpt(null);
                setOptCategory(selectedCategoryFilter === 'all' ? 'pemenuhan' : selectedCategoryFilter);
                setIsCustomCategory(false);
                setCustomCategoryInput('');
                setOptLabel('');
                setOptModalOpen(true);
              }}
            >
              + Tambah Opsi Checklist
            </Button>
          </div>

          {/* Checklist Items Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Opsi Checklist Sistem (Centang/Uncheck untuk Aktif/Nonaktif Langsung)
                </h3>
                <p className="text-xs text-slate-500">
                  Super Admin dapat mencentang langsung kotak di bawah untuk mengaktifkan/menonaktifkan opsi di modul Matriks, Penilaian, dan Training.
                </p>
              </div>
            </div>

            {displayedOptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Belum ada opsi checklist pada kategori ini. Silakan klik tombol "+ Tambah Opsi Checklist".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedOptions.map((opt) => {
                  const isActive = opt.status === 'active';
                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleToggleOptionStatus(opt)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isActive ? 'text-slate-900' : 'text-slate-500 line-through'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                            {getCategoryLabel(opt.category)}
                          </span>
                        </div>
                      </label>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                          onClick={() => {
                            setEditingOpt(opt);
                            setOptCategory(opt.category);
                            setIsCustomCategory(false);
                            setOptLabel(opt.label);
                            setOptModalOpen(true);
                          }}
                          title="Edit Label Opsi"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleDeleteOption(opt)}
                          title="Hapus Opsi Permanen"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: USERS & GRANULAR PERMISSIONS CHECKLIST --- */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Super Admin dapat mengatur dan menyesuaikan hak akses (checklist permissions) untuk setiap pengguna secara manual dan granular.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingUser(null);
                setUserName('');
                setUserEmail('');
                setUserRole('employee');
                setUserPassword('password123');
                setUserModalOpen(true);
              }}
            >
              + Tambah Pengguna Baru
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Peran Utama</th>
                    <th className="p-4">Izin Kritis (Silabus & Soal)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => {
                    const isCurrent = store.getCurrentUser().id === u.id;
                    const canEditSilabus = u.role === 'admin' || u.permissions?.can_edit_training;
                    const canEditQuestions = u.role === 'admin' || u.permissions?.can_edit_questions;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {u.name}
                            {isCurrent && <Badge variant="emerald" size="sm">Akun Anda</Badge>}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                        <td className="p-4">
                          <Badge variant="teal">{u.role.toUpperCase()}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                canEditSilabus
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {canEditSilabus ? '✓ Edit Silabus' : '✗ No Silabus'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                canEditQuestions
                                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {canEditQuestions ? '✓ Edit Soal' : '✗ No Soal'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={u.status === 'active' ? 'emerald' : 'slate'} size="sm">
                            {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Granular Permission Checklist Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<KeyRound className="w-3.5 h-3.5 text-teal-700" />}
                              onClick={() => handleOpenPermModal(u)}
                              className="text-xs font-semibold"
                            >
                              Atur Hak Akses
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setEditingUser(u);
                                setUserName(u.name);
                                setUserEmail(u.email);
                                setUserRole(u.role);
                                setUserPassword(u.password || 'password123');
                                setUserModalOpen(true);
                              }}
                            />
                            {!isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => handleDeleteUser(u)}
                                title="Hapus Pengguna"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: DB SCHEMA & FACTORY RESET --- */}
      {tab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-800" />
                  Skema Database Supabase PostgreSQL & RLS (PRD 9 & 10)
                </h3>
                <p className="text-xs text-slate-500">
                  Migration file: <code className="font-mono text-teal-800">supabase/migrations/20261012000000_lcms_schema.sql</code>
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={copiedSchema ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopySchema}
              >
                {copiedSchema ? 'Tersalin' : 'Salin SQL DDL'}
              </Button>
            </div>

            <pre className="p-4 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
              {sampleSchema}
            </pre>
          </div>

          {/* Factory Reset */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-950">Reset Database ke Kondisi Awal Pabrik</h4>
              <p className="text-xs text-rose-800 mt-1">
                Kembalikan seluruh jabatan, kompetensi, matriks, checklist, dan riwayat ke dataset awal yang bersih.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleResetData}
            >
              Reset Database
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: CHECKLIST ATUR HAK AKSES PENGGUNA */}
      <Modal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title={`Konfigurasi Hak Akses: ${permUser?.name || ''}`}
        subtitle={`Peran: ${permUser?.role.toUpperCase() || ''} (${permUser?.email || ''})`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Preset Buttons */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Template Cepat:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyPreset('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-800 text-white hover:bg-teal-900 cursor-pointer"
              >
                Admin (Penuh)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('trainer')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-700 text-white hover:bg-indigo-800 cursor-pointer"
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => applyPreset('supervisor')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => applyPreset('employee')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 cursor-pointer"
              >
                Peserta Saja
              </button>
            </div>
          </div>

          {/* Checklist Action Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Checklist Izin Fitur:
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckAllPerms}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                ✓ Centang Semua
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleUncheckAllPerms}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                ✗ Hapus Centang
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setNewPermModalOpen(true)}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Izin Baru
              </button>
            </div>
          </div>

          {/* Simple Dynamic Permissions Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-84 overflow-y-auto p-1">
            {permissionDefs.map((item) => {
              const checked = !!userPermsDraft[item.key];
              return (
                <div
                  key={item.key}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${
                    checked
                      ? item.highlight
                        ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-medium'
                        : 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePerm(item.key)}
                      className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {item.title}
                        {item.isCustom && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-100 text-indigo-800 font-semibold">
                            Kustom
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomPerm(item)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer shrink-0"
                      title="Hapus Izin Kustom Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setPermModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="button" onClick={handleSavePermissions}>
              Simpan Hak Akses
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD/EDIT OPTION */}
      <Modal
        isOpen={optModalOpen}
        onClose={() => setOptModalOpen(false)}
        title={editingOpt ? 'Edit Opsi Checklist' : 'Tambah Opsi Checklist Baru'}
      >
        <form onSubmit={handleSaveOption} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Checklist *
            </label>
            {!isCustomCategory ? (
              <div className="space-y-2">
                <select
                  value={optCategory}
                  onChange={(e) => setOptCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="pemenuhan">Bukti Pemenuhan (Matriks & Asesmen)</option>
                  <option value="tindakan_gap">Tindakan Bila Gap (Action Plan)</option>
                  <option value="training_kategori">Kategori Training</option>
                  {categories
                    .filter((c) => !['pemenuhan', 'tindakan_gap', 'training_kategori'].includes(c))
                    .map((c) => (
                      <option key={c} value={c}>
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(true)}
                  className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
                >
                  + Atau Buat Kategori Baru
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Nama Kategori Baru, misal: verifikasi_ojt"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(false)}
                  className="text-xs text-slate-600 hover:underline cursor-pointer"
                >
                  ← Kembali ke Kategori yang Ada
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Opsi Checklist *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Pengawas Lapangan / OJT Langsung"
              value={optLabel}
              onChange={(e) => setOptLabel(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setOptModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Opsi Checklist
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CUSTOM PERMISSION DEFINITION */}
      <Modal
        isOpen={newPermModalOpen}
        onClose={() => setNewPermModalOpen(false)}
        title="Tambah Izin Akses Checklist Baru"
        subtitle="Izin ini akan otomatis muncul sebagai kotak centang di modal Atur Hak Akses."
      >
        <form onSubmit={handleSaveNewPerm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Izin Fitur *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Verifikasi Sertifikasi Internal"
              value={newPermTitle}
              onChange={(e) => setNewPermTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Izin
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan apa hak yang diberikan izin ini..."
              value={newPermDesc}
              onChange={(e) => setNewPermDesc(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setNewPermModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Izin Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD/EDIT USER */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Peran Utama (Role) *
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="admin">Admin / HR-L&D</option>
                <option value="trainer">Trainer</option>
                <option value="supervisor">Supervisor / Assessor</option>
                <option value="employee">Peserta / Karyawan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setUserModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
