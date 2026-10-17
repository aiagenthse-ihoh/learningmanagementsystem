import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { UserRole } from '../../types/lcms';
import {
  Shield,
  Award,
  Users,
  BookOpen,
  ChevronDown,
  Check,
  LogOut,
  LogIn,
  UserCheck,
  Bell,
  Mail,
} from 'lucide-react';
import { NotificationModal } from '../notifications/NotificationModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeMenu: string;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAuthModal }) => {
  const currentUser = store.getCurrentUser();
  const allUsers = store.getUsers();
  const isLoggedIn = store.isLoggedIn();
  const unreadCount = store.getUnreadNotificationCount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
    admin: {
      label: 'Admin / HR-L&D',
      color: 'bg-teal-700 text-teal-100',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    trainer: {
      label: 'Trainer',
      color: 'bg-indigo-700 text-indigo-100',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    supervisor: {
      label: 'Supervisor / Assessor',
      color: 'bg-emerald-700 text-emerald-100',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    employee: {
      label: 'Peserta / Karyawan',
      color: 'bg-sky-700 text-sky-100',
      icon: <Users className="w-3.5 h-3.5" />,
    },
  };

  const currentRoleConfig = roleLabels[currentUser.role] || roleLabels.employee;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">LCMS Enterprise</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-900/80 text-teal-300 rounded border border-teal-700/60">
                  MVP v1.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                Learning & Competency Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Auth Profile & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification / Email Hub Button */}
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title="Pusat Email & Notifikasi Sistem"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold bg-teal-500 text-slate-950 flex items-center justify-center ring-2 ring-slate-900 shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Fast Switch Role & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${currentRoleConfig.color}`}>
                {currentRoleConfig.icon}
                {currentRoleConfig.label}
              </span>
              <span className="hidden md:inline text-slate-300 font-normal">| {currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                  {/* Current User Info */}
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Akun Sedang Masuk
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${currentRoleConfig.color}`}>
                        {currentRoleConfig.label}
                      </span>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                      >
                        Ganti / Login Baru
                      </button>
                    </div>
                  </div>

                  {/* Switch user list */}
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ganti Akun Pengguna Terdaftar
                    </p>
                  </div>
                  <div className="py-1 max-h-56 overflow-y-auto divide-y divide-slate-800/40">
                    {allUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      const roleMeta = roleLabels[user.role] || roleLabels.employee;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            store.setCurrentUser(user);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-800/60' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-teal-400">
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</span>
                                <span className={`text-[9px] px-1.5 rounded ${roleMeta.color}`}>
                                  {roleMeta.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout Action */}
                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        store.logout();
                        setDropdownOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Email & Notification Center Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </header>
  );
};
