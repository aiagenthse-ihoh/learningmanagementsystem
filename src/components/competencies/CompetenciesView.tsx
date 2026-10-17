import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { Competency, CompetencyLevel, CompetencyCategory } from '../../types/lcms';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sliders,
  FolderTree,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const CompetenciesView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'competencies' | 'levels' | 'categories'>('competencies');

  // Master lists
  const competencies = store.getCompetencies(true);
  const levels = store.getLevels(true);
  const categories = store.getCategories(true);

  // --- Modal States for Competency ---
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competency | null>(null);
  const [compName, setCompName] = useState('');
  const [compCatId, setCompCatId] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compBehavior, setCompBehavior] = useState('');

  // --- Modal States for Level ---
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CompetencyLevel | null>(null);
  const [levelName, setLevelName] = useState('');
  const [levelUrutan, setLevelUrutan] = useState<number>(1);
  const [levelDesc, setLevelDesc] = useState('');

  // --- Modal States for Category ---
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CompetencyCategory | null>(null);
  const [catName, setCatName] = useState('');

  // --- Confirm Dialog State ---
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

  // Open Add Competency
  const handleOpenAddComp = () => {
    setEditingComp(null);
    setCompName('');
    setCompCatId(categories[0]?.id || '');
    setCompDesc('');
    setCompBehavior('');
    setCompModalOpen(true);
  };

  // Open Edit Competency
  const handleOpenEditComp = (comp: Competency) => {
    setEditingComp(comp);
    setCompName(comp.nama);
    setCompCatId(comp.kategori_id);
    setCompDesc(comp.deskripsi);
    setCompBehavior(comp.indikator_perilaku || '');
    setCompModalOpen(true);
  };

  // Save Competency
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
        toast.success('Kompetensi Diperbarui', `Perubahan pada "${compName}" berhasil disimpan.`);
      } else {
        store.addCompetency(compName.trim(), compCatId, compDesc.trim(), compBehavior.trim());
        toast.success('Kompetensi Dibuat', `Kompetensi "${compName}" berhasil ditambahkan.`);
      }
      setCompModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message);
    }
  };

  // Toggle Competency Status
  const handleToggleComp = (comp: Competency) => {
    store.toggleCompetencyStatus(comp.id);
    toast.info(
      'Status Diubah',
      `Kompetensi "${comp.nama}" kini berstatus ${comp.status === 'active' ? 'Nonaktif' : 'Aktif'}.`
    );
  };

  // Open Add Level
  const handleOpenAddLevel = () => {
    setEditingLevel(null);
    setLevelName(`Level ${levels.length + 1} - `);
    setLevelUrutan(levels.length + 1);
    setLevelDesc('');
    setLevelModalOpen(true);
  };

  // Open Edit Level
  const handleOpenEditLevel = (lvl: CompetencyLevel) => {
    setEditingLevel(lvl);
    setLevelName(lvl.nama_level);
    setLevelUrutan(lvl.urutan);
    setLevelDesc(lvl.deskripsi);
    setLevelModalOpen(true);
  };

  // Save Level
  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelName.trim()) {
      toast.error('Nama level wajib diisi');
      return;
    }

    try {
      if (editingLevel) {
        store.updateLevel(editingLevel.id, {
          nama_level: levelName.trim(),
          urutan: Number(levelUrutan),
          deskripsi: levelDesc.trim(),
        });
        toast.success('Level Diperbarui', `Perubahan skala level "${levelName}" berhasil disimpan.`);
      } else {
        store.addLevel(levelName.trim(), levelDesc.trim(), Number(levelUrutan));
        toast.success('Level Baru Dibuat', `Level skala "${levelName}" berhasil ditambahkan.`);
      }
      setLevelModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Level', err.message);
    }
  };

  // Move Level Up/Down
  const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= levels.length) return;

    const copy = [...levels];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    const orderedIds = copy.map((l) => l.id);
    store.reorderLevels(orderedIds);
    toast.success('Urutan Diperbarui', 'Urutan skala level berhasil diubah.');
  };

  // Delete Level
  const handleDeleteLevel = (lvl: CompetencyLevel) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Level Skala',
      message: `Apakah Anda yakin ingin menghapus level "${lvl.nama_level}"? Pastikan level ini tidak sedang dipakai di matriks.`,
      onConfirm: () => {
        try {
          store.deleteLevel(lvl.id);
          toast.success('Level Dihapus', `Level "${lvl.nama_level}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Tidak Dapat Menghapus', err.message);
        }
      },
    });
  };

  // Delete Competency
  const handleDeleteComp = (comp: Competency) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kompetensi',
      message: `Apakah Anda yakin ingin menghapus kompetensi "${comp.nama}"? Relasi persyaratan pada matriks jabatan akan dibersihkan.`,
      onConfirm: () => {
        try {
          store.deleteCompetency(comp.id);
          toast.success('Kompetensi Dihapus', `Kompetensi "${comp.nama}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Delete Category
  const handleDeleteCategory = (cat: CompetencyCategory) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori Kompetensi',
      message: `Apakah Anda yakin ingin menghapus kategori "${cat.nama}"?`,
      onConfirm: () => {
        try {
          store.deleteCategory(cat.id);
          toast.success('Kategori Dihapus', `Kategori "${cat.nama}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }
    if (editingCat) {
      store.updateCategory(editingCat.id, catName.trim());
      toast.success('Kategori Diperbarui');
    } else {
      store.addCategory(catName.trim());
      toast.success('Kategori Dibuat');
    }
    setCatModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Master Kompetensi & Skala Level</h1>
            <p className="text-xs text-slate-500">
              PRD 6.1 & 6.3: Kelola daftar kompetensi, definisi indikator perilaku, dan kustomisasi skala level tanpa batas baku.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('competencies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'competencies' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Kompetensi ({competencies.length})
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'levels' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skala Level ({levels.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'categories' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kategori ({categories.length})
          </button>
        </div>
      </div>

      {/* --- TAB 1: COMPETENCIES --- */}
      {activeTab === 'competencies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Kompetensi aktif dapat langsung dipetakan ke jabatan di Matriks Kompetensi.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddComp}
            >
              Tambah Kompetensi
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Nama Kompetensi</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Deskripsi & Indikator</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {competencies.map((comp) => {
                    const cat = categories.find((c) => c.id === comp.kategori_id);
                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900 text-sm max-w-xs">
                          {comp.nama}
                        </td>
                        <td className="p-4">
                          <Badge variant="teal">{cat ? cat.nama : 'Umum'}</Badge>
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="text-slate-600 leading-relaxed">{comp.deskripsi}</p>
                          {comp.indikator_perilaku && (
                            <div className="mt-1 text-[11px] text-teal-800 bg-teal-50 p-1.5 rounded-md border border-teal-100">
                              <span className="font-semibold">Indikator:</span> {comp.indikator_perilaku}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleComp(comp)}
                            className="cursor-pointer"
                            title="Klik untuk ubah status"
                          >
                            <Badge variant={comp.status === 'active' ? 'emerald' : 'slate'} size="sm">
                              {comp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                              onClick={() => handleOpenEditComp(comp)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={() => handleDeleteComp(comp)}
                              title="Hapus Kompetensi"
                            />
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

      {/* --- TAB 2: COMPETENCY LEVELS (PRD 6.3) --- */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 leading-relaxed">
              <span className="font-bold">Ketentuan PRD 6.3:</span> Skala level kompetensi tidak baku/terkunci.
              Admin bebas mengubah nama level, menambah jumlah tingkat level (misal Level 1-6 atau nama custom
              seperti Novice/Expert), mengubah urutan skala, serta memperbarui definisinya secara dinamis.
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Urutan level menentukan perbandingan actual level vs required level pada Gap Analysis.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddLevel}
            >
              Tambah Tingkat Level Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {levels.map((lvl, index) => (
              <div
                key={lvl.id}
                className={`bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  lvl.status === 'active' ? 'border-slate-200 shadow-xs' : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                {/* Level info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {lvl.urutan}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{lvl.nama_level}</h3>
                      <Badge variant={lvl.status === 'active' ? 'emerald' : 'slate'} size="sm">
                        {lvl.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lvl.deskripsi}</p>
                  </div>
                </div>

                {/* Level actions & Reorder buttons */}
                <div className="flex items-center gap-2 sm:shrink-0 justify-end">
                  {/* Move Up/Down */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveLevel(index, 'up')}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Geser Naik"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === levels.length - 1}
                      onClick={() => handleMoveLevel(index, 'down')}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Geser Turun"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => handleOpenEditLevel(lvl)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      store.toggleLevelStatus(lvl.id);
                      toast.info('Status Level Diubah');
                    }}
                  >
                    {lvl.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-800"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDeleteLevel(lvl)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Kategori mengelompokkan kompetensi untuk kemudahan pencarian dan filter matriks.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingCat(null);
                setCatName('');
                setCatModalOpen(true);
              }}
            >
              Tambah Kategori
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.nama}</h4>
                  <Badge variant={cat.status === 'active' ? 'emerald' : 'slate'} size="sm" className="mt-1">
                    {cat.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                    onClick={() => {
                      setEditingCat(cat);
                      setCatName(cat.nama);
                      setCatModalOpen(true);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      store.toggleCategoryStatus(cat.id);
                      toast.info('Status Kategori Diubah');
                    }}
                  >
                    {cat.status === 'active' ? 'Nonaktif' : 'Aktif'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDeleteCategory(cat)}
                    title="Hapus Kategori"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT COMPETENCY */}
      <Modal
        isOpen={compModalOpen}
        onClose={() => setCompModalOpen(false)}
        title={editingComp ? 'Edit Master Kompetensi' : 'Tambah Kompetensi Baru'}
        subtitle="Informasi kompetensi jabatan yang akan dimuat ke dalam matriks"
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
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Kompetensi *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan ruang lingkup keahlian dan pengetahuan yang dicakup..."
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Indikator Perilaku / Output Kerja (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Mampu menyusun dokumen JSA, mengidentifikasi 5 potensi bahaya mekanis..."
              value={compBehavior}
              onChange={(e) => setCompBehavior(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCompModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Kompetensi
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD/EDIT LEVEL */}
      <Modal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        title={editingLevel ? 'Edit Skala Level Kompetensi' : 'Tambah Skala Level Baru'}
        subtitle="Kustomisasi nama, bobot urutan, dan definisi level tanpa batasan baku"
      >
        <form onSubmit={handleSaveLevel} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Level *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Level 3 - Competent"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urutan Skala *
              </label>
              <input
                type="number"
                min={1}
                max={99}
                required
                value={levelUrutan}
                onChange={(e) => setLevelUrutan(parseInt(e.target.value, 10))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Definisi & Kriteria Level *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Deskripsikan kemampuan konkret yang diharapkan pada level ini (misal: bekerja mandiri, memecahkan kendala, dll)..."
              value={levelDesc}
              onChange={(e) => setLevelDesc(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setLevelModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Skala Level
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD/EDIT CATEGORY */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Edit Kategori' : 'Tambah Kategori Kompetensi'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Kategori *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Digital Literacy & Data"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCatModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
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
