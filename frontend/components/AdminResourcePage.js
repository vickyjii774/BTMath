
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminResourcePage({
  resource,
  title,
  description,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Administrator login required.");
      }

      const response = await fetch(`${API_URL}/admin/${resource}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Failed to load ${resource}. Server returned ${response.status}.`
        );
      }

      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(`ADMIN ${resource.toUpperCase()} ERROR:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [resource]);

  async function deleteItem(id) {
    if (!confirm(`Delete this ${resource.slice(0, -1)}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/admin/${resource}/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.error || "Delete failed."
        );
      }

      loadItems();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value);
  }

  const columns =
    items.length > 0
      ? Object.keys(items[0]).slice(0, 6)
      : [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Dashboard
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">{title}</h1>

          <p className="mt-2 text-gray-500">
            {description}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading {title.toLowerCase()}...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No {title.toLowerCase()} found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-6 py-4 font-semibold"
                      >
                        {column
                          .replaceAll("_", " ")
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                      </th>
                    ))}

                    <th className="px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50"
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-xs px-6 py-4"
                        >
                          <div className="truncate">
                            {formatValue(item[column])}
                          </div>
                        </td>
                      ))}

                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            deleteItem(item.id)
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
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
