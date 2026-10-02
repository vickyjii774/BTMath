"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          BTMath
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">

          {/* Home */}
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
                </Link>

                <Link
                  href="/bachelor"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Bachelor
                </Link>

                <Link
                  href="/master"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Master
                </Link>

                <Link
                  href="/ioe"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  IOE
                </Link>

              </div>
            )}
          </div>

          {/* Contact */}
          <Link href="/contact" className="hover:text-blue-600">
            Contact
          </Link>

        </div>
      </div>
    </nav>
  );
}

