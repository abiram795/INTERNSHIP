import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ToastContainer } from './components/common/Toast';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useNotifications();

  // Navigation page state
  const [currentPage, setCurrentPage] = useState(() => {
    // Check url hash or default
    const hash = window.location.hash.replace('#', '');
    const validPages = [
      'landing',
      'login',
      'register',
      'dashboard',
      'tasks',
      'calendar',
      'notifications',
      'profile',
      'settings',
    ];
    if (validPages.includes(hash)) {
      return hash;
    }
    // Default to dashboard if already authenticated, otherwise landing
    return 'landing';
  });

  // Keep window hash synced for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentPage) {
        navigate(hash, false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  const navigate = (page, updateHash = true) => {
    // Protected pages guard
    const protectedPages = ['dashboard', 'tasks', 'calendar', 'notifications', 'profile', 'settings'];
    if (protectedPages.includes(page) && !isAuthenticated) {
      addToast('Please sign in to access your workspace dashboard.', 'warning');
      setCurrentPage('login');
      if (updateHash) window.location.hash = 'login';
      return;
    }

    setCurrentPage(page);
    if (updateHash) {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render standalone public pages
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  // Dashboard enclosed protected layout
  return (
    <DashboardLayout currentPage={currentPage} onNavigate={navigate}>
      {({ openCreateTaskModal, openEditTaskModal, promptDeleteTask }) => {
        switch (currentPage) {
          case 'dashboard':
            return (
              <DashboardPage
                onNavigate={navigate}
                openCreateTaskModal={openCreateTaskModal}
                openEditTaskModal={openEditTaskModal}
                promptDeleteTask={promptDeleteTask}
              />
            );
          case 'tasks':
            return (
              <MyTasksPage
                openCreateTaskModal={openCreateTaskModal}
                openEditTaskModal={openEditTaskModal}
                promptDeleteTask={promptDeleteTask}
              />
            );
          case 'calendar':
            return (
              <CalendarPage
                openCreateTaskModal={openCreateTaskModal}
                openEditTaskModal={openEditTaskModal}
              />
            );
          case 'notifications':
            return (
              <NotificationsPage
                onNavigate={navigate}
                openEditTaskModal={openEditTaskModal}
              />
            );
          case 'profile':
            return <ProfilePage />;
          case 'settings':
            return <SettingsPage />;
          default:
            return (
              <DashboardPage
                onNavigate={navigate}
                openCreateTaskModal={openCreateTaskModal}
                openEditTaskModal={openEditTaskModal}
                promptDeleteTask={promptDeleteTask}
              />
            );
        }
      }}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <TaskProvider>
            <AppContent />
            <ToastContainer />
          </TaskProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
