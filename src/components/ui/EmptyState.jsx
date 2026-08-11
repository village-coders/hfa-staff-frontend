import React from "react";
import { T } from "../../constants/theme";

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 bg-teal-50 border border-teal-100">
        <Icon size={24} style={{ color: T.tealMain }} />
      </div>
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-slate-500 font-normal mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}
