"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ReportTabs } from "@/components/report/ReportTabs";
import { GlassCard } from "@/components/ui/GlassCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskRadar } from "@/components/dashboard/RiskRadar";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { MaturityBar } from "@/components/dashboard/MaturityBar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Download, Share2, TrendingUp, DollarSign, Clock } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/api/assessments/${id}`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto space-y-6 animate-pulse h-screen bg-gray-50/50 rounded-3xl" />;
  if (!data) return <div className="max-w-6xl mx-auto p-12 text-center text-gray-500">Failed to load report.</div>;

  const p = data.prediction || {};
  const roi = p.roi_percentage ? `${p.roi_percentage}%` : "--";
  const cost = p.annual_net_benefit ? `$${(p.annual_net_benefit / 1000).toFixed(0)}k` : "--";
  const time = p.payback_months ? `${p.payback_months.toFixed(1)} mo` : "--";
  
  // Format date
  const dateStr = new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/assessments" className="text-xs font-medium flex items-center gap-1 mb-2 transition-colors hover:text-[var(--color-primary)]" style={{ color: "var(--color-text-tertiary)" }}>
            <ArrowLeft size={14} /> Back to Assessments
          </Link>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>{data.project_name}</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Strategic AI Assessment Report • Generated {dateStr}
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
            <KpiCard label="Projected ROI (36 mo)" value={roi} tint="roi" trend={{ direction: "up", value: "18%" }} icon={<TrendingUp size={20} />} />
            <KpiCard label="Annual Net Benefit" value={cost} tint="budget" icon={<DollarSign size={20} />} />
            <KpiCard label="Payback Period" value={time} tint="maturity" icon={<Clock size={20} />} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard elevated>
              <h3 className="text-h3 font-display font-semibold mb-3" style={{ color: "var(--color-navy)" }}>Executive Summary</h3>
              <p className="text-body-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                The <strong>{data.project_name}</strong> project in the <strong>{data.department}</strong> department is well-positioned to leverage AI for process automation and insights. The readiness level is currently evaluated as <strong>{p.readiness_level || 'LOW'}</strong>.
              </p>
              <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                We recommend a phased approach: begin with vendor-supplied ML solutions for quick wins, while simultaneously upskilling your internal team. The projected ROI stands at {roi} based on industry benchmarks and current ML maturity.
              </p>
            </GlassCard>
            <MaturityBar currentTier={p.maturity_tier || 1} peerAvg={2.8} />
          </div>
        </div>
      )}
    </div>
  );
}
