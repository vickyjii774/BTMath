
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

export default function AdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    enrollments: 0,
    pending_requests: 0,
    payments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      const token = localStorage.getItem("access_token");

      // No login token
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      /*
       * Ask Django who is currently logged in.
       */
      const meResponse = await fetch(
        `${API_URL}/auth/me/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      /*
       * Token is invalid/expired.
       */
      if (!meResponse.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("admin_authenticated");

        router.replace("/admin/login");
        return;
      }

      const user = await meResponse.json();

      console.log("ADMIN ME RESPONSE:", user);

      /*
       * Your Django API may return the user directly
       * or inside a "user" property.
       */
      const currentUser = user?.user || user;

      /*
       * IMPORTANT:
       * Only staff or superusers can access /admin.
       */
      const isAdmin =
        currentUser?.is_staff === true ||
        currentUser?.is_superuser === true;

      if (!isAdmin) {
        localStorage.removeItem("admin_authenticated");

        setError(
          "Access denied. You do not have administrator privileges."
        );

        setTimeout(() => {
          router.replace("/admin/login");
        }, 1500);

        return;
      }

      // Save verified administrator
      setAdmin(currentUser);

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );

      localStorage.setItem(
        "admin_authenticated",
        "true"
      );

      /*
       * Now load the admin dashboard statistics.
       */
      await loadDashboard(token);

    } catch (err) {
      console.error(
        "ADMIN AUTHENTICATION ERROR:",
        err
      );

      setError(
        "Unable to verify administrator access."
      );

      setTimeout(() => {
        router.replace("/admin/login");
      }, 1500);

    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(token) {
    try {
      const response = await fetch(
        `${API_URL}/admin/dashboard/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Administrator authentication expired."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to access the admin dashboard."
        );
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load admin dashboard."
        );
      }

      const data = await response.json();

      console.log(
        "ADMIN DASHBOARD DATA:",
        data
      );

      /*
       * Your API currently returns:
       *
       * {
       *   students: 7,
       *   courses: 7,
       *   pending_requests: 0,
       *   enrollments: 3,
       *   payments: 8
       * }
       */
      setStats({
        students: data?.students ?? 0,
        courses: data?.courses ?? 0,
        pending_requests:
          data?.pending_requests ?? 0,
        enrollments: data?.enrollments ?? 0,
        payments: data?.payments ?? 0,
      });

    } catch (err) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin_authenticated");

    setAdmin(null);

    router.replace("/admin/login");
  }

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="text-sm font-medium text-gray-600">
            Verifying administrator access...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Authentication error
   */
  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            {error ||
              "You do not have administrator access."}
          </p>

          <button
            onClick={() =>
              router.replace("/admin/login")
            }
            className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Go to Admin Login
          </button>
        </div>
      </main>
    );
  }

  /*
   * Admin dashboard
   */
  const managementItems = [
    {
      title: "Users",
      description:
        "Manage registered users and permissions.",
      href: "/admin/users",
      icon: "👥",
    },
    {
      title: "User Requests",
      description:
        "Review and approve user requests.",
      href: "/admin/requests",
      icon: "📩",
    },
    {
      title: "Programs",
      description:
        "Manage academic programs.",
      href: "/admin/programs",
      icon: "🎓",
    },
    {
      title: "Courses",
      description:
        "Create and manage courses.",
      href: "/admin/courses",
      icon: "📚",
    },
    {
      title: "Subjects",
      description:
        "Manage subjects and course subjects.",
      href: "/admin/subjects",
      icon: "📖",
    },
    {
      title: "Chapters",
      description:
        "Create and organize chapters.",
      href: "/admin/chapters",
      icon: "🗂️",
    },
    {
      title: "Materials",
      description:
        "Upload notes, videos, PDFs and learning materials.",
      href: "/admin/materials",
      icon: "📄",
    },
    {
      title: "Enrollments",
      description:
        "Manage student course access.",
      href: "/admin/enrollments",
      icon: "✅",
    },
    {
      title: "Payments",
      description:
        "Review payments and transactions.",
      href: "/admin/payments",
      icon: "💳",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <span className="text-2xl font-bold">
              BTMath
            </span>

            <span className="rounded-md bg-black px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              View Website
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <section className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome,{" "}
            {admin?.first_name ||
              admin?.username ||
              "Administrator"}
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Manage users, courses, subjects, materials,
            requests, enrollments, payments and platform
            activity.
          </p>

        </section>

        {/* Statistics */}
        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Users"
            value={stats.students}
            icon="👥"
          />

          <StatCard
            title="Courses"
            value={stats.courses}
            icon="📚"
          />

          <StatCard
            title="Enrollments"
            value={stats.enrollments}
            icon="🎓"
          />

          <StatCard
            title="Pending Requests"
            value={stats.pending_requests}
            icon="📩"
          />

          <StatCard
            title="Payments"
            value={stats.payments}
            icon="💳"
          />

        </section>

        {/* Management */}
        <section>

          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control the main areas of the BTMath platform.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {managementItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    {item.icon}
                  </span>

                  <span className="text-xl text-gray-300 transition group-hover:translate-x-1 group-hover:text-black">
                    →
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.description}
                </p>

                <div className="mt-5 text-sm font-semibold text-black">
                  Manage →
                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* Dashboard API information */}
        <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold">
            Dashboard Data
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Live statistics returned from the Django API.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm text-gray-100">
{JSON.stringify(stats, null, 2)}
          </pre>

        </section>

      </div>
    </main>
  );
}

/*
 * Statistics Card
 */
function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <span className="text-xl">
          {icon}
        </span>

      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}
