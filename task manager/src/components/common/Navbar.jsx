import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTasks } from '../../context/TaskContext';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({
  currentPage,
  onNavigate,
  onOpenNewTaskModal,
  onToggleSidebar,
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { stats } = useTasks();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'tasks':
        return 'My Deliverables & Tasks';
      case 'calendar':
        return 'Execution Calendar';
      case 'notifications':
        return 'Notification Center';
      case 'profile':
        return 'User Profile & Identity';
      case 'settings':
        return 'Workspace & System Settings';
      default:
        return 'Workspace';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'TF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {getPageTitle(currentPage)}
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>{currentUser?.workspace || 'TaskFlow Enterprise'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {stats.completed}/{stats.total} Completed ({stats.completionRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Task Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification preview menu */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsNotifDropdownOpen(false);
                      onNavigate('notifications');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.taskId) {
                          onNavigate('tasks');
                        }
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        !notif.read
                          ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setIsNotifDropdownOpen(false);
                      onNavigate('notifications');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Notification Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {getInitials(currentUser?.name)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Authorized Member'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentUser?.email || 'user@taskflow.io'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {currentUser?.role || 'Member'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>User Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      onNavigate('landing');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
