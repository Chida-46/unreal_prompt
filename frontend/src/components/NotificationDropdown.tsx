import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 8).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                    }}
                    className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                      !n.isRead ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-semibold ${!n.isRead ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{n.message}</p>
                    {n.linkUrl && (
                      <Link
                        to={n.linkUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1.5"
                      >
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
