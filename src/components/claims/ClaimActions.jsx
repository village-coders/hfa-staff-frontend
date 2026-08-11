import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { T } from "../../constants/theme";
import ConfirmModal from "../ui/ConfirmModal";
import { useApp } from "../../context/AppContext";

export default function ClaimActions({ claim, view, role, onTransition, onOpenFeedback, onDelete, onViewDetails }) {
  const { transitioningId } = useApp();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        !e.target.closest(".action-popup-menu")
      ) {
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
      setDropdownPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  const requestConfirmation = (config) => {
    setOpen(false);
    setPendingConfirm(config);
  };

  const btn = (label, onClick, style) => (
    <button
      key={label}
      onClick={onClick}
      className="w-full text-left text-xs font-medium px-3.5 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center gap-2 transition-colors cursor-pointer"
      style={{ color: style?.color || T.gray700 }}
    >
      {label}
    </button>
  );

  const buttons = [];
  const currentStatus = claim.status;
  const refNo = claim.id || claim.claimRefNo || "Claim";

  if ((currentStatus === "new" || currentStatus === "pending") && (role === "financial_officer" || role === "admin")) {
    buttons.push(
      btn("Verify", () =>
        requestConfirmation({
          title: "Verify Claim",
          message: `Are you sure you want to verify claim ${refNo}? This will forward it to the CEO for review.`,
          confirmLabel: "Verify Claim",
          confirmVariant: "primary",
          onConfirm: () => onTransition(claim.id, "verified"),
        }),
        { color: T.tealLight }
      )
    );
    buttons.push(
      btn("Send Feedback", () => {
        setOpen(false);
        onOpenFeedback(claim);
      }, { color: T.gray700 })
    );
    buttons.push(
      btn("Reject", () =>
        requestConfirmation({
          title: "Reject Claim",
          message: `Are you sure you want to reject claim ${refNo}? The claimant will be notified.`,
          confirmLabel: "Reject Claim",
          confirmVariant: "danger",
          onConfirm: () => onTransition(claim.id, "rejected"),
        }),
        { color: "#B91C1C" }
      )
    );
  }

  if (currentStatus === "verified" && (role === "ceo" || role === "admin")) {
    buttons.push(
      btn("Send to Accountant", () =>
        requestConfirmation({
          title: "Approve for Payment",
          message: `Are you sure you want to approve claim ${refNo} and forward it to the Accountant for payment disbursement?`,
          confirmLabel: "Send to Accountant",
          confirmVariant: "primary",
          onConfirm: () => onTransition(claim.id, "approved_for_payment"),
        }),
        { color: T.tealLight }
      )
    );
    buttons.push(
      btn("Send to Board", () =>
        requestConfirmation({
          title: "Escalate to Board",
          message: `Are you sure you want to escalate claim ${refNo} to the Board of Directors for further approval?`,
          confirmLabel: "Send to Board",
          confirmVariant: "warning",
          onConfirm: () => onTransition(claim.id, "further_approval"),
        }),
        { color: T.gray700 }
      )
    );
    buttons.push(
      btn("Reverse to Fin. Officer", () =>
        requestConfirmation({
          title: "Return Claim to Financial Officer",
          message: `Are you sure you want to return claim ${refNo} to the Financial Officer for re-evaluation?`,
          confirmLabel: "Return Claim",
          confirmVariant: "warning",
          onConfirm: () => onTransition(claim.id, "pending"),
        }),
        { color: "#B45309" }
      )
    );
  }

  if (currentStatus === "further_approval" && (role === "chairman" || role === "admin")) {
    buttons.push(
      btn("Approve — Return to CEO", () =>
        requestConfirmation({
          title: "Board Approval",
          message: `Are you sure you want to approve claim ${refNo} and return it to the CEO for final action?`,
          confirmLabel: "Approve Claim",
          confirmVariant: "primary",
          onConfirm: () => onTransition(claim.id, "verified"),
        }),
        { color: T.tealLight }
      )
    );
    buttons.push(
      btn("Reject", () =>
        requestConfirmation({
          title: "Reject Claim",
          message: `Are you sure you want to reject claim ${refNo}?`,
          confirmLabel: "Reject Claim",
          confirmVariant: "danger",
          onConfirm: () => onTransition(claim.id, "rejected"),
        }),
        { color: "#B91C1C" }
      )
    );
  }

  if (currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin")) {
    buttons.push(
      btn("Mark as Paid", () =>
        requestConfirmation({
          title: "Confirm Payment Disbursed",
          message: `Are you sure you want to mark claim ${refNo} as Paid?`,
          confirmLabel: "Mark as Paid",
          confirmVariant: "primary",
          onConfirm: () => onTransition(claim.id, "paid"),
        }),
        { color: T.tealLight }
      )
    );
  }

  if (currentStatus === "pending" && role === "user") {
    buttons.push(
      btn("Resubmit Claim", () =>
        requestConfirmation({
          title: "Resubmit Expense Claim",
          message: `Are you sure you want to resubmit claim ${refNo} for review?`,
          confirmLabel: "Resubmit",
          confirmVariant: "primary",
          onConfirm: () => onTransition(claim.id, "new"),
        }),
        { color: T.tealLight }
      )
    );
  }

  if (role === "admin" && view !== "manage-claim-sheet") {
    buttons.push(
      btn("Delete", () =>
        requestConfirmation({
          title: "Delete Claim Record",
          message: `Are you sure you want to permanently delete claim ${refNo}? This action cannot be undone.`,
          confirmLabel: "Delete Permanently",
          confirmVariant: "danger",
          onConfirm: () => onDelete(claim.id),
        }),
        { color: "#B91C1C" }
      )
    );
  }

  buttons.push(
    btn("View Details", () => {
      setOpen(false);
      if (onViewDetails) onViewDetails(claim);
    }, { color: T.gray700 })
  );

  const isThisClaimTransitioning = transitioningId && transitioningId.startsWith(`${claim.id}-`);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {isThisClaimTransitioning ? (
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

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="action-popup-menu fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-1 overflow-hidden flex flex-col animate-scale-in"
            style={{ top: dropdownPos.top, right: dropdownPos.right, width: "13rem" }}
          >
            {buttons}
          </div>
        </>,
        document.body
      )}

      {/* Action Confirmation Modal */}
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
    </div>
  );
}
