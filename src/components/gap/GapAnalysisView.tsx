import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { DevelopmentAction } from '../../types/lcms';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  Calendar,
  User,
  FileSpreadsheet,
  FileText,
  Download,
  Edit2,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { exportToExcelTable, exportToPdfTable, exportToCsv } from '../../lib/exportUtils';

export const GapAnalysisView: React.FC = () => {
  const toast = useToast();
  const employees = store.getEmployees();
  const positions = store.getPositions();
  const departments = store.getDepartments();
  const competencies = store.getCompetencies();
  const levels = store.getLevels();
  const matrix = store.getMatrix();
  const assessments = store.getAssessments();
  const devActions = store.getDevActions();
  const tindakanGapOptions = store.getConfigOptions('tindakan_gap');

  // Confirm Dialog State
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

  // Filters
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterPos, setFilterPos] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('gap_only'); // all, gap_only, compliant

  // Modal State for Action Plan
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DevelopmentAction | null>(null);
  const [actionEmpId, setActionEmpId] = useState('');
  const [actionCompId, setActionCompId] = useState('');
  const [actionType, setActionType] = useState('');
  const [actionOwner, setActionOwner] = useState('');
  const [actionDueDate, setActionDueDate] = useState('');
  const [actionStatus, setActionStatus] = useState<'open' | 'in_progress' | 'completed'>('open');
  const [actionNotes, setActionNotes] = useState('');
  const [actionResult, setActionResult] = useState('');

  // Calculate gaps dynamically for all employees
  interface EmployeeCompetencyGap {
    employee: (typeof employees)[0];
    department: (typeof departments)[0] | undefined;
    position: (typeof positions)[0] | undefined;
    competency: (typeof competencies)[0];
    requiredLevel: (typeof levels)[0] | undefined;
    actualLevel: (typeof levels)[0] | undefined;
    hasAssessment: boolean;
    gapNumber: number; // actual.urutan - required.urutan
    matrixItem: (typeof matrix)[0];
    existingAction?: DevelopmentAction;
  }

  const allGapItems: EmployeeCompetencyGap[] = [];

  employees.forEach((emp) => {
    const dept = departments.find((d) => d.id === emp.department_id);
    const pos = positions.find((p) => p.id === emp.position_id);
    if (!pos) return;

    // Get required competencies for this position
    const posReqs = matrix.filter((m) => m.position_id === pos.id && m.wajib);

    posReqs.forEach((req) => {
      const comp = competencies.find((c) => c.id === req.competency_id);
      if (!comp) return;

      const reqLevel = levels.find((l) => l.id === req.required_level_id);
      const assessment = assessments.find(
        (a) => a.employee_id === emp.id && a.competency_id === comp.id
      );
      const actualLevel = assessment ? levels.find((l) => l.id === assessment.actual_level_id) : undefined;

      const reqRank = reqLevel ? reqLevel.urutan : 0;
      const actualRank = actualLevel ? actualLevel.urutan : 0;
      const gapNumber = actualRank - reqRank;

      const action = devActions.find(
        (d) => d.employee_id === emp.id && d.competency_id === comp.id
      );

      allGapItems.push({
        employee: emp,
        department: dept,
        position: pos,
        competency: comp,
        requiredLevel: reqLevel,
        actualLevel: actualLevel,
        hasAssessment: !!assessment,
        gapNumber,
        matrixItem: req,
        existingAction: action,
      });
    });
  });

  // Apply filters
  const filteredGaps = allGapItems.filter((item) => {
    if (filterDept !== 'all' && item.employee.department_id !== filterDept) return false;
    if (filterPos !== 'all' && item.employee.position_id !== filterPos) return false;

    if (filterStatus === 'gap_only') {
      return !item.hasAssessment || item.gapNumber < 0;
    }
    if (filterStatus === 'compliant') {
      return item.hasAssessment && item.gapNumber >= 0;
    }
    return true;
  });

  const totalCompliant = filteredGaps.filter((g) => g.hasAssessment && g.gapNumber >= 0).length;
  const totalGap = filteredGaps.filter((g) => g.hasAssessment && g.gapNumber < 0).length;
  const totalUnassessed = filteredGaps.filter((g) => !g.hasAssessment).length;

  // Open Create/Edit Action Modal
  const handleOpenCreateAction = (item: EmployeeCompetencyGap) => {
    setEditingAction(null);
    setActionEmpId(item.employee.id);
    setActionCompId(item.competency.id);

    // Default recommended action based on matrix item configuration
    const defaultActionType =
      item.matrixItem.tindakan_gap[0] || tindakanGapOptions[0]?.label || 'Training Penuh';

    setActionType(defaultActionType);
    setActionOwner('Supervisor / L&D PIC');
    setActionDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setActionStatus('open');
    setActionNotes(
      `Tindakan mitigasi kesenjangan kompetensi untuk ${item.competency.nama} (Gap: ${item.gapNumber} Level).`
    );
    setActionResult('');
    setActionModalOpen(true);
  };

  const handleOpenEditAction = (action: DevelopmentAction) => {
    setEditingAction(action);
    setActionEmpId(action.employee_id);
    setActionCompId(action.competency_id);
    setActionType(action.action_type);
    setActionOwner(action.owner);
    setActionDueDate(action.due_date);
    setActionStatus(action.status);
    setActionNotes(action.notes || '');
    setActionResult(action.result || '');
    setActionModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionType.trim() || !actionOwner.trim() || !actionDueDate) {
      toast.error('Lengkapi seluruh field wajib');
      return;
    }

    try {
      if (editingAction) {
        store.updateDevAction(editingAction.id, {
          action_type: actionType,
          owner: actionOwner,
          due_date: actionDueDate,
          status: actionStatus,
          notes: actionNotes,
          result: actionResult,
        });
        toast.success('Rencana Tindak Lanjut Diperbarui');
      } else {
        store.addDevAction({
          employee_id: actionEmpId,
          competency_id: actionCompId,
          gap_level: -1,
          action_type: actionType,
          owner: actionOwner,
          due_date: actionDueDate,
          status: actionStatus,
          notes: actionNotes,
          result: actionResult,
        });
        toast.success('Rencana Tindak Lanjut Dibuat');
      }
      setActionModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message);
    }
  };

  // Export to Excel (Siap Cetak)
  const handleExportExcel = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Jabatan',
      'Departemen',
      'Kompetensi Wajib',
      'Level Wajib',
      'Level Riil',
      'Status Gap',
      'Rekomendasi Tindakan',
      'Status Action Plan',
    ];

    const rows = filteredGaps.map((g) => {
      const statusLabel = !g.hasAssessment
        ? 'Belum Dinilai'
        : g.gapNumber < 0
        ? `Gap (${g.gapNumber} Level)`
        : 'Compliant';

      return [
        g.employee.employee_code,
        g.employee.nama,
        g.position?.nama_jabatan || '-',
        g.department?.nama || '-',
        g.competency.nama,
        g.requiredLevel?.nama_level || '-',
        g.actualLevel?.nama_level || 'Belum Dinilai',
        statusLabel,
        g.existingAction ? g.existingAction.action_type : g.matrixItem.tindakan_gap.join('; ') || '-',
        g.existingAction ? g.existingAction.status.toUpperCase() : 'Belum Ada',
      ];
    });

    exportToExcelTable({
      filename: `Analisis_Gap_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN ANALISIS KESENJANGAN KOMPETENSI KARYAWAN',
      subtitle: 'Pemetaan Gap Level Wajib vs Level Riil dan Status Action Plan',
      headers,
      rows,
      summaryCards: [
        { label: 'Total Pemetaan', value: filteredGaps.length },
        { label: 'Compliant', value: totalCompliant },
        { label: 'Gap Level', value: totalGap },
        { label: 'Perlu Dinilai', value: totalUnassessed },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh');
  };

  // Export to PDF
  const handleExportPdf = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Jabatan',
      'Kompetensi',
      'Wajib',
      'Riil',
      'Status Gap',
      'Tindakan',
    ];

    const rows = filteredGaps.map((g) => {
      const statusLabel = !g.hasAssessment
        ? 'Perlu Dinilai'
        : g.gapNumber < 0
        ? `Gap (${g.gapNumber})`
        : 'Compliant';

      return [
        g.employee.employee_code,
        g.employee.nama,
        g.position?.nama_jabatan || '-',
        g.competency.nama,
        g.requiredLevel?.nama_level || '-',
        g.actualLevel?.nama_level || 'Belum Dinilai',
        statusLabel,
        g.existingAction ? g.existingAction.action_type : g.matrixItem.tindakan_gap.join(', ') || '-',
      ];
    });

    exportToPdfTable({
      filename: `Analisis_Gap_${new Date().toISOString().slice(0, 10)}`,
      title: 'LAPORAN ANALISIS GAP KOMPETENSI',
      subtitle: 'Standar Evaluasi dan Pemetaan Pengembangan Karyawan',
      headers,
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh');
  };

  // Export to CSV
  const handleExportCsv = () => {
    const rows = filteredGaps.map((g) => {
      const statusLabel = !g.hasAssessment
        ? 'Belum Dinilai'
        : g.gapNumber < 0
        ? `Gap ${g.gapNumber} Level`
        : 'Compliant';

      return [
        g.employee.employee_code,
        g.employee.nama,
        g.position?.nama_jabatan || '-',
        g.department?.nama || '-',
        g.competency.nama,
        g.requiredLevel?.nama_level || '-',
        g.actualLevel?.nama_level || 'Belum Dinilai',
        statusLabel,
        g.existingAction ? g.existingAction.action_type : g.matrixItem.tindakan_gap.join('; '),
        g.existingAction ? g.existingAction.status : 'Belum Ada Action Plan',
      ];
    });

    exportToCsv(
      `Analisis_Gap_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      rows,
      [
        'NIK',
        'Nama Karyawan',
        'Jabatan',
        'Departemen',
        'Kompetensi',
        'Level Wajib',
        'Level Riil',
        'Status Gap',
        'Rekomendasi Tindakan',
        'Status Action Plan',
      ]
    );
    toast.success('File diekspor', 'Laporan analisis gap berhasil diunduh ke CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Analisis Gap & Development Plan</h1>
            <p className="text-xs text-slate-500">
              PRD 6.7: Perbandingan level aktual vs level wajib jabatan, rekomendasi tindakan pengembangan, PIC, dan target penyelesaian.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="emerald"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={handleExportExcel}
            title="Unduh format tabel Excel siap cetak"
          >
            Excel (Siap Cetak)
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5 text-rose-600" />}
            onClick={handleExportPdf}
            title="Unduh format dokumen PDF"
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            onClick={handleExportCsv}
          >
            CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            Status Kesenjangan:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-teal-900"
          >
            <option value="gap_only">Tampilkan Hanya Gap / Belum Memenuhi</option>
            <option value="all">Tampilkan Semua Status</option>
            <option value="compliant">Tampilkan Hanya Yang Memenuhi (Compliant)</option>
          </select>
        </div>
      </div>

      {/* Gap Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Karyawan & Jabatan</th>
                <th className="p-4">Kompetensi Wajib</th>
                <th className="p-4 text-center">Level Wajib</th>
                <th className="p-4 text-center">Level Riil</th>
                <th className="p-4 text-center">Status Gap</th>
                <th className="p-4">Rekomendasi Tindakan (PRD 6.7)</th>
                <th className="p-4">Action Plan & PIC</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data kesenjangan kompetensi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredGaps.map((g, idx) => {
                  const isCompliant = g.hasAssessment && g.gapNumber >= 0;
                  const isGap = g.hasAssessment && g.gapNumber < 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Employee */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{g.employee.nama}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {g.position?.nama_jabatan} • {g.department?.kode || 'OPS'}
                        </div>
                      </td>

                      {/* Competency */}
                      <td className="p-4 font-semibold text-slate-800 max-w-xs">
                        {g.competency.nama}
                      </td>

                      {/* Required Level */}
                      <td className="p-4 text-center">
                        <Badge variant="teal" size="sm">
                          {g.requiredLevel?.nama_level || '-'}
                        </Badge>
                      </td>

                      {/* Actual Level */}
                      <td className="p-4 text-center">
                        <Badge
                          variant={!g.hasAssessment ? 'slate' : isCompliant ? 'emerald' : 'rose'}
                          size="sm"
                        >
                          {g.actualLevel ? g.actualLevel.nama_level : 'Belum Dinilai'}
                        </Badge>
                      </td>

                      {/* Status Gap */}
                      <td className="p-4 text-center">
                        {!g.hasAssessment ? (
                          <Badge variant="slate" size="sm">
                            Perlu Penilaian
                          </Badge>
                        ) : isCompliant ? (
                          <Badge variant="emerald" size="sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Compliant
                          </Badge>
                        ) : (
                          <Badge variant="rose" size="sm">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Gap ({g.gapNumber} Level)
                          </Badge>
                        )}
                      </td>

                      {/* Recommendation */}
                      <td className="p-4 max-w-xs">
                        <div className="text-[11px] font-medium text-slate-700">
                          {g.matrixItem.tindakan_gap.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {g.matrixItem.tindakan_gap.map((t, tidx) => (
                                <span
                                  key={tidx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Training / OJT standar</span>
                          )}
                        </div>
                      </td>

                      {/* Action Plan */}
                      <td className="p-4">
                        {g.existingAction ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={
                                  g.existingAction.status === 'completed'
                                    ? 'emerald'
                                    : g.existingAction.status === 'in_progress'
                                    ? 'blue'
                                    : 'amber'
                                }
                                size="sm"
                              >
                                {g.existingAction.status.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-slate-900 text-xs">
                                {g.existingAction.action_type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              PIC: {g.existingAction.owner} • Tgl: {g.existingAction.due_date}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum dibuat</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {g.existingAction ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenEditAction(g.existingAction!)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={() => {
                                const action = g.existingAction!;
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Hapus Rencana Pengembangan',
                                  message: `Apakah Anda yakin ingin menghapus rencana aksi "${action.action_type}" untuk ${g.employee.nama}?`,
                                  onConfirm: () => {
                                    store.deleteDevAction(action.id);
                                    toast.info('Action Plan Dihapus');
                                  },
                                });
                              }}
                              title="Hapus Plan"
                            />
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Plus className="w-3.5 h-3.5 text-teal-600" />}
                            onClick={() => handleOpenCreateAction(g)}
                          >
                            + Buat Plan
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT DEVELOPMENT ACTION PLAN */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={editingAction ? 'Edit Rencana Tindak Lanjut' : 'Buat Development Action Plan'}
        subtitle="Rekomendasi tindakan mitigasi kesenjangan kompetensi karyawan"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Tindakan *
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-teal-900"
              >
                {tindakanGapOptions.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Pelaksanaan *
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="open">Open (Belum Dimulai)</option>
                <option value="in_progress">In Progress (Sedang Berjalan)</option>
                <option value="completed">Completed (Selesai)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Penanggung Jawab (PIC) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Ratna Sari (Supervisor)"
                value={actionOwner}
                onChange={(e) => setActionOwner(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Tanggal Penyelesaian *
              </label>
              <input
                type="date"
                required
                value={actionDueDate}
                onChange={(e) => setActionDueDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rincian Tugas & Rencana Pengembangan
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan langkah spesifik yang harus diselesaikan karyawan dan PIC..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 leading-relaxed"
            />
          </div>

          {actionStatus === 'completed' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hasil Akhir / Evaluasi Reassessment
              </label>
              <textarea
                rows={2}
                placeholder="Catat hasil evaluasi setelah tindakan selesai (misal: kompetensi naik ke level yang dipersyaratkan)..."
                value={actionResult}
                onChange={(e) => setActionResult(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 leading-relaxed"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setActionModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Action Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Hapus Plan"
        variant="danger"
      />
    </div>
  );
};
