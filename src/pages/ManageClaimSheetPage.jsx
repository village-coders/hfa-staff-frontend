import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2,
  MessageSquare, PlusCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fmtN } from "../constants/theme";

const WIZARD_STEPS = [
  { id: 1, title: "Claimant & Details", subtitle: "Basic claimant identification" },
  { id: 2, title: "Claim Reasons", subtitle: "Business justification" },
  { id: 3, title: "Expense Itemization", subtitle: "Breakdown & calculations" },
  { id: 4, title: "Attachments & Review", subtitle: "Documents & final submission" },
];

export default function ManageClaimSheetPage() {
  const { currentUser, handleCreateClaim } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [claimantName, setClaimantName] = useState(currentUser || "Taoheed");
  const [claimRefNo] = useState("MDOS-" + Math.floor(10000000000000 + Math.random() * 90000000000000));
  const [claimType, setClaimType] = useState("Staff Expense");
  const [companyName, setCompanyName] = useState("Halal Food Authority");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [claimDate, setClaimDate] = useState(new Date().toISOString().slice(0, 10));

  const [reasons, setReasons] = useState([
    { id: 1, option: "Official Duty Expense", chg: false }
  ]);

  const [items, setItems] = useState([
    { id: 1, type: "In Budget", category: "Taxi Fare", note: "", currency: "GBP", payMode: "cash", card: 0, cash: 15, bank: 0, vat: 0, total: 15 }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const [activeNoteModalItem, setActiveNoteModalItem] = useState(null);
  const [noteModalText, setNoteModalText] = useState("");

  const CATEGORY_OPTIONS = [
    "Underground Ticket", "National Rail Ticket", "Taxi Fare", "Car Hire (inc, fuel)", "Car Millage", "Car Parking", "Fuel", "Air Fare", "Hotel Accommodation", "Lunch/Dinner", "Sundry", "Office Consumables", "Standards & Export Cert", "DHL To Dubai x2 ()", "Cash Advancement", "Other Deductions", "Telephone Expenses", "Audit Fee (External)", "Gym Allowance", "Currency exchange charges", "Charity", "HFF expense", "Rent & Rates", "Service Charges", "Office Expense", "Meeting fee", "Office Cleaning", "Remuneration Payments", "Scholars Fee", "Honorarium payments", "Postage", "Stationary exp", "Computer Repair", "Computer/IT Expense"
  ];

  const TYPE_OPTIONS = ["None", "In Budget", "Not In Budget", "Not Applicable"];

  const addReasonRow = () => { setReasons([...reasons, { id: Date.now(), option: "", chg: false }]); };
  const removeReasonRow = (id) => { if (reasons.length > 1) setReasons(reasons.filter((r) => r.id !== id)); };
  const updateReason = (id, field, value) => { setReasons(reasons.map((r) => (r.id === id ? { ...r, [field]: value } : r))); };

  const addItemRow = () => {
    setItems([...items, { id: Date.now(), type: "In Budget", category: "", note: "", currency: "GBP", payMode: "cash", card: 0, cash: 0, bank: 0, vat: 0, total: 0 }]);
  };
  const removeItemRow = (id) => { if (items.length > 1) setItems(items.filter((item) => item.id !== id)); };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "card" && parseFloat(value) > 0) { updated.cash = 0; updated.payMode = "card"; }
          else if (field === "cash" && parseFloat(value) > 0) { updated.card = 0; updated.payMode = "cash"; }
          const card = parseFloat(updated.card) || 0;
          const cash = parseFloat(updated.cash) || 0;
          const vat = parseFloat(updated.vat) || 0;
          updated.total = card + cash + vat;
          return updated;
        }
        return item;
      })
    );
  };

  const openNoteModal = (item) => { setActiveNoteModalItem(item); setNoteModalText(item.note || ""); };
  const saveNoteModal = () => {
    if (activeNoteModalItem) updateItem(activeNoteModalItem.id, "note", noteModalText);
    setActiveNoteModalItem(null); setNoteModalText("");
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { if (e.target.files && e.target.files[0]) addFiles(Array.from(e.target.files)); };
  const addFiles = (newFilesList) => { setUploadedFiles((prev) => [...prev, ...newFilesList.map((f) => ({ id: Date.now() + Math.random(), file: f, name: f.name, size: (f.size / 1024).toFixed(1) + " KB" }))]); };
  const removeFile = (id) => { setUploadedFiles((prev) => prev.filter((f) => f.id !== id)); };

  const CURRENCY_SYMBOLS = { NGN: "₦", GBP: "£", USD: "$", EUR: "€" };
  const fmtCurrency = (val, symbol = "£") => `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const primaryCurrency = items[0]?.currency || "GBP";
  const activeSymbol = CURRENCY_SYMBOLS[primaryCurrency] || "£";

  const subtotalCard = items.reduce((sum, item) => sum + (parseFloat(item.card) || 0), 0);
  const subtotalCash = items.reduce((sum, item) => sum + (parseFloat(item.cash) || 0), 0);
  const subtotalVat = items.reduce((sum, item) => sum + (parseFloat(item.vat) || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleNext = () => {
    if (step === 1) { if (!claimantName.trim()) { alert("Please enter claimant name."); return; } }
    else if (step === 2) { if (reasons.length === 0 || !reasons[0].option) { alert("Please select at least one claim reason option."); return; } }
    else if (step === 3) { const validItem = items.some((i) => i.category); if (!validItem) { alert("Please select a description option for at least one item."); return; } }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleClose = () => { navigate("/claims"); };

  const submitForm = (e) => {
    if (e) e.preventDefault();
    const primaryItem = items.find((i) => i.category) || items[0];
    const claimTitle = primaryItem.category ? `${primaryItem.category} Claim` : "General Expense Claim";

    handleCreateClaim({
      claimType: claimType || "Staff Expense",
      filingDate: claimDate || new Date().toISOString().slice(0, 10),
      companyName: companyName || "Halal Food Authority",
      contactPerson: contactPerson || "",
      contactEmail: contactEmail || "",
      title: claimTitle,
      reasons: reasons.map(r => ({ option: r.option, chg: r.chg || false })),
      items: items.map(i => ({
        type: i.type || "None",
        category: i.category,
        currency: i.currency || "GBP",
        payMode: i.payMode || "cash",
        card: parseFloat(i.card) || 0,
        cash: parseFloat(i.cash) || 0,
        vat: parseFloat(i.vat) || 0,
        total: parseFloat(i.total) || 0,
        note: i.note || ""
      })),
      subtotals: {
        subtotalCard,
        subtotalCash,
        subtotalVat,
        grandTotal
      },
      amount: grandTotal,
      department: "Operations",
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      navigate("/claims");
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col mx-auto animate-scale-in">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 sm:px-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-semibold tracking-wide border border-teal-300/30">
              Claim Application Wizard
            </span>
            <span className="text-xs font-mono font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
              {claimRefNo}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Submit New Claim</h2>
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

      {/* Wizard Steps Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-3.5 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
          {WIZARD_STEPS.map((s) => {
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

      {/* Form Content */}
      <div className="p-6 sm:p-8 flex-1 bg-slate-50/30 space-y-6">
        {submitted && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm flex items-center gap-3 animate-scale-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Claim Submitted Successfully!</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Reference: <span className="font-mono font-bold">{claimRefNo}</span>. Total amount logged: <span className="font-bold">{fmtN(grandTotal)}</span>.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Claimant & Organization Details</h3>
                <p className="text-xs text-slate-500 font-normal">Basic claimant identification and organizational routing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Claimant Name</label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Claim Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                >
                  <option value="">...Select Type...</option>
                  <option value="Audit">Audit</option>
                  <option value="Supervision">Supervision</option>
                  <option value="Audit / Supervision">Audit / Supervision</option>
                  <option value="Payment Request Form">Payment Request Form</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Approved Supplier IT (Yearly)">Approved Supplier IT (Yearly)</option>
                  <option value="Approved Supplier Admin (Yearly)">Approved Supplier Admin (Yearly)</option>
                  <option value="Approved Supplier IT (Monthly)">Approved Supplier IT (Monthly)</option>
                  <option value="Approved Supplier Admin (Monthly)">Approved Supplier Admin (Monthly)</option>
                  <option value="Approved Supplier Training (Yearly)">Approved Supplier Training (Yearly)</option>
                  <option value="Approved Supplier Training (Monthly)">Approved Supplier Training (Monthly)</option>
                  <option value="Approved Supplier Advertisement (Yearly)">Approved Supplier Advertisement (Yearly)</option>
                  <option value="Approved Supplier Advertisement (Monthly)">Approved Supplier Advertisement (Monthly)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Filing Date</label>
                <input
                  type="date"
                  required
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Halal Food Authority"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Line Manager Name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Contact E-Mail</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@hfa.org"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Claim Reasons & Options</h3>
                  <p className="text-xs text-slate-500 font-normal">Specify business reasons for this expense claim.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={addReasonRow}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={15} /> Add Reason
              </button>
            </div>

            <div className="space-y-3">
              {reasons.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex-1">
                    <select
                      value={r.option}
                      onChange={(e) => updateReason(r.id, "option", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="">....Select Option....</option>
                      <option value="Overseas Travel">Overseas Travel</option>
                      <option value="Training">Training</option>
                      <option value="Other Authorised">Other Authorised</option>
                      <option value="Event">Event</option>
                      <option value="Seminar/Conference">Seminar/Conference</option>
                      <option value="Office Expense">Office Expense</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Telephone Expense">Telephone Expense</option>
                      <option value="External Invoices">External Invoices</option>
                      <option value="Telephone Claim">Telephone Claim</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={r.chg}
                      onChange={(e) => updateReason(r.id, "chg", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Chargeable (Chg)</span>
                  </label>

                  {reasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReasonRow(r.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center justify-center cursor-pointer"
                      title="Remove Reason"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Expense Itemization Breakdown</h3>
                  <p className="text-xs text-slate-500 font-normal">Add each individual expenditure with currency and payment method.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Expense Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#007A87] text-white font-semibold">
                    <th className="text-left px-4 py-3.5 min-w-[120px] whitespace-nowrap">Type</th>
                    <th className="text-left px-4 py-3.5 min-w-[150px] whitespace-nowrap">Description</th>
                    <th className="text-left px-3 py-3.5 w-24 whitespace-nowrap">Currency</th>
                    <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Credit Card</th>
                    <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Cash</th>
                    <th className="text-right px-3 py-3.5 w-24 whitespace-nowrap">VAT</th>
                    <th className="text-right px-4 py-3.5 w-28 whitespace-nowrap">Total</th>
                    <th className="text-center px-3 py-3.5 w-32 whitespace-nowrap">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(item.id, "type", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500 shadow-sm"
                        >
                          {TYPE_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none bg-white focus:border-teal-500"
                        >
                          <option value="">....Select Description Option....</option>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={item.currency}
                          onChange={(e) => updateItem(item.id, "currency", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500"
                        >
                          <option value="NGN">NGN (₦)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.card || ""}
                          onChange={(e) => updateItem(item.id, "card", e.target.value)}
                          placeholder="0.00"
                          className={`w-full border rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500 ${
                            item.payMode === "card" && item.card > 0 ? "border-teal-400 bg-teal-50/30" : "border-slate-200"
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.cash || ""}
                          onChange={(e) => updateItem(item.id, "cash", e.target.value)}
                          placeholder="0.00"
                          className={`w-full border rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500 ${
                            item.payMode === "cash" && item.cash > 0 ? "border-teal-400 bg-teal-50/30" : "border-slate-200"
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={item.vat || ""}
                          onChange={(e) => updateItem(item.id, "vat", e.target.value)}
                          placeholder="0.00"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 text-xs">
                        {fmtCurrency(item.total, CURRENCY_SYMBOLS[item.currency] || "£")}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openNoteModal(item)}
                            className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              item.note ? "bg-teal-100 text-teal-800 border border-teal-300" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                            }`}
                            title="Add/View Note"
                          >
                            <MessageSquare size={12} />
                            <span className="hidden sm:inline">{item.note ? "Noted" : "Note"}</span>
                          </button>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(item.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                    <td colSpan={3} className="px-4 py-3.5 text-right uppercase tracking-wider text-slate-600">
                      Grand Subtotals ({activeSymbol}):
                    </td>
                    <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalCard, activeSymbol)}</td>
                    <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalCash, activeSymbol)}</td>
                    <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalVat, activeSymbol)}</td>
                    <td className="px-4 py-3.5 text-right text-teal-800 text-sm font-extrabold">{fmtCurrency(grandTotal, activeSymbol)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Add Attachments & Supporting Documents</h3>
                    <p className="text-xs text-slate-500 font-normal">Attach multiple receipts, invoices, or supporting files to this claim.</p>
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
                    <Plus size={15} /> Add Attachment
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
                    Supports JPG, PNG, PDF, DOCX up to 10MB each
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
                <h4 className="font-bold text-sm tracking-tight text-teal-100">Claim Application Summary</h4>
                <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                  {claimRefNo}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-[11px] text-teal-200/80">Claimant</p>
                  <p className="font-bold text-white mt-0.5">{claimantName || currentUser}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Claim Type</p>
                  <p className="font-bold text-white mt-0.5">{claimType || "Standard"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Filing Date</p>
                  <p className="font-bold text-white mt-0.5">{claimDate}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Grand Total Amount</p>
                  <p className="font-extrabold text-white text-sm mt-0.5">{fmtCurrency(grandTotal, activeSymbol)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeNoteModalItem && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800">
                <MessageSquare size={18} />
                <h3 className="font-bold text-sm text-slate-900">Add Item Note / Other Info</h3>
              </div>
              <button type="button" onClick={() => setActiveNoteModalItem(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500">Provide additional context or details for <span className="font-bold text-slate-700">{activeNoteModalItem.category || "this expense line item"}</span>.</p>
            <textarea rows={4} value={noteModalText} onChange={(e) => setNoteModalText(e.target.value)} placeholder="Enter additional info or explanatory notes here..." className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 shadow-sm" />
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setActiveNoteModalItem(null)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={saveNoteModal} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md cursor-pointer">Save Note</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Navigation Footer */}
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
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Step {step} of 4
          </span>

          {step < 4 ? (
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
              onClick={submitForm}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Submit Claim Application</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
