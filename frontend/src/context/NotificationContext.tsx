import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useRole } from './RoleContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  refreshNotifications: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useRole();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifications = () => {
    if (!currentUser) return;
    api.getNotifications(currentUser.id)
      .then(items => setNotifications(items))
      .catch(() => {});
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 12000); // Poll notifications periodically
    return () => clearInterval(interval);
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    await api.markAllNotificationsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
