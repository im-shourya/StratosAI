"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface RiskItem {
  label: string;
  score: number;
  stripeStr: string;
}

function getRiskLevel(score: number) {
  if (score === 0) return { text: "N/A", color: "var(--color-text-tertiary)" };
  if (score >= 60) return { text: "HIGH", color: "var(--color-danger)" };
  if (score >= 35) return { text: "MED", color: "var(--color-warning)" };
  return { text: "LOW", color: "var(--color-success)" };
}

export function RiskRadar({ initialData }: { initialData?: RiskItem[] }) {
  const [risks, setRisks] = useState<RiskItem[]>(initialData || []);

  useEffect(() => {
    if (!initialData) {
      fetchApi('/api/dashboard/risks')
        .then(res => setRisks(res))
        .catch(console.error);
    } else {
      setRisks(initialData);
    }
  }, [initialData]);

  if (risks.length === 0) return <div className="flex flex-col gap-4 p-4 animate-pulse h-48 bg-gray-50/50 rounded-xl" />;

  return (
    <div className="flex flex-col gap-4 p-4">
      {risks.map((risk) => {
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
