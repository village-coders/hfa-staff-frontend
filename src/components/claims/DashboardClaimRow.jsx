import React from "react";
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
  const refNo = claim.id || claim.claimRefNo || "Claim";

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
          {claim.date || "N/A"}
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <StatusBadge status={claim.status || "new"} />
        </td>
        <td
          className="px-3 py-4 text-center whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <ClaimActions
            claim={claim}
            view="dashboard"
            role={role}
            onTransition={onTransition}
            onOpenFeedback={onOpenFeedback}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
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

            {/* Claimant + Date */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-700">
                {claim.claimant || claim.claimantName || "User"}
              </span>
              <span>{claim.date || "N/A"}</span>
            </div>

            {/* Amount + Action */}
            <div
              className="flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-base font-black text-slate-900">
                {fmtN(claim.amount || 0)}
              </span>
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
        </td>
      </tr>
    </>
  );
}
