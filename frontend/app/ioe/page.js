
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function IOEPage() {
  const sections = [
    {
      id: "past-questions",
      number: "01",
      name: "Past Questions",
      description:
        "Solve previous IOE entrance questions and understand the patterns, concepts, and difficulty of the exam.",
      label: "Practice & Analyse",
    },
    {
      id: "short-tricks",
      number: "02",
      name: "Short Tricks",
      description:
        "Master faster calculation methods, shortcuts, and time-saving techniques for competitive entrance exams.",
      label: "Learn Faster",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Engineering Entrance Preparation
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              IOE Mathematics
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Build speed, accuracy, and confidence for the IOE entrance
              examination with focused practice, previous questions, and
              proven problem-solving techniques.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses?level=ioe"
                className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Explore IOE Courses
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/ioe/past-questions"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
              >
                Practice Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preparation Sections */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Preparation Resources
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Prepare Smarter
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose a preparation area and start improving your performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/ioe/${section.id}`}
              className="group"
            >
              <article className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-md sm:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-widest text-gray-400">
                      {section.number}
                    </span>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-500 transition duration-300 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white">
                      →
                    </span>
                  </div>

                  <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {section.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {section.name}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
                    {section.description}
                  </p>
                </div>

                <div className="mt-10 border-t border-gray-100 pt-5">
                  <span className="text-sm font-semibold text-gray-700 transition group-hover:text-black">
                    Start Preparing
                    <span className="ml-2 transition group-hover:ml-3">
                      →
                    </span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Course CTA */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                BTMath IOE Preparation
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Everything you need for IOE Mathematics.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Access structured courses, past questions, short tricks,
                notes, and practice materials designed for IOE preparation.
              </p>
            </div>

            <Link
              href="/courses?level=ioe"
              className="inline-flex w-fit items-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Explore IOE Courses
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
