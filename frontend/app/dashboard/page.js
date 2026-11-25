"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getStudentDashboard, getMyAccessGroups, getMyPurchases } from "../../lib/api";

const navItems = [
  { label: "Overview", href: "#overview", icon: "▦" },
  { label: "My learning", href: "#learning", icon: "▤" },
  { label: "Access & purchases", href: "#access", icon: "♧" },
  { label: "Payments", href: "#payments", icon: "↗" },
];

function Metric({ label, value, hint, icon, accent = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tones[accent]}`}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>}
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [accessGroups, setAccessGroups] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [dashRes, groupsRes, purchasesRes] = await Promise.allSettled([
          getStudentDashboard(),
          getMyAccessGroups(),
          getMyPurchases(),
        ]);
        if (dashRes.status === "rejected") {
          throw new Error(dashRes.reason?.message || "Please sign in to view your dashboard.");
        }
        if (!active) return;
        setData(dashRes.value);
        if (groupsRes.status === "fulfilled" && groupsRes.value) {
          const value = groupsRes.value;
          setAccessGroups(Array.isArray(value) ? value : value.access_groups || value.results || []);
        }
        if (purchasesRes.status === "fulfilled" && purchasesRes.value) {
          const value = purchasesRes.value;
          setPurchases(Array.isArray(value) ? value : value.purchases || value.results || []);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load your dashboard.");
        router.push("/login?next=/dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [router]);

  const enrolledCourses = Array.isArray(data?.enrolled_courses) ? data.enrolled_courses : [];
  const mockAttempts = Array.isArray(data?.mock_attempts) ? data.mock_attempts : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const stats = data?.stats || {};
  const user = data?.user || {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Student";
  const initials = fullName.charAt(0).toUpperCase();
  const studentId = user.student_id || user.profile?.student_id || `BTM-${String(user.id || 1).padStart(6, "0")}`;
  const averageProgress = useMemo(() => {
    if (!enrolledCourses.length) return 0;
    return Math.round(enrolledCourses.reduce((sum, course) => sum + Number(course.progress_percentage || 0), 0) / enrolledCourses.length);
  }, [enrolledCourses]);
  const greeting = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  })();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-36">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">Preparing your learning dashboard…</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-500">{error || "Your student dashboard is available after login."}</p>
          <Link href="/login?next=/dashboard" className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">Go to login</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">BTMath student space</p>
            <p className="mt-1 text-sm text-slate-500">Your courses, progress and academic resources in one place.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Student account
            <span className="text-blue-300">•</span>{studentId}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-9">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 pb-4 pt-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-extrabold text-white">{initials}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
              <p className="truncate text-xs text-slate-500">{user.email || "Student account"}</p>
            </div>
          </div>
          <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {navItems.map((item, index) => (
              <a key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${index === 0 ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <span className="text-base">{item.icon}</span>{item.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
            <p className="text-sm font-bold">Ready for your next lesson?</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">Pick up where you left off or explore a new mathematics course.</p>
            <Link href="/courses" className="mt-3 inline-flex w-full justify-center rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white hover:bg-blue-400">Explore courses →</Link>
          </div>
          <Link href="/courses" className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><span>▣</span> Course catalogue</Link>
          <Link href="/ioe" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><span>✎</span> IOE preparation</Link>
        </aside>

        <div className="min-w-0 space-y-8">
          <section id="overview" className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#102b55] via-[#174b91] to-[#2563eb] p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-100">{greeting}, {user.first_name || user.username || "Student"} 👋</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Your learning journey, at a glance.</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">Keep building your understanding, track your course progress and stay on top of your mathematics goals.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={enrolledCourses[0]?.slug ? `/courses/${enrolledCourses[0].slug}/learn` : "/courses"} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50">Continue learning <span aria-hidden="true">→</span></Link>
                  <Link href="/courses" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Browse courses</Link>
                </div>
              </div>
              <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-6xl sm:flex">∑</div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="My courses" value={stats.active_courses_count ?? enrolledCourses.length} hint="Courses available to you" icon="▤" accent="blue" />
            <Metric label="Overall progress" value={`${averageProgress}%`} hint="Average across enrolled courses" icon="◔" accent="violet" />
            <Metric label="Lessons completed" value={stats.completed_materials_total ?? 0} hint="Your completed learning materials" icon="✓" accent="emerald" />
            <Metric label="Practice attempts" value={mockAttempts.length} hint="Recorded mock / quiz attempts" icon="✎" accent="amber" />
          </section>

          <section id="learning">
            <SectionHeading eyebrow="Your classroom" title="Continue learning" description="Jump back into a course and keep your progress moving." action={<Link href="/courses" className="text-sm font-bold text-blue-700 hover:text-blue-800">View all courses →</Link>} />
            {enrolledCourses.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {enrolledCourses.map((course) => {
                  const progress = Math.max(0, Math.min(100, Number(course.progress_percentage || 0)));
                  return (
                    <article key={course.course_id || course.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">∫</div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-950">{course.title}</h3>
                            <p className="mt-1 text-xs text-slate-500">{course.instructor || "BTMath Faculty"}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{progress}%</span>
                      </div>
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Course completion</span><span>{course.completed_materials || 0} / {course.total_materials || 0} lessons</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
                      </div>
                      <Link href={`/courses/${course.slug}/learn`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700">Open course <span className="ml-2">→</span></Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="text-4xl">📚</div>
                <h3 className="mt-3 font-bold text-slate-900">Your classroom is ready</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">You do not have an enrolled course yet. Explore the course catalogue to find the right mathematics programme.</p>
                <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Explore courses</Link>
              </div>
            )}
          </section>

          <section id="access">
            <SectionHeading eyebrow="Your membership" title="Course access & purchases" description="See which academic sections are unlocked for your account." />
            {accessGroups.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {accessGroups.map((group) => {
                  const item = group.access_group || group;
                  return (
                    <div key={group.id || item.id || item.slug} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">♧</span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Active</span>
                      </div>
                      <h3 className="mt-4 font-bold text-slate-950">{item.name || "Academic access"}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.description || "Access to the courses and learning resources included in this group."}</p>
                      <p className="mt-4 text-[11px] text-slate-400">{group.expires_at ? `Expires ${new Date(group.expires_at).toLocaleDateString()}` : "No expiry date shown"}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No active access groups are linked to your account yet. Approved purchases will appear here.</div>
            )}
            {purchases.length > 0 && <p className="mt-3 text-xs text-slate-500">{purchases.length} purchase record{purchases.length === 1 ? "" : "s"} found in your account.</p>}
          </section>

          <section id="payments">
            <SectionHeading eyebrow="Billing" title="Payment activity" description="Follow the verification status of your course purchases." />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {payments.length ? (
                <div className="divide-y divide-slate-100">
                  {payments.map((payment) => {
                    const status = String(payment.status || "pending").toLowerCase();
                    const statusClass = ["approved", "completed"].includes(status) ? "bg-emerald-50 text-emerald-700" : ["rejected", "failed"].includes(status) ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
                    return (
                      <div key={payment.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{payment.course_title || payment.course_name || "Course access purchase"}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {payment.amount !== undefined ? `Rs. ${Number(payment.amount).toLocaleString()} · ` : ""}
                            {payment.payment_method ? `${payment.payment_method} · ` : ""}
                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "Date not available"}
                          </p>
                          {payment.transaction_code && <p className="mt-1 text-xs text-slate-400">Transaction: {payment.transaction_code}</p>}
                          {status === "rejected" && payment.rejection_reason && <p className="mt-2 text-xs text-red-600">{payment.rejection_reason}</p>}
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass}`}>{payment.status || "Pending"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <div className="text-3xl">🧾</div>
                  <p className="mt-3 text-sm font-bold text-slate-800">No payment activity yet</p>
                  <p className="mt-1 text-xs text-slate-500">When you submit a course purchase, its verification status will appear here.</p>
                  <Link href="/courses" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Browse courses</Link>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Practice & preparation</p>
              <h3 className="mt-2 text-lg font-extrabold text-slate-950">Strengthen your problem-solving skills</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Explore your available mathematics courses and entrance preparation resources.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/ioe" className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">IOE preparation</Link>
                <Link href="/courses" className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">All courses</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-600">Your progress</p>
              <h3 className="mt-2 text-lg font-extrabold text-slate-950">{averageProgress}% average course completion</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{mockAttempts.length ? `You have completed ${mockAttempts.length} recorded practice attempt(s). Keep practising and review your results.` : "Your practice history will appear here as soon as you complete a mock test or quiz."}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${averageProgress}%` }} /></div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
