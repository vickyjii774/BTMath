"use client";

import { useEffect, useState, useTransition } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { getCourses } from "../../lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  async function fetchCourses(search = searchQuery) {
    setLoading(true);
    try {
      const params = {};
      if (selectedLevel !== "all") params.level = selectedLevel;
      if (search) params.search = search;
      const data = await getCourses(params);
      setCourses(data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    startTransition(() => {
      fetchCourses(searchQuery);
    });
  }

  const levels = [
    { id: "all", label: "All Levels" },
    { id: "plus2", label: "+2 (Grade 11 & 12)" },
    { id: "bachelor", label: "Bachelor" },
    { id: "master", label: "Master" },
    { id: "ioe", label: "IOE Mathematics" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Header */}
      <section className="border-b bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-extrabold tracking-tight">Mathematics Courses</h1>
          <p className="mt-2 text-gray-600">
            Explore dedicated math courses designed for board exams, university degrees, and competitive entrance preparation.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Level Tabs */}
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedLevel === lvl.id
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses or topics..."
                className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm focus:border-black focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-gray-700">No courses found matching your criteria.</p>
            <p className="mt-1 text-sm text-gray-500">Try changing the filter or search term.</p>
            <button
              onClick={() => {
                setSelectedLevel("all");
                setSearchQuery("");
                fetchCourses("");
              }}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}