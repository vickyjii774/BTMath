
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { getMasterPrograms, getCourses } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  let programs = [];
  let courses = [];

  try {
    const [programData, courseData] = await Promise.all([
      getMasterPrograms(),
      getCourses({ level: "master" }),
    ]);

    programs = programData || [];
    courses = courseData || [];
  } catch (error) {
    console.error("Failed to load Master data:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Header */}
      <section className="border-b bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span>Postgraduate Mathematics</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight">
            Master Mathematics
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Explore postgraduate mathematics programs, courses, academic
            structures, and learning materials available through BTMath.
          </p>
        </div>
      </section>

      {/* Available Master Courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="mb-6 text-2xl font-bold">
            Available Master Courses
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* No Courses Message */}
      {courses.length === 0 && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No Master Courses Available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Master courses will appear here when they are published.
            </p>
          </div>
        </section>
      )}

      {/* Master Programs */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-bold">
          Master Degree Programs & Structures
        </h2>

        {programs.length > 0 ? (
          <div className="space-y-6">
            {programs.map((program) => {
              const periods =
                program.academic_periods?.length > 0
                  ? program.academic_periods
                  : program.semesters || [];

              return (
                <div
                  key={program.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  {/* Program Header */}
                  <div className="flex flex-col justify-between gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-950">
                        {program.name}
                      </h3>

                      {program.description && (
                        <p className="mt-1 text-xs text-gray-500">
                          {program.description}
                        </p>
                      )}
                    </div>

                    {program.duration_info && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        ⏱ {program.duration_info}
                      </span>
                    )}
                  </div>

                  {/* Academic Periods */}
                  {periods.length > 0 && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {periods.map((period) => (
                        <div
                          key={period.id}
                          className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">
                              {period.name}
                            </h4>

                            <span className="text-[10px] font-bold uppercase text-gray-400">
                              {period.period_type || "Semester"}
                            </span>
                          </div>

                          <div className="mt-4 border-t border-gray-200/60 pt-2">
                            <Link
                              href={`/courses?program=${program.id}`}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Browse Syllabus →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Academic Periods */}
                  {periods.length === 0 && (
                    <p className="mt-5 text-sm text-gray-500">
                      Academic structure information is not available yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h3 className="text-lg font-bold">
              No Master Programs Available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Master programs will appear here when they are added to the
              backend.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}