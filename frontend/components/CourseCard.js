
import Link from "next/link";
import CourseAction from "./CourseAction";

export default function CourseCard({ course }) {
  const slug = course.slug || course.id;
  const isEnrolled = course.is_enrolled;

  const price = Number(course.price || 0);
  const discountPrice = Number(course.discount_price || 0);

  const hasDiscount =
    discountPrice > 0 && discountPrice < price;

  const isFree =
    course.course_type === "free" || price === 0;

  const currentPrice = hasDiscount ? discountPrice : price;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">

      {/* Course Information */}
      <div className="p-6">

        {/* Top */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">

          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-700">
            {course.program_name ||
              course.category_name ||
              "Mathematics"}
          </span>

          {isEnrolled ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-bold text-gray-800">
              ✓ Enrolled
            </span>
          ) : isFree ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-700">
              FREE
            </span>
          ) : null}

        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-bold text-gray-900 transition group-hover:text-gray-700">
          <Link href={`/courses/${slug}`}>
            {course.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-gray-600">
          {course.description ||
            "In-depth mathematical concepts, formulas, solved examples, and practice tests."}
        </p>

        {/* Metadata */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">

          {course.chapters_count !== undefined && (
            <span>
              📖 {course.chapters_count} Chapters
            </span>
          )}

          {course.materials_count !== undefined && (
            <span>
              📁 {course.materials_count} Materials
            </span>
          )}

          {course.instructor && (
            <span className="truncate">
              👨‍🏫 {course.instructor}
            </span>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">

        {/* Price */}
        <div>

          {isEnrolled ? (
            <span className="text-sm font-bold text-gray-800">
              Access Granted
            </span>
          ) : isFree ? (
            <span className="text-base font-extrabold text-gray-900">
              Free Course
            </span>
          ) : (
            <div className="flex items-baseline gap-2">

              <span className="text-lg font-extrabold text-gray-950">
                Rs. {currentPrice.toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  Rs. {price.toLocaleString()}
                </span>
              )}

            </div>
          )}

        </div>

        {/* Action */}
        <CourseAction
          slug={slug}
          isEnrolled={isEnrolled}
          isFree={isFree}
        />

      </div>
    </div>
  );
}
