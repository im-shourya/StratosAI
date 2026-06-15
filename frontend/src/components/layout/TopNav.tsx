"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Settings, User } from "lucide-react";

export function TopNav() {
  return (
    <header
      className="glass glass--elevated sticky top-4 z-50 mx-4 px-5 py-3 flex items-center gap-4"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <Image src="/logo.png" alt="StratosAI" width={32} height={32} />
        <span
          className="font-display text-lg font-semibold hidden sm:inline"
          style={{ color: "var(--color-navy)" }}
        >
          StratosAI
        </span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-tertiary)" }}
        />
        <input
          type="text"
          placeholder="Search assessments, reports..."
          className="glass-input pl-9 py-2 text-sm"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <nav className="flex items-center gap-1">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[rgba(41,128,185,0.08)]"
          aria-label="Notifications"
        >
          <Bell size={18} style={{ color: "var(--color-text-secondary)" }} />
        </button>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[rgba(41,128,185,0.08)]"
          aria-label="Settings"
        >
          <Settings size={18} style={{ color: "var(--color-text-secondary)" }} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center ml-1"
          style={{ background: "var(--color-primary)", color: "white" }}
        >
          <User size={16} />
        </div>
      </nav>
    </header>
  );
}
