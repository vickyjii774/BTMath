
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export default function ChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    course: "",
    program: "",
    title: "",
    description: "",
    order: 1,
  };

  const [form, setForm] = useState(emptyForm);

  // ------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------

  function getToken() {
    return localStorage.getItem("access_token");
  }

  // ------------------------------------------------------------
  // API HELPER
  // ------------------------------------------------------------

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error("Administrator login required.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      let message =
        data?.detail ||
        data?.error ||
        data?.message ||
        `Request failed with status ${response.status}.`;

      if (data?.errors) {
        message += ` ${JSON.stringify(data.errors)}`;
      }

      throw new Error(message);
    }

    return data;
  }

  // ------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [chapterData, courseData, programData] =
        await Promise.all([
          apiRequest("/admin/chapters/"),
          apiRequest("/admin/courses/"),
          apiRequest("/admin/programs/"),
        ]);

      setChapters(
        Array.isArray(chapterData)
          ? chapterData
          : chapterData?.results || []
      );

      setCourses(
        Array.isArray(courseData)
          ? courseData
          : courseData?.results || []
      );

      setPrograms(
        Array.isArray(programData)
          ? programData
          : programData?.results || []
      );
    } catch (err) {
      console.error("CHAPTERS LOAD ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ------------------------------------------------------------
  // FORM
  // ------------------------------------------------------------

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(chapter) {
    setEditingId(chapter.id);

    setForm({
      course:
        chapter.course !== null &&
        chapter.course !== undefined
          ? String(chapter.course)
          : "",

      program:
        chapter.program !== null &&
        chapter.program !== undefined
          ? String(chapter.program)
          : "",

      title: chapter.title || "",
      description: chapter.description || "",
      order: chapter.order || 1,
    });

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  // ------------------------------------------------------------
  // CREATE / UPDATE
  // ------------------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Chapter title is required.");
      return;
    }

    if (!form.course && !form.program) {
      setError("Please select either a Course or a Program.");
      return;
    }

    if (!form.course && !form.program) {
   setError("Please select a Course or Program.");
   return;
    }

    if (!form.order || Number(form.order) < 1) {
      setError("Chapter order must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        course: form.course ? Number(form.course) : null,
        program: form.program ? Number(form.program) : null,
        title: form.title.trim(),
        description: form.description.trim(),
        order: Number(form.order),
      };

      if (editingId) {
        await apiRequest(
          `/admin/chapters/${editingId}/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest(
          "/admin/chapters/",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      await loadData();

      closeForm();
    } catch (err) {
      console.error("CHAPTER SAVE ERROR:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  async function deleteChapter(id, title) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(
        `/admin/chapters/${id}/`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (err) {
      console.error("CHAPTER DELETE ERROR:", err);
      setError(err.message);
    }
  }

  // ------------------------------------------------------------
  // DISPLAY HELPERS
  // ------------------------------------------------------------

  function getCourseName(courseId) {
    if (!courseId) return "—";

    const course = courses.find(
      (item) => Number(item.id) === Number(courseId)
    );

    return (
      course?.title ||
      course?.name ||
      `Course #${courseId}`
    );
  }

  function getProgramName(programId) {
    if (!programId) return "—";

    const program = programs.find(
      (item) => Number(item.id) === Number(programId)
    );

    return (
      program?.name ||
      program?.title ||
      `Program #${programId}`
    );
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Dashboard
        </Link>

        {/* HEADER */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Chapters
            </h1>

            <p className="mt-2 text-gray-500">
              Create and organize course chapters.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + Add New Chapter
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">
              Error
            </div>

            <div className="mt-1">
              {error}
            </div>
          </div>
        )}

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Chapter"
                    : "Add New Chapter"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingId
                    ? "Update the chapter information."
                    : "Create a new chapter for a course or program."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-700 hover:text-gray-900"
              >
                ✕ Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* COURSE / PROGRAM */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Course
                  </label>

                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  >
                    <option value="">
                      Select Course
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title ||
                          course.name ||
                          `Course #${course.id}`}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-gray-500">
                    Use this when the chapter belongs to a specific course.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Program
                  </label>

                  <select
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  >
                    <option value="">
                      Select Program
                    </option>

                    {programs.map((program) => (
                      <option
                        key={program.id}
                        value={program.id}
                      >
                        {program.name ||
                          program.title ||
                          `Program #${program.id}`}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-gray-500">
                    Use this for chapters directly attached to a program.
                  </p>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Chapter Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Calculus"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what students will learn in this chapter..."
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* ORDER */}
              <div className="max-w-xs">
                <label className="mb-2 block text-sm font-semibold">
                  Chapter Order
                </label>

                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Example: 1, 2, 3, 4...
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Chapter"
                    : "Create Chapter"}
                </button>

              </div>
            </form>
          </div>
        )}

        {/* TABLE */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading chapters...
            </div>
          ) : chapters.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">
                📚
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No chapters found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first chapter using the button above.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + Add First Chapter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      ID
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Course
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Program
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Title
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Description
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Order
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {chapters.map((chapter) => (
                    <tr
                      key={chapter.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium">
                        {chapter.id}
                      </td>

                      <td className="px-6 py-4">
                        {getCourseName(chapter.course)}
                      </td>

                      <td className="px-6 py-4">
                        {getProgramName(chapter.program)}
                      </td>

                      <td className="max-w-xs px-6 py-4">
                        <div className="font-semibold">
                          {chapter.title}
                        </div>
                      </td>

                      <td className="max-w-sm px-6 py-4">
                        <div className="truncate text-gray-600">
                          {chapter.description || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {chapter.order}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(chapter)
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteChapter(
                                chapter.id,
                                chapter.title
                              )
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
