"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  program: "",
  academic_period: "",
  subject: "",
  price: "0",
  discount_price: "0",
  course_type: "paid",
  instructor: "BTMath Faculty",
  is_published: true,
};

export default function AdminCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);

  // ============================================================
  // AUTH
  // ============================================================

  function getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("access_token");
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    router.replace("/admin/login");
  }

  // ============================================================
  // API
  // ============================================================

  async function apiFetch(url, options = {}) {
    const token = getToken();

    if (!token) {
      logout();
      throw new Error("Your admin session has expired.");
    }

    const response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : {
                "Content-Type": "application/json",
              }),

          ...(options.headers || {}),

          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      throw new Error("Your admin session has expired.");
    }

    if (response.status === 403) {
      throw new Error(
        "You do not have administrator permission."
      );
    }

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.error ||
        data?.errors ||
        "Something went wrong.";

      throw new Error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    }

    return data;
  }

  // ============================================================
  // LOAD DATA
  // ============================================================

  async function loadCourses() {
    const data = await apiFetch(
      "/admin/courses/"
    );

    setCourses(
      Array.isArray(data)
        ? data
        : []
    );
  }

  async function loadPrograms() {
    const data = await apiFetch(
      "/admin/programs/"
    );

    setPrograms(
      Array.isArray(data)
        ? data
        : []
    );
  }

  async function loadPeriods() {
    const data = await apiFetch(
      "/admin/academic-periods/"
    );

    setPeriods(
      Array.isArray(data)
        ? data
        : []
    );
  }

  async function loadSubjects() {
    const data = await apiFetch(
      "/admin/subjects/"
    );

    setSubjects(
      Array.isArray(data)
        ? data
        : []
    );
  }

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadCourses(),
        loadPrograms(),
        loadPeriods(),
        loadSubjects(),
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to load course management data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // ============================================================
  // FILTERED OPTIONS
  // ============================================================

  const selectedProgram = useMemo(
    () =>
      programs.find(
        (program) =>
          String(program.id) ===
          String(form.program)
      ),
    [programs, form.program]
  );

  const filteredPeriods = useMemo(() => {
    if (!form.program) {
      return periods;
    }

    return periods.filter(
      (period) =>
        String(period.program) ===
        String(form.program)
    );
  }, [periods, form.program]);

  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (form.program) {
      result = result.filter(
        (subject) =>
          String(subject.program) ===
          String(form.program)
      );
    }

    if (form.academic_period) {
      result = result.filter(
        (subject) =>
          String(
            subject.academic_period
          ) ===
          String(form.academic_period)
      );
    }

    return result;
  }, [
    subjects,
    form.program,
    form.academic_period,
  ]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredCourses = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        String(
          course.title || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          course.slug || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          course.program_name || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          course.subject_name || ""
        )
          .toLowerCase()
          .includes(value)
      );
    });
  }, [courses, search]);

  // ============================================================
  // FORM
  // ============================================================

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (name === "program") {
      setForm((previous) => ({
        ...previous,
        academic_period: "",
        subject: "",
      }));
    }

    if (name === "academic_period") {
      setForm((previous) => ({
        ...previous,
        subject: "",
      }));
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function openCreate() {
    resetForm();

    setError("");
    setSuccess("");

    setShowForm(true);
  }

  function openEdit(course) {
    setEditingId(course.id);

    setForm({
      title: course.title || "",
      slug: course.slug || "",
      description:
        course.description || "",

      program:
        course.program || "",

      academic_period:
        course.academic_period || "",

      subject:
        course.subject || "",

      price:
        course.price ?? "0",

      discount_price:
        course.discount_price ?? "0",

      course_type:
        course.course_type || "paid",

      instructor:
        course.instructor ||
        "BTMath Faculty",

      is_published:
        Boolean(course.is_published),
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // SAVE
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description:
          form.description.trim(),

        program:
          form.program || null,

        academic_period:
          form.academic_period || null,

        subject:
          form.subject || null,

        price:
          form.price === ""
            ? 0
            : Number(form.price),

        discount_price:
          form.discount_price === ""
            ? 0
            : Number(
                form.discount_price
              ),

        course_type:
          form.course_type,

        instructor:
          form.instructor.trim(),

        is_published:
          Boolean(form.is_published),
      };

      let result;

      if (editingId) {
        result = await apiFetch(
          `/admin/courses/${editingId}/`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setSuccess(
          "Course updated successfully."
        );
      } else {
        result = await apiFetch(
          "/admin/courses/",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setSuccess(
          "Course created successfully."
        );
      }

      console.log(
        "COURSE SAVED:",
        result
      );

      resetForm();
      setShowForm(false);

      await loadCourses();

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "Delete this course permanently?\n\nThis action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await apiFetch(
        `/admin/courses/${id}/`,
        {
          method: "DELETE",
        }
      );

      setSuccess(
        "Course deleted successfully."
      );

      await loadCourses();

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to delete course."
      );
    }
  }

  // ============================================================
  // PUBLISH TOGGLE
  // ============================================================

  async function togglePublished(course) {
    setError("");
    setSuccess("");

    try {
      await apiFetch(
        `/admin/courses/${course.id}/`,
        {
          method: "PUT",
          body: JSON.stringify({
            is_published:
              !course.is_published,
          }),
        }
      );

      setSuccess(
        course.is_published
          ? "Course unpublished."
          : "Course published."
      );

      await loadCourses();

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to update course status."
      );
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <button
              onClick={() =>
                router.push("/admin")
              }
              className="text-xl font-bold"
            >
              BTMath
            </button>

            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Administration
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Dashboard
            </button>

            <button
              onClick={logout}
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Courses
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Create, edit, publish and manage
              BTMath courses without touching
              Django or the database.
            </p>

          </div>

          <button
            onClick={() =>
              showForm
                ? setShowForm(false)
                : openCreate()
            }
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {showForm
              ? "Close"
              : "+ Add Course"}
          </button>

        </div>


        {/* ALERTS */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}


        {/* FORM */}
        {showForm && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Course Editor
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {editingId
                    ? "Edit Course"
                    : "Create New Course"}
                </h2>
              </div>

              {editingId && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Editing #{editingId}
                </span>
              )}

            </div>


            <form
              onSubmit={handleSubmit}
              className="mt-7 grid gap-6"
            >

              {/* BASIC INFORMATION */}
              <section>

                <h3 className="text-sm font-bold">
                  Basic Information
                </h3>

                <div className="mt-4 grid gap-5 md:grid-cols-2">

                  <Field
                    label="Course Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Bachelor Mathematics"
                    required
                  />

                  <Field
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="e.g. bachelor-mathematics"
                    required
                  />

                </div>

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe what students will learn..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

              </section>


              {/* ACADEMIC INFORMATION */}
              <section className="border-t border-gray-100 pt-6">

                <h3 className="text-sm font-bold">
                  Academic Information
                </h3>

                <div className="mt-4 grid gap-5 md:grid-cols-3">

                  <Select
                    label="Program"
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    options={programs}
                    placeholder="Select program"
                    getLabel={(item) =>
                      item.name
                    }
                  />

                  <Select
                    label="Academic Period"
                    name="academic_period"
                    value={
                      form.academic_period
                    }
                    onChange={handleChange}
                    options={
                      filteredPeriods
                    }
                    placeholder={
                      form.program
                        ? "Select period"
                        : "Select program first"
                    }
                    getLabel={(item) =>
                      item.name
                    }
                  />

                  <Select
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    options={
                      filteredSubjects
                    }
                    placeholder={
                      form.program
                        ? "Select subject"
                        : "Select program first"
                    }
                    getLabel={(item) =>
                      item.code
                        ? `${item.name} (${item.code})`
                        : item.name
                    }
                  />

                </div>

                {selectedProgram && (
                  <p className="mt-3 text-xs text-gray-400">
                    Program:{" "}
                    {selectedProgram.name}
                  </p>
                )}

              </section>


              {/* PRICING */}
              <section className="border-t border-gray-100 pt-6">

                <h3 className="text-sm font-bold">
                  Pricing & Access
                </h3>

                <div className="mt-4 grid gap-5 md:grid-cols-3">

                  <Field
                    label="Price (Rs.)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />

                  <Field
                    label="Discount Price (Rs.)"
                    name="discount_price"
                    type="number"
                    value={
                      form.discount_price
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />

                  <Select
                    label="Course Type"
                    name="course_type"
                    value={
                      form.course_type
                    }
                    onChange={handleChange}
                    options={[
                      {
                        id: "free",
                        name: "Free",
                      },
                      {
                        id: "paid",
                        name: "Paid",
                      },
                      {
                        id: "subscription",
                        name: "Subscription Only",
                      },
                    ]}
                    placeholder="Select type"
                    getLabel={(item) =>
                      item.name
                    }
                  />

                </div>

              </section>


              {/* INSTRUCTOR */}
              <section className="border-t border-gray-100 pt-6">

                <h3 className="text-sm font-bold">
                  Instructor
                </h3>

                <div className="mt-4 max-w-xl">

                  <Field
                    label="Instructor Name"
                    name="instructor"
                    value={
                      form.instructor
                    }
                    onChange={handleChange}
                    placeholder="BTMath Faculty"
                  />

                </div>

              </section>


              {/* PUBLISH */}
              <section className="border-t border-gray-100 pt-6">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="is_published"
                    checked={
                      form.is_published
                    }
                    onChange={handleChange}
                    className="h-5 w-5 rounded"
                  />

                  <span>
                    <span className="block text-sm font-semibold">
                      Publish this course
                    </span>

                    <span className="block text-xs text-gray-500">
                      Published courses are visible
                      to students.
                    </span>
                  </span>

                </label>

              </section>


              {/* BUTTONS */}
              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Course"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}


        {/* SEARCH */}
        <div className="mt-8">

          <div className="rounded-2xl border border-gray-200 bg-white p-4">

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search courses, programs, subjects..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

          </div>

        </div>


        {/* COURSE LIST */}
        <div className="mt-5">

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">

              <h2 className="text-lg font-semibold">
                No courses found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try another search."
                  : "Create your first course."}
              </p>

            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-6 py-4">

                <h2 className="font-bold">
                  All Courses
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredCourses.length} course
                  {filteredCourses.length !== 1
                    ? "s"
                    : ""}
                </p>

              </div>


              <div className="divide-y divide-gray-100">

                {filteredCourses.map(
                  (course) => (

                    <div
                      key={course.id}
                      className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold">
                            {course.title ||
                              "Untitled Course"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              course.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {course.is_published
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>


                        <p className="mt-1 text-xs text-gray-400">
                          /{course.slug}
                        </p>


                        <div className="mt-3 flex flex-wrap gap-2">

                          {course.program_name && (
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {course.program_name}
                            </span>
                          )}

                          {course.academic_period_name && (
                            <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                              {course.academic_period_name}
                            </span>
                          )}

                          {course.subject_name && (
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {course.subject_name}
                            </span>
                          )}

                        </div>


                        {course.description && (
                          <p className="mt-3 max-w-3xl truncate text-sm text-gray-500">
                            {course.description}
                          </p>
                        )}


                        <div className="mt-3 flex flex-wrap gap-4 text-sm">

                          <span className="font-semibold">
                            Rs.{" "}
                            {Number(
                              course.discount_price ||
                                course.price ||
                                0
                            ).toLocaleString()}
                          </span>

                          {course.discount_price > 0 &&
                            Number(
                              course.discount_price
                            ) <
                              Number(
                                course.price
                              ) && (
                              <span className="text-gray-400 line-through">
                                Rs.{" "}
                                {Number(
                                  course.price
                                ).toLocaleString()}
                              </span>
                            )}

                          <span className="text-gray-500">
                            {course.course_type}
                          </span>

                        </div>

                      </div>


                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            openEdit(course)
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          Edit
                        </button>


                        <button
                          onClick={() =>
                            router.push(
                              `/admin/courses/${course.id}`
                            )
                          }
                          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Manage Content
                        </button>


                        <button
                          onClick={() =>
                            togglePublished(
                              course
                            )
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          {course.is_published
                            ? "Unpublish"
                            : "Publish"}
                        </button>


                        <button
                          onClick={() =>
                            handleDelete(
                              course.id
                            )
                          }
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}


// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  step,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
      />

    </div>
  );
}


// ============================================================
// SELECT
// ============================================================

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  getLabel,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      >

        <option value="">
          {placeholder}
        </option>

        {options.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {getLabel(item)}
          </option>
        ))}

      </select>

    </div>
  );
}

