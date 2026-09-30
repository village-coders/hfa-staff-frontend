import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, FileText, Calendar, Building, User,
  Tag, FileCheck2, Info, Paperclip, CreditCard, Wallet, Percent, DollarSign,
  MessageSquare, Lock, Shield, CheckCircle2, RotateCcw, XCircle, Eye, Printer, Download
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import ConfirmModal from "../ui/ConfirmModal";
import DocumentViewerModal from "./DocumentViewerModal";
import { fmtN, T } from "../../constants/theme";
import { useApp } from "../../context/AppContext";
import { printClaimVoucher } from "../../utils/printVoucher";

export default function ClaimDetailsModal({ claim, onClose }) {
  const { role, currentUser, handleTransition, transitioningId } = useApp();
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [viewingFile, setViewingFile] = useState(null);

  if (!claim) return null;

  const currentStatus = (claim.status || "").toLowerCase();
  const refNo = claim.id || claim.claimRefNo || "Claim";

  const isFO = role === "financial_officer" || role === "admin" || role === "super_admin";
  const isCEO = role === "ceo" || role === "admin" || role === "super_admin";
  const isChairman = role === "chairman" || role === "admin" || role === "super_admin";
  const isAccountant = role === "accountant" || role === "admin" || role === "super_admin";

  const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };
  const fmtCurrency = (val, symbol = "£") =>
    `${symbol}${(parseFloat(val) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate fallback subtotals if not explicitly provided
  const items = claim.items || [];
  const cardSubtotal = claim.subtotals?.subtotalCard ?? items.reduce((sum, i) => sum + (parseFloat(i.card) || 0), 0);
  const cashSubtotal = claim.subtotals?.subtotalCash ?? items.reduce((sum, i) => sum + (parseFloat(i.cash) || 0), 0);
  const vatSubtotal = claim.subtotals?.subtotalVat ?? items.reduce((sum, i) => sum + (parseFloat(i.vat) || 0), 0);
  const grandTotal = claim.subtotals?.grandTotal ?? claim.amount ?? (cardSubtotal + cashSubtotal);

  const claimAttachments = (Array.isArray(claim.attachments) && claim.attachments.length > 0)
    ? claim.attachments
    : (Array.isArray(claim.files) && claim.files.length > 0)
    ? claim.files
    : [];

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-4.5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 flex items-center justify-center font-bold flex-shrink-0 shadow-inner">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-extrabold text-teal-100 bg-white/15 px-3 py-1 rounded-lg border border-white/25 shadow-xs select-all">
                  {refNo}
                </span>
                <StatusBadge status={claim.status} />
                <span className="text-xs text-teal-100/80 font-medium hidden sm:inline">•</span>
                <span className="text-xs text-teal-100/90 font-semibold truncate hidden sm:inline">
                  {claim.companyName || "Halal Food Authority"}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white mt-1 leading-snug truncate" title={claim.title || "Expense Claim Record"}>
                {claim.title || "Expense Claim Record"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button
              type="button"
              onClick={() => printClaimVoucher(claim)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Print Claim Voucher"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={() => printClaimVoucher(claim)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 border border-teal-300/40 text-teal-100 hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Save Claim Voucher as PDF"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Save as PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-2xl transition-colors cursor-pointer"
              title="Close Details"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Content body - 2 Column Grid Layout to Drastically Reduce Scrolling */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Metadata, Totals, Financial Breakdown & Supporting Attachments (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Total Claim Amount Card */}
              <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50/70 rounded-2xl border border-teal-200/90 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-md">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-800 font-extrabold uppercase tracking-widest">Total Claim Amount</p>
                    <p className="font-black text-2xl text-teal-950 mt-0.5">{fmtN(grandTotal)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={claim.status} />
                  </div>
                </div>
              </div>

              {/* Main Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700 mt-0.5 flex-shrink-0">
                    <User size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claimant</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.claimant || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 mt-0.5 flex-shrink-0">
                    <Building size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.dept || claim.department || "Operations"}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 mt-0.5 flex-shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filing Date</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.date || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 mt-0.5 flex-shrink-0">
                    <Tag size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claim Type</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.claimType || "Staff Expense"}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 col-span-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5 flex-shrink-0">
                    <Building size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company Name</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.companyName || "Halal Food Authority"}</p>
                  </div>
                </div>

                {(claim.contactPerson || claim.contactEmail) && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 col-span-2">
                    <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 mt-0.5 flex-shrink-0">
                      <Info size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                      <p className="font-bold text-xs text-slate-900 mt-0.5 truncate">{claim.contactPerson || "N/A"}</p>
                      {claim.contactEmail && <p className="text-[10px] text-slate-500 font-medium truncate">{claim.contactEmail}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotals Breakdown Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={14} className="text-teal-600" />
                  <span>Financial Subtotals Breakdown</span>
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <CreditCard size={12} className="text-blue-600" />
                      <span className="text-[10px] font-semibold uppercase">Card</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{fmtCurrency(cardSubtotal)}</p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Wallet size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-semibold uppercase">Cash</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{fmtCurrency(cashSubtotal)}</p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Percent size={12} className="text-purple-600" />
                      <span className="text-[10px] font-semibold uppercase">VAT</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{fmtCurrency(vatSubtotal)}</p>
                  </div>
                </div>
              </div>

              {/* Claim Reasons Section */}
              {claim.reasons && claim.reasons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 size={14} className="text-teal-600" />
                    <span>Claim Reasons ({claim.reasons.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {claim.reasons.map((r, idx) => (
                      <div key={idx} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
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



              {/* Supporting Attachments Section with Document Viewer Trigger & Date display */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip size={14} className="text-teal-600" />
                    <span>Supporting Attachments ({claimAttachments.length})</span>
                  </h4>
                  {claimAttachments.length > 0 && (
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Verified Documents
                    </span>
                  )}
                </div>

                {claimAttachments.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {claimAttachments.map((file, idx) => {
                      const fileName = typeof file === "string" ? file : file.fileName || file.name || `Attachment ${idx + 1}`;
                      const ext = (fileName.includes('.') ? fileName.split('.').pop() : 'DOC').toUpperCase();
                      const isPdf = ext === 'PDF';
                      const isImg = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext);
                      const fileDate = file.date || file.uploadDate || file.docDate || "";

                      return (
                        <div
                          key={idx}
                          onClick={() => setViewingFile(file)}
                          className="p-3 bg-slate-50 hover:bg-teal-50/60 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between gap-3 shadow-2xs group cursor-pointer"
                          title="Click to view full document"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] uppercase flex-shrink-0 border shadow-2xs ${
                                isPdf
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isImg
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-teal-50 text-teal-700 border-teal-200"
                              }`}
                            >
                              {ext.slice(0, 4)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-900" title={fileName}>
                                {fileName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{file.fileSize || "Attached File"}</span>
                                {fileDate ? (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-600 font-semibold">Date: {fileDate}</span>
                                  </>
                                ) : null}
                                <span>•</span>
                                <span className="text-teal-700 font-semibold">Click to View</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingFile(file);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
                    <Paperclip size={18} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-xs font-medium text-slate-500">No document attachments uploaded for this claim.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Audit Trail, Workflow Notes & Itemized Table (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Approval & Audit Trail Section */}
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
                const verifiedEntry = [...history].reverse().find(
                  (h) => (h.toStatus || "").toLowerCase() === "verified"
                );

                const hadFurtherApproval = history.some((h) => {
                  const toSt = (h.toStatus || "").toLowerCase();
                  const fromSt = (h.fromStatus || "").toLowerCase();
                  const aRole = (h.actorRole || "").toLowerCase();
                  return (
                    toSt === "further_approval_approved" ||
                    toSt === "further_approval_rejected" ||
                    toSt === "further_approval" ||
                    fromSt === "further_approval" ||
                    aRole === "chairman"
                  );
                }) || (claim.status || "").toLowerCase().includes("further_approval") || Boolean(claim.furtherApprovedBy);

                const furtherApprovedEntry = [...history].reverse().find((h) => {
                  const toSt = (h.toStatus || "").toLowerCase();
                  const aRole = (h.actorRole || "").toLowerCase();
                  return toSt === "further_approval_approved" || toSt === "further_approval_rejected" || aRole === "chairman";
                });

                const approvedPaymentEntry = [...history].reverse().find(
                  (h) => (h.toStatus || "").toLowerCase() === "approved_for_payment"
                );
                const paidEntry = [...history].reverse().find(
                  (h) => (h.toStatus || "").toLowerCase() === "paid"
                );
                const standardApprovedEntry = [...history].reverse().find(
                  (h) => (h.toStatus || "").toLowerCase() === "approved" || (h.toStatus || "").toLowerCase() === "approved_for_payment"
                );

                const isPastVerified = claim.status && claim.status.toLowerCase() !== "new" && claim.status.toLowerCase() !== "submitted" && claim.status.toLowerCase() !== "pending";

                const verifierName = verifiedEntry?.actorName || claim.verifiedBy || (isPastVerified ? "Jaweria" : "");
                const verifierDate = verifiedEntry?.timestamp ? fmtAuditDate(verifiedEntry.timestamp) : (isPastVerified && claim.date ? fmtAuditDate(claim.date) : "");
                const verifiedText = verifierName ? `${verifierName} (Date: ${verifierDate})` : "(Date: )";

                const appPaymentName = approvedPaymentEntry?.actorName || claim.approvedForPaymentBy || "";
                const appPaymentDate = approvedPaymentEntry?.timestamp ? fmtAuditDate(approvedPaymentEntry.timestamp) : "";
                const approvedForPaymentText = appPaymentName ? `${appPaymentName} (Date: ${appPaymentDate})` : "(Date: )";

                const furtherApproverName = furtherApprovedEntry?.actorName || claim.furtherApprovedBy || (hadFurtherApproval ? (standardApprovedEntry?.actorName || claim.approvedBy) : "");
                const furtherApproverDate = furtherApprovedEntry?.timestamp ? fmtAuditDate(furtherApprovedEntry.timestamp) : "";
                const furtherApprovedText = furtherApproverName ? `${furtherApproverName} (Date: ${furtherApproverDate})` : "(Date: )";

                const appName = standardApprovedEntry?.actorName || claim.approvedBy || "";
                const appDate = standardApprovedEntry?.timestamp ? fmtAuditDate(standardApprovedEntry.timestamp) : "";
                const approvedText = appName ? `${appName} (Date: ${appDate})` : "(Date: )";

                const pName = paidEntry?.actorName || claim.paidBy || "";
                const pDate = paidEntry?.timestamp ? fmtAuditDate(paidEntry.timestamp) : "";
                const paidText = pName ? `${pName} (Date: ${pDate})` : "(Date: )";

                const approvedDateText = hadFurtherApproval
                  ? (furtherApproverDate || appPaymentDate || appDate || (claim.approvedDate ? fmtAuditDate(claim.approvedDate) : ""))
                  : (appPaymentDate || appDate || (claim.approvedDate ? fmtAuditDate(claim.approvedDate) : ""));

                const statusLabels = {
                  submitted: "Submitted",
                  new: "Submitted",
                  pending: "Pending",
                  verified: "Verified",
                  further_approval: "Further Approval",
                  further_approval_approved: "Further Approval Approved",
                  further_approval_rejected: "Further Approval Rejected",
                  approved_for_payment: "Approved For Payment",
                  paid: "Paid",
                  rejected: "Rejected"
                };
                const formattedStatusText = statusLabels[(claim.status || "").toLowerCase()] || claim.status || "Verified";

                return (
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3.5 font-sans text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Claim Status :</span>
                        <span className="font-bold text-slate-900">{formattedStatusText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {hadFurtherApproval ? "Date Of Further Approved:" : "Date Of Approved:"}
                        </span>
                        <span className="font-medium text-slate-900">{approvedDateText}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-slate-800">
                      <div>
                        <span className="font-semibold text-slate-700">Verified By: </span>
                        <span className="font-medium text-slate-900">{verifiedText}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Approved For Payment By: </span>
                        <span className="font-medium text-slate-900">{approvedForPaymentText}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          {hadFurtherApproval ? "Further Approved By: " : "Approved By: "}
                        </span>
                        <span className="font-medium text-slate-900">
                          {hadFurtherApproval ? furtherApprovedText : approvedText}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Paid By: </span>
                        <span className="font-medium text-slate-900">{paidText}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Notes & Workflow History Notes (Restricted Visibility) */}
              {(() => {
                const history = Array.isArray(claim.history) ? claim.history : [];
                const roleLabels = {
                  ceo: "CEO",
                  chairman: "Chairman / Board",
                  accountant: "Accountant",
                  financial_officer: "Financial Officer",
                  admin: "Admin",
                  super_admin: "Super Admin",
                  user: "Claimant / Staff",
                };

                const isAdmin = role === "admin" || role === "super_admin";
                const isClaimant = (claim.claimant === currentUser || claim.claimantName === currentUser || role === "user") && !isAdmin;

                const visibleNotes = history.filter((entry) => {
                  if (!entry.note || !entry.note.trim()) return false;
                  if (isAdmin) return true;
                  if (isClaimant && entry.targetRole !== "user") return false;
                  if (entry.targetRole && role === entry.targetRole) return true;
                  if (entry.actorRole && role === entry.actorRole) return true;
                  if (isClaimant && entry.targetRole === "user") return true;
                  return false;
                });

                const showFallbackNote = claim.note && visibleNotes.length === 0 && (
                  isAdmin ||
                  (!isClaimant && (
                    role === "financial_officer" ||
                    role === "ceo" ||
                    role === "accountant" ||
                    role === "chairman"
                  ))
                );

                if (visibleNotes.length === 0 && !showFallbackNote) return null;

                return (
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-amber-700" />
                      <span> Notes</span>
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {visibleNotes.map((entry, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-amber-200/70 shadow-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="text-teal-700">{entry.actorName || "Officer"}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {roleLabels[entry.actorRole] || entry.actorRole}
                              </span>
                              <span className="text-slate-400 font-normal">→</span>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                For: {roleLabels[entry.targetRole] || entry.targetRole || "Next Reviewer"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : ""}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 leading-relaxed pt-0.5">
                            {entry.note}
                          </p>
                        </div>
                      ))}

                      {showFallbackNote && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200/70 shadow-xs">
                          <p className="text-xs font-medium text-amber-900 leading-relaxed">{claim.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Itemized Expenses Table (Clean layout without redundant note column) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={14} className="text-teal-600" />
                    <span>Itemized Expenses ({items.length})</span>
                  </h4>
                  <span className="text-xs font-black text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    Grand Total: {fmtCurrency(grandTotal)}
                  </span>
                </div>
                
                {items.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-xs whitespace-nowrap">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="text-left px-3.5 py-2.5">Category / Description</th>
                            <th className="text-left px-3 py-2.5">Type</th>
                            <th className="text-right px-3 py-2.5">Card</th>
                            <th className="text-right px-3 py-2.5">Cash</th>
                            <th className="text-right px-3 py-2.5">VAT</th>
                            <th className="text-right px-4 py-2.5">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {items.map((item, idx) => {
                            const symbol = CURRENCY_SYMBOLS[item.currency] || "£";
                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3.5 py-2.5 font-bold text-slate-900">
                                  {item.category || item.description || `Item ${idx + 1}`}
                                </td>
                                <td className="px-3 py-2.5 text-slate-600 font-medium">{item.type || "In Budget"}</td>
                                <td className="px-3 py-2.5 text-right text-slate-600">{item.card ? fmtCurrency(item.card, symbol) : "-"}</td>
                                <td className="px-3 py-2.5 text-right text-slate-600">{item.cash ? fmtCurrency(item.cash, symbol) : "-"}</td>
                                <td className="px-3 py-2.5 text-right text-slate-500">{item.vat ? fmtCurrency(item.vat, symbol) : "-"}</td>
                                <td className="px-4 py-2.5 text-right font-extrabold text-teal-800">
                                  {fmtCurrency(item.total || item.amount || 0, symbol)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                          <tr>
                            <td colSpan={2} className="px-3.5 py-2.5 text-slate-700 uppercase tracking-wider text-[11px]">
                              Total Sum
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700">{fmtCurrency(cardSubtotal)}</td>
                            <td className="px-3 py-2.5 text-right text-slate-700">{fmtCurrency(cashSubtotal)}</td>
                            <td className="px-3 py-2.5 text-right text-slate-700">{fmtCurrency(vatSubtotal)}</td>
                            <td className="px-4 py-2.5 text-right font-black text-teal-900 text-sm">
                              {fmtCurrency(grandTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
                    <p className="text-xs font-medium text-slate-500">No individual line items listed for this claim.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer with Workflow Actions & Print Voucher Button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Financial Officer actions */}
            {(currentStatus === "submitted" || currentStatus === "new" || currentStatus === "pending") && isFO && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Verify Claim",
                      message: `Are you sure you want to verify claim ${refNo}? This will forward it to the CEO for review.`,
                      confirmLabel: "Verify Claim",
                      confirmVariant: "primary",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Add optional note for CEO review...",
                      noteLabel: "Note for CEO Review",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "verified", note, "ceo");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Verify
                </button>
                {(currentStatus === "submitted" || currentStatus === "new") && (
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} /> Send to Pending
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Reject Claim",
                      message: `Are you sure you want to reject claim ${refNo}? The claimant will be notified.`,
                      confirmLabel: "Reject Claim",
                      confirmVariant: "danger",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Reason for claim rejection...",
                      noteLabel: "Rejection Reason",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "rejected", note, "user");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}

            {/* CEO actions */}
            {(currentStatus === "verified" || currentStatus === "further_approval_approved" || currentStatus === "further_approval_rejected") && isCEO && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Approve for Payment",
                      message: `Are you sure you want to approve claim ${refNo} for payment? This will forward it to the Accountant for disbursement.`,
                      confirmLabel: "Approve for Payment",
                      confirmVariant: "primary",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Payment disbursement instructions for Accountant...",
                      noteLabel: "Note for Accountant",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "approved_for_payment", note, "accountant");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Approve for Payment
                </button>

                {(currentStatus === "verified" || currentStatus === "further_approval_rejected") && (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingConfirm({
                        title: "Send for Further Approval",
                        message: `Are you sure you want to send claim ${refNo} to the Board of Directors for further approval?`,
                        confirmLabel: "Send for Further Approval",
                        confirmVariant: "warning",
                        withNote: true,
                        noteRequired: false,
                        notePlaceholder: "Justification for Board approval...",
                        noteLabel: "Note for Board Review",
                        onConfirm: async (note) => {
                          await handleTransition(claim.id, "further_approval", note, "chairman");
                          if (onClose) onClose();
                        },
                      })
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Building size={14} /> Send for Further Approval
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Return Claim to Financial Officer",
                      message: `Are you sure you want to return claim ${refNo} to the Financial Officer? It will move back to the Submitted Claims list for re-evaluation.`,
                      confirmLabel: "Reverse to Fin. Officer",
                      confirmVariant: "warning",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Instructions / reason for return to Financial Officer...",
                      noteLabel: "Return Reason / Note",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "submitted", note, "financial_officer");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Reverse to Fin. Officer
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Reject Claim",
                      message: `Are you sure you want to reject claim ${refNo}?`,
                      confirmLabel: "Reject Claim",
                      confirmVariant: "danger",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Reason for claim rejection...",
                      noteLabel: "Rejection Reason",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "rejected", note, "user");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}

            {/* Board / Chairman actions */}
            {currentStatus === "further_approval" && isChairman && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Further Approval - Approve",
                      message: `Are you sure you want to approve claim ${refNo}? The status will update to Further Approval Approved and return to the CEO for payment authorization.`,
                      confirmLabel: "Approve Claim",
                      confirmVariant: "primary",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Board resolution / approval note for CEO...",
                      noteLabel: "Board Note for CEO",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "further_approval_approved", note, "ceo");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Approve — Return to CEO
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm({
                      title: "Further Approval - Reject",
                      message: `Are you sure you want to reject claim ${refNo}? The status will update to Further Approval Rejected and return to the CEO for review.`,
                      confirmLabel: "Reject — Return to CEO",
                      confirmVariant: "danger",
                      withNote: true,
                      noteRequired: false,
                      notePlaceholder: "Reason for Board rejection...",
                      noteLabel: "Rejection Reason for CEO",
                      onConfirm: async (note) => {
                        await handleTransition(claim.id, "further_approval_rejected", note, "ceo");
                        if (onClose) onClose();
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={14} /> Reject — Return to CEO
                </button>
              </>
            )}

            {/* Accountant actions */}
            {currentStatus === "approved_for_payment" && isAccountant && (
              <button
                type="button"
                onClick={() =>
                  setPendingConfirm({
                    title: "Confirm Payment Disbursed",
                    message: `Are you sure you want to mark claim ${refNo} as Paid?`,
                    confirmLabel: "Mark as Paid",
                    confirmVariant: "primary",
                    withNote: true,
                    noteRequired: false,
                    notePlaceholder: "Payment transaction reference...",
                    noteLabel: "Payment Reference / Note",
                    onConfirm: async (note) => {
                      await handleTransition(claim.id, "paid", note, "user");
                      if (onClose) onClose();
                    },
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Mark as Paid
              </button>
            )}

            {/* User / Staff resubmit */}
            {currentStatus === "pending" && (role === "user" || isFO) && (
              <button
                type="button"
                onClick={() =>
                  setPendingConfirm({
                    title: "Resubmit Expense Claim",
                    message: `Are you sure you want to resubmit claim ${refNo}? It will move to the Submitted Claims list for review.`,
                    confirmLabel: "Resubmit",
                    confirmVariant: "primary",
                    withNote: true,
                    noteRequired: false,
                    notePlaceholder: "Summary of changes / response to feedback...",
                    noteLabel: "Resubmission Note",
                    onConfirm: async (note) => {
                      await handleTransition(claim.id, "submitted", note, "financial_officer");
                      if (onClose) onClose();
                    },
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Resubmit Claim
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => printClaimVoucher(claim)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              title="Print official voucher"
            >
              <Printer size={15} className="text-teal-700" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={() => printClaimVoucher(claim)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              title="Save official voucher as PDF"
            >
              <Download size={15} className="text-teal-700" />
              <span>Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#054D66] hover:from-[#006670] hover:to-[#043D52] shadow-md transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Document Viewer Modal */}
      {viewingFile && (
        <DocumentViewerModal
          file={viewingFile}
          claim={claim}
          onClose={() => setViewingFile(null)}
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
          withNote={pendingConfirm.withNote ?? true}
          notePlaceholder={pendingConfirm.notePlaceholder}
          noteLabel={pendingConfirm.noteLabel}
          noteRequired={pendingConfirm.noteRequired ?? false}
          onConfirm={pendingConfirm.onConfirm}
          onClose={() => setPendingConfirm(null)}
        />
      )}

      {/* Send Feedback / Move to Pending Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-scale-in my-auto">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Send to Pending</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Send feedback note to {claim.claimant || claim.claimantName || "claimant"} regarding {refNo}.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="e.g. Please attach a valid VAT invoice and resubmit..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 outline-none mb-4 focus:border-teal-500 focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleTransition(claim.id, "pending", feedbackText, "user");
                  setFeedbackModalOpen(false);
                  setFeedbackText("");
                  if (onClose) onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer shadow-sm"
              >
                Confirm Send to Pending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
