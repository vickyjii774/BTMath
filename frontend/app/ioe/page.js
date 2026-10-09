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
        "Access solved IOE Entrance exam questions from 2078, 2079, 2080 and master recurring question patterns.",
      label: "Practice & Analysis",
      href: "/courses?level=ioe",
    },
    {
      id: "short-tricks",
      number: "02",
      name: "Mathematics Short Tricks",
      description:
        "Master high-speed shortcuts for Limits, Derivatives, Integration, and Vectors to solve problems in under 30 seconds.",
      label: "Speed & Accuracy",
      href: "/courses?level=ioe",
    },
    {
      id: "formula-sheets",
      number: "03",
      name: "Formula Sheets & Handbooks",
      description:
        "Download complete printable formula guides covering all 11 & 12 topics tailored for engineering aspirants.",
      label: "Quick Revision",
      href: "/courses?level=ioe",
    },
    {
      id: "model-questions",
      number: "04",
      name: "Model Questions & Practice Sets",
      description:
        "Full-length model tests modeled on recent IOE computer-based test formats with marking schemes.",
      label: "Exam Simulation",
      href: "/courses?level=ioe",
    },
    {
      id: "video-lectures",
      number: "05",
      name: "Video Explanations",
      description:
        "Detailed step-by-step video lessons and recorded problem walkthroughs by experienced mathematics instructors.",
      label: "Conceptual Depth",
      href: "/courses?level=ioe",
    },
    {
      id: "notes-handouts",
      number: "06",
      name: "Hand-Written Notes & PDFs",
      description:
        "High-yield chapter summaries, theory overviews, and carefully chosen practice problem sets with answer keys.",
      label: "Self Study",
      href: "/courses?level=ioe",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800 mb-4">
              IOE Engineering Entrance
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-950">
              IOE Mathematics Entrance Preparation
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Master the highest-scoring section of the IOE Entrance examination. Build rapid speed, absolute accuracy, and conceptual clarity with past questions, short tricks, and curated study sets.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses?level=ioe"
                className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                Enroll in IOE Math Package →
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
              >
                My IOE Study Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preparation Resources Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Preparation Pillars
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Complete Entrance Toolset
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Dedicated modules designed specifically for engineering entrance competitive mathematics.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="group block"
            >
              <article className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-gray-400 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      {section.number}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-400 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
                      →
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                    {section.label}
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
                    {section.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {section.description}
                  </p>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-4">
                  <span className="text-xs font-bold text-black transition group-hover:underline">
                    Access Resource →
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
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                All-in-One Package
              </span>

              <h2 className="mt-2 text-2xl font-bold">
                Everything you need to crack IOE Mathematics.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Enrolling in the IOE Access Group unlocks all past question solutions, short tricks masterclasses, model sets, and discussion groups in one place.
              </p>
            </div>

            <Link
              href="/courses?level=ioe"
              className="inline-flex w-fit items-center rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              Get Full Access Now →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}