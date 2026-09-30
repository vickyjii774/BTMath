
import Link from "next/link";

export default function ProgramCard({ program }) {
  return (
    <Link
      href={`/programs/${program.id}`}
      className="block rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h2 className="text-xl font-bold">
        {program.name}
      </h2>

      <p className="mt-3 text-gray-600">
        {program.description || "Explore mathematics resources."}
      </p>

      <span className="mt-5 inline-block text-sm font-medium">
        View Program →
      </span>
    </Link>
  );
}