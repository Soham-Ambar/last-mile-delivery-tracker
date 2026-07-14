interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TextInput({ label, className = '', ...props }: TextInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        {...props}
        className={`mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${className}`}
      />
    </label>
  );
}
