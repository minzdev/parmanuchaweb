import { useState } from "react";
import { Link } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Heart } from "../icons";
import {
  Field,
  StatusMessage,
  TextInput,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";

const authMessages = {
  "auth/invalid-email": "Format email tidak valid.",
  "auth/invalid-credential": "Email atau password salah.",
  "auth/user-not-found": "Akun admin belum terdaftar.",
  "auth/wrong-password": "Password salah.",
  "auth/too-many-requests":
    "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
  "auth/network-request-failed": "Koneksi ke Firebase gagal.",
  "auth/operation-not-allowed":
    "Aktifkan provider Email/Password di Firebase Authentication.",
};

function authErrorMessage(code) {
  return (
    authMessages[code] ||
    "Gagal masuk. Periksa konfigurasi Firebase dan kredensial kamu."
  );
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!auth) return;

    setLoading(true);
    setStatus(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setStatus({ type: "error", message: authErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!auth) return;

    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "Isi email admin dulu untuk mengirim link reset.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus({
        type: "success",
        message: "Link reset password sudah dikirim ke email kamu.",
      });
    } catch (error) {
      setStatus({ type: "error", message: authErrorMessage(error.code) });
    }
  };

  return (
    <div className="rounded-3xl border border-rose-900/10 bg-white/80 p-7 shadow-2xl shadow-rose-900/10 backdrop-blur-xl md:p-9">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-500/30">
          <Heart className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-serif text-3xl text-cream">Panel Admin</h1>
        <p className="mt-2 text-sm leading-relaxed text-cream/50">
          Masuk untuk mengelola momen, ucapan, dan backsound.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Field label="Email admin">
          <TextInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@email.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />
        </Field>

        <StatusMessage status={status} />

        <button
          type="submit"
          disabled={loading}
          className={`${primaryButtonClass} w-full`}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

        <div className="mt-5 flex flex-col gap-2 text-center text-xs text-rose-900/50">
        <button
          type="button"
          onClick={handleReset}
          className="transition hover:text-rose-700"
        >
          Lupa password? Kirim link reset
        </button>
        <Link to="/" className={`${ghostButtonClass} mt-2`}>
          Kembali ke situs
        </Link>
      </div>
    </div>
  );
}
