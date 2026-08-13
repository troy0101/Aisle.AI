"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/chat", label: "Planning chat" },
  { href: "/dashboard/moodboard", label: "Mood board" },
  { href: "/dashboard/guests", label: "Guests" },
  { href: "/dashboard/vendors", label: "Vendors" },
  { href: "/dashboard/budget", label: "Budget" },
  { href: "/dashboard/documents", label: "Documents" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-line min-h-screen px-4 py-6 flex flex-col">
      <Link href="/" className="font-display text-lg px-2 mb-8">Aisle</Link>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-2 py-2 rounded text-sm transition-colors ${
                active ? "bg-cloud text-ink font-medium" : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-ink-soft hover:text-ink px-2 text-left">
        Log out
      </button>
    </aside>
  );
}
