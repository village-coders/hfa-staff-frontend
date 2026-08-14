import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Eye, Package, PackagePlus, PlusCircle, X, User, Calendar,
  Building, DollarSign, Paperclip, Store, Tag, Clock
} from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { useApp } from "../context/AppContext";
import { PATH_TO_VIEW } from "../constants/menu";
import { fmtN } from "../constants/theme";

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
          onClick={() => navigate("/assets/add")}
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
                  <td className="px-5 py-3.5 font-medium text-slate-900">{a.name || a.assetName}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.category || a.assetType}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.dept || a.department}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.acquired || a.datePurchased}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      a.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {a.status || "Active"}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 flex items-center justify-center font-bold">
                  <Package size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                      {selectedAsset.serialNumber || selectedAsset.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      selectedAsset.status === "Active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-slate-500/20 text-slate-300 border border-slate-400/30"
                    }`}>
                      {selectedAsset.status || "Active"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-white mt-1 leading-snug">{selectedAsset.assetName || selectedAsset.name || "Asset Details"}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
                title="Close Details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Primary Detail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700 mt-0.5">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asset Category / Type</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.category || selectedAsset.assetType || "Equipment"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 mt-0.5">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Staff</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.staffName || "Unassigned"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 mt-0.5">
                    <Building size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.dept || selectedAsset.department || "Operations"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Purchased</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.acquired || selectedAsset.datePurchased || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expiry / Warranty Date</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.expiryDate || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 mt-0.5">
                    <Store size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Seller / Vendor</p>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedAsset.sellerVendor || selectedAsset.sellerName || "N/A"}</p>
                  </div>
                </div>

                {/* Amount Banner Card */}
                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-center justify-between col-span-2 sm:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">Asset Valuation / Cost</p>
                      <p className="font-black text-2xl text-teal-950 mt-0.5">{fmtN(selectedAsset.amount || 0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">System Serial Number</p>
                    <p className="text-xs font-mono font-bold text-teal-900 mt-1">{selectedAsset.serialNumber || selectedAsset.id}</p>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {selectedAsset.attachments && selectedAsset.attachments.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip size={14} className="text-teal-600" />
                    <span>Associated Documents ({selectedAsset.attachments.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAsset.attachments.map((file, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {typeof file === "string" ? (file.split('.').pop() || "DOC") : "DOC"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{typeof file === "string" ? file : file.name || file.fileName || `Attachment ${idx + 1}`}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Verified File</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#054D66] hover:from-[#006670] hover:to-[#043D52] shadow-md transition-all cursor-pointer"
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

