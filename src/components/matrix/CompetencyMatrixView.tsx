import React, { useState, useEffect } from 'react';
import { store } from '../../lib/storage';
import {
  Grid3X3,
  Save,
  CheckCircle2,
  Filter,
  PlusCircle,
  Plus,
  FileSpreadsheet,
  FileText,
  Download,
  AlertCircle,
  Search,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  XCircle,
  Edit2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { exportToExcelTable, exportToPdfTable, exportToCsv } from '../../lib/exportUtils';
import { ConfigOption, Competency } from '../../types/lcms';

interface MatrixRowState {
  competency_id: string;
  wajib: boolean;
  required_level_id: string;
  pemenuhan_checklist: string[];
  tindakan_gap: string[];
}

export const CompetencyMatrixView: React.FC<{ onNavigateToOrg?: () => void }> = ({ onNavigateToOrg }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'config' | 'overview'>('config');

  // Trigger state refresh
  const [reloadTick, setReloadTick] = useState(0);

  // Master data from store
  const positions = store.getPositions();
  const competencies = store.getCompetencies();
  const categories = store.getCategories();
  const levels = store.getLevels();
  const pemenuhanOptions = store.getConfigOptions('pemenuhan');
  const tindakanGapOptions = store.getConfigOptions('tindakan_gap');

  // Currently selected position
  const [selectedPositionId, setSelectedPositionId] = useState<string>(
    positions[0]?.id || ''
  );

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Local draft state for current position's matrix configuration
  const [draftRows, setDraftRows] = useState<Record<string, MatrixRowState>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Option Modal State
  const [optModalOpen, setOptModalOpen] = useState(false);
  const [optCategory, setOptCategory] = useState<'pemenuhan' | 'tindakan_gap'>('pemenuhan');
  const [optLabel, setOptLabel] = useState('');

  // Competency Master Edit/Add Modal State
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competency | null>(null);
  const [compName, setCompName] = useState('');
  const [compCatId, setCompCatId] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compBehavior, setCompBehavior] = useState('');

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'primary';
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load draft rows ONLY when selectedPositionId or explicit reloadTick changes
  useEffect(() => {
    if (!selectedPositionId) return;

    const existingMatrix = store.getMatrix(selectedPositionId);
    const currentCompetencies = store.getCompetencies();
    const currentLevels = store.getLevels();
    const initialMap: Record<string, MatrixRowState> = {};

    currentCompetencies.forEach((comp) => {
      const match = existingMatrix.find((m) => m.competency_id === comp.id);
      if (match) {
        initialMap[comp.id] = {
          competency_id: comp.id,
          wajib: match.wajib,
          required_level_id: match.required_level_id || (currentLevels[0]?.id ?? ''),
          pemenuhan_checklist: [...(match.pemenuhan_checklist || [])],
          tindakan_gap: [...(match.tindakan_gap || [])],
        };
      } else {
        // Unchecked by default
        initialMap[comp.id] = {
          competency_id: comp.id,
          wajib: false,
          required_level_id: currentLevels[0]?.id || '',
          pemenuhan_checklist: [],
          tindakan_gap: [],
        };
      }
    });

    setDraftRows(initialMap);
    setHasUnsavedChanges(false);
  }, [selectedPositionId, reloadTick]);

  // Handle position change
  const handlePositionChange = (posId: string) => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: 'Perubahan Belum Disimpan',
        message: 'Ada perubahan pada konfigurasi jabatan ini yang belum disimpan. Yakin ingin berganti jabatan tanpa menyimpan?',
        variant: 'primary',
        confirmLabel: 'Ganti Tanpa Menyimpan',
        onConfirm: () => {
          setSelectedPositionId(posId);
          setHasUnsavedChanges(false);
        },
      });
      return;
    }
    setSelectedPositionId(posId);
  };

  // Option handlers for inline checklist customization
  const handleOpenAddOption = (category: 'pemenuhan' | 'tindakan_gap') => {
    setOptCategory(category);
    setOptLabel('');
    setOptModalOpen(true);
  };

  const handleSaveOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optLabel.trim()) return;
    store.addConfigOption(optCategory, optLabel.trim());
    toast.success('Opsi Checklist Ditambahkan', `"${optLabel}" kini tersedia di checklist.`);
    setOptModalOpen(false);
    setOptLabel('');
    setReloadTick((t) => t + 1);
  };

  const handleDeleteOption = (opt: ConfigOption) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Opsi Checklist',
      message: `Hapus opsi checklist "${opt.label}"? Opsi ini akan dihilangkan dari seluruh pilihan.`,
      variant: 'danger',
      confirmLabel: 'Hapus Opsi',
      onConfirm: () => {
        store.deleteConfigOption(opt.id);
        toast.info('Opsi Dihapus', `Opsi "${opt.label}" telah dihapus.`);
        setReloadTick((t) => t + 1);
      },
    });
  };

  // Competency Master CRUD Handlers (Edit & Hapus Permanen)
  const handleOpenAddComp = () => {
    setEditingComp(null);
    setCompName('');
    setCompCatId(categories[0]?.id || '');
    setCompDesc('');
    setCompBehavior('');
    setCompModalOpen(true);
  };

  const handleOpenEditComp = (comp: Competency) => {
    setEditingComp(comp);
    setCompName(comp.nama);
    setCompCatId(comp.kategori_id);
    setCompDesc(comp.deskripsi);
    setCompBehavior(comp.indikator_perilaku || '');
    setCompModalOpen(true);
  };

  const handleSaveComp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      toast.error('Nama kompetensi wajib diisi');
      return;
    }
    if (!compCatId) {
      toast.error('Pilih kategori kompetensi');
      return;
    }

    try {
      if (editingComp) {
        store.updateCompetency(editingComp.id, {
          nama: compName.trim(),
          kategori_id: compCatId,
          deskripsi: compDesc.trim(),
          indikator_perilaku: compBehavior.trim(),
        });
        toast.success('Kompetensi Diperbarui', `Perubahan pada "${compName}" berhasil disimpan secara permanen.`);
      } else {
        store.addCompetency(
          compName.trim(),
          compCatId,
          compDesc.trim(),
          compBehavior.trim()
        );
        toast.success('Kompetensi Dibuat', `Kompetensi "${compName}" berhasil ditambahkan ke database.`);
      }
      setCompModalOpen(false);
      setReloadTick((t) => t + 1);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Kompetensi', err.message);
    }
  };

  const handlePermanentDeleteComp = (comp: Competency) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Permanen: ${comp.nama}`,
      message: `PERINGATAN PERMANEN: Kompetensi "${comp.nama}" akan dihapus secara PERMANEN dari seluruh database sistem (termasuk dari seluruh jabatan dan penilaian). Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus Permanen',
      onConfirm: () => {
        store.deleteCompetency(comp.id);
        setDraftRows((prev) => {
          const copy = { ...prev };
          delete copy[comp.id];
          return copy;
        });
        setReloadTick((t) => t + 1);
        toast.success(
          'Kompetensi Dihapus Permanen',
          `"${comp.nama}" telah dihapus secara permanen dari seluruh sistem.`
        );
      },
    });
  };

  // Toggle competency wajib
  const handleToggleWajib = (compId: string) => {
    setDraftRows((prev) => {
      const current = prev[compId] || {
        competency_id: compId,
        wajib: false,
        required_level_id: levels[0]?.id || '',
        pemenuhan_checklist: [],
        tindakan_gap: [],
      };

      const newWajib = !current.wajib;
      const updated: MatrixRowState = {
        ...current,
        wajib: newWajib,
        // If enabling for the first time with empty checklist, offer smart default
        pemenuhan_checklist:
          newWajib && current.pemenuhan_checklist.length === 0 && pemenuhanOptions.length > 0
            ? [pemenuhanOptions[0]?.label || 'Training & Sertifikasi']
            : current.pemenuhan_checklist,
        tindakan_gap:
          newWajib && current.tindakan_gap.length === 0 && tindakanGapOptions.length > 0
            ? [tindakanGapOptions[0]?.label || 'Training Penuh']
            : current.tindakan_gap,
      };

      return { ...prev, [compId]: updated };
    });
    setHasUnsavedChanges(true);
  };

  // Change required level
  const handleLevelChange = (compId: string, levelId: string) => {
    setDraftRows((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        required_level_id: levelId,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Toggle individual pemenuhan checklist item
  const handleTogglePemenuhan = (compId: string, optionLabel: string) => {
    setDraftRows((prev) => {
      const current = prev[compId] || {
        competency_id: compId,
        wajib: true,
        required_level_id: levels[0]?.id || '',
        pemenuhan_checklist: [],
        tindakan_gap: [],
      };

      const exists = current.pemenuhan_checklist.includes(optionLabel);
      const updatedList = exists
        ? current.pemenuhan_checklist.filter((i) => i !== optionLabel)
        : [...current.pemenuhan_checklist, optionLabel];

      return {
        ...prev,
        [compId]: {
          ...current,
          pemenuhan_checklist: updatedList,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle individual tindakan gap checklist item
  const handleToggleTindakanGap = (compId: string, optionLabel: string) => {
    setDraftRows((prev) => {
      const current = prev[compId] || {
        competency_id: compId,
        wajib: true,
        required_level_id: levels[0]?.id || '',
        pemenuhan_checklist: [],
        tindakan_gap: [],
      };

      const exists = current.tindakan_gap.includes(optionLabel);
      const updatedList = exists
        ? current.tindakan_gap.filter((i) => i !== optionLabel)
        : [...current.tindakan_gap, optionLabel];

      return {
        ...prev,
        [compId]: {
          ...current,
          tindakan_gap: updatedList,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Bulk actions for competency cards
  const handleCheckAllPemenuhan = (compId: string) => {
    const allLabels = pemenuhanOptions.map((o) => o.label);
    setDraftRows((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        pemenuhan_checklist: allLabels,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleClearAllPemenuhan = (compId: string) => {
    setDraftRows((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        pemenuhan_checklist: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleCheckAllTindakanGap = (compId: string) => {
    const allLabels = tindakanGapOptions.map((o) => o.label);
    setDraftRows((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        tindakan_gap: allLabels,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleClearAllTindakanGap = (compId: string) => {
    setDraftRows((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        tindakan_gap: [],
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Bulk toggle for whole position
  const handleCheckAllFilteredWajib = () => {
    setDraftRows((prev) => {
      const updated = { ...prev };
      filteredCompetencies.forEach((c) => {
        const cur = updated[c.id] || {
          competency_id: c.id,
          wajib: false,
          required_level_id: levels[0]?.id || '',
          pemenuhan_checklist: [],
          tindakan_gap: [],
        };
        updated[c.id] = {
          ...cur,
          wajib: true,
          pemenuhan_checklist:
            cur.pemenuhan_checklist.length > 0
              ? cur.pemenuhan_checklist
              : [pemenuhanOptions[0]?.label || 'Training & Sertifikasi'],
          tindakan_gap:
            cur.tindakan_gap.length > 0
              ? cur.tindakan_gap
              : [tindakanGapOptions[0]?.label || 'Training Penuh'],
        };
      });
      return updated;
    });
    setHasUnsavedChanges(true);
    toast.info('Centang Semua Wajib Diaktifkan', 'Seluruh kompetensi pada filter telah ditandai Wajib.');
  };

  const handleUncheckAllWajib = () => {
    setDraftRows((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          wajib: false,
          pemenuhan_checklist: [],
          tindakan_gap: [],
        };
      });
      return updated;
    });
    setHasUnsavedChanges(true);
    toast.info('Checklist Wajib Dikosongkan', 'Semua checklist wajib telah dihilangkan. Klik "Simpan Matriks" untuk menerapkan.');
  };

  // DELETE SINGLE COMPETENCY FROM MATRIX
  const handleDeleteCompetencyFromMatrix = (compId: string) => {
    const comp = competencies.find((c) => c.id === compId);
    const pos = positions.find((p) => p.id === selectedPositionId);

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kompetensi dari Matriks',
      message: `Hapus kompetensi "${comp?.nama || compId}" dari matriks jabatan "${pos?.nama_jabatan}"? Kompetensi ini tidak lagi dipersyaratkan untuk jabatan ini.`,
      variant: 'danger',
      confirmLabel: 'Hapus dari Matriks',
      onConfirm: () => {
        // Direct remove in store
        store.deleteMatrixRequirement(selectedPositionId, compId);

        // Update local draft
        setDraftRows((prev) => ({
          ...prev,
          [compId]: {
            competency_id: compId,
            wajib: false,
            required_level_id: levels[0]?.id || '',
            pemenuhan_checklist: [],
            tindakan_gap: [],
          },
        }));

        setHasUnsavedChanges(false);
        setReloadTick((t) => t + 1);
        toast.success(
          'Kompetensi Dihapus dari Matriks',
          `"${comp?.nama}" telah dihapus dari standar matriks "${pos?.nama_jabatan}".`
        );
      },
    });
  };

  // DELETE ENTIRE POSITION MATRIX
  const handleDeleteEntirePositionMatrix = () => {
    const pos = positions.find((p) => p.id === selectedPositionId);

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus / Kosongkan Seluruh Matriks Jabatan',
      message: `Peringatan: Seluruh konfigurasi matriks kompetensi untuk jabatan "${pos?.nama_jabatan}" akan dihapus permanen dari database. Lanjutkan?`,
      variant: 'danger',
      confirmLabel: 'Hapus Seluruh Matriks',
      onConfirm: () => {
        store.deletePositionMatrix(selectedPositionId);

        // Reset local draft state
        const resetMap: Record<string, MatrixRowState> = {};
        competencies.forEach((c) => {
          resetMap[c.id] = {
            competency_id: c.id,
            wajib: false,
            required_level_id: levels[0]?.id || '',
            pemenuhan_checklist: [],
            tindakan_gap: [],
          };
        });
        setDraftRows(resetMap);
        setHasUnsavedChanges(false);
        setReloadTick((t) => t + 1);

        toast.success(
          'Matriks Jabatan Dikosongkan',
          `Seluruh matriks untuk jabatan "${pos?.nama_jabatan}" berhasil dihapus.`
        );
      },
    });
  };

  // Save the matrix permanently
  const handleSaveMatrix = () => {
    if (!selectedPositionId) {
      toast.error('Pilih jabatan terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    try {
      // Gather only competencies that are marked as wajib
      const payload = Object.values(draftRows)
        .filter((row) => row.wajib)
        .map((row) => ({
          competency_id: row.competency_id,
          required_level_id: row.required_level_id,
          wajib: true,
          pemenuhan_checklist: row.pemenuhan_checklist,
          tindakan_gap: row.tindakan_gap,
        }));

      store.savePositionMatrix(selectedPositionId, payload);
      setHasUnsavedChanges(false);
      setReloadTick((t) => t + 1);

      const posName = positions.find((p) => p.id === selectedPositionId)?.nama_jabatan;
      toast.success(
        'Matriks Berhasil Disimpan!',
        `Konfigurasi untuk jabatan "${posName}" (${payload.length} kompetensi wajib) tersimpan permanen di database.`
      );
    } catch (e: any) {
      toast.error('Gagal Menyimpan Matriks', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter competencies
  const filteredCompetencies = competencies.filter((c) => {
    const matchesSearch =
      c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryId === 'all' || c.kategori_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);
  const activeWajibCount = Object.values(draftRows).filter((r) => r.wajib).length;

  // Export Matrix to Excel Siap Cetak
  const handleExportMatrixExcel = () => {
    const allMatrix = store.getMatrix();
    const rows = allMatrix.map((m) => {
      const pos = positions.find((p) => p.id === m.position_id)?.nama_jabatan || m.position_id;
      const comp = competencies.find((c) => c.id === m.competency_id)?.nama || m.competency_id;
      const lvl = levels.find((l) => l.id === m.required_level_id)?.nama_level || m.required_level_id;
      return [
        pos,
        comp,
        m.wajib ? 'Wajib' : 'Opsional',
        lvl,
        m.pemenuhan_checklist.join('; ') || '-',
        m.tindakan_gap.join('; ') || '-',
      ];
    });

    exportToExcelTable({
      filename: `Matriks_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      title: 'MATRIKS KOMPETENSI JABATAN ENTERPRISE',
      subtitle: 'Standar Persyaratan Kompetensi, Level Minimum, dan Bukti Pemenuhan Tiap Jabatan',
      headers: ['Nama Jabatan', 'Kompetensi', 'Status', 'Level Minimum', 'Metode Bukti Pemenuhan', 'Rekomendasi Tindakan Gap'],
      rows,
      summaryCards: [
        { label: 'Total Jabatan', value: positions.length },
        { label: 'Total Kompetensi', value: competencies.length },
        { label: 'Pemetaan Matriks', value: allMatrix.length },
      ],
    });
    toast.success('Excel Siap Cetak Berhasil Diunduh', 'Tabel matriks kompetensi telah diformat rapi.');
  };

  // Export Matrix to PDF
  const handleExportMatrixPdf = () => {
    const allMatrix = store.getMatrix();
    const rows = allMatrix.map((m) => {
      const pos = positions.find((p) => p.id === m.position_id)?.nama_jabatan || m.position_id;
      const comp = competencies.find((c) => c.id === m.competency_id)?.nama || m.competency_id;
      const lvl = levels.find((l) => l.id === m.required_level_id)?.nama_level || m.required_level_id;
      return [
        pos,
        comp,
        m.wajib ? 'Wajib' : 'Opsional',
        lvl,
        m.pemenuhan_checklist.join(', ') || '-',
        m.tindakan_gap.join(', ') || '-',
      ];
    });

    exportToPdfTable({
      filename: `Matriks_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      title: 'MATRIKS KOMPETENSI JABATAN',
      subtitle: 'Standar Kualifikasi & Bukti Pemenuhan Jabatan',
      headers: ['Jabatan', 'Kompetensi', 'Status', 'Level', 'Metode Bukti', 'Tindakan Gap'],
      rows,
      orientation: 'landscape',
    });
    toast.success('PDF Berhasil Diunduh', 'Dokumen PDF matriks kompetensi selesai dibuat.');
  };

  // Export Matrix Overview to CSV
  const handleExportMatrixCsv = () => {
    const allMatrix = store.getMatrix();
    const rows = allMatrix.map((m) => {
      const pos = positions.find((p) => p.id === m.position_id)?.nama_jabatan || m.position_id;
      const comp = competencies.find((c) => c.id === m.competency_id)?.nama || m.competency_id;
      const lvl = levels.find((l) => l.id === m.required_level_id)?.nama_level || m.required_level_id;
      return [
        pos,
        comp,
        m.wajib ? 'Wajib' : 'Opsional',
        lvl,
        m.pemenuhan_checklist.join('; '),
        m.tindakan_gap.join('; '),
      ];
    });

    exportToCsv(
      `Matriks_Kompetensi_${new Date().toISOString().slice(0, 10)}`,
      rows,
      ['Jabatan', 'Kompetensi', 'Status', 'Level', 'Metode Bukti', 'Tindakan Gap']
    );
    toast.success('CSV Berhasil Diunduh');
  };

  // Delete directly from cross matrix grid
  const handleDeleteFromOverviewGrid = (posId: string, compId: string) => {
    const pos = positions.find((p) => p.id === posId);
    const comp = competencies.find((c) => c.id === compId);

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Matriks Silang',
      message: `Hapus keterkaitan kompetensi "${comp?.nama}" untuk jabatan "${pos?.nama_jabatan}"?`,
      variant: 'danger',
      confirmLabel: 'Hapus Matriks',
      onConfirm: () => {
        store.deleteMatrixRequirement(posId, compId);
        setReloadTick((t) => t + 1);
        toast.success('Matriks Dihapus', `Keterkaitan "${comp?.nama}" pada "${pos?.nama_jabatan}" dihapus.`);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Konfigurasi Matriks Kompetensi Jabatan
            </h1>
            <p className="text-xs text-slate-500">
              PRD Section 4: Menentukan kompetensi wajib per jabatan, skala level minimum, checklist bukti, dan tindakan kesenjangan.
            </p>
          </div>
        </div>

        {/* Tab switch & export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konfigurasi Checklist
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Matriks Silang
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="emerald"
              size="sm"
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={handleExportMatrixExcel}
              title="Unduh format Excel dengan tabel rapi siap cetak"
            >
              Excel (Siap Cetak)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5 text-rose-600" />}
              onClick={handleExportMatrixPdf}
              title="Unduh PDF resmi"
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-slate-600" />}
              onClick={handleExportMatrixCsv}
            >
              CSV
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'config' ? (
        <>
          {/* Position Selector & Save Floating/Sticky Bar */}
          <div className="sticky top-18 z-20 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
                Pilih Jabatan:
              </label>
              <div className="relative min-w-[240px]">
                <select
                  value={selectedPositionId}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  className="w-full bg-slate-800 text-white font-semibold text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nama_jabatan} ({pos.kode || 'POS'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPosition && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="teal" size="sm">
                    {activeWajibCount} Kompetensi Wajib
                  </Badge>
                  {hasUnsavedChanges ? (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Perubahan belum disimpan
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tersimpan di database
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions for Selected Position Matrix */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Delete / Clear Entire Matrix for this position */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteEntirePositionMatrix}
                className="bg-rose-950/40 border-rose-800/80 text-rose-300 hover:bg-rose-900/60 hover:text-white text-xs"
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                title="Hapus seluruh konfigurasi matriks untuk jabatan ini dari database"
              >
                Hapus Matriks Jabatan Ini
              </Button>

              {onNavigateToOrg && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToOrg}
                  className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
                  icon={<PlusCircle className="w-3.5 h-3.5 text-teal-400" />}
                >
                  + Tambah Jabatan Baru
                </Button>
              )}

              {/* Save Button */}
              <Button
                variant="emerald"
                size="md"
                loading={isSaving}
                onClick={handleSaveMatrix}
                icon={<Save className="w-4 h-4" />}
                className="font-bold shadow-lg"
              >
                Simpan Matriks
              </Button>
            </div>
          </div>

          {/* Quick Bulk Checklist Bar & Filter & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari kompetensi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Semua Kategori ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5 text-teal-600" />}
                onClick={handleOpenAddComp}
                className="text-xs font-semibold hover:border-teal-400"
              >
                + Tambah Kompetensi Baru
              </Button>
            </div>

            {/* Quick Bulk Checklist Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={handleCheckAllFilteredWajib}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer"
                title="Tandai seluruh kompetensi yang tampil sebagai Wajib"
              >
                <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                Centang Semua Wajib
              </button>

              <button
                type="button"
                onClick={handleUncheckAllWajib}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                title="Hilangkan semua centang checklist wajib untuk jabatan ini"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Hilangkan Semua Checklist
              </button>
            </div>
          </div>

          {/* Matrix Checklist List */}
          <div className="space-y-4">
            {filteredCompetencies.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-sm">Tidak ada kompetensi yang sesuai.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Tambahkan kompetensi baru di menu Master Kompetensi.
                </p>
              </div>
            ) : (
              filteredCompetencies.map((comp) => {
                const row = draftRows[comp.id] || {
                  competency_id: comp.id,
                  wajib: false,
                  required_level_id: levels[0]?.id || '',
                  pemenuhan_checklist: [],
                  tindakan_gap: [],
                };

                const categoryName =
                  categories.find((c) => c.id === comp.kategori_id)?.nama || 'Umum';

                return (
                  <div
                    key={comp.id}
                    className={`rounded-2xl border transition-all ${
                      row.wajib
                        ? 'bg-white border-teal-400 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Main Row Header */}
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <label className="relative flex items-center pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.wajib}
                            onChange={() => handleToggleWajib(comp.id)}
                            className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                          />
                        </label>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-bold cursor-pointer hover:underline ${
                                row.wajib ? 'text-slate-900' : 'text-slate-600'
                              }`}
                              onClick={() => handleToggleWajib(comp.id)}
                            >
                              {comp.nama}
                            </h3>
                            <Badge variant="slate" size="sm">
                              {categoryName}
                            </Badge>
                            {row.wajib ? (
                              <Badge variant="teal" size="sm">
                                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                Wajib
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">
                                Tidak Diwajibkan
                              </span>
                            )}

                            {/* Tombol Aksi Edit & Hapus Permanen Kompetensi */}
                            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditComp(comp)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition-colors cursor-pointer"
                                title={`Edit master data "${comp.nama}"`}
                              >
                                <Edit2 className="w-3 h-3 text-teal-600" />
                                Edit Data
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePermanentDeleteComp(comp)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                title={`Hapus permanen "${comp.nama}" dari seluruh database sistem`}
                              >
                                <Trash2 className="w-3 h-3" />
                                Hapus Permanen
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                            {comp.deskripsi}
                          </p>
                          {comp.indikator_perilaku && (
                            <p className="text-[11px] text-teal-800/80 bg-teal-50/60 p-2 rounded-lg mt-2 border border-teal-100">
                              <span className="font-semibold">Indikator Perilaku:</span>{' '}
                              {comp.indikator_perilaku}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Required Level Dropdown & Delete From Matrix Action */}
                      <div className="flex items-center gap-3 lg:shrink-0 pl-9 lg:pl-0">
                        <div className="text-right">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Required Level:
                          </label>
                          <select
                            disabled={!row.wajib}
                            value={row.required_level_id}
                            onChange={(e) => handleLevelChange(comp.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer ${
                              row.wajib
                                ? 'bg-white border-teal-300 text-teal-900'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {levels.map((lvl) => (
                              <option key={lvl.id} value={lvl.id}>
                                {lvl.nama_level} (Skala {lvl.urutan})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Button Hapus dari Matriks */}
                        {row.wajib && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCompetencyFromMatrix(comp.id)}
                            className="mt-4 p-2 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer"
                            title="Hapus kompetensi ini dari matriks jabatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sub-Checklists: Pemenuhan & Tindakan Gap (Only active when wajib = true) */}
                    {row.wajib && (
                      <div className="p-5 bg-teal-50/30 grid grid-cols-1 md:grid-cols-2 gap-5 rounded-b-2xl border-t border-teal-100/60">
                        {/* 1. Metode Pemenuhan Checklist */}
                        <div>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                              Bukti Pemenuhan ({row.pemenuhan_checklist.length} dipilih):
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCheckAllPemenuhan(comp.id)}
                                className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                              >
                                Centang Semua
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleClearAllPemenuhan(comp.id)}
                                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                              >
                                Kosongkan
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleOpenAddOption('pemenuhan')}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-teal-200"
                              >
                                <Plus className="w-3 h-3" /> Tambah Opsi
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {pemenuhanOptions.map((opt) => {
                              const checked = row.pemenuhan_checklist.includes(opt.label);
                              return (
                                <div
                                  key={opt.id}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    checked
                                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleTogglePemenuhan(comp.id, opt.label)}
                                      className="w-3.5 h-3.5 rounded text-teal-600 cursor-pointer"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteOption(opt);
                                    }}
                                    className={`p-0.5 rounded hover:bg-black/10 cursor-pointer ${
                                      checked ? 'text-teal-200 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                                    }`}
                                    title="Hapus opsi checklist ini"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Tindakan Gap Checklist */}
                        <div>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                              Tindakan Bila Gap ({row.tindakan_gap.length} dipilih):
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCheckAllTindakanGap(comp.id)}
                                className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                              >
                                Centang Semua
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleClearAllTindakanGap(comp.id)}
                                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                              >
                                Kosongkan
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleOpenAddOption('tindakan_gap')}
                                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-indigo-200"
                              >
                                <Plus className="w-3 h-3" /> Tambah Opsi
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {tindakanGapOptions.map((opt) => {
                              const checked = row.tindakan_gap.includes(opt.label);
                              return (
                                <div
                                  key={opt.id}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    checked
                                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleToggleTindakanGap(comp.id, opt.label)}
                                      className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteOption(opt);
                                    }}
                                    className={`p-0.5 rounded hover:bg-black/10 cursor-pointer ${
                                      checked ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                                    }`}
                                    title="Hapus opsi tindakan ini"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Overview Cross-Tabular Matrix Grid */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Peta Matriks Silang (Jabatan × Kompetensi)
              </h2>
              <p className="text-xs text-slate-500">
                Pemetaan menyeluruh seluruh jabatan dan level kompetensi. Anda dapat menghapus keterkaitan kompetensi langsung dari tabel ini.
              </p>
            </div>
            <Badge variant="teal">{positions.length} Jabatan</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3 sticky left-0 bg-slate-100 z-10 min-w-[200px] border-r border-slate-200">
                    Jabatan / Posisi
                  </th>
                  {competencies.map((comp) => (
                    <th key={comp.id} className="p-3 min-w-[200px] border-r border-slate-200 font-semibold group">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="font-bold text-slate-900 leading-tight">{comp.nama}</div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditComp(comp)}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-teal-700 rounded transition-colors cursor-pointer"
                            title={`Edit data master "${comp.nama}"`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDeleteComp(comp)}
                            className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title={`Hapus permanen "${comp.nama}" dari database`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {categories.find((c) => c.id === comp.kategori_id)?.nama}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {positions.map((pos) => {
                  const posReqs = store.getMatrix(pos.id);
                  return (
                    <tr key={pos.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-xs">
                        {pos.nama_jabatan}
                        <div className="text-[10px] text-slate-500 font-normal">{pos.kode}</div>
                      </td>

                      {competencies.map((comp) => {
                        const req = posReqs.find((r) => r.competency_id === comp.id);
                        if (!req || !req.wajib) {
                          return (
                            <td key={comp.id} className="p-3 border-r border-slate-100 text-center text-slate-300">
                              -
                            </td>
                          );
                        }

                        const lvl = levels.find((l) => l.id === req.required_level_id);
                        return (
                          <td key={comp.id} className="p-3 border-r border-slate-100 group relative">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <Badge variant="teal" size="sm">
                                  {lvl ? lvl.nama_level : 'Level ?'}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFromOverviewGrid(pos.id, comp.id)}
                                  className="text-slate-300 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Hapus kompetensi ini dari jabatan ini"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate" title={req.pemenuhan_checklist.join(', ')}>
                                {req.pemenuhan_checklist.join(', ') || '-'}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah Opsi Checklist Cepat */}
      <Modal
        isOpen={optModalOpen}
        onClose={() => setOptModalOpen(false)}
        title={optCategory === 'pemenuhan' ? 'Tambah Opsi Bukti Pemenuhan' : 'Tambah Opsi Tindakan Bila Gap'}
        subtitle="Opsi ini langsung tersimpan dan dapat dicentang pada seluruh jabatan dan matriks kompetensi."
      >
        <form onSubmit={handleSaveOption} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Opsi Checklist Baru *
            </label>
            <input
              type="text"
              required
              placeholder={
                optCategory === 'pemenuhan'
                  ? 'Contoh: Sertifikasi Asosiasi Profesi'
                  : 'Contoh: Pendampingan Mentor 1-on-1'
              }
              value={optLabel}
              onChange={(e) => setOptLabel(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setOptModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Opsi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Tambah / Edit Master Data Kompetensi */}
      <Modal
        isOpen={compModalOpen}
        onClose={() => setCompModalOpen(false)}
        title={editingComp ? `Edit Data Kompetensi: ${editingComp.nama}` : 'Tambah Kompetensi Baru'}
        subtitle="Data yang disimpan akan terbarui secara permanen di database master dan seluruh matriks jabatan."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveComp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Kompetensi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Risk Assessment & Hazard Identification"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Kompetensi *
            </label>
            <select
              required
              value={compCatId}
              onChange={(e) => setCompCatId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-slate-900"
            >
              <option value="" disabled>-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Singkat Kompetensi *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan ruang lingkup pengetahuan, keahlian, dan standar kompetensi ini..."
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Indikator Perilaku / Output Lapangan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Mampu mengisi formulir JSA dan IBPR secara mandiri tanpa kesalahan..."
              value={compBehavior}
              onChange={(e) => setCompBehavior(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCompModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingComp ? 'Simpan Perubahan Data' : 'Tambah Kompetensi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
