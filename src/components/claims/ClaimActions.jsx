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

  if ((currentStatus === "new" || currentStatus === "pending") && (role === "financial_officer" || role === "admin" || role === "super_admin")) {
    buttons.push(
      btn("Verify", () =>
        requestConfirmation({
          title: "Verify Claim",
          message: `Are you sure you want to verify claim ${refNo}? This will forward it to the CEO for review.`,
          confirmLabel: "Verify Claim",
          confirmVariant: "primary",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Add optional note for CEO review (e.g. Invoices verified, expenses within policy)...",
          noteLabel: "Note for CEO Review",
          onConfirm: (note) => onTransition(claim.id, "verified", note, "ceo"),
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
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Reason for claim rejection...",
          noteLabel: "Rejection Reason",
          onConfirm: (note) => onTransition(claim.id, "rejected", note, "user"),
        }),
        { color: "#B91C1C" }
      )
    );
  }

  if (currentStatus === "verified" && (role === "ceo" || role === "admin" || role === "super_admin")) {
    buttons.push(
      btn("Send to Accountant", () =>
        requestConfirmation({
          title: "Approve for Payment",
          message: `Are you sure you want to approve claim ${refNo} and forward it to the Accountant for payment disbursement?`,
          confirmLabel: "Send to Accountant",
          confirmVariant: "primary",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Payment disbursement instructions for Accountant...",
          noteLabel: "Note for Accountant",
          onConfirm: (note) => onTransition(claim.id, "approved_for_payment", note, "accountant"),
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
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Justification for Board approval...",
          noteLabel: "Note for Board Review",
          onConfirm: (note) => onTransition(claim.id, "further_approval", note, "chairman"),
        }),
        { color: T.gray700 }
      )
    );
    buttons.push(
      btn("Reverse to Fin. Officer", () =>
        requestConfirmation({
          title: "Return Claim to Financial Officer",
          message: `Are you sure you want to return claim ${refNo} to the Financial Officer? It will move back to the New Claims list for re-evaluation.`,
          confirmLabel: "Reverse to Fin. Officer",
          confirmVariant: "warning",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Instructions / reason for return to Financial Officer...",
          noteLabel: "Return Reason / Note",
          onConfirm: (note) => onTransition(claim.id, "new", note, "financial_officer"),
        }),
        { color: "#B45309" }
      )
    );
  }

  if (currentStatus === "further_approval" && (role === "chairman" || role === "admin" || role === "super_admin")) {
    buttons.push(
      btn("Approve — Return to CEO", () =>
        requestConfirmation({
          title: "Board Approval",
          message: `Are you sure you want to approve claim ${refNo} and return it to the CEO for final action?`,
          confirmLabel: "Approve Claim",
          confirmVariant: "primary",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Board resolution / approval note for CEO...",
          noteLabel: "Board Note for CEO",
          onConfirm: (note) => onTransition(claim.id, "verified", note, "ceo"),
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
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Reason for claim rejection...",
          noteLabel: "Rejection Reason",
          onConfirm: (note) => onTransition(claim.id, "rejected", note, "user"),
        }),
        { color: "#B91C1C" }
      )
    );
  }

  if (currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin" || role === "super_admin")) {
    buttons.push(
      btn("Mark as Paid", () =>
        requestConfirmation({
          title: "Confirm Payment Disbursed",
          message: `Are you sure you want to mark claim ${refNo} as Paid?`,
          confirmLabel: "Mark as Paid",
          confirmVariant: "primary",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Note...",
          noteLabel: "Note",
          onConfirm: (note) => onTransition(claim.id, "paid", note, "user"),
        }),
        { color: T.tealLight }
      )
    );
  }

  if (currentStatus === "pending" && (role === "user" || role === "financial_officer" || role === "admin" || role === "super_admin")) {
    buttons.push(
      btn("Resubmit Claim", () =>
        requestConfirmation({
          title: "Resubmit Expense Claim",
          message: `Are you sure you want to resubmit claim ${refNo}? It will move to the New Claims list for review.`,
          confirmLabel: "Resubmit",
          confirmVariant: "primary",
          withNote: true,
          noteRequired: false,
          notePlaceholder: "Note...",
          noteLabel: "Note",
          onConfirm: (note) => onTransition(claim.id, "new", note, "financial_officer"),
        }),
        { color: T.tealLight }
      )
    );
  }

  if (role === "super_admin" && view !== "manage-claim-sheet") {
    buttons.push(
      btn("Delete", () =>
        requestConfirmation({
          title: "Delete Claim Record",
          message: `Are you sure you want to permanently delete claim ${refNo}? This action cannot be undone.`,
          confirmLabel: "Delete Permanently",
          confirmVariant: "danger",
          withNote: false,
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
          withNote={pendingConfirm.withNote ?? true}
          notePlaceholder={pendingConfirm.notePlaceholder}
          noteLabel={pendingConfirm.noteLabel}
          noteRequired={pendingConfirm.noteRequired ?? false}
          onConfirm={pendingConfirm.onConfirm}
          onClose={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
