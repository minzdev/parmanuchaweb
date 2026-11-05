import { Component } from "react";
import { Heart } from "./icons";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-cream">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-500 to-pink-400 text-white shadow-lg shadow-rose-700/30">
          <Heart className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-serif text-3xl">Terjadi kesalahan</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60">
          Halaman gagal dimuat. Coba muat ulang untuk melanjutkan.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-gradient-to-r from-rose-700 via-rose-500 to-pink-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-700/30 transition hover:-translate-y-0.5"
        >
          Muat ulang
        </button>
      </div>
    );
  }
}
