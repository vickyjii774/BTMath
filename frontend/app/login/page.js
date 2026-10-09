"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next");
  const registeredId = searchParams.get("registered_id");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please provide your username, email, or Student ID, and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(username.trim(), password);

      if (!data?.access) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      localStorage.setItem("access_token", data.access);
      if (data?.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error("Login succeeded but no user information was returned.");
      }

      if (next && next.startsWith("/")) {
        window.location.href = next;
      } else if (data.user?.is_staff || data.user?.is_superuser) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err?.message || "Invalid credentials. Please verify your username, email, or Student ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-blue-600 hover:underline">
            ← Back to BTMath
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Login with your username, email, or Student ID 
          </p>
        </div>

        {registeredId && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">Registration Successful!</p>
            <p className="mt-1">
              Your Student ID is <strong className="font-mono text-green-900">{registeredId}</strong>. You can use it along with your password to log in.
            </p>
          </div>
        )}

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username  */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Username, Email, or Student ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. BTM-000001, username or email"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Login to BTMath"}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">Don't have an account?</p>
            <Link
              href={
                next
                  ? `/register?next=${encodeURIComponent(next)}`
                  : "/register"
              }
              className="mt-2 inline-block text-sm font-semibold text-black hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-sm text-gray-500">Loading sign in...</div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}