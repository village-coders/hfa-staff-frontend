import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Activity, CheckCircle2 } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { fmtN } from "../../constants/theme";
import { VIEW_TO_PATH } from "../../constants/menu";
import ConfirmModal from "../ui/ConfirmModal";
import { useApp } from "../../context/AppContext";

export default function DashboardClaimRow({ claim, role, onTransition, onOpenFeedback, onDelete }) {
  const { transitioningId } = useApp();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [pendingConfirm, setPendingConfirm] = useState(null);
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
  const refNo = claim.id || claim.claimRefNo || "Claim";

  const requestConfirm = (config) => {
    close();
    setPendingConfirm(config);
  };

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
          {transitioningId && transitioningId.startsWith(`${claim.id}-`) ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <button
              onClick={toggleOpen}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <MoreVertical size={15} className="text-slate-600" />
            </button>
          )}
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={close} />
              <div
                className="action-popup-menu fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-1 overflow-hidden flex flex-col animate-scale-in"
                style={{ top: dropdownPos.top, right: dropdownPos.right, width: "13rem" }}
              >
                <button
                  onClick={handleTrack}
                  className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-teal-50 text-teal-700 flex items-center gap-2 transition-colors border-b border-slate-100 cursor-pointer"
                >
                  <Activity size={14} /> Track Processing
                </button>

                {(currentStatus === "new" || currentStatus === "pending") && (role === "financial_officer" || role === "admin") && (
                  <>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Verify Claim",
                          message: `Are you sure you want to verify claim ${refNo}? This will forward it to the CEO.`,
                          confirmLabel: "Verify Claim",
                          confirmVariant: "primary",
                          onConfirm: () => onTransition(claim.id, "verified"),
                        })
                      }
                      className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2 cursor-pointer"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => { close(); onOpenFeedback(claim); }}
                      className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      Send Feedback
                    </button>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Reject Claim",
                          message: `Are you sure you want to reject claim ${refNo}?`,
                          confirmLabel: "Reject Claim",
                          confirmVariant: "danger",
                          onConfirm: () => onTransition(claim.id, "rejected"),
                        })
                      }
                      className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
                {currentStatus === "verified" && (role === "ceo" || role === "admin") && (
                  <>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Approve for Payment",
                          message: `Are you sure you want to send claim ${refNo} to the Accountant for payment?`,
                          confirmLabel: "Send to Accountant",
                          confirmVariant: "primary",
                          onConfirm: () => onTransition(claim.id, "approved_for_payment"),
                        })
                      }
                      className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2 cursor-pointer"
                    >
                      Send to Accountant
                    </button>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Escalate to Board",
                          message: `Are you sure you want to send claim ${refNo} to the Board for approval?`,
                          confirmLabel: "Send to Board",
                          confirmVariant: "warning",
                          onConfirm: () => onTransition(claim.id, "further_approval"),
                        })
                      }
                      className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-purple-50 text-purple-700 flex items-center gap-2 cursor-pointer"
                    >
                      Send to Board
                    </button>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Return Claim",
                          message: `Are you sure you want to return claim ${refNo} to the Financial Officer?`,
                          confirmLabel: "Return Claim",
                          confirmVariant: "warning",
                          onConfirm: () => onTransition(claim.id, "pending"),
                        })
                      }
                      className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2 cursor-pointer"
                    >
                      Reverse to Fin. Officer
                    </button>
                  </>
                )}
                {currentStatus === "further_approval" && (role === "chairman" || role === "admin") && (
                  <>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Board Approval",
                          message: `Are you sure you want to approve claim ${refNo} and return it to the CEO?`,
                          confirmLabel: "Approve Claim",
                          confirmVariant: "primary",
                          onConfirm: () => onTransition(claim.id, "verified"),
                        })
                      }
                      className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2 cursor-pointer"
                    >
                      Approve — Return to CEO
                    </button>
                    <button
                      onClick={() =>
                        requestConfirm({
                          title: "Reject Claim",
                          message: `Are you sure you want to reject claim ${refNo}?`,
                          confirmLabel: "Reject Claim",
                          confirmVariant: "danger",
                          onConfirm: () => onTransition(claim.id, "rejected"),
                        })
                      }
                      className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
                {currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin") && (
                  <button
                    onClick={() =>
                      requestConfirm({
                        title: "Confirm Payment Disbursed",
                        message: `Are you sure you want to mark claim ${refNo} as Paid?`,
                        confirmLabel: "Mark as Paid",
                        confirmVariant: "primary",
                        onConfirm: () => onTransition(claim.id, "paid"),
                      })
                    }
                    className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Mark as Paid
                  </button>
                )}
                {currentStatus === "pending" && role === "user" && (
                  <button
                    onClick={() =>
                      requestConfirm({
                        title: "Resubmit Claim",
                        message: `Are you sure you want to resubmit claim ${refNo}?`,
                        confirmLabel: "Resubmit",
                        confirmVariant: "primary",
                        onConfirm: () => onTransition(claim.id, "new"),
                      })
                    }
                    className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2 cursor-pointer"
                  >
                    Resubmit Claim
                  </button>
                )}
                {role === "admin" && (
                  <button
                    onClick={() =>
                      requestConfirm({
                        title: "Delete Claim Record",
                        message: `Are you sure you want to delete claim ${refNo}?`,
                        confirmLabel: "Delete",
                        confirmVariant: "danger",
                        onConfirm: () => onDelete(claim.id),
                      })
                    }
                    className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dashboard Confirmation Modal */}
        {pendingConfirm && (
          <ConfirmModal
            isOpen={true}
            title={pendingConfirm.title}
            message={pendingConfirm.message}
            confirmLabel={pendingConfirm.confirmLabel}
            confirmVariant={pendingConfirm.confirmVariant}
            onConfirm={pendingConfirm.onConfirm}
            onClose={() => setPendingConfirm(null)}
          />
        )}
      </td>
    </tr>
  );
}
