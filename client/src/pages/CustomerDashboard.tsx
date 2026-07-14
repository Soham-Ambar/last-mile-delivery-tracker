import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Customer dashboard</p>
        <h1 className="text-3xl font-semibold">Welcome Customer{user ? `, ${user.name}` : ''}</h1>
        <p className="text-slate-400">Place delivery orders and track your shipments from this dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Create Order</h2>
          <p className="mt-3 text-slate-400">Send a parcel to any area with instant price estimation.</p>
          <Link to="/customer/create-order" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            New Order
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">My Orders</h2>
          <p className="mt-3 text-slate-400">View all your past and current delivery orders.</p>
          <Link to="/customer/orders" className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            View Orders
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 opacity-70">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-3 text-slate-400">Manage your account and preferences.</p>
        </div>
      </div>
    </section>
  );
}

export default CustomerDashboard;
