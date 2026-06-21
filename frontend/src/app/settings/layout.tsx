"use client";

import { TopNav } from "@/components/layout/TopNav";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { User, Palette, Puzzle, Users } from "lucide-react";

const SETTINGS_NAV = [
  { label: "Account", icon: User, href: "/settings/account" },
  { label: "Appearance", icon: Palette, href: "/settings/appearance" },
  { label: "Team", icon: Users, href: "/settings/team" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen relative flex flex-col bg-[#F8F9FA]">
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Settings Sidebar */}
            <div className="w-full lg:w-64 shrink-0">
              <h1 className="text-h2 font-display font-bold mb-4" style={{ color: "var(--color-navy)" }}>Settings</h1>
              <GlassCard className="p-2">
                <nav className="flex flex-col gap-1">
                  {SETTINGS_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-[rgba(41,128,185,0.10)] text-[var(--color-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[rgba(41,128,185,0.05)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </GlassCard>
            </div>

            {/* Settings Content */}
            <div className="flex-1 mt-2 lg:mt-12">
              {children}
            </div>

          </div>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
