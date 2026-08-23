"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Edit2,
  CheckCircle2,
  X,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import { AdminUser, UserRole } from "@/types/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>("BUYER");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getUsers({
      search: searchQuery.trim() || undefined,
      role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
      limit: 20,
    })
      .then((res) => {
        if (isMounted) {
          setUsers(res.users);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load user roster.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, roleFilter]);

  const refreshUsers = async () => {
    try {
      const res = await AdminApiService.getUsers({
        search: searchQuery.trim() || undefined,
        role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
        limit: 20,
      });
      setUsers(res.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh users.");
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await AdminApiService.updateUserRole(selectedUser.id, targetRole);
      setActionSuccess(`User "${selectedUser.name}" role updated to ${targetRole}.`);
      setIsRoleModalOpen(false);
      await refreshUsers();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      if (user.isActive) {
        if (!confirm(`Are you sure you want to deactivate user "${user.name}"?`)) return;
        await AdminApiService.deactivateUser(user.id);
        setActionSuccess(`User "${user.name}" deactivated.`);
      } else {
        await AdminApiService.activateUser(user.id);
        setActionSuccess(`User "${user.name}" activated.`);
      }
      await refreshUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update user active status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {actionSuccess && (
        <div className="p-4 bg-success-green-light border border-success-green/20 rounded-2xl text-success-green flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red text-xs">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">User Roster &amp; Roles</h1>
          <p className="text-xs text-text-secondary">
            Manage registered buyers, property owners, field agents, and administrative permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["ALL", "BUYER", "OWNER", "AGENT", "ADMIN"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? "bg-primary-navy text-white shadow-soft-xs"
                  : "bg-bg-light text-text-secondary hover:text-primary-navy"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden space-y-4 p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
          />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <Users className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">User UUID</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-navy text-accent-gold font-bold text-xs flex items-center justify-center">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-primary-navy">{u.name}</p>
                          <p className="text-[10px] text-text-muted">{u.email} • {u.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          u.role === "ADMIN"
                            ? "bg-accent-gold/15 text-accent-gold-hover border border-accent-gold/30"
                            : u.role === "AGENT"
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "OWNER"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          u.isActive
                            ? "bg-success-green/10 text-success-green"
                            : "bg-error-red/10 text-error-red"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted font-mono text-[10px] select-all">
                      {u.id}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setTargetRole(u.role);
                            setIsRoleModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-border-default text-text-secondary hover:text-primary-navy hover:bg-white text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Role</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`p-1 rounded-lg transition-colors ${
                            u.isActive
                              ? "text-error-red hover:bg-error-red-light"
                              : "text-success-green hover:bg-success-green-light"
                          }`}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROLE MODAL */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Update User Role</h3>
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {modalError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-bg-light border border-border-subtle text-xs">
              <p className="font-bold text-primary-navy">{selectedUser.name}</p>
              <p className="text-[10px] text-text-muted">{selectedUser.email}</p>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Select Persona Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                >
                  <option value="BUYER">BUYER (Public Property Seeker)</option>
                  <option value="OWNER">OWNER (Property Seller / Landlord)</option>
                  <option value="AGENT">AGENT (Licensed Broker / Lead Receiver)</option>
                  <option value="ADMIN">ADMIN (Full Marketplace Governance)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Confirm Role Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
