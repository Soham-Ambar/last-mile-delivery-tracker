import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import * as orderApi from '../../services/orderApi';
import * as agentApi from '../../services/agentApi';

interface Order {
  _id: string;
  trackingId: string;
  customer: { name: string; email: string };
  pickupArea: { name: string };
  deliveryArea: { name: string };
  parcelType: string;
  totalPrice: number;
  status: string;
  assignedAgent?: { _id: string; name: string; phone: string };
  createdAt: string;
}

interface Agent {
  _id: string;
  name: string;
  phone: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Pending: 'text-amber-400',
  Confirmed: 'text-cyan-400',
  Assigned: 'text-blue-400',
  PickedUp: 'text-indigo-400',
  InTransit: 'text-violet-400',
  Delivered: 'text-emerald-400',
  Cancelled: 'text-rose-400',
};

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'PickedUp', label: 'Picked Up' },
  { value: 'InTransit', label: 'In Transit' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

function isAssignable(status: string) {
  return !['Delivered', 'Cancelled', 'Failed'].includes(status);
}

function isFailable(status: string) {
  return ['Assigned', 'PickedUp', 'InTransit', 'OutForDelivery'].includes(status);
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignModal, setAssignModal] = useState<{ orderId: string; orderStatus: string } | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [failModal, setFailModal] = useState<{ orderId: string } | null>(null);
  const [failReason, setFailReason] = useState('');
  const [failing, setFailing] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAllOrders();
      setOrders(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrder(orderId, { status: newStatus });
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update order.');
    }
  };

  const openAssignModal = async (orderId: string, orderStatus: string) => {
    try {
      const res = await agentApi.getAgents();
      const available = res.data.data.filter((a: Agent) => a.status === 'Available');
      setAgents(available);
      setAssignModal({ orderId, orderStatus });
      setSelectedAgent('');
    } catch {
      setError('Unable to load agents.');
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedAgent) return;
    setAssigning(true);
    try {
      await orderApi.assignOrder(assignModal.orderId, selectedAgent);
      setAssignModal(null);
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to assign order.');
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoAssign = async (orderId: string) => {
    try {
      await orderApi.autoAssignOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to auto-assign order.');
    }
  };

  const handleUnassign = async (orderId: string) => {
    try {
      await orderApi.unassignOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to unassign order.');
    }
  };

  const handleFail = async () => {
    if (!failModal || !failReason.trim()) return;
    setFailing(true);
    try {
      await orderApi.markFailed(failModal.orderId, failReason.trim());
      setFailModal(null);
      setFailReason('');
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to mark order as failed.');
    } finally {
      setFailing(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: 'Tracking ID', accessor: 'trackingId' as const },
      { header: 'Customer', accessor: (row: Order) => row.customer?.name || '—' },
      { header: 'From', accessor: (row: Order) => row.pickupArea?.name || '—' },
      { header: 'To', accessor: (row: Order) => row.deliveryArea?.name || '—' },
      { header: 'Type', accessor: 'parcelType' as const },
      { header: 'Price', accessor: (row: Order) => `₹${row.totalPrice}` },
      {
        header: 'Status',
        accessor: (row: Order) => (
          <span className={`font-semibold ${statusColors[row.status] || ''}`}>{row.status}</span>
        ),
      },
      { header: 'Agent', accessor: (row: Order) => row.assignedAgent?.name || '—' },
      { header: 'Created', accessor: (row: Order) => new Date(row.createdAt).toLocaleDateString() },
      {
        header: 'Actions',
        accessor: (row: Order) => (
          <div className="flex flex-wrap gap-2">
            <select
              value={row.status}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {isAssignable(row.status) && !row.assignedAgent && (
              <>
                <button
                  onClick={() => openAssignModal(row._id, row.status)}
                  className="rounded-2xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                >
                  Assign
                </button>
                <button
                  onClick={() => handleAutoAssign(row._id)}
                  className="rounded-2xl bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-400 transition hover:bg-violet-500/20"
                >
                  Auto
                </button>
              </>
            )}
            {isAssignable(row.status) && row.assignedAgent && (
              <button
                onClick={() => handleUnassign(row._id)}
                className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
              >
                Unassign
              </button>
            )}
            {isFailable(row.status) && (
              <button
                onClick={() => setFailModal({ orderId: row._id })}
                className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                Mark Failed
              </button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Admin operations</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-100">All Orders</h2>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="Orders from customers will appear here." />
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <DataTable columns={columns} data={orders} />
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-100">Assign Agent</h3>
            <p className="mt-2 text-sm text-slate-400">Select an available agent to assign this order.</p>

            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200"
            >
              <option value="">-- Select agent --</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>{a.name} ({a.phone})</option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="rounded-2xl border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedAgent || assigning}
                className="rounded-2xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {failModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-100">Mark Order as Failed</h3>
            <p className="mt-2 text-sm text-slate-400">Enter the reason for delivery failure.</p>

            <textarea
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              placeholder="e.g. Receiver not available, wrong address..."
              className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-500"
              rows={3}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setFailModal(null); setFailReason(''); }}
                className="rounded-2xl border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleFail}
                disabled={!failReason.trim() || failing}
                className="rounded-2xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {failing ? 'Marking Failed...' : 'Mark Failed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
