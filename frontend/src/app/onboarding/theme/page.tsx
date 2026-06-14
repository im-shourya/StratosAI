"use client";

import Link from "next/link";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";

const THEMES = [
  {
    id: "corporate" as const,
    name: "Corporate Glass",
    desc: "Professional light theme with soft blue accents",
    gradient: "linear-gradient(135deg, #DBEAFE, #E8DAFF, #D5F5E3)",
    accent: "#2980B9",
  },
  {
    id: "midnight" as const,
    name: "Midnight Glass",
    desc: "Deep space dark theme for focused analysis",
    gradient: "linear-gradient(135deg, #0B0E1F, #1A1530, #0E2238)",
    accent: "#7F77DD",
  },
  {
    id: "cyberpunk" as const,
    name: "Cyberpunk Glass",
    desc: "Neon-accented dark theme for power users",
    gradient: "linear-gradient(135deg, #050505, #0A0A1A, #14021A)",
    accent: "#17A2B8",
  },
];

export default function OnboardingTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MeshBackground />
      <GlassCard elevated className="max-w-2xl w-full p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-body-sm font-medium" style={{ color: "var(--color-primary)" }}>Step 3 of 3</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--color-navy)" }}>
          Choose Your Theme
        </h1>
        <p className="text-body-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Select a visual style. You can change this anytime in Settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                "relative rounded-2xl p-4 text-left transition-all duration-200 border-2",
                theme === t.id
                  ? "border-[var(--color-primary)] shadow-lg"
                  : "border-transparent glass hover:shadow-md"
              )}
            >
              {theme === t.id && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div
                className="w-full h-20 rounded-lg mb-3"
                style={{ background: t.gradient }}
              />
              <h3 className="font-medium text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                {t.name}
              </h3>
              <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                {t.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/onboarding/profile">
            <Button variant="ghost">Back</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Enter Dashboard <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
