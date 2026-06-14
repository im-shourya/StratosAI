"use client";

import clsx from "clsx";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "scenarios", label: "Scenarios" },
  { id: "risk", label: "Risk Radar" },
  { id: "budget", label: "Budget" },
  { id: "maturity", label: "Maturity" },
  { id: "roadmap", label: "Roadmap" },
];

interface ReportTabsProps {
  active: string;
  onChange: (id: string) => void;
}

export function ReportTabs({ active, onChange }: ReportTabsProps) {
  return (
    <div className="glass inline-flex gap-1 p-1.5" style={{ borderRadius: "14px" }} role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={clsx(
            "px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-200",
            active === tab.id
              ? "text-white shadow-md"
              : "hover:bg-[rgba(41,128,185,0.06)]"
          )}
          style={
            active === tab.id
              ? { background: "var(--color-primary)", color: "white" }
              : { color: "var(--color-text-secondary)" }
          }
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
