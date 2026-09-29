import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ClaimActions from "../components/claims/ClaimActions";
import ClaimDetailsModal from "../components/claims/ClaimDetailsModal";
import { useApp } from "../context/AppContext";
import { CLAIM_ITEMS, PATH_TO_VIEW } from "../constants/menu";
import { fmtN } from "../constants/theme";

export default function ClaimsPage() {
  const location = useLocation();
  const { role, claims, currentUser, handleTransition, handleDeleteClaim, openClaimDetails } = useApp();

  const viewKey = PATH_TO_VIEW[location.pathname] || "all-claims-list";
  const item = CLAIM_ITEMS.find((i) => i.key === viewKey) || CLAIM_ITEMS[1];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);

  let filtered = viewKey === "all-claims-list"
    ? (claims || [])
    : (item && item.status)
      ? (claims || []).filter((c) => {
          if (!c) return false;
          if (item.status === "submitted" || item.status === "new") {
            return c.status === "submitted" || c.status === "new";
          }
          if (item.status === "verified") {
            return (
              c.status === "verified" ||
              c.status === "further_approval_approved" ||
              c.status === "further_approval_rejected"
            );
          }
          if (item.status === "further_approval") {
            return (
              c.status === "further_approval" ||
              c.status === "further_approval_approved" ||
              c.status === "further_approval_rejected"
            );
          }
          return c.status === item.status;
        })
      : (claims || []);

  // Role-based visibility filtering
  if (role === "user") {
    filtered = filtered.filter((c) => c && (c.claimant === currentUser || c.claimantName === currentUser));
  } else if (role === "ceo") {
    filtered = filtered.filter(
      (c) =>
        c &&
        (c.status === "verified" ||
          c.status === "further_approval" ||
          c.status === "further_approval_approved" ||
          c.status === "further_approval_rejected" ||
          c.status === "approved_for_payment" ||
          c.status === "paid" ||
          c.claimant === currentUser ||
          c.claimantName === currentUser)
    );
  } else if (role === "chairman") {
    filtered = filtered.filter(
      (c) =>
        c &&
        (c.status === "further_approval" ||
          c.status === "further_approval_approved" ||
          c.status === "further_approval_rejected")
    );
  } else if (role === "accountant") {
    filtered = filtered.filter(
      (c) =>
        c &&
        (c.status === "approved_for_payment" ||
          c.status === "paid" ||
          c.claimant === currentUser ||
          c.claimantName === currentUser)
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c &&
        (((c.claimant || c.claimantName || "").toLowerCase().includes(q)) ||
          ((c.id || c.claimRefNo || "").toLowerCase().includes(q)) ||
          ((c.title || "").toLowerCase().includes(q)))
    );
  }

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const submitFeedback = () => {
    if (feedbackClaim) {
      handleTransition(feedbackClaim.id, "pending", feedbackText);
      setFeedbackClaim(null);
      setFeedbackText("");
    }
  };

  const countSubtitle = useMemo(() => {
    if (role === "admin" || role === "financial_officer") {
      return `${filtered.length} total claim${filtered.length !== 1 ? "s" : ""} recorded`;
    }
    if (role === "ceo" && viewKey === "verified-list") {
      return `${filtered.length} verified claim${filtered.length !== 1 ? "s" : ""} awaiting your review`;
    }
    if (role === "ceo" && viewKey === "further-approval") {
      return `${filtered.length} claim${filtered.length !== 1 ? "s" : ""} sent for Board approval`;
    }
    if (role === "chairman" && viewKey === "further-approval") {
      return `${filtered.length} claim${filtered.length !== 1 ? "s" : ""} awaiting Board approval`;
    }
    return `${filtered.length} claim${filtered.length !== 1 ? "s" : ""} in your list`;
  }, [role, viewKey, filtered.length]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{item.label}</h2>
          <p className="text-xs text-slate-500 font-medium">{countSubtitle}</p>
        </div>
        <div className="flex items-center rounded-xl border border-slate-200 px-3.5 py-2 bg-white w-full sm:w-64 shadow-sm">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search claimant, ID..."
            className="ml-2 text-xs outline-none w-full bg-white text-slate-800 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState icon={item.icon} title="Nothing here yet" subtitle={`No claims currently sit in ${item.label.toLowerCase()}.`} />
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paged.map((c, idx) => {
                const cRef = c.id || c.claimRefNo || "Claim";
                return (
                  <div
                    key={c.id || c._id || idx}
                    onClick={() => openClaimDetails(c)}
                    className="p-4 cursor-pointer active:bg-teal-50/60 transition-colors"
                  >
                    {/* Top: ID + Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                        {cRef}
                      </span>
                      <StatusBadge status={c.status || "new"} />
                    </div>

                    {/* Company */}
                    <p className="text-sm font-bold text-teal-800 truncate mb-0.5">
                      {c.companyName || c.contactPerson || "—"}
                    </p>

                    {/* Claimant + Date */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-medium text-slate-700">{c.claimant || c.claimantName || "User"}</span>
                      <span>{c.date || "N/A"}</span>
                    </div>

                    {/* Amount + Action */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-base font-black text-slate-900">{fmtN(c.amount || 0)}</span>
                      <ClaimActions
                        claim={c}
                        view={viewKey}
                        role={role}
                        onTransition={handleTransition}
                        onOpenFeedback={setFeedbackClaim}
                        onDelete={handleDeleteClaim}
                        onViewDetails={(claim) => openClaimDetails(claim)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="text-left px-4 py-3 w-32 whitespace-nowrap">Claim ID</th>
                    <th className="text-left px-4 py-3 min-w-[220px]">Company Name</th>
                    <th className="text-left px-4 py-3 w-40 whitespace-nowrap">Claimant</th>
                    <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Amount</th>
                    <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Date</th>
                    <th className="text-left px-3 py-3 w-32 whitespace-nowrap">Status</th>
                    <th className="text-center px-3 py-3 w-16 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c, idx) => {
                    const cRef = c.id || c.claimRefNo || "Claim";
                    return (
                      <tr
                        key={c.id || c._id || idx}
                        onClick={() => openClaimDetails(c)}
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                        title="Click to view full claim details"
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className="font-mono font-bold text-slate-800 bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-900 px-2.5 py-1 rounded-lg text-xs border border-slate-200 transition-colors inline-block select-all"
                            title={`Claim ID: ${cRef}`}
                          >
                            {cRef}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-teal-800 min-w-[220px]">
                          {c.companyName || c.contactPerson || "—"}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                          {c.claimant || c.claimantName || "User"}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          {fmtN(c.amount || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {c.date || "N/A"}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <StatusBadge status={c.status || "new"} />
                        </td>
                        <td
                          className="px-3 py-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ClaimActions
                            claim={c}
                            view={viewKey}
                            role={role}
                            onTransition={handleTransition}
                            onOpenFeedback={setFeedbackClaim}
                            onDelete={handleDeleteClaim}
                            onViewDetails={(claim) => openClaimDetails(claim)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              setPage={setPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackClaim && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-scale-in my-auto">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Send to Pending</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">To {feedbackClaim.claimant || feedbackClaim.claimantName} regarding {feedbackClaim.id}.</p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="e.g. Please attach a valid receipt..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 outline-none mb-4 focus:border-teal-500 focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFeedbackClaim(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors cursor-pointer"
              >
                Send to Pending
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
