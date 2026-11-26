"use client";
import Link from "next/link";
const groups = [
 { title: "Students", description: "Manage registered students, Student IDs, course access, account status and password resets.", href: "/admin/users/students", icon: "🎓" },
 { title: "Staff & Admins", description: "View and manage staff, instructors and administrator accounts separately from students.", href: "/admin/users/staff", icon: "🛡️" },
];
export default function UserManagementHome() {
 return <main className="min-h-screen bg-gray-50 text-gray-900"><div className="mx-auto max-w-6xl px-6 py-10">
  <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-black">← Back to Dashboard</Link>
  <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Platform Operations</p>
  <h1 className="mt-2 text-3xl font-bold tracking-tight">Student & User Management</h1>
  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Choose which type of account you want to manage. Student accounts and staff/admin accounts are shown on separate pages.</p>
  <div className="mt-8 grid gap-5 md:grid-cols-2">{groups.map(group => <Link key={group.href} href={group.href} className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{group.icon}</div><h2 className="mt-5 text-xl font-bold">{group.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">{group.description}</p><div className="mt-6 text-sm font-semibold text-gray-900 transition-transform group-hover:translate-x-1">Open {group.title} →</div>
  </Link>)}</div>
 </div></main>;
}