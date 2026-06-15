"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Settings,
  Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Assessments", icon: ClipboardList, href: "/assessments" },
  { label: "Use Case Library", icon: BookOpen, href: "/library" },
  { label: "Vendors", icon: ShoppingBag, href: "/vendors" },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="glass hidden lg:flex flex-col w-[240px] shrink-0 m-4 mt-4"
      style={{ borderRadius: "var(--radius-xl)", height: "calc(100vh - 7rem)" }}
    >
      {/* New Assessment CTA */}
      <div className="p-3 pb-2">
        <Link
          href="/assessment/new/chat"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-sm bg-[var(--color-navy)]"
        >
          <Plus size={16} />
          New Assessment
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--color-navy)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[var(--color-text-primary)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 pt-0 border-t border-[rgba(180,195,220,0.2)]">
        <Link
          href="/settings/account"
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname.startsWith("/settings")
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          )}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
