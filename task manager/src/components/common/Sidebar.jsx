import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const { stats } = useTasks();
  const { unreadCount } = useNotifications();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badge: stats.pending + stats.inProgress > 0 ? `${stats.pending + stats.inProgress}` : null,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: stats.dueTodayCount > 0 ? `${stats.dueTodayCount} today` : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : null,
      badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'TF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                TaskFlow <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block -mt-0.5">
                Enterprise Suite
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Workspace Switcher Card */}
      {!isCollapsed && (
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.workspace || 'Main Organization'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">
                Premium Plan • Local Mode
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage Engine Status Banner */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" /> Local Storage
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Synced
            </span>
          </div>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="w-1/6 h-full bg-emerald-500 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Offline persistence enabled
          </p>
        </div>
      )}

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.name || 'Authorized Member'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.role || 'Lead'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed top-0 bottom-0 z-30 flex flex-col h-screen" style={{ width: isCollapsed ? '5rem' : '16rem' }}>
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

