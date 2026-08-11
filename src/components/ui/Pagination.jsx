import React from "react";
import { ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { T } from "../../constants/theme";

export default function Pagination({ page, setPage, totalItems, pageSize = 10 }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 flex-wrap gap-3 bg-slate-50/50">
      <p className="text-xs font-medium text-slate-600">
        Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className="w-8 h-8 text-xs font-medium rounded-md border transition-colors shadow-sm"
            style={
              page === i + 1
                ? { backgroundColor: T.tealMain, color: T.white, borderColor: T.tealMain }
                : { borderColor: "#E2E8F0", color: "#334155", backgroundColor: "#FFFFFF" }
            }
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronRightIcon size={15} />
        </button>
      </div>
    </div>
  );
}
