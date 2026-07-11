function Home() {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Production-ready foundation</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Deliver smarter with a modern tracking platform.</h1>
        <p className="max-w-2xl text-lg text-slate-400">
          This starter shell provides a clean architecture for managing delivery operations, routes, and customer visibility.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <a href="/orders" className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400">
          View Orders
        </a>
        <a href="/tracking" className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-800">
          Track Deliveries
        </a>
      </div>
    </section>
  );
}

export default Home;
