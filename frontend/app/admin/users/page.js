"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAdminStudentDetail,
  toggleDisableUser,
  resetUserPassword,
  manageUserAccess,
} from "../../../lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected student for 360-degree management modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailData, setUserDetailData] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accessGroupSlug, setAccessGroupSlug] = useState("PLUS_TWO");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/admin/users/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        router.replace("/admin/login");
        return;
      }

      if (response.status === 403) {
        setError("You do not have administrator permission.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load users. Server returned ${response.status}.`
        );
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.results)) {
        setUsers(data.results);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("ADMIN USERS ERROR:", err);
      setError(
        err?.message ||
          "Unable to load users. Please check that the Django server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function openUserModal(user) {
    setSelectedUser(user);
    setUserDetailLoading(true);
    setActionMessage("");
    setActionError("");
    setNewPassword("");

    try {
      const detail = await getAdminStudentDetail(user.id);
      setUserDetailData(detail);
    } catch (err) {
      console.error("Failed to load user detail:", err);
      setUserDetailData(null);
      setActionError(err.message || "Failed to load detailed profile.");
    } finally {
      setUserDetailLoading(false);
    }
  }

  async function handleToggleDisable() {
    if (!selectedUser) return;
    setActionMessage("");
    setActionError("");

    try {
      const res = await toggleDisableUser(selectedUser.id);
      setActionMessage(res.message || "User status updated.");
      // Refresh modal detail and list
      const updatedDetail = await getAdminStudentDetail(selectedUser.id);
      setUserDetailData(updatedDetail);
      loadUsers();
    } catch (err) {
      setActionError(err.message || "Failed to toggle user status.");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setActionMessage("");
    setActionError("");

    try {
      const res = await resetUserPassword(selectedUser.id, newPassword);
      setActionMessage(res.message || "Password updated successfully.");
      setNewPassword("");
    } catch (err) {
      setActionError(err.message || "Failed to reset password.");
    }
  }

  async function handleGrantAccess(action = "grant") {
    if (!selectedUser) return;
    setActionMessage("");
    setActionError("");

    try {
      const res = await manageUserAccess(selectedUser.id, {
        access_group_slug: accessGroupSlug,
        action,
      });
      setActionMessage(res.message || `Access group ${action}ed.`);
      const updatedDetail = await getAdminStudentDetail(selectedUser.id);
      setUserDetailData(updatedDetail);
    } catch (err) {
      setActionError(err.message || `Failed to ${action} access.`);
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const firstName = String(user.first_name || "").toLowerCase();
      const lastName = String(user.last_name || "").toLowerCase();
      const studentId = String(
        user.student_id || user.profile?.student_id || ""
      ).toLowerCase();
      const phone = String(user.profile?.phone || "").toLowerCase();

      const matchesSearch =
        !value ||
        username.includes(value) ||
        email.includes(value) ||
        firstName.includes(value) ||
        lastName.includes(value) ||
        studentId.includes(value) ||
        phone.includes(value);

      if (!matchesSearch) return false;

      if (statusFilter === "disabled") {
        return user.profile?.is_disabled === true || user.is_active === false;
      }
      if (statusFilter === "active") {
        return user.profile?.is_disabled !== true && user.is_active !== false;
      }
      if (statusFilter === "staff") {
        return user.is_staff === true;
      }
      if (statusFilter === "super") {
        return user.is_superuser === true;
      }

      return true;
    });
  }, [users, search, statusFilter]);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.replace("/admin/login");
  }

  function getFullName(user) {
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return name || user.profile?.full_name || "—";
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              BTMath
            </Link>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Administration
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/payments"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Payments
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Website
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Student & User Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Search by Student ID (BTM-XXXXXX), email, name, manage access groups, toggle accounts and reset credentials.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={users.length} />
          <StatCard
            label="Active Students"
            value={
              users.filter(
                (u) => !u.is_staff && !u.profile?.is_disabled && u.is_active !== false
              ).length
            }
          />
          <StatCard
            label="Disabled Accounts"
            value={
              users.filter(
                (u) => u.profile?.is_disabled === true || u.is_active === false
              ).length
            }
          />
          <StatCard
            label="Staff / Admins"
            value={users.filter((u) => u.is_staff || u.is_superuser).length}
          />
        </div>

        {/* Search & Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Student ID (e.g. BTM-000001), username, email..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium outline-none"
              >
                <option value="all">All Users ({users.length})</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
                <option value="staff">Staff Only</option>
                <option value="super">Super Admin Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-semibold">Unable to load users</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            <p className="mt-4 text-sm text-gray-500">Loading users...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-4xl">👥</div>
            <h2 className="mt-4 text-lg font-semibold">No users found</h2>
            <p className="mt-2 text-sm text-gray-500">
              {search ? "No users match your search." : "No registered users."}
            </p>
          </div>
        )}

        {/* Users Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Student ID
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email & Phone
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const studentId =
                      user.student_id ||
                      user.profile?.student_id ||
                      `BTM-${String(user.id).padStart(6, "0")}`;
                    const isDisabled =
                      user.profile?.is_disabled === true ||
                      user.is_active === false;

                    return (
                      <tr key={user.id} className="transition hover:bg-gray-50">
                        {/* Student ID */}
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            {studentId}
                          </span>
                        </td>

                        {/* User info */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                              {String(user.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.username || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getFullName(user)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="px-6 py-5 text-sm text-gray-600">
                          <div>{user.email || "—"}</div>
                          {user.profile?.phone && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              📞 {user.profile.phone}
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          <RoleBadge user={user} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          {isDisabled ? (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Disabled
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-5 text-sm text-gray-500">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => openUserModal(user)}
                            className="rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                          >
                            Manage 
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/*  Student Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                {selectedUser.student_id ||
                  selectedUser.profile?.student_id ||
                  `BTM-${String(selectedUser.id).padStart(6, "0")}`}
              </span>
              <h2 className="text-xl font-bold text-gray-950">
                {selectedUser.username}
              </h2>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {getFullName(selectedUser)} • {selectedUser.email}
            </p>

            {actionMessage && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800 font-medium">
                ✓ {actionMessage}
              </div>
            )}
            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                ⚠ {actionError}
              </div>
            )}

            {userDetailLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading student records...
              </div>
            ) : userDetailData ? (
              <div className="mt-6 space-y-6">
                {/* Account Status & Toggle */}
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Account Status
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      {userDetailData.profile?.is_disabled
                        ? "Currently Disabled (Cannot log in)"
                        : "Active & Enabled"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleDisable}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                      userDetailData.profile?.is_disabled
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {userDetailData.profile?.is_disabled
                      ? "Enable Account"
                      : "Disable Account"}
                  </button>
                </div>

                {/* Active Access Groups */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Active Access Groups ({userDetailData.access_groups?.length || 0})
                  </h3>
                  {userDetailData.access_groups?.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {userDetailData.access_groups.map((ag) => (
                        <div
                          key={ag.id}
                          className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-blue-900">
                              {ag.access_group?.name || ag.name}
                            </span>
                            <span className="ml-2 text-gray-500">
                              Slug: {ag.access_group?.slug || ag.slug}
                            </span>
                          </div>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500 italic">
                      No access groups assigned yet.
                    </p>
                  )}

                  {/* Quick Grant Access */}
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={accessGroupSlug}
                      onChange={(e) => setAccessGroupSlug(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium"
                    >
                      <option value="PLUS_TWO">+2 Science & Management (PLUS_TWO)</option>
                      <option value="BACHELOR">Bachelor Mathematics (BACHELOR)</option>
                      <option value="MASTER">Master Mathematics (MASTER)</option>
                      <option value="IOE">IOE Entrance Preparation (IOE)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleGrantAccess("grant")}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      + Grant Group
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGrantAccess("revoke")}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  </div>
                </div>

                {/* Purchases & Payments */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Total Purchases
                    </p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {userDetailData.purchases?.length || 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Total Payments
                    </p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {userDetailData.payments?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Reset Password Form */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Direct Password Reset
                  </h4>
                  <form onSubmit={handleResetPassword} className="flex gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new student password"
                      required
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            <div className="mt-6 border-t pt-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function RoleBadge({ user }) {
  if (user.is_superuser) {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Super Admin
      </span>
    );
  }

  if (user.is_staff) {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Staff
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
      Student
    </span>
  );
}
