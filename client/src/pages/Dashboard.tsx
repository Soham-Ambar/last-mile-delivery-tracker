import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Dashboard</p>
        <h1 className="text-3xl font-semibold">Hello{user ? `, ${user.name}` : ''}</h1>
        <p className="text-slate-400">This shared dashboard surface gives quick access to your role-specific workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Quick access</h2>
          <p className="mt-3 text-slate-400">Use the navigation bar to reach your role dashboard or explore available operations.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-3 text-slate-400">Your authenticated profile is stored securely and refreshed automatically on page reload.</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
