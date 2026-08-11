import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity, ChevronLeft, FilePlus2, BadgeCheck, ShieldCheck,
  Building2, CircleDollarSign, CheckCircle2
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import { useApp } from "../context/AppContext";
import { fmtN } from "../constants/theme";

export default function ClaimTrackingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { claims } = useApp();

  // Selected claim passed in location state or fallback to first claim
  const claim = location.state?.claim || claims[0] || {
    id: "MDOS-0001",
    claimant: "Staff Member",
    amount: 0,
    dept: "Operations",
    date: new Date().toISOString().slice(0, 10),
    status: "new",
  };

  const showBoard = claim.status === "further_approval";

  const steps = [
    {
      key: "submitted",
      label: "Claim Submitted",
      icon: FilePlus2,
      color: "#007A87",
      bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800",
      passedStatuses: ["new", "pending", "verified", "further_approval", "approved_for_payment", "paid", "rejected"],
      activeStatuses: [],
    },
    {
      key: "fo_review",
      label: "Financial Officer Review",
      icon: BadgeCheck,
      color: "#4338CA",
      bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800",
      passedStatuses: ["verified", "further_approval", "approved_for_payment", "paid"],
      activeStatuses: ["new", "pending"],
    },
    {
      key: "ceo_review",
      label: "CEO Review & Approval",
      icon: ShieldCheck,
      color: "#0369A1",
      bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800",
      passedStatuses: showBoard
        ? ["further_approval", "approved_for_payment", "paid"]
        : ["approved_for_payment", "paid"],
      activeStatuses: ["verified"],
    },
    ...(showBoard ? [{
      key: "board_review",
      label: "Board / Chairman Review",
      icon: Building2,
      color: "#7C3AED",
      bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800",
      passedStatuses: ["approved_for_payment", "paid"],
      activeStatuses: ["further_approval"],
    }] : []),
    {
      key: "payment",
      label: "Payment Processing",
      icon: CircleDollarSign,
      color: "#0E7490",
      bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-800",
      passedStatuses: ["paid"],
      activeStatuses: ["approved_for_payment"],
    },
    {
      key: "paid_complete",
      label: "Claim Paid — Process Complete",
      icon: CheckCircle2,
      color: "#15803D",
      bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800",
      passedStatuses: [],
      activeStatuses: ["paid"],
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-6 text-white flex items-center justify-between relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <Activity size={16} className="text-teal-300" />
            <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">Claim Processing Tracker</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Tracking Claim</h2>
          <p className="text-xs text-teal-100/80 font-mono mt-0.5">{claim.id} · {claim.claimant}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer"
        >
          <ChevronLeft size={15} />
          Back to Dashboard
        </button>
      </div>

      {/* Claim Details */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Claim ID",    value: claim.id,        mono: true,  teal: true },
            { label: "Claimant",    value: claim.claimant },
            { label: "Amount",      value: fmtN(claim.amount), large: true },
            { label: "Department",  value: claim.dept || "Operations" },
            { label: "Date Filed",  value: claim.date },
            { label: "Status",      badge: true },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{f.label}</p>
              {f.badge
                ? <StatusBadge status={claim.status} />
                : <p className={`font-bold ${f.large ? "text-base" : "text-sm"} ${f.teal ? "text-teal-700 font-mono" : "text-slate-800"}`}>{f.value}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Steps Only */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5" style={{ background: "linear-gradient(90deg,#007A87 0%,#054D66 100%)" }}>
          <Activity size={15} className="text-teal-200" />
          <p className="text-xs font-bold text-white uppercase tracking-widest">Process Steps</p>
        </div>
        <div className="p-6 space-y-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isPassed = s.passedStatuses.includes(claim.status);
            const isActive = s.activeStatuses.includes(claim.status);
            const isFuture = !isPassed && !isActive;

            return (
              <div key={s.key} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isPassed ? "border-emerald-400 bg-emerald-50"
                      : isActive ? "border-white shadow-lg"
                      : "border-slate-200 bg-slate-50"
                    }`}
                    style={isActive ? { borderColor: s.color, background: `${s.color}18`, boxShadow: `0 0 0 4px ${s.color}15` } : {}}
                  >
                    {isPassed
                      ? <CheckCircle2 size={18} className="text-emerald-600" />
                      : <Icon size={16} style={{ color: isActive ? s.color : "#CBD5E1" }} />
                    }
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-6 my-1 rounded-full ${isPassed ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className={`rounded-2xl border px-4 py-3 flex items-center justify-between transition-all ${
                    isPassed ? "bg-emerald-50/50 border-emerald-200"
                    : isActive ? `${s.bg} ${s.border} shadow-sm`
                    : "bg-white border-slate-100"
                  }`}>
                    <p className={`font-bold text-sm ${
                      isPassed ? "text-emerald-800" : isActive ? s.text : "text-slate-400"
                    }`}>{s.label}</p>

                    <div className="flex items-center gap-1.5">
                      {isPassed && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">✓ Completed</span>}
                      {isActive && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border animate-pulse" style={{ background: `${s.color}18`, color: s.color, borderColor: `${s.color}40` }}>● In Progress</span>}
                      {isFuture && <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200">Pending</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-start pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
