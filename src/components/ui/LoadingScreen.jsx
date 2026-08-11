import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#031B38] via-[#054D66] to-[#007A87] flex flex-col items-center justify-center z-[9999]">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "0.5s" }} />

      {/* Logo / brand mark */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="42" height="42" rx="10" fill="none" />
              <path d="M8 34V8h10l10 13L38 8v26" stroke="#99F6E4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 21h30" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
            </svg>
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
