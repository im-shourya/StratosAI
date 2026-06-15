"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

const ASSESSMENTS = [
  { id: "1", company: "Acme Fintech Ltd", industry: "Financial Services", status: "completed" as const, date: "Jun 12, 2026", roi: "142%", progress: 100 },
  { id: "2", company: "Nova Healthcare", industry: "Healthcare", status: "active" as const, date: "Jun 10, 2026", roi: "--", progress: 65 },
  { id: "3", company: "Apex Manufacturing", industry: "Manufacturing", status: "pending" as const, date: "Jun 8, 2026", roi: "--", progress: 10 },
  { id: "4", company: "Global Retail Partners", industry: "Retail", status: "completed" as const, date: "May 25, 2026", roi: "215%", progress: 100 },
  { id: "5", company: "SecureData Corp", industry: "Technology", status: "error" as const, date: "May 15, 2026", roi: "--", progress: 40 },
];

export default function AssessmentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>Assessments</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage and view all your strategic AI assessments.
          </p>
        </div>
        <Link href="/assessment/new/chat">
          <Button size="md" className="gap-2">
            <Plus size={16} /> New Assessment
          </Button>
        </Link>
      </div>

      <GlassCard className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Search assessments..." className="glass-input pl-9" />
        </div>
        <Button variant="glass" className="gap-2 shrink-0">
          <Filter size={16} /> Filter
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSESSMENTS.map((a) => (
          <GlassCard key={a.id} interactive className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <StatusPill status={a.status} />
              <span className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{a.date}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg mb-1" style={{ color: "var(--color-navy)" }}>{a.company}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>{a.industry}</p>
            </div>

            <div className="mt-auto space-y-4">
              {a.status === "completed" ? (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--color-text-secondary)" }}>Projected ROI</p>
                    <p className="font-mono font-medium text-lg" style={{ color: "var(--color-primary)" }}>{a.roi}</p>
                  </div>
                  <Link href={`/assessment/${a.id}/report`}>
                    <Button variant="glass" size="sm">View Report</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-secondary)" }}>Progress</span>
                    <span className="font-mono" style={{ color: "var(--color-primary)" }}>{a.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${a.progress}%`, background: "var(--color-primary)" }}
                    />
                  </div>
                  <div className="pt-2">
                    <Link href={`/assessment/${a.id}/chat`}>
                      <Button variant={a.status === "error" ? "danger" : "primary"} size="sm" className="w-full">
                        {a.status === "error" ? "Resolve Error" : "Continue Assessment"}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
