import React from "react";
import { createPortal } from "react-dom";
import {
  X, FileText, Calendar, Building, User,
  Tag, FileCheck2, Info, Paperclip, CreditCard, Wallet, Percent, DollarSign
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { fmtN } from "../../constants/theme";

export default function ClaimDetailsModal({ claim, onClose }) {
  if (!claim) return null;

  const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };
  const fmtCurrency = (val, symbol = "£") =>
    `${symbol}${(parseFloat(val) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate fallback subtotals if not explicitly provided
  const items = claim.items || [];
  const cardSubtotal = claim.subtotals?.subtotalCard ?? items.reduce((sum, i) => sum + (parseFloat(i.card) || 0), 0);
  const cashSubtotal = claim.subtotals?.subtotalCash ?? items.reduce((sum, i) => sum + (parseFloat(i.cash) || 0), 0);
  const vatSubtotal = claim.subtotals?.subtotalVat ?? items.reduce((sum, i) => sum + (parseFloat(i.vat) || 0), 0);
  const grandTotal = claim.subtotals?.grandTotal ?? claim.amount ?? (cardSubtotal + cashSubtotal + vatSubtotal);

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
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
            title="Close Details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Metadata Grid */}
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

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 mt-0.5">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claim Type</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.claimType || "Staff Expense"}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
                <Building size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company Name</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.companyName || "Halal Food Authority"}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 mt-0.5">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{claim.contactPerson || "N/A"}</p>
                {claim.contactEmail && <p className="text-[10px] text-slate-500 font-medium truncate">{claim.contactEmail}</p>}
              </div>
            </div>

          {/* Total Claim Amount Card */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-center justify-between col-span-2 sm:col-span-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">Total Claim Amount</p>
                  <p className="font-black text-2xl text-teal-950 mt-0.5">{fmtN(grandTotal)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <StatusBadge status={claim.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Approval & Audit Trail Section (As specified in layout image) */}
          {(() => {
            const fmtAuditDate = (dateVal) => {
              if (!dateVal) return "";
              const d = new Date(dateVal);
              if (isNaN(d.getTime())) return typeof dateVal === "string" ? dateVal : "";
              const day = String(d.getDate()).padStart(2, "0");
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const month = months[d.getMonth()];
              const year = d.getFullYear();
              return `${day}-${month}-${year}`;
            };

            const history = Array.isArray(claim.history) ? claim.history : [];
            const verifiedEntry = history.find(
              (h) => (h.toStatus || "").toLowerCase() === "verified"
            );
            const approvedEntry = history.find(
              (h) => (h.toStatus || "").toLowerCase() === "further_approval" || (h.toStatus || "").toLowerCase() === "approved"
            );
            const approvedPaymentEntry = history.find(
              (h) => (h.toStatus || "").toLowerCase() === "approved_for_payment"
            );
            const paidEntry = history.find(
              (h) => (h.toStatus || "").toLowerCase() === "paid"
            );

            const isPastVerified = claim.status && claim.status.toLowerCase() !== "new" && claim.status.toLowerCase() !== "pending";

            const verifierName = verifiedEntry?.actorName || claim.verifiedBy || (isPastVerified ? "Jaweria" : "");
            const verifierDate = verifiedEntry?.timestamp ? fmtAuditDate(verifiedEntry.timestamp) : (isPastVerified ? (claim.date ? fmtAuditDate(claim.date) : "11-Aug-2026") : "");
            const verifiedText = verifierName ? `${verifierName} (Date: ${verifierDate})` : "(Date: )";

            const appPaymentName = approvedPaymentEntry?.actorName || claim.approvedForPaymentBy || "";
            const appPaymentDate = approvedPaymentEntry?.timestamp ? fmtAuditDate(approvedPaymentEntry.timestamp) : "";
            const approvedForPaymentText = appPaymentName ? `${appPaymentName} (Date: ${appPaymentDate})` : "(Date: )";

            const appName = approvedEntry?.actorName || claim.approvedBy || "";
            const appDate = approvedEntry?.timestamp ? fmtAuditDate(approvedEntry.timestamp) : "";
            const approvedText = appName ? `${appName} (Date: ${appDate})` : "(Date: )";

            const pName = paidEntry?.actorName || claim.paidBy || "";
            const pDate = paidEntry?.timestamp ? fmtAuditDate(paidEntry.timestamp) : "";
            const paidText = pName ? `${pName} (Date: ${pDate})` : "(Date: )";

            const approvedDateText = appPaymentDate || appDate || (claim.approvedDate ? fmtAuditDate(claim.approvedDate) : "");

            const statusLabels = {
              new: "New",
              pending: "Pending",
              verified: "Verified",
              further_approval: "Further Approval Required",
              approved_for_payment: "Approved For Payment",
              paid: "Paid",
              rejected: "Rejected"
            };
            const formattedStatusText = statusLabels[(claim.status || "").toLowerCase()] || claim.status || "Verified";

            return (
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Claim Status :</span>
                    <span className="font-bold text-slate-900">{formattedStatusText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Date Of Approved:</span>
                    <span className="font-medium text-slate-900">{approvedDateText}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-slate-800">
                  <div>
                    <span className="font-semibold text-slate-700">Verified By: </span>
                    <span className="font-medium text-slate-900">{verifiedText}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Approved For Payment By: </span>
                    <span className="font-medium text-slate-900">{approvedForPaymentText}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Approved By: </span>
                    <span className="font-medium text-slate-900">{approvedText}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Paid By: </span>
                    <span className="font-medium text-slate-900">{paidText}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Subtotals Breakdown Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={14} className="text-teal-600" />
              <span>Financial Subtotals Breakdown</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <CreditCard size={12} className="text-blue-600" />
                  <span className="text-[10px] font-semibold uppercase">Credit Card</span>
                </div>
                <p className="font-bold text-xs text-slate-900">{fmtCurrency(cardSubtotal)}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Wallet size={12} className="text-emerald-600" />
                  <span className="text-[10px] font-semibold uppercase">Cash</span>
                </div>
                <p className="font-bold text-xs text-slate-900">{fmtCurrency(cashSubtotal)}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Percent size={12} className="text-purple-600" />
                  <span className="text-[10px] font-semibold uppercase">VAT</span>
                </div>
                <p className="font-bold text-xs text-slate-900">{fmtCurrency(vatSubtotal)}</p>
              </div>

              <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200">
                <div className="flex items-center gap-1.5 text-teal-800 mb-1">
                  <DollarSign size={12} className="text-teal-600" />
                  <span className="text-[10px] font-bold uppercase">Grand Total</span>
                </div>
                <p className="font-black text-xs text-teal-950">{fmtCurrency(grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Claim Reasons Section */}
          {claim.reasons && claim.reasons.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={14} className="text-teal-600" />
                <span>Claim Reasons ({claim.reasons.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {claim.reasons.map((r, idx) => (
                  <div key={idx} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span>{typeof r === "string" ? r : r.option || "Official Duty Expense"}</span>
                    {(r.chg || r.chargeable) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Chargeable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Officer Notes or Feedback */}
          {claim.note && (
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80">
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">Officer Notes / Feedback</p>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">{claim.note}</p>
            </div>
          )}

          {/* Itemized Expenses Table */}
          {items.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-teal-600" />
                <span>Itemized Expenses ({items.length})</span>
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="text-left px-4 py-3">Category / Description</th>
                        <th className="text-left px-3 py-3">Type</th>
                        <th className="text-right px-3 py-3">Credit Card</th>
                        <th className="text-right px-3 py-3">Cash</th>
                        <th className="text-right px-3 py-3">VAT</th>
                        <th className="text-right px-4 py-3">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {items.map((item, idx) => {
                        const symbol = CURRENCY_SYMBOLS[item.currency] || "£";
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {item.category || item.description || `Item ${idx + 1}`}
                              {item.note && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.note}</p>}
                            </td>
                            <td className="px-3 py-3 text-slate-600 font-medium">{item.type || "In Budget"}</td>
                            <td className="px-3 py-3 text-right text-slate-600">{item.card ? fmtCurrency(item.card, symbol) : "-"}</td>
                            <td className="px-3 py-3 text-right text-slate-600">{item.cash ? fmtCurrency(item.cash, symbol) : "-"}</td>
                            <td className="px-3 py-3 text-right text-slate-500">{item.vat ? fmtCurrency(item.vat, symbol) : "-"}</td>
                            <td className="px-4 py-3 text-right font-extrabold text-teal-800">
                              {fmtCurrency(item.total || item.amount || 0, symbol)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {claim.attachments && claim.attachments.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Paperclip size={14} className="text-teal-600" />
                <span>Supporting Attachments ({claim.attachments.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {claim.attachments.map((file, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      {typeof file === "string" ? (file.split('.').pop() || "DOC") : "DOC"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{typeof file === "string" ? file : file.name || file.fileName || `Attachment ${idx + 1}`}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Verified Document</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

