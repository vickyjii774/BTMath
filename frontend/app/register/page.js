"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "../../lib/api";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/courses";
  const course = searchParams.get("course");

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const data = await registerUser(formData);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (course) {
        router.push(`/purchase/${course}`);
      } else {
        router.push(next);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-black">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
          BTMath
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Student Account</h1>
        <p className="mt-1 text-xs text-gray-500">
          Join thousands of students learning mathematics
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name
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
            Username
          </label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="ramesh_math"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ramesh@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="98XXXXXXXX"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirm
            </label>
            <input
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Creating account..." : "Complete Registration"}
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
