import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { getIOEPrograms, getCourses, getMockTests } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function IOEPage() {
  let programs = [];
  let courses = [];
  let mockTests = [];

  try {
    const [pData, cData, mData] = await Promise.all([
      getIOEPrograms(),
      getCourses({ level: "ioe" }),
      getMockTests(),
    ]);
    programs = pData || [];
    courses = cData || [];
    mockTests = (mData || []).filter(
      (t) => t.category?.toLowerCase() === "ioe" || t.title?.toLowerCase().includes("ioe")
    );
    // If no specific ioe filter matched mock tests, keep first 2 entrance tests if available
    if (mockTests.length === 0 && mData?.length > 0) {
      mockTests = mData.slice(0, 2);
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Hero Header */}
      <section className="border-b bg-gradient-to-b from-indigo-900 via-gray-900 to-black text-white py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
            <span>⚙️ Tribhuvan University - Institute of Engineering (IOE)</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            IOE Mathematics Entrance & Engineering Math
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
            Target Pulchowk Campus, Thapathali, WRC, and ERC with specialized shortcut techniques, 
            timed negative-marking mock tests, past question solutions, and comprehensive engineering mathematics.
          </p>

          {/* Quick Hub Navigation */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/mock-tests"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
            >
              ⏱️ Timed Mock Tests
            </Link>
            <Link
              href="/mcq"
              className="rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              🎯 Practice MCQs
            </Link>
            <Link
              href="/formula-bank"
              className="rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              📐 Formula Bank
            </Link>
            <Link
              href="/past-questions"
              className="rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              📜 Past Questions
            </Link>
          </div>
        </div>
      </section>

      {/* IOE Entrance Exam Insights Banner */}
      <section className="mx-auto max-w-7xl px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Math Weightage</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">50 Marks</p>
            <p className="text-[11px] text-gray-500 mt-1">Out of 140 total marks</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Question Format</p>
            <p className="text-2xl font-black text-gray-900 mt-1">1 & 2 Marks</p>
            <p className="text-[11px] text-gray-500 mt-1">Single Best Answer MCQs</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Negative Marking</p>
            <p className="text-2xl font-black text-rose-600 mt-1">-10% Penalty</p>
            <p className="text-[11px] text-gray-500 mt-1">Deducted on incorrect choice</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Test Duration</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">2 Hours</p>
            <p className="text-[11px] text-gray-500 mt-1">Computer Based Exam (CBT)</p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Available IOE Courses</h2>
              <p className="text-xs text-gray-500 mt-1">Full entrance courses, video tutorials, and solved sets.</p>
            </div>
            <Link href="/courses" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Courses →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Mock Tests */}
      {mockTests.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-6">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Simulate Real CBT Test</span>
                <h2 className="text-2xl font-bold text-gray-900">IOE Mathematics Mock Tests</h2>
              </div>
              <Link href="/mock-tests" className="text-xs font-bold text-indigo-600 hover:underline">
                View All Tests →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mockTests.map((test) => (
                <div key={test.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase">
                        {test.category || "IOE"}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">⏱️ {test.duration_minutes} Mins</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-gray-950">{test.title}</h3>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{test.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-gray-700">
                      <span>Total Marks: {test.total_marks}</span>
                      <span>Pass: {test.pass_marks}</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/mock-tests/${test.id}`}
                      className="block w-full text-center rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
                    >
                      Start Mock Test Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* IOE Programs & Curriculum Syllabus */}
      <section className="mx-auto max-w-7xl px-6 py-10 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">IOE Programs & Curriculum Structure</h2>
        <div className="space-y-6">
          {programs.map((program) => (
            <div key={program.id} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                  {program.description && <p className="mt-1 text-xs text-gray-500">{program.description}</p>}
                </div>
                <Link
                  href={`/courses?program=${encodeURIComponent(program.name)}`}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:underline"
                >
                  Explore Program Materials →
                </Link>
              </div>

              {/* Academic periods or semesters */}
              {program.academic_periods?.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {program.academic_periods.map((period) => (
                    <div key={period.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900">{period.name}</h4>
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-700">
                          {period.period_type}
                        </span>
                      </div>
                      {period.description && <p className="mt-1 text-[11px] text-gray-500">{period.description}</p>}
                      <div className="mt-3">
                        <Link
                          href={`/courses?level=ioe`}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          View Syllabus →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {programs.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 text-sm">
              No specific IOE program records found. Please check courses and mock tests above.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}