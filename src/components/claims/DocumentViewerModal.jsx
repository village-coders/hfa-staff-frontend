import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, FileText, Download, Printer, ShieldCheck, CheckCircle2,
  Calendar, User, Building, ExternalLink, Paperclip, Loader2, AlertTriangle
} from "lucide-react";
import { fmtN, API_BASE_URL } from "../../constants/theme";
import { printDocumentRecord } from "../../utils/printVoucher";

export default function DocumentViewerModal({ file, claim, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadState, setLoadState] = useState("idle"); // idle | loading | ready | error
  const blobUrlRef = useRef(null);

  // Derived from file — safe to read even if file is null because hooks must run unconditionally
  const fileName = !file ? "" : (typeof file === "string" ? file : file.fileName || file.name || "Attached Document");
  const ext = fileName && fileName.includes(".") ? fileName.split(".").pop().toUpperCase() : "DOC";
  const isPdf = ext === "PDF";
  const isImg = ["JPG", "JPEG", "PNG", "WEBP", "GIF"].includes(ext);
  const refNo = claim?.id || claim?.claimRefNo || "Claim";
  const docDate = !file ? "" : (file.date || file.uploadDate || file.docDate || file.uploadedAt || claim?.date || "—");

  // Determine whether we have a GridFS file ID to fetch
  const rawFileId = !file || typeof file === "string" ? null : file.fileUrl || null;
  const isGridFsId = rawFileId && !rawFileId.startsWith("http") && !rawFileId.startsWith("/") && !rawFileId.startsWith("data:");
  const directUrl = rawFileId && !isGridFsId ? rawFileId : null;

  // Fetch the file from GridFS with auth token and create a blob URL
  useEffect(() => {
    if (!isGridFsId) return;

    let cancelled = false;
    setLoadState("loading");
    setBlobUrl(null);

    const stored = localStorage.getItem("ifrs_user");
    const token = stored ? (JSON.parse(stored)?.token || "") : "";

    fetch(`${API_BASE_URL}/files/${rawFileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
        setLoadState("ready");
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[DocumentViewer] Failed to load file:", err);
          setLoadState("error");
        }
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawFileId]);

  // Revoke blob on modal close
  const handleClose = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    onClose();
  };

  // Resolved display URL: prefer fetched blob, then direct URL
  const displayUrl = blobUrl || directUrl;

  // Guard: must be after all hooks
  if (!file) return null;

  const handlePrint = () => {
    printDocumentRecord(file, claim);
  };

  // Download the actual file if we have a blob URL
  const handleDownloadFile = () => {
    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      return;
    }
    if (directUrl) {
      window.open(directUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback to voucher text
    handleDownloadStub();
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
      onClick={handleClose}
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
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ── Loading state ── */}
          {loadState === "loading" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Loading document…</p>
            </div>
          )}

          {/* ── Error state ── */}
          {loadState === "error" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 min-h-[30vh] flex flex-col items-center justify-center gap-3 p-6">
              <AlertTriangle size={36} className="text-rose-500" />
              <p className="text-sm font-bold text-rose-700">Failed to load document</p>
              <p className="text-xs text-rose-600 text-center max-w-xs">
                The file could not be retrieved from the server. It may have been moved or the session may have expired.
              </p>
            </div>
          )}

          {/* ── File viewer (blob or direct URL) ── */}
          {displayUrl && loadState !== "loading" && loadState !== "error" && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[50vh] flex items-center justify-center">
              {isImg ? (
                <img
                  src={displayUrl}
                  alt={fileName}
                  className="max-h-[65vh] object-contain mx-auto"
                />
              ) : (
                <iframe
                  src={displayUrl}
                  title={fileName}
                  className="w-full h-[65vh] border-0"
                />
              )}
            </div>
          )}

          {/* ── File not stored in GridFS (legacy/metadata-only attachment) ── */}
          {!displayUrl && loadState === "idle" && !rawFileId && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                <Paperclip size={28} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">File Preview Not Available</p>
                <p className="text-xs text-amber-700 mt-1 max-w-sm">
                  The binary file for <span className="font-semibold">{fileName}</span> was recorded as metadata only and was not stored in the document server.
                  This typically affects attachments submitted before the file storage system was enabled.
                </p>
              </div>
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-2">
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">File Name</p>
                  <p className="text-xs font-bold text-slate-800 truncate" title={fileName}>{fileName}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Doc Date</p>
                  <p className="text-xs font-bold text-slate-800">{docDate || "—"}</p>
                  <p className="text-[10px] text-slate-400">{file.fileSize || ""}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Claimant</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{claim?.claimant || claim?.claimantName || "Staff Member"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Claim Ref</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">{refNo}</p>
                </div>
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
            {(blobUrl || directUrl) && (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
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
