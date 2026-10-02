import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBachelorPrograms } from "../../lib/api";
import Link from "next/link";

export default async function BachelorPage() {
  const programs = await getBachelorPrograms();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />

      {/* Header */}
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

      <Footer />

    </main>
  );
}