"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const links = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/courses", label: "My learning", icon: "▤" },
  { href: "/dashboard/access", label: "Course access", icon: "♧" },
  { href: "/dashboard/payments", label: "Payments", icon: "↗" },
  { href: "/dashboard/profile", label: "Personal details", icon: "◉" },
  { href: "/dashboard/security", label: "Password & security", icon: "⌑" },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const active = (href) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">BTMath student portal</p>
            <p className="mt-1 text-sm text-slate-500">Manage your learning, account and academic access.</p>
          </div>
          <Link href="/courses" className="w-fit rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Explore courses →</Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-5 px-3 py-5 sm:px-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <div className="hidden border-b border-slate-100 px-3 pb-4 pt-2 lg:block">
            <p className="text-sm font-extrabold text-slate-900">Student workspace</p>
            <p className="mt-1 text-xs text-slate-500">Your BTMath account</p>
          </div>
          <nav aria-label="Student dashboard" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pt-3">
            {links.map((item) => (
              <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition sm:text-sm ${active(item.href) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <span className="text-base">{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 hidden rounded-xl bg-slate-950 p-4 text-white lg:block">
            <p className="text-sm font-bold">Need more practice?</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">Browse your mathematics courses and entrance preparation.</p>
            <Link href="/ioe" className="mt-3 inline-flex text-xs font-bold text-blue-300 hover:text-white">IOE preparation →</Link>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <Footer />
    </main>
  );
}
