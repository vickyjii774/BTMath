"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const EMPTY_PROGRAM = { name: "", description: "", duration_info: "" };
const EMPTY_PERIOD = { name: "", period_type: "semester", parent: "", order: 1, description: "" };
const EMPTY_SECTION = { name: "", level: "", description: "" };

async function request(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) throw new Error("Administrator login required.");
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const detail = data?.detail || data?.error || `Request failed (${response.status}).`;
    const validation = data?.errors ? ` ${JSON.stringify(data.errors)}` : "";
    throw new Error(`${detail}${validation}`);
  }
  return data;
}

export default function ProgramsPage() {
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sectionForm, setSectionForm] = useState(null);
  const [programForm, setProgramForm] = useState(null);
  const [periodForm, setPeriodForm] = useState(null);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [sectionData, programData, periodData] = await Promise.all([
        request("/admin/categories/"),
        request("/admin/programs/"),
        request("/admin/academic-periods/"),
      ]);
      const nextCategories = Array.isArray(sectionData) ? sectionData : sectionData?.results || [];
      setCategories(nextCategories);
      setPrograms(Array.isArray(programData) ? programData : programData?.results || []);
      setPeriods(Array.isArray(periodData) ? periodData : periodData?.results || []);
      setSelectedCategoryId((current) => current && nextCategories.some((item) => item.id === current) ? current : nextCategories[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Unable to load academic programs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const selectedCategory = categories.find((item) => Number(item.id) === Number(selectedCategoryId));
  const sectionPrograms = useMemo(
    () => programs.filter((item) => Number(item.category) === Number(selectedCategoryId)),
    [programs, selectedCategoryId]
  );

  function periodsFor(programId, parentId = null) {
    return periods
      .filter((item) => Number(item.program) === Number(programId) && (parentId == null ? item.parent == null : Number(item.parent) === Number(parentId)))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || Number(a.id) - Number(b.id));
  }

  async function saveSection(event) {
    event.preventDefault();
    if (!sectionForm?.name.trim() || !sectionForm?.level.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = { ...sectionForm, name: sectionForm.name.trim(), level: sectionForm.level.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") };
      if (sectionForm.id) await request(`/admin/categories/${sectionForm.id}/`, { method: "PUT", body: JSON.stringify(payload) });
      else await request("/admin/categories/", { method: "POST", body: JSON.stringify(payload) });
      setSectionForm(null); setNotice("Academic section saved."); await loadAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function deleteSection(section) {
    if (!window.confirm(`Delete ${section.name}? Its programs and academic periods may also be deleted.`)) return;
    try { await request(`/admin/categories/${section.id}/`, { method: "DELETE" }); setNotice("Section deleted."); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function saveProgram(event) {
    event.preventDefault();
    if (!programForm?.name.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = { name: programForm.name.trim(), description: programForm.description || "", duration_info: programForm.duration_info || "", category: Number(selectedCategoryId) };
      if (programForm.id) await request(`/admin/programs/${programForm.id}/`, { method: "PUT", body: JSON.stringify(payload) });
      else await request("/admin/programs/", { method: "POST", body: JSON.stringify(payload) });
      setProgramForm(null); setNotice("Program saved."); await loadAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function deleteProgram(program) {
    if (!window.confirm(`Delete ${program.name}? Its periods and related academic content may be affected.`)) return;
    try { await request(`/admin/programs/${program.id}/`, { method: "DELETE" }); setNotice("Program deleted."); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function savePeriod(event) {
    event.preventDefault();
    if (!periodForm?.name.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = {
        program: Number(periodForm.programId),
        parent: periodForm.parent ? Number(periodForm.parent) : null,
        name: periodForm.name.trim(),
        period_type: periodForm.period_type,
        order: Number(periodForm.order) || 1,
        description: periodForm.description || "",
      };
      if (periodForm.id) await request(`/admin/academic-periods/${periodForm.id}/`, { method: "PUT", body: JSON.stringify(payload) });
      else await request("/admin/academic-periods/", { method: "POST", body: JSON.stringify(payload) });
      setPeriodForm(null); setNotice("Academic period saved."); await loadAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function deletePeriod(period) {
    if (!window.confirm(`Delete ${period.name} and its nested periods?`)) return;
    try { await request(`/admin/academic-periods/${period.id}/`, { method: "DELETE" }); setNotice("Academic period deleted."); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  function PeriodTree({ programId, parentId = null, depth = 0 }) {
    const rows = periodsFor(programId, parentId);
    if (!rows.length) return null;
    return <div className={depth ? "ml-5 mt-2 space-y-2 border-l border-slate-200 pl-4" : "mt-3 space-y-2"}>
      {rows.map((period) => (
        <div key={period.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-slate-800">{period.name}</div>
              <div className="mt-1 text-xs capitalize text-slate-500">{period.period_type} · Order {period.order}</div>
              {period.description && <p className="mt-1 text-sm text-slate-500">{period.description}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPeriodForm({ ...period, programId, parent: String(period.parent || "") })} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Edit</button>
              <button type="button" onClick={() => setPeriodForm({ ...EMPTY_PERIOD, programId, parent: String(period.id) })} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Add child</button>
              <button type="button" onClick={() => deletePeriod(period)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
          <PeriodTree programId={programId} parentId={period.id} depth={depth + 1} />
        </div>
      ))}
    </div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Admin dashboard</Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Academic structure</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Academic Programs</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Build your academic sections, programs and flexible grade/year/semester structure in one place.</p>
          </div>
          <button onClick={() => setSectionForm(EMPTY_SECTION)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">+ Add academic section</button>
        </div>

        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

        {loading ? <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-slate-500">Loading academic structure…</div> : (
          <>
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="text-lg font-bold">Academic sections</h2><p className="text-sm text-slate-500">Choose a section to manage its programs.</p></div>
                <span className="text-sm text-slate-500">{categories.length} sections</span>
              </div>
              {categories.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-slate-500">No academic sections yet. Add School Level, +2, Bachelor, Master or IOE to begin.</div> : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {categories.map((section) => {
                    const active = Number(section.id) === Number(selectedCategoryId);
                    const count = programs.filter((p) => Number(p.category) === Number(section.id)).length;
                    return <div key={section.id} className={`rounded-2xl border p-4 text-left transition ${active ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <button onClick={() => { setSelectedCategoryId(section.id); setProgramForm(null); setExpandedProgramId(null); }} className="w-full text-left">
                        <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">{section.level}</span><span className="text-xs text-slate-500">{count} programs</span></div>
                        <div className="mt-3 text-lg font-bold">{section.name}</div>
                        <p className="mt-1 line-clamp-2 min-h-10 text-xs text-slate-500">{section.description || "Manage programs and academic periods."}</p>
                      </button>
                      <div className="mt-3 flex gap-2 border-t border-slate-200/70 pt-3">
                        <button onClick={() => setSectionForm({ ...section })} className="text-xs font-semibold text-slate-600 hover:text-indigo-700">Edit</button>
                        <button onClick={() => deleteSection(section)} className="text-xs font-semibold text-red-600">Delete</button>
                      </div>
                    </div>;
                  })}
                </div>
              )}
            </section>

            {selectedCategory && <section className="mt-10">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{selectedCategory.level}</p><h2 className="mt-1 text-2xl font-bold">{selectedCategory.name} programs</h2><p className="mt-1 text-sm text-slate-500">Each program can have its own number and type of academic periods.</p></div>
                <button onClick={() => setProgramForm(EMPTY_PROGRAM)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Add program</button>
              </div>

              {programForm && <form onSubmit={saveProgram} className="mt-5 grid gap-3 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm md:grid-cols-3">
                <div><label className="mb-1 block text-xs font-semibold text-slate-600">Program name</label><input required value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} placeholder="e.g. BCA, Science, CSIT" className="w-full rounded-lg border px-3 py-2.5 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-600">Duration</label><input value={programForm.duration_info || ""} onChange={(e) => setProgramForm({ ...programForm, duration_info: e.target.value })} placeholder="e.g. 4 years / 8 semesters" className="w-full rounded-lg border px-3 py-2.5 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-600">Description</label><input value={programForm.description || ""} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} placeholder="Optional description" className="w-full rounded-lg border px-3 py-2.5 text-sm" /></div>
                <div className="flex gap-2 md:col-span-3"><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : programForm.id ? "Save changes" : "Create program"}</button><button type="button" onClick={() => setProgramForm(null)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button></div>
              </form>}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {sectionPrograms.map((program) => {
                  const expanded = Number(expandedProgramId) === Number(program.id);
                  const rootCount = periodsFor(program.id).length;
                  return <article key={program.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <button onClick={() => setExpandedProgramId(expanded ? null : program.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                      <div><div className="text-lg font-bold">{program.name}</div><p className="mt-1 text-sm text-slate-500">{program.duration_info || "Flexible duration"} · {rootCount} top-level periods</p></div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{expanded ? "Close" : "Manage"} ↓</span>
                    </button>
                    {expanded && <div className="border-t bg-slate-50/70 p-5">
                      <div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">Academic structure</h3><p className="text-xs text-slate-500">Add Grade 11/12, years, semesters, terms or nested periods.</p></div><div className="flex gap-2"><button onClick={() => setProgramForm({ ...program })} className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold">Edit program</button><button onClick={() => deleteProgram(program)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600">Delete</button></div></div>
                      <PeriodTree programId={program.id} />
                      <button onClick={() => setPeriodForm({ ...EMPTY_PERIOD, programId: program.id })} className="mt-4 rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">+ Add grade / year / semester</button>
                      {rootCount === 0 && <p className="mt-3 text-sm text-slate-500">No academic periods yet. Add Grade 11 and Grade 12, or create semesters for this program.</p>}
                    </div>}
                  </article>;
                })}
                {sectionPrograms.length === 0 && <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-slate-500 lg:col-span-2">No programs in this section yet. Add your first program.</div>}
              </div>
            </section>}
          </>
        )}

        {sectionForm && <Modal title={sectionForm.id ? "Edit academic section" : "Add academic section"} onClose={() => setSectionForm(null)}>
          <form onSubmit={saveSection} className="space-y-4">
            <Field label="Section name"><input required value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} placeholder="e.g. School Level, +2, Bachelor" className="w-full rounded-lg border px-3 py-2.5 text-sm" /></Field>
            <Field label="Unique section key"><input required value={sectionForm.level} onChange={(e) => setSectionForm({ ...sectionForm, level: e.target.value })} placeholder="e.g. school, plus2, bachelor" className="w-full rounded-lg border px-3 py-2.5 text-sm" /><p className="mt-1 text-xs text-slate-500">Use a short key without spaces. Existing public sections keep their keys: plus2, bachelor, master and ioe.</p></Field>
            <Field label="Description"><textarea value={sectionForm.description || ""} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2.5 text-sm" /></Field>
            <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Save section"}</button><button type="button" onClick={() => setSectionForm(null)} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button></div>
          </form>
        </Modal>}

        {periodForm && <Modal title={periodForm.id ? "Edit academic period" : "Add academic period"} onClose={() => setPeriodForm(null)}>
          <form onSubmit={savePeriod} className="space-y-4">
            <Field label="Period name"><input required value={periodForm.name} onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })} placeholder="e.g. Grade 11, Semester 1, Year 1" className="w-full rounded-lg border px-3 py-2.5 text-sm" /></Field>
            <Field label="Period type"><select value={periodForm.period_type} onChange={(e) => setPeriodForm({ ...periodForm, period_type: e.target.value })} className="w-full rounded-lg border px-3 py-2.5 text-sm">{["grade","year","semester","term","custom"].map((v) => <option key={v} value={v}>{v[0].toUpperCase()+v.slice(1)}</option>)}</select></Field>
            <Field label="Parent period (optional)"><select value={periodForm.parent || ""} onChange={(e) => setPeriodForm({ ...periodForm, parent: e.target.value })} className="w-full rounded-lg border px-3 py-2.5 text-sm"><option value="">Top-level period</option>{periods.filter((p) => Number(p.program) === Number(periodForm.programId) && Number(p.id) !== Number(periodForm.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Display order"><input type="number" min="1" value={periodForm.order || 1} onChange={(e) => setPeriodForm({ ...periodForm, order: e.target.value })} className="w-full rounded-lg border px-3 py-2.5 text-sm" /></Field>
            <Field label="Description"><textarea value={periodForm.description || ""} onChange={(e) => setPeriodForm({ ...periodForm, description: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2.5 text-sm" /></Field>
            <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Save period"}</button><button type="button" onClick={() => setPeriodForm(null)} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button></div>
          </form>
        </Modal>}
      </div>
    </main>
  );
}

function Modal({ title, onClose, children }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100">✕</button></div>{children}</div></div>;
}
function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}
