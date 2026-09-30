import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="block rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h2 className="text-xl font-bold">
        {course.title}
      </h2>

      <p className="mt-3 text-gray-600">
        {course.description}
      </p>

      <span className="mt-5 inline-block text-sm font-medium">
        View Course →
      </span>
    </Link>
  );
}