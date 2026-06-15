"use client";

const RISKS = [
  { label: "Technical", score: 40, stripeStr: "repeating-linear-gradient(45deg, #3B82F6, #3B82F6 2px, #60A5FA 2px, #60A5FA 6px)" },
  { label: "Financial", score: 30, stripeStr: "repeating-linear-gradient(45deg, #10B981, #10B981 2px, #34D399 2px, #34D399 6px)" },
  { label: "Talent", score: 75, stripeStr: "repeating-linear-gradient(45deg, #EF4444, #EF4444 2px, #F87171 2px, #F87171 6px)" },
  { label: "Regulatory", score: 20, stripeStr: "repeating-linear-gradient(45deg, #8B5CF6, #8B5CF6 2px, #A78BFA 2px, #A78BFA 6px)" },
  { label: "Market", score: 15, stripeStr: "repeating-linear-gradient(45deg, #F59E0B, #F59E0B 2px, #FBBF24 2px, #FBBF24 6px)" },
];

function getRiskLevel(score: number) {
  if (score >= 60) return { text: "HIGH", color: "var(--color-danger)" };
  if (score >= 35) return { text: "MED", color: "var(--color-warning)" };
  return { text: "LOW", color: "var(--color-success)" };
}

export function RiskRadar() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {RISKS.map((risk) => {
        const level = getRiskLevel(risk.score);
        return (
          <div key={risk.label} className="flex items-center gap-3">
            <span className="text-body-sm w-20 shrink-0 font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {risk.label}
            </span>
            <div className="flex-1 h-3 w-full bg-white border border-gray-100 shadow-sm rounded-full overflow-hidden p-[1.5px]">
              <div
                className="h-full rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] transition-all duration-700"
                style={{
                  width: `${risk.score}%`,
                  background: risk.stripeStr,
                }}
              />
            </div>
            <span
              className="text-xs font-bold w-10 text-right uppercase"
              style={{ color: level.color }}
            >
              {level.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
