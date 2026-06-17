"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskRadar } from "@/components/dashboard/RiskRadar";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { Link2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface DashboardMetrics {
  totalProjectedRoi: string;
  departmentsEngaged: string;
  completedProjects: string;
}

interface BudgetItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [budget, setBudget] = useState<BudgetItem[]>([]);

  useEffect(() => {
    fetchApi('/api/dashboard/metrics')
      .then(res => setMetrics(res))
      .catch(console.error);
      
    fetchApi('/api/dashboard/budget')
      .then(res => setBudget(res))
      .catch(console.error);
  }, []);

  if (!metrics) return <div className="max-w-[1400px] mx-auto space-y-6 animate-pulse bg-gray-50/50 h-screen rounded-3xl" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-display font-bold tracking-tight" style={{ color: "var(--color-navy)" }}>Overview</h1>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.03)] hover:bg-[rgba(0,0,0,0.06)] transition-colors border border-[rgba(0,0,0,0.05)]">
            <Link2 size={16} style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>
      </div>

      {/* Top Grid: Pipeline and ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Chart */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <PipelineChart />
        </div>

        {/* Total Projected ROI */}
        <div className="lg:col-span-1 flex flex-col">
          <KpiCard
            label="Total Projected ROI"
            value={metrics.totalProjectedRoi}
            trend={{ direction: "up", value: "15%" }}
          >
            <div className="space-y-4">
              {budget.length === 0 ? (
                <div className="text-sm text-gray-400">No budget data available</div>
              ) : (
                budget.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span style={{ color: "var(--color-text-secondary)" }}>{item.name}</span>
                      <span style={{ color: "var(--color-navy)" }}>${item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-white border border-gray-100 shadow-sm rounded-full overflow-hidden p-[1.5px]">
                      <div className="h-full rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]" style={{ width: `${item.percentage}%`, background: `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 2px, ${item.color}99 2px, ${item.color}99 6px)` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </KpiCard>
        </div>

      </div>

      {/* Bottom Grid: Remaining Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Radar */}
        <div className="lg:col-span-1">
          <GlassCard className="h-full flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Risk Profile</h3>
             </div>
             <div className="flex-1 -mx-4 -mb-4">
               <RiskRadar />
             </div>
          </GlassCard>
        </div>

        {/* Stacked KPIs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <KpiCard
            label="Departments Engaged"
            value={metrics.departmentsEngaged}
          >
             <div className="flex justify-end text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>vs last period </span>
                <span className="font-medium ml-2" style={{ color: "var(--color-navy)" }}>+2</span>
             </div>
          </KpiCard>
          <KpiCard
            label="Completed Projects"
            value={metrics.completedProjects}
          >
             <div className="flex justify-end text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>vs last period </span>
                <span className="font-medium ml-2" style={{ color: "var(--color-navy)" }}>+5</span>
             </div>
          </KpiCard>
        </div>

        {/* Gradient Insights Card */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-3xl p-6 flex flex-col justify-between text-white relative overflow-hidden" 
               style={{ background: "linear-gradient(135deg, #1A4685, #2980B9, #5DADE2)", boxShadow: "var(--shadow-glass)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-8">
                ✨ Insights
              </span>
              <h2 className="text-6xl font-display font-bold mb-4 tracking-tight">75%</h2>
              <p className="text-lg font-medium leading-snug mb-2">
                Implementation rate increased by 4% compared to last week.
              </p>
              <p className="text-sm text-blue-100">
                This improvement reduced time-to-value by 950 hours and is projected to recover $12,400.
              </p>
            </div>
            
            <div className="mt-8 relative z-10 flex items-center justify-between">
              <div className="h-1 flex-1 bg-white/30 rounded-full mr-4">
                <div className="h-full bg-white w-[75%] rounded-full relative">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
