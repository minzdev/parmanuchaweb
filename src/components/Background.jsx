const heartPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath fill='%23e11d5f' fill-opacity='0.06' d='M32 44l-2-1.8C23.6 36.6 19 32.4 19 27.4c0-4.1 3.2-7.1 7-7.1 2.3 0 4.4 1.1 5.8 2.9 1.4-1.8 3.5-2.9 5.8-2.9 3.8 0 7 3 7 7.1 0 5-4.6 9.2-11 14.8L32 44z'/%3E%3C/svg%3E\")";

export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% -5%, rgba(255,46,147,0.20), transparent 45%), radial-gradient(circle at 88% 18%, rgba(225,29,95,0.14), transparent 42%), radial-gradient(circle at 50% 112%, rgba(255,102,176,0.24), transparent 48%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: heartPattern, backgroundSize: "64px 64px" }}
      />
      <div className="absolute -left-32 -top-40 h-[36rem] w-[36rem] rounded-full bg-pink-400/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-rose-400/15 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-pink-300/25 blur-[120px]" />
      <div className="absolute -top-32 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      <div className="absolute bottom-16 -left-16 h-48 w-80 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute bottom-1/3 -right-20 h-56 w-80 rounded-full bg-white/35 blur-3xl" />
    </div>
  );
}
