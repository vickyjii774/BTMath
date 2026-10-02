import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getBachelorPrograms } from "../../../lib/api";

export default async function BachelorProgramPage({ params }) {
  const { id } = await params;

  const programs = await getBachelorPrograms();

  const program = programs.find(
    (item) => String(item.id) === String(id)
  );

  // If program doesn't exist
  if (!program) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Program Not Found
          </h1>

          <Link
            href="/bachelor"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white"
          >
            Back to Bachelor
          </Link>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Program Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Bachelor Program
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {program.name}
          </h1>

          {program.description && (
            <p className="mt-4 max-w-2xl text-gray-600">
              {program.description}
            </p>
          )}
        </div>
      </section>

      {/* Semesters */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">
          Choose Your Semester
        </h2>

        <p className="mt-2 text-gray-500">
          Select a semester to view its courses.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {program.semesters.map((semester, index) => (
            <Link
              key={semester.id}
              href={`/bachelor/${program.id}/semester/${semester.id}`}
              className="group"
            >
              <div className="min-h-[190px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg">

                {/* Number + Arrow */}
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    {index + 1}
                  </span>

                  <span className="text-2xl text-gray-400 transition group-hover:translate-x-2 group-hover:text-black">
                    →
                  </span>
                </div>

                {/* Semester Name */}
                <h3 className="mt-8 text-xl font-bold">
                  {semester.name}
                </h3>

                {/* Course Count */}
                <p className="mt-2 text-sm text-gray-500">
                  {semester.courses.length} course
                  {semester.courses.length !== 1 ? "s" : ""}
                </p>

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-black">
                    Explore Semester
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}