import { GlassCard } from "@/components/ui/GlassCard";

const TIERS = ["Exploring", "Experimenting", "Operating", "Scaling", "Leading"];

interface MaturityBarProps {
  currentTier?: number;
  peerAvg?: number;
}

export function MaturityBar({ currentTier = 2, peerAvg = 2.8 }: MaturityBarProps) {
  return (
    <GlassCard tint="maturity">
      <h3 className="text-h3 font-display font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
        Maturity Position
      </h3>
      <div className="flex items-end gap-1.5 mb-3">
        {TIERS.map((tier, i) => {
          const isActive = i < currentTier;
          const isCurrent = i === currentTier - 1;
          return (
            <div key={tier} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-md transition-all duration-500"
                style={{
                  height: `${20 + i * 10}px`,
                  background: isActive
                    ? isCurrent
                      ? "var(--color-accent)"
                      : "var(--color-accent-light)"
                    : "rgba(0,0,0,0.06)",
                  opacity: isActive ? (isCurrent ? 1 : 0.5) : 1,
                }}
              />
              <span
                className="text-[10px] text-center leading-tight"
                style={{
                  color: isCurrent ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {tier}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-body-sm">
        <span style={{ color: "var(--color-text-secondary)" }}>
          Your tier: <strong style={{ color: "var(--color-accent)" }}>Level {currentTier}</strong>
        </span>
        <span style={{ color: "var(--color-text-tertiary)" }}>
          Industry avg: {peerAvg.toFixed(1)}
        </span>
      </div>
    </GlassCard>
  );
}
