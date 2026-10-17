import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { Department, Position, Employee } from '../../types/lcms';
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Mail,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const OrganizationView: React.FC<{ onNavigateToMatrix?: () => void }> = ({ onNavigateToMatrix }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'positions' | 'departments' | 'employees'>('positions');

  const positions = store.getPositions(true);
  const departments = store.getDepartments(true);
  const employees = store.getEmployees(true);
  const canManageOrg = store.hasPermission('can_manage_org');

  // Position Modal State
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [posName, setPosName] = useState('');
  const [posCode, setPosCode] = useState('');
  const [posDeptId, setPosDeptId] = useState('');
  const [posDesc, setPosDesc] = useState('');

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Employee Modal State
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDeptId, setEmpDeptId] = useState('');
  const [empPosId, setEmpPosId] = useState('');
  const [empManagerId, setEmpManagerId] = useState('');

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

  // Handle Position
  const handleOpenAddPos = () => {
    setEditingPos(null);
    setPosName('');
    setPosCode('');
    setPosDeptId(departments[0]?.id || '');
    setPosDesc('');
    setPosModalOpen(true);
  };

  const handleOpenEditPos = (pos: Position) => {
    setEditingPos(pos);
    setPosName(pos.nama_jabatan);
    setPosCode(pos.kode || '');
    setPosDeptId(pos.department_id || '');
    setPosDesc(pos.deskripsi || '');
    setPosModalOpen(true);
  };

  const handleSavePos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posName.trim()) {
      toast.error('Nama jabatan wajib diisi');
      return;
    }

    try {
      if (editingPos) {
        store.updatePosition(editingPos.id, {
          nama_jabatan: posName.trim(),
          kode: posCode.trim() || undefined,
          department_id: posDeptId || undefined,
          deskripsi: posDesc.trim() || undefined,
        });
        toast.success('Jabatan Diperbarui', `Jabatan "${posName}" berhasil diperbarui.`);
      } else {
        const created = store.addPosition(
          posName.trim(),
          posCode.trim() || undefined,
          posDeptId || undefined,
          posDesc.trim() || undefined
        );
        toast.success(
          'Jabatan Baru Berhasil Dibuat!',
          `Jabatan "${created.nama_jabatan}" tersimpan permanen dan kini siap dikonfigurasi di Matriks Kompetensi.`
        );
      }
      setPosModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message);
    }
  };

  const handleDeletePosition = (pos: Position) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Jabatan / Posisi',
      message: `Apakah Anda yakin ingin menghapus jabatan "${pos.nama_jabatan}"? Konfigurasi matriks terkait jabatan ini akan dibersihkan.`,
      onConfirm: () => {
        try {
          store.deletePosition(pos.id);
          toast.success('Jabatan Dihapus', `Jabatan "${pos.nama_jabatan}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Handle Department
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.nama);
    setDeptCode(dept.kode || '');
    setDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast.error('Nama departemen wajib diisi');
      return;
    }
    if (editingDept) {
      store.updateDepartment(editingDept.id, {
        nama: deptName.trim(),
        kode: deptCode.trim() || undefined,
      });
      toast.success('Departemen Diperbarui', `Departemen "${deptName}" berhasil diperbarui.`);
    } else {
      store.addDepartment(deptName.trim(), deptCode.trim() || undefined);
      toast.success('Departemen Dibuat', `Departemen "${deptName}" berhasil ditambahkan.`);
    }
    setDeptModalOpen(false);
  };

  const handleDeleteDepartment = (dept: Department) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Departemen / Divisi',
      message: `Apakah Anda yakin ingin menghapus departemen "${dept.nama}"? Relasi karyawan pada departemen ini akan dilepas.`,
      onConfirm: () => {
        try {
          store.deleteDepartment(dept.id);
          toast.success('Departemen Dihapus', `Departemen "${dept.nama}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  // Handle Employee
  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empCode.trim()) {
      toast.error('Nama dan NIK/ID Karyawan wajib diisi');
      return;
    }

    if (editingEmp) {
      store.updateEmployee(editingEmp.id, {
        nama: empName.trim(),
        employee_code: empCode.trim(),
        email: empEmail.trim(),
        department_id: empDeptId,
        position_id: empPosId,
        manager_id: empManagerId || undefined,
      });
      toast.success('Data Karyawan Diperbarui');
    } else {
      store.addEmployee({
        nama: empName.trim(),
        employee_code: empCode.trim(),
        email: empEmail.trim(),
        department_id: empDeptId || departments[0]?.id || '',
        position_id: empPosId || positions[0]?.id || '',
        manager_id: empManagerId || undefined,
        status: 'active',
        hire_date: new Date().toISOString().slice(0, 10),
      });
      toast.success('Karyawan Baru Ditambahkan');
    }
    setEmpModalOpen(false);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Karyawan / Peserta',
      message: `Apakah Anda yakin ingin menghapus karyawan "${emp.nama}" (${emp.employee_code})? Seluruh riwayat penugasan training dan evaluasi terkait akan dibersihkan.`,
      onConfirm: () => {
        try {
          store.deleteEmployee(emp.id);
          toast.success('Karyawan Dihapus', `Data karyawan "${emp.nama}" berhasil dihapus.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err.message);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Karyawan & Struktur Organisasi</h1>
            <p className="text-xs text-slate-500">
              PRD 6.1: Master data nama departemen/divisi, posisi jabatan, dan karyawan yang dapat ditambah, diedit, dan dihapus langsung melalui antarmuka.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'positions' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jabatan ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'employees' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Karyawan ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'departments' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departemen ({departments.length})
          </button>
        </div>
      </div>

      {/* --- TAB 1: POSITIONS (JABATAN) --- */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Admin dapat menambahkan, mengedit, atau menghapus posisi jabatan kapan saja.
            </p>
            <div className="flex items-center gap-2">
              {onNavigateToMatrix && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToMatrix}
                >
                  Buka Matriks Kompetensi
                </Button>
              )}
              {canManageOrg && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenAddPos}
                >
                  + Tambah Jabatan Baru
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((pos) => {
              const dept = departments.find((d) => d.id === pos.department_id);
              const holderCount = employees.filter((e) => e.position_id === pos.id && e.status === 'active').length;
              const reqCount = store.getMatrix(pos.id).filter((m) => m.wajib).length;

              return (
                <div
                  key={pos.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                    pos.status === 'active' ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{pos.nama_jabatan}</h3>
                          <span className="text-[11px] font-mono text-slate-500">{pos.kode || 'POS'}</span>
                        </div>
                      </div>
                      <Badge variant={pos.status === 'active' ? 'emerald' : 'slate'} size="sm">
                        {pos.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed min-h-[36px]">
                      {pos.deskripsi || 'Tidak ada deskripsi rincian tugas untuk jabatan ini.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Dept: <strong className="text-slate-800">{dept ? dept.nama : 'Umum'}</strong></span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{holderCount}</strong> staf
                      </span>
                    </div>

                    <div className="mt-2 bg-teal-50/60 p-2 rounded-lg text-[11px] text-teal-800 flex items-center justify-between">
                      <span>Kompetensi Wajib:</span>
                      <strong className="font-bold">{reqCount} kompetensi</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        store.togglePositionStatus(pos.id);
                        toast.info('Status Jabatan Diubah');
                      }}
                    >
                      {pos.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>

                    <div className="flex items-center gap-1">
                      {canManageOrg && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditPos(pos)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleDeletePosition(pos)}
                            title="Hapus Jabatan"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: EMPLOYEES --- */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Data peserta / karyawan mencakup jabatan, departemen, supervisor, dan opsi penghapusan akun.
            </p>
            {canManageOrg && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingEmp(null);
                  setEmpName('');
                  setEmpCode(`EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
                  setEmpEmail('');
                  setEmpDeptId(departments[0]?.id || '');
                  setEmpPosId(positions[0]?.id || '');
                  setEmpManagerId('');
                  setEmpModalOpen(true);
                }}
              >
                + Tambah Karyawan Baru
              </Button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Karyawan</th>
                    <th className="p-4">ID / NIK</th>
                    <th className="p-4">Jabatan</th>
                    <th className="p-4">Departemen</th>
                    <th className="p-4">Atasan / Supervisor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {employees.map((emp) => {
                    const pos = positions.find((p) => p.id === emp.position_id);
                    const dept = departments.find((d) => d.id === emp.department_id);
                    const mgr = employees.find((e) => e.id === emp.manager_id);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                              {emp.nama.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{emp.nama}</p>
                              <p className="text-[11px] text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-600">{emp.employee_code}</td>
                        <td className="p-4 font-medium text-slate-800">{pos ? pos.nama_jabatan : '-'}</td>
                        <td className="p-4 text-slate-600">{dept ? dept.nama : '-'}</td>
                        <td className="p-4 text-slate-600">{mgr ? mgr.nama : <span className="text-slate-400">-</span>}</td>
                        <td className="p-4">
                          <Badge variant={emp.status === 'active' ? 'emerald' : 'slate'} size="sm">
                            {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setEditingEmp(emp);
                                setEmpName(emp.nama);
                                setEmpCode(emp.employee_code);
                                setEmpEmail(emp.email);
                                setEmpDeptId(emp.department_id);
                                setEmpPosId(emp.position_id);
                                setEmpManagerId(emp.manager_id || '');
                                setEmpModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            {canManageOrg && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => handleDeleteEmployee(emp)}
                                title="Hapus Karyawan"
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

      {/* --- TAB 3: DEPARTMENTS --- */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Daftar nama departemen / divisi kerja yang dapat ditambah, diedit, dan dihapus.
            </p>
            {canManageOrg && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAddDept}
              >
                + Tambah Departemen / Divisi
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const staffCount = employees.filter((e) => e.department_id === dept.id).length;
              return (
                <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{dept.nama}</h4>
                        <span className="text-[11px] font-mono text-slate-500">{dept.kode || 'DIV'}</span>
                      </div>
                      <Badge variant={dept.status === 'active' ? 'emerald' : 'slate'} size="sm">
                        {dept.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{staffCount} Karyawan Terdaftar</span>
                    <div className="flex items-center gap-1">
                      {canManageOrg && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditDept(dept)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleDeleteDepartment(dept)}
                            title="Hapus Departemen"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT POSITION */}
      <Modal
        isOpen={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        title={editingPos ? 'Edit Nama Jabatan / Posisi' : 'Tambah Posisi Jabatan Baru'}
        subtitle="Admin dapat menambahkan atau mengubah nama posisi jabatan secara langsung"
      >
        <form onSubmit={handleSavePos} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Jabatan / Posisi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Automation Engineer"
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Jabatan
              </label>
              <input
                type="text"
                placeholder="ENG-02"
                value={posCode}
                onChange={(e) => setPosCode(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Departemen / Divisi Terkait
            </label>
            <select
              value={posDeptId}
              onChange={(e) => setPosDeptId(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
            >
              <option value="">-- Tanpa Departemen / Lintas Divisi --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Tugas & Tanggung Jawab
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi singkat fungsi peran jabatan..."
              value={posDesc}
              onChange={(e) => setPosDesc(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setPosModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Jabatan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD/EDIT DEPT */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Edit Nama Departemen / Divisi' : 'Tambah Departemen / Divisi Baru'}
        subtitle="Ubah atau tambahkan nama divisi organisasi operasional"
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Departemen / Divisi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Logistik & Distribusi"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kode Unit / Divisi
            </label>
            <input
              type="text"
              placeholder="LOG"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setDeptModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Departemen
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD/EDIT EMPLOYEE */}
      <Modal
        isOpen={empModalOpen}
        onClose={() => setEmpModalOpen(false)}
        title={editingEmp ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
      >
        <form onSubmit={handleSaveEmp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ID / NIK Karyawan *
              </label>
              <input
                type="text"
                required
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Kantor *
            </label>
            <input
              type="email"
              required
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Departemen *
              </label>
              <select
                required
                value={empDeptId}
                onChange={(e) => setEmpDeptId(e.target.value)}
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
                Jabatan *
              </label>
              <select
                required
                value={empPosId}
                onChange={(e) => setEmpPosId(e.target.value)}
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
              Atasan / Supervisor Langsung
            </label>
            <select
              value={empManagerId}
              onChange={(e) => setEmpManagerId(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- Tidak Ada / Atasan Utama --</option>
              {employees
                .filter((e) => !editingEmp || e.id !== editingEmp.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama} ({e.employee_code})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEmpModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Karyawan
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
