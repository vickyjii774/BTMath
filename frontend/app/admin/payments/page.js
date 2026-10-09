"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approvePayment, rejectPayment } from "../../../lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  // Modal for previewing screenshot proof
  const [previewImage, setPreviewImage] = useState(null);

  // Modal for rejecting payment with reason
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/admin/payments/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/admin/login");
        return;
      }

      if (response.status === 403) {
        setError("Administrator permission required.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load payments (${response.status})`);
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("ADMIN PAYMENTS ERROR:", err);
      setError(err?.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleApprove(paymentId) {
    if (!confirm("Are you sure you want to approve this payment? This will grant the student course access and access group permissions.")) {
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await approvePayment(paymentId);
      setFeedback({ type: "success", message: res.message || "Payment approved and access granted!" });
      await loadPayments();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Approval failed." });
    } finally {
      setActionLoading(false);
    }
  }

  async function submitReject(e) {
    e.preventDefault();
    if (!rejectingPayment) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await rejectPayment(rejectingPayment.id, rejectionReason.trim());
      setFeedback({ type: "success", message: res.message || "Payment marked as rejected." });
      setRejectingPayment(null);
      setRejectionReason("");
      await loadPayments();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Rejection failed." });
    } finally {
      setActionLoading(false);
    }
  }

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((p) => {
      const st = String(p.status || "").toLowerCase();
      if (statusFilter !== "all" && st !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const userStr = String(p.username || p.user_username || p.user?.username || p.user || "").toLowerCase();
      const codeStr = String(p.transaction_code || "").toLowerCase();
      const courseStr = String(p.course_title || p.course?.title || p.course || "").toLowerCase();
      const methodStr = String(p.payment_method || "").toLowerCase();

      return (
        userStr.includes(query) ||
        codeStr.includes(query) ||
        courseStr.includes(query) ||
        methodStr.includes(query)
      );
    });
  }, [payments, statusFilter, search]);

  const pendingCount = payments.filter((p) => String(p.status).toLowerCase() === "pending").length;
  const approvedCount = payments.filter((p) => String(p.status).toLowerCase() === "approved").length;
  const rejectedCount = payments.filter((p) => String(p.status).toLowerCase() === "rejected").length;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              BTMath
            </Link>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Payment Verification
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-black">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-sm font-medium text-gray-600 hover:text-black">
              Students
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
              Website
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Transactions & Enrollments
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Payment Approvals
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Verify manual eSewa, Khalti, and QR payments. Approving automatically unlocks access groups and logs an audit record.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.type === "success" ? "✓ " : "⚠ "}
            {feedback.message}
          </div>
        )}

        {/* Metric Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`text-left rounded-2xl border p-5 transition ${
              statusFilter === "pending"
                ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-400"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Verification
            </p>
            <p className="mt-2 text-3xl font-black text-amber-900">{pendingCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`text-left rounded-2xl border p-5 transition ${
              statusFilter === "approved"
                ? "border-green-400 bg-green-50/60 ring-2 ring-green-400"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-green-700">
              Approved Payments
            </p>
            <p className="mt-2 text-3xl font-black text-green-900">{approvedCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`text-left rounded-2xl border p-5 transition ${
              statusFilter === "rejected"
                ? "border-red-400 bg-red-50/60 ring-2 ring-red-400"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-black text-red-900">{rejectedCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`text-left rounded-2xl border p-5 transition ${
              statusFilter === "all"
                ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-400"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Total Payments
            </p>
            <p className="mt-2 text-3xl font-black text-blue-900">{payments.length}</p>
          </button>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, transaction code, or course title..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-black"
          />

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-gray-500">Showing:</span>
            <span className="font-mono text-gray-900">{filteredPayments.length} records</span>
          </div>
        </div>

        {/* Loading / Error / Empty states */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            <p className="mt-4 text-sm text-gray-500">Loading payments...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredPayments.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-4xl">💳</div>
            <h3 className="mt-3 text-lg font-bold">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? "No records match your search criteria." : `No ${statusFilter} payments found.`}
            </p>
          </div>
        )}

        {/* Payments Table */}
        {!loading && filteredPayments.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Course / Access</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method & Ref Code</th>
                    <th className="px-6 py-4">Receipt Proof</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((p) => {
                    const status = String(p.status || "").toLowerCase();
                    const proofUrl = p.payment_proof || p.screenshot || p.proof;

                    return (
                      <tr key={p.id} className="transition hover:bg-gray-50">
                        {/* Student */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-950">
                            {p.username || p.user_username || p.user?.username || `User #${p.user}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.email || p.user?.email || "—"}
                          </p>
                        </td>

                        {/* Course */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {p.course_title || p.course?.title || `Course #${p.course}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(p.created_at).toLocaleString()}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-bold text-gray-900">
                          Rs. {Number(p.amount || 0).toLocaleString()}
                        </td>

                        {/* Method & Code */}
                        <td className="px-6 py-4">
                          <span className="font-bold uppercase text-gray-700">
                            {p.payment_method || "Direct"}
                          </span>
                          <div className="mt-0.5 font-mono text-xs text-blue-700">
                            {p.transaction_code ? `Ref: ${p.transaction_code}` : "No Code"}
                          </div>
                        </td>

                        {/* Receipt Screenshot */}
                        <td className="px-6 py-4">
                          {proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(proofUrl)}
                              className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                            >
                              <img
                                src={proofUrl}
                                alt="Proof"
                                className="h-full w-full object-cover transition group-hover:opacity-80"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                                View
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No receipt</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                              status === "approved"
                                ? "bg-green-100 text-green-800"
                                : status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(p.id)}
                                disabled={actionLoading}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingPayment(p);
                                  setRejectionReason("");
                                }}
                                disabled={actionLoading}
                                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-3">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white hover:bg-black"
            >
              ✕ Close
            </button>
            <img
              src={previewImage}
              alt="Payment Screenshot"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-950">
              Reject Payment #{rejectingPayment.id}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Please enter the reason for rejecting this payment (e.g. invalid transaction code, fake receipt).
            </p>

            <form onSubmit={submitReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction code not found in bank statement."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}