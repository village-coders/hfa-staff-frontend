import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical, X, Building2, Eye, Activity, BadgeCheck, Clock3,
  CircleDollarSign, Wallet, RotateCcw, AlertCircle, XCircle, Trash2,
  CheckCircle2, Paperclip, FileText
} from "lucide-react";
import ConfirmModal from "../ui/ConfirmModal";
import DocumentViewerModal from "./DocumentViewerModal";
import { useApp } from "../../context/AppContext";

export default function ClaimActions({
  claim,
  view,
  role,
  onTransition,
  onOpenFeedback,
  onDelete,
  onViewDetails,
}) {
  const { transitioningId } = useApp();
  const [open, setOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const requestConfirmation = (config) => {
    close();
    setPendingConfirm(config);
  };

  const currentStatus = (claim.status || "").toLowerCase();
  const refNo = claim.id || claim.claimRefNo || "Claim";

  const isFO = role === "financial_officer" || role === "admin" || role === "super_admin";
  const isCEO = role === "ceo" || role === "admin" || role === "super_admin";
  const isChairman = role === "chairman" || role === "admin" || role === "super_admin";
  const isAccountant = role === "accountant" || role === "admin" || role === "super_admin";

  const handleTrack = () => {
    close();
    navigate("/claims/track", { state: { claim } });
  };

  const handleView = () => {
    close();
    if (onViewDetails) {
      onViewDetails(claim);
    }
  };

  const isThisClaimTransitioning = transitioningId && transitioningId.startsWith(`${claim.id}-`);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      {isThisClaimTransitioning ? (
        <div className="w-8 h-8 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          title="Open Claim Actions"
        >
          <MoreVertical size={15} className="text-slate-600" />
        </button>
      )}

      {/* Action Modal Popup matching screenshot design */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={close}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-scale-in my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-xs">
                    <Building2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      CLAIM ACTIONS
                    </p>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1 leading-snug truncate">
                      {claim.companyName || claim.claimant || "Halal Food Authority"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {claim.contactEmail || `${claim.claimant || claim.claimantName || "Staff"} • ${refNo}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Attached Files Section Preview */}
              {claim.attachments && claim.attachments.length > 0 && (
                <div className="mb-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex-shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Paperclip size={13} className="text-teal-600" />
                      Attached Documents ({claim.attachments.length})
                    </span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      Click to View
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {claim.attachments.map((file, idx) => {
                      const name = typeof file === "string" ? file : file.fileName || file.name || `Attachment ${idx + 1}`;
                      const ext = name.split('.').pop()?.toUpperCase() || 'DOC';
                      return (
                        <div
                          key={idx}
                          onClick={() => setViewingFile(file)}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer group"
                          title="Click to view document"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                              {ext}
                            </span>
                            <span className="truncate text-slate-800 text-[11px] font-medium group-hover:text-teal-900">{name}</span>
                          </div>
                          <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1 ml-2 flex-shrink-0">
                            <Eye size={12} />
                            <span>View</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {/* 1. View Full Details Card */}
                <div
                  onClick={handleView}
                  className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Eye size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-amber-950">View Full Details</h4>
                    <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                      {claim.attachments && claim.attachments.length > 0
                        ? `Inspect breakdown, status notes and ${claim.attachments.length} attached file(s)`
                        : "Inspect complete claim itemization, totals, and notes"}
                    </p>
                  </div>
                </div>

                {/* 2. Track Processing Card */}
                <div
                  onClick={handleTrack}
                  className="p-3.5 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Activity size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-sky-950">Track Processing</h4>
                    <p className="text-xs text-sky-800/80 font-medium mt-0.5">
                      Follow step-by-step approval timeline and audit history
                    </p>
                  </div>
                </div>

                {/* 3. Financial Officer actions */}
                {(currentStatus === "submitted" || currentStatus === "new" || currentStatus === "pending") && isFO && (
                  <>
                    <div
                      onClick={() =>
                        requestConfirmation({
                          title: "Verify Claim",
                          message: `Are you sure you want to verify claim ${refNo}? This will forward it to the CEO for review.`,
                          confirmLabel: "Verify Claim",
                          confirmVariant: "primary",
                          withNote: true,
                          noteRequired: false,
                          notePlaceholder: "Add optional note for CEO review...",
                          noteLabel: "Note for CEO Review",
                          onConfirm: (note) => onTransition(claim.id, "verified", note, "ceo"),
                        })
                      }
                      className="p-3.5 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-teal-950">Verify Claim</h4>
                        <p className="text-xs text-teal-800/80 font-medium mt-0.5">
                          Confirm receipts and forward claim to CEO for review
                        </p>
                      </div>
                    </div>

                    {(currentStatus === "submitted" || currentStatus === "new") && (
                      <div
                        onClick={() => {
                          close();
                          if (onOpenFeedback) onOpenFeedback(claim);
                        }}
                        className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Clock3 size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-amber-950">Send to Pending</h4>
                          <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                            Request additional receipt documents or feedback from claimant
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() =>
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
                        })
                      }
                      className="p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-100/70 border border-red-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <XCircle size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-red-950">Reject Claim</h4>
                        <p className="text-xs text-red-800/80 font-medium mt-0.5">
                          Decline this expense claim with notification to claimant
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. CEO actions */}
                {(currentStatus === "verified" || currentStatus === "further_approval_approved" || currentStatus === "further_approval_rejected") && isCEO && (
                  <>
                    <div
                      onClick={() =>
                        requestConfirmation({
                          title: "Approve for Payment",
                          message: `Are you sure you want to approve claim ${refNo} for payment? This will forward it to the Accountant for disbursement.`,
                          confirmLabel: "Approve for Payment",
                          confirmVariant: "primary",
                          withNote: true,
                          noteRequired: false,
                          notePlaceholder: "Payment disbursement instructions for Accountant...",
                          noteLabel: "Note for Accountant",
                          onConfirm: (note) => onTransition(claim.id, "approved_for_payment", note, "accountant"),
                        })
                      }
                      className="p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <CircleDollarSign size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-emerald-950">Approve for Payment</h4>
                        <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                          Authorize accountant to disburse funds to claimant
                        </p>
                      </div>
                    </div>

                    {(currentStatus === "verified" || currentStatus === "further_approval_rejected") && (
                      <div
                        onClick={() =>
                          requestConfirmation({
                            title: "Send for Further Approval",
                            message: `Are you sure you want to send claim ${refNo} to the Board of Directors for further approval?`,
                            confirmLabel: "Send for Further Approval",
                            confirmVariant: "warning",
                            withNote: true,
                            noteRequired: false,
                            notePlaceholder: "Justification for Board approval...",
                            noteLabel: "Note for Board Review",
                            onConfirm: (note) => onTransition(claim.id, "further_approval", note, "chairman"),
                          })
                        }
                        className="p-3.5 rounded-2xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-purple-950">Send for Further Approval</h4>
                          <p className="text-xs text-purple-800/80 font-medium mt-0.5">
                            Escalate claim to Board Chairman for high-value review
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() =>
                        requestConfirmation({
                          title: "Return Claim to Financial Officer",
                          message: `Are you sure you want to return claim ${refNo} to the Financial Officer? It will move back to the Submitted Claims list for re-evaluation.`,
                          confirmLabel: "Reverse to Fin. Officer",
                          confirmVariant: "warning",
                          withNote: true,
                          noteRequired: false,
                          notePlaceholder: "Instructions / reason for return to Financial Officer...",
                          noteLabel: "Return Reason / Note",
                          onConfirm: (note) => onTransition(claim.id, "submitted", note, "financial_officer"),
                        })
                      }
                      className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <RotateCcw size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-amber-950">Reverse to Fin. Officer</h4>
                        <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                          Return to Financial Officer for re-verification
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() =>
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
                        })
                      }
                      className="p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-100/70 border border-red-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <XCircle size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-red-950">Reject Claim</h4>
                        <p className="text-xs text-red-800/80 font-medium mt-0.5">
                          Permanently decline this expense claim
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* 5. Chairman actions */}
                {currentStatus === "further_approval" && isChairman && (
                  <>
                    <div
                      onClick={() =>
                        requestConfirmation({
                          title: "Further Approval - Approve",
                          message: `Are you sure you want to approve claim ${refNo}? The status will update to Further Approval Approved and return to the CEO for payment authorization.`,
                          confirmLabel: "Approve Claim",
                          confirmVariant: "primary",
                          withNote: true,
                          noteRequired: false,
                          notePlaceholder: "Board resolution / approval note for CEO...",
                          noteLabel: "Board Note for CEO",
                          onConfirm: (note) => onTransition(claim.id, "further_approval_approved", note, "ceo"),
                        })
                      }
                      className="p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-emerald-950">Board Approve — Return to CEO</h4>
                        <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                          Authorize board approval and return to CEO for payment release
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        requestConfirmation({
                          title: "Further Approval - Reject",
                          message: `Are you sure you want to reject claim ${refNo}? The status will update to Further Approval Rejected and return to the CEO for review.`,
                          confirmLabel: "Reject — Return to CEO",
                          confirmVariant: "danger",
                          withNote: true,
                          noteRequired: false,
                          notePlaceholder: "Reason for Board rejection...",
                          noteLabel: "Rejection Reason for CEO",
                          onConfirm: (note) => onTransition(claim.id, "further_approval_rejected", note, "ceo"),
                        })
                      }
                      className="p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-100/70 border border-red-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <XCircle size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-red-950">Board Reject — Return to CEO</h4>
                        <p className="text-xs text-red-800/80 font-medium mt-0.5">
                          Reject board request and return to CEO
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* 6. Accountant actions */}
                {currentStatus === "approved_for_payment" && isAccountant && (
                  <div
                    onClick={() =>
                      requestConfirmation({
                        title: "Confirm Payment Disbursed",
                        message: `Are you sure you want to mark claim ${refNo} as Paid?`,
                        confirmLabel: "Mark as Paid",
                        confirmVariant: "primary",
                        withNote: true,
                        noteRequired: false,
                        notePlaceholder: "Payment transaction note / reference...",
                        noteLabel: "Disbursement Note",
                        onConfirm: (note) => onTransition(claim.id, "paid", note, "user"),
                      })
                    }
                    className="p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Wallet size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-emerald-950">Mark as Paid</h4>
                      <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                        Confirm funds disbursement and finalize claim
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. Claimant Resubmit action */}
                {currentStatus === "pending" && (role === "user" || isFO) && (
                  <div
                    onClick={() =>
                      requestConfirmation({
                        title: "Resubmit Expense Claim",
                        message: `Are you sure you want to resubmit claim ${refNo}? It will move to the Submitted Claims list for review.`,
                        confirmLabel: "Resubmit",
                        confirmVariant: "primary",
                        withNote: true,
                        noteRequired: false,
                        notePlaceholder: "Note on modifications made...",
                        noteLabel: "Resubmission Note",
                        onConfirm: (note) => onTransition(claim.id, "submitted", note, "financial_officer"),
                      })
                    }
                    className="p-3.5 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <RotateCcw size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-teal-950">Resubmit Claim</h4>
                      <p className="text-xs text-teal-800/80 font-medium mt-0.5">
                        Resubmit updated claim for verification review
                      </p>
                    </div>
                  </div>
                )}

                {/* 8. Super Admin Delete / Move to Trash action (Strictly restricted to super_admin) */}
                {role === "super_admin" && view !== "manage-claim-sheet" && (
                  <div
                    onClick={() =>
                      requestConfirmation({
                        title: "Move Claim to Trash",
                        message: `Are you sure you want to delete claim ${refNo}? It will be moved to the Deleted Claims trash and can be restored at any time.`,
                        confirmLabel: "Move to Trash",
                        confirmVariant: "danger",
                        withNote: false,
                        onConfirm: () => onDelete(claim.id),
                      })
                    }
                    className="p-3.5 rounded-2xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Trash2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-rose-950">Move to Trash</h4>
                      <p className="text-xs text-rose-800/80 font-medium mt-0.5">
                        Move claim to trash (Super Admin can restore anytime)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={close}
                  className="px-5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Embedded Document Viewer Modal */}
      {viewingFile && (
        <DocumentViewerModal
          file={viewingFile}
          claim={claim}
          onClose={() => setViewingFile(null)}
        />
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
