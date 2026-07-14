interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">{title}</p>
      <p className="mt-4 text-slate-400">{description}</p>
    </div>
  );
}
