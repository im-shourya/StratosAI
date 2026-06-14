import { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoreHorizontal } from "lucide-react";
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  tint?: "roi" | "risk" | "budget" | "maturity";
  trend?: { direction: "up" | "down"; value: string };
  icon?: ReactNode;
  children?: ReactNode;
}

export function KpiCard({ label, value, tint, trend, icon, children }: KpiCardProps) {
  return (
    <GlassCard tint={tint} interactive className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-navy)" }}>{label}</h3>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.03)] hover:bg-[rgba(0,0,0,0.06)] transition-colors border border-[rgba(0,0,0,0.05)]">
          <MoreHorizontal size={16} style={{ color: "var(--color-text-tertiary)" }} />
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-2">
        <p className="font-display text-4xl font-bold tracking-tight" style={{ color: "var(--color-navy)" }}>
          {value}
        </p>
        {trend && (
          <span
            className={clsx(
              "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
              trend.direction === "up" 
                ? "bg-[rgba(29,158,117,0.1)] text-[var(--color-success)]" 
                : "bg-[rgba(192,57,43,0.1)] text-[var(--color-danger)]"
            )}
          >
            {trend.direction === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>

      {children && (
        <div className="mt-auto pt-4 border-t border-[rgba(0,0,0,0.05)]">
          {children}
        </div>
      )}
    </GlassCard>
  );
}
