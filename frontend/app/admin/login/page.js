"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      // --------------------------------
      // 1. Login
      // --------------------------------
      const data = await loginUser(
        username.trim(),
        password
      );

      console.log("ADMIN LOGIN RESPONSE:", data);

      if (!data?.access) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // --------------------------------
      // 2. Save access token
      // --------------------------------
      localStorage.setItem(
        "access_token",
        data.access
      );

      // --------------------------------
      // 3. Save refresh token
      // --------------------------------
      if (data?.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      // --------------------------------
      // 4. Save user
      // --------------------------------
      if (data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // --------------------------------
      // 5. Verify administrator access
      // --------------------------------
      const adminResponse = await fetch(
        "http://127.0.0.1:8000/api/admin/dashboard/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "ADMIN API STATUS:",
        adminResponse.status
      );

      let adminData = {};

      try {
        adminData = await adminResponse.json();
      } catch {
        adminData = {};
      }

      console.log(
        "ADMIN API RESPONSE:",
        adminData
      );

      // --------------------------------
      // 6. Admin verified
      // --------------------------------
      if (adminResponse.ok) {
        console.log(
          "ADMIN ACCESS GRANTED"
        );

        router.replace("/admin");
        return;
      }

      // --------------------------------
      // 7. User authenticated but not admin
      // --------------------------------
      if (adminResponse.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        throw new Error(
          "Your account is not authorized to access the administrator area."
        );
      }

      // --------------------------------
      // 8. JWT authentication failed
      // --------------------------------
      if (adminResponse.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        throw new Error(
          "Admin authentication failed. Please check the JWT configuration."
        );
      }

      // --------------------------------
      // 9. Other backend error
      // --------------------------------
      throw new Error(
        adminData?.detail ||
        "Unable to verify administrator access."
      );

    } catch (err) {
      console.error(
        "ADMIN LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Invalid admin username or password."
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
              BTMath Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in with your administrator account.
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
                  Admin Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter admin username"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
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
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                />

              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Verifying administrator..."
                  : "Login as Administrator"}
              </button>

            </form>

            {/* Normal Login */}
            <div className="mt-6 border-t border-gray-100 pt-6 text-center">

              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                className="text-sm font-semibold text-gray-600 hover:text-black hover:underline"
              >
                ← Back to normal login
              </button>

            </div>

          </div>

          {/* Security Note */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Administrator access is restricted to
            authorized BTMath staff accounts.
          </p>

        </div>

      </div>

    </main>
  );
}
