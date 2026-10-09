"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import { getCounters, recordSiteVisit, getSocialLinks } from "../lib/api";

export default function Footer() {
  const [stats, setStats] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    // Record visitor once per browser session
    if (typeof window !== "undefined") {
      const hasVisited = sessionStorage.getItem("btm_visited");
      if (!hasVisited) {
        sessionStorage.setItem("btm_visited", "true");
        recordSiteVisit(true).catch(() => {});
      }
    }

    // Load dynamic counters & social links
    getCounters()
      .then((data) => setStats(data))
      .catch(() => {});

    getSocialLinks()
      .then((data) => {
        if (Array.isArray(data)) setSocialLinks(data);
        else if (Array.isArray(data?.results)) setSocialLinks(data.results);
      })
      .catch(() => {});
  }, []);

  function getSocialIcon(platform) {
    switch (String(platform || "").toLowerCase()) {
      case "facebook":
        return <FaFacebookF />;
      case "whatsapp":
        return <FaWhatsapp />;
      case "tiktok":
        return <FaTiktok />;
      case "youtube":
        return <FaYoutube />;
      case "instagram":
        return <FaInstagram />;
      default:
        return <span>🔗</span>;
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Live Platform Counters Bar */}
      <div className="border-b border-gray-800 bg-gray-950/60 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-xl font-black text-white sm:text-2xl">
                {stats?.total_visitors ?? "1,200+"}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Platform Visitors
              </p>
            </div>
            <div>
              <p className="text-xl font-black text-blue-400 sm:text-2xl">
                {stats?.total_students ?? stats?.students ?? "500+"}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Registered Students
              </p>
            </div>
            <div>
              <p className="text-xl font-black text-emerald-400 sm:text-2xl">
                {stats?.total_enrollments ?? stats?.enrollments ?? "850+"}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Course Enrollments
              </p>
            </div>
            <div>
              <p className="text-xl font-black text-purple-400 sm:text-2xl">
                {stats?.total_courses ?? stats?.courses ?? "10+"}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Curated Math Courses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* BTMath Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              BTMath
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              Premier online mathematics platform in Nepal. Complete conceptual mastery and exam preparation for +2, Bachelor, Master & IOE Entrance.
            </p>

            {/* Social Media Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.title || item.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white transition"
                  >
                    {getSocialIcon(item.platform)}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-green-600"
                  >
                    <FaWhatsapp />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-black"
                  >
                    <FaTiktok />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-red-600"
                  >
                    <FaYoutube />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-pink-600"
                  >
                    <FaInstagram />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-white">Courses</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/plus-two" className="block hover:text-white">
                +2 Science & Management
              </Link>
              <Link href="/bachelor" className="block hover:text-white">
                Bachelor (BSc / BCA / CSIT / BIM)
              </Link>
              <Link href="/master" className="block hover:text-white">
                Master Mathematics
              </Link>
              <Link href="/ioe" className="block hover:text-white">
                IOE Engineering Entrance
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white">Resources</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/courses" className="block hover:text-white">
                Course Catalog
              </Link>
              <Link href="/dashboard" className="block hover:text-white">
                Student Dashboard
              </Link>
              <Link href="/contact" className="block hover:text-white">
                Past Questions & Solutions
              </Link>
              <Link href="/contact" className="block hover:text-white">
                Short Tricks & Formula Sheets
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white">Quick Links</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/" className="block hover:text-white">
                Home
              </Link>
              <Link href="/contact" className="block hover:text-white">
                Contact & Inquiries
              </Link>
              <Link href="/login" className="block hover:text-white">
                Student Login
              </Link>
              <Link href="/admin/login" className="block hover:text-white">
                Instructor Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BTMath. Operated by Mathematics Faculty. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
