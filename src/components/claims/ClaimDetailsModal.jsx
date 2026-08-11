import React from "react";
import { createPortal } from "react-dom";
import { X, FileText, CheckCircle2, DollarSign, Calendar, Building, User, Tag, Package } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { fmtN } from "../../constants/theme";

export default function ClaimDetailsModal({ claim, assets = [], onClose }) {
  if (!claim) return null;

  // Filter linked assets if any match claim ID or claimant
  const linkedAssets = assets.filter(
    (a) => a.claimId === claim.id || a.assignedTo === claim.claimant
  );

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                  {claim.id}
                </span>
                <StatusBadge status={claim.status} />
              </div>
              <h3 className="font-extrabold text-base text-white mt-1 leading-snug">{claim.title || "Claim Details"}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 mt-0.5">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claimant</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.claimant || "N/A"}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 mt-0.5">
                <Building size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.dept || claim.department || "Operations"}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filing Date</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.date || "N/A"}</p>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-start gap-3 col-span-2 sm:col-span-3">
              <div className="p-2 rounded-xl bg-teal-600 text-white mt-0.5">
                <DollarSign size={18} />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">Total Amount Claimed</p>
                  <p className="font-black text-xl text-teal-900 mt-0.5">{fmtN(claim.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold">Payment Status</p>
                  <span className={`inline-block mt-1 text-xs font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    claim.status === "paid"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {claim.status === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes or Officer Feedback */}
          {claim.note && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60">
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">Officer Notes / Feedback</p>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">{claim.note}</p>
            </div>
          )}

          {/* Claim Items Breakdown (if available) */}
          {claim.items && claim.items.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-teal-600" />
                <span>Itemized Expenses ({claim.items.length})</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {claim.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.category || item.description || `Item ${idx + 1}`}</p>
                      {item.type && <p className="text-[10px] text-slate-500 font-medium">{item.type}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{fmtN(item.total || item.amount || 0)}</p>
                      {item.vat > 0 && <p className="text-[10px] text-slate-400">VAT: {fmtN(item.vat)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Assets Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Package size={14} className="text-teal-600" />
              <span>Associated Assets ({linkedAssets.length})</span>
            </h4>

            {linkedAssets.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">No assets explicitly assigned to this claim or claimant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkedAssets.map((asset) => (
                  <div key={asset.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {asset.id}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                          {asset.type || asset.category || "Asset"}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 mt-2">{asset.name || asset.title}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-normal">Valuation:</span>
                      <span className="font-bold text-slate-900">{fmtN(asset.value || asset.amount || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#054D66] hover:from-[#006670] hover:to-[#043D52] shadow-md transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
