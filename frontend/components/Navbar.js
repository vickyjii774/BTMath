<<<<<<< HEAD

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore invalid localStorage data
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    router.push("/");
  }

=======
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
<<<<<<< HEAD
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-gray-950"
        >
=======
        <Link href="/" className="text-2xl font-bold">
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
          BTMath
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">

          {/* Home */}
<<<<<<< HEAD
          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            Home
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex w-max items-center gap-1 hover:text-blue-600"
            >
              Menu

              <span className="text-xs">
                {open ? "▲" : "▼"}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-2 shadow-lg">

                <Link
                  href="/plus-two"
                  className="block px-4 py-3 transition hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  +2 Math
=======
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex w-max items-center gap-1 pr-2 hover:text-blue-600"
            >
              Menu
              <span>{open ? "▲" : "▼"}</span>
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-3 w-44 rounded-lg border bg-white py-2 shadow-lg">

                <Link
                  href="/plus-two"
                  className="block px-4 py-4 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  +2
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
                </Link>

                <Link
                  href="/bachelor"
<<<<<<< HEAD
                  className="block px-4 py-3 transition hover:bg-gray-100"
=======
                  className="block px-4 py-2 hover:bg-gray-100"
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
                  onClick={() => setOpen(false)}
                >
                  Bachelor
                </Link>

                <Link
                  href="/master"
<<<<<<< HEAD
                  className="block px-4 py-3 transition hover:bg-gray-100"
=======
                  className="block px-4 py-2 hover:bg-gray-100"
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
                  onClick={() => setOpen(false)}
                >
                  Master
                </Link>

                <Link
                  href="/ioe"
<<<<<<< HEAD
                  className="block px-4 py-3 transition hover:bg-gray-100"
=======
                  className="block px-4 py-2 hover:bg-gray-100"
>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
                  onClick={() => setOpen(false)}
                >
                  IOE
                </Link>

              </div>
            )}
          </div>

          {/* Contact */}
<<<<<<< HEAD
          <Link
            href="/contact"
            className="transition hover:text-blue-600"
          >
            Contact
          </Link>

          {/* Authentication */}
          {user ? (
            <div className="flex items-center gap-3">

              {/* Dashboard */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3.5 py-2 font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                {user.first_name || user.username}
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">

              {/* Login */}
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 font-semibold text-gray-700 transition hover:text-black"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}
=======
          <Link href="/contact" className="hover:text-blue-600">
            Contact
          </Link>

>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
        </div>
      </div>
    </nav>
  );
}
<<<<<<< HEAD
=======

>>>>>>> c1273ae7b04f422d38c912659f1d5898ddb8ae9a
