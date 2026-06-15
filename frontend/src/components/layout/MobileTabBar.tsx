"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, ClipboardList, PlusCircle, BookOpen, Settings } from "lucide-react";

const TABS = [
  { icon: LayoutDashboard, href: "/dashboard", label: "Home" },
  { icon: ClipboardList, href: "/assessments", label: "Assess" },
  { icon: PlusCircle, href: "/assessment/new/chat", label: "New", primary: true },
  { icon: BookOpen, href: "/library", label: "Library" },
  { icon: Settings, href: "/settings/account", label: "Settings" },
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
              tab.primary
                ? "text-white -mt-4 w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                : isActive
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-tertiary)]"
            )}
            style={
              tab.primary
                ? {
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                    boxShadow: "0 4px 14px rgba(41, 128, 185, 0.3)",
                  }
                : undefined
            }
            aria-current={isActive ? "page" : undefined}
          >
            <tab.icon size={tab.primary ? 22 : 20} />
            {!tab.primary && (
              <span className="text-[10px] font-medium">{tab.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
