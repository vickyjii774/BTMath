"use client";

import { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

// Import Navbar and Footer
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    alert("Thank you! Your message has been submitted.");

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-screen">

        {/* Hero */}
        <section className="bg-gray-900 px-6 py-20 text-center text-white">
          <h1 className="text-4xl font-bold md:text-5xl">
            Get in Touch
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Have a question about courses, study materials, or BTMath?
            We are here to help.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mx-auto max-w-7xl px-6 py-16">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* Form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Send us a Message
              </h2>

              <p className="mt-2 text-gray-500">
                Fill out the form and our team will get back to you.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    How can we help?
                  </label>

                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >
                    <option value="">
                      Select an option
                    </option>

                    <option value="course">
                      Course Question
                    </option>

                    <option value="materials">
                      Study Materials
                    </option>

                    <option value="technical">
                      Technical Support
                    </option>

                    <option value="feedback">
                      Feedback
                    </option>

                    <option value="collaboration">
                      Collaboration
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    rows="5"
                    required
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-black"
                >
                  Send Message
                </button>

              </form>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Contact Information
              </h2>

              <p className="mt-2 text-gray-500">
                Reach out to us through email, phone, or social media.
              </p>

              <div className="mt-8 space-y-6">

                {/* Location */}
                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Location
                    </h3>

                    <p className="mt-1 text-gray-500">
                      Kathmandu, Nepal
                    </p>
                  </div>

                </div>

                {/* Email */}
                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                    <FaEnvelope />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Email
                    </h3>

                    <p className="mt-1 text-gray-500">
                      support@btmath.com
                    </p>
                  </div>

                </div>

                {/* Phone */}
                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                    <FaPhone />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Phone
                    </h3>

                    <p className="mt-1 text-gray-500">
                      +977-XXXXXXXXXX
                    </p>
                  </div>

                </div>

              </div>

              {/* Social Media */}
              <div className="mt-10 border-t pt-8">

                <h3 className="font-semibold">
                  Follow Us
                </h3>

                <div className="mt-4 flex gap-3">

                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
                  >
                    <FaFacebookF />
                  </a>

                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
                  >
                    <FaInstagram />
                  </a>

                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
                  >
                    <FaYoutube />
                  </a>

                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
                  >
                    <FaWhatsapp />
                  </a>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Help Section */}
        <section className="bg-white px-6 py-16">

          <div className="mx-auto max-w-7xl">

            <div className="text-center">

              <h2 className="text-3xl font-bold">
                How Can We Help?
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-gray-500">
                Whether you have a course question or need technical
                support, feel free to contact us.
              </p>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              <HelpCard
                icon="📚"
                title="Course Questions"
                text="Ask about courses, syllabus and learning materials."
              />

              <HelpCard
                icon="📝"
                title="Study Materials"
                text="Report missing or incorrect educational resources."
              />

              <HelpCard
                icon="💻"
                title="Technical Support"
                text="Having trouble using BTMath? Let us know."
              />

              <HelpCard
                icon="💡"
                title="Suggestions"
                text="Share your ideas and help us improve BTMath."
              />

            </div>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </>
  );
}


function HelpCard({ icon, title, text }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-6 text-center transition hover:-translate-y-1 hover:shadow-md">

      <div className="text-4xl">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {text}
      </p>

    </div>
  );
}