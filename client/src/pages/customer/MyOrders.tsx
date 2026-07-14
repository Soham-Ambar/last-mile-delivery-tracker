import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import * as orderApi from '../../services/orderApi';

interface Order {
  _id: string;
  trackingId: string;
  pickupArea: { name: string };
  deliveryArea: { name: string };
  parcelType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
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

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
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

  const columns = useMemo(
    () => [
      { header: 'Tracking ID', accessor: 'trackingId' as const },
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
      { header: 'Date', accessor: (row: Order) => new Date(row.createdAt).toLocaleDateString() },
      {
        header: '',
        accessor: (row: Order) => (
          <Link
            to={`/customer/orders/${row._id}`}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            View
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Customer portal</p>
          <h1 className="mt-2 text-3xl font-semibold">My Orders</h1>
        </div>
        <Link to="/customer/create-order">
          <PrimaryButton>New Order</PrimaryButton>
        </Link>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Place your first delivery order to get started." />
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <DataTable columns={columns} data={orders} />
        </div>
      )}
    </section>
  );
}
