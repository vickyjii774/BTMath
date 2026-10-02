"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCourses, submitPayment } from "../../../lib/api";

export default function PurchasePage({ params }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [transactionCode, setTransactionCode] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const courses = await getCourses();
        const found = courses.find((c) => String(c.id) === String(courseId));
        setCourse(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  async function handleSubmitPayment(e) {
    e.preventDefault();
    setError("");

    if (!transactionCode.trim()) {
      setError("Please enter your transaction or reference code.");
      return;
    }

    const price = course.discount_price > 0 && course.discount_price < course.price
      ? course.discount_price
      : course.price;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("course_id", course.id);
      formData.append("amount", price);
      formData.append("payment_method", paymentMethod);
      formData.append("transaction_code", transactionCode);
      if (proofFile) {
        formData.append("payment_proof", proofFile);
      }

      await submitPayment(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit payment. Please make sure you are logged in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-black px-5 py-2 text-xs font-bold text-white">
            Browse All Courses
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const finalAmount = course.discount_price > 0 && course.discount_price < course.price
    ? course.discount_price
    : course.price;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-950">Course Checkout & Payment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Secure manual verification for Nepal payment methods (eSewa, Khalti, Bank Transfer).
          </p>

          {/* Order Summary Box */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/80 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {course.program_name || "Mathematics Course"}
                </span>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{course.title}</h3>
                <p className="text-xs text-gray-500">Includes notes, full syllabus videos, past questions, and mock tests</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-950">Rs. {Number(finalAmount).toLocaleString()}</span>
                {course.discount_price > 0 && course.discount_price < course.price && (
                  <p className="text-xs text-gray-400 line-through">Rs. {Number(course.price).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {success ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center text-emerald-900">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-extrabold text-emerald-950">Payment Submitted Successfully!</h2>
              <p className="mt-2 text-sm text-emerald-800 max-w-md mx-auto">
                Thank you! Your payment proof and reference code <strong>{transactionCode}</strong> have been received.
                Our administration verifies transactions promptly. Your course enrollment will be automatically activated.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 shadow"
                >
                  View My Dashboard 
                </Link>
                <Link
                  href="/courses"
                  className="rounded-xl border border-emerald-300 bg-white px-6 py-3 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
                >
                  Browse More Courses
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="mt-8 space-y-8">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Step 1: Choose Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("esewa")}
                    className={`rounded-xl border p-4 text-center font-bold text-sm transition ${
                      paymentMethod === "esewa"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-sm ring-2 ring-emerald-500"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xl mb-1">🟢</div>
                    eSewa
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`rounded-xl border p-4 text-center font-bold text-sm transition ${
                      paymentMethod === "khalti"
                        ? "border-purple-600 bg-purple-50/50 text-purple-800 shadow-sm ring-2 ring-purple-500"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xl mb-1">🟣</div>
                    Khalti
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`rounded-xl border p-4 text-center font-bold text-sm transition ${
                      paymentMethod === "bank_transfer"
                        ? "border-blue-600 bg-blue-50/50 text-blue-800 shadow-sm ring-2 ring-blue-500"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xl mb-1">🏦</div>
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* Step 2: Payment Details Display */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Step 2: Transfer Rs. {Number(finalAmount).toLocaleString()} using details below
                </p>

                {paymentMethod === "esewa" && (
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><strong>eSewa ID:</strong> <span className="font-mono text-black  px-2 py-0.5 rounded">9869598472</span></p>
                    <p><strong>Account Name:</strong> BTMath Education Pvt. Ltd.</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Please enter your BTMath username or course name in the transfer remarks/remarks field.
                    </p>
                  </div>
                )}

                {paymentMethod === "khalti" && (
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><strong>Khalti Number:</strong> <span className="font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded">9869598472</span></p>
                    <p><strong>Account Name:</strong> BTMath Academy</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Send the exact course amount and note the Transaction ID.
                    </p>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><strong>Bank:</strong> Global IME Bank / Nabil Bank</p>
                    <p><strong>Account Name:</strong> BTMATH EDUCATION PVT. LTD.</p>
                    <p><strong>Account Number:</strong> <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">01234567890123</span></p>
                    <p><strong>Branch:</strong> Kathmandu Main Branch</p>
                  </div>
                )}
              </div>

              {/* Step 3: Submission Form */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-900">
                  Step 3: Submit Verification Proof
                </label>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Transaction Code / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    placeholder="e.g. 7X892K9L or Bank Slip Reference"
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Upload Payment Slip / Screenshot (Optional but recommended)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-black py-4 text-center text-sm font-bold text-white shadow-lg hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {submitting ? "Verifying & Submitting..." : "Submit Payment for Activation →"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}