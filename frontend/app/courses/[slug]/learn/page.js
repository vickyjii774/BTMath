"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCourseDetail, toggleMaterialProgress } from "../../../../lib/api";

export default function CourseLearnPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [completedMap, setCompletedMap] = useState({});
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourseDetail(slug);
        setCourse(data);

        // Map completions and pick first unlocked material as active
        const map = {};
        let firstMat = null;
        if (data.chapters) {
          for (const ch of data.chapters) {
            if (ch.materials) {
              for (const m of ch.materials) {
                if (m.is_completed) map[m.id] = true;
                if (!firstMat && !m.is_locked) firstMat = m;
              }
            }
          }
        }
        if (!firstMat && data.materials?.length > 0) {
          firstMat = data.materials[0];
        }
        setActiveMaterial(firstMat);
        setCompletedMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function handleToggleComplete(materialId) {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await toggleMaterialProgress(materialId);
      setCompletedMap((prev) => ({
        ...prev,
        [materialId]: res.is_completed,
      }));
    } catch (err) {
      alert("Please login to track your progress.");
    } finally {
      setToggling(false);
    }
  }

  // Calculate total vs completed materials
  let allMaterials = [];
  if (course?.chapters) {
    for (const ch of course.chapters) {
      if (ch.materials) allMaterials.push(...ch.materials);
    }
  }
  const totalCount = allMaterials.length;
  const completedCount = allMaterials.filter((m) => completedMap[m.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-white" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-bold">Course not found</p>
        <Link href="/courses" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100">
      {/* Top Navbar */}
      <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
        <div className="flex items-center gap-3 truncate">
          <Link
            href={`/courses/${slug}`}
            className="rounded-lg border border-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-800"
          >
            ← Exit Classroom
          </Link>
          <span className="h-4 w-px bg-gray-700 hidden sm:block" />
          <h1 className="text-sm font-bold truncate text-white">{course.title}</h1>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold text-gray-300">{progressPercent}% Completed</span>
            <span className="text-[10px] text-gray-500">{completedCount} of {totalCount} lessons</span>
          </div>
          <div className="h-2 w-24 sm:w-32 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Syllabus Sidebar */}
        <aside className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900 overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Course Syllabus</h2>
          </div>

          <div className="divide-y divide-gray-800/60">
            {course.chapters?.map((chapter, cIdx) => (
              <div key={chapter.id} className="py-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-300">
                  Chapter {cIdx + 1}: {chapter.title}
                </div>

                <div className="space-y-0.5 px-2">
                  {chapter.materials?.map((mat) => {
                    const isActive = activeMaterial?.id === mat.id;
                    const isDone = completedMap[mat.id];
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setActiveMaterial(mat)}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                          isActive
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(mat.id);
                            }}
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-[10px] ${
                              isDone
                                ? "border-emerald-500 bg-emerald-500 text-black font-bold"
                                : "border-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {isDone ? "✓" : ""}
                          </span>
                          <span className="truncate">{mat.title}</span>
                        </div>

                        {mat.is_locked && (
                          <span className="text-[10px] text-amber-400 ml-1">🔒</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content Player */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-950 flex flex-col justify-between">
          <div>
            {activeMaterial ? (
              <div className="mx-auto max-w-4xl space-y-6">
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
                  <div>
                    <span className="rounded bg-blue-950 border border-blue-800 px-2 py-0.5 text-[11px] font-bold text-blue-300 uppercase">
                      {activeMaterial.material_type}
                    </span>
                    <h2 className="mt-2 text-2xl font-extrabold text-white">{activeMaterial.title}</h2>
                    {activeMaterial.description && (
                      <p className="mt-1 text-sm text-gray-400">{activeMaterial.description}</p>
                    )}
                  </div>

                  {/* Mark Completed Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(activeMaterial.id)}
                    disabled={toggling}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                      completedMap[activeMaterial.id]
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <span>{completedMap[activeMaterial.id] ? "✓ Completed" : "Mark as Complete"}</span>
                  </button>
                </div>

                {/* Content Area */}
                {activeMaterial.is_locked ? (
                  <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-8 text-center text-amber-200">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-xl font-bold text-white">This Material is Premium</h3>
                    <p className="mt-2 text-sm text-amber-300 max-w-md mx-auto">
                      Access to this lecture, full handwritten note, and solved question paper is reserved for enrolled students.
                    </p>
                    <Link
                      href={`/purchase/${course.id}`}
                      className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
                    >
                      Purchase Course to Unlock →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Video Embed */}
                    {activeMaterial.material_type === "video" && activeMaterial.video_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-gray-800 shadow-2xl">
                        {activeMaterial.video_url.includes("youtube.com") || activeMaterial.video_url.includes("youtu.be") ? (
                          <iframe
                            src={
                              activeMaterial.video_url.includes("watch?v=")
                                ? activeMaterial.video_url.replace("watch?v=", "embed/").split("&")[0]
                                : activeMaterial.video_url.replace("youtu.be/", "www.youtube.com/embed/")
                            }
                            className="h-full w-full"
                            title={activeMaterial.title}
                            allowFullScreen
                          />
                        ) : (
                          <video src={activeMaterial.video_url} controls className="h-full w-full" />
                        )}
                      </div>
                    )}

                    {/* PDF Document View */}
                    {activeMaterial.file && (
                      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📄</span>
                          <div>
                            <p className="font-bold text-white">Attached Study Material (PDF)</p>
                            <p className="text-xs text-gray-400">Download or read offline in high resolution.</p>
                          </div>
                        </div>

                        <a
                          href={activeMaterial.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 text-center"
                        >
                          Open / Download PDF →
                        </a>
                      </div>
                    )}

                    {/* External Link */}
                    {activeMaterial.resource_url && (
                      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                        <p className="text-xs text-gray-400">External Resource Link:</p>
                        <a
                          href={activeMaterial.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-400 hover:underline break-all"
                        >
                          {activeMaterial.resource_url}
                        </a>
                      </div>
                    )}

                    {/* Rich Content / Markdown */}
                    {activeMaterial.content_text && (
                      <div className="prose prose-invert max-w-none rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-gray-300">
                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {activeMaterial.content_text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500">
                <p>Select a lesson from the syllabus sidebar to start learning.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}