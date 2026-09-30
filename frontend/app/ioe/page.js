import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getIOEPrograms } from "../../lib/api";

export default async function IOEPage() {
  const programs = await getIOEPrograms();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          IOE Mathematics
        </h1>

        <p className="mt-4 text-gray-600">
          Past questions and short tricks for IOE mathematics preparation.
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

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {program.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="rounded-xl border p-6"
                  >
                    <h3 className="text-xl font-bold">
                      {chapter.title}
                    </h3>

                    {chapter.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {chapter.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-3">
                      {chapter.materials.length > 0 ? (
                        chapter.materials.map((material) => (
                          <div
                            key={material.id}
                            className="rounded-lg bg-gray-50 p-4"
                          >
                            <h4 className="font-semibold">
                              {material.title}
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                              {material.material_type}
                            </p>

                            {material.description && (
                              <p className="mt-2 text-sm text-gray-600">
                                {material.description}
                              </p>
                            )}

                            {material.file && (
                              <a
                                href={`http://127.0.0.1:8000${material.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block font-medium underline"
                              >
                                Open PDF →
                              </a>
                            )}

                            {material.video_url && (
                              <a
                                href={material.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 ml-4 inline-block font-medium underline"
                              >
                                Watch Video →
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">
                          No materials available yet.
                        </p>
                      )}
                    </div>
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