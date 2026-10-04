
"use client";

import { useRouter } from "next/navigation";

export default function CourseAction({ slug, isEnrolled, isFree = false }) {
  const router = useRouter();

  function handleClick() {
    if (isEnrolled) {
      router.push(`/courses/${slug}/learn`);
      return;
    }

    // Free courses can be opened directly.
    if (isFree) {
      router.push(`/courses/${slug}`);
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      // Remember the course so login can return the user here.
      router.push(
        `/login?next=${encodeURIComponent(`/courses/${slug}`)}`
      );
      return;
    }

    // Logged-in user goes directly to the course purchase/details page.
    router.push(`/courses/${slug}`);
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm ${
        isEnrolled
          ? "bg-black text-white hover:bg-gray-800"
          : "bg-black text-white hover:bg-gray-800"
      }`}
    >
      {isEnrolled ? "Study Now →" : isFree ? "View Course →" : "Purchase Course →"}
    </button>
  );
}
