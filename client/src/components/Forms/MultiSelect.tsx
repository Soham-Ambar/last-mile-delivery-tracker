import { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ label, options, values, onChange, placeholder = 'Select options' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selectedLabels = values
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean)
    .map((o) => o!.label);

  return (
    <div ref={ref} className="relative">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
      >
        <span className={values.length === 0 ? 'text-slate-500' : ''}>
          {values.length === 0 ? placeholder : `${values.length} selected`}
        </span>
        <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {selectedLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedLabels.map((label) => (
            <span key={label} className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-300">
              {label}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No options available</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
