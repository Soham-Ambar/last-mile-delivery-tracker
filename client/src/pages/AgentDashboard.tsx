import { useAuth } from '../context/AuthContext';

function AgentDashboard() {
  const { user } = useAuth();

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Agent dashboard</p>
        <h1 className="text-3xl font-semibold">Welcome Delivery Agent{user ? `, ${user.name}` : ''}</h1>
        <p className="text-slate-400">Access your assigned orders, today's deliveries, and profile information here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['Assigned Orders', "Today's Deliveries", 'Profile'].map((label) => (
          <div key={label} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-semibold">{label}</h2>
            <p className="mt-3 text-slate-400">Placeholder entry for {label.toLowerCase()}.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AgentDashboard;
