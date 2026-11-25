"use client";
import {useEffect,useState} from "react";
import DashboardShell from "../../../components/DashboardShell";
import {getStudentDashboard} from "../../../lib/api";
export default function PaymentsPage(){
 const[data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{getStudentDashboard().then(setData).catch(e=>setError(e.message||"Unable to load payment history."))},[]);
 const payments=Array.isArray(data?.payments)?data.payments:[];
 return <DashboardShell><div className="space-y-6">
  <header><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Billing</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Payment activity</h1><p className="mt-2 text-sm text-slate-500">Review course purchases and payment verification updates.</p></header>
  {error&&<p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{!data?<p className="p-8 text-sm text-slate-500">Loading payments…</p>:payments.length?<div className="divide-y divide-slate-100">{payments.map(p=>{const s=String(p.status||"pending").toLowerCase();const color=["approved","completed"].includes(s)?"bg-emerald-50 text-emerald-700":["rejected","failed"].includes(s)?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700";return <div key={p.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h2 className="font-bold text-slate-900">{p.course_title||p.course_name||"Course access purchase"}</h2><p className="mt-1 text-xs text-slate-500">{p.amount!==undefined?"Rs. "+Number(p.amount).toLocaleString()+" · ":""}{p.payment_method||"Payment"} · {p.created_at?new Date(p.created_at).toLocaleDateString():"Date unavailable"}</p>{p.transaction_code&&<p className="mt-1 break-all text-xs text-slate-400">Reference: {p.transaction_code}</p>}{s==="rejected"&&p.rejection_reason&&<p className="mt-2 text-xs text-red-600">{p.rejection_reason}</p>}</div><span className={"w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize "+color}>{p.status||"Pending"}</span></div>})}</div>:<p className="p-10 text-center text-sm text-slate-500">No payment records found yet.</p>}</div>
 </div></DashboardShell>;
}