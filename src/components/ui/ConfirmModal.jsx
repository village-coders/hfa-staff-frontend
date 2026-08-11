import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary", // "primary" | "danger" | "warning"
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-md",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md",
    warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-md",
  };

  const iconColors = {
    primary: "bg-teal-100 text-teal-700 border-teal-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${iconColors[confirmVariant] || iconColors.primary}`}>
            {confirmVariant === "danger" || confirmVariant === "warning" ? (
              <AlertTriangle size={22} />
            ) : (
              <CheckCircle2 size={22} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-base text-slate-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${variantStyles[confirmVariant] || variantStyles.primary}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
