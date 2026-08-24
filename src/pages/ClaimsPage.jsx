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
  const [search, setSearch] = useState("");
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);

  let filtered = viewKey === "all-claims-list"
    ? (claims || [])
    : (item && item.status)
      ? (claims || []).filter((c) => c && c.status === item.status)
      : (claims || []);

  // Role-based visibility filtering
  if (role === "user") {
    filtered = filtered.filter((c) => c && (c.claimant === currentUser || c.claimantName === currentUser));
  } else if (role === "ceo") {
    filtered = filtered.filter((c) => c && (c.status === "verified" || c.claimant === currentUser || c.claimantName === currentUser));
  } else if (role === "chairman") {
    filtered = filtered.filter((c) => c && c.status === "further_approval");
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

  const pageSize = 10;
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
            <div className="overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="text-left px-5 py-3">Claim ID</th>
                    <th className="text-left px-5 py-3">Claimant</th>
                    <th className="text-left px-5 py-3">Title</th>
                    <th className="text-left px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c, idx) => (
                    <tr key={c.id || c._id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-teal-800 whitespace-nowrap">{c.id || c.claimRefNo || c._id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{c.claimant || c.claimantName || "User"}</td>
                      <td className="px-5 py-3.5 text-slate-700">{c.title || "General Expense Claim"}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{fmtN(c.amount || 0)}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{c.date || "N/A"}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status || "new"} /></td>
                      <td className="px-5 py-3.5">
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
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} totalItems={filtered.length} pageSize={pageSize} />
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
