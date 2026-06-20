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
  const [isExporting, setIsExporting] = useState(false);

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
  const roi = p.roi_percentage ? `${Number(p.roi_percentage).toFixed(1)}%` : "--";
  const cost = p.annual_net_benefit ? `$${(Number(p.annual_net_benefit) / 1000).toFixed(0)}k` : "--";
  const time = p.payback_months === -1 ? "N/A" : (p.payback_months ? `${Number(p.payback_months).toFixed(1)} mo` : "--");
  
  // Format date
  const dateStr = new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleExportPdf = async () => {
    setIsExporting(true);
    
    // Give React 300ms to mount all the hidden tabs before capturing
    setTimeout(async () => {
      try {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 0.5;
        let currentY = margin;
        
        const sections = ['pdf-header', 'pdf-overview', 'pdf-scenarios', 'pdf-risk', 'pdf-budget'];

        for (let i = 0; i < sections.length; i++) {
          const element = document.getElementById(sections[i]);
          if (!element) continue;

          const dataUrl = await toPng(element, { 
            cacheBust: true,
            pixelRatio: 2,
            filter: (node) => {
              if (node instanceof HTMLElement && node.dataset && node.dataset.pdfIgnore !== undefined) {
                return false;
              }
              return true;
            }
          });
          
          const imgProps = pdf.getImageProperties(dataUrl);
          const scaledHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          // If the section doesn't fit on the current page, add a new page (unless it's the very first item)
          if (currentY + scaledHeight > pageHeight - margin && i > 0) {
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.addImage(dataUrl, 'PNG', 0, currentY, pdfWidth, scaledHeight);
          currentY += scaledHeight + 0.3; // Add 0.3 inch spacing between sections
        }
        
        pdf.save(`StratosAI_Report_${data.project_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      } catch (err) {
        console.error("Error generating PDF:", err);
        alert("Failed to generate PDF report.");
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  const riskData = [
    { label: "Technical", score: Number(p.risk_technical) || 40, stripeStr: "repeating-linear-gradient(45deg, #3B82F6, #3B82F6 2px, #60A5FA 2px, #60A5FA 6px)" },
    { label: "Financial", score: Number(p.risk_financial) || 30, stripeStr: "repeating-linear-gradient(45deg, #10B981, #10B981 2px, #34D399 2px, #34D399 6px)" },
    { label: "Talent", score: Number(p.risk_talent) || 75, stripeStr: "repeating-linear-gradient(45deg, #EF4444, #EF4444 2px, #F87171 2px, #F87171 6px)" },
    { label: "Regulatory", score: Number(p.risk_regulatory) || 20, stripeStr: "repeating-linear-gradient(45deg, #8B5CF6, #8B5CF6 2px, #A78BFA 2px, #A78BFA 6px)" },
    { label: "Market", score: Number(p.risk_market) || 15, stripeStr: "repeating-linear-gradient(45deg, #F59E0B, #F59E0B 2px, #FBBF24 2px, #FBBF24 6px)" }
  ];

  const budgetData = [
    { name: data.department || "General", value: Number(data.ai_budget) || 50000, color: "#2980B9" }
  ];

  return (
    <div id="report-content" className="max-w-6xl mx-auto space-y-6">
      
      {/* Formal PDF Header (Only visible during export) */}
      {isExporting && (
        <div id="pdf-header" className="mb-12 border-b-2 border-[var(--color-primary)] pb-8 pt-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-4xl font-display font-black text-[var(--color-navy)] mb-1">STRATOS AI</h1>
              <p className="text-[var(--color-primary)] font-semibold tracking-widest text-sm uppercase">Strategic Assessment Report</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-mono">Ref: {data.id.split('-')[0].toUpperCase()}</p>
              <p className="text-xs text-gray-500 font-mono">Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
             <div>
               <p className="text-xs text-gray-400 uppercase font-bold mb-1">Prepared For</p>
               <p className="font-semibold text-[var(--color-navy)]">{data.user?.company_name || 'Organization'}</p>
               <p className="text-sm text-gray-600">{data.user?.email || 'User'}</p>
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase font-bold mb-1">Project Metadata</p>
               <p className="font-semibold text-[var(--color-navy)]">{data.project_name}</p>
               <p className="text-sm text-gray-600">Department: {data.department}</p>
               <p className="text-sm text-gray-600">Assessment Date: {dateStr}</p>
             </div>
          </div>
        </div>
      )}

      {/* Standard Header (Hidden during export) */}
      {!isExporting && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div data-pdf-ignore>
            <Link href="/dashboard" className="text-xs font-medium flex items-center gap-1 mb-2 transition-colors hover:text-[var(--color-primary)]" style={{ color: "var(--color-text-tertiary)" }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>{data.project_name}</h1>
            <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
              Strategic AI Assessment Report • Generated {dateStr}
            </p>
          </div>
          <div className="flex items-center gap-2" data-pdf-ignore>
            <Button variant="glass" size="md" className="gap-2"><Share2 size={16} /> Share</Button>
            <Button size="md" className="gap-2" onClick={handleExportPdf} disabled={isExporting}>
              <Download size={16} /> {isExporting ? "Generating..." : "Export PDF"}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs - Hidden during PDF export */}
      {!isExporting && (
        <div className="overflow-x-auto pb-2" data-pdf-ignore>
          <ReportTabs active={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* Overview */}
      {(activeTab === "overview" || isExporting) && (
        <div id="pdf-overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-8 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>1. Executive Summary</h2>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard label="Projected ROI (36 mo)" value={roi} tint="roi" icon={<TrendingUp size={20} />} />
            <KpiCard label="Annual Net Benefit" value={cost} tint="budget" icon={<DollarSign size={20} />} />
            <KpiCard label="Payback Period" value={time} tint="maturity" icon={<Clock size={20} />} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard elevated>
              <h3 className="text-h3 font-display font-semibold mb-3" style={{ color: "var(--color-navy)" }}>Analysis</h3>
              <p className="text-body-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                The <strong>{data.project_name}</strong> project in the <strong>{data.department || 'organization'}</strong> is well-positioned to leverage AI. Based on the analysis of {data.extracted_data?.num_ai_deployments || 0} existing deployments, the readiness level is evaluated as <strong>{p.readiness_level || 'MEDIUM'}</strong>.
              </p>
              <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                The overall transformation score is <strong>{Number(p.transformation_score || 50).toFixed(1)}/100</strong>. We recommend proceeding with the allocated budget of ${Number(data.ai_budget || 0).toLocaleString()} to capture the projected {roi} return on investment.
              </p>
            </GlassCard>
            <MaturityBar currentTier={p.maturity_tier || 1} peerAvg={2.8} />
          </div>
        </div>
      )}

      {/* Scenarios */}
      {(activeTab === "scenarios" || isExporting) && (
        <div id="pdf-scenarios" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-12 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>2. Scenario Analysis</h2>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard tint="maturity">
              <h3 className="text-h3 font-display font-medium mb-2 text-[var(--color-warning)]">Cautious</h3>
              <div className="text-4xl font-bold mb-2">{Number(p.scenario_cautious_roi || 0).toFixed(1)}%</div>
              <p className="text-xs text-[var(--color-text-secondary)]">Delayed deployment and slower user adoption.</p>
            </GlassCard>
            <GlassCard tint="roi" elevated className="ring-2 ring-[var(--color-primary)]">
              <h3 className="text-h3 font-display font-bold mb-2 text-[var(--color-primary)]">Baseline (Expected)</h3>
              <div className="text-5xl font-bold mb-2">{Number(p.scenario_baseline_roi || 0).toFixed(1)}%</div>
              <p className="text-xs text-[var(--color-text-secondary)]">Expected execution based on current maturity.</p>
            </GlassCard>
            <GlassCard tint="budget">
              <h3 className="text-h3 font-display font-medium mb-2 text-[var(--color-success)]">Aggressive</h3>
              <div className="text-4xl font-bold mb-2">{Number(p.scenario_aggressive_roi || 0).toFixed(1)}%</div>
              <p className="text-xs text-[var(--color-text-secondary)]">Accelerated deployment with perfect adoption.</p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Risk Radar */}
      {(activeTab === "risk" || isExporting) && (
        <div id="pdf-risk" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-12 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>3. Risk Breakdown & Mitigation</h2>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-h3 font-display font-semibold mb-4 text-[var(--color-navy)]">Risk Vector Heatmap</h3>
              <RiskRadar initialData={riskData} />
            </GlassCard>
            <GlassCard>
               <h3 className="text-h3 font-display font-semibold mb-3 text-[var(--color-navy)]">Mitigation Strategy</h3>
               <p className="text-body-sm leading-relaxed mb-4 text-[var(--color-text-secondary)]">
                 The primary area of concern is <strong>{riskData.reduce((prev, current) => (prev.score > current.score) ? prev : current).label}</strong> risk.
                 We recommend allocating 20% of your initial budget towards mitigating this specific risk vector before scaling deployment.
               </p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Budget */}
      {(activeTab === "budget" || isExporting) && (
        <div id="pdf-budget" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-12 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>4. Financial Allocation</h2>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetDonut initialData={budgetData} />
            <GlassCard>
              <h3 className="text-h3 font-display font-semibold mb-3 text-[var(--color-navy)]">Financial Breakdown</h3>
              <div className="space-y-4 mt-4">
                 <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                   <span className="text-body-sm text-[var(--color-text-secondary)]">Total Allocated</span>
                   <span className="font-mono font-medium">${Number(data.ai_budget || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                   <span className="text-body-sm text-[var(--color-text-secondary)]">Annual ROI Impact</span>
                   <span className="font-mono font-medium text-[var(--color-success)]">+${Number(p.annual_revenue_impact || 0).toLocaleString()}</span>
                 </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Maturity */}
      {(activeTab === "maturity" || isExporting) && (
        <div id="pdf-maturity" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-12 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>5. Maturity Analysis</h2>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MaturityBar currentTier={p.maturity_tier || 1} peerAvg={2.8} />
            <GlassCard>
              <h3 className="text-h3 font-display font-semibold mb-3 text-[var(--color-navy)]">Peer Comparison</h3>
              <p className="text-body-sm leading-relaxed mb-4 text-[var(--color-text-secondary)]">
                Your current AI adoption places you in the <strong>{Number(p.peer_percentile || 0).toFixed(1)}th percentile</strong> of your industry peers. 
                Organizations at Level {p.maturity_tier || 1} typically focus on foundational data capabilities and isolated proof-of-concepts.
              </p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Roadmap */}
      {(activeTab === "roadmap" || isExporting) && (
        <div id="pdf-roadmap" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isExporting && <h2 className="text-h2 font-display font-bold mt-12 mb-4 border-b pb-2" style={{ color: "var(--color-navy)" }}>6. Implementation Roadmap</h2>}
          <GlassCard>
            <h3 className="text-h3 font-display font-semibold mb-4 text-[var(--color-navy)]">Recommended Timeline</h3>
            <div className="relative border-l-2 border-[var(--color-primary)] ml-3 space-y-8 py-2">
               <div className="relative pl-6">
                 <div className="absolute w-4 h-4 rounded-full bg-[var(--color-primary)] -left-[9px] top-1 shadow-[0_0_0_4px_rgba(41,128,185,0.2)]"></div>
                 <h4 className="font-bold text-[var(--color-navy)]">Phase 1: Foundation (Months 1-3)</h4>
                 <p className="text-sm text-[var(--color-text-secondary)] mt-1">Mitigate primary risk vectors and establish pilot KPIs.</p>
               </div>
               <div className="relative pl-6">
                 <div className="absolute w-4 h-4 rounded-full bg-gray-300 border-2 border-white -left-[9px] top-1"></div>
                 <h4 className="font-bold text-[var(--color-navy)]">Phase 2: Pilot Deployment (Months 4-6)</h4>
                 <p className="text-sm text-[var(--color-text-secondary)] mt-1">Rollout to initial department and monitor early ROI metrics.</p>
               </div>
               <div className="relative pl-6">
                 <div className="absolute w-4 h-4 rounded-full bg-gray-300 border-2 border-white -left-[9px] top-1"></div>
                 <h4 className="font-bold text-[var(--color-navy)]">Phase 3: Scale (Months 7-12)</h4>
                 <p className="text-sm text-[var(--color-text-secondary)] mt-1">Enterprise-wide adoption to capture projected annual net benefit.</p>
               </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
