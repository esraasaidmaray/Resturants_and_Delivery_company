"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-palm-900/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-extrabold text-palm-900 hover:text-palm-700 transition">
          <span className="text-2xl">🇸🇦</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              pathname === "/"
                ? "bg-palm-50 text-palm-700 font-bold"
                : "text-palm-900/80 hover:bg-sand-100/60"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/quiz"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-palm-600 to-palm-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-palm-600/20 hover:from-palm-700 hover:to-palm-800 transition-all hover:scale-[1.02]"
          >
            <span>استبيان الأذواق</span>
            <span className="text-xs">✨</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
