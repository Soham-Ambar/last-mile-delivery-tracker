interface TrackingEvent {
  _id: string;
  status: string;
  message: string;
  location?: string;
  updatedBy?: { name: string };
  createdAt: string;
}

const stepOrder = [
  'Pending', 'Confirmed', 'Assigned', 'PickedUp',
  'InTransit', 'OutForDelivery', 'Delivered',
];

const statusColors: Record<string, string> = {
  Pending: 'border-amber-500 bg-amber-500',
  Confirmed: 'border-cyan-500 bg-cyan-500',
  Assigned: 'border-blue-500 bg-blue-500',
  PickedUp: 'border-indigo-500 bg-indigo-500',
  InTransit: 'border-violet-500 bg-violet-500',
  OutForDelivery: 'border-orange-500 bg-orange-500',
  Delivered: 'border-emerald-500 bg-emerald-500',
  Cancelled: 'border-rose-500 bg-rose-500',
};

const statusLabels: Record<string, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Assigned: 'Assigned',
  PickedUp: 'Picked Up',
  InTransit: 'In Transit',
  OutForDelivery: 'Out for Delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

function getCurrentEventIndex(events: TrackingEvent[]) {
  const last = events[events.length - 1];
  const idx = stepOrder.indexOf(last?.status);
  return idx === -1 ? stepOrder.length : idx;
}

export default function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  const currentIdx = getCurrentEventIndex(events);
  const hasCancelled = events.some((e) => e.status === 'Cancelled');
  const cancelledEvent = events.find((e) => e.status === 'Cancelled');

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-100">Tracking Timeline</h2>

      {events.length === 0 && (
        <p className="text-sm text-slate-500">No tracking events yet.</p>
      )}

      {!hasCancelled && (
        <div className="relative space-y-0">
          {stepOrder.map((status, idx) => {
            const event = events.find((e) => e.status === status);
            const done = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      done
                        ? `${statusColors[status] || 'border-slate-600 bg-slate-600'}`
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  />
                  {idx < stepOrder.length - 1 && (
                    <div className={`mt-0 w-0.5 grow ${done ? 'bg-cyan-500/40' : 'bg-slate-800'}`} />
                  )}
                </div>
                <div className={`pb-8 ${!done ? 'opacity-40' : ''}`}>
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {statusLabels[status]}
                  </p>
                  {event && (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-slate-500">
                        {new Date(event.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">{event.message}</p>
                      {event.location && <p className="text-xs text-slate-500">{event.location}</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasCancelled && cancelledEvent && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-300">Cancelled</p>
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-slate-500">
                {new Date(cancelledEvent.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-slate-400">{cancelledEvent.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
