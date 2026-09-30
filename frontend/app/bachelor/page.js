import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBachelorPrograms } from "../../lib/api";

export default async function BachelorPage() {
  const programs = await getBachelorPrograms();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          Bachelor Mathematics
        </h1>

        <p className="mt-4 text-gray-600">
          Mathematics resources for Bachelor programs.
        </p>

        <div className="mt-10 space-y-8">
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
                <h3 className="text-lg font-semibold">
                  Semesters
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {program.semesters.map((semester) => (
                    <div
                      key={semester.id}
                      className="rounded-lg border bg-gray-50 p-4"
                    >
                      <h4 className="font-semibold">
                        {semester.name}
                      </h4>

                      {semester.courses.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {semester.courses.map((course) => (
                            <div
                              key={course.id}
                              className="rounded-md bg-white p-3 shadow-sm"
                            >
                              <p className="font-medium">
                                {course.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Rs. {course.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-400">
                          No courses available
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}