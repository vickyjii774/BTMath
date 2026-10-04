import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { getCategories, getCourses, getCounters } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories = [];
  let courses = [];
  let counters = {
    total_students: 0,
    total_courses: 0,
    total_purchases: 0,
    total_questions: 0,
    total_mcqs: 0,
  };

  try {
    const [catData, courseData, counterData] = await Promise.all([
      getCategories(),
      getCourses(),
      getCounters(),
    ]);
    categories = catData || [];
    courses = (courseData || []).slice(0, 3);
    counters = counterData || counters;
  } catch (err) {
    console.error("Error loading home data:", err);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700">
            <span> Complete Mathematics LMS Platform</span>
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
            Mathematics Made <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Simple</span>.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            Designed for +2, Bachelor (BSc, BCA, CSIT), Master, and IOE entrance aspirants. Structured chapters, video lectures, formula sheets, interactive MCQs, and timed mock tests.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-xl bg-black px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Explore Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* REAL DATABASE COUNTERS SECTION */}
      <section className="border-y border-gray-200 bg-gray-400 py-12 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Real Live Learning Metrics (Direct from Database)
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8 text-center">
            {/* Counter 1: Total Students */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur">
              <div className="text-4xl font-extrabold text-blue-400 sm:text-5xl">
                <AnimatedCounter value={counters.total_students} />+
              </div>
              <p className="mt-2 text-sm font-medium text-gray-300">Registered Students</p>
            </div>

            {/* Counter 2: Courses */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur">
              <div className="text-4xl font-extrabold text-indigo-400 sm:text-5xl">
                <AnimatedCounter value={counters.total_courses} />+
              </div>
              <p className="mt-2 text-sm font-medium text-gray-300">Available Courses</p>
            </div>
            {/* Counter 3: Purchases */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur">
              <div className="text-4xl font-extrabold text-green-400 sm:text-5xl">
                <AnimatedCounter value={counters.total_purchases} />+
              </div>
              <p className="mt-2 text-sm font-medium text-gray-300">Total Purchases</p>
            </div>
            
            {/* Counter 4: Courses */}      
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur">
              <div className="text-4xl font-extrabold text-yellow-400 sm:text-5xl">
                <AnimatedCounter value={counters.total_courses} />+
              </div>
              <p className="mt-2 text-sm font-medium text-gray-300">Total Courses</p>
            </div>
          </div>
        </div>
      </section>
            
    

      {/* Study By Level */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choose Your Level
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Select your academic stream to access tailored syllabi, lecture notes, solved past papers, and mock exams.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            let link = "/";
            if (category.level === "plus2") link = "/plus-two";
            else if (category.level === "bachelor") link = "/bachelor";
            else if (category.level === "master") link = "/master";
            else if (category.level === "ioe") link = "/ioe";

            return (
              <Link
                key={category.id}
                href={link}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition duration-200 hover:-translate-y-1 hover:border-black hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 font-bold text-xl text-gray-900 group-hover:bg-black group-hover:text-white transition">
                  {category.name.charAt(0)}
                </div>

                <h3 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {category.description || "Comprehensive syllabus, notes, tricks & past papers."}
                </p>

                <span className="mt-6 inline-flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition">
                  Explore Programs →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="bg-gray-50/70 border-t border-gray-200 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Featured Courses
                </h2>
                <p className="mt-2 text-gray-600">
                  Enrolled by students across Nepal for board exams and entrance preparation.
                </p>
              </div>
              <Link
                href="/courses"
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                View All Courses ({counters.total_courses}) →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why BTMath LMS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold">
            Why Students Excel with BTMath
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            A complete platform built specifically for high-yield mathematical learning.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-2xl">📝</div>
              <h3 className="mt-4 font-bold text-lg">Structured Notes</h3>
              <p className="mt-2 text-sm text-gray-600">
                Formula sheets, theorems, and proofs organized chapter-by-chapter.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-2xl">⚡</div>
              <h3 className="mt-4 font-bold text-lg">Entrance Shortcuts</h3>
              <p className="mt-2 text-sm text-gray-600">
                Speed techniques and shortcuts tested for IOE, CSIT, and board exams.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-2xl">⏱️</div>
              <h3 className="mt-4 font-bold text-lg">Timed Mock Tests</h3>
              <p className="mt-2 text-sm text-gray-600">
                Realistic exam simulations with instant scoring, negative marking, and analysis.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-2xl">📱</div>
              <h3 className="mt-4 font-bold text-lg">Nepal Payment Support</h3>
              <p className="mt-2 text-sm text-gray-600">
                Direct enrollment activation via eSewa, Khalti, or Bank Transfer slips.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}