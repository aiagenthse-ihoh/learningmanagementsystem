import React, { useState } from 'react';
import { store } from '../../lib/storage';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  Printer,
  TrendingUp,
  Users,
  CheckSquare,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../common/Toast';
import { exportToExcelTable, exportToPdfTable, exportToCsv } from '../../lib/exportUtils';

export const ReportsView: React.FC = () => {
  const toast = useToast();
  const [reportTab, setReportTab] = useState<'training' | 'scores' | 'gap'>('training');

  const employees = store.getEmployees();
  const departments = store.getDepartments();
  const positions = store.getPositions();
  const trainings = store.getTrainings();
  const assignments = store.getAssignments();
  const attempts = store.getAttempts();
  const competencies = store.getCompetencies();
  const levels = store.getLevels();
  const matrix = store.getMatrix();
  const assessments = store.getAssessments();

  // Filters
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterPos, setFilterPos] = useState<string>('all');
  const [filterTrn, setFilterTrn] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered Training Assignments
  const filteredAssignments = assignments.filter((asg) => {
    const emp = employees.find((e) => e.id === asg.employee_id);
    if (!emp) return false;

    if (filterDept !== 'all' && emp.department_id !== filterDept) return false;
    if (filterPos !== 'all' && emp.position_id !== filterPos) return false;
    if (filterTrn !== 'all' && asg.training_id !== filterTrn) return false;
    if (filterStatus !== 'all' && asg.status !== filterStatus) return false;

    return true;
  });

  // Filtered Test Scores
  const filteredAttempts = attempts.filter((att) => {
    const emp = employees.find((e) => e.id === att.employee_id);
    if (!emp) return false;

    if (filterDept !== 'all' && emp.department_id !== filterDept) return false;
    if (filterPos !== 'all' && emp.position_id !== filterPos) return false;
    if (filterTrn !== 'all' && att.training_id !== filterTrn) return false;

    return true;
  });

  // Filtered Gap Analysis
  const gapRecords = employees.flatMap((emp) => {
    if (filterDept !== 'all' && emp.department_id !== filterDept) return [];
    if (filterPos !== 'all' && emp.position_id !== filterPos) return [];

    const posReqs = matrix.filter((m) => m.position_id === emp.position_id && m.wajib);
    return posReqs.map((req) => {
      const comp = competencies.find((c) => c.id === req.competency_id);
      const reqLvl = levels.find((l) => l.id === req.required_level_id);
      const empAssess = assessments.find(
        (a) => a.employee_id === emp.id && a.competency_id === req.competency_id
      );
      const actLvl = empAssess ? levels.find((l) => l.id === empAssess.actual_level_id) : null;
      const gapVal = empAssess && actLvl && reqLvl ? actLvl.urutan - reqLvl.urutan : -99;
      const dept = departments.find((d) => d.id === emp.department_id);
      const pos = positions.find((p) => p.id === emp.position_id);

      return {
        emp,
        dept,
        pos,
        comp,
        reqLvl,
        actLvl,
        gapVal,
        evidence: empAssess?.evidence || '-',
        assessed: !!empAssess,
        recommendation: req.tindakan_gap.join(', ') || 'Training & Mentoring',
      };
    });
  });

  // Calculations for KPI Cards
  const totalCompleted = filteredAssignments.filter((a) => a.status === 'completed').length;
  const totalInProgress = filteredAssignments.filter((a) => a.status === 'in_progress').length;
  const completionRate =
    filteredAssignments.length > 0
      ? Math.round((totalCompleted / filteredAssignments.length) * 100)
      : 0;

  const passedScores = filteredAttempts.filter((a) => a.pass_status === 'passed').length;
  const passRate =
    filteredAttempts.length > 0
      ? Math.round((passedScores / filteredAttempts.length) * 100)
      : 0;
  const avgScore =
    filteredAttempts.length > 0
      ? Math.round(
          filteredAttempts.reduce((acc, curr) => acc + curr.score, 0) / filteredAttempts.length
        )
      : 0;

  // --- EXPORT FUNCTIONS ---

  // 1. Export Training to Excel (Siap Cetak)
  const handleExportTrainingExcel = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Program Training',
      'Progress Belajar (%)',
      'Status Penugasan',
      'Tanggal Ditugaskan',
      'Tenggat Waktu',
    ];

    const rows = filteredAssignments.map((asg) => {
      const emp = employees.find((e) => e.id === asg.employee_id);
      const trn = trainings.find((t) => t.id === asg.training_id);
      const dept = departments.find((d) => d.id === emp?.department_id);
      const pos = positions.find((p) => p.id === emp?.position_id);

      return [
        emp?.employee_code || '-',
        emp?.nama || '-',
        dept?.nama || '-',
        pos?.nama_jabatan || '-',
        trn?.judul || '-',
        asg.progress_percent,
        asg.status.toUpperCase(),
        asg.assigned_at.slice(0, 10),
        asg.due_date,
      ];
    });

    exportToExcelTable({
      filename: `Laporan_Training_Completion_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAPITULASI PROGRES TRAINING KARYAWAN',
      subtitle: 'Monitoring Tingkat Penyelesaian & Status Penugasan Modul Pembelajaran',
      headers,
      rows,
      summaryCards: [
        { label: 'Total Penugasan', value: filteredAssignments.length },
        { label: 'Selesai (Completed)', value: totalCompleted },
        { label: 'Sedang Belajar', value: totalInProgress },
        { label: 'Tingkat Kelulusan', value: `${completionRate}%` },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh', 'File laporan tabel Excel dengan format cetak rapi.');
  };

  // 2. Export Training to PDF
  const handleExportTrainingPdf = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Program Training',
      'Progres',
      'Status',
      'Tenggat Waktu',
    ];

    const rows = filteredAssignments.map((asg) => {
      const emp = employees.find((e) => e.id === asg.employee_id);
      const trn = trainings.find((t) => t.id === asg.training_id);
      const dept = departments.find((d) => d.id === emp?.department_id);
      const pos = positions.find((p) => p.id === emp?.position_id);

      return [
        emp?.employee_code || '-',
        emp?.nama || '-',
        dept?.nama || '-',
        pos?.nama_jabatan || '-',
        trn?.judul || '-',
        `${asg.progress_percent}%`,
        asg.status.toUpperCase(),
        asg.due_date,
      ];
    });

    exportToPdfTable({
      filename: `Laporan_Training_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAPITULASI PROGRES TRAINING',
      subtitle: 'Dokumen Resmi Pemantauan Peserta & Penyelesaian Silabus',
      headers,
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh', 'Dokumen PDF laporan training siap dicetak.');
  };

  // 3. Export Scores to Excel (Siap Cetak)
  const handleExportScoresExcel = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Program Training',
      'Tipe Ujian',
      'Percobaan',
      'Skor Perolehan',
      'Standar Lulus (%)',
      'Hasil Kelulusan',
      'Waktu Pelaksanaan',
    ];

    const rows = filteredAttempts.map((att) => {
      const emp = employees.find((e) => e.id === att.employee_id);
      const trn = trainings.find((t) => t.id === att.training_id);
      const dept = departments.find((d) => d.id === emp?.department_id);
      const pos = positions.find((p) => p.id === emp?.position_id);

      return [
        emp?.employee_code || '-',
        emp?.nama || '-',
        dept?.nama || '-',
        pos?.nama_jabatan || '-',
        trn?.judul || '-',
        att.test_type === 'post_test' ? 'Post-Test' : 'Pre-Test',
        att.attempt_no,
        att.score,
        trn?.passing_grade || 70,
        att.pass_status.toUpperCase(),
        new Date(att.timestamp).toLocaleString('id-ID'),
      ];
    });

    exportToExcelTable({
      filename: `Laporan_Nilai_Ujian_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAPITULASI NILAI PRE-TEST & POST-TEST',
      subtitle: 'Evaluasi Penyerapan Materi & Hasil Kelulusan Ujian Karyawan',
      headers,
      rows,
      summaryCards: [
        { label: 'Total Sesi Ujian', value: filteredAttempts.length },
        { label: 'Rata-rata Nilai', value: `${avgScore}%` },
        { label: 'Tingkat Kelulusan', value: `${passRate}%` },
        { label: 'Peserta Lulus', value: passedScores },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh', 'Berkas nilai ujian dalam format tabel rapi.');
  };

  // 4. Export Scores to PDF
  const handleExportScoresPdf = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Training',
      'Tipe Ujian',
      'Ke-',
      'Nilai',
      'Kelulusan',
      'Waktu Pengerjaan',
    ];

    const rows = filteredAttempts.map((att) => {
      const emp = employees.find((e) => e.id === att.employee_id);
      const trn = trainings.find((t) => t.id === att.training_id);
      const dept = departments.find((d) => d.id === emp?.department_id);

      return [
        emp?.employee_code || '-',
        emp?.nama || '-',
        dept?.nama || '-',
        trn?.judul || '-',
        att.test_type === 'post_test' ? 'Post-Test' : 'Pre-Test',
        att.attempt_no,
        `${att.score}%`,
        att.pass_status.toUpperCase(),
        new Date(att.timestamp).toLocaleDateString('id-ID'),
      ];
    });

    exportToPdfTable({
      filename: `Laporan_Nilai_Assessment_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN REKAPITULASI NILAI PRE-TEST & POST-TEST',
      subtitle: 'Rekapitulasi Skor Asesmen & Tingkat Kelulusan Peserta',
      headers,
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh', 'Dokumen PDF nilai assessment telah diunduh.');
  };

  // 5. Export Gap to Excel & PDF
  const handleExportGapExcel = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Kompetensi Wajib',
      'Level Wajib',
      'Level Riil',
      'Status Gap',
      'Rekomendasi Tindakan',
      'Bukti Lapangan',
    ];

    const rows = gapRecords.map((g) => [
      g.emp.employee_code,
      g.emp.nama,
      g.dept?.nama || '-',
      g.pos?.nama_jabatan || '-',
      g.comp?.nama || '-',
      g.reqLvl?.nama_level || '-',
      g.actLvl ? g.actLvl.nama_level : 'Belum Dinilai',
      !g.assessed ? 'Perlu Penilaian' : g.gapVal >= 0 ? 'Compliant' : `Gap (${g.gapVal})`,
      g.recommendation,
      g.evidence,
    ]);

    exportToExcelTable({
      filename: `Laporan_Gap_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN ANALISIS KESENJANGAN KOMPETENSI (GAP ANALYSIS)',
      subtitle: 'Pemetaan Level Wajib vs Level Riil Karyawan Serta Rencana Tindak Lanjut',
      headers,
      rows,
      summaryCards: [
        { label: 'Total Pemetaan', value: gapRecords.length },
        { label: 'Compliant', value: gapRecords.filter((g) => g.gapVal >= 0 && g.assessed).length },
        { label: 'Ada Gap Level', value: gapRecords.filter((g) => g.gapVal < 0 && g.assessed).length },
        { label: 'Belum Dinilai', value: gapRecords.filter((g) => !g.assessed).length },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh');
  };

  const handleExportGapPdf = () => {
    const headers = [
      'NIK',
      'Karyawan',
      'Jabatan',
      'Kompetensi',
      'Wajib',
      'Riil',
      'Status Gap',
      'Tindakan Lanjut',
    ];

    const rows = gapRecords.map((g) => [
      g.emp.employee_code,
      g.emp.nama,
      g.pos?.nama_jabatan || '-',
      g.comp?.nama || '-',
      g.reqLvl?.nama_level || '-',
      g.actLvl ? g.actLvl.nama_level : 'Belum Dinilai',
      !g.assessed ? 'Perlu Dinilai' : g.gapVal >= 0 ? 'Compliant' : `Gap (${g.gapVal})`,
      g.recommendation,
    ]);

    exportToPdfTable({
      filename: `Laporan_Gap_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN KESENJANGAN KOMPETENSI (GAP ANALYSIS)',
      subtitle: 'Standar Kualifikasi Kompetensi dan Tindak Lanjut Pemenuhan',
      headers,
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh');
  };

  // CSV Fallback
  const handleExportCsv = () => {
    if (reportTab === 'training') {
      const rows = filteredAssignments.map((asg) => {
        const emp = employees.find((e) => e.id === asg.employee_id);
        const trn = trainings.find((t) => t.id === asg.training_id);
        const dept = departments.find((d) => d.id === emp?.department_id);
        const pos = positions.find((p) => p.id === emp?.position_id);
        return [
          emp?.employee_code || '-',
          emp?.nama || '-',
          dept?.nama || '-',
          pos?.nama_jabatan || '-',
          trn?.judul || '-',
          `${asg.progress_percent}%`,
          asg.status.toUpperCase(),
          asg.due_date,
        ];
      });
      exportToCsv(
        `Laporan_Training_${new Date().toISOString().slice(0, 10)}`,
        rows,
        ['NIK', 'Nama', 'Departemen', 'Jabatan', 'Training', 'Progress', 'Status', 'Tenggat Waktu']
      );
    } else if (reportTab === 'scores') {
      const rows = filteredAttempts.map((att) => {
        const emp = employees.find((e) => e.id === att.employee_id);
        const trn = trainings.find((t) => t.id === att.training_id);
        return [
          emp?.employee_code || '-',
          emp?.nama || '-',
          trn?.judul || '-',
          att.test_type,
          att.attempt_no,
          att.score,
          att.pass_status,
        ];
      });
      exportToCsv(
        `Laporan_Nilai_${new Date().toISOString().slice(0, 10)}`,
        rows,
        ['NIK', 'Nama', 'Training', 'Ujian', 'Percobaan', 'Skor', 'Status']
      );
    } else {
      const rows = gapRecords.map((g) => [
        g.emp.employee_code,
        g.emp.nama,
        g.comp?.nama || '-',
        g.reqLvl?.nama_level || '-',
        g.actLvl?.nama_level || 'Belum Dinilai',
        g.gapVal >= 0 ? 'Compliant' : `Gap (${g.gapVal})`,
      ]);
      exportToCsv(
        `Laporan_Gap_${new Date().toISOString().slice(0, 10)}`,
        rows,
        ['NIK', 'Nama', 'Kompetensi', 'Level Wajib', 'Level Riil', 'Status']
      );
    }
    toast.success('CSV Berhasil Diunduh');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pusat Laporan & Ekspor Data Siap Cetak</h1>
            <p className="text-xs text-slate-500">
              PRD Section 8: Rekapitulasi tabel rapi, ekspor Excel siap cetak (terformat resmi), dokumen PDF resmi, dan print preview.
            </p>
          </div>
        </div>

        {/* Global Action Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="emerald"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => {
              if (reportTab === 'training') handleExportTrainingExcel();
              else if (reportTab === 'scores') handleExportScoresExcel();
              else handleExportGapExcel();
            }}
            className="font-bold shadow-xs"
          >
            Unduh Excel (Siap Cetak)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4 text-rose-600" />}
            onClick={() => {
              if (reportTab === 'training') handleExportTrainingPdf();
              else if (reportTab === 'scores') handleExportScoresPdf();
              else handleExportGapPdf();
            }}
            className="font-semibold"
          >
            Unduh PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-slate-600" />}
            onClick={handleExportCsv}
          >
            CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4 text-teal-700" />}
            onClick={handlePrint}
            title="Cetak tampilan tabel langsung ke printer"
          >
            Cetak
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTab === 'training' ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Penugasan
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{filteredAssignments.length}</p>
              <span className="text-[11px] text-teal-700 font-medium">Berdasarkan filter aktif</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pelatihan Selesai
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalCompleted}</p>
              <span className="text-[11px] text-slate-500 font-medium">{completionRate}% kelulusan</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Sedang Berjalan
              </span>
              <p className="text-2xl font-bold text-sky-600 mt-1">{totalInProgress}</p>
              <span className="text-[11px] text-slate-500 font-medium">Aktif belajar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tingkat Penyelesaian
              </span>
              <p className="text-2xl font-bold text-teal-700 mt-1">{completionRate}%</p>
              <span className="text-[11px] text-emerald-600 font-medium">Rata-rata progres</span>
            </div>
          </>
        ) : reportTab === 'scores' ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Sesi Ujian
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{filteredAttempts.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Pre-test & Post-test</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Rata-rata Skor
              </span>
              <p className="text-2xl font-bold text-teal-700 mt-1">{avgScore}%</p>
              <span className="text-[11px] text-slate-500 font-medium">Nilai rata-rata peserta</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tingkat Kelulusan
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{passRate}%</p>
              <span className="text-[11px] text-slate-500 font-medium">{passedScores} sesi lulus</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Status Evaluasi
              </span>
              <p className="text-2xl font-bold text-indigo-700 mt-1">Terverifikasi</p>
              <span className="text-[11px] text-slate-500 font-medium">Kunci jawaban valid</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Pemetaan
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{gapRecords.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Kompetensi wajib jabatan</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Compliant (Memenuhi)
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {gapRecords.filter((g) => g.gapVal >= 0 && g.assessed).length}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Level riil ≥ wajib</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Gap (Kesenjangan)
              </span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {gapRecords.filter((g) => g.gapVal < 0 && g.assessed).length}
              </p>
              <span className="text-[11px] text-rose-600 font-medium">Perlu tindak lanjut</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Belum Dinilai
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {gapRecords.filter((g) => !g.assessed).length}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Menunggu assessor</span>
            </div>
          </>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl max-w-xl">
        <button
          onClick={() => setReportTab('training')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            reportTab === 'training'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Progres & Penyelesaian Training
        </button>
        <button
          onClick={() => setReportTab('scores')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            reportTab === 'scores'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rekap Nilai Pre & Post-Test
        </button>
        <button
          onClick={() => setReportTab('gap')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            reportTab === 'gap'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Analisis Gap Kompetensi
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Departemen:
          </label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">Semua Departemen ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Jabatan:
          </label>
          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">Semua Jabatan ({positions.length})</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_jabatan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Program Training:
          </label>
          <select
            value={filterTrn}
            onChange={(e) => setFilterTrn(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">Semua Program Training ({trainings.length})</option>
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.judul}
              </option>
            ))}
          </select>
        </div>

        {reportTab === 'training' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status Penugasan:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="in_progress">In Progress (Berjalan)</option>
              <option value="not_started">Not Started (Belum Mulai)</option>
              <option value="remedial">Remedial</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Formatted Tables */}
      {reportTab === 'training' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Karyawan</th>
                  <th className="p-4">Jabatan & Unit</th>
                  <th className="p-4">Program Training</th>
                  <th className="p-4">Progress Belajar</th>
                  <th className="p-4">Status Penugasan</th>
                  <th className="p-4">Tenggat Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada data penugasan training yang cocok dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((asg) => {
                    const emp = employees.find((e) => e.id === asg.employee_id);
                    const trn = trainings.find((t) => t.id === asg.training_id);
                    const pos = positions.find((p) => p.id === emp?.position_id);
                    const dept = departments.find((d) => d.id === emp?.department_id);

                    return (
                      <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{emp?.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp?.employee_code}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{pos?.nama_jabatan}</div>
                          <div className="text-[10px] text-slate-500">{dept?.nama}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-900 max-w-xs">{trn?.judul}</td>
                        <td className="p-4">
                          <div className="w-36">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                              <span>{asg.progress_percent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all"
                                style={{ width: `${asg.progress_percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              asg.status === 'completed'
                                ? 'emerald'
                                : asg.status === 'remedial'
                                ? 'rose'
                                : asg.status === 'in_progress'
                                ? 'blue'
                                : 'slate'
                            }
                            size="sm"
                          >
                            {asg.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500 font-mono">{asg.due_date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'scores' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Karyawan</th>
                  <th className="p-4">Program Training</th>
                  <th className="p-4 text-center">Tipe Ujian</th>
                  <th className="p-4 text-center">Percobaan Ke-</th>
                  <th className="p-4 text-center">Skor Perolehan</th>
                  <th className="p-4 text-center">Passing Grade</th>
                  <th className="p-4 text-center">Status Kelulusan</th>
                  <th className="p-4">Waktu Pengerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada catatan ujian yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((att) => {
                    const emp = employees.find((e) => e.id === att.employee_id);
                    const trn = trainings.find((t) => t.id === att.training_id);

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{emp?.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp?.employee_code}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-900 max-w-xs">{trn?.judul}</td>
                        <td className="p-4 text-center">
                          <Badge variant={att.test_type === 'post_test' ? 'teal' : 'blue'} size="sm">
                            {att.test_type === 'post_test' ? 'Post-Test' : 'Pre-Test'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700">
                          #{att.attempt_no}
                        </td>
                        <td className="p-4 text-center font-bold text-sm text-slate-900">
                          {att.score}%
                        </td>
                        <td className="p-4 text-center text-slate-500 font-mono">
                          {trn?.passing_grade || 70}%
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={att.pass_status === 'passed' ? 'emerald' : 'rose'} size="sm">
                            {att.pass_status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(att.timestamp).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'gap' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Karyawan</th>
                  <th className="p-4">Jabatan</th>
                  <th className="p-4">Kompetensi</th>
                  <th className="p-4 text-center">Level Wajib</th>
                  <th className="p-4 text-center">Level Riil</th>
                  <th className="p-4 text-center">Status Gap</th>
                  <th className="p-4">Rekomendasi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {gapRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada pemetaan gap kompetensi untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  gapRecords.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{g.emp.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{g.emp.employee_code}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{g.pos?.nama_jabatan}</div>
                        <div className="text-[10px] text-slate-500">{g.dept?.nama}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 max-w-xs">{g.comp?.nama}</td>
                      <td className="p-4 text-center">
                        <Badge variant="teal" size="sm">
                          {g.reqLvl?.nama_level || '-'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant={!g.assessed ? 'slate' : g.gapVal >= 0 ? 'emerald' : 'rose'}
                          size="sm"
                        >
                          {g.actLvl ? g.actLvl.nama_level : 'Belum Dinilai'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {!g.assessed ? (
                          <Badge variant="slate" size="sm">
                            Perlu Penilaian
                          </Badge>
                        ) : g.gapVal >= 0 ? (
                          <Badge variant="emerald" size="sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compliant
                          </Badge>
                        ) : (
                          <Badge variant="rose" size="sm">
                            Gap ({g.gapVal} Lvl)
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 text-[11px] max-w-xs">
                        {g.recommendation}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
