import React from "react";
import { STATUS } from "../../constants/theme";

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: "#475569", bg: "#F1F5F9" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shadow-sm border border-slate-200"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}
