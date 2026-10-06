
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
  });

  // =========================================================
  // LOAD COURSES
  // =========================================================

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/courses/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        router.replace("/admin/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "You do not have administrator permission."
        );
        return;
      }

      if (!response.ok) {
  const errorText = await response.text();

  console.error("COURSES API ERROR:", errorText);

  throw new Error(
    `Courses API failed (${response.status}): ${errorText}`
  );
}

      const data = await response.json();

      console.log("ADMIN COURSES:", data);

      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LOAD COURSES ERROR:", err);

      setError(
        err?.message || "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      title: "",
      slug: "",
      description: "",
      price: "",
    });
  }

  // =========================================================
  // CREATE COURSE
  // =========================================================

  async function handleCreateCourse(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/courses/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            description: form.description,
            price: form.price || null,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.error ||
            "Failed to create course."
        );
      }

      resetForm();
      setShowForm(false);

      await loadCourses();
    } catch (err) {
      console.error("CREATE COURSE ERROR:", err);

      setError(
        err?.message || "Failed to create course."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE COURSE
  // =========================================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/courses/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.error ||
            "Failed to delete course."
        );
      }

      await loadCourses();
    } catch (err) {
      console.error("DELETE COURSE ERROR:", err);

      setError(
        err?.message || "Failed to delete course."
      );
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    router.replace("/admin/login");
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <button
              onClick={() => router.push("/admin")}
              className="text-xl font-bold"
            >
              BTMath
            </button>

            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Administration
            </p>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={() => router.push("/admin")}
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Courses
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create and manage BTMath courses.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
              setError("");
            }}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {showForm ? "Close Form" : "+ Create Course"}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CREATE FORM */}

        {showForm && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Create New Course
            </h2>

            <form
              onSubmit={handleCreateCourse}
              className="mt-6 grid gap-5"
            >

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Course Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Bachelor Mathematics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  placeholder="e.g. bachelor-mathematics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Course description..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white disabled:bg-gray-400"
                >
                  {saving
                    ? "Creating..."
                    : "Create Course"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}

        {/* COURSES */}

        <div className="mt-8">

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold">
                No courses found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first course using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="font-bold">
                  All Courses
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {courses.length} course
                  {courses.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="divide-y divide-gray-100">

                {courses.map((course) => (

                  <div
                    key={course.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <h3 className="font-semibold">
                        {course.title ||
                          course.name ||
                          "Untitled Course"}
                      </h3>

                      {course.slug && (
                        <p className="mt-1 text-xs text-gray-400">
                          /{course.slug}
                        </p>
                      )}

                      {course.description && (
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                          {course.description}
                        </p>
                      )}

                      {course.price !== undefined &&
                        course.price !== null && (
                          <p className="mt-2 text-sm font-semibold">
                            Price: {course.price}
                          </p>
                        )}

                    </div>

                    <div className="flex shrink-0 gap-2">

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/courses/${course.id}`
                          )
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                      >
                        Manage
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(course.id)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
