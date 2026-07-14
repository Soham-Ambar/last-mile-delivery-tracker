import { useEffect, useState, useCallback } from 'react';
import LoadingSpinner from '../components/Spinner/LoadingSpinner';
import EmptyState from '../components/EmptyState/EmptyState';
import * as notificationApi from '../services/notificationApi';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  order?: { _id: string; trackingId: string; status: string };
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  OrderCreated: 'text-emerald-400',
  OrderAssigned: 'text-blue-400',
  OrderStatusChanged: 'text-violet-400',
  OrderCancelled: 'text-rose-400',
  OrderFailed: 'text-red-400',
  OrderRescheduled: 'text-amber-400',
  OrderDelivered: 'text-emerald-400',
  System: 'text-cyan-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications(p);
      const d = res.data.data;
      setNotifications(d.notifications);
      setTotalPages(d.totalPages);
      setPage(d.page);
    } catch {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Notifications</p>
          <h1 className="mt-2 text-3xl font-semibold">All Notifications</h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-2xl bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
          >
            Mark All Read
          </button>
        )}
      </div>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You have no notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-3xl border p-5 transition ${
                n.isRead
                  ? 'border-slate-800 bg-slate-950'
                  : 'border-cyan-500/20 bg-cyan-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${TYPE_COLORS[n.type] || 'text-slate-300'}`}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    {n.order && (
                      <span>Order: {n.order.trackingId} ({n.order.status})</span>
                    )}
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
                className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
