import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getMasterPrograms } from "../../lib/api";

export default async function MasterPage() {
  const programs = await getMasterPrograms();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          Master Mathematics
        </h1>

        <p className="mt-4 text-gray-600">
          Mathematics resources for Master programs.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <div
              key={program.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <h2 className="text-2xl font-bold">
                {program.name}
              </h2>

              {program.description && (
                <p className="mt-2 text-gray-600">
                  {program.description}
                </p>
              )}

              <div className="mt-6">
                {program.semesters?.map((semester) => (
                  <div
                    key={semester.id}
                    className="mb-4 rounded-lg border p-4"
                  >
                    <h3 className="font-semibold">
                      {semester.name}
                    </h3>

                    {semester.courses?.map((course) => (
                      <div
                        key={course.id}
                        className="mt-2 rounded bg-gray-50 p-3"
                      >
                        {course.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}