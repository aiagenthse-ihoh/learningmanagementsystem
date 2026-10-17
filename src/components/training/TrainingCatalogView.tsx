import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { Training, LearningMaterial } from '../../types/lcms';
import {
  BookOpen,
  Plus,
  Edit2,
  Video,
  FileText,
  UserPlus,
  Clock,
  Award,
  CheckCircle2,
  Trash2,
  Link as LinkIcon,
  Upload,
  HardDrive,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  // Match standard drive url: /file/d/ID/view...
  const matchFile = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return `https://drive.google.com/file/d/${matchFile[1]}/preview`;
  }
  // Match id=ID query param
  const matchId = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/file/d/${matchId[1]}/preview`;
  }
  return url;
}

export const TrainingCatalogView: React.FC<{ onNavigateToQuiz?: () => void }> = ({ onNavigateToQuiz }) => {
  const toast = useToast();
  const trainings = store.getTrainings(true);
  const positions = store.getPositions();
  const competencies = store.getCompetencies();
  const employees = store.getEmployees();
  const categories = store.getConfigOptions('training_kategori');

  // Permissions
  const canEditTraining = store.hasPermission('can_edit_training');
  const canUploadMaterial = store.hasPermission('can_upload_material');
  const canAssignTraining = store.hasPermission('can_assign_training');

  // Modal State: Training Form
  const [trnModalOpen, setTrnModalOpen] = useState(false);
  const [editingTrn, setEditingTrn] = useState<Training | null>(null);
  const [trnTitle, setTrnTitle] = useState('');
  const [trnDesc, setTrnDesc] = useState('');
  const [trnCat, setTrnCat] = useState('');
  const [trnDuration, setTrnDuration] = useState(45);
  const [trnPassingGrade, setTrnPassingGrade] = useState(75);
  const [trnMaxAttempts, setTrnMaxAttempts] = useState(3);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [activeTrainingForMaterial, setActiveTrainingForMaterial] = useState<Training | null>(null);
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [showDrivePreview, setShowDrivePreview] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'video' | 'document' | 'link' | 'pdf'>('video');
  const [matSourceType, setMatSourceType] = useState<'google_drive' | 'uploaded_file' | 'external_url'>('google_drive');
  const [matUrl, setMatUrl] = useState('');
  const [matDuration, setMatDuration] = useState(15);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Modal State: Assignment
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeTrainingForAssign, setActiveTrainingForAssign] = useState<Training | null>(null);
  const [selectedEmployeesToAssign, setSelectedEmployeesToAssign] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

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

  // Open Create Training
  const handleOpenCreateTrn = () => {
    setEditingTrn(null);
    setTrnTitle('');
    setTrnDesc('');
    setTrnCat(categories[0]?.label || 'Umum');
    setTrnDuration(45);
    setTrnPassingGrade(75);
    setTrnMaxAttempts(3);
    setSelectedPositions([]);
    setSelectedCompetencies([]);
    setTrnModalOpen(true);
  };

  // Open Edit Training
  const handleOpenEditTrn = (trn: Training) => {
    setEditingTrn(trn);
    setTrnTitle(trn.judul);
    setTrnDesc(trn.deskripsi);
    setTrnCat(trn.kategori);
    setTrnDuration(trn.durasi_menit);
    setTrnPassingGrade(trn.passing_grade);
    setTrnMaxAttempts(trn.max_attempts);
    setSelectedPositions([...trn.target_positions]);
    setSelectedCompetencies([...trn.target_competencies]);
    setTrnModalOpen(true);
  };

  // Delete Training
  const handleDeleteTrn = (trn: Training) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Program Training',
      message: `Apakah Anda yakin ingin menghapus program "${trn.judul}"? Seluruh materi pembelajaran, butir soal, dan riwayat penugasan terkait akan ikut dibersihkan.`,
      onConfirm: () => {
        try {
          store.deleteTraining(trn.id);
          toast.success('Training Dihapus', `Program "${trn.judul}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Save Training
  const handleSaveTrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trnTitle.trim()) {
      toast.error('Judul training wajib diisi');
      return;
    }

    try {
      if (editingTrn) {
        store.updateTraining(editingTrn.id, {
          judul: trnTitle.trim(),
          deskripsi: trnDesc.trim(),
          kategori: trnCat,
          durasi_menit: Number(trnDuration),
          passing_grade: Number(trnPassingGrade),
          max_attempts: Number(trnMaxAttempts),
          target_positions: selectedPositions,
          target_competencies: selectedCompetencies,
        });
        toast.success('Program Training Diperbarui');
      } else {
        const currentUser = store.getCurrentUser();
        store.addTraining({
          judul: trnTitle.trim(),
          deskripsi: trnDesc.trim(),
          kategori: trnCat,
          trainer_id: currentUser.id,
          durasi_menit: Number(trnDuration),
          passing_grade: Number(trnPassingGrade),
          max_attempts: Number(trnMaxAttempts),
          target_positions: selectedPositions,
          target_competencies: selectedCompetencies,
          status: 'active',
        });
        toast.success('Program Training Dibuat');
      }
      setTrnModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Training', err.message);
    }
  };

  // Open Materials Modal
  const handleOpenMaterials = (trn: Training) => {
    setActiveTrainingForMaterial(trn);
    setEditingMatId(null);
    setShowDrivePreview(false);
    setMatTitle('');
    setMatUrl('');
    setUploadedFileName('');
    setMatType('video');
    setMatSourceType('google_drive');
    setMatDuration(15);
    setMaterialModalOpen(true);
  };

  const handleStartEditMaterial = (mat: LearningMaterial) => {
    setEditingMatId(mat.id);
    setMatTitle(mat.judul);
    setMatType(mat.tipe);
    setMatSourceType(mat.source_type || 'google_drive');
    setMatUrl(mat.url);
    setMatDuration(mat.durasi_menit || 15);
    setUploadedFileName(mat.file_name || '');
    setShowDrivePreview(false);
  };

  const handleCancelEditMaterial = () => {
    setEditingMatId(null);
    setMatTitle('');
    setMatUrl('');
    setUploadedFileName('');
    setShowDrivePreview(false);
  };

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) {
        toast.error(
          'File Terlalu Besar',
          'Maksimal ukuran video upload langsung adalah 60MB. Untuk video durasi panjang, gunakan link Google Drive.'
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setMatUrl(reader.result as string);
        setUploadedFileName(file.name);
        if (!matTitle) {
          setMatTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        toast.success('Video Dimuat!', `File "${file.name}" siap ditambahkan ke silabus.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Update Material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainingForMaterial || !matTitle.trim() || !matUrl.trim()) {
      toast.error('Judul dan URL/File materi wajib diisi');
      return;
    }

    const finalUrl =
      matSourceType === 'google_drive' ? convertGoogleDriveUrl(matUrl.trim()) : matUrl.trim();

    if (editingMatId) {
      store.updateMaterial(editingMatId, {
        judul: matTitle.trim(),
        tipe: matType,
        url: finalUrl,
        source_type: matSourceType,
        file_name: uploadedFileName || undefined,
        durasi_menit: Number(matDuration),
      });
      toast.success('Materi Diperbarui', `Materi "${matTitle}" berhasil diperbarui.`);
      setEditingMatId(null);
    } else {
      const currentMaterials = store.getMaterials(activeTrainingForMaterial.id);
      store.addMaterial({
        training_id: activeTrainingForMaterial.id,
        judul: matTitle.trim(),
        tipe: matType,
        url: finalUrl,
        source_type: matSourceType,
        file_name: uploadedFileName || undefined,
        urutan: currentMaterials.length + 1,
        durasi_menit: Number(matDuration),
      });
      toast.success('Materi Ditambahkan', `Materi "${matTitle}" berhasil dimasukkan ke silabus.`);
    }

    setMatTitle('');
    setMatUrl('');
    setUploadedFileName('');
    setShowDrivePreview(false);
  };

  // Open Assign Modal
  const handleOpenAssign = (trn: Training) => {
    setActiveTrainingForAssign(trn);
    const matched = employees
      .filter((e) => trn.target_positions.includes(e.position_id))
      .map((e) => e.id);
    setSelectedEmployeesToAssign(matched.length > 0 ? matched : []);
    setAssignModalOpen(true);
  };

  // Submit Assign
  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainingForAssign) return;
    if (selectedEmployeesToAssign.length === 0) {
      toast.error('Pilih minimal satu karyawan untuk ditugaskan');
      return;
    }

    store.assignTraining(activeTrainingForAssign.id, selectedEmployeesToAssign, dueDate);
    toast.success('Penugasan Berhasil', `${selectedEmployeesToAssign.length} karyawan berhasil ditugaskan.`);
    setAssignModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Katalog Program Training & Silabus</h1>
            <p className="text-xs text-slate-500">
              PRD 6.4: Kelola modul training, upload video langsung, integrasi link materi Google Drive, dan penugasan karyawan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToQuiz && (
            <Button variant="outline" size="sm" onClick={onNavigateToQuiz}>
              Kelola Bank Soal
            </Button>
          )}
          {canEditTraining && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateTrn}
            >
              + Buat Training Baru
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Trainings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trainings.map((trn) => {
          const materials = store.getMaterials(trn.id);
          const questions = store.getQuestions(trn.id);
          const assignments = store.getAssignments().filter((a) => a.training_id === trn.id);
          const completedCount = assignments.filter((a) => a.status === 'completed').length;

          return (
            <div
              key={trn.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="teal" size="sm">
                    {trn.kategori}
                  </Badge>
                  <Badge variant={trn.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {trn.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                  {trn.judul}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {trn.deskripsi}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Durasi</span>
                    <span className="text-xs font-bold text-slate-800">{trn.durasi_menit} mnt</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Batas Lulus</span>
                    <span className="text-xs font-bold text-teal-800">{trn.passing_grade}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Materi/Soal</span>
                    <span className="text-xs font-bold text-slate-800">
                      {materials.length}m / {questions.length}s
                    </span>
                  </div>
                </div>

                {/* Assignment stats */}
                <div className="mt-3 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between text-xs text-teal-900">
                  <span>Peserta Ditugaskan:</span>
                  <span className="font-bold">
                    {completedCount} / {assignments.length} Selesai
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    icon={<Video className="w-3.5 h-3.5 text-teal-700" />}
                    onClick={() => handleOpenMaterials(trn)}
                  >
                    Materi ({materials.length})
                  </Button>
                  {canAssignTraining && (
                    <Button
                      variant="emerald"
                      size="sm"
                      className="text-xs"
                      icon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenAssign(trn)}
                    >
                      Tugaskan
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {canEditTraining && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEditTrn(trn)}
                        title="Edit Silabus Training"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleDeleteTrn(trn)}
                        title="Hapus Program Training"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD/EDIT TRAINING */}
      <Modal
        isOpen={trnModalOpen}
        onClose={() => setTrnModalOpen(false)}
        title={editingTrn ? 'Edit Program Training & Silabus' : 'Buat Program Training Baru'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTrn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Training *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Manajemen Tanggap Darurat Kebakaran & Evakuasi"
              value={trnTitle}
              onChange={(e) => setTrnTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Training *
              </label>
              <select
                value={trnCat}
                onChange={(e) => setTrnCat(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Durasi Estimasi (Menit) *
              </label>
              <input
                type="number"
                min={5}
                required
                value={trnDuration}
                onChange={(e) => setTrnDuration(parseInt(e.target.value, 10))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ambang Batas Kelulusan (Passing Grade %) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={trnPassingGrade}
                onChange={(e) => setTrnPassingGrade(parseInt(e.target.value, 10))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maksimal Percobaan Tes (Attempts) *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={trnMaxAttempts}
                onChange={(e) => setTrnMaxAttempts(parseInt(e.target.value, 10))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Silabus Pembelajaran
            </label>
            <textarea
              rows={3}
              placeholder="Rangkum silabus pembelajaran, capaian kompetensi, dan modul yang dibahas..."
              value={trnDesc}
              onChange={(e) => setTrnDesc(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Target Positions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Jabatan Wajib
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {positions.map((pos) => {
                const isSelected = selectedPositions.includes(pos.id);
                return (
                  <button
                    type="button"
                    key={pos.id}
                    onClick={() => {
                      setSelectedPositions((prev) =>
                        isSelected ? prev.filter((id) => id !== pos.id) : [...prev, pos.id]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                      isSelected ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {pos.nama_jabatan}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setTrnModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Program Training
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: MANAGE MATERIALS (UPLOAD VIDEO & GOOGLE DRIVE) */}
      <Modal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title={`Kelola Materi: ${activeTrainingForMaterial?.judul || ''}`}
        subtitle="Upload file video pembelajaran atau hubungkan link Google Drive"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Add / Edit Material Form */}
          {canUploadMaterial ? (
            <form onSubmit={handleAddMaterial} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {editingMatId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
                  </h4>
                  {editingMatId && (
                    <button
                      type="button"
                      onClick={handleCancelEditMaterial}
                      className="text-[11px] text-teal-600 hover:underline font-semibold cursor-pointer"
                    >
                      ← Batal Edit (Kembali ke Tambah Baru)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMatSourceType('google_drive')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      matSourceType === 'google_drive' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Google Drive (Utama)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatSourceType('uploaded_file')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      matSourceType === 'uploaded_file' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Upload Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatSourceType('external_url')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      matSourceType === 'external_url' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Tautan Web
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Judul Modul Materi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul 1: Prosedur Keselamatan Kerja & HIRADC"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Tipe Konten *
                  </label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="video">Video Pembelajaran</option>
                    <option value="document">Dokumen / PDF / Slide / Sheet</option>
                    <option value="link">Tautan Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Estimasi Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={matDuration}
                    onChange={(e) => setMatDuration(parseInt(e.target.value, 10))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Source 1: Google Drive Link (PRIMARY) */}
              {matSourceType === 'google_drive' && (
                <div className="space-y-2.5 p-3.5 bg-teal-50/70 rounded-xl border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <HardDrive className="w-4 h-4 text-teal-700" />
                      <span>Link Penyimpanan Google Drive (Video / Slide / Materi)</span>
                    </div>
                    {matUrl.trim() && (
                      <button
                        type="button"
                        onClick={() => setShowDrivePreview(!showDrivePreview)}
                        className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                      >
                        {showDrivePreview ? 'Tutup Tes Preview' : '👁️ Uji Preview Tautan'}
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/d/1.../view?usp=sharing"
                    value={matUrl}
                    onChange={(e) => setMatUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-teal-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />

                  {/* Google Drive Guide Box */}
                  <div className="p-2.5 bg-white/80 rounded-lg border border-teal-100 text-[11px] text-teal-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-teal-600" />
                      Panduan Google Drive:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                      <li>Buka video pembelajaran atau file materi di Google Drive Anda.</li>
                      <li>Klik kanan file → pilih <strong>Bagikan (Share)</strong> → ubah akses ke <strong>"Siapa saja yang memiliki link"</strong> (Anyone with the link).</li>
                      <li>Klik <strong>Salin Link</strong> dan tempelkan di kotak di atas. Sistem otomatis mengaktifkan pemutar preview interaktif untuk seluruh peserta.</li>
                    </ol>
                  </div>

                  {/* Live Tester Preview Frame */}
                  {showDrivePreview && matUrl.trim() && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-white text-xs px-1">
                        <span className="font-bold text-teal-400">Pratinjau Live Google Drive:</span>
                        <span className="text-[10px] text-slate-400 font-mono">{convertGoogleDriveUrl(matUrl)}</span>
                      </div>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={convertGoogleDriveUrl(matUrl)}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="Pratinjau Google Drive"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Source 2: Direct Video Upload */}
              {matSourceType === 'uploaded_file' && (
                <div className="space-y-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Upload className="w-4 h-4 text-indigo-700" />
                    <span>Upload Video Langsung Dari Perangkat (MP4 / WebM)</span>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleFileUpload}
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-700 file:text-white hover:file:bg-indigo-800 cursor-pointer"
                  />
                  {uploadedFileName && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-800 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>File terpilih: {uploadedFileName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Source 3: External URL */}
              {matSourceType === 'external_url' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    URL Tautan Eksternal *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://contoh.com/materi.mp4"
                    value={matUrl}
                    onChange={(e) => setMatUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingMatId && (
                  <Button variant="outline" size="sm" type="button" onClick={handleCancelEditMaterial}>
                    Batal
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  icon={editingMatId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {editingMatId ? 'Simpan Perubahan Materi' : 'Tambah ke Silabus'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Anda hanya memiliki izin untuk melihat materi pembelajaran. Hubungi Admin/Trainer untuk mengunggah materi baru.</span>
            </div>
          )}

          {/* Current Materials List with Delete */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Materi Silabus ({activeTrainingForMaterial ? store.getMaterials(activeTrainingForMaterial.id).length : 0})
            </h4>
            {activeTrainingForMaterial && store.getMaterials(activeTrainingForMaterial.id).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Belum ada materi pembelajaran yang diunggah.</p>
            ) : (
              activeTrainingForMaterial &&
              store.getMaterials(activeTrainingForMaterial.id).map((mat, idx) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{mat.judul}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="teal" size="sm">
                          {mat.source_type === 'google_drive' ? 'Google Drive' : mat.tipe.toUpperCase()}
                        </Badge>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs">{mat.url}</span>
                      </div>
                    </div>
                  </div>

                  {canUploadMaterial && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-teal-700 hover:bg-slate-100"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleStartEditMaterial(mat)}
                        title="Edit Materi"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          store.deleteMaterial(mat.id);
                          toast.info('Materi Dihapus');
                        }}
                        title="Hapus Materi"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: ASSIGN TRAINING */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Tugaskan Training: ${activeTrainingForAssign?.judul || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Batas Waktu Penyelesaian (Due Date) *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Karyawan ({selectedEmployeesToAssign.length} Dipilih) *
              </label>
              <button
                type="button"
                onClick={() => setSelectedEmployeesToAssign(employees.map((e) => e.id))}
                className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
              >
                Pilih Semua
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {employees.map((emp) => {
                const checked = selectedEmployeesToAssign.includes(emp.id);
                const pos = positions.find((p) => p.id === emp.position_id);
                return (
                  <label
                    key={emp.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedEmployeesToAssign((prev) =>
                            checked ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                          );
                        }}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{emp.nama}</p>
                        <p className="text-[11px] text-slate-500">{pos ? pos.nama_jabatan : '-'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{emp.employee_code}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setAssignModalOpen(false)}>
              Batal
            </Button>
            <Button variant="emerald" type="submit">
              Konfirmasi Penugasan
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
