import logo from "../../logo.jpg";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#031B38] via-[#054D66] to-[#007A87] flex flex-col items-center justify-center z-[9999]">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "0.5s" }} />

      {/* Logo / brand mark */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl p-1 overflow-hidden">
            <img src={logo} alt="Halal Food Authority Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          {/* Spinner ring */}
          <div
            className="absolute -inset-2 rounded-full border-2 border-transparent border-t-teal-300 animate-spin"
            style={{ animationDuration: "1s" }}
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">IFRS Staff Portal</h1>
          <p className="text-teal-200/80 text-sm font-medium mt-1">Loading your workspace…</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-teal-300/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
