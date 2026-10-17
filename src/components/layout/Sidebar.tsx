import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Award,
  Grid3X3,
  BookOpen,
  FileQuestion,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { store } from '../../lib/storage';

export type NavTab =
  | 'dashboard'
  | 'participant_monitoring'
  | 'organization'
  | 'competencies'
  | 'matrix'
  | 'training_calendar'
  | 'trainings'
  | 'assessments_builder'
  | 'my_learning'
  | 'actual_assessments'
  | 'gap_analysis'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const user = store.getCurrentUser();
  const role = user.role;

  // Check granular permissions
  const canOrg = store.hasPermission('can_manage_org');
  const canComp = store.hasPermission('can_manage_competencies');
  const canMatrix = store.hasPermission('can_manage_matrix');
  const canEditTrn = store.hasPermission('can_edit_training');
  const canEditQuiz = store.hasPermission('can_edit_questions');
  const canLearn = store.hasPermission('can_learn');
  const canAssess = store.hasPermission('can_assess_team');
  const canGap = store.hasPermission('can_manage_gap');
  const canReports = store.hasPermission('can_view_reports');

  // Navigation definition tailored to PRD 4 & 5 and checklist permissions
  const navSections = [
    {
      group: 'UTAMA',
      items: [
        {
          id: 'dashboard' as NavTab,
          label: 'Dashboard',
          icon: LayoutDashboard,
          visible: true,
        },
        {
          id: 'participant_monitoring' as NavTab,
          label: 'Pantau Peserta & Izin',
          icon: UserCheck,
          badge: 'Pantau',
          visible: role === 'admin' || role === 'trainer',
        },
      ],
    },
    {
      group: 'KOMPETENSI & STRUKTUR',
      items: [
        {
          id: 'organization' as NavTab,
          label: 'Karyawan & Organisasi',
          icon: Building2,
          visible: canOrg,
        },
        {
          id: 'competencies' as NavTab,
          label: 'Master Kompetensi & Level',
          icon: Award,
          visible: canComp,
        },
        {
          id: 'matrix' as NavTab,
          label: 'Matriks Kompetensi (Inti)',
          icon: Grid3X3,
          badge: 'Checklist',
          visible: canMatrix,
        },
      ],
    },
    {
      group: 'LEARNING & ASSESSMENT',
      items: [
        {
          id: 'training_calendar' as NavTab,
          label: 'Kalender & Jadwal Training',
          icon: Calendar,
          badge: 'Jadwal',
          visible: true,
        },
        {
          id: 'my_learning' as NavTab,
          label: 'My Learning (Peserta)',
          icon: GraduationCap,
          visible: canLearn,
        },
        {
          id: 'trainings' as NavTab,
          label: 'Katalog Training',
          icon: BookOpen,
          visible: canEditTrn || role === 'admin' || role === 'trainer',
        },
        {
          id: 'assessments_builder' as NavTab,
          label: 'Bank Soal & Quiz',
          icon: FileQuestion,
          visible: canEditQuiz || role === 'admin' || role === 'trainer',
        },
      ],
    },
    {
      group: 'EVALUASI & TINDAK LANJUT',
      items: [
        {
          id: 'actual_assessments' as NavTab,
          label: 'Penilaian Aktual Tim',
          icon: ClipboardCheck,
          visible: canAssess || role === 'supervisor',
        },
        {
          id: 'gap_analysis' as NavTab,
          label: 'Gap & Development Plan',
          icon: TrendingUp,
          visible: canGap || role === 'supervisor' || role === 'employee',
        },
        {
          id: 'reports' as NavTab,
          label: 'Laporan & Ekspor CSV',
          icon: FileSpreadsheet,
          visible: canReports,
        },
      ],
    },
    {
      group: 'SISTEM',
      items: [
        {
          id: 'settings' as NavTab,
          label: 'Pengaturan & DB Schema',
          icon: Settings,
          visible: role === 'admin',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2.5">
                  {section.group}
                </h4>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-teal-300 border border-teal-700/50'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
