
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPrograms() {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/programs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Failed to load programs. Server returned ${response.status}.`
        );
      }

      setPrograms(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  async function deleteProgram(id) {
    if (!confirm("Delete this program?")) return;

    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/admin/programs/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data?.detail || "Delete failed.");
      return;
    }

    loadPrograms();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-black">
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Programs</h1>
        <p className="mt-2 text-gray-500">Manage academic programs.</p>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
          {loading ? (
            <div className="p-8 text-center">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No programs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Slug</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {programs.map((program) => (
                    <tr key={program.id}>
                      <td className="px-6 py-4">{program.id}</td>
                      <td className="px-6 py-4 font-semibold">
                        {program.name || program.title || "—"}
                      </td>
                      <td className="px-6 py-4">{program.slug || "—"}</td>
                      <td className="px-6 py-4">
                        {program.category || program.category_id || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteProgram(program.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
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
