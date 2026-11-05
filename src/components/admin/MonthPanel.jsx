import { useState } from "react";
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useContent } from "../../lib/content";
import {
  currentMonthId,
  monthLabel,
  monthScriptFor,
  monthTitleFor,
  nextMonthId,
} from "../../lib/months";
import {
  Field,
  Panel,
  StatusMessage,
  TextInput,
  dangerButtonClass,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";
import { Heart, Sparkle } from "../icons";

function suggestMonth(months) {
  return months.length ? nextMonthId(months[0].monthId) : currentMonthId();
}

export default function MonthPanel() {
  const {
    content,
    months,
    selectedMonthId,
    setSelectedMonthId,
    moments,
  } = useContent();
  const [formMonth, setFormMonth] = useState(() => suggestMonth(months));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const previewTitle = monthTitleFor(content.startDate, formMonth);
  const previewLabel = monthLabel(formMonth);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!/^\d{4}-\d{2}$/.test(formMonth)) {
      setStatus({
        type: "error",
        message: "Pilih bulan yang valid terlebih dahulu.",
      });
      return;
    }

    if (months.some((month) => month.monthId === formMonth)) {
      setStatus({
        type: "error",
        message: "Edisi bulan itu sudah ada. Pilih bulan lain.",
      });
      return;
    }

    if (!db) return;

    setSaving(true);
    setStatus(null);

    try {
      const {
        partnerOne,
        partnerTwo,
        startDate,
        ...base
      } = content;

      await setDoc(doc(db, "site", `month-${formMonth}`), {
        monthId: formMonth,
        label: previewLabel,
        hero: {
          ...base.hero,
          title: previewTitle,
          script: monthScriptFor(content.startDate, formMonth),
        },
        time: base.time,
        journey: base.journey,
        gallery: base.gallery,
        reasons: base.reasons,
        letter: base.letter,
        closing: { ...base.closing, title: `Selamat ${previewTitle}` },
        music: base.music,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSelectedMonthId(formMonth);
      setStatus({
        type: "success",
        message: `Edisi ${previewLabel} berhasil dibuat dengan judul "${previewTitle}".`,
      });
      setFormMonth(nextMonthId(formMonth));
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
          message:
            error?.code === "permission-denied"
              ? "Izin Firestore ditolak. Pastikan firestore.rules untuk koleksi site sudah ter-deploy."
              : "Gagal membuat edisi bulan. Coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (month) => {
    if (!db) return;

    const label = month.label || monthLabel(month.monthId);
    if (
      !window.confirm(
        `Hapus edisi ${label}? Momen fotonya tidak ikut dihapus.`
      )
    ) {
      return;
    }

    try {
      const wasActive = month.monthId === selectedMonthId;
      const remaining = months.filter(
        (item) => item.monthId !== month.monthId
      );

      await deleteDoc(
        doc(db, "site", month.id || `month-${month.monthId}`)
      );

      if (wasActive) {
        const fallback =
          remaining.find((item) => item.monthId === currentMonthId()) ||
          remaining[0];
        setSelectedMonthId(fallback ? fallback.monthId : "");
      }

      setStatus({
        type: "success",
        message: `Edisi ${label} berhasil dihapus.`,
      });
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Gagal menghapus edisi bulan.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Panel
        title="Edisi Bulan"
        description="Setiap bulan punya konten, musik, dan kenangan foto sendiri. Buat edisi baru untuk mulai mengisi bulan berikutnya."
      >
        {months.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {months.map((month) => {
              const active = month.monthId === selectedMonthId;
              const momentCount = moments.filter((moment) =>
                (moment.date || "").startsWith(month.monthId)
              ).length;

              return (
                <article
                  key={month.monthId}
                  className={`rounded-2xl border p-4 transition ${
                    active
                      ? "border-rose-500/40 bg-pink-100/60 shadow-md shadow-rose-900/10"
                      : "border-dashed border-rose-900/15 bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.22em] text-rose-700/60">
                        {month.label || monthLabel(month.monthId)}
                      </p>
                      <p className="mt-1 font-serif text-lg text-cream">
                        {month.hero?.title || monthTitleFor(content.startDate, month.monthId)}
                      </p>
                    </div>
                    {active ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-white">
                        <Heart className="h-2.5 w-2.5" />
                        Aktif
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-900/50">
                    <Sparkle className="h-3 w-3 text-rose-400" />
                    {momentCount} momen foto
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMonthId(month.monthId)}
                      className={ghostButtonClass}
                    >
                      Pilih
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(month)}
                      className={dangerButtonClass}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-rose-900/15 bg-white/50 px-5 py-8 text-center text-sm text-cream/50">
            Belum ada edisi bulan. Buat edisi pertama dari konten yang sekarang.
          </p>
        )}
      </Panel>

      <Panel
        title="Buat Edisi Baru"
        description="Konten akan menyalin edisi yang sedang aktif. Judul dan penutup disesuaikan otomatis dengan bulan yang dipilih."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Bulan edisi">
              <TextInput
                type="month"
                value={formMonth}
                onChange={(event) => setFormMonth(event.target.value)}
                required
              />
            </Field>

            <div className="rounded-2xl border border-dashed border-rose-900/15 bg-pink-50/70 p-3.5">
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-rose-700/50">
                Pratinjau otomatis
              </p>
              <p className="mt-1 font-serif text-lg text-cream">
                {previewTitle}
              </p>
              <p className="text-xs text-rose-900/50">{previewLabel}</p>
              <p className="mt-1 font-script text-base text-rose-500">
                {monthScriptFor(content.startDate, formMonth)}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={primaryButtonClass}
          >
            {saving ? "Membuat..." : "Buat Edisi Bulan"}
          </button>
        </form>

        <StatusMessage status={status} />
      </Panel>
    </div>
  );
}
