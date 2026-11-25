"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import { getStudentDashboard } from "../../lib/api";

function Stat({ label, value, icon, note }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">{icon}</span></div><p className="mt-4 text-3xl font-extrabold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    getStudentDashboard().then((result) => { if (alive) setData(result); })
      .catch((err) => { if (alive) setError(err.message || "Unable to load dashboard."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const courses = Array.isArray(data?.enrolled_courses) ? data.enrolled_courses : [];
  const user = data?.user || {};
  const stats = data?.stats || {};
  const attempts = Array.isArray(data?.mock_attempts) ? data.mock_attempts : [];
  const name = user.first_name || user.profile?.full_name || user.username || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return <DashboardShell>
    {loading ? <div className="rounded-2xl bg-white p-16 text-center text-sm text-slate-500">Loading your learning overview…</div> :
    error ? <div className="rounded-2xl border border-red-200 bg-white p-8 text-sm text-red-700">{error}<p className="mt-3"><Link href="/login?next=/dashboard" className="font-bold text-blue-700">Sign in again</Link></p></div> :
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#102b55] via-[#174b91] to-[#2563eb] p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-semibold text-blue-100">{greeting}, {name} 👋</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome to your learning dashboard.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Your mathematics learning, course progress and account tools — all in one place.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={courses[0]?.slug ? `/courses/${courses[0].slug}/learn` : "/dashboard/courses"} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50">Continue learning →</Link>
          <Link href="/dashboard/profile" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Edit my details</Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="My courses" value={stats.active_courses_count ?? courses.length} icon="▤" note="Courses available to you"/>
        <Stat label="Lessons completed" value={stats.completed_materials_total ?? 0} icon="✓" note="Completed learning materials"/>
        <Stat label="Practice attempts" value={attempts.length} icon="✎" note="Recorded quiz / mock attempts"/>
        <Stat label="Student ID" value={user.student_id || user.profile?.student_id || "—"} icon="◉" note="Your BTMath identity"/>
      </section>
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Your classroom</p><h2 className="mt-1 text-xl font-extrabold text-slate-950">Pick up where you left off</h2></div><Link href="/dashboard/courses" className="text-sm font-bold text-blue-700">View my courses →</Link></div>
        {courses.length ? <div className="grid gap-4 xl:grid-cols-2">{courses.slice(0,4).map((course) => {const progress=Math.max(0,Math.min(100,Number(course.progress_percentage||0)));return <article key={course.course_id||course.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.instructor||"BTMath Faculty"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{progress}%</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:`${progress}%`}}/></div><p className="mt-2 text-xs text-slate-500">{course.completed_materials||0} of {course.total_materials||0} lessons completed</p><Link href={`/courses/${course.slug}/learn`} className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Continue course →</Link></article>})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-bold text-slate-900">Your classroom is ready</p><p className="mt-1 text-sm text-slate-500">You have no active course enrolments yet.</p><Link href="/courses" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Explore courses</Link></div>}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/profile" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account</p><h3 className="mt-2 font-extrabold text-slate-950">Update personal details</h3><p className="mt-1 text-sm text-slate-500">Edit your name, email, phone, education and contact details.</p><span className="mt-4 inline-flex text-sm font-bold text-blue-700">Manage profile →</span></Link>
        <Link href="/dashboard/security" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300"><p className="text-xs font-bold uppercase tracking-widest text-violet-600">Security</p><h3 className="mt-2 font-extrabold text-slate-950">Change your password</h3><p className="mt-1 text-sm text-slate-500">Keep your BTMath account protected with a strong password.</p><span className="mt-4 inline-flex text-sm font-bold text-blue-700">Password settings →</span></Link>
      </section>
    </div>}
  </DashboardShell>;
}
