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

      {/* Hero */}
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

      {/* Courses */}
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
              <CourseCard
                key={course.id || course._id}
                course={course}
              />
            ))}
          </div>
        </section>
      )}

      {/* Academic Programs */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Academic Programs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Explore the academic structure for Grade 11 and Grade 12.
            </p>
          </div>

          {programs.length > 0 ? (
            <div className="space-y-8">
              {programs.map((program) => {
                const programId = program.id || program._id;
                const programName =
                  program.name || program._name || "Higher Secondary Mathematics (+2)";

                const description =
                  program.description ||
                  program._description ||
                  "Comprehensive Mathematics curriculum for Grades 11 and 12.";

                const duration =
                  program.duration_info ||
                  program._duration_info ||
                  "2 Years (Grade 11 & 12)";

                const periods =
                  program.academic_periods?.length > 0
                    ? program.academic_periods
                    : program._academic_periods?.length > 0
                    ? program._academic_periods
                    : program.semesters?.length > 0
                    ? program.semesters
                    : program._semesters || [];

                return (
                  <div
                    key={programId}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* Program Header */}
                    <div className="border-b border-gray-200 p-6 sm:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight">
                            {programName}
                          </h3>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                            {description}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                          {duration}
                        </span>
                      </div>
                    </div>

                    {/* Academic Structure */}
                    {periods.length > 0 && (
                      <div className="p-6 sm:p-8">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                          Academic Structure
                        </h4>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                          {periods.map((period) => {
                            const periodId = period.id || period._id;

                            const periodName =
                              period.name ||
                              period._name ||
                              "Academic Period";

                            const periodDescription =
                              period.description ||
                              period._description ||
                              "";

                            const periodType =
                              period.period_type ||
                              period._period_type ||
                              "";

                            const subPeriods =
                              period.sub_periods?.length > 0
                                ? period.sub_periods
                                : period._sub_periods || [];

                            return (
                              <div
                                key={periodId}
                                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
                              >
                                {/* Grade Header */}
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                      {periodType || "Grade"}
                                    </p>

                                    <h5 className="mt-1 text-xl font-bold text-gray-900">
                                      {periodName}
                                    </h5>
                                  </div>

                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-sm">
                                    {periodName
                                      .replace(/\D/g, "")
                                      .slice(-2) || "12"}
                                  </div>
                                </div>

                                {/* Description */}
                                {periodDescription && (
                                  <p className="mt-3 text-sm leading-6 text-gray-600">
                                    {periodDescription}
                                  </p>
                                )}

                                {/* Sub Periods */}
                                {subPeriods.length > 0 && (
                                  <div className="mt-5 space-y-2">
                                    {subPeriods.map((subPeriod) => {
                                      const subId =
                                        subPeriod.id || subPeriod._id;

                                      const subName =
                                        subPeriod.name ||
                                        subPeriod._name ||
                                        "";

                                      return (
                                        <div
                                          key={subId}
                                          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                                        >
                                          {subName}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Materials Link */}
                                <div className="mt-6 border-t border-gray-200 pt-5">
                                  <a
                                    href="/courses?level=plus2"
                                    className="inline-flex items-center text-sm font-semibold text-gray-800 transition hover:text-black hover:underline"
                                  >
                                    View learning materials
                                    <span className="ml-1">→</span>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
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