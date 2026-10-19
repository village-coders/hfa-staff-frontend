import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  X, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2,
  PlusCircle, Calendar, ShieldCheck, FileText, AlertCircle, RotateCcw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fmtN, API_BASE_URL } from "../constants/theme";

const WIZARD_STEPS = [
  { id: 1, title: "Claimant & Details", subtitle: "Basic claimant identification" },
  { id: 2, title: "Claim Reasons", subtitle: "Business justification" },
  { id: 3, title: "Expense Itemization", subtitle: "Breakdown & calculations" },
  { id: 4, title: "Attachments & Review", subtitle: "Documents & final submission" },
];

export default function ManageClaimSheetPage({ onClose: propOnClose, claimToEdit: propClaimToEdit }) {
  const { id: paramId } = useParams();
  const location = useLocation();
  const { currentUser, role, claims, handleSubmitClaim, handleResubmitClaim, refreshClaimAttachments, closeClaimSheet } = useApp();
  const navigate = useNavigate();

  const initialClaim =
    propClaimToEdit ||
    location.state?.claimToEdit ||
    (paramId ? (claims || []).find((c) => c.id === paramId || c._id === paramId || c.claimRefNo === paramId) : null);

  const [claimToEdit, setClaimToEdit] = useState(initialClaim);
  const isEditing = Boolean(claimToEdit);

  const [step, setStep] = useState(1);
  const [claimantName, setClaimantName] = useState(() => (initialClaim ? (initialClaim.claimantName || initialClaim.claimant || currentUser || "") : (currentUser || "")));
  useEffect(() => {
    if (!claimantName && currentUser && !isEditing) {
      setClaimantName(currentUser);
    }
  }, [currentUser, claimantName, isEditing]);

  const [claimRefNo, setClaimRefNo] = useState(() => (initialClaim ? (initialClaim.claimRefNo || initialClaim.id) : "MDOS-" + Math.floor(10000000000000 + Math.random() * 90000000000000)));
  const [claimType, setClaimType] = useState(() => (initialClaim?.claimType || "Staff Expense"));
  const [companyName, setCompanyName] = useState(() => (initialClaim?.companyName || "Halal Food Authority"));
  const [contactPerson, setContactPerson] = useState(() => (initialClaim?.contactPerson || ""));
  const [contactEmail, setContactEmail] = useState(() => (initialClaim?.contactEmail || ""));
  const [filingDate, setFilingDate] = useState(() => {
    if (initialClaim?.filingDate || initialClaim?.date) {
      const raw = initialClaim.filingDate || initialClaim.date;
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : raw;
    }
    return new Date().toISOString().slice(0, 10);
  });

  const [expenseDate, setExpenseDate] = useState(() => {
    if (initialClaim?.expenseDate) {
      const raw = initialClaim.expenseDate;
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : raw;
    }
    if (initialClaim?.date || initialClaim?.filingDate) {
      const raw = initialClaim.date || initialClaim.filingDate;
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : raw;
    }
    return new Date().toISOString().slice(0, 10);
  });

  const [reasons, setReasons] = useState(() => {
    if (Array.isArray(initialClaim?.reasons) && initialClaim.reasons.length > 0) {
      return initialClaim.reasons.map((r, idx) => ({
        id: idx + 1,
        option: typeof r === "string" ? r : r.option || "",
        chg: Boolean(r.chg || r.chargeable),
      }));
    }
    return [{ id: 1, option: "", chg: false }];
  });

  const [items, setItems] = useState(() => {
    if (Array.isArray(initialClaim?.items) && initialClaim.items.length > 0) {
      return initialClaim.items.map((i, idx) => ({
        id: idx + 1,
        type: i.type || "In Budget",
        category: i.category || "",
        currency: i.currency || "GBP",
        payMode: i.payMode || "cash",
        card: parseFloat(i.card) || 0,
        cash: parseFloat(i.cash) || 0,
        bank: parseFloat(i.bank) || 0,
        vat: parseFloat(i.vat) || 0,
        total: parseFloat(i.total) || 0,
        note: i.note || "",
      }));
    }
    return [{ id: 1, type: "In Budget", category: "", currency: "GBP", payMode: "cash", card: 0, cash: 0, bank: 0, vat: 0, total: 0 }];
  });

  const [existingAttachments, setExistingAttachments] = useState(() => {
    return Array.isArray(initialClaim?.attachments) ? initialClaim.attachments : [];
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [claimNote, setClaimNote] = useState(() => initialClaim?.note || initialClaim?.notes || "");
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch or sync claimToEdit if loaded via route param
  useEffect(() => {
    if (!claimToEdit && paramId) {
      const found = (claims || []).find((c) => c.id === paramId || c._id === paramId || c.claimRefNo === paramId);
      if (found) {
        setClaimToEdit(found);
      } else {
        const stored = localStorage.getItem("ifrs_user");
        const token = stored ? (JSON.parse(stored)?.token || "") : "";
        fetch(`${API_BASE_URL}/claims/${paramId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const c = data?.data || data?.claim || data;
            if (c) setClaimToEdit(c);
          })
          .catch((err) => console.error("Error loading claim to edit:", err));
      }
    }
  }, [paramId, claims, claimToEdit]);

  // Sync state when claimToEdit updates
  useEffect(() => {
    if (claimToEdit) {
      if (claimToEdit.claimRefNo || claimToEdit.id) {
        setClaimRefNo(claimToEdit.claimRefNo || claimToEdit.id);
      }
      setClaimantName(claimToEdit.claimantName || claimToEdit.claimant || currentUser || "");
      setClaimType(claimToEdit.claimType || "Staff Expense");
      setCompanyName(claimToEdit.companyName || "Halal Food Authority");
      setContactPerson(claimToEdit.contactPerson || "");
      setContactEmail(claimToEdit.contactEmail || "");
      if (claimToEdit.filingDate || claimToEdit.date) {
        const rawFiling = claimToEdit.filingDate || claimToEdit.date;
        const d = new Date(rawFiling);
        setFilingDate(!isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : rawFiling);
      }
      if (claimToEdit.expenseDate) {
        const rawDate = claimToEdit.expenseDate;
        const d = new Date(rawDate);
        setExpenseDate(!isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : rawDate);
      } else if (claimToEdit.filingDate || claimToEdit.date) {
        const rawDate = claimToEdit.filingDate || claimToEdit.date;
        const d = new Date(rawDate);
        setExpenseDate(!isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : rawDate);
      }
      if (Array.isArray(claimToEdit.reasons) && claimToEdit.reasons.length > 0) {
        setReasons(
          claimToEdit.reasons.map((r, idx) => ({
            id: idx + 1,
            option: typeof r === "string" ? r : r.option || "",
            chg: Boolean(r.chg || r.chargeable),
          }))
        );
      }
      if (Array.isArray(claimToEdit.items) && claimToEdit.items.length > 0) {
        setItems(
          claimToEdit.items.map((i, idx) => ({
            id: idx + 1,
            type: i.type || "In Budget",
            category: i.category || "",
            currency: i.currency || "GBP",
            payMode: i.payMode || "cash",
            card: parseFloat(i.card) || 0,
            cash: parseFloat(i.cash) || 0,
            bank: parseFloat(i.bank) || 0,
            vat: parseFloat(i.vat) || 0,
            total: parseFloat(i.total) || 0,
            note: i.note || "",
          }))
        );
      }
      if (Array.isArray(claimToEdit.attachments)) {
        setExistingAttachments(claimToEdit.attachments);
      }
      if (claimToEdit.note || claimToEdit.notes || claimToEdit.officerNote) {
        setClaimNote(claimToEdit.note || claimToEdit.notes || claimToEdit.officerNote || "");
      }
    }
  }, [claimToEdit]);

  const pendingHistoryEntry = Array.isArray(claimToEdit?.history)
    ? [...claimToEdit.history].reverse().find((h) => (h.toStatus || "").toUpperCase() === "PENDING" && h.note)
    : null;
  const pendingReason =
    pendingHistoryEntry?.note ||
    claimToEdit?.officerNote ||
    claimToEdit?.note ||
    "A correction is required by the reviewing officer before this claim can proceed.";

  const CATEGORY_OPTIONS = [
    "Underground Ticket", "National Rail Ticket", "Taxi Fare", "Car Hire (inc, fuel)", "Car Millage", "Car Parking", "Fuel", "Air Fare", "Hotel Accommodation", "Lunch/Dinner", "Sundry", "Office Consumables", "Standards & Export Cert", "DHL To Dubai x2 ()", "Cash Advancement", "Other Deductions", "Telephone Expenses", "Audit Fee (External)", "Gym Allowance", "Currency exchange charges", "Charity", "HFF expense", "Rent & Rates", "Service Charges", "Office Expense", "Meeting fee", "Office Cleaning", "Remuneration Payments", "Scholars Fee", "Honorarium payments", "Postage", "Stationary exp", "Computer Repair", "Computer/IT Expense"
  ];

  const TYPE_OPTIONS = ["None", "In Budget", "Not In Budget", "Not Applicable"];

  const addReasonRow = () => { setReasons([...reasons, { id: Date.now(), option: "", chg: false }]); };
  const removeReasonRow = (id) => { if (reasons.length > 1) setReasons(reasons.filter((r) => r.id !== id)); };
  const updateReason = (id, field, value) => { setReasons(reasons.map((r) => (r.id === id ? { ...r, [field]: value } : r))); };

  const addItemRow = () => {
    setItems([...items, { id: Date.now(), type: "In Budget", category: "", currency: "GBP", payMode: "cash", card: 0, cash: 0, bank: 0, vat: 0, total: 0, note: "" }]);
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
          updated.total = card + cash;
          return updated;
        }
        return item;
      })
    );
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { if (e.target.files && e.target.files[0]) addFiles(Array.from(e.target.files)); };
  
  const addFiles = (newFilesList) => {
    setUploadedFiles((prev) => [
      ...prev,
      ...newFilesList.map((f) => ({
        id: Date.now() + Math.random(),
        file: f,
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        docDate: expenseDate || filingDate || new Date().toISOString().slice(0, 10),
      })),
    ]);
  };

  const updateFileDate = (id, newDate) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, docDate: newDate } : f))
    );
  };

  const removeFile = (id) => { setUploadedFiles((prev) => prev.filter((f) => f.id !== id)); };

  const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };
  const fmtCurrency = (val, symbol = "£") => `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const primaryCurrency = items[0]?.currency || "GBP";
  const activeSymbol = CURRENCY_SYMBOLS[primaryCurrency] || "£";

  const subtotalCard = items.reduce((sum, item) => sum + (parseFloat(item.card) || 0), 0);
  const subtotalCash = items.reduce((sum, item) => sum + (parseFloat(item.cash) || 0), 0);
  const subtotalVat = items.reduce((sum, item) => sum + (parseFloat(item.vat) || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleNext = () => {
    if (step === 1) {
      if (!claimantName.trim()) { alert("Please enter Claimant Name."); return; }
      if (!claimType.trim()) { alert("Please select a Claim Type."); return; }
      if (!expenseDate) { alert("Please select an Expense Incurred Date."); return; }
      if (!companyName.trim()) { alert("Please enter Company Name."); return; }
      if (!contactPerson.trim()) { alert("Please enter Contact Person."); return; }
      if (!contactEmail.trim()) { alert("Please enter Contact Email."); return; }
    } else if (step === 2) {
      const validReasons = reasons.filter((r) => r.option && r.option.trim());
      if (validReasons.length === 0) {
        alert("Please select at least one Claim Reason option.");
        return;
      }
    } else if (step === 3) {
      const validItems = items.filter((i) => i.category && i.category.trim());
      if (validItems.length === 0) {
        alert("Please select a description/category for at least one expense item.");
        return;
      }
      const hasAmount = items.some((i) => (parseFloat(i.card) || 0) > 0 || (parseFloat(i.cash) || 0) > 0 || (parseFloat(i.total) || 0) > 0);
      if (!hasAmount) {
        alert("Please enter a valid expense amount (Credit Card or Cash) greater than 0.");
        return;
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleClose = () => {
    if (propOnClose) propOnClose();
    if (closeClaimSheet) closeClaimSheet();
    if (isEditing) {
      navigate("/claims/pending");
    } else if (window.location.pathname === "/claims/new") {
      navigate("/claims");
    }
  };

  const submitForm = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const primaryItem = items.find((i) => i.category) || items[0];
    const claimTitle = primaryItem.category ? `${primaryItem.category} Claim` : "General Expense Claim";

    const effectiveFilingDate = (role === "super_admin" && filingDate)
      ? filingDate
      : (isEditing ? (initialClaim?.filingDate || initialClaim?.date || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10));

    let result;
    if (isEditing) {
      result = await handleResubmitClaim(claimRefNo, {
        claimantName: claimantName || currentUser || "User",
        claimType: claimType || "Staff Expense",
        filingDate: effectiveFilingDate,
        expenseDate: expenseDate || effectiveFilingDate,
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
          note: i.note || "",
        })),
        attachments: existingAttachments,
        note: claimNote || `Corrections addressed for ${claimTitle}`,
        notes: claimNote,
        subtotals: {
          subtotalCard,
          subtotalCash,
          subtotalVat,
          grandTotal
        },
        amount: grandTotal,
        department: "Operations",
      });
    } else {
      result = await handleSubmitClaim({
        claimantName: claimantName || currentUser || "User",
        claimType: claimType || "Staff Expense",
        filingDate: effectiveFilingDate,
        expenseDate: expenseDate || effectiveFilingDate,
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
          note: i.note || "",
        })),
        attachments: [],
        note: claimNote,
        notes: claimNote,
        officerNote: claimNote,
        subtotals: {
          subtotalCard,
          subtotalCash,
          subtotalVat,
          grandTotal
        },
        amount: grandTotal,
        department: "Operations",
      });
    }

    // ── Upload actual file binaries to GridFS after claim save ──────────
    if (result && result.success && (result.claimRefNo || claimRefNo)) {
      const targetRef = result.claimRefNo || claimRefNo;
      const filesWithBinary = uploadedFiles.filter(f => f.file instanceof File);
      if (filesWithBinary.length > 0) {
        try {
          const stored = localStorage.getItem("ifrs_user");
          const token = stored ? (JSON.parse(stored)?.token || "") : "";
          const formData = new FormData();
          filesWithBinary.forEach(f => formData.append("files", f.file, f.name));
          const uploadRes = await fetch(`${API_BASE_URL}/claims/${targetRef}/attachments`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (uploadRes.ok) {
            // Patch the claim in state with the newly created attachments
            await refreshClaimAttachments(targetRef);
          }
        } catch (uploadErr) {
          console.warn("[Claim] File upload to GridFS failed:", uploadErr);
        }
      }
    }

    setSubmitting(false);

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (propOnClose) propOnClose();
        if (closeClaimSheet) closeClaimSheet();
        navigate(isEditing ? "/claims/new-list" : "/claims");
      }, 1500);
    } else {
      setSubmitError(result?.message || "Submission failed. Please try again.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col mx-auto animate-scale-in">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 sm:px-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
              isEditing ? "bg-amber-400/20 text-amber-200 border-amber-300/30" : "bg-teal-400/20 text-teal-200 border-teal-300/30"
            }`}>
              {isEditing ? "Pending Claim Correction Wizard" : "Claim Application Wizard"}
            </span>
            <span className="text-xs font-mono font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20 select-all">
              {claimRefNo}
            </span>
            {isEditing && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                Pending Correction
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isEditing ? "Edit & Resubmit Pending Claim" : "Submit New Claim"}
          </h2>
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

      {/* Pending Correction Notice Banner */}
      {isEditing && (
        <div className="mx-4 sm:mx-8 mt-5 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
              <AlertCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-md border border-amber-300">
                  Correction Needed
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Claim Reference: <span className="font-mono text-teal-800 select-all">{claimRefNo}</span>
                </span>
              </div>
              <div className="mt-2 p-3 bg-white rounded-xl border border-amber-200 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="font-bold text-amber-950 block mb-0.5">Reason why sent to Pending:</span>
                <span className="text-slate-900 leading-relaxed">{pendingReason}</span>
              </div>
              <p className="text-xs text-amber-900 mt-2 font-medium">
                Please edit and correct the claim details below (amounts, descriptions, categories, or add missing receipts), then proceed to Step 4 to <strong>Send Back to Submitted Claim</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-xs text-slate-500 font-normal">Basic claimant identification, date expense was incurred, and organizational routing.</p>
              </div>
            </div>

            {/* Top Filing Date Banner (Auto-generated submission date - Not Changeable by staff) */}
            <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50/50 border border-teal-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-md border border-teal-200">
                      Official Filing Date
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (Claim Submission Date • Stamped automatically • Non-changeable)
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                    {filingDate ? new Date(filingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    <span className="text-xs font-normal text-slate-500 ml-2">[{filingDate || new Date().toISOString().slice(0, 10)}]</span>
                  </p>
                </div>
              </div>
              {role === "super_admin" && (
                <div className="flex items-center gap-2 self-start sm:self-center bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-800 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-teal-600" /> Super Admin Override:
                  </span>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="border border-teal-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50"
                    title="Super Admin override for Filing Date"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Claimant Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Claim Type <span className="text-rose-500 font-bold">*</span>
                </label>
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

              {/* Expense Incurred Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Expense Incurred Date <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white shadow-2xs"
                  title="Select the actual date when the expenditure was incurred"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Specify the date when this expenditure took place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Company Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Halal Food Authority"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Contact Person <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Line Manager Name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Contact E-Mail <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  required
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
                  <p className="text-xs text-slate-500 font-normal">
                    Specify business reasons for this expense claim <span className="text-rose-500 font-bold">(at least 1 required *)</span>.
                  </p>
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
                      <option value="">....Select Option (Required *)....</option>
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

        {/* Step 3: Expense Itemization Breakdown */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Expense Itemization Breakdown</h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Add each expenditure with currency and payment method <span className="text-rose-500 font-bold">(at least 1 required *)</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addItemRow}
                className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Expense Item
              </button>
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#007A87] text-white font-semibold">
                    <th className="text-left px-4 py-3.5 min-w-[120px] whitespace-nowrap">Type</th>
                    <th className="text-left px-4 py-3.5 min-w-[170px] whitespace-nowrap">Description</th>
                    <th className="text-left px-3 py-3.5 w-24 whitespace-nowrap">Currency</th>
                    <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Credit Card</th>
                    <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Cash</th>
                    <th className="text-right px-3 py-3.5 w-24 whitespace-nowrap">VAT</th>
                    <th className="text-right px-4 py-3.5 w-28 whitespace-nowrap">Total</th>
                    <th className="text-left px-3.5 py-3.5 min-w-[200px] whitespace-nowrap">Note / Remark</th>
                    <th className="text-center px-3 py-3.5 w-16 whitespace-nowrap">Action</th>
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
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.note || ""}
                          onChange={(e) => updateItem(item.id, "note", e.target.value)}
                          placeholder="Note for this item..."
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 bg-white shadow-2xs"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        {items.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeItemRow(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">—</span>
                        )}
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
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Optimized for Smartphone Screens) */}
            <div className="md:hidden space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Item #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-teal-900 bg-teal-100/80 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {fmtCurrency(item.total, CURRENCY_SYMBOLS[item.currency] || "£")}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Description / Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, "category", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none bg-white focus:border-teal-500 shadow-2xs"
                    >
                      <option value="">...Select Description Option...</option>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Budget Type</label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(item.id, "type", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500 shadow-2xs"
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Currency</label>
                      <select
                        value={item.currency}
                        onChange={(e) => updateItem(item.id, "currency", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500 shadow-2xs"
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Card</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.card || ""}
                        onChange={(e) => updateItem(item.id, "card", e.target.value)}
                        placeholder="0.00"
                        className={`w-full border rounded-xl px-2.5 py-2 text-xs font-semibold text-right outline-none focus:border-teal-500 bg-white ${
                          item.payMode === "card" && item.card > 0 ? "border-teal-500 ring-1 ring-teal-500/20" : "border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cash</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.cash || ""}
                        onChange={(e) => updateItem(item.id, "cash", e.target.value)}
                        placeholder="0.00"
                        className={`w-full border rounded-xl px-2.5 py-2 text-xs font-semibold text-right outline-none focus:border-teal-500 bg-white ${
                          item.payMode === "cash" && item.cash > 0 ? "border-teal-500 ring-1 ring-teal-500/20" : "border-slate-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">VAT</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.vat || ""}
                        onChange={(e) => updateItem(item.id, "vat", e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-right outline-none focus:border-teal-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Note / Remark for this item (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.note || ""}
                      onChange={(e) => updateItem(item.id, "note", e.target.value)}
                      placeholder="e.g. Receipt ref, attendees, or travel rationale..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 bg-white shadow-2xs"
                    />
                  </div>
                </div>
              ))}

              {/* Mobile Grand Subtotals Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#054D66] to-[#007A87] text-white shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-200">Grand Total ({activeSymbol})</span>
                  <span className="text-lg font-black text-white">{fmtCurrency(grandTotal, activeSymbol)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white/10">
                    <p className="text-[10px] text-teal-200 font-medium">Card</p>
                    <p className="font-bold text-white mt-0.5">{fmtCurrency(subtotalCard, activeSymbol)}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <p className="text-[10px] text-teal-200 font-medium">Cash</p>
                    <p className="font-bold text-white mt-0.5">{fmtCurrency(subtotalCash, activeSymbol)}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <p className="text-[10px] text-teal-200 font-medium">VAT</p>
                    <p className="font-bold text-white mt-0.5">{fmtCurrency(subtotalVat, activeSymbol)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Add Attachments & Supporting Documents (Date added to each file) */}
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
                    <p className="text-xs text-slate-500 font-normal">Attach receipts, invoices, or supporting files and specify their individual dates.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} attached
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

              {/* Previously Uploaded Attachments (if editing) */}
              {isEditing && existingAttachments && existingAttachments.length > 0 && (
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-teal-700" />
                      Previously Attached Documents ({existingAttachments.length})
                    </span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      Kept with Claim
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {existingAttachments.map((f, idx) => {
                      const name = typeof f === "string" ? f : f.fileName || f.name || `Attachment ${idx + 1}`;
                      const size = typeof f === "object" ? f.fileSize || "Attached file" : "Attached file";
                      const date = typeof f === "object" ? (f.date || f.docDate || f.uploadDate || "") : "";
                      return (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-teal-200/80 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm">📄</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-800 truncate" title={name}>{name}</p>
                              <p className="text-[10px] text-slate-400">{size}{date ? ` • ${date}` : ""}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {uploadedFiles.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                            {item.name.split('.').pop().slice(0, 3)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Receipt / Supporting Document Date Input */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={12} className="text-teal-600" />
                          <span>Receipt Date:</span>
                        </label>
                        <input
                          type="date"
                          value={item.docDate}
                          onChange={(e) => updateFileDate(item.id, e.target.value)}
                          className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-colors"
                          title="Date of receipt or supporting document"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claim Notes & Remarks Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Claim Note / Additional Remarks</h3>
                  <p className="text-xs text-slate-500 font-normal">Add any context, business explanation, or remarks regarding this claim.</p>
                </div>
              </div>
              <textarea
                rows={3}
                value={claimNote}
                onChange={(e) => setClaimNote(e.target.value)}
                placeholder="Enter claim notes, travel details, or justification for the finance team..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all resize-none shadow-xs"
              />
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-[#054D66] to-[#007A87] rounded-3xl p-6 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm tracking-tight text-teal-100">Claim Application Summary</h4>
                <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                  {claimRefNo}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
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
                  <p className="font-bold text-white mt-0.5">{filingDate}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Expense Date</p>
                  <p className="font-bold text-white mt-0.5">{expenseDate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-teal-200/80">Grand Total Amount</p>
                  <p className="font-extrabold text-white text-sm mt-0.5">{fmtCurrency(grandTotal, activeSymbol)}</p>
                </div>
              </div>

              {claimNote && claimNote.trim() && (
                <div className="pt-3 border-t border-white/10 text-xs">
                  <p className="text-[11px] text-teal-200/80 font-medium">Claim Note / Remarks:</p>
                  <p className="text-white text-xs mt-0.5 italic line-clamp-2">"{claimNote}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
          {submitError && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              {submitError}
            </span>
          )}
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
              disabled={submitting}
              onClick={submitForm}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                isEditing
                  ? "bg-teal-700 hover:bg-teal-800"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <CheckCircle2 size={16} />
              <span>
                {submitting
                  ? (isEditing ? "Submitting Corrections..." : "Submitting...")
                  : (isEditing ? "Send Back to Submitted Claim" : "Submit Claim Application")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
