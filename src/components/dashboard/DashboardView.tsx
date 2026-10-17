import React from 'react';
import { store } from '../../lib/storage';
import {
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  GraduationCap,
  Calendar,
  Bell,
  MapPin,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { NavTab } from '../layout/Sidebar';

export const DashboardView: React.FC<{ onNavigate: (tab: NavTab) => void }> = ({ onNavigate }) => {
  const currentUser = store.getCurrentUser();
  const role = currentUser.role;

  const employees = store.getEmployees();
  const positions = store.getPositions();
  const trainings = store.getTrainings();
  const assignments = store.getAssignments();
  const attempts = store.getAttempts();
  const matrix = store.getMatrix();
  const assessments = store.getAssessments();
  const devActions = store.getDevActions();
  const auditLogs = store.getAuditLogs().slice(0, 5);
  const upcomingSchedules = store
    .getSchedules()
    .filter((s) => s.status === 'scheduled' || s.status === 'ongoing')
    .slice(0, 2);

  // Compute metrics
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const completionRate =
    totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  const failedAttempts = attempts.filter((a) => a.pass_status === 'failed').length;
  const openDevActions = devActions.filter((d) => d.status === 'open' || d.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Shield className="w-3.5 h-3.5" />
            Portal Enterprise LCMS • {currentUser.role.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Sistem manajemen terintegrasi kompetensi jabatan, pelaksanaan training terstandar, evaluasi berkala, dan mitigasi kesenjangan keahlian karyawan.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            {role === 'admin' && (
              <>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => onNavigate('matrix')}
                  icon={<Award className="w-4 h-4" />}
                >
                  Konfigurasi Matriks Jabatan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
                  onClick={() => onNavigate('participant_monitoring')}
                >
                  Pantau Peserta & Izin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
                  onClick={() => onNavigate('organization')}
                >
                  Kelola Jabatan & Karyawan
                </Button>
              </>
            )}
            {role === 'employee' && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => onNavigate('my_learning')}
                icon={<GraduationCap className="w-4 h-4" />}
              >
                Lanjutkan Pembelajaran Saya
              </Button>
            )}
            {role === 'supervisor' && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => onNavigate('actual_assessments')}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Nilai Kompetensi Aktual Tim
              </Button>
            )}
            {role === 'trainer' && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => onNavigate('trainings')}
                icon={<BookOpen className="w-4 h-4" />}
              >
                Kelola Program & Modul Training
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="bg-teal-900/60 text-teal-200 border-teal-600 hover:bg-teal-800 text-xs font-semibold"
              onClick={() => onNavigate('training_calendar')}
              icon={<Calendar className="w-3.5 h-3.5 text-teal-300" />}
            >
              Kalender Training
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Karyawan Aktif
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activeEmployees}
            </div>
            <span className="text-[11px] text-teal-800 font-medium mt-1 block">
              {positions.length} Jabatan Terdaftar
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completion Rate
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {completionRate}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {completedAssignments} dari {totalAssignments} penugasan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gap & Action Plan
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {openDevActions}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              Tindakan Dalam Proses
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Peserta Remedial
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {failedAttempts}
            </div>
            <span className="text-[11px] text-rose-700 font-medium mt-1 block">
              Ujian Belum Memenuhi Batas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Training Schedules Widget */}
      {upcomingSchedules.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Agenda & Jadwal Training Mendatang
                </h3>
                <p className="text-xs text-slate-500">
                  Sesi pelatihan terdekat yang dijadwalkan untuk departemen & peserta
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('training_calendar')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs font-semibold self-start sm:self-auto"
            >
              Buka Kalender Lengkap
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSchedules.map((sch) => (
              <div
                key={sch.id}
                onClick={() => onNavigate('training_calendar')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50/60 transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    {sch.category || 'Wajib'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    {new Date(sch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {sch.start_time} WIB
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {sch.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate max-w-[180px]">
                    Instruktur: <strong>{sch.trainer_name}</strong>
                  </span>
                  <span className="text-teal-700 font-bold hover:underline">
                    {sch.enrolled_employee_ids?.length || 0} Peserta &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Split: Quick Modules & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fast Action Modules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Modul Utama LCMS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quick 1 */}
            <div
              onClick={() => onNavigate('matrix')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Matriks Kompetensi Jabatan
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pilih jabatan, atur kompetensi wajib melalui checklist, tetapkan skala level dan metode pemenuhan.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-800">
                <span>Buka Konfigurasi Matriks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick 2 */}
            <div
              onClick={() => onNavigate('gap_analysis')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Analisis Kesenjangan & Action Plan
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bandingkan level wajib vs level aktual riil tim, tetapkan rekomendasi mitigasi dan target penyelesaian.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-700">
                <span>Lihat Analisis Gap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick 3 */}
            <div
              onClick={() => onNavigate('trainings')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Katalog Program Training
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kelola modul pembelajaran, silabus video materi, dan penugasan karyawan sesuai matriks kebutuhan.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <span>Buka Katalog Training</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick 4 */}
            <div
              onClick={() => onNavigate('actual_assessments')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Penilaian Riil Supervisor (Assessor)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Verifikasi keterampilan praktik dan catatan bukti lapangan mandiri di luar hasil post-test.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-700">
                <span>Input Penilaian Tim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Trail & Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Audit Log & Aktivitas Terkini
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{log.details || log.entity}</p>
                <span className="text-[10px] text-teal-800 font-medium mt-1 block">
                  Oleh: {log.user_nama}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
