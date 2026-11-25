"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminContentManager({ resource, title, description, fields, single = false }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const defaults = useMemo(() => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? (f.type === "checkbox" ? true : "")])), [fields]);

  async function load() {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/admin/${resource}/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to load content.");
      const rows = Array.isArray(data) ? data : data.results || [];
      setItems(rows);
      if (single && rows.length) { setForm(Object.fromEntries(fields.map((f) => [f.name, rows[0][f.name] ?? ""]))); setEditing(true); }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [resource]);

  function startNew() { setForm({ ...defaults }); setEditing(false); setEditingId(null); }
  function startEdit(item) { setForm({ ...item }); setEditing(true); setEditingId(item.id); }
  function change(name, value) { setForm((old) => ({ ...old, [name]: value })); }

  async function save(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const token = localStorage.getItem("access_token");
      const targetId = single ? items[0]?.id : editingId;
      const url = editing && targetId ? `${API_URL}/admin/${resource}/${targetId}/` : `${API_URL}/admin/${resource}/`;
      const response = await fetch(url, {
        method: editing && targetId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        const fieldErrors = data.errors && typeof data.errors === "object"
          ? Object.entries(data.errors).map(([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : String(messages)}`
            ).join("\\n")
          : "";
        const message = fieldErrors
          ? `${data.detail || "Validation failed."}\\n${fieldErrors}`
          : data.detail || data.error || JSON.stringify(data);
        throw new Error(message);
      }
      await load();
      if (!single) { setForm(null); setEditing(false); }
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm("Delete this item?")) return;
    try {
      const response = await fetch(`${API_URL}/admin/${resource}/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      if (!response.ok) throw new Error("Delete failed.");
      await load();
    } catch (e) { setError(e.message); }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Dashboard</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-700">Website CMS</p><h1 className="mt-2 text-3xl font-black">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p></div>
        {!single && <button onClick={startNew} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">+ Add New</button>}
      </div>
      {error && <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {form && <form onSubmit={save} className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit content" : "Add new item"}</h2>{!single && <button type="button" onClick={() => setForm(null)} className="text-sm text-slate-500">Cancel</button>}</div>
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
            {field.type === "textarea" ? <textarea rows={field.rows || 5} required={field.required} value={form[field.name] ?? ""} onChange={(e) => change(field.name, e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600" /> :
            field.type === "checkbox" ? <span className="flex items-center gap-3"><input type="checkbox" checked={Boolean(form[field.name])} onChange={(e) => change(field.name, e.target.checked)} className="h-4 w-4" /><span className="text-sm text-slate-600">Enabled / visible</span></span> :
            field.type === "select" ? <select value={form[field.name] ?? ""} required={field.required} onChange={(e) => change(field.name, e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> :
            <input type={field.type || "text"} required={field.required} value={form[field.name] ?? ""} onChange={(e) => change(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)} placeholder={field.placeholder || ""} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600" />}
          </label>)}
        </div>
        <button disabled={saving} className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
      </form>}
      <div className="mt-7 grid gap-4">
        {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading...</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No records yet. Use Add New to create one.</div> : items.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="min-w-0"><h3 className="font-bold">{item.name || item.title || item.about_title || item.platform || item.key}</h3><p className="mt-1 text-sm text-slate-500">{item.role || item.url || item.contact_email || item.description || (item.is_active === false ? "Hidden" : "Published")}</p></div>
          <div className="flex gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Edit</button>{!single && <button onClick={() => remove(item.id)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>}</div>
        </article>)}
      </div>
    </div>
  </main>;
}
