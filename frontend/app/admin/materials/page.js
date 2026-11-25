"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const EMPTY_CHAPTER = { title: "", description: "", order: 1 };
const EMPTY_MATERIAL = {
  title: "", material_type: "pdf", access_type: "premium", description: "",
  video_url: "", resource_url: "", content_text: "", order: 1, is_published: true,
};

async function api(path, options = {}) {
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
    throw new Error(detail + (data?.errors ? ` ${JSON.stringify(data.errors)}` : ""));
  }
  return data;
}

function flattenPeriods(rows, depth = 0) {
  return (rows || []).flatMap((item) => [
    { ...item, depth },
    ...flattenPeriods(item.sub_periods, depth + 1),
  ]);
}

export default function MaterialsPage() {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [programId, setProgramId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [chapterForm, setChapterForm] = useState(null);
  const [materialForm, setMaterialForm] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [sectionData, programData, periodData, courseData, chapterData, materialData] = await Promise.all([
        api("/admin/categories/"), api("/admin/programs/"), api("/admin/academic-periods/"),
        api("/admin/courses/"), api("/admin/chapters/"), api("/admin/materials/"),
      ]);
      setSections(Array.isArray(sectionData) ? sectionData : sectionData?.results || []);
      setPrograms(Array.isArray(programData) ? programData : programData?.results || []);
      setPeriods(Array.isArray(periodData) ? periodData : periodData?.results || []);
      setCourses(Array.isArray(courseData) ? courseData : courseData?.results || []);
      setChapters(Array.isArray(chapterData) ? chapterData : chapterData?.results || []);
      setMaterials(Array.isArray(materialData) ? materialData : materialData?.results || []);
    } catch (err) { setError(err.message || "Unable to load learning content."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  const visiblePrograms = useMemo(() => programs.filter((p) => String(p.category) === String(sectionId)), [programs, sectionId]);
  const visiblePeriods = useMemo(() => periods.filter((p) => String(p.program) === String(programId)), [periods, programId]);
  const selectedPeriod = visiblePeriods.find((p) => String(p.id) === String(periodId));
  const visibleCourses = useMemo(() => courses.filter((course) =>
    String(course.program) === String(programId) &&
    (!periodId || String(course.academic_period || "") === String(periodId))
  ), [courses, programId, periodId]);
  const selectedCourse = courses.find((c) => String(c.id) === String(courseId));
  const visibleChapters = useMemo(() => chapters.filter((c) => String(c.course) === String(courseId)), [chapters, courseId]);
  const selectedChapter = visibleChapters.find((c) => String(c.id) === String(chapterId));
  const visibleMaterials = useMemo(() => materials.filter((m) =>
    String(m.course) === String(courseId) &&
    (chapterId ? String(m.chapter) === String(chapterId) : !m.chapter)
  ), [materials, courseId, chapterId]);

  function onSectionChange(value) { setSectionId(value); setProgramId(""); setPeriodId(""); setCourseId(""); setChapterId(""); }
  function onProgramChange(value) { setProgramId(value); setPeriodId(""); setCourseId(""); setChapterId(""); }
  function onPeriodChange(value) { setPeriodId(value); setCourseId(""); setChapterId(""); }
  function onCourseChange(value) { setCourseId(value); setChapterId(""); }

  async function saveChapter(event) {
    event.preventDefault();
    if (!courseId || !chapterForm?.title.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = { course: Number(courseId), program: Number(programId), title: chapterForm.title.trim(), description: chapterForm.description || "", order: Number(chapterForm.order) || 1 };
      if (chapterForm.id) await api(`/admin/chapters/${chapterForm.id}/`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/admin/chapters/", { method: "POST", body: JSON.stringify(payload) });
      setChapterForm(null); setNotice("Chapter saved."); await loadAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function deleteChapter(chapter) {
    if (!window.confirm(`Delete chapter “${chapter.title}”? Its chapter materials and lessons may also be deleted.`)) return;
    try { await api(`/admin/chapters/${chapter.id}/`, { method: "DELETE" }); setChapterId(""); setNotice("Chapter deleted."); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function saveMaterial(event) {
    event.preventDefault();
    if (!courseId || !materialForm?.title.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const body = new FormData();
      body.append("course", String(courseId));
      body.append("chapter", chapterId ? String(chapterId) : "");
      body.append("title", materialForm.title.trim());
      body.append("material_type", materialForm.material_type);
      body.append("access_type", materialForm.access_type);
      body.append("description", materialForm.description || "");
      body.append("video_url", materialForm.video_url || "");
      body.append("resource_url", materialForm.resource_url || "");
      body.append("content_text", materialForm.content_text || "");
      body.append("order", String(Number(materialForm.order) || 1));
      body.append("is_published", String(Boolean(materialForm.is_published)));
      if (selectedFile) body.append("file", selectedFile);
      const path = materialForm.id ? `/admin/materials/${materialForm.id}/` : "/admin/materials/";
      await api(path, { method: materialForm.id ? "PUT" : "POST", body });
      setMaterialForm(null); setSelectedFile(null); setNotice("Learning material saved."); await loadAll();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function deleteMaterial(item) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try { await api(`/admin/materials/${item.id}/`, { method: "DELETE" }); setNotice("Material deleted."); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  function openMaterial(item = null) {
    setSelectedFile(null);
    setMaterialForm(item ? {
      ...item,
      title: item.title || "", material_type: item.material_type || "pdf",
      access_type: item.access_type || "premium", description: item.description || "",
      video_url: item.video_url || "", resource_url: item.resource_url || "",
      content_text: item.content_text || "", order: item.order || 1,
      is_published: item.is_published !== false,
    } : { ...EMPTY_MATERIAL });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Admin dashboard</Link>
        <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Learning library</p><h1 className="mt-2 text-3xl font-bold">Chapter Materials & Notes</h1><p className="mt-2 text-sm text-slate-500">Choose an academic program and course, then manage semester-level resources and chapter-wise content.</p></div>
          <button onClick={loadAll} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">↻ Refresh</button>
        </div>

        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

        {loading ? <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-slate-500">Loading learning library…</div> : <>
          <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4"><h2 className="font-bold">1. Select academic location</h2><p className="text-xs text-slate-500">The choices come from Academic Programs and Course Management.</p></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Select label="Academic section" value={sectionId} onChange={onSectionChange} placeholder="Choose section" options={sections.map((s) => [s.id, s.name])} />
              <Select label="Program" value={programId} onChange={onProgramChange} placeholder="Choose program" disabled={!sectionId} options={visiblePrograms.map((p) => [p.id, p.name])} />
              <Select label="Grade / year / semester" value={periodId} onChange={onPeriodChange} placeholder="Choose academic period" disabled={!programId} options={visiblePeriods.map((p) => [p.id, p.name])} />
              <Select label="Course" value={courseId} onChange={onCourseChange} placeholder="Choose course" disabled={!programId} options={visibleCourses.map((c) => [c.id, c.title])} />
            </div>
            {programId && periodId && visibleCourses.length === 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No course is linked to this academic period yet. Open Course Management and assign a course to this program and period first.</p>}
          </section>

          {selectedCourse && <>
            <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{selectedPeriod?.name || "Course resources"}</p><h2 className="mt-1 text-xl font-bold">{selectedCourse.title}</h2><p className="mt-1 text-sm text-slate-500">Manage chapters and resources for this course.</p></div>
                <button onClick={() => setChapterForm({ ...EMPTY_CHAPTER })} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Add chapter</button>
              </div>
              {chapterForm && <form onSubmit={saveChapter} className="mt-5 grid gap-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 md:grid-cols-3">
                <Field label="Chapter name"><input required value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="e.g. Chapter 1 — Sets" className="control" /></Field>
                <Field label="Description"><input value={chapterForm.description || ""} onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })} placeholder="Optional" className="control" /></Field>
                <Field label="Order"><input type="number" min="1" value={chapterForm.order || 1} onChange={(e) => setChapterForm({ ...chapterForm, order: e.target.value })} className="control" /></Field>
                <div className="flex gap-2 md:col-span-3"><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">{saving ? "Saving…" : chapterForm.id ? "Save chapter" : "Create chapter"}</button><button type="button" onClick={() => setChapterForm(null)} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Cancel</button></div>
              </form>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button onClick={() => setChapterId("")} className={`rounded-xl border p-4 text-left ${!chapterId ? "border-indigo-500 bg-indigo-50" : "hover:border-slate-300"}`}><div className="text-sm font-bold">Semester / course-level resources</div><p className="mt-1 text-xs text-slate-500">General PDFs, notes and videos not assigned to a chapter.</p></button>
                {visibleChapters.map((chapter) => <div key={chapter.id} className={`rounded-xl border p-4 ${String(chapter.id) === String(chapterId) ? "border-indigo-500 bg-indigo-50" : "bg-white"}`}>
                  <button onClick={() => setChapterId(String(chapter.id))} className="w-full text-left"><div className="text-sm font-bold">{chapter.order}. {chapter.title}</div><p className="mt-1 text-xs text-slate-500">{chapter.description || "Chapter materials and notes"}</p></button>
                  <div className="mt-3 flex gap-3 border-t pt-3"><button onClick={() => setChapterForm({ ...chapter })} className="text-xs font-semibold text-slate-600">Edit</button><button onClick={() => deleteChapter(chapter)} className="text-xs font-semibold text-red-600">Delete</button></div>
                </div>)}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Content library</p><h2 className="mt-1 text-xl font-bold">{selectedChapter ? selectedChapter.title : "Semester / course-level resources"}</h2><p className="mt-1 text-sm text-slate-500">Add and manage PDFs, notes, video URLs, study materials and past questions.</p></div>
                <button onClick={() => openMaterial()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">+ Add material</button>
              </div>

              {materialForm && <form onSubmit={saveMaterial} className="mt-5 space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4">
                <div className="flex items-center justify-between"><h3 className="font-bold">{materialForm.id ? "Edit material" : "New material"}</h3><button type="button" onClick={() => { setMaterialForm(null); setSelectedFile(null); }} className="text-sm text-slate-500">✕ Close</button></div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Title"><input required value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} className="control" placeholder="e.g. Chapter 1 Notes PDF" /></Field>
                  <Field label="Material type"><select value={materialForm.material_type} onChange={(e) => setMaterialForm({ ...materialForm, material_type: e.target.value })} className="control">{[["pdf","PDF"],["docx","DOCX"],["video","Video lecture"],["note","Notes"],["past_question","Past questions"],["formula_sheet","Formula sheet"],["practice_set","Practice set"],["model_question","Model question"],["trick","Short trick"],["question","Question paper"],["other","Other"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                  <Field label="Access"><select value={materialForm.access_type} onChange={(e) => setMaterialForm({ ...materialForm, access_type: e.target.value })} className="control"><option value="free">Free</option><option value="preview">Preview / sample</option><option value="premium">Premium (enrolled students)</option></select></Field>
                  <Field label="Display order"><input type="number" min="1" value={materialForm.order || 1} onChange={(e) => setMaterialForm({ ...materialForm, order: e.target.value })} className="control" /></Field>
                  <Field label="Upload file (PDF, DOCX, etc.)"><input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="control" />{materialForm.file && <a className="mt-1 block text-xs text-indigo-600 underline" href={materialForm.file} target="_blank" rel="noreferrer">View current file</a>}</Field>
                  <Field label="Video URL"><input type="url" value={materialForm.video_url} onChange={(e) => setMaterialForm({ ...materialForm, video_url: e.target.value })} placeholder="https://youtube.com/…" className="control" /></Field>
                  <Field label="External resource URL"><input type="url" value={materialForm.resource_url} onChange={(e) => setMaterialForm({ ...materialForm, resource_url: e.target.value })} placeholder="Google Drive or website link" className="control" /></Field>
                  <Field label="Description"><input value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} className="control" /></Field>
                </div>
                <Field label="Notes / content text (optional)"><textarea rows={4} value={materialForm.content_text} onChange={(e) => setMaterialForm({ ...materialForm, content_text: e.target.value })} className="control" placeholder="Write notes or add extra instructions…" /></Field>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(materialForm.is_published)} onChange={(e) => setMaterialForm({ ...materialForm, is_published: e.target.checked })} /> Published and visible to students (subject to access rules)</label>
                <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : materialForm.id ? "Update material" : "Save material"}</button><button type="button" onClick={() => { setMaterialForm(null); setSelectedFile(null); }} className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold">Cancel</button></div>
              </form>}

              <div className="mt-5 space-y-3">
                {visibleMaterials.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{item.material_type?.replace("_"," ")}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.access_type === "premium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{item.access_type}</span></div><p className="mt-1 text-xs text-slate-500">{item.description || "No description"}{item.is_published === false ? " · Draft" : ""}</p><div className="mt-2 flex flex-wrap gap-3 text-xs">{item.file && <a href={item.file} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 underline">Open file</a>}{item.video_url && <a href={item.video_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 underline">Open video</a>}{item.resource_url && <a href={item.resource_url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 underline">External link</a>}</div></div>
                  <div className="flex shrink-0 gap-2"><button onClick={() => openMaterial(item)} className="rounded-lg border px-3 py-2 text-xs font-semibold">Edit</button><button onClick={() => deleteMaterial(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button></div>
                </article>)}
                {visibleMaterials.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No materials here yet. Add a PDF, video URL, notes or past questions.</div>}
              </div>
            </section>
          </>}
        </>}
      </div>
      <style jsx global>{`.control{width:100%;border:1px solid #cbd5e1;border-radius:.6rem;background:white;padding:.65rem .8rem;font-size:.875rem;outline:none}.control:focus{border-color:#6366f1;box-shadow:0 0 0 2px #e0e7ff}`}</style>
    </main>
  );
}

function Select({ label, value, onChange, placeholder, options, disabled = false }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"><option value="">{placeholder}</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>;
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
