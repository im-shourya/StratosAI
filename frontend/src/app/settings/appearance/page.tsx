"use client";

import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check } from "lucide-react";
import clsx from "clsx";

const THEMES = [
  { id: "corporate" as const, name: "Corporate Glass", gradient: "linear-gradient(135deg, #DBEAFE, #E8DAFF, #D5F5E3)" },
  { id: "midnight" as const, name: "Midnight Glass", gradient: "linear-gradient(135deg, #0B0E1F, #1A1530, #0E2238)" },
  { id: "cyberpunk" as const, name: "Cyberpunk Glass", gradient: "linear-gradient(135deg, #050505, #0A0A1A, #14021A)" },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Appearance</h2>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Customize the look and feel of StratosAI.</p>
      </div>

      <GlassCard className="space-y-4">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Theme Style</h3>
        <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Select a visual theme. Your preference is saved locally.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className="w-full h-24 rounded-lg mb-3" style={{ background: t.gradient }} />
              <h4 className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>{t.name}</h4>
            </button>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
