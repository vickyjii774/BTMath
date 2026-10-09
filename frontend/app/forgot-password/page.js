"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      setResult(res);
    } catch (err) {
      setError(err?.message || "Failed to submit password reset request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline">
            ← Back to Login
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your account email to receive reset instructions.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Reset Request Received</p>
              <p className="mt-1">{result.message}</p>
            </div>

            {result.reset_token && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
                <p className="font-bold uppercase tracking-wider text-blue-700">Development Mode Link</p>
                <p className="mt-1 text-gray-600">Click below to reset immediately:</p>
                <Link
                  href={`/reset-password?token=${result.reset_token}`}
                  className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                  Proceed to Reset Password →
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Account Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
              {loading ? "Sending instructions..." : "Send Reset Instructions"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
