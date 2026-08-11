import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Activity, CheckCircle2 } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { fmtN } from "../../constants/theme";
import { VIEW_TO_PATH } from "../../constants/menu";

export default function DashboardClaimRow({ claim, role, onTransition, onOpenFeedback, onDelete }) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest(".action-popup-menu")) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handleScroll = () => setOpen(false);
    if (open) window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const toggleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  const close = () => setOpen(false);
  const currentStatus = claim.status;

  const handleTrack = () => {
    close();
    navigate("/claims/track", { state: { claim } });
  };

  return (
    <tr className="hover:bg-teal-50/30 transition-colors">
      <td
        className="px-5 py-4 font-semibold text-teal-800 cursor-pointer"
        onClick={() => navigate(VIEW_TO_PATH["all-claims-list"])}
      >
        {claim.id}
      </td>
      <td className="px-5 py-4 font-medium text-slate-900">{claim.claimant}</td>
      <td className="px-5 py-4 text-slate-600">{claim.dept}</td>
      <td className="px-5 py-4 font-semibold text-slate-900">{fmtN(claim.amount)}</td>
      <td className="px-5 py-4 text-slate-500">{claim.date}</td>
      <td className="px-5 py-4"><StatusBadge status={claim.status} /></td>
      <td className="px-5 py-4 text-center">
        <div className="relative inline-block text-left" ref={ref}>
          <button
            onClick={toggleOpen}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <MoreVertical size={15} className="text-slate-600" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={close} />
              <div
                className="action-popup-menu fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-1 overflow-hidden flex flex-col animate-scale-in"
                style={{ top: dropdownPos.top, right: dropdownPos.right, width: "13rem" }}
              >
                <button
                  onClick={handleTrack}
                  className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-teal-50 text-teal-700 flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <Activity size={14} /> Track Processing
                </button>

                {currentStatus === "new" && (role === "financial_officer" || role === "admin") && (
                  <>
                    <button onClick={() => { close(); onTransition(claim.id, "verified"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Verify</button>
                    <button onClick={() => { close(); onOpenFeedback(claim); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">Send Feedback</button>
                    <button onClick={() => { close(); onTransition(claim.id, "rejected"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2">Reject</button>
                  </>
                )}
                {currentStatus === "verified" && (role === "ceo" || role === "admin") && (
                  <>
                    <button onClick={() => { close(); onTransition(claim.id, "approved_for_payment"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Send to Accountant</button>
                    <button onClick={() => { close(); onTransition(claim.id, "further_approval"); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-purple-50 text-purple-700 flex items-center gap-2">Send to Board</button>
                    <button onClick={() => { close(); onTransition(claim.id, "pending"); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2">Reverse to Fin. Officer</button>
                  </>
                )}
                {currentStatus === "further_approval" && (role === "chairman" || role === "admin") && (
                  <>
                    <button onClick={() => { close(); onTransition(claim.id, "verified"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Approve — Return to CEO</button>
                    <button onClick={() => { close(); onTransition(claim.id, "rejected"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2">Reject</button>
                  </>
                )}
                {currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin") && (
                  <button onClick={() => { close(); onTransition(claim.id, "paid"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Mark as Paid
                  </button>
                )}
                {currentStatus === "pending" && role === "user" && (
                  <button onClick={() => { close(); onTransition(claim.id, "new"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Resubmit Claim</button>
                )}
                {role === "admin" && (
                  <button onClick={() => { close(); onDelete(claim.id); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100">Delete</button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
