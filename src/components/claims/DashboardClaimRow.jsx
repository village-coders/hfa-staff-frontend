import React from "react";
import { useNavigate } from "react-router-dom";
import { FileEdit, AlertCircle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { fmtN } from "../../constants/theme";
import ClaimActions from "./ClaimActions";

export default function DashboardClaimRow({
  claim,
  role,
  onTransition,
  onOpenFeedback,
  onDelete,
  onViewDetails,
}) {
  const navigate = useNavigate();
  const refNo = claim.id || claim.claimRefNo || "Claim";
  const isPending = (claim.status || "").toLowerCase() === "pending";

  const pendingReason = (() => {
    if (!isPending) return null;
    if (claim.officerNote) return claim.officerNote;
    if (Array.isArray(claim.notes)) {
      const p = [...claim.notes].reverse().find(
        (n) =>
          ((n.toStatus || n.status || "").toLowerCase() === "pending") ||
          (n.text && n.text.toLowerCase().includes("pending"))
      );
      if (p) return p.text || p.note || "";
    }
    if (claim.note) return claim.note;
    return null;
  })();

  const handleRowClick = () => {
    if (onViewDetails) onViewDetails(claim);
  };

  return (
    <>
      {/* ── Desktop table row ── */}
      <tr
        onClick={handleRowClick}
        className="hidden sm:table-row hover:bg-teal-50/40 transition-colors cursor-pointer group"
        title="Click to view full claim details"
      >
        <td className="px-5 py-4 whitespace-nowrap">
          <span
            className="font-mono font-bold text-slate-800 bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-900 px-2.5 py-1 rounded-lg text-xs border border-slate-200 transition-colors inline-block select-all"
            title={`Claim ID: ${refNo}`}
          >
            {refNo}
          </span>
        </td>
        <td className="px-5 py-4 font-semibold text-teal-800 whitespace-nowrap">
          {claim.companyName || claim.contactPerson || "—"}
        </td>
        <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
          {claim.claimant || claim.claimantName || "User"}
        </td>
        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
          {claim.dept || claim.department || "Operations"}
        </td>
        <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
          {fmtN(claim.amount || 0)}
        </td>
        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
          <div className="text-xs font-semibold text-slate-800">
            {claim.filingDate || claim.date || "N/A"}
          </div>
          {(claim.status || "").toLowerCase() === "paid" ? (
            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
              Paid: {claim.paidDate || (Array.isArray(claim.history) && [...claim.history].reverse().find((h) => (h.toStatus || h.status || "").toLowerCase() === "paid")?.timestamp?.slice(0, 10)) || claim.updatedAt?.slice(0, 10) || "—"}
            </div>
          ) : (
            <div className="text-[11px] font-bold text-teal-700 mt-0.5">
              Exp: {claim.expenseDate || claim.filingDate || claim.date || "—"}
            </div>
          )}
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <StatusBadge status={claim.status || "new"} />
        </td>
        <td
          className="px-3 py-4 text-center whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-flex items-center justify-center gap-1.5">
            {isPending && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/claims/edit/${refNo}`, { state: { claimToEdit: claim } })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title={`Edit & correct claim ${refNo} (Pending)`}
              >
                <FileEdit size={12} />
                <span>Edit</span>
              </button>
            )}
            <ClaimActions
              claim={claim}
              view="dashboard"
              role={role}
              onTransition={onTransition}
              onOpenFeedback={onOpenFeedback}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          </div>
        </td>
      </tr>

      {/* ── Mobile card ── */}
      <tr className="sm:hidden">
        <td colSpan={8} className="px-0 py-0 border-b border-slate-100">
          <div
            onClick={handleRowClick}
            className="p-4 cursor-pointer active:bg-teal-50/60 transition-colors"
          >
            {/* Top row: ID + Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200 inline-block">
                {refNo}
              </span>
              <StatusBadge status={claim.status || "new"} />
            </div>

            {/* Company name */}
            <p className="text-sm font-bold text-teal-800 truncate mb-0.5">
              {claim.companyName || claim.contactPerson || "—"}
            </p>

            {/* Claimant + Dates */}
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
              <span className="font-semibold text-slate-800">
                {claim.claimant || claim.claimantName || "User"}
              </span>
              {(claim.status || "").toLowerCase() === "paid" ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Paid: {claim.paidDate || (Array.isArray(claim.history) && [...claim.history].reverse().find((h) => (h.toStatus || h.status || "").toLowerCase() === "paid")?.timestamp?.slice(0, 10)) || claim.updatedAt?.slice(0, 10) || "—"}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Exp: {claim.expenseDate || claim.filingDate || claim.date || "—"}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="truncate max-w-[160px] text-slate-500">{claim.title || "Claim"}</span>
              <span>Filed: {claim.filingDate || claim.date || "—"}</span>
            </div>

            {/* Pending Reason Banner on Mobile */}
            {isPending && (
              <div className="my-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wide text-amber-800">
                    <AlertCircle size={12} className="text-amber-600" /> Correction Requested
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/claims/edit/${refNo}`, { state: { claimToEdit: claim } });
                    }}
                    className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <FileEdit size={11} /> Edit
                  </button>
                </div>
                {pendingReason && (
                  <p className="line-clamp-2 text-[11px] font-medium text-amber-950 italic">
                    "{pendingReason}"
                  </p>
                )}
              </div>
            )}

            {/* Amount + Action */}
            <div
              className="flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-base font-black text-slate-900">
                {fmtN(claim.amount || 0)}
              </span>
              <div className="flex items-center gap-1.5">
                {isPending && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/claims/edit/${refNo}`, { state: { claimToEdit: claim } })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    title={`Edit & correct claim ${refNo} (Pending)`}
                  >
                    <FileEdit size={12} />
                    <span>Edit</span>
                  </button>
                )}
                <ClaimActions
                  claim={claim}
                  view="dashboard"
                  role={role}
                  onTransition={onTransition}
                  onOpenFeedback={onOpenFeedback}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
