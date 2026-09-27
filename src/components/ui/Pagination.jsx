import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { T } from "../../constants/theme";

export default function Pagination({
  page,
  setPage,
  totalItems,
  pageSize = 10,
  setPageSize = null,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [jumpVal, setJumpVal] = useState("");

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpVal, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
      setJumpVal("");
    }
  };

  const fromIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-200 flex-wrap gap-4 bg-slate-50/70 select-none">
      {/* Showing X to Y of Z and page size selector */}
      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
        <span>
          Showing <strong className="text-slate-900 font-bold">{fromIndex.toLocaleString()}</strong>–
          <strong className="text-slate-900 font-bold">{toIndex.toLocaleString()}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{totalItems.toLocaleString()}</strong> records
        </span>

        {setPageSize && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-800 font-semibold focus:border-teal-600 shadow-xs cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons and Windowed Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* First Page */}
        <button
          type="button"
          onClick={() => setPage(1)}
          disabled={page === 1}
          title="First Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          title="Previous Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Numbered Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-xs font-bold text-slate-400 select-none"
                >
                  …
                </span>
              );
            }
            const isActive = page === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg border transition-all shadow-xs cursor-pointer ${
                  isActive
                    ? "bg-teal-700 text-white border-teal-700 font-bold shadow-teal-700/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          title="Next Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          title="Last Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
        >
          <ChevronsRight size={15} />
        </button>

        {/* Jump to Page */}
        {totalPages > 5 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
            <span className="text-[11px] text-slate-400 font-medium">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpVal}
              onChange={(e) => setJumpVal(e.target.value)}
              placeholder={String(page)}
              className="w-12 h-7 text-xs text-center border border-slate-200 rounded-md bg-white text-slate-800 font-medium outline-none focus:border-teal-600 shadow-xs"
            />
          </form>
        )}
      </div>
    </div>
  );
}
