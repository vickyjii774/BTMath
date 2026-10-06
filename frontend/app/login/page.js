
 
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // PUT THE NEW handleLogin HERE
  // =====================================================
  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please provide username and password.");
      return;
    }

    setLoading(true);

    try {
      // Login
      const data = await loginUser(
        username.trim(),
        password
      );

      console.log("LOGIN RESPONSE:", data);

      // Check access token
      if (!data?.access) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // Save JWT access token
      localStorage.setItem(
        "access_token",
        data.access
      );

      // Save refresh token
      if (data?.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      // Save logged-in user
      if (data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log(
          "USER SAVED:",
          data.user
        );
      } else {
        throw new Error(
          "Login succeeded but no user information was returned."
        );
      }

      // Redirect
      const next = searchParams.get("next");

      if (next && next.startsWith("/")) {
        window.location.href = next;
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.message ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // YOUR RETURN STARTS HERE
  // =====================================================





  const next = searchParams.get("next");

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              BTMath
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login to continue to your course.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Signing in..."
                  : "Login"}
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-gray-100 pt-6 text-center">

              <p className="text-sm text-gray-500">
                Don't have an account?
              </p>

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
    </main>
  );
}