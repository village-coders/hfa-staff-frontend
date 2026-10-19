import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, FileEdit, AlertCircle, X } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ClaimActions from "../components/claims/ClaimActions";
import ClaimDetailsModal from "../components/claims/ClaimDetailsModal";
import { useApp } from "../context/AppContext";
import { CLAIM_ITEMS, PATH_TO_VIEW } from "../constants/menu";
import { fmtN } from "../constants/theme";

const getPendingReason = (claim) => {
  if (!claim) return "";
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
  return "";
};

export default function ClaimsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, claims, currentUser, handleTransition, handleDeleteClaim, openClaimDetails, claimsLoading } = useApp();

  const viewKey = PATH_TO_VIEW[location.pathname] || "all-claims-list";
  const item = CLAIM_ITEMS.find((i) => i.key === viewKey) || CLAIM_ITEMS[1];
  const isPaidView = viewKey === "paid-list" || item?.status === "paid";

  const getPaidDate = (c) => {
    if (!c) return "N/A";
    if (c.paidDate) return c.paidDate;
    if (Array.isArray(c.history)) {
      const paidEntry = [...c.history].reverse().find(
        (h) => (h.toStatus || h.status || "").toLowerCase() === "paid"
      );
      if (paidEntry && (paidEntry.timestamp || paidEntry.date)) {
        const d = new Date(paidEntry.timestamp || paidEntry.date);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }
    if ((c.status || "").toLowerCase() === "paid") {
      if (c.updatedAt) {
        const d = new Date(c.updatedAt);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
      return c.filingDate || c.date || "N/A";
    }
    return "N/A";
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  });
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);

  // Sync state if URL query param changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get("search") || "";
    if (qParam !== search) {
      setSearch(qParam);
      setPage(1);
    }
  }, [location.search]);

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

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((c) => {
      if (!c) return false;
      const cRef = String(c.id || c.claimRefNo || "").toLowerCase();
      const claimantStr = typeof c.claimant === "string"
        ? c.claimant
        : (c.claimant?.fullName || c.claimant?.name || c.claimant?.username || c.claimantName || "");
      const claimant = String(claimantStr).toLowerCase();
      const claimantId = String(
        typeof c.claimantId === "object"
          ? (c.claimantId?._id || c.claimantId?.username || c.claimantId?.name || "")
          : (c.claimantId || "")
      ).toLowerCase();
      const company = String(c.companyName || "").toLowerCase();
      const title = String(c.title || "").toLowerCase();
      const dept = String(c.dept || c.department || "").toLowerCase();
      const claimType = String(c.claimType || "").toLowerCase();
      const contact = String(c.contactPerson || "").toLowerCase();
      const itemsMatch = Array.isArray(c.items) && c.items.some((it) =>
        String(it?.description || it?.desc || it?.name || "").toLowerCase().includes(q)
      );
      const reasonsMatch = Array.isArray(c.reasons) && c.reasons.some((r) =>
        String(typeof r === "string" ? r : (r?.reason || r?.description || "")).toLowerCase().includes(q)
      );

      return (
        cRef.includes(q) ||
        claimant.includes(q) ||
        claimantId.includes(q) ||
        company.includes(q) ||
        title.includes(q) ||
        dept.includes(q) ||
        claimType.includes(q) ||
        contact.includes(q) ||
        itemsMatch ||
        reasonsMatch
      );
    });
  }

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const submitFeedback = () => {
    const trimmed = (feedbackText || "").trim();
    if (!trimmed) {
      alert("Please provide a note/reason explaining why this claim requires correction before sending it to pending.");
      return;
    }
    if (feedbackClaim) {
      handleTransition(feedbackClaim.id, "pending", trimmed, "user");
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
        <div className="flex items-center rounded-xl border border-slate-200 px-3.5 py-2 bg-white w-full sm:w-72 shadow-sm">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search company, claimant, ID..."
            className="ml-2 text-xs outline-none w-full bg-white text-slate-800 font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setPage(1); }}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 flex-shrink-0 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {filtered.length === 0 ? (
          claimsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading claims…</p>
            </div>
          ) : (
            <EmptyState
              icon={item.icon}
              title={search ? "No matching claims found" : "Nothing here yet"}
              subtitle={
                search
                  ? `No records match "${search}". Try searching by another keyword, ID, claimant or company.`
                  : `No claims currently sit in ${item.label.toLowerCase()}.`
              }
            />
          )
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paged.map((c, idx) => {
                const cRef = c.id || c.claimRefNo || "Claim";
                const isPending = (c.status || "").toLowerCase() === "pending";
                const reason = isPending ? getPendingReason(c) : "";

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

                    {/* Claimant + Dates */}
                    <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                      <span className="font-semibold text-slate-800">{c.claimant || c.claimantName || "User"}</span>
                      {isPaidView ? (
                        <span className="text-[11px] text-emerald-850 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800">
                          Paid: {getPaidDate(c)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          Exp: {c.expenseDate || c.filingDate || c.date || "—"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="truncate max-w-[160px] text-slate-500">{c.title || "Claim"}</span>
                      <span>Filed: {c.filingDate || c.date || "—"}</span>
                    </div>

                    {/* Pending Correction Banner on Mobile */}
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
                              navigate(`/claims/edit/${cRef}`, { state: { claimToEdit: c } });
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <FileEdit size={11} /> Edit
                          </button>
                        </div>
                        {reason && (
                          <p className="line-clamp-2 text-[11px] font-medium text-amber-950 italic">
                            "{reason}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Amount + Action */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-base font-black text-slate-900">{fmtN(c.amount || 0)}</span>
                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/claims/edit/${cRef}`, { state: { claimToEdit: c } })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            title={`Edit & correct claim ${cRef} (Pending)`}
                          >
                            <FileEdit size={12} />
                            <span>Edit</span>
                          </button>
                        )}
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
                    <th className="text-left px-4 py-3 w-36 whitespace-nowrap">Claimant</th>
                    <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Amount</th>
                    <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Filing Date</th>
                    <th className="text-left px-4 py-3 w-28 whitespace-nowrap">{isPaidView ? "Paid Date" : "Expense Date"}</th>
                    <th className="text-left px-3 py-3 w-32 whitespace-nowrap">Status</th>
                    <th className="text-center px-3 py-3 w-16 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c, idx) => {
                    const cRef = c.id || c.claimRefNo || "Claim";
                    const isPending = (c.status || "").toLowerCase() === "pending";
                    const reason = isPending ? getPendingReason(c) : "";

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
                          <div>{c.companyName || c.contactPerson || "—"}</div>
                          {isPending && reason && (
                            <p className="text-[11px] font-medium text-amber-700 truncate max-w-xs mt-0.5 flex items-center gap-1" title={reason}>
                              <AlertCircle size={10} className="text-amber-500 flex-shrink-0" />
                              <span>Reason: {reason}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                          {c.claimant || c.claimantName || "User"}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          {fmtN(c.amount || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {c.filingDate || c.date || "N/A"}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPaidView ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block text-[11px]">
                              {getPaidDate(c)}
                            </span>
                          ) : (
                            <span className="font-bold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/80 inline-block text-[11px]">
                              {c.expenseDate || c.filingDate || c.date || "N/A"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <StatusBadge status={c.status || "new"} />
                        </td>
                        <td
                          className="px-3 py-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/claims/edit/${cRef}`, { state: { claimToEdit: c } })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                title={`Edit & correct claim ${cRef} (Pending)`}
                              >
                                <FileEdit size={12} />
                                <span>Edit</span>
                              </button>
                            )}
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
            <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Send to Pending (Correction Needed)
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-3">
              To {feedbackClaim.claimant || feedbackClaim.claimantName} regarding {feedbackClaim.id || feedbackClaim.claimRefNo}. The claimant will see this reason note and have an Edit button to correct and resubmit the claim.
            </p>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Instructions for Claimant <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="e.g. Please correct VAT calculation on receipt #2 and attach valid documentation, then send back to submitted claims..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 outline-none mb-4 focus:border-amber-500 focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFeedbackClaim(null);
                  setFeedbackText("");
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors cursor-pointer"
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
