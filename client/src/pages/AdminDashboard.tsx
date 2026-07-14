import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Admin dashboard</p>
        <h1 className="text-3xl font-semibold">Welcome Admin{user ? `, ${user.name}` : ''}</h1>
        <p className="text-slate-400">Use the admin workspace to review operations and manage zones, areas, rates, and orders.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Manage Zones</h2>
          <p className="mt-3 text-slate-400">Create, update, and deactivate delivery zones for operational coverage.</p>
          <Link to="/admin/zones" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Go to Zone Management
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Manage Areas</h2>
          <p className="mt-3 text-slate-400">Create, update, and deactivate delivery areas within zones.</p>
          <a href="/admin/areas" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Go to Area Management
          </a>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Manage Rate Cards</h2>
          <p className="mt-3 text-slate-400">Define delivery pricing rules between zones (base rate, weight charges, COD).</p>
          <a href="/admin/rate-cards" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Go to Rate Cards
          </a>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Manage Agents</h2>
          <p className="mt-3 text-slate-400">Manage delivery agents, assign areas, and monitor availability.</p>
          <a href="/admin/agents" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Go to Agent Management
          </a>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="mt-3 text-slate-400">View and manage all customer delivery orders.</p>
          <a href="/admin/orders" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            View All Orders
          </a>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
