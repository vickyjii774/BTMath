
import Link from "next/link";
import {
  FaFacebookF,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">

          {/* BTMath */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              BTMath
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              Learn, practice and improve your knowledge
              with quality courses and study resources.
            </p>

            {/* Social Media */}
            <div className="mt-6 flex gap-3">

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-green-600"
              >
                <FaWhatsapp />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-black"
              >
                <FaTiktok />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-red-600"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-pink-600"
              >
                <FaInstagram />
              </a>

            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-white">
              Courses
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <Link href="/plus-two" className="block hover:text-white">
                +2
              </Link>

              <Link href="/bachelor" className="block hover:text-white">
                Bachelor
              </Link>

              <Link href="/master" className="block hover:text-white">
                Master
              </Link>

              <Link href="/ioe" className="block hover:text-white">
                IOE
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white">
              Resources
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <Link href="/notes" className="block hover:text-white">
                Notes
              </Link>

              <Link href="/questions" className="block hover:text-white">
                Question Papers
              </Link>

              <Link
                href="/study-materials"
                className="block hover:text-white"
              >
                Study Materials
              </Link>

              <Link href="/blogs" className="block hover:text-white">
                Blogs
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white">
              Quick Links
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <Link href="/" className="block hover:text-white">
                Home
              </Link>

              <Link href="/about" className="block hover:text-white">
                About Us
              </Link>

              <Link href="/contact" className="block hover:text-white">
                Contact Us
              </Link>

              <Link href="/privacy" className="block hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BTMath. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
