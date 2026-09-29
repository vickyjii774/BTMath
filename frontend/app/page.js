import Link from "next/link";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCategories } from "../lib/api";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <h1 className="text-5xl font-bold tracking-tight">
            Mathematics Made Simple
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Notes, questions, solutions and short tricks
            for mathematics students.
          </p>

          <Link
            href="/plus-two"
            className="mt-8 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
          >
            Explore Mathematics
          </Link>

        </div>
      </section>

      {/* Study By Level */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <h2 className="text-center text-3xl font-bold">
          Study By Level
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Choose your education level and start learning mathematics.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((category) => {

            let link = "/";

            if (category.level === "plus2") {
              link = "/plus-two";
            } else if (category.level === "bachelor") {
              link = "/bachelor";
            } else if (category.level === "master") {
              link = "/master";
            } else if (category.level === "ioe") {
              link = "/ioe";
            }

            return (
              <Link
                key={category.id}
                href={link}
                className="rounded-xl border p-8 text-center transition hover:-translate-y-1 hover:shadow-lg"
              >

                <h3 className="text-2xl font-bold">
                  {category.name}
                </h3>

                <p className="mt-3 text-gray-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-block text-sm font-medium">
                  Explore →
                </span>

              </Link>
            );
          })}

        </div>
      </section>

      {/* Why BTMath */}
      <section className="bg-gray-50 px-6 py-16">

        <div className="mx-auto max-w-5xl">

          <h2 className="text-center text-3xl font-bold">
            Why BTMath?
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <h3 className="font-bold">
                Simple Notes
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Easy-to-understand mathematics notes.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <h3 className="font-bold">
                Chapter-wise
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Study topics chapter by chapter.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <h3 className="font-bold">
                Past Questions
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Practice previous examination questions.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <h3 className="font-bold">
                Short Tricks
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Learn useful mathematical shortcuts.
              </p>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}