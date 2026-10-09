
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

  // EDIT STATE
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD ITEMS
  // ============================================================

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

      setItems(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      console.error(
        `ADMIN ${resource.toUpperCase()} ERROR:`,
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [resource]);

  // ============================================================
  // DELETE
  // ============================================================

  async function deleteItem(id) {
    if (
      !confirm(
        `Delete this ${resource.slice(0, -1)}? This action cannot be undone.`
      )
    ) {
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
          data?.detail ||
            data?.error ||
            "Delete failed."
        );
      }

      await loadItems();
    } catch (err) {
      alert(err.message);
    }
  }

  // ============================================================
  // OPEN EDIT
  // ============================================================

  function startEditing(item) {
    setEditingItem(item);

    // Copy existing item data into the form.
    // Remove read-only/helper fields.
    const editableData = { ...item };

    delete editableData.id;

    // These are generated/helper relationship display fields.
    delete editableData.program_name;
    delete editableData.subject_name;
    delete editableData.academic_period_name;
    delete editableData.course_name;
    delete editableData.chapter_name;

    setEditForm(editableData);

    // Scroll to edit form.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // EDIT FIELD CHANGE
  // ============================================================

  function handleEditChange(field, value) {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // ============================================================
  // UPDATE ITEM
  // ============================================================

  async function updateItem(event) {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Administrator login required.");
      }

      const response = await fetch(
        `${API_URL}/admin/${resource}/${editingItem.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("UPDATE ERROR:", data);

        let errorMessage =
          data?.detail ||
          data?.error ||
          "Update failed.";

        // Django ValidationError returns:
        // {
        //   detail: "Validation failed.",
        //   errors: {...}
        // }
        if (data?.errors) {
          errorMessage +=
            "\n\n" +
            JSON.stringify(
              data.errors,
              null,
              2
            );
        }

        throw new Error(errorMessage);
      }

      alert(
        `${title.slice(0, -1)} updated successfully.`
      );

      setEditingItem(null);
      setEditForm({});

      await loadItems();
    } catch (err) {
      console.error(
        `UPDATE ${resource.toUpperCase()} ERROR:`,
        err
      );

      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  function cancelEditing() {
    setEditingItem(null);
    setEditForm({});
    setError("");
  }

  // ============================================================
  // FORMAT VALUE
  // ============================================================

  function formatValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
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

  // ============================================================
  // COLUMNS
  // ============================================================

  const columns =
    items.length > 0
      ? Object.keys(items[0]).slice(0, 6)
      : [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Dashboard
        </Link>

        {/* HEADER */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-gray-500">
            {description}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            EDIT FORM
        ====================================================== */}

        {editingItem && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Edit {title.slice(0, -1)}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  ID: {editingItem.id}
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={updateItem}
              className="grid gap-5 md:grid-cols-2"
            >
              {Object.keys(editForm).map((field) => {
                const value = editForm[field];

                // Skip complex objects.
                if (
                  value !== null &&
                  typeof value === "object"
                ) {
                  return null;
                }

                const isBoolean =
                  typeof value === "boolean";

                const isLongText =
                  field.toLowerCase().includes("description") ||
                  field.toLowerCase().includes("content") ||
                  field.toLowerCase().includes("text");

                const label = field
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                  );

                return (
                  <div
                    key={field}
                    className={
                      isLongText
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {label}
                    </label>

                    {isBoolean ? (
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) =>
                            handleEditChange(
                              field,
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />

                        <span className="text-sm text-gray-600">
                          {value
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </label>
                    ) : isLongText ? (
                      <textarea
                        value={
                          value === null ||
                          value === undefined
                            ? ""
                            : value
                        }
                        onChange={(event) =>
                          handleEditChange(
                            field,
                            event.target.value
                          )
                        }
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                    ) : (
                      <input
                        type={
                          typeof value === "number"
                            ? "number"
                            : "text"
                        }
                        value={
                          value === null ||
                          value === undefined
                            ? ""
                            : value
                        }
                        onChange={(event) => {
                          const newValue =
                            typeof value === "number"
                              ? Number(
                                  event.target.value
                                )
                              : event.target.value;

                          handleEditChange(
                            field,
                            newValue
                          );
                        }}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                    )}
                  </div>
                );
              })}

              {/* SAVE */}
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
            TABLE
        ====================================================== */}

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
                            {formatValue(
                              item[column]
                            )}
                          </div>
                        </td>
                      ))}

                      <td className="px-6 py-4">
                        <div className="flex gap-2">

                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(item)
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              deleteItem(item.id)
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
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
