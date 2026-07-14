import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import TrackingTimeline from '../../components/TrackingTimeline';
import * as orderApi from '../../services/orderApi';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Confirmed: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Assigned: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PickedUp: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  InTransit: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Failed: 'bg-red-500/20 text-red-300 border-red-500/30',
  Delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const reloadOrderAndTracking = async () => {
    if (!id) return;
    const [orderRes, trackingRes] = await Promise.all([
      orderApi.getOrder(id),
      orderApi.getTrackingTimeline(id),
    ]);
    setOrder(orderRes.data.data);
    setTracking(trackingRes.data.data);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      orderApi.getOrder(id),
      orderApi.getTrackingTimeline(id),
    ]).then(([orderRes, trackingRes]) => {
      setOrder(orderRes.data.data);
      setTracking(trackingRes.data.data);
      setLoading(false);
    }).catch((err) => {
      setError(err?.response?.data?.message || 'Unable to load order.');
      setLoading(false);
    });
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(id);
      const trackingRes = await orderApi.getTrackingTimeline(id);
      const orderRes = await orderApi.getOrder(id);
      setOrder(orderRes.data.data);
      setTracking(trackingRes.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!id || !rescheduleDate) return;
    setRescheduling(true);
    try {
      await orderApi.rescheduleOrder(id, rescheduleDate);
      await reloadOrderAndTracking();
      setRescheduleDate('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to reschedule order.');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>;
  if (!order) return <div className="text-slate-400">Order not found.</div>;

  const canCancel = ['Pending', 'Confirmed'].includes(order.status);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Order details</p>
          <h1 className="mt-2 text-3xl font-semibold">{order.trackingId}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/customer/orders">
            <PrimaryButton>Back to Orders</PrimaryButton>
          </Link>
        </div>
      </div>

      <div className={`inline-block rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColors[order.status] || ''}`}>
        {order.status}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Pickup</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Name:</span> {order.pickupName}</p>
            <p><span className="text-slate-500">Phone:</span> {order.pickupPhone}</p>
            <p><span className="text-slate-500">Address:</span> {order.pickupAddress}</p>
            <p><span className="text-slate-500">Area:</span> {order.pickupArea?.name || '—'}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Delivery</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Name:</span> {order.receiverName}</p>
            <p><span className="text-slate-500">Phone:</span> {order.receiverPhone}</p>
            <p><span className="text-slate-500">Address:</span> {order.receiverAddress}</p>
            <p><span className="text-slate-500">Area:</span> {order.deliveryArea?.name || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Parcel</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Type:</span> {order.parcelType}</p>
            <p><span className="text-slate-500">Weight:</span> {order.parcelWeight} kg</p>
            <p><span className="text-slate-500">Payment:</span> {order.paymentMode}</p>
            {order.notes && <p><span className="text-slate-500">Notes:</span> {order.notes}</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Price Breakdown</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span className="text-slate-500">Base Rate</span><span>₹{order.priceBreakdown?.baseRate || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Weight Charge</span><span>₹{order.priceBreakdown?.weightCharge || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">COD Charge</span><span>₹{order.priceBreakdown?.codCharge || 0}</span></div>
            {order.priceBreakdown?.minimumChargeApplied && <div className="flex justify-between"><span className="text-slate-500">Minimum Applied</span><span className="text-amber-400">Yes</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Delivery Days</span><span>{order.priceBreakdown?.estimatedDeliveryDays || '-'}</span></div>
            <div className="flex justify-between border-t border-slate-700 pt-2 text-lg font-semibold">
              <span className="text-slate-100">Total</span>
              <span className="text-emerald-400">₹{order.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <TrackingTimeline events={tracking} />

        <div className="space-y-4">
          {order.status === 'Failed' && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Delivery Failed</h2>
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Reason:</span> {order.failedReason || 'N/A'}</p>
                <p><span className="text-slate-500">Attempt:</span> {order.deliveryAttempt || 1}</p>
                <p><span className="text-slate-500">Reschedule Count:</span> {order.rescheduleCount || 0}</p>
              </div>
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-400">Reschedule Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200"
                />
                <PrimaryButton onClick={handleReschedule} disabled={!rescheduleDate || rescheduling}>
                  {rescheduling ? 'Rescheduling...' : 'Reschedule Delivery'}
                </PrimaryButton>
              </div>
            </div>
          )}

          {canCancel && (
            <div className="flex justify-end">
              <PrimaryButton onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
