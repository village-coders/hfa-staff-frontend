import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

// Individual toast item with its own progress bar and auto-dismiss timer
function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;
  const intervalRef = useRef(null);
  const startRef = useRef(Date.now());

  const dismiss = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 320);
  };

  useEffect(() => {
    // Progress bar countdown
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(intervalRef.current);
    }, 30);

    // Auto dismiss
    const timer = setTimeout(dismiss, duration);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const configs = {
    success: {
      icon: <CheckCircle2 size={18} className="text-teal-400 flex-shrink-0" />,
      bar: "#14B8A6",
      border: "border-teal-500",
    },
    error: {
      icon: <XCircle size={18} className="text-rose-400 flex-shrink-0" />,
      bar: "#F43F5E",
      border: "border-rose-500",
    },
    info: {
      icon: <Info size={18} className="text-amber-400 flex-shrink-0" />,
      bar: "#F59E0B",
      border: "border-amber-500",
    },
    warning: {
      icon: <AlertCircle size={18} className="text-orange-400 flex-shrink-0" />,
      bar: "#FB923C",
      border: "border-orange-500",
    },
  };

  const cfg = configs[toast.type] || configs.info;

  return (
    <div
      style={{
        transform: exiting ? "translateX(110%)" : "translateX(0)",
        opacity: exiting ? 0 : 1,
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease",
      }}
      className={`relative w-full max-w-sm bg-slate-900/95 backdrop-blur-md border ${cfg.border} rounded-2xl shadow-2xl overflow-hidden`}
    >
      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {cfg.icon}
        <p className="text-xs font-semibold text-white leading-snug flex-1 min-w-0">
          {toast.message}
        </p>
        <button
          onClick={dismiss}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer ml-1"
        >
          <X size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 w-full">
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, backgroundColor: cfg.bar }}
        />
      </div>
    </div>
  );
}

// Container — renders a stack of toasts via portal
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      style={{ maxWidth: "min(calc(100vw - 40px), 380px)" }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
