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
// +2 is presented as one two-year programme. Hide legacy standalone
// Class 11/Class 12 records and collapse duplicate programme records that
// expose the same Grade 11/Grade 12 structure. No database rows are changed.
export function deduplicatePlusTwoPrograms(programs = []) {
  const candidates = programs.filter((program) => {
    const periods = program?.academic_periods?.length
      ? program.academic_periods
      : program?.semesters?.length
        ? program.semesters
        : program?._academic_periods?.length
          ? program._academic_periods
          : program?._semesters || [];
    return periods.length > 0;
  });

  const groups = new Map();
  for (const program of candidates) {
    const periods = program.academic_periods?.length
      ? program.academic_periods
      : program.semesters?.length
        ? program.semesters
        : program._academic_periods?.length
          ? program._academic_periods
          : program._semesters || [];
    const structure = periods.map((period, index) => {
      const name = formatAcademicPeriodName(period, index);
      return name.toLowerCase().replace(/[^a-z0-9]/g, "");
    }).sort().join("|");
    const key = structure || String(program.id || program.name);
    const current = groups.get(key);
    const score = (item) =>
      (item.courses?.length || 0) * 10 +
      (item.academic_periods?.length || item.semesters?.length || 0) * 3 +
      (item.description ? 1 : 0) +
      (item.duration_info ? 1 : 0);
    if (!current || score(program) > score(current)) groups.set(key, program);
  }
  return [...groups.values()];
}