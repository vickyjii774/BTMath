"use client";
import {useEffect,useState} from "react";
import DashboardShell from "../../../components/DashboardShell";
import {getMyAccessGroups} from "../../../lib/api";
export default function AccessPage(){
 const[groups,setGroups]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{getMyAccessGroups().then(v=>setGroups(Array.isArray(v)?v:v?.access_groups||v?.results||[])).catch(e=>setError(e.message||"Unable to load access groups.")).finally(()=>setLoading(false))},[]);
 return <DashboardShell><div className="space-y-6">
  <header><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Membership</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My course access</h1><p className="mt-2 text-sm text-slate-500">Academic sections and course access linked to your account.</p></header>
  {error&&<p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  {loading?<p className="rounded-xl bg-white p-8 text-sm text-slate-500">Loading access details…</p>:groups.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{groups.map(g=>{const item=g.access_group||g;return <article key={g.id||item.id||item.slug} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">♧</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">Active</span></div><h2 className="mt-4 font-bold text-slate-950">{item.name||"Academic access"}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{item.description||"Access to the courses and learning resources included in this group."}</p><p className="mt-4 text-xs text-slate-400">{g.expires_at?"Expires "+new Date(g.expires_at).toLocaleDateString():"No expiry date shown"}</p></article>})}</div>:<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-slate-900">No active access groups</p><p className="mt-1 text-sm text-slate-500">Approved course purchases will unlock the relevant academic section.</p></div>}
 </div></DashboardShell>;
}