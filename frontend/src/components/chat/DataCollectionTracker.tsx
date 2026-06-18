"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Gauge,
  Cog,
  Users,
  GraduationCap,
  Cpu,
  Lightbulb,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface FieldStatus {
  key: string;
  label: string;
  description: string;
  unit: string;
  collected: boolean;
  value: number | string | null;
  raw_answer: string | null;
}

interface CompletionStatus {
  fields: FieldStatus[];
  collectedCount: number;
  totalCount: number;
  pct: number;
  isComplete: boolean;
  missingFields: string[];
}

interface DataCollectionTrackerProps {
  completionStatus: CompletionStatus | null;
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  ai_investment_usd: <CircleDollarSign size={16} />,
  ai_maturity_score: <Gauge size={16} />,
  automation_rate: <Cog size={16} />,
  ai_adoption_level: <Users size={16} />,
  employee_training_hrs: <GraduationCap size={16} />,
  num_deployments: <Cpu size={16} />,
  use_case: <Lightbulb size={16} />,
};

function formatValue(key: string, value: number | string | null): string {
  if (value === null || value === undefined) return "—";
  // Text fields (use_case)
  if (typeof value === 'string') {
    return value.length > 30 ? value.slice(0, 30) + '…' : value;
  }
  switch (key) {
    case "ai_investment_usd":
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toLocaleString()}`;
    case "ai_maturity_score":
      return `${value.toFixed(1)} / 10`;
    case "automation_rate":
      return `${(value * 100).toFixed(0)}%`;
    case "ai_adoption_level":
      return `${(value * 100).toFixed(0)}%`;
    case "employee_training_hrs":
      return `${value.toFixed(0)} hrs/yr`;
    case "num_deployments":
      return `${value} system${value !== 1 ? "s" : ""}`;
    default:
      return String(value);
  }
}

export function DataCollectionTracker({ completionStatus }: DataCollectionTrackerProps) {
  const [animatingField, setAnimatingField] = useState<string | null>(null);
  const [prevCollected, setPrevCollected] = useState<Set<string>>(new Set());

  // Detect newly collected fields for animation
  useEffect(() => {
    if (!completionStatus) return;
    const currentCollected = new Set(
      completionStatus.fields.filter((f) => f.collected).map((f) => f.key)
    );
    for (const key of currentCollected) {
      if (!prevCollected.has(key)) {
        setAnimatingField(key);
        setTimeout(() => setAnimatingField(null), 1200);
        break;
      }
    }
    setPrevCollected(currentCollected);
  }, [completionStatus]);

  if (!completionStatus) {
    return (
      <div className="glass glass--elevated rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[var(--color-text-tertiary)] animate-pulse" />
          <span className="text-body-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  const { fields, pct, isComplete } = completionStatus;

  return (
    <div className="glass glass--elevated rounded-2xl p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-body-sm font-semibold tracking-wide uppercase"
            style={{ color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}
          >
            Data Collection
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {isComplete
              ? "All metrics captured"
              : `${completionStatus.collectedCount} of ${completionStatus.totalCount} metrics`}
          </p>
        </div>
        <div
          className="text-lg font-bold font-mono tabular-nums"
          style={{
            color: isComplete
              ? "var(--color-success)"
              : pct >= 50
                ? "var(--color-warning)"
                : "var(--color-text-secondary)",
          }}
        >
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isComplete
              ? "var(--color-success)"
              : pct >= 50
                ? "linear-gradient(90deg, var(--color-warning), #F59E0B)"
                : "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))",
          }}
        />
      </div>

      {/* Field list */}
      <ul className="space-y-1.5">
        {fields.map((field) => {
          const isNewlyCollected = animatingField === field.key;

          return (
            <li
              key={field.key}
              className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 ${
                isNewlyCollected ? "scale-[1.02]" : ""
              }`}
              style={{
                background: field.collected
                  ? isNewlyCollected
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(16, 185, 129, 0.05)"
                  : "transparent",
              }}
            >
              {/* Icon */}
              <span
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-300"
                style={{
                  background: field.collected
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(0, 0, 0, 0.04)",
                  color: field.collected
                    ? "var(--color-success)"
                    : "var(--color-text-tertiary)",
                }}
              >
                {FIELD_ICONS[field.key] || <Circle size={16} />}
              </span>

              {/* Label + Value */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{
                    color: field.collected
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {field.label}
                </p>
                {field.collected && field.value !== null && (
                  <p
                    className="text-xs font-mono mt-0.5 transition-all duration-500"
                    style={{
                      color: "var(--color-success)",
                      opacity: isNewlyCollected ? 0.7 : 1,
                    }}
                  >
                    {formatValue(field.key, field.value)}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <span className="shrink-0">
                {field.collected ? (
                  <CheckCircle2
                    size={16}
                    className={`transition-all duration-300 ${
                      isNewlyCollected ? "animate-bounce" : ""
                    }`}
                    style={{ color: "var(--color-success)" }}
                  />
                ) : (
                  <Circle
                    size={16}
                    style={{ color: "var(--color-text-tertiary)", opacity: 0.4 }}
                  />
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Completion message */}
      {isComplete && (
        <div
          className="mt-4 pt-3 text-center text-xs font-medium"
          style={{
            borderTop: "1px solid rgba(16, 185, 129, 0.15)",
            color: "var(--color-success)",
          }}
        >
          ✨ All data points captured — ready for analysis
        </div>
      )}
    </div>
  );
}
