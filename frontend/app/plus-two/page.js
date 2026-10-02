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
    const [pData, cData] = await Promise.all([
      getPlusTwoPrograms(),
      getCourses({ level: "plus2" }),
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
            <span>📚 National Examinations Board (NEB) Curriculum</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">+2 Mathematics (Grade 11 & 12)</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Full comprehensive coverage for NEB Class 11 and Class 12 Science and Management. Detailed notes, solved model questions, and formula sheets.
          </p>
        </div>
      </section>

      {/* Courses for +2 */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Available +2 Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Programs and Academic Structures */}
      <section className="mx-auto max-w-7xl px-6 py-6 pb-16">
        <h2 className="text-2xl font-bold mb-6">Academic Framework</h2>
        <div className="space-y-6">
          {programs.map((program) => (
            <div key={program.id} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
              {program.description && <p className="mt-1 text-xs text-gray-500">{program.description}</p>}

              {/* Flexible Periods */}
              {program.academic_periods?.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {program.academic_periods.map((period) => (
                    <div key={period.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-gray-900">{period.name}</h4>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                          {period.period_type}
                        </span>
                      </div>
                      {period.description && <p className="mt-1 text-xs text-gray-500">{period.description}</p>}
                      <div className="mt-4">
                        <Link
                          href={`/courses?level=plus2`}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          View {period.name} Materials →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}