import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { getBachelorPrograms, getCourses } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function BachelorPage() {
  let programs = [];
  let courses = [];
  try {
    const [pData, cData] = await Promise.all([
      getBachelorPrograms(),
      getCourses({ level: "bachelor" }),
    ]);
    programs = pData || [];
    courses = cData || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="border-b bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
            <span> University Degree Programs</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Bachelor Mathematics</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Syllabus, notes, video lectures, and solved past questions for BSc CSIT, BCA, BSc General, BIT, and Engineering mathematics.
          </p>
        </div>
      </section>

      {/* Available Bachelor Courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Available Bachelor Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Program Academic Structures */}
      <section className="mx-auto max-w-7xl px-6 py-6 pb-16">
        <h2 className="text-2xl font-bold mb-6">Programs & Academic Structure</h2>

        <div className="space-y-8">
          {programs.map((program) => {
            const periods = program.academic_periods?.length > 0
              ? program.academic_periods
              : program.semesters || [];

            return (
              <div key={program.id} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-950">{program.name}</h3>
                    {program.description && <p className="mt-1 text-xs text-gray-500">{program.description}</p>}
                  </div>
                  {program.duration_info && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      ⏱ {program.duration_info}
                    </span>
                  )}
                </div>

                {/* Periods Grid (Supports flat or nested Year -> Semesters) */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                    Academic Periods / Terms
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {periods.map((period) => (
                      <div key={period.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-gray-900">{period.name}</h5>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {period.period_type || "Semester"}
                          </span>
                        </div>

                        {/* Nested sub-periods if any (e.g. Year 1 has Sem 1 & 2) */}
                        {period.sub_periods?.length > 0 && (
                          <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-2">
                            {period.sub_periods.map((sub) => (
                              <div key={sub.id} className="rounded bg-white p-2 text-xs font-semibold text-gray-700 shadow-2xs">
                                ↳ {sub.name}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 border-t border-gray-200/60 pt-2">
                          <Link
                            href={`/courses?program=${program.id}`}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Browse Courses →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
