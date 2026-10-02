import Link from "next/link";

export default function CourseCard({ course }) {
  const slug = course.slug || course.id;
  const isEnrolled = course.is_enrolled;
  const hasDiscount = Number(course.discount_price) > 0 && Number(course.discount_price) < Number(course.price);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
      <div className="p-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-blue-700">
            {course.program_name || course.category_name || "Mathematics"}
          </span>
          {isEnrolled ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
              ✓ Enrolled
            </span>
          ) : course.course_type === "free" || Number(course.price) === 0 ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700">
              FREE
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
          <Link href={`/courses/${slug}`}>
            {course.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 text-sm text-gray-600">
          {course.description || "In-depth mathematical concepts, formulas, solved examples, and practice tests."}
        </p>

        {/* Metadata */}
        <div className="mt-5 flex items-center gap-4 text-xs font-medium text-gray-500">
          {course.chapters_count !== undefined && (
            <span>📖 {course.chapters_count} Chapters</span>
          )}
          {course.materials_count !== undefined && (
            <span>📁 {course.materials_count} Materials</span>
          )}
          {course.instructor && (
            <span className="truncate">👨‍🏫 {course.instructor}</span>
          )}
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="border-t border-gray-100 bg-gray-50/75 px-6 py-4 flex items-center justify-between">
        <div>
          {isEnrolled ? (
            <span className="text-sm font-bold text-emerald-700">Access Granted</span>
          ) : course.course_type === "free" || Number(course.price) === 0 ? (
            <span className="text-base font-extrabold text-gray-900">Free Course</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-gray-950">
                Rs. {Number(hasDiscount ? course.discount_price : course.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  Rs. {Number(course.price).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/courses/${slug}`}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm ${
            isEnrolled
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isEnrolled ? "Study Now →" : "View Details →"}
        </Link>
      </div>
    </div>
  );
}