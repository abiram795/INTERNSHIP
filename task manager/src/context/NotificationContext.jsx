import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_NOTIFICATIONS } from '../data/initialData';

const NotificationContext = createContext();
const NOTIFICATIONS_STORAGE_KEY = 'taskflow_notifications';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Ephemeral toast messages
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = ({ title, message, type = 'info', taskId = null }) => {
    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type, // 'info' | 'success' | 'warning' | 'error'
      timestamp: 'Just now',
      read: false,
      taskId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addToast(title + ': ' + message, type);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('All notifications cleared', 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

