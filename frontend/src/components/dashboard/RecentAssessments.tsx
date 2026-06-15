import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { ArrowRight } from "lucide-react";

const ASSESSMENTS = [
  { id: "1", company: "Acme Fintech Ltd", industry: "Financial Services", status: "completed" as const, date: "Jun 12, 2026", roi: "142%" },
  { id: "2", company: "Nova Healthcare", industry: "Healthcare", status: "active" as const, date: "Jun 10, 2026", roi: "--" },
  { id: "3", company: "Apex Manufacturing", industry: "Manufacturing", status: "pending" as const, date: "Jun 8, 2026", roi: "--" },
];

export function RecentAssessments() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-display font-semibold" style={{ color: "var(--color-navy)" }}>
          Recent Assessments
        </h3>
        <Link
          href="/assessments"
          className="text-body-sm font-medium flex items-center gap-1 transition-colors hover:brightness-110"
          style={{ color: "var(--color-primary)" }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[rgba(180,195,220,0.2)]">
              <th className="text-body-sm font-medium pb-2.5 pr-4" style={{ color: "var(--color-text-tertiary)" }}>Company</th>
              <th className="text-body-sm font-medium pb-2.5 pr-4 hidden sm:table-cell" style={{ color: "var(--color-text-tertiary)" }}>Industry</th>
              <th className="text-body-sm font-medium pb-2.5 pr-4" style={{ color: "var(--color-text-tertiary)" }}>Status</th>
              <th className="text-body-sm font-medium pb-2.5 pr-4 hidden sm:table-cell" style={{ color: "var(--color-text-tertiary)" }}>Date</th>
              <th className="text-body-sm font-medium pb-2.5 text-right" style={{ color: "var(--color-text-tertiary)" }}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {ASSESSMENTS.map((a) => (
              <tr key={a.id} className="border-b border-[rgba(180,195,220,0.1)] last:border-0">
                <td className="py-3 pr-4">
                  <Link
                    href={`/assessment/${a.id}/report`}
                    className="font-medium text-sm hover:underline"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {a.company}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-body-sm hidden sm:table-cell" style={{ color: "var(--color-text-secondary)" }}>
                  {a.industry}
                </td>
                <td className="py-3 pr-4">
                  <StatusPill status={a.status} />
                </td>
                <td className="py-3 pr-4 text-body-sm hidden sm:table-cell" style={{ color: "var(--color-text-tertiary)" }}>
                  {a.date}
                </td>
                <td className="py-3 text-right font-mono text-sm font-medium" style={{ color: "var(--color-navy)" }}>
                  {a.roi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
