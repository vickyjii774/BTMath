
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/requests/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Failed to load requests. Server returned ${response.status}.`
        );
      }

      setRequests(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(id, status) {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/requests/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || "Update failed.");
      }

      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteRequest(id) {
    if (!confirm("Delete this request?")) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/requests/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || "Delete failed.");
      }

      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">User Requests</h1>
        <p className="mt-2 text-gray-500">
          Review and approve user requests.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {requests.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">{item.id}</td>
                      <td className="px-6 py-4">{item.user || item.user_id || "—"}</td>
                      <td className="px-6 py-4">
                        {item.request_type || "—"}
                      </td>
                      <td className="px-6 py-4">{item.status || "—"}</td>
                      <td className="px-6 py-4">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateRequest(item.id, "approved")
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateRequest(item.id, "rejected")
                            }
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => deleteRequest(item.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Delete
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
      </div>
    </main>
  );
}
