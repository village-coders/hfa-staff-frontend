import React from "react";
import { createPortal } from "react-dom";
import {
  X, FileText, Download, Printer, ShieldCheck, CheckCircle2,
  Calendar, User, Building, ExternalLink, Paperclip
} from "lucide-react";
import { fmtN } from "../../constants/theme";
import { printDocumentRecord } from "../../utils/printVoucher";

export default function DocumentViewerModal({ file, claim, onClose }) {
  if (!file) return null;

  const fileName = typeof file === "string" ? file : file.fileName || file.name || "Attached Document";
  const ext = (fileName.includes(".") ? fileName.split(".").pop() : "DOC").toUpperCase();
  const isPdf = ext === "PDF";
  const isImg = ["JPG", "JPEG", "PNG", "WEBP", "GIF"].includes(ext);
  const refNo = claim?.id || claim?.claimRefNo || "Claim";
  const docDate = file.date || file.uploadDate || file.docDate || claim?.date || "—";

  const handlePrint = () => {
    printDocumentRecord(file, claim);
  };

  const handleDownloadStub = () => {
    const content = `=====================================================
HALAL FOOD AUTHORITY - INTERNAL FINANCIAL RECORD SYSTEM
DOCUMENT ARCHIVE VERIFICATION VOUCHER
=====================================================
Document Name    : ${fileName}
File Extension   : ${ext}
Status           : VERIFIED IN IFRS AUDIT SYSTEM
Claim Reference  : ${refNo}
Claimant         : ${claim?.claimant || claim?.claimantName || "Staff Member"}
Department       : ${claim?.dept || claim?.department || "Operations"}
Company          : ${claim?.companyName || "Halal Food Authority"}
Total Claim Sum  : ${fmtN(claim?.amount || 0)}
Filing Date      : ${claim?.date || "N/A"}
Document Date    : ${docDate}
Verification     : Approved and archived in central repository.
Timestamp        : ${new Date().toISOString()}
=====================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VOUCHER-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[70] flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 flex items-center justify-center font-bold flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-200 border border-teal-300/30 px-2 py-0.5 rounded-md">
                  {ext}
                </span>
                <span className="text-xs text-teal-100/80 font-mono font-medium">
                  {refNo}
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate mt-0.5" title={fileName}>
                {fileName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Print Record"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 border border-teal-300/40 text-teal-100 hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Save Record as PDF"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Save as PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadStub}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Download Verification Voucher"
            >
              <Download size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {file.fileUrl && (file.fileUrl.startsWith("http") || file.fileUrl.startsWith("/api") || file.fileUrl.startsWith("data:")) ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[50vh] flex items-center justify-center">
              {isImg ? (
                <img
                  src={file.fileUrl}
                  alt={fileName}
                  className="max-h-[65vh] object-contain mx-auto"
                />
              ) : (
                <iframe
                  src={file.fileUrl}
                  title={fileName}
                  className="w-full h-[65vh] border-0"
                />
              )}
            </div>
          ) : (
            /* Document Certificate Voucher */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 shadow-sm relative overflow-hidden">
              {/* Decorative background watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <ShieldCheck size={280} className="text-teal-900" />
              </div>

              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                    Halal Food Authority — Internal Financial Record System
                  </p>
                  <h4 className="text-lg font-black text-slate-900 mt-1">
                    Electronic Document & Receipt Record
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Verified supporting voucher attached to Claim ID: <span className="font-mono font-bold text-slate-800">{refNo}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
                  <ShieldCheck size={16} className="text-teal-600" />
                  <span>AUDIT VERIFIED</span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Paperclip size={14} className="text-teal-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">File Name</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 break-words truncate" title={fileName}>
                    {fileName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Doc Date</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {docDate}
                  </p>
                  <p className="text-[11px] text-slate-500">{file.fileSize || "Supporting Proof"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <User size={14} className="text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Claimant</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {claim?.claimant || claim?.claimantName || "Staff Member"}
                  </p>
                  <p className="text-[11px] text-slate-500">{claim?.dept || claim?.department || "Operations"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Building size={14} className="text-purple-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Company</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {claim?.companyName || "Halal Food Authority"}
                  </p>
                  <p className="text-[11px] text-teal-700 font-semibold">{fmtN(claim?.amount || 0)} Total Claim</p>
                </div>
              </div>

              {/* Verification Info Box */}
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                      Verified Claim Document Reference
                    </h5>
                    <p className="text-xs text-teal-900/90 leading-relaxed font-normal">
                      This file was recorded under claim reference <span className="font-mono font-bold">{refNo}</span>.
                      It is indexed as a verified expense justification for <span className="font-semibold">{claim?.claimant || claim?.claimantName || "the claimant"}</span> with status <span className="font-semibold uppercase">{claim?.status || "Approved"}</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer inside voucher */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadStub}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Save as PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            Electronic Document Archive • Halal Food Authority (IFRS)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
