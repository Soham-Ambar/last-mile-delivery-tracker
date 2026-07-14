import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const menuItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Analytics', to: '/admin/analytics' },
  { label: 'Zone Management', to: '/admin/zones' },
  { label: 'Area Management', to: '/admin/areas' },
  { label: 'Rate Cards', to: '/admin/rate-cards' },
  { label: 'Agent Management', to: '/admin/agents' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Create Order', to: '/admin/create-order' },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-900 p-6 lg:w-72 lg:border-r lg:border-b-0">
            <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Admin</p>
              <h1 className="mt-2 text-2xl font-semibold">Control Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link to="/" className="text-sm text-slate-400 hover:text-slate-100">
                View Site
              </Link>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-950 text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => logout()}
            className="mt-10 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </aside>

        <div className="flex-1 bg-slate-950 p-6 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Admin Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold">Operational overview</h2>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
