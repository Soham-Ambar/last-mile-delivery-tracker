import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
  type PieLabelRenderProps,
} from 'recharts';
import * as analyticsApi from '../../services/analyticsApi';

interface DashboardData {
  overview: {
    totalOrders: number; totalCustomers: number; totalAgents: number;
    activeAgents: number; inactiveAgents: number;
    pendingOrders: number; assignedOrders: number; inTransitOrders: number;
    deliveredOrders: number; cancelledOrders: number; failedOrders: number;
  };
  revenue: {
    todayRevenue: number; weeklyRevenue: number; monthlyRevenue: number; totalRevenue: number;
  };
  delivery: {
    averageDeliveryTime: number; successfulDeliveryRate: number;
    failedDeliveryRate: number; averageAttemptsPerOrder: number;
  };
  orders: { dailyOrders: number; weeklyOrders: number; monthlyOrders: number };
  topZones: { pickupZones: { name: string; count: number }[]; deliveryZones: { name: string; count: number }[] };
  topAgents: { _id: string; name: string; email: string; status: string; completedOrders: number; failedOrders: number; totalOrders: number }[];
  charts: {
    ordersPerDay: { date: string; count: number }[];
    revenuePerDay: { date: string; revenue: number }[];
    statusDistribution: { status: string; count: number }[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Assigned: '#8b5cf6',
  PickedUp: '#06b6d4', InTransit: '#0ea5e9', OutForDelivery: '#14b8a6',
  Failed: '#ef4444', Delivered: '#22c55e', Cancelled: '#6b7280',
};

const rangeOptions = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: 'All Time', value: 'all' },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: any = { range };
    if (range === 'custom') {
      if (customStart) params.startDate = customStart;
      if (customEnd) params.endDate = customEnd;
    }
    analyticsApi.getDashboard(params)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="py-20 text-center text-slate-500">Failed to load analytics.</p>;
  }

  const { overview, revenue, delivery, topZones, topAgents, charts } = data;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {rangeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRange(opt.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              range === opt.value
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRange('custom')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            range === 'custom'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Custom
        </button>
        {range === 'custom' && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            />
          </>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={overview.totalOrders} />
        <StatCard label="Total Revenue" value={`$${revenue.totalRevenue.toFixed(2)}`} />
        <StatCard label="Customers" value={overview.totalCustomers} />
        <StatCard label="Agents" value={`${overview.activeAgents} / ${overview.totalAgents}`} sub={`${overview.inactiveAgents} inactive`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={overview.pendingOrders} />
        <StatCard label="Delivered" value={overview.deliveredOrders} />
        <StatCard label="Failed" value={overview.failedOrders} />
        <StatCard label="Cancelled" value={overview.cancelledOrders} />
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today Revenue" value={`$${revenue.todayRevenue.toFixed(2)}`} />
        <StatCard label="Weekly Revenue" value={`$${revenue.weeklyRevenue.toFixed(2)}`} />
        <StatCard label="Monthly Revenue" value={`$${revenue.monthlyRevenue.toFixed(2)}`} />
        <StatCard label="Avg Delivery Time" value={`${delivery.averageDeliveryTime}h`} />
      </div>

      {/* Delivery Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Success Rate" value={`${delivery.successfulDeliveryRate}%`} />
        <StatCard label="Failed Rate" value={`${delivery.failedDeliveryRate}%`} />
        <StatCard label="Avg Attempts" value={delivery.averageAttemptsPerOrder} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders per day line */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Orders per Day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.ordersPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue per day area */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Revenue per Day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.revenuePerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Bars */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Distribution Pie */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.statusDistribution.filter((s) => s.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
              >
                {charts.statusDistribution.filter((s) => s.count > 0).map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Agents Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Top Agents</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topAgents.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
              />
              <Bar dataKey="completedOrders" fill="#22d3ee" radius={[0, 4, 4, 0]} name="Completed" />
              <Bar dataKey="failedOrders" fill="#ef4444" radius={[0, 4, 4, 0]} name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pickup Zones */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Top Pickup Zones</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topZones.pickupZones} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
              />
              <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Top Performing Agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Total Orders</th>
                <th className="px-3 py-3">Completed</th>
                <th className="px-3 py-3">Failed</th>
              </tr>
            </thead>
            <tbody>
              {topAgents.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">No agents found.</td></tr>
              )}
              {topAgents.map((agent) => (
                <tr key={agent._id} className="border-b border-slate-800/50">
                  <td className="px-3 py-3 font-medium text-slate-200">{agent.name}</td>
                  <td className="px-3 py-3 text-slate-400">{agent.email}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      agent.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                      agent.status === 'Busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{agent.totalOrders}</td>
                  <td className="px-3 py-3 text-emerald-400">{agent.completedOrders}</td>
                  <td className="px-3 py-3 text-rose-400">{agent.failedOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
