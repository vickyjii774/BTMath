import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
<<<<<<< HEAD
import CourseCard from "../../components/CourseCard";
import { getMasterPrograms, getCourses } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  let programs = [];
  let courses = [];
  try {
    const [pData, cData] = await Promise.all([
      getMasterPrograms(),
      getCourses({ level: "master" }),
    ]);
    programs = pData || [];
    courses = cData || [];
  } catch (err) {
    console.error(err);
  }
=======

export default function MasterPage() {
  const programs = [
    {
      id: "mbs",
      name: "MBS",
      description: "Master of Business Studies",
    },
    {
      id: "mba",
      name: "MBA",
      description: "Master of Business Administration",
    },
    {
      id: "mcs",
      name: "MCS",
      description: "Master of Computer Science",
    },
  ];
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

<<<<<<< HEAD
      <section className="border-b bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
            <span> Postgraduate Mathematics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Master Mathematics (MSc & MA)</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Pure and Applied Advanced Mathematics courses: Real & Complex Analysis, Abstract Algebra, Topology, and Differential Geometry.
          </p>
        </div>
      </section>

      {/* Available Master Courses */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Available Master Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Programs and Academic Structures */}
      <section className="mx-auto max-w-7xl px-6 py-6 pb-16">
        <h2 className="text-2xl font-bold mb-6">Master Degree Programs & Structures</h2>

        <div className="space-y-6">
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

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {periods.map((period) => (
                    <div key={period.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900">{period.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
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
              </div>
            );
          })}
=======
      {/* Header */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="text-4xl font-bold">
            Master Programs
          </h1>

          <p className="mt-3 text-gray-500">
            Choose your master program...
          </p>
        </div>
      </section>

      {/* Program Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {programs.map((program, index) => (
            <Link
              key={program.id}
              href={`/master/${program.id}`}
              className="group"
            >
              <div className="min-h-[220px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg">

                {/* Number + Arrow */}
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    {index + 1}
                  </span>

                  <span className="text-2xl text-gray-400 transition duration-300 group-hover:translate-x-2 group-hover:text-black">
                    →
                  </span>
                </div>

                {/* Program Name */}
                <h2 className="mt-10 text-2xl font-bold">
                  {program.name}
                </h2>

                {/* Description */}
                <p className="mt-2 text-gray-500">
                  {program.description}
                </p>

                {/* Bottom */}
                <div className="mt-8 border-t border-gray-200 pt-4">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-black">
                    Explore Program
                  </span>
                </div>

              </div>
            </Link>
          ))}

>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
        </div>
      </section>

      <Footer />
    </main>
  );
}
