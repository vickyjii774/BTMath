"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCourseDetail } from "../../../lib/api";

export default function CourseDetailPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourseDetail(slug);
        setCourse(data);
      } catch (err) {
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Course Not Found</h1>
          <p className="mt-3 text-gray-600">{error || "The requested course does not exist."}</p>
          <Link href="/courses" className="mt-6 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white">
            ← Browse All Courses
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const isEnrolled = course.is_enrolled;
  const isFree = course.course_type === "free" || Number(course.price) === 0;
  const hasDiscount = Number(course.discount_price) > 0 && Number(course.discount_price) < Number(course.price);
  const finalPrice = hasDiscount ? course.discount_price : course.price;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Left Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-blue-700">
                  {course.program_name || "Mathematics"}
                </span>
                {course.academic_period_name && (
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-700">
                    {course.academic_period_name}
                  </span>
                )}
                {course.subject_name && (
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-indigo-700">
                    Subject: {course.subject_name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-950">
                {course.title}
              </h1>

              <p className="text-base leading-relaxed text-gray-600">
                {course.description || "Comprehensive syllabus, notes, video explanations, past questions, and formula sheets."}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-600">
                <span>👨‍🏫 Instructor: <strong className="text-gray-900">{course.instructor || "BTMath Faculty"}</strong></span>
                <span>📚 Chapters: <strong className="text-gray-900">{course.chapters?.length || 0}</strong></span>
                <span>📁 Materials: <strong className="text-gray-900">{course.materials?.length || 0}</strong></span>
              </div>
            </div>

            {/* Right Pricing Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-lg">
              <div className="text-center">
                {isEnrolled ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-sm font-bold text-emerald-800">✓ You are enrolled in this course</p>
                    <p className="mt-1 text-xs text-emerald-700">Enjoy lifetime access to all notes, videos & tests.</p>
                  </div>
                ) : isFree ? (
                  <div>
                    <span className="text-3xl font-black text-emerald-600">FREE</span>
                    <p className="text-xs text-gray-500 mt-1">Open educational resource</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-black text-gray-950">
                        Rs. {Number(finalPrice).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-base text-gray-400 line-through">
                          Rs. {Number(course.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="mt-1 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        Limited Time Discount
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  {isEnrolled ? (
                    <Link
                      href={`/courses/${slug}/learn`}
                      className="block w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
                    >
                      Continue Learning →
                    </Link>
                  ) : (
                    <Link
                      href={`/purchase/${course.id}`}
                      className="block w-full rounded-xl bg-black py-3.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition"
                    >
                      {isFree ? "Enroll Now (Free)" : "Purchase Course (eSewa / Khalti / Bank)"}
                    </Link>
                  )}
                </div>

                <ul className="mt-6 space-y-2.5 text-left text-xs text-gray-600">
                  <li className="flex items-center gap-2">✓ Full Chapter Notes & Formulas</li>
                  <li className="flex items-center gap-2">✓ Solved Past Board/Entrance Papers</li>
                  <li className="flex items-center gap-2">✓ Chapter-wise Interactive MCQs</li>
                  <li className="flex items-center gap-2">✓ Verified Payment with Slip Upload</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Outline */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl font-bold">Course Curriculum</h2>
        <p className="mt-1 text-sm text-gray-600">
          Everything included in this course. Preview lessons are free to explore.
        </p>

        <div className="mt-8 space-y-6">
          {course.chapters && course.chapters.length > 0 ? (
            course.chapters.map((chapter, idx) => (
              <div key={chapter.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 text-xs font-bold text-gray-700">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {chapter.materials?.length || 0} materials
                  </span>
                </div>

                <div className="divide-y divide-gray-100 p-2">
                  {chapter.materials?.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-base">
                          {mat.material_type === "video" ? "📹" : mat.material_type === "pdf" ? "📄" : "📝"}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{mat.title}</p>
                          {mat.description && <p className="text-xs text-gray-500">{mat.description}</p>}
                        </div>
                      </div>

                      <div>
                        {mat.is_locked ? (
                          <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                            🔒 Premium
                          </span>
                        ) : mat.access_type === "preview" ? (
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                            👀 Free Preview
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                            ✓ Free
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              No chapters published yet.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}