"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, ClipboardList, BookOpen, Building2 } from "lucide-react";

const TABS = [
  { icon: LayoutDashboard, href: "/dashboard", label: "Home" },
  { icon: ClipboardList, href: "/assessments", label: "Assess" },
  { icon: Building2, href: "/vendors", label: "Vendors" },
  { icon: BookOpen, href: "/library", label: "Library" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="glass glass--elevated fixed bottom-3 left-3 right-3 z-50 flex justify-around items-center py-2 lg:hidden"
      style={{
        borderRadius: "var(--radius-xl)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      aria-label="Primary navigation"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all",
              isActive
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-tertiary)]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
