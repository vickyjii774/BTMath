import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="text-2xl font-bold">
          BTMath
        </Link>

        <div className="flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/plus-two">+2</Link>
          <Link href="/bachelor">Bachelor</Link>
          <Link href="/master">Master</Link>
          <Link href="/ioe">IOE</Link>
          <Link href="/contact">Contact</Link>
        </div>

      </div>
    </nav>
  );
}