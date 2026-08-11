import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, ChevronRight, ChevronLeft, Plus, PlusCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fmtN } from "../constants/theme";

const ASSET_WIZARD_STEPS = [
  { id: 1, title: "Asset Details", subtitle: "Name & classification" },
  { id: 2, title: "Procurement Info", subtitle: "Purchase dates & seller" },
  { id: 3, title: "Attachments & Review", subtitle: "Documents & final registration" },
];

const genSerial = () => "SN-AST-" + Math.floor(10000000 + Math.random() * 90000000);

export default function AddNewAssetPage({ onClose: propOnClose }) {
  const { handleAddAsset, closeAddAsset } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    staffName: "Builder",
    serialNumber: genSerial(),
    assetName: "",
    expiryDate: "",
    assetType: "",
    file: null,
    datePurchased: new Date().toISOString().slice(0, 10),
    amount: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    sellerName: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  const handleClose = () => {
    if (propOnClose) propOnClose();
    if (closeAddAsset) closeAddAsset();
    if (window.location.pathname === "/assets/add") navigate("/assets");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFilesList) => {
    const mapped = newFilesList.map((f) => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
    }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.assetName.trim()) {
        alert("Please enter the Asset Name.");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!form.assetName) return;

    setSubmitting(true);
    setSubmitError("");

    const result = await handleAddAsset({
      name: form.assetName,
      category: form.assetType || "Equipment",
      dept: "Operations",
      acquired: form.datePurchased || new Date().toISOString().slice(0, 10),
      status: "Active",
      staffName: form.staffName || "Builder",
      expiryDate: form.expiryDate || "",
      amount: parseFloat(form.amount) || 0,
      sellerName: form.sellerName || "",
    });

    setSubmitting(false);

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        handleClose();
      }, 1500);
    } else {
      setSubmitError(result?.message || "Asset registration failed. Please try again.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col mx-auto animate-scale-in">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 sm:px-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-semibold tracking-wide border border-teal-300/30">
              Asset Register Wizard
            </span>
            <span className="text-xs font-mono font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
              {form.serialNumber}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Add New Asset</h2>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="relative z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
          title="Close Form"
        >
          <X size={22} />
        </button>
      </div>

      {/* Step Progress Indicator Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-3.5 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
          {ASSET_WIZARD_STEPS.map((s) => {
            const isCurrent = step === s.id;
            const isPassed = step > s.id;
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => { if (isPassed) setStep(s.id); }}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                  isCurrent
                    ? "bg-white border border-teal-300 shadow-sm text-teal-900"
                    : isPassed
                    ? "text-teal-700 hover:bg-white/60 cursor-pointer"
                    : "text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-[#007A87] text-white shadow-sm"
                      : isPassed
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isPassed ? <CheckCircle2 size={15} /> : s.id}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className={`text-xs font-bold truncate ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Body Content */}
      <div className="p-6 sm:p-8 flex-1 bg-slate-50/30 space-y-6">
        {submitted && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm flex items-center gap-3 animate-scale-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Asset Registered Successfully!</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Serial Number: <span className="font-mono font-bold">{form.serialNumber}</span>. The new asset entry now appears under Manage Asset.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: ASSET DETAILS */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Enter Asset Specifications</h3>
                <p className="text-xs text-slate-500 font-normal">Basic identification, assignment, and system serial classification.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Staff Name:</label>
                <select
                  value={form.staffName}
                  onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                >
                  <option value="Builder">Builder</option>
                  <option value="Ibrahim Musa">Ibrahim Musa</option>
                  <option value="Chidinma Okoro">Chidinma Okoro</option>
                  <option value="Samuel Ekong">Samuel Ekong</option>
                  <option value="Funmi Adisa">Funmi Adisa</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Serial Number:</label>
                </div>
                <input
                  type="text"
                  value={form.serialNumber}
                  readOnly
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-teal-800 bg-teal-50/60 cursor-not-allowed select-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Asset Name:</label>
                <input
                  type="text"
                  required
                  value={form.assetName}
                  onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                  placeholder="e.g. Dell Latitude 5440 Laptop"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Expiry Date:</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Asset Type:</label>
                <input
                  type="text"
                  value={form.assetType}
                  onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                  placeholder="e.g. IT Equipment, Vehicle, Facility"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Amount (£):</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 450"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROCUREMENT RECORDS */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Procurement & Seller Information</h3>
                <p className="text-xs text-slate-500 font-normal">Record acquisition dates, delivery timelines, and vendor details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Date Purchased:</label>
                <input
                  type="date"
                  value={form.datePurchased}
                  onChange={(e) => setForm({ ...form, datePurchased: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Received Date:</label>
                <input
                  type="date"
                  value={form.receivedDate}
                  onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-2">Seller / Vendor Name:</label>
                <input
                  type="text"
                  value={form.sellerName}
                  onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                  placeholder="e.g. Dell Authorised Reseller Ltd"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ATTACHMENTS & REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Asset Attachments & Invoices</h3>
                    <p className="text-xs text-slate-500 font-normal">Attach purchase receipts, warranty cards, or specification documents.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                    {uploadedFiles.length} files attached
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus size={15} /> Add File
                  </button>
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3
                  ${dragActive ? "border-teal-500 bg-teal-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <div className="w-14 h-14 rounded-2xl bg-teal-100/60 text-teal-700 flex items-center justify-center shadow-inner">
                  <PlusCircle size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-teal-700 hover:underline">Click to browse</span> or drag and drop files here
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Attach receipts, warranty docs, or certificates
                  </p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {uploadedFiles.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                          {item.name.split('.').pop().slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.size}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-[#054D66] to-[#007A87] rounded-3xl p-6 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm tracking-tight text-teal-100">Asset Entry Registration Summary</h4>
                <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                  {form.serialNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-[11px] text-teal-200/80">Asset Name</p>
                  <p className="font-bold text-white mt-0.5">{form.assetName || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Staff Assigned</p>
                  <p className="font-bold text-white mt-0.5">{form.staffName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Asset Type</p>
                  <p className="font-bold text-white mt-0.5">{form.assetType || "Equipment"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Procurement Value</p>
                  <p className="font-extrabold text-teal-300 text-sm mt-0.5">{form.amount ? fmtN(parseFloat(form.amount)) : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Control Bar */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {submitError && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              {submitError}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Step {step} of 3
          </span>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#0D857B] hover:opacity-95 shadow-md transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? "Registering..." : "Register Asset Entry"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
