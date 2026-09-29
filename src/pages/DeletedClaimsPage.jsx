import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2, RotateCcw, Search, Eye, AlertTriangle, ShieldAlert,
  Calendar, User, Building, DollarSign, CheckCircle2, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import ClaimDetailsModal from "../components/claims/ClaimDetailsModal";
import { useApp } from "../context/AppContext";
import { fmtN } from "../constants/theme";

export default function DeletedClaimsPage() {
  const navigate = useNavigate();
  const {
    role,
    deletedClaims,
    loadingDeleted,
    fetchDeletedClaims,
    handleRestoreClaim,
    handlePurgeClaim,
    openClaimDetails
  } = useApp();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [selectedClaimForModal, setSelectedClaimForModal] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);

  useEffect(() => {
    if (role === "super_admin") {
      fetchDeletedClaims();
    }
  }, [role]);

  // Non-super-admin access guard
  if (role !== "super_admin") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 animate-fade-in my-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Super Admin Access Required</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          The Trash and Claim Restoration page is strictly restricted to Super Administrators. You do not have sufficient permissions to view deleted records.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Filter deleted claims
  let filtered = deletedClaims || [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.id || c.claimRefNo || "").toLowerCase().includes(q) ||
        (c.claimant || c.claimantName || "").toLowerCase().includes(q) ||
        (c.companyName || "").toLowerCase().includes(q) ||
        (c.title || "").toLowerCase().includes(q)
    );
  }

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold shadow-2xs">
              <Trash2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trash / Deleted Claims</h2>
              <p className="text-xs text-slate-500 font-medium">
                {filtered.length} deleted claim{filtered.length !== 1 ? "s" : ""} in trash • Super Admin restore & permanent purge controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 px-3.5 py-2 bg-white w-full sm:w-64 shadow-xs">
            <Search size={15} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search Claim ID, claimant..."
              className="ml-2 text-xs outline-none w-full bg-white text-slate-800 font-medium"
            />
          </div>

          <button
            onClick={() => fetchDeletedClaims()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh Trash List"
          >
            <RotateCcw size={14} className={loadingDeleted ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-bold">Trash Retention & Restoration Safety</p>
          <p className="mt-0.5 text-amber-800/90 leading-relaxed font-normal">
            Claims moved to trash are hidden from all regular views and dashboards. You can restore any claim back to its exact previous approval status with its audit trail intact, or choose to permanently purge it.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Trash is Empty"
            subtitle="There are currently no deleted claims in the trash."
          />
        ) : (
          <>
            {/* ── Mobile cards ── */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paged.map((c, idx) => {
                const cRef = c.id || c.claimRefNo || "Claim";
                return (
                  <div key={c.id || c._id || idx} className="p-4">
                    {/* Top: ID + prior status */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setSelectedClaimForModal(c)}
                        className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200 hover:bg-teal-50 transition-colors"
                      >
                        {cRef}
                      </button>
                      <StatusBadge status={c.previousStatus || c.status || "submitted"} />
                    </div>

                    {/* Company */}
                    <p className="text-sm font-bold text-slate-800 truncate mb-0.5">{c.companyName || "—"}</p>

                    {/* Claimant + amount */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-medium text-slate-700">{c.claimant || c.claimantName || "User"}</span>
                      <span className="font-black text-slate-900 text-sm">{fmtN(c.amount || 0)}</span>
                    </div>

                    {/* Deleted info */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span>Deleted: {c.deletedAt || c.date || "N/A"}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {c.deletedBy || "super_admin"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedClaimForModal(c)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingConfirm({
                            title: "Restore Claim to Workflow",
                            message: `Restore claim ${cRef}? It will return to status "${(c.previousStatus || "submitted").toUpperCase()}".`,
                            confirmLabel: "Restore Claim",
                            confirmVariant: "primary",
                            onConfirm: () => handleRestoreClaim(c.id || c._id),
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingConfirm({
                            title: "Permanently Purge Claim",
                            message: `Permanently destroy claim ${cRef}? This cannot be undone.`,
                            confirmLabel: "Purge Forever",
                            confirmVariant: "danger",
                            onConfirm: () => handlePurgeClaim(c.id || c._id),
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Purge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="text-left px-5 py-3.5">Claim ID</th>
                    <th className="text-left px-5 py-3.5">Company Name</th>
                    <th className="text-left px-5 py-3.5">Claimant</th>
                    <th className="text-right px-5 py-3.5">Amount</th>
                    <th className="text-left px-5 py-3.5">Prior Status</th>
                    <th className="text-left px-5 py-3.5">Deleted Date</th>
                    <th className="text-left px-5 py-3.5">Deleted By</th>
                    <th className="text-center px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c, idx) => {
                    const cRef = c.id || c.claimRefNo || "Claim";
                    return (
                      <tr key={c.id || c._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className="font-mono font-bold text-slate-800 bg-slate-100 hover:bg-teal-100 hover:text-teal-900 px-2.5 py-1 rounded-lg text-xs border border-slate-200 transition-colors inline-block select-all cursor-pointer"
                            onClick={() => setSelectedClaimForModal(c)}
                            title="Click to inspect deleted claim details"
                          >
                            {cRef}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{c.companyName || "—"}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{c.claimant || c.claimantName || "User"}</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">{fmtN(c.amount || 0)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={c.previousStatus || c.status || "submitted"} /></td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{c.deletedAt || c.date || "N/A"}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            {c.deletedBy || "super_admin"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedClaimForModal(c)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingConfirm({
                                  title: "Restore Claim to Workflow",
                                  message: `Are you sure you want to restore claim ${cRef}? It will be returned to active claims under status "${(c.previousStatus || "submitted").toUpperCase()}".`,
                                  confirmLabel: "Restore Claim",
                                  confirmVariant: "primary",
                                  onConfirm: () => handleRestoreClaim(c.id || c._id),
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw size={13} />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingConfirm({
                                  title: "Permanently Purge Claim",
                                  message: `Are you sure you want to permanently destroy claim ${cRef}? This action cannot be undone and all records will be deleted forever.`,
                                  confirmLabel: "Purge Forever",
                                  confirmVariant: "danger",
                                  onConfirm: () => handlePurgeClaim(c.id || c._id),
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Purge</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > pageSize && (
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Claim Details Modal for inspecting deleted claims */}
      {selectedClaimForModal && (
        <ClaimDetailsModal
          claim={selectedClaimForModal}
          onClose={() => setSelectedClaimForModal(null)}
        />
      )}

      {/* Confirmation Modal */}
      {pendingConfirm && (
        <ConfirmModal
          isOpen={true}
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          confirmVariant={pendingConfirm.confirmVariant}
          withNote={false}
          onConfirm={pendingConfirm.onConfirm}
          onClose={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
