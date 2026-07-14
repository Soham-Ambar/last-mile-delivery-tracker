import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Order Management',
    description: 'Create, track, and manage delivery orders from a single dashboard.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Delivery Tracking',
    description: 'Real-time tracking timeline with immutable status history for every order.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    title: 'Zone Management',
    description: 'Define delivery zones and areas with a flexible hierarchical structure.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Smart Pricing',
    description: 'Dynamic pricing engine with volumetric weight and B2B/B2C rate cards.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Agent Assignment',
    description: 'Intelligent auto-assignment based on area coverage and workload balancing.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Real-time metrics, revenue tracking, and performance charts with date filtering.',
  },
];

const stats = [
  { value: '1000+', label: 'Orders Processed' },
  { value: '99%', label: 'Successful Deliveries' },
  { value: '24/7', label: 'Real-time Tracking' },
  { value: 'Real-time', label: 'Analytics & Insights' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 shadow-2xl shadow-indigo-500/20 sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-200">Last Mile Delivery Platform</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Deliver smarter with a modern tracking platform.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-indigo-100/80">
            A complete delivery management system for placing orders, tracking shipments in real time, managing
            delivery agents, and analyzing operational performance — all from a single platform.
          </p>
          {!isAuthenticated && (
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-50 hover:shadow-xl active:scale-[0.97]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="rounded-lg border border-indigo-300/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.97]"
              >
                Register
              </button>
            </div>
          )}
          {isAuthenticated && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-50 hover:shadow-xl active:scale-[0.97]"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-400">Platform Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to manage deliveries</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            From order creation to final delivery, our platform provides complete visibility and control over your delivery operations.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 sm:p-12">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-400">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">From order to delivery in four steps</h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Customer Places Order', desc: 'Customer creates a delivery order and gets an instant price estimate.' },
              { step: '02', title: 'Admin Reviews Order', desc: 'Admin reviews the order and assigns the best available agent.' },
              { step: '03', title: 'Agent Delivers Package', desc: 'Agent picks up and delivers the package to the destination.' },
              { step: '04', title: 'Customer Tracks Delivery', desc: 'Customer follows the delivery journey with live status updates.' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-indigo-500 to-slate-700 lg:block" />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 ring-2 ring-indigo-500/20">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center transition hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <p className="text-3xl font-bold text-indigo-400">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 p-8 shadow-2xl shadow-indigo-500/20 sm:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to experience smarter last-mile delivery?</h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100/80">
              Join the platform and start managing your deliveries with ease.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-50 hover:shadow-xl active:scale-[0.97]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="rounded-lg border border-indigo-300/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.97]"
              >
                Register
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
