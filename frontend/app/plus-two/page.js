import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPlusTwoPrograms } from "../../lib/api";

export default async function PlusTwoPage() {
  const programs = await getPlusTwoPrograms();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          +2 Mathematics
        </h1>

        <p className="mt-4 text-gray-600">
          Mathematics resources for Class 11 and Class 12.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
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

              {program.semesters?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">
                    Semesters
                  </h3>

                  <div className="mt-3 space-y-3">
                    {program.semesters.map((semester) => (
                      <div
                        key={semester.id}
                        className="rounded-lg border p-4"
                      >
                        <h4 className="font-semibold">
                          {semester.name}
                        </h4>

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
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}