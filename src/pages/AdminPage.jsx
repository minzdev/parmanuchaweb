import { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import Background from "../components/Background";
import AdminLogin from "../components/admin/AdminLogin";
import SetupNotice from "../components/admin/SetupNotice";
import MomentsPanel from "../components/admin/MomentsPanel";
import TextPanel from "../components/admin/TextPanel";
import JourneyPanel from "../components/admin/JourneyPanel";
import ReasonsPanel from "../components/admin/ReasonsPanel";
import MusicPanel from "../components/admin/MusicPanel";
import MonthPanel from "../components/admin/MonthPanel";
import SettingsPanel from "../components/admin/SettingsPanel";
import {
  ghostButtonClass,
  primaryButtonClass,
} from "../components/admin/ui";
import { Heart, Sparkle } from "../components/icons";
import { useAuth } from "../lib/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { useContent } from "../lib/content";
import { monthLabel } from "../lib/months";

const tabs = [
  { id: "moments", label: "Momen" },
  { id: "text", label: "Ucapan" },
  { id: "journey", label: "Perjalanan" },
  { id: "reasons", label: "Alasan" },
  { id: "music", label: "Musik" },
  { id: "months", label: "Bulan" },
  { id: "settings", label: "Pengaturan" },
];

function CenteredShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-12 text-cream">
      <Background />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

function LoadingCard({ label }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-rose-900/10 bg-white/80 p-8 text-center shadow-lg shadow-rose-900/5 backdrop-blur-xl">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-rose-900/15 border-t-rose-500" />
      <p className="text-sm text-cream/50">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const {
    ready,
    months,
    selectedMonthId,
    selectedMonth,
    setSelectedMonthId,
  } = useContent();
  const [tab, setTab] = useState("months");

  if (!isFirebaseConfigured) {
    return (
      <CenteredShell>
        <SetupNotice />
      </CenteredShell>
    );
  }

  if (loading) {
    return (
      <CenteredShell>
        <LoadingCard label="Memeriksa sesi admin..." />
      </CenteredShell>
    );
  }

  if (!user) {
    return (
      <CenteredShell>
        <AdminLogin />
      </CenteredShell>
    );
  }

  if (!ready) {
    return (
      <CenteredShell>
        <LoadingCard label="Memuat konten dari Firestore..." />
      </CenteredShell>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-cream">
      <Background />

      <header className="sticky top-0 z-30 border-b border-rose-900/10 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 text-white shadow-lg shadow-rose-700/30">
              <Heart className="h-4 w-4" />
            </span>
            <div>
              <p className="font-serif text-lg leading-none">Mansiv Admin</p>
              <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-cream/40">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className={ghostButtonClass}>
              Lihat Situs
            </Link>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className={ghostButtonClass}
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-2 md:px-6">
          <div className="flex gap-1.5 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  tab === item.id
                    ? "bg-rose-600 text-white ring-1 ring-rose-500/30"
                    : "text-rose-900/50 hover:bg-white/60 hover:text-rose-900/80"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-3 md:px-6">
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-rose-900/40">
            Edisi
          </span>
          {months.length ? (
            <select
              value={selectedMonthId}
              onChange={(event) => setSelectedMonthId(event.target.value)}
              className="rounded-full border border-rose-900/15 bg-white/70 px-3 py-1.5 text-xs text-cream outline-none focus:border-rose-500/50"
            >
              {months.map((month) => (
                <option key={month.monthId} value={month.monthId}>
                  {month.label || monthLabel(month.monthId)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-rose-900/50">
              Belum ada edisi bulan
            </span>
          )}
          <button
            type="button"
            onClick={() => setTab("months")}
            className={`${ghostButtonClass} px-3 py-1.5 text-xs`}
          >
            Kelola Bulan
          </button>
          {selectedMonth ? (
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-rose-700/60">
              {selectedMonth.hero?.title || "Edisi aktif"}
            </span>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-6">
        {tab === "months" ? <MonthPanel /> : null}

        {tab === "settings" ? <SettingsPanel /> : null}

        {["moments", "text", "journey", "reasons", "music"].includes(tab) &&
        !selectedMonthId ? (
          <div className="rounded-3xl border border-dashed border-rose-900/15 bg-white/70 p-8 text-center shadow-lg shadow-rose-900/5 md:p-12">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 text-white shadow-lg shadow-rose-700/20">
              <Sparkle className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-2xl text-cream">
              Buat edisi bulan dulu
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-cream/55">
              Konten, musik, dan kenangan foto sekarang disimpan per bulan. Buat
              edisi bulan pertama dari konten yang sudah ada.
            </p>
            <button
              type="button"
              onClick={() => setTab("months")}
              className={`${primaryButtonClass} mt-5`}
            >
              Kelola Bulan
            </button>
          </div>
        ) : null}

        {tab === "moments" && selectedMonthId ? (
          <MomentsPanel key={selectedMonthId} monthId={selectedMonthId} />
        ) : null}
        {tab === "text" && selectedMonthId ? (
          <TextPanel key={selectedMonthId} monthId={selectedMonthId} />
        ) : null}
        {tab === "journey" && selectedMonthId ? (
          <JourneyPanel key={selectedMonthId} monthId={selectedMonthId} />
        ) : null}
        {tab === "reasons" && selectedMonthId ? (
          <ReasonsPanel key={selectedMonthId} monthId={selectedMonthId} />
        ) : null}
        {tab === "music" && selectedMonthId ? (
          <MusicPanel key={selectedMonthId} monthId={selectedMonthId} />
        ) : null}
      </main>
    </div>
  );
}
