"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "../../lib/api";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";
  const course = searchParams.get("course");

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    education_level: "plus_two",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(formData);

      if (data?.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data?.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const assignedId = data?.student_id || data?.user?.student_id || data?.user?.profile?.student_id || "BTM-NEW";
      setSuccessInfo({
        studentId: assignedId,
        username: formData.username,
      });
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (successInfo) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-black">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Registration Complete!</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to BTMath! Your unique Student ID has been generated:
          </p>

          <div className="my-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Official Student ID
            </p>
            <p className="mt-1 font-mono text-2xl font-black text-blue-900 tracking-wider">
              {successInfo.studentId}
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Save this ID! You can use it along with your password to log in.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (course) {
                  router.push(`/purchase/${course}`);
                } else {
                  router.push(next);
                }
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Continue to {course ? "Course Purchase" : "Dashboard"} →
            </button>
            <Link
              href="/login"
              className="block text-center text-xs text-gray-500 hover:text-black"
            >
              Or go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-black">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
          BTMath
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Student Account</h1>
        
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Sharma"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Username *
          </label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. ramesh@example.com"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 9800000000"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Current Academic Level
          </label>
          <select
            name="education_level"
            value={formData.education_level}
            onChange={handleChange}
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="plus_two">+2 / Grade 11 & 12</option>
            <option value="bachelor">Bachelor (BSc / BCA / CSIT / BIM / Engineering)</option>
            <option value="master">Master Mathematics</option>
            <option value="ioe">IOE Entrance Preparation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Password *
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Re-type your password"
            className="w-full text-black rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Generating Student ID..." : "Complete Registration"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}${
            course ? `&course=${encodeURIComponent(course)}` : ""
          }`}
          className="font-bold text-blue-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
