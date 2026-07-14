import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationApi from '../services/notificationApi';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  order?: { _id: string; trackingId: string };
  createdAt: string;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [preview, setPreview] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          notificationApi.getUnreadCount(),
          notificationApi.getNotifications(1, 5),
        ]);
        setUnreadCount(countRes.data.data.count);
        setPreview(listRes.data.data.notifications);
      } catch {
        // ignore
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setPreview((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <p className="text-sm font-semibold text-slate-100">Notifications</p>
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
            >
              View All
            </button>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto p-2">
            {preview.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications</p>
            ) : (
              preview.slice(0, 5).map((n) => (
                <div
                  key={n._id}
                  className={`rounded-2xl px-3 py-3 text-sm transition hover:bg-slate-800 ${
                    !n.isRead ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-200">{n.title}</p>
                      <p className="mt-0.5 truncate text-slate-400">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                        className="shrink-0 rounded-lg bg-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-600"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
