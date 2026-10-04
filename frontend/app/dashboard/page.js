"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getStudentDashboard } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getStudentDashboard();
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load dashboard. Please login.");
        router.push("/login?next=/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <Link href="/login" className="mt-4 inline-block rounded-lg bg-black px-6 py-2 text-sm text-white font-bold">
            Go to Login
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const { user, enrolled_courses, mock_attempts, payments, stats } = data;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Welcome Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white shadow">
                {(user.first_name || user.username || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
                  Welcome back, {user.first_name || user.username}!
                </h1>
                <p className="text-sm text-gray-500">
                  {user.email} • Student ID #{user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/courses"
                className="rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-gray-800 transition"
              >
                 Browse More Courses
              </Link>
              
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 text-center">
            <div>
              <p className="text-2xl font-black text-gray-950">{stats.active_courses_count}</p>
              <p className="text-xs text-gray-500 font-medium">Enrolled Courses</p>
            </div>
            <div>
              <p className="text-2xl font-black text-indigo-600">{stats.completed_materials_total}</p>
              <p className="text-xs text-gray-500 font-medium">Completed Lessons</p>
            </div>
          
          </div>
        </div>

        {/* My Enrolled Courses */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-950">My Enrolled Courses</h2>
            <span className="text-xs text-gray-500">{enrolled_courses.length} active</span>
          </div>

          {enrolled_courses.length > 0 ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled_courses.map((c) => (
                <div key={c.course_id} className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Instructor: {c.instructor || "BTMath Faculty"}</p>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
                        <span>Course Progress</span>
                        <span>{c.progress_percentage}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${c.progress_percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {c.completed_materials} of {c.total_materials} lessons completed
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${c.slug}/learn`}
                    className="mt-6 block rounded-xl bg-black py-2.5 text-center text-xs font-bold text-white hover:bg-gray-800 transition"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-gray-700">You are not enrolled in any courses yet.</p>
              <p className="text-xs text-gray-500 mt-1">Explore our catalog and start learning mathematics today.</p>
              <Link
                href="/courses"
                className="mt-4 inline-block rounded-xl bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>
        
{/* Payment / Purchase Requests */}
<div className="mt-10">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-gray-950">
        My Purchase Requests
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Track your course payment and enrollment requests.
      </p>
    </div>

    <Link
      href="/courses"
      className="text-xs font-semibold text-gray-600 hover:text-black"
    >
      Browse Courses →
    </Link>
  </div>

  {payments?.length > 0 ? (
    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {payments.map((payment) => {
          const status = String(payment.status || "").toLowerCase();

          const statusStyle =
            status === "approved" || status === "completed"
              ? "bg-green-50 text-green-700 border-green-200"
              : status === "rejected" || status === "failed"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200";

          return (
            <div
              key={payment.id}
              className="p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Course Information */}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900">
                    {payment.course_title ||
                      payment.course_name ||
                      "Course Purchase"}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {payment.amount !== undefined && (
                      <span>
                        Amount:{" "}
                        <strong className="text-gray-700">
                          Rs. {Number(payment.amount).toLocaleString()}
                        </strong>
                      </span>
                    )}

                    {payment.payment_method && (
                      <span>
                        Method: {payment.payment_method}
                      </span>
                    )}

                    {payment.created_at && (
                      <span>
                        Submitted:{" "}
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle}`}
                  >
                    {payment.status || "Pending"}
                  </span>
                </div>
              </div>

              {/* Pending Message */}
              {status === "pending" && (
                <div className="mt-4 rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3">
                  <p className="text-xs font-semibold text-yellow-800">
                    Payment verification pending
                  </p>

                  <p className="mt-1 text-xs text-yellow-700">
                    Your payment has been submitted successfully. Our team
                    will verify your payment and activate your course after
                    approval.
                  </p>
                </div>
              )}

              {/* Approved Message */}
              {(status === "approved" || status === "completed") && (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-xs font-semibold text-green-800">
                    ✓ Payment approved
                  </p>

                  <p className="mt-1 text-xs text-green-700">
                    Your course access has been activated.
                  </p>
                </div>
              )}

              {/* Rejected Message */}
              {(status === "rejected" || status === "failed") && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-800">
                    Payment request rejected
                  </p>

                  <p className="mt-1 text-xs text-red-700">
                    Please check your payment details and submit a new request
                    if necessary.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="text-2xl">📋</div>

      <p className="mt-3 text-sm font-semibold text-gray-700">
        No purchase requests yet
      </p>

      <p className="mt-1 text-xs text-gray-500">
        When you purchase a course, your payment request will appear here.
      </p>

      <Link
        href="/courses"
        className="mt-4 inline-block rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800"
      >
        Explore Courses
      </Link>
    </div>
  )}
</div>



       
      </section>

      <Footer />
    </main>
  );
}