"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, Tv, Sparkles, FolderOpen, Flame } from "lucide-react";

const NAV_ITEMS = [
  { href: "/auto", label: "Auto MXH", icon: Flame, special: true },
  { href: "/channels", label: "Quản Lý Kênh", icon: Tv },
  { href: "/projects/new", label: "Kịch Bản Mới", icon: Sparkles },
  { href: "/projects", label: "Kho Dự Án", icon: FolderOpen },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        if (item.special) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isActive
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              Auto Channel Studio
            </span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">
              AI Video MXH Production
            </span>
          </div>
        </Link>

        <Suspense fallback={<div className="h-8 w-48 bg-zinc-900/50 rounded-lg animate-pulse" />}>
          <NavLinks />
        </Suspense>

        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cloud Live
          </span>
        </div>
      </div>
    </header>
  );
}
