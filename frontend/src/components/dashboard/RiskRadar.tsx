"use client";

import { GlassCard } from "@/components/ui/GlassCard";

const RISKS = [
  { label: "Technical", score: 40, color: "#2980B9" },
  { label: "Financial", score: 30, color: "#1D9E75" },
  { label: "Talent", score: 75, color: "#C0392B" },
  { label: "Regulatory", score: 20, color: "#6C3483" },
  { label: "Market", score: 15, color: "#D4AC0D" },
];

function getRiskLevel(score: number) {
  if (score >= 60) return { text: "HIGH", color: "var(--color-danger)" };
  if (score >= 35) return { text: "MED", color: "var(--color-warning)" };
  return { text: "LOW", color: "var(--color-success)" };
}

export function RiskRadar() {
  return (
    <GlassCard tint="risk">
      <h3 className="text-h3 font-display font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
        Risk Radar
      </h3>
      <div className="flex flex-col gap-3">
        {RISKS.map((risk) => {
          const level = getRiskLevel(risk.score);
          return (
            <div key={risk.label} className="flex items-center gap-3">
              <span className="text-body-sm w-20 shrink-0" style={{ color: "var(--color-text-secondary)" }}>
                {risk.label}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-[rgba(0,0,0,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${risk.score}%`,
                    background: risk.color,
                    opacity: 0.75,
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-10 text-right"
                style={{ color: level.color }}
              >
                {level.text}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
