import React, { useState } from 'react';
import { store, getDefaultPermissionsForRole } from '../../lib/storage';
import { User, Employee, UserRole, UserPermissions } from '../../types/lcms';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  KeyRound,
  GraduationCap,
  Trash2,
  Edit2,
  Plus,
  Mail,
  Building2,
  Briefcase,
  ChevronRight,
  UserCheck,
  Award,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { exportToExcelTable, exportToPdfTable } from '../../lib/exportUtils';

export const ParticipantMonitoringView: React.FC = () => {
  const toast = useToast();
  const users = store.getUsers();
  const employees = store.getEmployees(true);
  const departments = store.getDepartments(true);
  const positions = store.getPositions(true);
  const trainings = store.getTrainings(true);
  const assignments = store.getAssignments();
  const attempts = store.getAttempts();
  const assessments = store.getAssessments();
  const currentUser = store.getCurrentUser();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal: Checklist Hak Akses User
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [activeUserForPerm, setActiveUserForPerm] = useState<User | null>(null);
  const [permsDraft, setPermsDraft] = useState<UserPermissions>(
    getDefaultPermissionsForRole('employee')
  );

  // Modal: Detail Progres Peserta
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<{
    user: User;
    employee?: Employee;
  } | null>(null);

  // Modal: Daftarkan Peserta Baru
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('password123');
  const [regDeptId, setRegDeptId] = useState(departments[0]?.id || '');
  const [regPosId, setRegPosId] = useState(positions[0]?.id || '');
  const [regRole, setRegRole] = useState<UserRole>('employee');

  // Confirm Delete Dialog
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

  // Calculate stats for each user
  const userMonitoringList = users.map((u) => {
    const emp = employees.find(
      (e) => e.email.toLowerCase() === u.email.toLowerCase() || e.id === u.employee_id
    );
    const dept = emp ? departments.find((d) => d.id === emp.department_id) : undefined;
    const pos = emp ? positions.find((p) => p.id === emp.position_id) : undefined;

    const userAssignments = emp ? assignments.filter((a) => a.employee_id === emp.id) : [];
    const userAttempts = emp ? attempts.filter((a) => a.employee_id === emp.id) : [];
    const postTestAttempts = userAttempts.filter((a) => a.test_type === 'post_test');
    const preTestAttempts = userAttempts.filter((a) => a.test_type === 'pre_test');
    const userAssessments = emp ? assessments.filter((a) => a.employee_id === emp.id) : [];

    const hasCompleted = userAssignments.length > 0 && userAssignments.every((a) => a.status === 'completed');
    const hasRemedial = userAssignments.some((a) => a.status === 'remedial') || postTestAttempts.some((a) => a.pass_status === 'failed');
    const hasInProgress = userAssignments.some((a) => a.status === 'in_progress');

    let overallStatus = 'Belum Mulai';
    if (hasCompleted) overallStatus = 'Lulus / Selesai';
    else if (hasRemedial) overallStatus = 'Perlu Remedial';
    else if (hasInProgress) overallStatus = 'Sedang Belajar';

    // Average progress percent across assignments
    const avgProgress =
      userAssignments.length > 0
        ? Math.round(
            userAssignments.reduce((acc, curr) => acc + curr.progress_percent, 0) /
              userAssignments.length
          )
        : 0;

    // Latest Post-test score
    const latestPostTest = postTestAttempts[0];
    const latestPreTest = preTestAttempts[0];

    return {
      user: u,
      employee: emp,
      department: dept,
      position: pos,
      assignments: userAssignments,
      attempts: userAttempts,
      assessments: userAssessments,
      overallStatus,
      avgProgress,
      latestPostTest,
      latestPreTest,
    };
  });

  // Summary counts
  const totalParticipants = userMonitoringList.filter((item) => item.user.role === 'employee').length;
  const passedCount = userMonitoringList.filter((item) => item.overallStatus === 'Lulus / Selesai').length;
  const remedialCount = userMonitoringList.filter((item) => item.overallStatus === 'Perlu Remedial').length;
  const inProgressCount = userMonitoringList.filter((item) => item.overallStatus === 'Sedang Belajar').length;

  // Filtered items
  const filteredList = userMonitoringList.filter((item) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.user.name.toLowerCase().includes(q);
      const matchEmail = item.user.email.toLowerCase().includes(q);
      const matchCode = item.employee?.employee_code.toLowerCase().includes(q);
      const matchPos = item.position?.nama_jabatan.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCode && !matchPos) return false;
    }

    // Role
    if (filterRole !== 'all' && item.user.role !== filterRole) return false;

    // Dept
    if (filterDept !== 'all' && item.employee?.department_id !== filterDept) return false;

    // Status
    if (filterStatus !== 'all' && item.overallStatus !== filterStatus) return false;

    return true;
  });

  // Open Permission Checklist Modal
  const handleOpenPermModal = (user: User) => {
    setActiveUserForPerm(user);
    setPermsDraft({
      ...(user.permissions || getDefaultPermissionsForRole(user.role)),
    });
    setPermModalOpen(true);
  };

  // Toggle permission item
  const handleTogglePerm = (key: keyof UserPermissions) => {
    setPermsDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Apply Role Preset
  const handleApplyPreset = (presetRole: UserRole) => {
    setPermsDraft(getDefaultPermissionsForRole(presetRole));
    toast.info('Template Diterapkan', `Pengaturan hak akses disesuaikan ke standar ${presetRole.toUpperCase()}`);
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!activeUserForPerm) return;
    store.updateUserPermissions(activeUserForPerm.id, permsDraft);
    toast.success(
      'Hak Akses Berhasil Diperbarui!',
      `Hak akses untuk ${activeUserForPerm.name} telah disimpan dan langsung aktif di sesi pengguna.`
    );
    setPermModalOpen(false);
  };

  // Handle Register New Participant
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
      department_id: regDeptId,
      position_id: regPosId,
      role: regRole,
    });

    if (res.success && res.user) {
      toast.success(
        'Peserta Berhasil Didaftarkan!',
        `Akun untuk ${res.user.name} (${res.user.email}) siap digunakan dan dipantau.`
      );
      setRegisterModalOpen(false);
      setRegName('');
      setRegEmail('');
    } else {
      toast.error('Pendaftaran Gagal', res.error || 'Terjadi kesalahan.');
    }
  };

  // Handle Delete Participant
  const handleDeleteParticipant = (item: (typeof userMonitoringList)[0]) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Peserta / Pengguna',
      message: `Apakah Anda yakin ingin menghapus akun "${item.user.name}" (${item.user.email})? Seluruh data riwayat penugasan dan evaluasi akan dibersihkan.`,
      onConfirm: () => {
        try {
          if (item.employee) {
            store.deleteEmployee(item.employee.id);
          }
          store.deleteUser(item.user.id);
          toast.success('Peserta Dihapus', `Data peserta "${item.user.name}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  const roleBadges: Record<UserRole, { label: string; variant: 'teal' | 'blue' | 'purple' | 'slate' }> = {
    admin: { label: 'Admin', variant: 'teal' },
    trainer: { label: 'Trainer', variant: 'blue' },
    supervisor: { label: 'Supervisor', variant: 'purple' },
    employee: { label: 'Peserta', variant: 'slate' },
  };

  // Export Monitoring to Excel Siap Cetak
  const handleExportExcel = () => {
    const headers = [
      'NIK',
      'Nama Peserta',
      'Email',
      'Peran',
      'Departemen',
      'Jabatan',
      'Status Belajar',
      'Rata-rata Progres (%)',
      'Jumlah Modul',
      'Post-Test Terakhir',
    ];

    const rows = filteredList.map((item) => [
      item.employee?.employee_code || '-',
      item.user.name,
      item.user.email,
      item.user.role.toUpperCase(),
      item.department?.nama || '-',
      item.position?.nama_jabatan || '-',
      item.overallStatus,
      item.avgProgress,
      item.assignments.length,
      item.latestPostTest ? `${item.latestPostTest.score}%` : 'Belum Ada',
    ]);

    exportToExcelTable({
      filename: `Pemantauan_Peserta_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAPITULASI PEMANTAUAN PESERTA & PROGRES BELAJAR',
      subtitle: 'Monitoring Real-Time Penyelesaian Modul Pelatihan & Ujian',
      headers,
      rows,
      summaryCards: [
        { label: 'Total Peserta', value: totalParticipants },
        { label: 'Lulus Post-Test', value: passedCount },
        { label: 'Sedang Belajar', value: inProgressCount },
        { label: 'Perlu Remedial', value: remedialCount },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh');
  };

  // Export Monitoring to PDF
  const handleExportPdf = () => {
    const headers = [
      'NIK',
      'Nama Peserta',
      'Email',
      'Jabatan',
      'Status',
      'Progres',
      'Modul',
      'Post-Test',
    ];

    const rows = filteredList.map((item) => [
      item.employee?.employee_code || '-',
      item.user.name,
      item.user.email,
      item.position?.nama_jabatan || '-',
      item.overallStatus,
      `${item.avgProgress}%`,
      item.assignments.length,
      item.latestPostTest ? `${item.latestPostTest.score}%` : '-',
    ]);

    exportToPdfTable({
      filename: `Pemantauan_Peserta_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAP PEMANTAUAN PESERTA',
      subtitle: 'Status Pelatihan, Modul, dan Hasil Ujian',
      headers,
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Pemantauan Peserta & Hak Akses</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                Live Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau progres belajar, nilai ujian pre/post-test setiap peserta, dan atur hak akses peserta maupun trainer dengan sistem checklist sederhana.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="emerald"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={handleExportExcel}
            title="Unduh tabel Excel siap cetak"
          >
            Excel (Siap Cetak)
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5 text-rose-600" />}
            onClick={handleExportPdf}
            title="Unduh dokumen PDF"
          >
            PDF
          </Button>
          {currentUser.role === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setRegisterModalOpen(true)}
            >
              + Daftarkan Peserta Baru
            </Button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</p>
            <h3 className="text-2xl font-black text-slate-900">{totalParticipants}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Lulus Post-Test</p>
            <h3 className="text-2xl font-black text-slate-900">{passedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Sedang Belajar</p>
            <h3 className="text-2xl font-black text-slate-900">{inProgressCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Perlu Remedial</p>
            <h3 className="text-2xl font-black text-slate-900">{remedialCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama peserta, email, NIK, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Peran</option>
            <option value="employee">Peserta Saja</option>
            <option value="trainer">Trainer Saja</option>
            <option value="supervisor">Supervisor Saja</option>
            <option value="admin">Admin Saja</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Status Belajar</option>
            <option value="Lulus / Selesai">Lulus / Selesai</option>
            <option value="Sedang Belajar">Sedang Belajar</option>
            <option value="Perlu Remedial">Perlu Remedial</option>
            <option value="Belum Mulai">Belum Mulai</option>
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Peserta / User</th>
                <th className="p-4">Peran & Status</th>
                <th className="p-4">Jabatan & Dept</th>
                <th className="p-4 text-center">Progress Silabus</th>
                <th className="p-4 text-center">Pre-Test</th>
                <th className="p-4 text-center">Post-Test</th>
                <th className="p-4 text-center">Status Kelulusan</th>
                <th className="p-4 text-right">Aksi & Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data peserta yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const roleConfig = roleBadges[item.user.role] || roleBadges.employee;
                  return (
                    <tr key={item.user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.user.name}</p>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{item.user.email}</span>
                              {item.employee && (
                                <span className="font-mono text-slate-400">({item.employee.employee_code})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Account Status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant={roleConfig.variant} size="sm">
                            {roleConfig.label}
                          </Badge>
                          <div className="text-[10px] text-slate-400">
                            {item.user.status === 'active' ? (
                              <span className="text-emerald-700 font-semibold">● Aktif</span>
                            ) : (
                              <span className="text-slate-400">● Nonaktif</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Position & Dept */}
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {item.position?.nama_jabatan || '-'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.department?.nama || '-'}
                          </p>
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="p-4 text-center">
                        <div className="max-w-[120px] mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>{item.assignments.length} Modul</span>
                            <span>{item.avgProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all rounded-full ${
                                item.avgProgress >= 100
                                  ? 'bg-emerald-500'
                                  : item.avgProgress > 0
                                  ? 'bg-teal-500'
                                  : 'bg-slate-200'
                              }`}
                              style={{ width: `${item.avgProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Pre-Test Score */}
                      <td className="p-4 text-center">
                        {item.latestPreTest ? (
                          <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 bg-slate-100 rounded-md">
                            {item.latestPreTest.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        )}
                      </td>

                      {/* Post-Test Score */}
                      <td className="p-4 text-center">
                        {item.latestPostTest ? (
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                              item.latestPostTest.pass_status === 'passed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {item.latestPostTest.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        )}
                      </td>

                      {/* Overall Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.overallStatus === 'Lulus / Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.overallStatus === 'Perlu Remedial'
                              ? 'bg-rose-100 text-rose-800'
                              : item.overallStatus === 'Sedang Belajar'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.overallStatus === 'Lulus / Selesai' && <CheckCircle2 className="w-3 h-3" />}
                          {item.overallStatus === 'Perlu Remedial' && <AlertTriangle className="w-3 h-3" />}
                          {item.overallStatus}
                        </span>
                      </td>

                      {/* Action & Permissions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                            onClick={() => {
                              setSelectedUserForDetail({ user: item.user, employee: item.employee });
                              setDetailModalOpen(true);
                            }}
                            title="Detail Riwayat Pembelajaran"
                          >
                            Detail
                          </Button>

                          {/* Permission Checklist Button */}
                          {currentUser.role === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<KeyRound className="w-3.5 h-3.5 text-teal-600" />}
                              onClick={() => handleOpenPermModal(item.user)}
                              title="Atur Hak Akses Checklist"
                            >
                              Hak Akses
                            </Button>
                          )}

                          {/* Delete Button */}
                          {currentUser.role === 'admin' && currentUser.id !== item.user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={() => handleDeleteParticipant(item)}
                              title="Hapus Peserta"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CHECKLIST ATUR HAK AKSES */}
      <Modal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title={`Atur Hak Akses: ${activeUserForPerm?.name || ''}`}
        subtitle={`Email: ${activeUserForPerm?.email || ''} | Peran Saat Ini: ${activeUserForPerm?.role.toUpperCase() || ''}`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Preset Buttons */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Template Cepat:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('trainer')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-700 text-white hover:bg-indigo-800 cursor-pointer shadow-xs"
              >
                Preset Trainer (Silabus & Soal)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('employee')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                Preset Peserta Saja
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('supervisor')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Preset Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-800 text-white hover:bg-teal-900 cursor-pointer shadow-xs"
              >
                Preset Admin Penuh
              </button>
            </div>
          </div>

          {/* Simple Checklist Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Centang Fitur Yang Diizinkan:
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...permsDraft };
                    store.getPermissionDefs().forEach((p) => {
                      updated[p.key] = true;
                    });
                    setPermsDraft(updated);
                  }}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  ✓ Centang Semua
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...permsDraft };
                    store.getPermissionDefs().forEach((p) => {
                      updated[p.key] = false;
                    });
                    setPermsDraft(updated);
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  ✗ Hapus Centang
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-1">
              {store.getPermissionDefs().map((item) => {
                const checked = !!permsDraft[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? item.highlight
                          ? 'bg-teal-50 border-teal-400 text-teal-950 font-medium'
                          : 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePerm(item.key)}
                      className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setPermModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="button" onClick={handleSavePermissions}>
              Simpan Perubahan Hak Akses
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DAFTARKAN PESERTA BARU */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Daftarkan Peserta / Pengguna Baru"
        subtitle="Daftar menggunakan email aktif; peserta langsung dapat dipantau di portal."
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rian Anggara"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                placeholder="nama@perusahaan.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi Awal
              </label>
              <input
                type="text"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Departemen / Divisi
              </label>
              <select
                value={regDeptId}
                onChange={(e) => setRegDeptId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Posisi Jabatan
              </label>
              <select
                value={regPosId}
                onChange={(e) => setRegPosId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_jabatan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Peran Akun
            </label>
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as UserRole)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="employee">Peserta / Karyawan (Default)</option>
              <option value="trainer">Trainer (Akses Silabus & Soal)</option>
              <option value="supervisor">Supervisor / Assessor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setRegisterModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Daftarkan Peserta
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DETAIL RIWAYAT PROGRES */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Riwayat Pembelajaran: ${selectedUserForDetail?.user.name || ''}`}
        subtitle={`Email: ${selectedUserForDetail?.user.email || ''}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {selectedUserForDetail && (
            <>
              {/* Assignments list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Penugasan Modul Training ({selectedUserForDetail.employee ? assignments.filter((a) => a.employee_id === selectedUserForDetail.employee!.id).length : 0})
                </h4>
                {selectedUserForDetail.employee && assignments.filter((a) => a.employee_id === selectedUserForDetail.employee!.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada modul training yang ditugaskan.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserForDetail.employee &&
                      assignments
                        .filter((a) => a.employee_id === selectedUserForDetail.employee!.id)
                        .map((asg) => {
                          const trn = trainings.find((t) => t.id === asg.training_id);
                          return (
                            <div
                              key={asg.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{trn?.judul || 'Program Training'}</p>
                                <p className="text-[11px] text-slate-400">Jatuh Tempo: {asg.due_date}</p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={asg.status === 'completed' ? 'emerald' : asg.status === 'remedial' ? 'rose' : 'blue'}
                                  size="sm"
                                >
                                  {asg.status.toUpperCase()}
                                </Badge>
                                <p className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">
                                  {asg.progress_percent}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                )}
              </div>

              {/* Attempts list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Riwayat Percobaan Tes (Pre-Test & Post-Test)
                </h4>
                {selectedUserForDetail.employee && attempts.filter((a) => a.employee_id === selectedUserForDetail.employee!.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada riwayat pengerjaan tes.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedUserForDetail.employee &&
                      attempts
                        .filter((a) => a.employee_id === selectedUserForDetail.employee!.id)
                        .map((att) => {
                          const trn = trainings.find((t) => t.id === att.training_id);
                          return (
                            <div
                              key={att.id}
                              className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800 uppercase text-[10px] mr-2">
                                  {att.test_type.replace('_', ' ')} (Percobaan #{att.attempt_no})
                                </span>
                                <span className="text-[11px] text-slate-500">{trn?.judul}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{att.score}%</span>
                                <Badge variant={att.pass_status === 'passed' ? 'emerald' : 'rose'} size="sm">
                                  {att.pass_status === 'passed' ? 'Lulus' : 'Remedial'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Hapus Akun"
        variant="danger"
      />
    </div>
  );
};
