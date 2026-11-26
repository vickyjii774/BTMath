"use client";

import { useEffect, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import { getCurrentUser, updateStudentProfile } from "../../../lib/api";

const inputClass = "mt-1 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
function Field({label,name,value,onChange,type="text"}) {
  return <label className="block min-w-0 text-sm font-semibold text-slate-700">{label}<input className={inputClass} name={name} type={type} value={value || ""} onChange={onChange}/></label>;
}
export default function StudentProfilePage() {
  const [form,setForm]=useState({full_name:"",email:"",phone:"",education_level:"",address:"",date_of_birth:"",bio:""});
  const [studentId,setStudentId]=useState("");
  const [username,setUsername]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    const token=localStorage.getItem("access_token");
    getCurrentUser(token).then((u)=>{
      if(!alive)return;
      const p=u.profile||{};
      setStudentId(p.student_id||""); setUsername(u.username||"");
      setForm({full_name:p.full_name||[u.first_name,u.last_name].filter(Boolean).join(" "),email:u.email||"",phone:p.phone||"",education_level:p.education_level||"",address:p.address||"",date_of_birth:p.date_of_birth||"",bio:p.bio||""});
    }).catch(e=>{if(alive)setError(e.message||"Could not load your profile.");}).finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  },[]);
  const change=e=>setForm(prev=>({...prev,[e.target.name]:e.target.value}));
  async function submit(e){
    e.preventDefault();setSaving(true);setMessage("");setError("");
    try {
      const updated=await updateStudentProfile(form);
      const p=updated.profile||{};
      const next={full_name:p.full_name||form.full_name,email:updated.email||form.email,phone:p.phone||"",education_level:p.education_level||"",address:p.address||"",date_of_birth:p.date_of_birth||"",bio:p.bio||""};
      setForm(next);localStorage.setItem("user",JSON.stringify(updated));setMessage("Your personal details have been updated successfully.");
    } catch(err) {setError(err.message||"Unable to save your details.");}
    finally {setSaving(false);}
  }
  return <DashboardShell><div className="mx-auto max-w-3xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account settings</p><h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Personal details</h1><p className="mt-2 text-sm text-slate-500">Keep your student contact and education information up to date.</p></div>
    {loading?<div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Loading profile…</div>:<form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-extrabold text-white">{form.full_name.charAt(0).toUpperCase()||"S"}</div><div><h2 className="font-bold text-slate-950">{form.full_name||"Student profile"}</h2><p className="text-xs text-slate-500">{studentId} {username ? "· @"+username : ""}</p></div></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="full_name" value={form.full_name} onChange={change}/>
        <Field label="Email address" name="email" type="email" value={form.email} onChange={change}/>
        <Field label="Phone number" name="phone" value={form.phone} onChange={change}/>
        <Field label="Education level / programme" name="education_level" value={form.education_level} onChange={change}/>
        <Field label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={change}/>
        <Field label="Address" name="address" value={form.address} onChange={change}/>
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">About me<textarea className={inputClass+" min-h-28 resize-y"} name="bio" value={form.bio} onChange={change}/></label>
      </div>
      <div className="mt-6 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">Your Student ID and username are permanent account identifiers and cannot be changed here.</div>
      {message&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>window.location.reload()} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Discard changes</button><button disabled={saving} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving?"Saving…":"Save changes"}</button></div>
    </form>}
  </div></DashboardShell>;
}
