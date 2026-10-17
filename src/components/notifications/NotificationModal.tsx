import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { EmailNotification, UserRole } from '../../types/lcms';
import {
  Mail,
  Bell,
  CheckCheck,
  Trash2,
  X,
  Search,
  Calendar,
  UserCheck,
  Shield,
  BookOpen,
  Award,
  Users,
  Send,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const currentUser = store.getCurrentUser();
  const allNotifications = store.getNotifications();
  const unreadCount = store.getUnreadNotificationCount();

  const [activeTab, setActiveTab] = useState<'all' | 'employee' | 'trainer' | 'supervisor' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(null);
  const [testSendModalOpen, setTestSendModalOpen] = useState(false);

  // Test send state
  const [testEmail, setTestEmail] = useState(currentUser.email);
  const [testName, setTestName] = useState(currentUser.name);
  const [testRole, setTestRole] = useState<UserRole>(currentUser.role);
  const [testType, setTestType] = useState<EmailNotification['type']>('welcome_registration');
  const [testSubject, setTestSubject] = useState('');
  const [testNote, setTestNote] = useState('');

  if (!isOpen) return null;

  // Filter notifications
  const filteredNotifications = allNotifications.filter((n) => {
    if (activeTab !== 'all' && n.recipient_role !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = n.subject.toLowerCase().includes(q);
      const matchRec = n.recipient_email.toLowerCase().includes(q) || n.recipient_name.toLowerCase().includes(q);
      const matchPrev = n.preview.toLowerCase().includes(q);
      return matchSub || matchRec || matchPrev;
    }
    return true;
  });

  const countByRole = {
    all: allNotifications.length,
    employee: allNotifications.filter((n) => n.recipient_role === 'employee').length,
    trainer: allNotifications.filter((n) => n.recipient_role === 'trainer').length,
    supervisor: allNotifications.filter((n) => n.recipient_role === 'supervisor').length,
    admin: allNotifications.filter((n) => n.recipient_role === 'admin').length,
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="emerald">Super Admin</Badge>;
      case 'trainer':
        return <Badge variant="purple">Trainer</Badge>;
      case 'supervisor':
        return <Badge variant="teal">Supervisor</Badge>;
      case 'employee':
        return <Badge variant="blue">Peserta</Badge>;
      default:
        return <Badge variant="slate">User</Badge>;
    }
  };

  const getTypeBadge = (type: EmailNotification['type']) => {
    switch (type) {
      case 'welcome_registration':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Registrasi Akun Baru</span>;
      case 'training_schedule_invite':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Undangan Training</span>;
      case 'schedule_reminder':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pengingat Jadwal (Reminder)</span>;
      case 'schedule_updated':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Penyesuaian Jadwal</span>;
      case 'training_assigned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Tugas Belajar</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">Notifikasi</span>;
    }
  };

  const handleOpenDetail = (notif: EmailNotification) => {
    store.markNotificationRead(notif.id);
    setSelectedNotif(notif);
  };

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead();
    toast.success('Berhasil', 'Seluruh notifikasi ditandai telah dibaca.');
  };

  const handleClearAll = () => {
    if (window.confirm('Hapus seluruh riwayat email notifikasi sistem?')) {
      store.clearNotifications();
      toast.info('Riwayat Notifikasi Dikosongkan');
    }
  };

  const handleSendTestNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || !testName.trim()) {
      toast.error('Email dan nama penerima wajib diisi');
      return;
    }

    let defaultSub = testSubject.trim();
    if (!defaultSub) {
      if (testType === 'welcome_registration') defaultSub = `[Selamat Datang] Registrasi Akun ${testRole.toUpperCase()} - ${testName}`;
      else if (testType === 'schedule_reminder') defaultSub = `[Reminder] Pengingat Sesi Pelatihan Terjadwal - ${testName}`;
      else if (testType === 'schedule_updated') defaultSub = `[Penyesuaian Jadwal] Perubahan Waktu Pelatihan - ${testName}`;
      else defaultSub = `[Undangan Pelatihan] Jadwal Pelatihan Korporat - ${testName}`;
    }

    store.sendEmailNotification({
      recipient_email: testEmail.trim(),
      recipient_name: testName.trim(),
      recipient_role: testRole,
      type: testType,
      subject: defaultSub,
      preview: `Notifikasi simulasi untuk peran ${testRole}: ${testNote || 'Pemberitahuan resmi sistem LCMS Enterprise.'}`,
      body_html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase;">LCMS Enterprise • Simulasi Email</span>
            <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">${defaultSub}</h2>
          </div>
          <p>Halo <strong>${testName}</strong>,</p>
          <p>Email ini dikirimkan sebagai bagian dari pengujian sistem notifikasi otomatis LCMS Enterprise untuk peran <strong>${testRole.toUpperCase()}</strong>.</p>
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #0f172a;">Ringkasan Data:</p>
            <p style="margin: 0; font-size: 13px; color: #475569;">
              Penerima: <strong>${testName} (${testEmail})</strong><br/>
              Peran: <strong>${testRole}</strong><br/>
              Tipe Pesan: <strong>${testType}</strong><br/>
              Catatan Khusus: <em>${testNote || 'Tidak ada catatan tambahan.'}</em>
            </p>
          </div>
          <p style="font-size: 12px; color: #64748b;">Notifikasi ini tersimpan di simulator kotak masuk LCMS dan siap diverifikasi.</p>
        </div>
      `,
    });

    toast.success('Email Simulasi Terkirim!', `Notifikasi telah masuk ke daftar kotak masuk untuk ${testEmail}.`);
    setTestSendModalOpen(false);
    setTestNote('');
    setTestSubject('');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Pusat Email & Notifikasi Sistem
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500 text-slate-950">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Riwayat pengiriman email registrasi akun, undangan pelatihan, & pengingat jadwal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 text-xs hidden sm:flex"
                onClick={() => setTestSendModalOpen(true)}
                icon={<Sparkles className="w-3.5 h-3.5 text-teal-400" />}
              >
                Simulasi Kirim Email
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Header & Role Filters */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari penerima, subjek email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai Semua Dibaca
                </button>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Semua Email ({countByRole.all})
              </button>
              <button
                onClick={() => setActiveTab('employee')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'employee'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Sebagai Peserta ({countByRole.employee})
              </button>
              <button
                onClick={() => setActiveTab('trainer')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'trainer'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Sebagai Trainer ({countByRole.trainer})
              </button>
              <button
                onClick={() => setActiveTab('supervisor')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'supervisor'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Sebagai Supervisor ({countByRole.supervisor})
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Admin / Sistem ({countByRole.admin})
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Notifikasi</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Setiap ada pendaftaran akun baru, jadwal training baru, atau reminder penyesuaian jadwal, rekaman email akan tampil di sini.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => setTestSendModalOpen(true)}
                  icon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                >
                  Kirim Notifikasi Simulasi
                </Button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.is_read;
                const formattedTime = new Date(notif.sent_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleOpenDetail(notif)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 sm:gap-4 mb-1 border ${
                      isUnread
                        ? 'bg-teal-50/60 border-teal-200 hover:bg-teal-50'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {/* Status Dot / Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {notif.recipient_role === 'admin' ? (
                          <Shield className="w-4 h-4 text-emerald-600" />
                        ) : notif.recipient_role === 'trainer' ? (
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        ) : notif.recipient_role === 'supervisor' ? (
                          <Award className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Users className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {notif.recipient_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                            &lt;{notif.recipient_email}&gt;
                          </span>
                          {getRoleBadge(notif.recipient_role)}
                        </div>
                        <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(notif.type)}
                        <h4 className={`text-xs truncate ${isUnread ? 'font-extrabold text-slate-950' : 'font-semibold text-slate-800'}`}>
                          {notif.subject}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {notif.preview}
                      </p>
                    </div>

                    <div className="shrink-0 self-center hidden sm:block">
                      <span className="text-xs text-teal-700 font-bold hover:underline">
                        Buka Surat &rarr;
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total {allNotifications.length} rekaman email notifikasi korporat tersimpan.
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup Panel
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL: PREVIEW EMAIL NOTIFIKASI FORMAL */}
      {selectedNotif && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs transition-opacity" onClick={() => setSelectedNotif(null)} />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header Email Client Mockup */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pratinjau Email Resmi LCMS</h4>
                  <p className="text-[11px] text-slate-400">Simulasi Template HTML Surat Keluar Korporat</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                  <CheckCheck className="w-3 h-3" /> Status: Terkirim
                </span>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Email Metadata Envelope */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5 font-sans">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-slate-500 w-16 inline-block font-semibold">Subjek:</span>
                  <span className="font-bold text-slate-900">{selectedNotif.subject}</span>
                </div>
                {getTypeBadge(selectedNotif.type)}
              </div>
              <div>
                <span className="text-slate-500 w-16 inline-block font-semibold">Dari:</span>
                <span className="text-slate-800 font-mono">LCMS Automated Hub &lt;noreply@lcms.corp&gt;</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 w-16 inline-block font-semibold">Kepada:</span>
                  <span className="text-slate-800 font-mono font-semibold">
                    {selectedNotif.recipient_name} &lt;{selectedNotif.recipient_email}&gt;
                  </span>
                  <span className="ml-2">{getRoleBadge(selectedNotif.recipient_role)}</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  {new Date(selectedNotif.sent_at).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Rendered Email Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div
                className="prose prose-sm max-w-none bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200"
                dangerouslySetInnerHTML={{ __html: selectedNotif.body_html }}
              />
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <button
                onClick={() => {
                  store.deleteNotification(selectedNotif.id);
                  setSelectedNotif(null);
                  toast.info('Notifikasi dihapus.');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Email Ini
              </button>

              <Button variant="emerald" size="sm" onClick={() => setSelectedNotif(null)}>
                Selesai Membaca
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEST SEND SIMULATION */}
      {testSendModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs" onClick={() => setTestSendModalOpen(false)} />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Simulasi Kirim Notifikasi</h4>
                  <p className="text-xs text-slate-500">Uji pengiriman notifikasi instan ke email</p>
                </div>
              </div>
              <button
                onClick={() => setTestSendModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penerima</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Penerima</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Penerima</label>
                  <select
                    value={testRole}
                    onChange={(e) => setTestRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="employee">Peserta (Employee)</option>
                    <option value="trainer">Trainer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Notifikasi</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as EmailNotification['type'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="welcome_registration">Registrasi Akun Baru</option>
                    <option value="training_schedule_invite">Undangan Training</option>
                    <option value="schedule_reminder">Reminder Jadwal</option>
                    <option value="schedule_updated">Penyesuaian Jadwal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={testNote}
                  onChange={(e) => setTestNote(e.target.value)}
                  placeholder="Contoh: Sesi dimulai tepat pukul 08:30 di Ruang Lab K3."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setTestSendModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="emerald" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                  Kirim Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
