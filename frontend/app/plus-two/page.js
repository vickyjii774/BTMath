
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { getPlusTwoPrograms, getCourses } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function PlusTwoPage() {
  let programs = [];
  let courses = [];

  try {
    const [programData, courseData] = await Promise.all([
      getPlusTwoPrograms(),
      getCourses({ level: "plus2" }),
    ]);

    programs = programData || [];
    courses = courseData || [];
  } catch (error) {
    console.error("Failed to load +2 data:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 text-sm font-medium text-gray-500">
            National Examinations Board (NEB)
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            +2 Mathematics
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Complete mathematics preparation for Grade 11 and Grade 12,
            including notes, video lectures, practice questions, formulas,
            model questions and past examination papers.
          </p>
        </div>
      </section>

      {/* Available Courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight">
              +2 Mathematics Courses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a course to view its complete curriculum and learning
              materials.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Programs */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight">
              Academic Programs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Explore the academic structure for Grade 11 and Grade 12.
            </p>
          </div>

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
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                  >
                    {/* Program Header */}
                    <div className="flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold">
                          {program.name}
                        </h3>

                        {program.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                            {program.description}
                          </p>
                        )}
                      </div>

                      {program.duration_info && (
                        <span className="text-sm text-gray-500">
                          {program.duration_info}
                        </span>
                      )}
                    </div>

                    {/* Academic Periods */}
                    {periods.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Academic Structure
                        </h4>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {periods.map((period) => (
                            <div
                              key={period.id}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-5"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <h5 className="font-semibold text-gray-900">
                                  {period.name}
                                </h5>

                                {period.period_type && (
                                  <span className="text-xs text-gray-500">
                                    {period.period_type}
                                  </span>
                                )}
                              </div>

                              {period.description && (
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                  {period.description}
                                </p>
                              )}

                              {/* Nested periods */}
                              {period.sub_periods?.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  {period.sub_periods.map((subPeriod) => (
                                    <div
                                      key={subPeriod.id}
                                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                    >
                                      {subPeriod.name}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mt-5 border-t border-gray-200 pt-4">
                                <Link
                                  href="/courses?level=plus2"
                                  className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
                                >
                                  View learning materials →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">
                No academic programs are currently available.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
