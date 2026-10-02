"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";
  const course = searchParams.get("course");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);

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
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
          BTMath
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome Back</h1>
        <p className="mt-1 text-xs text-gray-500">
          Login with your email or username to access your courses
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email or Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. student@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              Password
            </label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Signing in..." : "Sign In to BTMath"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}${
            course ? `&course=${encodeURIComponent(course)}` : ""
          }`}
          className="font-bold text-blue-600 hover:underline"
        >
          Register for free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}