import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Trash2,
  Check,
  Filter,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

export const NotificationsPage = ({ onNavigate, openEditTaskModal }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const filteredNotifs =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery reminders, sprint status changes, and workspace activity
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-indigo-500" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Activity ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'unread'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            All caught up!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'unread'
              ? 'You have reviewed all unread notifications.'
              : 'No notifications recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                !notif.read
                  ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-sm ring-1 ring-indigo-500/10'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {/* Icon */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {/* Sub Action Bar */}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  {notif.taskId && (
                    <button
                      onClick={() => onNavigate('tasks')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Inspect Deliverable</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="text-xs text-slate-400 hover:text-rose-500 ml-auto p-1 rounded transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearAllNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to remove all notification records? This action cannot be reversed."
        confirmText="Clear All"
      />
    </div>
  );
};

