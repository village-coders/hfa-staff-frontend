import React from "react";

export default function StatCard4({ label, value, icon: Icon, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 60%, #ffffff 100%)`,
        borderColor: accent + "30",
      }}
    >
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.12] pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: accent + "22", color: accent }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <div
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: accent + "18", color: accent }}
          >
            View →
          </div>
        </div>
        <p className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: accent }}>
          {value}
        </p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}
