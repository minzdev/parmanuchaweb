import { useContent } from "../lib/content";
import { monthLabel } from "../lib/months";
import { Heart, Sparkle } from "./icons";

export default function MonthFilter() {
  const {
    content,
    months,
    selectedMonthId,
    setSelectedMonthId,
  } = useContent();

  if (!months.length) return null;

  const handleSelect = (monthId) => {
    setSelectedMonthId(monthId);
    document
      .getElementById("home")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="months" className="relative px-6 pb-4 pt-2 md:pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[1.75rem] border border-dashed border-rose-900/15 bg-white/60 p-4 shadow-[0_14px_40px_-24px_rgba(142,14,53,0.35)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 text-white shadow-lg shadow-rose-700/20">
                <Sparkle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-rose-700/60">
                  Pilih bulan kenangan
                </p>
                <p className="mt-0.5 font-serif text-lg leading-tight text-cream">
                  {content.hero.title}
                  {selectedMonthId ? ` · ${monthLabel(selectedMonthId)}` : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-end md:pb-0">
              {months.map((month) => {
                const active = month.monthId === selectedMonthId;

                return (
                  <button
                    key={month.monthId}
                    type="button"
                    onClick={() => handleSelect(month.monthId)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-700/20"
                        : "border-rose-900/15 bg-white/70 text-rose-800/70 hover:border-rose-400/40 hover:bg-white"
                    }`}
                  >
                    <Heart
                      className={`h-3 w-3 ${
                        active ? "text-pink-200" : "text-rose-400"
                      }`}
                    />
                    {month.label || monthLabel(month.monthId)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
