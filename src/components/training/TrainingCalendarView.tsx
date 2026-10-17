import React, { useState, useMemo } from 'react';
import { store } from '../../lib/storage';
import { TrainingSchedule, Department, Employee, UserRole } from '../../types/lcms';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Bell,
  Send,
  Edit2,
  Trash2,
  Building2,
  BookOpen,
  Sparkles,
  ExternalLink,
  Info,
  CalendarCheck2,
  Eye,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { exportToExcelTable, exportToPdfTable } from '../../lib/exportUtils';

export const TrainingCalendarView: React.FC<{ onNavigateToCatalog?: () => void }> = ({
  onNavigateToCatalog,
}) => {
  const toast = useToast();
  const currentUser = store.getCurrentUser();
  const role = currentUser.role;

  const canEdit =
    role === 'admin' || role === 'trainer' || store.hasPermission('can_edit_training');

  const rawSchedules = store.getSchedules();
  const departments = store.getDepartments();
  const positions = store.getPositions();
  const employees = store.getEmployees();
  const trainings = store.getTrainings();
  const allUsers = store.getUsers();

  // View state: 'calendar' or 'list'
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to October 2026 or current date
    const d = new Date();
    d.setFullYear(2026, 9, 1); // October 2026 (0-indexed: 9 = October)
    return d;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal: Add / Edit Schedule
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);

  // Form Fields
  const [trainingMode, setTrainingMode] = useState<'catalog' | 'custom'>('custom');
  const [selectedTrainingId, setSelectedTrainingId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCustomName, setFormCustomName] = useState('');
  const [formCategory, setFormCategory] = useState('Wajib K3 / HSE');
  const [formDeptIds, setFormDeptIds] = useState<string[]>(['all']);
  const [formTrainerType, setFormTrainerType] = useState<'internal' | 'external'>('internal');
  const [formTrainerId, setFormTrainerId] = useState('u-2');
  const [formTrainerName, setFormTrainerName] = useState('Bambang Prasetyo');
  const [formTrainerEmail, setFormTrainerEmail] = useState('trainer@lcms.corp');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:30');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formLocationType, setFormLocationType] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [formRoomLocation, setFormRoomLocation] = useState('Ruang Pelatihan HSE - Gedung Utama');
  const [formMeetingUrl, setFormMeetingUrl] = useState('');
  const [formMaxParticipants, setFormMaxParticipants] = useState(30);
  const [formEnrolledEmpIds, setFormEnrolledEmpIds] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'scheduled' | 'ongoing' | 'completed' | 'cancelled'>('scheduled');
  const [formNotes, setFormNotes] = useState('');
  const [formSendNotification, setFormSendNotification] = useState(true);

  // Modal: Send Reminder Now
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [activeScheduleForReminder, setActiveScheduleForReminder] = useState<TrainingSchedule | null>(null);
  const [reminderCustomNote, setReminderCustomNote] = useState('');

  // Modal: Detail Schedule
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeScheduleDetail, setActiveScheduleDetail] = useState<TrainingSchedule | null>(null);

  // Confirm Delete
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    scheduleId: string;
    scheduleTitle: string;
  }>({
    isOpen: false,
    scheduleId: '',
    scheduleTitle: '',
  });

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return rawSchedules.filter((s) => {
      // Dept filter
      if (selectedDeptFilter !== 'all') {
        const hasDept = s.department_ids.includes('all') || s.department_ids.includes(selectedDeptFilter);
        if (!hasDept) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && s.category !== selectedCategoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchTrainer = s.trainer_name.toLowerCase().includes(q);
        const matchCustom = (s.custom_training_name || '').toLowerCase().includes(q);
        const matchRoom = (s.room_location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTrainer && !matchCustom && !matchRoom) return false;
      }

      return true;
    });
  }, [rawSchedules, selectedDeptFilter, selectedStatusFilter, selectedCategoryFilter, searchQuery]);

  // Calendar calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month (0 = Sun, 1 = Mon...)
    const firstDay = new Date(year, month, 1).getDay();
    // Normalize to Monday = 0, Sunday = 6
    const startOffset = (firstDay + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      date: string; // YYYY-MM-DD
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      schedules: TrainingSchedule[];
    }[] = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        schedules: filteredSchedules.filter((s) => s.start_date === dateStr),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      // Local date string YYYY-MM-DD
      const y = thisDate.getFullYear();
      const m = String(thisDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      days.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        schedules: filteredSchedules.filter(
          (s) => s.start_date <= dateStr && s.end_date >= dateStr
        ),
      });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        schedules: filteredSchedules.filter((s) => s.start_date === dateStr),
      });
    }

    return days;
  }, [currentDate, filteredSchedules]);

  // Calendar month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open Create Modal
  const handleOpenCreate = (prefillDate?: string) => {
    setEditingSchedule(null);
    setTrainingMode('custom');
    setSelectedTrainingId('');
    setFormTitle('');
    setFormCustomName('');
    setFormCategory('Wajib K3 / HSE');
    setFormDeptIds(['all']);
    setFormTrainerType('internal');
    setFormTrainerId('u-2');
    setFormTrainerName('Bambang Prasetyo');
    setFormTrainerEmail('trainer@lcms.corp');
    const defaultDate = prefillDate || new Date().toISOString().slice(0, 10);
    setFormStartDate(defaultDate);
    setFormEndDate(defaultDate);
    setFormStartTime('08:30');
    setFormEndTime('16:00');
    setFormLocationType('offline');
    setFormRoomLocation('Ruang Pelatihan HSE - Gedung Utama');
    setFormMeetingUrl('');
    setFormMaxParticipants(30);
    setFormEnrolledEmpIds([]);
    setFormStatus('scheduled');
    setFormNotes('');
    setFormSendNotification(true);
    setScheduleModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (s: TrainingSchedule) => {
    setEditingSchedule(s);
    setTrainingMode(s.training_id ? 'catalog' : 'custom');
    setSelectedTrainingId(s.training_id || '');
    setFormTitle(s.title);
    setFormCustomName(s.custom_training_name || '');
    setFormCategory(s.category || 'Wajib K3 / HSE');
    setFormDeptIds(s.department_ids || ['all']);
    setFormTrainerType(s.trainer_id ? 'internal' : 'external');
    setFormTrainerId(s.trainer_id || '');
    setFormTrainerName(s.trainer_name);
    setFormTrainerEmail(s.trainer_email || '');
    setFormStartDate(s.start_date);
    setFormEndDate(s.end_date || s.start_date);
    setFormStartTime(s.start_time);
    setFormEndTime(s.end_time);
    setFormLocationType(s.location_type);
    setFormRoomLocation(s.room_location || '');
    setFormMeetingUrl(s.meeting_url || '');
    setFormMaxParticipants(s.max_participants);
    setFormEnrolledEmpIds(s.enrolled_employee_ids || []);
    setFormStatus(s.status);
    setFormNotes(s.notes || '');
    setFormSendNotification(true);
    setScheduleModalOpen(true);
  };

  // Save Schedule Handler
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Judul atau nama program training wajib diisi');
      return;
    }
    if (!formStartDate) {
      toast.error('Tanggal mulai pelatihan wajib diisi');
      return;
    }

    const payload: Partial<TrainingSchedule> & { id?: string } = {
      id: editingSchedule ? editingSchedule.id : undefined,
      title: formTitle.trim(),
      training_id: trainingMode === 'catalog' && selectedTrainingId ? selectedTrainingId : undefined,
      custom_training_name:
        trainingMode === 'custom'
          ? formCustomName.trim() || formTitle.trim()
          : formCustomName.trim(),
      category: formCategory,
      department_ids: formDeptIds.length > 0 ? formDeptIds : ['all'],
      trainer_id: formTrainerType === 'internal' ? formTrainerId : undefined,
      trainer_name: formTrainerName.trim() || 'Instruktur Internal',
      trainer_email: formTrainerEmail.trim(),
      start_date: formStartDate,
      end_date: formEndDate || formStartDate,
      start_time: formStartTime,
      end_time: formEndTime,
      location_type: formLocationType,
      room_location: formLocationType !== 'online' ? formRoomLocation.trim() : undefined,
      meeting_url: formLocationType !== 'offline' ? formMeetingUrl.trim() : undefined,
      max_participants: Number(formMaxParticipants) || 30,
      enrolled_employee_ids: formEnrolledEmpIds,
      status: formStatus,
      notes: formNotes.trim(),
    };

    const isEdit = !!editingSchedule;
    store.saveSchedule(payload, {
      notifyEmail: formSendNotification,
      isAdjustment: isEdit,
    });

    toast.success(
      isEdit ? 'Jadwal Disesuaikan!' : 'Jadwal Baru Disimpan!',
      formSendNotification
        ? `Notifikasi email otomatis telah dikirimkan ke peserta, trainer, & supervisor terkait.`
        : `Jadwal berhasil diperbarui dalam kalender.`
    );

    setScheduleModalOpen(false);
  };

  // Send Reminder Handler
  const handleOpenReminder = (s: TrainingSchedule) => {
    setActiveScheduleForReminder(s);
    setReminderCustomNote('');
    setReminderModalOpen(true);
  };

  const handleSendReminderSubmit = () => {
    if (!activeScheduleForReminder) return;
    try {
      const res = store.sendScheduleReminder(
        activeScheduleForReminder.id,
        reminderCustomNote.trim()
      );
      toast.success(
        'Reminder Berhasil Dikirimkan!',
        `Notifikasi pengingat sesi telah dikirimkan kepada ${res.sentCount} penerima email (peserta, trainer, & supervisor).`
      );
      setReminderModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal mengirim reminder', err.message);
    }
  };

  // Delete Schedule Handler
  const handleDeleteScheduleConfirm = () => {
    if (!confirmDelete.scheduleId) return;
    store.deleteSchedule(confirmDelete.scheduleId);
    toast.info('Jadwal Pelatihan Dihapus', `Jadwal "${confirmDelete.scheduleTitle}" telah dihapus.`);
    setConfirmDelete({ isOpen: false, scheduleId: '', scheduleTitle: '' });
    setDetailModalOpen(false);
  };

  // Toggle department in form
  const toggleDeptInForm = (deptId: string) => {
    if (deptId === 'all') {
      setFormDeptIds(['all']);
      return;
    }
    let current = formDeptIds.filter((d) => d !== 'all');
    if (current.includes(deptId)) {
      current = current.filter((d) => d !== deptId);
      if (current.length === 0) current = ['all'];
    } else {
      current.push(deptId);
    }
    setFormDeptIds(current);
  };

  // Select all employees matching formDeptIds
  const handleAutoSelectDepartmentEmployees = () => {
    const isAll = formDeptIds.includes('all');
    const matched = employees
      .filter((e) => isAll || formDeptIds.includes(e.department_id))
      .map((e) => e.id);
    setFormEnrolledEmpIds(matched);
    toast.info(
      'Peserta Terpilih Otomatis',
      `${matched.length} karyawan dari departemen terpilih ditambahkan ke jadwal.`
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'ID Jadwal',
      'Nama Pelatihan',
      'Kategori',
      'Departemen Sasaran',
      'Instruktur / Trainer',
      'Email Instruktur',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Waktu Sesi',
      'Tipe Lokasi',
      'Lokasi / Tautan Meet',
      'Kapasitas Kuota',
      'Peserta Terdaftar',
      'Status Pelatihan',
      'Reminder Terkirim',
    ];

    const rows = filteredSchedules.map((s) => [
      s.id,
      s.title,
      s.category || '-',
      s.department_ids.includes('all')
        ? 'Semua Departemen'
        : s.department_ids
            .map((id) => departments.find((d) => d.id === id)?.nama || id)
            .join('; '),
      s.trainer_name,
      s.trainer_email || '-',
      s.start_date,
      s.end_date,
      `${s.start_time} - ${s.end_time} WIB`,
      s.location_type.toUpperCase(),
      s.location_type === 'online' ? s.meeting_url || '-' : s.room_location || '-',
      s.max_participants,
      s.enrolled_employee_ids?.length || 0,
      s.status.toUpperCase(),
      s.reminder_sent_count || 0,
    ]);

    exportToExcelTable({
      filename: `Jadwal_Training_LCMS_${new Date().toISOString().slice(0, 10)}.xls`,
      title: 'KALENDER & JADWAL PELATIHAN KORPORAT',
      subtitle: `Rekapitulasi Agenda Pelatihan Terjadwal & Notifikasi Peserta (${filteredSchedules.length} Sesi)`,
      headers,
      rows,
      author: currentUser.name,
      orientation: 'landscape',
      summaryCards: [
        { label: 'Total Sesi Training', value: filteredSchedules.length },
        {
          label: 'Sesi Terjadwal',
          value: filteredSchedules.filter((s) => s.status === 'scheduled').length,
        },
        {
          label: 'Sesi Berlangsung',
          value: filteredSchedules.filter((s) => s.status === 'ongoing').length,
        },
        {
          label: 'Total Peserta Terdaftar',
          value: filteredSchedules.reduce(
            (acc, curr) => acc + (curr.enrolled_employee_ids?.length || 0),
            0
          ),
        },
      ],
    });
    toast.success('File Excel Berhasil Dibuat!', 'Mengunduh rekap kalender training.');
  };

  // Export to PDF
  const handleExportPdf = () => {
    const headers = [
      'No',
      'Program Pelatihan',
      'Departemen',
      'Tanggal & Jam',
      'Instruktur',
      'Lokasi',
      'Peserta',
      'Status',
    ];

    const rows = filteredSchedules.map((s, idx) => [
      idx + 1,
      s.title,
      s.department_ids.includes('all')
        ? 'Semua Dept'
        : s.department_ids
            .map((id) => departments.find((d) => d.id === id)?.kode || id)
            .join(', '),
      `${s.start_date}\n${s.start_time} WIB`,
      s.trainer_name,
      s.location_type === 'online' ? 'Online Meet' : s.room_location || 'Ruang Training',
      `${s.enrolled_employee_ids?.length || 0} orang`,
      s.status.toUpperCase(),
    ]);

    exportToPdfTable({
      filename: `Jadwal_Training_LCMS_${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'DOKUMEN AGENDA & KALENDER TRAINING KORPORAT',
      subtitle: `Sistem Manajemen Pelatihan & Notifikasi Otomatis LCMS Enterprise`,
      headers,
      rows,
      author: currentUser.name,
      orientation: 'landscape',
      summaryCards: [
        { label: 'Total Sesi Pelatihan', value: filteredSchedules.length },
        {
          label: 'Total Peserta Terdaftar',
          value: filteredSchedules.reduce(
            (acc, curr) => acc + (curr.enrolled_employee_ids?.length || 0),
            0
          ),
        },
      ],
    });
    toast.success('Dokumen PDF Berhasil Dibuat!', 'Mengunduh format cetak resmi agenda training.');
  };

  // Status Badge Helper
  const renderStatusBadge = (status: TrainingSchedule['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="teal">Terjadwal</Badge>;
      case 'ongoing':
        return <Badge variant="emerald">Berlangsung</Badge>;
      case 'completed':
        return <Badge variant="slate">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Dibatalkan</Badge>;
    }
  };

  const getCategoryColor = (cat?: string) => {
    if (!cat) return 'bg-teal-100 text-teal-800 border-teal-300';
    if (cat.includes('K3') || cat.includes('HSE')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cat.includes('Operasional') || cat.includes('Teknik')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (cat.includes('ISO') || cat.includes('Mutu') || cat.includes('Kualitas')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cat.includes('Leadership') || cat.includes('Manajerial')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-sky-100 text-sky-800 border-sky-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Sistem Penjadwalan Pelatihan & Pengingat Email Otomatis
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kalender & Jadwal Training
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Atur jadwal training resmi maupun kostum training baru untuk departemen mana saja. Setiap pendaftaran dan penyesuaian waktu akan mengirimkan notifikasi serta pengingat (reminder) otomatis ke email peserta, trainer, dan supervisor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canEdit && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleOpenCreate()}
                icon={<Plus className="w-4 h-4" />}
                className="shadow-lg font-bold"
              >
                Jadwalkan Training Baru
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700 text-xs font-semibold"
              onClick={handleExportExcel}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            >
              Ekspor Excel
            </Button>

            <Button
              variant="outline"
              size="md"
              className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700 text-xs font-semibold"
              onClick={handleExportPdf}
              icon={<FileText className="w-4 h-4 text-rose-400" />}
            >
              Unduh PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher, Month Nav, Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Tampilan Kalender
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              Daftar Agenda ({filteredSchedules.length})
            </button>
          </div>

          {/* Center: Month Navigator for Calendar Mode */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold text-slate-900 min-w-[170px] text-center capitalize">
                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            </div>
          )}

          {/* Right: Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari training, trainer, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            Filter:
          </span>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Departemen (Lintas Organisasi)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama} ({d.kode})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Status</option>
            <option value="scheduled">Terjadwal</option>
            <option value="ongoing">Berlangsung</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Wajib K3 / HSE">Wajib K3 / HSE</option>
            <option value="Operasional Mesin">Operasional Mesin</option>
            <option value="Kualitas & ISO">Kualitas & ISO</option>
            <option value="Leadership">Leadership</option>
          </select>

          {(selectedDeptFilter !== 'all' ||
            selectedStatusFilter !== 'all' ||
            selectedCategoryFilter !== 'all' ||
            searchQuery.trim()) && (
            <button
              onClick={() => {
                setSelectedDeptFilter('all');
                setSelectedStatusFilter('all');
                setSelectedCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-slate-900 text-white text-center py-2.5 text-xs font-bold uppercase tracking-wider">
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div className="text-teal-300">Sabtu</div>
            <div className="text-rose-300">Minggu</div>
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
            {calendarDays.map((day, idx) => {
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (canEdit && day.isCurrentMonth && day.schedules.length === 0) {
                      handleOpenCreate(day.date);
                    }
                  }}
                  className={`p-2 transition-colors flex flex-col justify-between group relative ${
                    !day.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-400'
                      : 'bg-white hover:bg-slate-50/70'
                  } ${day.isToday ? 'bg-teal-50/40 ring-1 ring-teal-500/30' : ''}`}
                >
                  {/* Top Bar inside cell: Date number & quick add button */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        day.isToday
                          ? 'bg-teal-600 text-white shadow-xs'
                          : day.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {canEdit && day.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreate(day.date);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-teal-600 hover:bg-teal-100 cursor-pointer"
                        title="Tambah jadwal di tanggal ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Scheduled Events for this date */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-32">
                    {day.schedules.map((sch) => {
                      return (
                        <div
                          key={sch.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveScheduleDetail(sch);
                            setDetailModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer hover:shadow-md ${getCategoryColor(
                            sch.category
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate font-bold">{sch.title}</span>
                            {sch.location_type === 'online' && (
                              <Video className="w-3 h-3 shrink-0 text-indigo-700" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] opacity-80 mt-0.5">
                            <span>{sch.start_time}</span>
                            <span>{sch.enrolled_employee_ids?.length || 0} org</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {day.schedules.length === 0 && day.isCurrentMonth && canEdit && (
                    <div className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity text-center py-2">
                      + Jadwalkan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: AGENDA / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Tidak Ada Jadwal Training Ditemukan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan sesuaikan filter pencarian atau buat jadwal training baru untuk departemen terkait.
              </p>
              {canEdit && (
                <Button
                  variant="emerald"
                  size="sm"
                  className="mt-4 font-bold"
                  onClick={() => handleOpenCreate()}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Jadwalkan Training Baru
                </Button>
              )}
            </div>
          ) : (
            filteredSchedules.map((sch) => {
              const enrolledCount = sch.enrolled_employee_ids?.length || 0;
              const formattedDate = new Date(sch.start_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              const deptLabels = sch.department_ids.includes('all')
                ? 'Semua Departemen Korporat'
                : sch.department_ids
                    .map((id) => departments.find((d) => d.id === id)?.nama || id)
                    .join(', ');

              return (
                <div
                  key={sch.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 hover:border-teal-300 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(sch.status)}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(sch.category)}`}>
                          {sch.category || 'Umum'}
                        </span>
                        {sch.custom_training_name && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Kostum Training
                          </span>
                        )}
                        {sch.reminder_sent_count && sch.reminder_sent_count > 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Bell className="w-3 h-3" /> {sch.reminder_sent_count}x Reminder Terkirim
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {sch.title}
                      </h3>

                      {sch.custom_training_name && sch.custom_training_name !== sch.title && (
                        <p className="text-xs text-purple-700 font-medium">
                          Topik Kustom: {sch.custom_training_name}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReminder(sch)}
                        icon={<Bell className="w-3.5 h-3.5 text-amber-600" />}
                        className="text-xs font-semibold"
                      >
                        Kirim Reminder
                      </Button>

                      {canEdit && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(sch)}
                            icon={<Edit2 className="w-3.5 h-3.5 text-teal-600" />}
                            className="text-xs font-semibold"
                          >
                            Sesuaikan
                          </Button>

                          <button
                            onClick={() =>
                              setConfirmDelete({
                                isOpen: true,
                                scheduleId: sch.id,
                                scheduleTitle: sch.title,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Hapus jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{formattedDate}</p>
                        <p className="text-[11px] text-slate-500">
                          {sch.start_time} - {sch.end_time} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">
                          {deptLabels}
                        </p>
                        <p className="text-[11px] text-slate-500">Target Departemen</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      {sch.location_type === 'online' ? (
                        <Video className="w-4 h-4 text-sky-600 shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">
                          {sch.location_type === 'online'
                            ? sch.meeting_url || 'Online Link'
                            : sch.room_location || 'Ruang Training'}
                        </p>
                        <p className="text-[11px] text-slate-500 capitalize">
                          Tipe: {sch.location_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {enrolledCount} / {sch.max_participants} Peserta
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Instruktur: {sch.trainer_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                    <p className="italic text-[11px]">
                      {sch.notes
                        ? `Catatan: "${sch.notes}"`
                        : 'Tidak ada catatan prasyarat tambahan.'}
                    </p>

                    <button
                      onClick={() => {
                        setActiveScheduleDetail(sch);
                        setDetailModalOpen(true);
                      }}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Rincian & Peserta Terdaftar &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: FORM TAMBAH / SESUAIKAN JADWAL TRAINING */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={editingSchedule ? 'Sesuaikan / Edit Jadwal Training' : 'Jadwalkan Training Baru'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-5">
          {/* Training Type Selector: Catalog vs Custom */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Pilih Jenis Program Pelatihan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  trainingMode === 'custom'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-white border-slate-300 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="trainingMode"
                  checked={trainingMode === 'custom'}
                  onChange={() => setTrainingMode('custom')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Kostum Training Baru</p>
                  <p className="text-[10px] text-slate-500">Bebas ketik topik, materi, atau workshop khusus</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  trainingMode === 'catalog'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-white border-slate-300 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="trainingMode"
                  checked={trainingMode === 'catalog'}
                  onChange={() => setTrainingMode('catalog')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Dari Katalog Resmi</p>
                  <p className="text-[10px] text-slate-500">Pilih dari silabus modul yang telah terdaftar</p>
                </div>
              </label>
            </div>
          </div>

          {/* Catalog selector if catalog mode */}
          {trainingMode === 'catalog' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Modul dari Katalog Training:
              </label>
              <select
                value={selectedTrainingId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedTrainingId(id);
                  const found = trainings.find((t) => t.id === id);
                  if (found) {
                    setFormTitle(found.judul);
                    setFormCategory(found.kategori || 'Wajib K3 / HSE');
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Pilih Program Training --</option>
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.judul} ({t.kategori})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Training Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Sesi Pelatihan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Training Sertifikasi K3 & HIRADC Lapangan"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Custom Training Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topik / Keterangan Kostum Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pendalaman Penilaian Risiko Kritis & Studi Kasus Lapangan"
              value={formCustomName}
              onChange={(e) => setFormCustomName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pelatihan</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="Wajib K3 / HSE">Wajib K3 / HSE</option>
                <option value="Operasional Mesin">Operasional Mesin</option>
                <option value="Kualitas & ISO">Kualitas & ISO</option>
                <option value="Leadership">Leadership & Manajerial</option>
                <option value="Soft Skill & Umum">Soft Skill & Umum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Pelaksanaan</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Target Departments (All vs Specific Multi-Select) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Departemen Sasaran Pelatihan:
              </label>
              <span className="text-[11px] text-teal-700 font-semibold">
                {formDeptIds.includes('all') ? 'Semua Departemen' : `${formDeptIds.length} Departemen Dipilih`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                  formDeptIds.includes('all')
                    ? 'bg-teal-50 border-teal-500 font-bold text-teal-900'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formDeptIds.includes('all')}
                  onChange={() => toggleDeptInForm('all')}
                  className="rounded text-teal-600"
                />
                Semua Departemen Korporat (Lintas Dept)
              </label>

              {departments.map((dept) => {
                const isChecked = formDeptIds.includes(dept.id);
                return (
                  <label
                    key={dept.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                      isChecked && !formDeptIds.includes('all')
                        ? 'bg-teal-50 border-teal-500 font-bold text-teal-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={formDeptIds.includes('all')}
                      onChange={() => toggleDeptInForm(dept.id)}
                      className="rounded text-teal-600 disabled:opacity-40"
                    />
                    <span className="truncate">{dept.nama} ({dept.kode})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Trainer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Instruktur / Trainer
              </label>
              <select
                value={formTrainerType}
                onChange={(e) => {
                  const val = e.target.value as 'internal' | 'external';
                  setFormTrainerType(val);
                  if (val === 'internal') {
                    setFormTrainerId('u-2');
                    setFormTrainerName('Bambang Prasetyo');
                    setFormTrainerEmail('trainer@lcms.corp');
                  } else {
                    setFormTrainerId('');
                    setFormTrainerName('');
                    setFormTrainerEmail('');
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="internal">Trainer Internal LCMS</option>
                <option value="external">Trainer Eksternal / Konsultan Luar</option>
              </select>
            </div>

            {formTrainerType === 'internal' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Trainer Internal Terdaftar:
                </label>
                <select
                  value={formTrainerId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setFormTrainerId(id);
                    const user = allUsers.find((u) => u.id === id);
                    if (user) {
                      setFormTrainerName(user.name);
                      setFormTrainerEmail(user.email);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  {allUsers
                    .filter((u) => u.role === 'trainer' || u.role === 'admin')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.toUpperCase()}) - {u.email}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Trainer Eksternal:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ir. Hendro Kusumo, ST"
                  value={formTrainerName}
                  onChange={(e) => setFormTrainerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            )}
          </div>

          {formTrainerType === 'external' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Trainer Eksternal (Untuk Menerima Notifikasi)
              </label>
              <input
                type="email"
                placeholder="hendro@training-iso.id"
                value={formTrainerEmail}
                onChange={(e) => setFormTrainerEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          )}

          {/* Dates and Times */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={formStartDate}
                onChange={(e) => {
                  setFormStartDate(e.target.value);
                  if (!formEndDate || formEndDate < e.target.value) {
                    setFormEndDate(e.target.value);
                  }
                }}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                required
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Location & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Pelaksanaan</label>
              <select
                value={formLocationType}
                onChange={(e) => setFormLocationType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="offline">Offline (Tatap Muka di Kelas)</option>
                <option value="online">Online (Zoom / Google Meet)</option>
                <option value="hybrid">Hybrid (Tatap Muka & Online)</option>
              </select>
            </div>

            {formLocationType !== 'online' && (
              <div className={formLocationType === 'hybrid' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruang / Lokasi Gedung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ruang Pelatihan HSE - Gedung Utama Lt. 2"
                  value={formRoomLocation}
                  onChange={(e) => setFormRoomLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            )}

            {formLocationType !== 'offline' && (
              <div className={formLocationType === 'hybrid' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Online Meeting (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc"
                  value={formMeetingUrl}
                  onChange={(e) => setFormMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Capacity & Participants Enrolled */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800">
                  Peserta Pelatihan Terdaftar ({formEnrolledEmpIds.length} Orang Terpilih)
                </label>
                <p className="text-[11px] text-slate-500">
                  Pilih karyawan secara manual atau pilih otomatis dari departemen sasaran
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleAutoSelectDepartmentEmployees}
                  className="text-xs py-1"
                >
                  Pilih Semua Karyawan Dept Sasaran
                </Button>
                <button
                  type="button"
                  onClick={() => setFormEnrolledEmpIds([])}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white">
              {employees.map((emp) => {
                const isSelected = formEnrolledEmpIds.includes(emp.id);
                const pos = positions.find((p) => p.id === emp.position_id)?.nama_jabatan;
                return (
                  <label
                    key={emp.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                      isSelected ? 'bg-teal-50 text-teal-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setFormEnrolledEmpIds(formEnrolledEmpIds.filter((id) => id !== emp.id));
                        } else {
                          setFormEnrolledEmpIds([...formEnrolledEmpIds, emp.id]);
                        }
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <div className="truncate">
                      <span>{emp.nama}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{pos || emp.employee_code}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan & Prasyarat Pelatihan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Peserta wajib mengenakan APD lengkap (Safety Shoes & Helm) saat sesi praktek."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          {/* Notification Trigger Checkbox */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formSendNotification}
                onChange={(e) => setFormSendNotification(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <p className="text-xs font-bold text-teal-950">
                  {editingSchedule
                    ? 'Kirimkan Notifikasi Email Penyesuaian Jadwal (Reschedule)'
                    : 'Kirimkan Notifikasi Email Undangan Jadwal Baru'}
                </p>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  Sistem akan secara otomatis mengirimkan email resmi ke seluruh peserta terdaftar, instruktur yang ditugaskan, dan supervisor departemen terkait.
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="md" type="button" onClick={() => setScheduleModalOpen(false)}>
              Batal
            </Button>
            <Button variant="emerald" size="md" type="submit" className="font-bold">
              {editingSchedule ? 'Simpan Penyesuaian Jadwal' : 'Simpan & Publikasikan Jadwal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: KIRIM REMINDER JADWAL TRAINING MANUAL */}
      {reminderModalOpen && activeScheduleForReminder && (
        <Modal
          isOpen={reminderModalOpen}
          onClose={() => setReminderModalOpen(false)}
          title="Kirim Reminder / Pengingat Jadwal"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <Bell className="w-4 h-4 text-amber-600" />
                Pengingat Jadwal Pelatihan Segera
              </div>
              <p className="text-xs text-amber-800">
                Email reminder akan dikirimkan secara langsung ke:{' '}
                <strong>
                  {activeScheduleForReminder.enrolled_employee_ids?.length || 'Semua'} Peserta
                </strong>
                , Trainer (<strong>{activeScheduleForReminder.trainer_name}</strong>), dan Supervisor departemen terkait.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900">{activeScheduleForReminder.title}</p>
              <p className="text-slate-600">
                Waktu:{' '}
                <strong>
                  {new Date(activeScheduleForReminder.start_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  , {activeScheduleForReminder.start_time} - {activeScheduleForReminder.end_time} WIB
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Tambahan untuk Penerima (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Harap hadir 15 menit sebelum acara dimulai dengan membawa modul cetak."
                value={reminderCustomNote}
                onChange={(e) => setReminderCustomNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setReminderModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={handleSendReminderSubmit}
                icon={<Send className="w-3.5 h-3.5" />}
                className="font-bold"
              >
                Kirimkan Reminder Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: DETAIL JADWAL & PESERTA TERDAFTAR */}
      {detailModalOpen && activeScheduleDetail && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Rincian Jadwal Pelatihan & Daftar Peserta"
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Top Detail Header */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {renderStatusBadge(activeScheduleDetail.status)}
                  <span className="text-xs text-teal-300 font-semibold">
                    {activeScheduleDetail.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{activeScheduleDetail.title}</h3>
                {activeScheduleDetail.custom_training_name && (
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeScheduleDetail.custom_training_name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 text-xs"
                  onClick={() => handleOpenReminder(activeScheduleDetail)}
                  icon={<Bell className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Kirim Pengingat
                </Button>
                {canEdit && (
                  <Button
                    variant="emerald"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenEdit(activeScheduleDetail);
                    }}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Jadwal
                  </Button>
                )}
              </div>
            </div>

            {/* Schedule Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Waktu Sesi:</span>
                <span className="font-bold text-slate-900">
                  {new Date(activeScheduleDetail.start_date).toLocaleDateString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {activeScheduleDetail.start_time} - {activeScheduleDetail.end_time} WIB
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Instruktur:</span>
                <span className="font-bold text-slate-900">
                  {activeScheduleDetail.trainer_name}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {activeScheduleDetail.trainer_email || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Lokasi:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {activeScheduleDetail.location_type}
                </span>
                <span className="text-[11px] text-slate-600 block truncate">
                  {activeScheduleDetail.location_type === 'online'
                    ? activeScheduleDetail.meeting_url || 'Online Link'
                    : activeScheduleDetail.room_location || 'Ruang Training'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Departemen:</span>
                <span className="font-bold text-slate-900">
                  {activeScheduleDetail.department_ids.includes('all')
                    ? 'Semua Departemen'
                    : activeScheduleDetail.department_ids
                        .map((id) => departments.find((d) => d.id === id)?.nama || id)
                        .join(', ')}
                </span>
              </div>
            </div>

            {/* Enrolled Participants List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Daftar Peserta Terdaftar ({activeScheduleDetail.enrolled_employee_ids?.length || 0} / {activeScheduleDetail.max_participants})
                </h4>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {(activeScheduleDetail.enrolled_employee_ids || []).length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    Belum ada peserta terdaftar khusus. Pelatihan terbuka untuk seluruh karyawan departemen sasaran.
                  </div>
                ) : (
                  (activeScheduleDetail.enrolled_employee_ids || []).map((empId, idx) => {
                    const emp = employees.find((e) => e.id === empId);
                    const pos = positions.find((p) => p.id === emp?.position_id)?.nama_jabatan;
                    const dept = departments.find((d) => d.id === emp?.department_id)?.nama;
                    return (
                      <div key={empId} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-slate-400 font-bold text-center">{idx + 1}</span>
                          <div>
                            <p className="font-bold text-slate-900">{emp?.nama || empId}</p>
                            <p className="text-[11px] text-slate-500">
                              {pos || '-'} • {dept || '-'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {emp?.email || emp?.employee_code}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500">
                Dibuat pada: {new Date(activeScheduleDetail.created_at).toLocaleDateString('id-ID')}
              </span>
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Jadwal Pelatihan?"
        message={`Apakah Anda yakin ingin menghapus jadwal pelatihan "${confirmDelete.scheduleTitle}" dari kalender? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        confirmLabel="Hapus Jadwal"
        onConfirm={handleDeleteScheduleConfirm}
        onClose={() => setConfirmDelete({ isOpen: false, scheduleId: '', scheduleTitle: '' })}
      />
    </div>
  );
};
