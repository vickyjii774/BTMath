
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
<<<<<<< HEAD
import CourseCard from "../../components/CourseCard";
import { getBachelorPrograms, getCourses } from "../../lib/api";

export const dynamic = "force-dynamic";
=======
import { getBachelorPrograms } from "../../lib/api";
import Link from "next/link";
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a

export default async function BachelorPage() {
  let programs = [];
  let courses = [];

  try {
    const [programData, courseData] = await Promise.all([
      getBachelorPrograms(),
      getCourses({ level: "bachelor" }),
    ]);

    programs = programData || [];
    courses = courseData || [];
  } catch (error) {
    console.error("Failed to load bachelor data:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />

      {/* Header */}
<<<<<<< HEAD
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 text-sm font-medium text-gray-500">
            University Programs
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bachelor Mathematics
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Mathematics resources for bachelor-level students, including
            courses, notes, lectures, practice questions and past papers.
          </p>
        </div>
      </section>

      {/* Bachelor Programs */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight">
            Bachelor Programs
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select your program to explore its mathematics curriculum.
          </p>
        </div>

        {programs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <Link
                key={program.id}
                href={`/bachelor/${program.id}`}
                className="group"
              >
                <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {index + 1}
                    </span>

                    <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700">
                      →
                    </span>
                  </div>

                  <h3 className="mt-8 text-xl font-semibold text-gray-900">
                    {program.name}
                  </h3>

                  {program.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                      {program.description}
                    </p>
                  )}

                  {program.duration_info && (
                    <p className="mt-4 text-xs font-medium text-gray-500">
                      {program.duration_info}
                    </p>
                  )}

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                      Explore program →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              No bachelor programs are currently available.
            </p>
          </div>
        )}
      </section>

      {/* Available Courses */}
      {courses.length > 0 && (
        <section className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight">
                Bachelor Courses
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Browse available mathematics courses.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

=======
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <h1 className="text-4xl font-bold">
            Bachelor Mathematics
          </h1>

          <p className="mt-3 text-gray-500">
            Choose your bachelor program...
          </p>

        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">

          {programs.slice(0, 5).map((program, index) => (

            <Link
              key={program.id}
              href={`/bachelor/${program.id}`}
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

                {/* Explore */}
                <div className="mt-8 border-t border-gray-200 pt-4">

                  <span className="text-sm font-medium text-gray-500 transition group-hover:text-black">
                    Explore Program
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>

>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
      <Footer />

    </main>
  );
}

