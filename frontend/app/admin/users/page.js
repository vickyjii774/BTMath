
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

      console.log("ADMIN USERS RESPONSE:", data);

      // Support several common Django response formats.
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

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const firstName = String(user.first_name || "").toLowerCase();
      const lastName = String(user.last_name || "").toLowerCase();

      return (
        username.includes(value) ||
        email.includes(value) ||
        firstName.includes(value) ||
        lastName.includes(value)
      );
    });
  }, [users, search]);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    router.replace("/admin/login");
  }

  function getFullName(user) {
    const name = `${user.first_name || ""} ${
      user.last_name || ""
    }`.trim();

    return name || "—";
  }

  function getRole(user) {
    if (user.is_superuser) {
      return "Super Admin";
    }

    if (user.is_staff) {
      return "Staff";
    }

    return "Student";
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/admin"
              className="text-xl font-bold tracking-tight"
            >
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

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Manage registered users, administrator permissions and account
              status.
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
          <StatCard
            label="Total Users"
            value={users.length}
          />

          <StatCard
            label="Active Users"
            value={
              users.filter(
                (user) => user.is_active !== false
              ).length
            }
          />

          <StatCard
            label="Staff"
            value={
              users.filter((user) => user.is_staff).length
            }
          />

          <StatCard
            label="Super Admins"
            value={
              users.filter((user) => user.is_superuser).length
            }
          />
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Registered Users</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredUsers.length} user
                {filteredUsers.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search username, email or name..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
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

            <p className="mt-4 text-sm text-gray-500">
              Loading users...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-4xl">👥</div>

            <h2 className="mt-4 text-lg font-semibold">
              No users found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "No users match your search."
                : "There are currently no registered users."}
            </p>
          </div>
        )}

        {/* Users table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* User */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                            {String(
                              user.username || "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {user.username || "Unknown"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {getFullName(user)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {user.email || "—"}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5">
                        <RoleBadge user={user} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {user.is_active === false ? (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Inactive
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
                          ? new Date(
                              user.date_joined
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              `User management for ${user.username} will be connected next.`
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight">
        {value}
      </p>
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
