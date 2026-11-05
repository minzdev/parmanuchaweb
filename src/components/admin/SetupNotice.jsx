import { Link } from "react-router-dom";
import { Heart } from "../icons";
import { ghostButtonClass } from "./ui";

const envKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export default function SetupNotice() {
  return (
    <div className="rounded-3xl border border-rose-900/10 bg-white/80 p-7 shadow-2xl shadow-rose-900/10 backdrop-blur-xl md:p-9">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-400 text-white">
          <Heart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl text-cream">Firebase belum aktif</h1>
          <p className="text-xs text-cream/45">Panel admin butuh konfigurasi.</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3 text-sm leading-relaxed text-cream/65">
        <li>
          1. Buat project di Firebase Console, lalu aktifkan{" "}
          <strong className="text-cream/85">Authentication</strong> (Email/Password),
          <strong className="text-cream/85"> Firestore</strong>, dan{" "}
          <strong className="text-rose-900/85">Storage</strong>.
        </li>
        <li>
          2. Tambahkan user admin lewat menu Authentication, lalu salin konfigurasi
          web app ke file <code className="text-rose-700">.env</code>.
        </li>
        <li>
          3. Deploy aturan dari <code className="text-rose-700">firestore.rules</code>{" "}
          dan <code className="text-rose-700">storage.rules</code>.
        </li>
        <li>4. Restart dev server setelah mengisi .env.</li>
      </ol>

      <div className="mt-5 rounded-2xl border border-rose-900/10 bg-white/70 p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/40">
          Variabel yang dibutuhkan
        </p>
        <div className="mt-2 grid gap-1 font-mono text-[0.7rem] text-cream/70">
          {envKeys.map((key) => (
            <span key={key}>{key}=</span>
          ))}
        </div>
      </div>

      <Link to="/" className={`${ghostButtonClass} mt-6 w-full`}>
        Kembali ke situs
      </Link>
    </div>
  );
}
