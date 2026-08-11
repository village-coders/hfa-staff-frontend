import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, FileEdit, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ROLES } from "../constants/menu";

export default function UsersPage() {
  const { users, role, handleAddUser, handleUpdateUser, handleDeleteUser } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", username: "", role: "user", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", username: "", role: "user", password: "" });

  const isAdmin = role === "admin";

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password || !form.role) return;
    handleAddUser(form);
    setForm({ name: "", email: "", username: "", role: "user", password: "" });
    setShowForm(false);
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setEditForm({ _id: u._id, name: u.name, email: u.email, username: u.username, role: u.role });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editForm.name) return;
    handleUpdateUser({ ...editForm, _id: editingUser._id, username: editingUser.username });
    setEditingUser(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage organization accounts, credentials and system permissions.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitAdd} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-scale-in">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Add New User Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="e.g. Samuel Ekong" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Username</label>
              <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="e.g. sekong" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email Address</label>
              <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="email@ifrs.org" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
              <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="Set user password" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Assign Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white text-slate-800 font-medium focus:border-teal-500">
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md cursor-pointer">Create User Account</button>
          </div>
        </form>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Username</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                {isAdmin && <th className="text-center px-5 py-3 w-28">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleInfo = ROLES.find((r) => r.id === u.role);
                return (
                  <tr key={u.username} className="hover:bg-slate-50 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{u.username}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                        {roleInfo?.label || u.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <FileEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={submitEdit} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit User Details ({editingUser.username})</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input value={editForm.password || ""} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} type="password" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" placeholder="Leave blank to keep existing password" />
                <p className="text-[10px] text-slate-400 mt-1">Password changes are done separately — leave blank.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none bg-white focus:border-teal-500">
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md cursor-pointer">Save Changes</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
