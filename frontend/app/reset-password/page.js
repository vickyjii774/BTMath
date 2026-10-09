"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../../lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Password reset failed. Token may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 text-xl font-bold">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Password Reset Complete!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your password has been securely updated. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Go to Login →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
      <div className="mb-6">
        <Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline">
          ← Back to Login
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Set New Password
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your reset token and your new password.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reset Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste reset token here"
            required
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Updating password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
