"use client";

import { useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import { changeStudentPassword } from "../../../lib/api";

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
export default function SecurityPage() {
  const [form,setForm]=useState({current:"",next:"",confirm:""});
  const [show,setShow]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const change=e=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  async function submit(e) {
    e.preventDefault();setMessage("");setError("");
    if(form.next.length<8){setError("Use at least 8 characters for your new password.");return;}
    if(form.next!==form.confirm){setError("The new passwords do not match.");return;}
    setSaving(true);
    try {
      const result=await changeStudentPassword(form.current,form.next);
      setMessage(result?.message||"Password changed successfully.");
      setForm({current:"",next:"",confirm:""});
    } catch(err) {setError(err.message||"Unable to change password.");}
    finally {setSaving(false);}
  }
  return <DashboardShell><div className="mx-auto max-w-2xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account settings</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Password & security</h1><p className="mt-2 text-sm text-slate-500">Change your password securely using your current password.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">⌑</span><div><h2 className="font-bold text-slate-950">Change password</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose a strong password you do not use on other websites.</p></div></div>
      <form onSubmit={submit} className="space-y-5">
        {[["current","Current password"],["next","New password"],["confirm","Confirm new password"]].map(([name,label])=><label key={name} className="block text-sm font-semibold text-slate-700">{label}<input required className={inputClass} type={show?"text":"password"} name={name} autoComplete={name==="current"?"current-password":"new-password"} value={form[name]} onChange={change}/></label>)}
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)} className="h-4 w-4 accent-blue-600"/>Show passwords</label>
        <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">For security, your current password is required. Use at least 8 characters for your new password.</div>
        {message&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={saving} className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">{saving?"Updating…":"Update password"}</button>
      </form>
    </div>
  </div></DashboardShell>;
}
