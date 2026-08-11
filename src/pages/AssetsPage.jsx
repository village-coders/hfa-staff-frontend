import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Eye, Package, PackagePlus, PlusCircle, X } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { useApp } from "../context/AppContext";
import { PATH_TO_VIEW } from "../constants/menu";

export default function AssetsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assets, openAddAsset } = useApp();

  const viewKey = PATH_TO_VIEW[location.pathname] || "manage-asset";
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const pageSize = 10;
  const paged = assets.slice((page - 1) * pageSize, page * pageSize);

  if (viewKey === "new-asset-list") {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-lg font-bold text-slate-900">New Asset List</h2>
        <p className="text-xs text-slate-500 font-medium">Assets pending inventory verification.</p>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState icon={PackagePlus} title="No new assets" subtitle="Newly added assets awaiting review will appear here." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Assets</h2>
          <p className="text-xs text-slate-500 font-medium">{assets.length} total asset records</p>
        </div>
        <button
          onClick={openAddAsset}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Add New Asset</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Asset ID</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Acquired</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-teal-800">{a.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{a.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.dept}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.acquired}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      a.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedAsset(a)}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-700 shadow-sm transition-colors cursor-pointer"
                      title="View Asset Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} setPage={setPage} totalItems={assets.length} pageSize={pageSize} />
      </div>

      {/* Asset Detail Popup Modal */}
      {selectedAsset && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedAsset.id}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedAsset.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.category}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Department</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.dept}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Date Acquired</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.acquired}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Asset Status</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  selectedAsset.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {selectedAsset.status}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">System Serial Number</p>
                <p className="font-mono font-bold text-teal-800 mt-1">
                  SN-AST-{selectedAsset.id.replace(/[^0-9]/g, '') || "994021"}-X88
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
