import React, { useState, useEffect } from 'react';
import { store } from './lib/storage';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrganizationView } from './components/organization/OrganizationView';
import { CompetenciesView } from './components/competencies/CompetenciesView';
import { CompetencyMatrixView } from './components/matrix/CompetencyMatrixView';
import { TrainingCatalogView } from './components/training/TrainingCatalogView';
import { AssessmentBuilderView } from './components/assessment/AssessmentBuilderView';
import { MyLearningView } from './components/mylearning/MyLearningView';
import { ActualAssessmentView } from './components/assessment/ActualAssessmentView';
import { GapAnalysisView } from './components/gap/GapAnalysisView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ParticipantMonitoringView } from './components/monitoring/ParticipantMonitoringView';
import { TrainingCalendarView } from './components/training/TrainingCalendarView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [, setRenderTrigger] = useState(0);

  // Subscribe to storage changes so UI stays 100% reactive
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setRenderTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = store.getCurrentUser();
  const isLoggedIn = store.isLoggedIn();

  // If currentTab is restricted for this role or checklist permissions, auto-redirect
  useEffect(() => {
    if (!isLoggedIn) return;

    if (currentTab === 'organization' && !store.hasPermission('can_manage_org')) {
      setCurrentTab('dashboard');
    } else if (currentTab === 'competencies' && !store.hasPermission('can_manage_competencies')) {
      setCurrentTab('dashboard');
    } else if (currentTab === 'matrix' && !store.hasPermission('can_manage_matrix')) {
      setCurrentTab('dashboard');
    } else if (currentTab === 'settings' && currentUser.role !== 'admin') {
      setCurrentTab('dashboard');
    }
  }, [currentUser, currentTab, isLoggedIn]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeMenu={currentTab}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        <div className="flex-1 flex">
          {/* Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isOpenMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 lg:pl-64 min-w-0 transition-all">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
              {currentTab === 'dashboard' && (
                <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
              )}
              {currentTab === 'participant_monitoring' && (
                <ParticipantMonitoringView />
              )}
              {currentTab === 'organization' && (
                <OrganizationView onNavigateToMatrix={() => setCurrentTab('matrix')} />
              )}
              {currentTab === 'competencies' && <CompetenciesView />}
              {currentTab === 'matrix' && (
                <CompetencyMatrixView onNavigateToOrg={() => setCurrentTab('organization')} />
              )}
              {currentTab === 'training_calendar' && (
                <TrainingCalendarView onNavigateToCatalog={() => setCurrentTab('trainings')} />
              )}
              {currentTab === 'trainings' && (
                <TrainingCatalogView onNavigateToQuiz={() => setCurrentTab('assessments_builder')} />
              )}
              {currentTab === 'assessments_builder' && <AssessmentBuilderView />}
              {currentTab === 'my_learning' && <MyLearningView />}
              {currentTab === 'actual_assessments' && <ActualAssessmentView />}
              {currentTab === 'gap_analysis' && <GapAnalysisView />}
              {currentTab === 'reports' && <ReportsView />}
              {currentTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>

        {/* Auth / Login Modal */}
        <AuthModal
          isOpen={authModalOpen || !isLoggedIn}
          onClose={() => setAuthModalOpen(false)}
          canDismiss={isLoggedIn}
        />
      </div>
    </ToastProvider>
  );
}
