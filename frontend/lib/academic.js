// Shared presentation helpers for academic program pages.
// These helpers normalize display only; backend records and IDs remain untouched.
export function deduplicatePrograms(programs = []) {
  const byName = new Map();
  for (const program of programs) {
    if (!program || typeof program !== "object") continue;
    const name = String(program.name || "").trim();
    if (!name) continue;
    const key = name.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = byName.get(key);
    const completeness = (item) => (item.description ? 1 : 0) + (item.duration_info ? 1 : 0) + (item.academic_periods?.length || 0) * 2 + (item.semesters?.length || 0) * 2 + (item.courses?.length || 0);
    if (!existing || completeness(program) > completeness(existing)) byName.set(key, program);
  }
  return [...byName.values()];
}

export function formatAcademicPeriodName(period, index = 0) {
  const rawName = String(period?.name || period?._name || "").trim();
  const rawType = String(period?.period_type || period?._period_type || "").trim();
  const generic = /^(semester|sem|term|year|grade|academic period)$/i.test(rawName);
  if (!generic) return rawName || (rawType ? titleCase(rawType) : "Academic Period " + (index + 1));
  const type = /year|grade/i.test(rawName) ? rawName : rawType;
  const label = /year|grade/i.test(type) ? titleCase(type) : "Semester";
  const order = Number(period?.order);
  const number = Number.isFinite(order) && order > 0 ? order : index + 1;
  return label + " " + number;
}

function titleCase(value) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}