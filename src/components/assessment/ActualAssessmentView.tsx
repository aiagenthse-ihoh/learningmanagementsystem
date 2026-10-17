import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { CompetencyAssessment, Employee } from '../../types/lcms';
import {
  ClipboardCheck,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const ActualAssessmentView: React.FC = () => {
  const toast = useToast();
  const employees = store.getEmployees();
  const competencies = store.getCompetencies();
  const levels = store.getLevels();
  const positions = store.getPositions();
  const assessments = store.getAssessments();
  const pemenuhanOptions = store.getConfigOptions('pemenuhan');

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

  // Selected employee filter
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');

  // Assessment Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetEmpId, setTargetEmpId] = useState<string>(employees[0]?.id || '');
  const [targetCompId, setTargetCompId] = useState<string>(competencies[0]?.id || '');
  const [actualLevelId, setActualLevelId] = useState<string>(levels[0]?.id || '');
  const [evidenceMethod, setEvidenceMethod] = useState('Practical/OJT');
  const [evidenceText, setEvidenceText] = useState('');

  const currentEmp = employees.find((e) => e.id === selectedEmpId);
  const currentPos = currentEmp ? positions.find((p) => p.id === currentEmp.position_id) : null;
  const posMatrix = currentPos ? store.getMatrix(currentPos.id) : [];

  // Filtered assessments for current employee
  const empAssessments = assessments.filter((a) => a.employee_id === selectedEmpId);

  const handleOpenAddAssessment = (compDefaultId?: string) => {
    setTargetEmpId(selectedEmpId);
    setTargetCompId(compDefaultId || competencies[0]?.id || '');
    setActualLevelId(levels[1]?.id || levels[0]?.id || '');
    setEvidenceMethod('Practical/OJT');
    setEvidenceText('');
    setModalOpen(true);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      toast.error('Catatan bukti penilaian wajib diisi');
      return;
    }

    try {
      store.recordAssessment(
        targetEmpId,
        targetCompId,
        actualLevelId,
        evidenceText.trim(),
        evidenceMethod
      );
      toast.success(
        'Penilaian Aktual Tersimpan',
        'Level kompetensi riil karyawan berhasil dicatat dan akan langsung memperbarui kalkulasi Gap Analysis.'
      );
      setModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Penilaian', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Penilaian Kompetensi Aktual (Assessor)</h1>
            <p className="text-xs text-slate-500">
              PRD 6.6: Evaluasi level kompetensi riil oleh Supervisor/Assessor berbasis bukti verifikasi praktik, OJT, atau sertifikasi.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenAddAssessment()}
        >
          + Input Penilaian Baru
        </Button>
      </div>

      {/* Employee Selector Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Pilih Karyawan Dinilai:
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer min-w-[240px]"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nama} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        {currentEmp && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Jabatan: <strong className="text-teal-300">{currentPos?.nama_jabatan || '-'}</strong>
            </span>
            <span className="text-slate-400">
              Kompetensi Wajib: <strong className="text-emerald-400">{posMatrix.filter((m) => m.wajib).length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Required Competency Checklist & Actual Level Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Status Evaluasi Kompetensi Jabatan Karyawan
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {posMatrix.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700">Belum ada matriks kompetensi untuk jabatan ini.</p>
              <p className="text-xs text-slate-400 mt-1">
                Atur kompetensi wajib jabatan ini pada menu "Matriks Kompetensi".
              </p>
            </div>
          ) : (
            posMatrix.map((req) => {
              const comp = competencies.find((c) => c.id === req.competency_id);
              if (!comp) return null;

              const reqLevel = levels.find((l) => l.id === req.required_level_id);
              const assessment = empAssessments.find((a) => a.competency_id === comp.id);
              const actualLevel = assessment ? levels.find((l) => l.id === assessment.actual_level_id) : null;

              const hasAssessment = !!assessment;
              const isGap = hasAssessment && actualLevel && reqLevel && actualLevel.urutan < reqLevel.urutan;
              const isMet = hasAssessment && actualLevel && reqLevel && actualLevel.urutan >= reqLevel.urutan;

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-all"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{comp.nama}</h4>
                      {req.wajib && (
                        <Badge variant="teal" size="sm">
                          Wajib Jabatan
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{comp.deskripsi}</p>
                    {assessment && (
                      <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>
                            Bukti: <strong>{assessment.evidence_method || 'Observasi'}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(assessment.assessed_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-slate-700 italic">"{assessment.evidence}"</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Levels Comparison & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                    {/* Required Level */}
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200 min-w-[120px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Level Wajib
                      </span>
                      <strong className="text-xs font-bold text-slate-800">
                        {reqLevel?.nama_level || '-'}
                      </strong>
                    </div>

                    {/* Actual Level */}
                    <div
                      className={`p-3 rounded-xl text-center border min-w-[140px] ${
                        !hasAssessment
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : isGap
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase block">
                        Level Aktual (Riil)
                      </span>
                      <strong className="text-xs font-bold">
                        {actualLevel ? actualLevel.nama_level : 'Belum Dinilai'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={hasAssessment ? 'outline' : 'primary'}
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenAddAssessment(comp.id)}
                      >
                        {hasAssessment ? 'Nilai Ulang' : 'Input Nilai'}
                      </Button>

                      {hasAssessment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            if (!assessment) return;
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Hapus Penilaian Aktual',
                              message: `Apakah Anda yakin ingin menghapus catatan penilaian untuk kompetensi "${comp.nama}"? Status akan kembali menjadi "Belum Dinilai".`,
                              onConfirm: () => {
                                store.deleteAssessment(assessment.id);
                                toast.info('Penilaian Dihapus');
                              },
                            });
                          }}
                          title="Hapus Penilaian"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: INPUT PENILAIAN */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Input Penilaian Kompetensi Aktual"
        subtitle="Post-test saja tidak membuktikan keterampilan praktik; sertakan catatan bukti konkret."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Karyawan Dinilai *
              </label>
              <select
                value={targetEmpId}
                onChange={(e) => setTargetEmpId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nama} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kompetensi *
              </label>
              <select
                value={targetCompId}
                onChange={(e) => setTargetCompId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {competencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Level Kompetensi Aktual *
              </label>
              <select
                value={actualLevelId}
                onChange={(e) => setActualLevelId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-teal-900"
              >
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama_level} (Urutan {l.urutan})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Metode Bukti Pemenuhan *
              </label>
              <select
                value={evidenceMethod}
                onChange={(e) => setEvidenceMethod(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {pemenuhanOptions.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
                <option value="Practical/OJT">Practical / OJT Lapangan</option>
                <option value="Sertifikasi">Sertifikat Resmi / Lisensi</option>
                <option value="Evaluasi Supervisor">Observasi Langsung Supervisor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Bukti / Justifikasi Penilaian *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Contoh: Telah lulus uji simulasi tanggap darurat tumpahan kimia di workshop, mampu memimpin briefing K3 mandiri..."
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Penilaian Aktual
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
        confirmText="Hapus Penilaian"
        variant="danger"
      />
    </div>
  );
};
