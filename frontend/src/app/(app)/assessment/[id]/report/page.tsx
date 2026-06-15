"use client";

import { useState } from "react";
import { ReportTabs } from "@/components/report/ReportTabs";
import { GlassCard } from "@/components/ui/GlassCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskRadar } from "@/components/dashboard/RiskRadar";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { MaturityBar } from "@/components/dashboard/MaturityBar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Download, Share2, TrendingUp, DollarSign, Clock } from "lucide-react";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/assessments" className="text-xs font-medium flex items-center gap-1 mb-2 transition-colors hover:text-[var(--color-primary)]" style={{ color: "var(--color-text-tertiary)" }}>
            <ArrowLeft size={14} /> Back to Assessments
          </Link>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>Acme Fintech Ltd</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Strategic AI Assessment Report • Generated Jun 12, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="md" className="gap-2"><Share2 size={16} /> Share</Button>
          <Button size="md" className="gap-2"><Download size={16} /> Export PDF</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-2">
        <ReportTabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content Area */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard label="Projected ROI (36 mo)" value="142%" tint="roi" trend={{ direction: "up", value: "18%" }} icon={<TrendingUp size={20} />} />
            <KpiCard label="Est. Implementation Cost" value="$850k" tint="budget" icon={<DollarSign size={20} />} />
            <KpiCard label="Time to Value" value="8 mo" tint="maturity" icon={<Clock size={20} />} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard elevated>
              <h3 className="text-h3 font-display font-semibold mb-3" style={{ color: "var(--color-navy)" }}>Executive Summary</h3>
              <p className="text-body-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Acme Fintech is well-positioned to leverage AI for fraud detection and customer service automation. Your centralized data warehouse provides a strong foundation, but current talent gaps in MLOps present a high execution risk.
              </p>
              <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                We recommend a phased approach: begin with vendor-supplied fraud detection APIs (quick win), while simultaneously upskilling your internal team to build custom models for customer churn prediction in Phase 2.
              </p>
            </GlassCard>
            <MaturityBar currentTier={2} peerAvg={2.8} />
          </div>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RiskRadar />
          <GlassCard>
            <h3 className="text-h3 font-display font-semibold mb-4" style={{ color: "var(--color-navy)" }}>Risk Mitigation Strategies</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-[rgba(192,57,43,0.2)] bg-[rgba(192,57,43,0.05)] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                  <h4 className="font-semibold text-sm">Talent Risk (High)</h4>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Lack of internal MLOps engineers. Mitigation: Partner with specialized consulting firm for first 2 deployments while hiring.</p>
              </div>
              <div className="p-3 rounded-xl border border-[rgba(212,172,13,0.2)] bg-[rgba(212,172,13,0.05)] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                  <h4 className="font-semibold text-sm">Technical Risk (Medium)</h4>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Data quality issues in legacy CRM. Mitigation: Implement data validation pipeline before model training.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "budget" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BudgetDonut />
          <GlassCard>
            <h3 className="text-h3 font-display font-semibold mb-4" style={{ color: "var(--color-navy)" }}>Capital Deployment</h3>
            <p className="text-body-sm text-[var(--color-text-secondary)] mb-4">Linear programming model recommends this distribution for maximum ROI.</p>
            {/* Table placeholder */}
            <div className="text-sm border border-[rgba(180,195,220,0.3)] rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 glass p-2 font-medium border-b border-[rgba(180,195,220,0.3)]">
                <div>Initiative</div><div className="text-right">Allocation</div><div className="text-right">Expected ROI</div>
              </div>
              <div className="grid grid-cols-3 p-2 border-b border-[rgba(180,195,220,0.1)]">
                <div>Fraud ML</div><div className="text-right font-mono">$450k</div><div className="text-right font-mono text-[var(--color-success)]">180%</div>
              </div>
              <div className="grid grid-cols-3 p-2">
                <div>CX Bot</div><div className="text-right font-mono">$200k</div><div className="text-right font-mono text-[var(--color-success)]">110%</div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {(activeTab === "scenarios" || activeTab === "maturity" || activeTab === "roadmap") && (
        <GlassCard className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-h3 font-display text-[var(--color-navy)] mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
          <p className="text-body-sm text-[var(--color-text-secondary)] text-center max-w-md">
            This module generates custom insights based on the assessment data. Full functionality available in the production build.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
