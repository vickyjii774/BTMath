
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

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please provide username/email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(
        username.trim(),
        password
      );

      /*
       * Save authentication tokens.
       */
      if (data.access) {
        localStorage.setItem(
          "access_token",
          data.access
        );
      }

      if (data.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      /*
       * Return the user to the page
       * they originally wanted to access.
       *
       * Example:
       * /login?next=/courses/grade-12-mathematics
       *
       * After login:
       * /courses/grade-12-mathematics
       */
      const next = searchParams.get("next");

      if (next && next.startsWith("/")) {
        router.push(next);
      } else {
        router.push("/");
      }

      router.refresh();

    } catch (err) {
      setError(
        err?.message ||
        "Invalid username/email or password."
      );
    } finally {
      setLoading(false);
    }
  }

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

              {/* Username / Email */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Username or Email
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  disabled={loading}
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  disabled={loading}
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
                href={`/register${
                  searchParams.get("next")
                    ? `?next=${encodeURIComponent(
                        searchParams.get("next")
                      )}`
                    : ""
                }`}
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
