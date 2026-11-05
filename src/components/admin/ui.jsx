export const inputClass =
  "w-full rounded-xl border border-rose-900/15 bg-white/70 px-3.5 py-2.5 text-sm text-cream placeholder:text-rose-900/30 outline-none transition focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/15";

export const labelClass =
  "mb-1.5 block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-cream/45";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-700 via-rose-500 to-pink-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-700/20 transition hover:shadow-rose-600/40 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-rose-900/15 bg-white/60 px-4 py-2 text-sm text-cream/80 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-rose-600/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-500/20 disabled:opacity-50";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[0.65rem] text-cream/35">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input {...props} className={`${inputClass} ${className}`} />;
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`${inputClass} resize-y leading-relaxed ${className}`}
    />
  );
}

export function Panel({ title, description, children, actions }) {
  return (
    <section className="rounded-3xl border border-rose-900/10 bg-white/70 p-5 shadow-lg shadow-rose-900/5 backdrop-blur md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-cream">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-cream/45">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function StatusMessage({ status }) {
  if (!status) return null;

  const styles =
    status.type === "success"
      ? "border-emerald-600/20 bg-emerald-50 text-emerald-800"
      : status.type === "info"
        ? "border-sky-600/20 bg-sky-50 text-sky-800"
        : "border-rose-600/20 bg-rose-50 text-rose-800";

  return (
    <p className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs ${styles}`}>
      {status.message}
    </p>
  );
}
