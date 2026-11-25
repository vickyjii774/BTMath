"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import DashboardShell from "../../../components/DashboardShell";
import {getStudentDashboard} from "../../../lib/api";
export default function MyCoursesPage(){
 const[data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{getStudentDashboard().then(setData).catch(e=>setError(e.message||"Unable to load courses."))},[]);
 const courses=Array.isArray(data?.enrolled_courses)?data.enrolled_courses:[];
 return <DashboardShell><div className="space-y-6">
  <header><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Your classroom</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My learning</h1><p className="mt-2 text-sm text-slate-500">Your active course enrolments and learning progress.</p></header>
  {error&&<p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  {!data?<p className="rounded-xl bg-white p-8 text-sm text-slate-500">Loading your courses…</p>:courses.length?<div className="grid gap-4 xl:grid-cols-2">{courses.map(c=>{const progress=Math.max(0,Math.min(100,Number(c.progress_percentage||0)));return <article key={c.course_id||c.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{c.title}</h2><p className="mt-1 text-xs text-slate-500">{c.instructor||"BTMath Faculty"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{progress}%</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:progress+"%"}}/></div><p className="mt-2 text-xs text-slate-500">{c.completed_materials||0} of {c.total_materials||0} lessons completed</p><Link href={"/courses/"+c.slug+"/learn"} className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-700">Continue learning →</Link></article>})}</div>:<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-slate-900">No active courses yet</p><p className="mt-1 text-sm text-slate-500">Once your purchase is approved, your courses will appear here.</p><Link href="/courses" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Browse courses</Link></div>}
 </div></DashboardShell>;
}