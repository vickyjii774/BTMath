"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const SECTIONS = [
  {
    value: "plus2",
    label: "+2",
    description: "Grade 11 & Grade 12",
  },
  {
    value: "bachelor",
    label: "Bachelor",
    description: "Bachelor Mathematics",
  },
  {
    value: "master",
    label: "Master",
    description: "Master Mathematics",
  },
  {
    value: "ioe",
    label: "IOE",
    description: "Engineering Mathematics",
  },
];

export default function SectionAccessPage() {
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accessList, setAccessList] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);

  const [form, setForm] = useState({
    user: "",
    section: "plus2",
    is_active: true,
    expires_at: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      router.replace("/admin/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!token) return;

    loadData();
  }, [token]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [accessResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/admin/section-access/`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_URL}/admin/users/`, {
          method: "GET",
          headers,
        }),
      ]);

      if (accessResponse.status === 401 || usersResponse.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/admin/login");
        return;
      }

      if (accessResponse.status === 403 || usersResponse.status === 403) {
        throw new Error("You do not have administrator permission.");
      }

      if (!accessResponse.ok) {
        throw new Error("Failed to load section access.");
      }

      if (!usersResponse.ok) {
        throw new Error("Failed to load users.");
      }

      const accessData = await accessResponse.json();
      const usersData = await usersResponse.json();

      // ----------------------------------------------------------
      // Section access response
      // ----------------------------------------------------------

      let accessRecords = [];

      if (Array.isArray(accessData)) {
        accessRecords = accessData;
      } else if (Array.isArray(accessData.access)) {
        accessRecords = accessData.access;
      } else if (Array.isArray(accessData.sections)) {
        accessRecords = accessData.sections;
      } else if (Array.isArray(accessData.results)) {
        accessRecords = accessData.results;
      }

      // ----------------------------------------------------------
      // Users response
      // ----------------------------------------------------------

      let userRecords = [];

      if (Array.isArray(usersData)) {
        userRecords = usersData;
      } else if (Array.isArray(usersData.users)) {
        userRecords = usersData.users;
      } else if (Array.isArray(usersData.results)) {
        userRecords = usersData.results;
      }

      setAccessList(accessRecords);
      setUsers(userRecords);
    } catch (err) {
      console.error("SECTION ACCESS LOAD ERROR:", err);

      setError(
        err.message || "Unable to load section access."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function getSectionLabel(section) {
    const found = SECTIONS.find(
      (item) => item.value === section
    );

    return found ? found.label : section;
  }

  function getSectionDescription(section) {
    const found = SECTIONS.find(
      (item) => item.value === section
    );

    return found ? found.description : "";
  }

  function getUserName(record) {
    if (!record) return "Unknown User";

    if (record.user_details) {
      const details = record.user_details;

      const fullName =
        `${details.first_name || ""} ${details.last_name || ""}`.trim();

      return (
        fullName ||
        details.username ||
        details.email ||
        `User #${details.id}`
      );
    }

    if (record.user && typeof record.user === "object") {
      const user = record.user;

      const fullName =
        `${user.first_name || ""} ${user.last_name || ""}`.trim();

      return (
        fullName ||
        user.username ||
        user.email ||
        `User #${user.id}`
      );
    }

    const userId =
      typeof record.user === "number"
        ? record.user
        : record.user_id;

    const user = users.find(
      (item) => String(item.id) === String(userId)
    );

    if (!user) {
      return userId ? `User #${userId}` : "Unknown User";
    }

    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return (
      fullName ||
      user.username ||
      user.email ||
      `User #${user.id}`
    );
  }

  function getUserEmail(record) {
    if (!record) return "";

    if (record.user_details?.email) {
      return record.user_details.email;
    }

    if (record.user?.email) {
      return record.user.email;
    }

    const userId =
      typeof record.user === "number"
        ? record.user
        : record.user_id;

    const user = users.find(
      (item) => String(item.id) === String(userId)
    );

    return user?.email || "";
  }

  function getUserId(record) {
    if (!record) return "";

    if (typeof record.user === "number") {
      return record.user;
    }

    if (typeof record.user === "string") {
      return record.user;
    }

    if (record.user?.id) {
      return record.user.id;
    }

    if (record.user_id) {
      return record.user_id;
    }

    return "";
  }

  function formatDate(value) {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "—";
    }
  }

  function formatDateTime(value) {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return "—";
    }
  }

  function isExpired(record) {
    if (!record?.expires_at) return false;

    return new Date(record.expires_at) <= new Date();
  }

  function isCurrentlyActive(record) {
    return Boolean(record?.is_active) && !isExpired(record);
  }

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAccess = useMemo(() => {
    return accessList.filter((record) => {
      const name = getUserName(record).toLowerCase();
      const email = getUserEmail(record).toLowerCase();
      const section =
        String(record.section || "").toLowerCase();

      const searchMatch =
        !search ||
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        section.includes(search.toLowerCase());

      const sectionMatch =
        sectionFilter === "all" ||
        record.section === sectionFilter;

      const active = isCurrentlyActive(record);

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return (
        searchMatch &&
        sectionMatch &&
        statusMatch
      );
    });
  }, [
    accessList,
    search,
    sectionFilter,
    statusFilter,
    users,
  ]);

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    const active = accessList.filter(
      (item) => isCurrentlyActive(item)
    );

    return {
      total: accessList.length,
      active: active.length,
      plus2: active.filter(
        (item) => item.section === "plus2"
      ).length,
      bachelor: active.filter(
        (item) => item.section === "bachelor"
      ).length,
      master: active.filter(
        (item) => item.section === "master"
      ).length,
      ioe: active.filter(
        (item) => item.section === "ioe"
      ).length,
    };
  }, [accessList]);

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  function openAddModal() {
    setEditingAccess(null);

    setForm({
      user: "",
      section: "plus2",
      is_active: true,
      expires_at: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  function openEditModal(record) {
    setEditingAccess(record);

    const userId = getUserId(record);

    let expiresAt = "";

    if (record.expires_at) {
      try {
        const date = new Date(record.expires_at);

        const year = date.getFullYear();
        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
          date.getDate()
        ).padStart(2, "0");

        expiresAt = `${year}-${month}-${day}`;
      } catch {
        expiresAt = "";
      }
    }

    setForm({
      user: userId ? String(userId) : "",
      section: record.section || "plus2",
      is_active: Boolean(record.is_active),
      expires_at: expiresAt,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingAccess(null);
  }

  // ============================================================
  // FORM CHANGE
  // ============================================================

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ============================================================
  // SAVE
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.user) {
      setError("Please select a user.");
      return;
    }

    if (!form.section) {
      setError("Please select a section.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        user: Number(form.user),
        section: form.section,
        is_active: Boolean(form.is_active),
        expires_at: form.expires_at
          ? `${form.expires_at}T23:59:59`
          : null,
      };

      const url = editingAccess
        ? `${API_URL}/admin/section-access/${editingAccess.id}/`
        : `${API_URL}/admin/section-access/`;

      const method = editingAccess ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to save section access."
        );
      }

      setSuccess(
        editingAccess
          ? "Section access updated successfully."
          : "Section access granted successfully."
      );

      setShowModal(false);
      setEditingAccess(null);

      await loadData();
    } catch (err) {
      console.error("SECTION ACCESS SAVE ERROR:", err);

      setError(
        err.message ||
          "Unable to save section access."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // TOGGLE ACTIVE
  // ============================================================

  async function toggleAccess(record) {
    const currentStatus = isCurrentlyActive(record);

    const confirmed = window.confirm(
      currentStatus
        ? `Deactivate ${getSectionLabel(
            record.section
          )} access for ${getUserName(record)}?`
        : `Activate ${getSectionLabel(
            record.section
          )} access for ${getUserName(record)}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/section-access/${record.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: Number(getUserId(record)),
            section: record.section,
            is_active: !currentStatus,
            expires_at: record.expires_at || null,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to change access status."
        );
      }

      setSuccess(
        currentStatus
          ? "Section access deactivated."
          : "Section access activated."
      );

      await loadData();
    } catch (err) {
      console.error("TOGGLE ACCESS ERROR:", err);

      setError(
        err.message ||
          "Unable to change access status."
      );
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function deleteAccess(record) {
    const confirmed = window.confirm(
      `Permanently revoke ${getSectionLabel(
        record.section
      )} access for ${getUserName(record)}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/section-access/${record.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to revoke access."
        );
      }

      setSuccess("Section access revoked successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE ACCESS ERROR:", err);

      setError(
        err.message ||
          "Unable to revoke section access."
      );
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

              <p className="text-sm font-medium text-gray-600">
                Loading section access...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-3 text-sm font-medium text-gray-500 hover:text-black"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Section Access
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Control which BTMath sections each student can access.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + Grant Section Access
          </button>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">

          <StatCard
            title="Total"
            value={stats.total}
          />

          <StatCard
            title="Active"
            value={stats.active}
          />

          <StatCard
            title="+2"
            value={stats.plus2}
          />

          <StatCard
            title="Bachelor"
            value={stats.bachelor}
          />

          <StatCard
            title="Master"
            value={stats.master}
          />

          <StatCard
            title="IOE"
            value={stats.ioe}
          />

        </div>

        {/* SECTION INFORMATION */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((section) => (
            <button
              key={section.value}
              onClick={() =>
                setSectionFilter(section.value)
              }
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                sectionFilter === section.value
                  ? "border-black ring-2 ring-black/10"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="text-lg font-bold text-gray-900">
                {section.label}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {section.description}
              </div>

              <div className="mt-4 text-2xl font-bold text-gray-900">
                {
                  stats[
                    section.value === "plus2"
                      ? "plus2"
                      : section.value
                  ]
                }
              </div>

              <div className="text-xs text-gray-500">
                active users
              </div>
            </button>
          ))}
        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search user or email..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Section
              </label>

              <select
                value={sectionFilter}
                onChange={(event) =>
                  setSectionFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="all">
                  All Sections
                </option>

                {SECTIONS.map((section) => (
                  <option
                    key={section.value}
                    value={section.value}
                  >
                    {section.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive / Expired
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Section Access Records
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredAccess.length} record
                {filteredAccess.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {filteredAccess.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">🔐</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No section access found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Grant section access to a student to get started.
              </p>

              <button
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Grant Access
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Section
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Granted
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Expires
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredAccess.map((record) => {
                    const active =
                      isCurrentlyActive(record);

                    const expired =
                      isExpired(record);

                    return (
                      <tr
                        key={record.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* USER */}

                        <td className="px-5 py-5">
                          <div className="font-semibold text-gray-900">
                            {getUserName(record)}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {getUserEmail(record)}
                          </div>
                        </td>

                        {/* SECTION */}

                        <td className="px-5 py-5">
                          <div className="font-semibold text-gray-900">
                            {getSectionLabel(
                              record.section
                            )}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {getSectionDescription(
                              record.section
                            )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          {expired ? (
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                              Expired
                            </span>
                          ) : active ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Inactive
                            </span>
                          )}

                        </td>

                        {/* GRANTED */}

                        <td className="px-5 py-5 text-sm text-gray-600">
                          {formatDateTime(
                            record.granted_at
                          )}
                        </td>

                        {/* EXPIRES */}

                        <td className="px-5 py-5 text-sm text-gray-600">
                          {record.expires_at
                            ? formatDate(
                                record.expires_at
                              )
                            : "Permanent"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                toggleAccess(record)
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                active
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {active
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              onClick={() =>
                                openEditModal(record)
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteAccess(record)
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Revoke
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingAccess
                    ? "Edit Section Access"
                    : "Grant Section Access"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  One section unlocks all courses inside that section.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              {/* USER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Student
                </label>

                <select
                  name="user"
                  value={form.user}
                  onChange={handleChange}
                  disabled={Boolean(editingAccess)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="">
                    Select a student
                  </option>

                  {users
                    .filter(
                      (user) =>
                        !user.is_staff &&
                        !user.is_superuser
                    )
                    .map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${
                              user.last_name || ""
                            }`.trim()
                          : user.username ||
                            user.email ||
                            `User #${user.id}`}
                        {" — "}
                        {user.email || user.username}
                      </option>
                    ))}
                </select>

                {editingAccess && (
                  <p className="mt-2 text-xs text-gray-500">
                    The student cannot be changed while editing an existing access record.
                  </p>
                )}
              </div>

              {/* SECTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Section
                </label>

                <select
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >
                  {SECTIONS.map((section) => (
                    <option
                      key={section.value}
                      value={section.value}
                    >
                      {section.label} —{" "}
                      {section.description}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Selecting a section gives the student access to every course in that section.
                </p>
              </div>

              {/* EXPIRY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Expiry Date
                </label>

                <input
                  type="date"
                  name="expires_at"
                  value={form.expires_at}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Leave empty for permanent access.
                </p>
              </div>

              {/* ACTIVE */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Active access
                    </div>

                    <div className="text-xs text-gray-500">
                      Student can access this section immediately.
                    </div>
                  </div>

                </label>

              </div>

              {/* FORM ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingAccess
                    ? "Save Changes"
                    : "Grant Access"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}


