import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Admin Dashboard', to: '/admin-dashboard' },
  { label: 'Agent Dashboard', to: '/agent-dashboard' },
  { label: 'Customer Dashboard', to: '/customer-dashboard' },
  { label: 'Orders', to: '/orders' },
  { label: 'Tracking', to: '/tracking' },
];

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:flex-nowrap">
          <NavLink to="/" className="text-xl font-semibold tracking-tight text-slate-100 transition hover:text-white">
            Last Mile Delivery Tracker
          </NavLink>
          <nav className="flex flex-wrap gap-3 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Last Mile Delivery Tracker</p>
          <p>Scalable delivery operations, ready for growth.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
