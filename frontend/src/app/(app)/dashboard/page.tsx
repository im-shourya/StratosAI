"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskRadar } from "@/components/dashboard/RiskRadar";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            <Calendar size={16} />
            <span>Jan 01 - July 31</span>
          </div>
          <span className="text-sm font-medium px-2" style={{ color: "var(--color-text-tertiary)" }}>compared to</span>
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            <Calendar size={16} />
            <span>Aug 01 - Dec 31</span>
          </div>
          <Button variant="glass" className="gap-2 shrink-0">
            Add widget <Plus size={16} />
          </Button>
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
            value="$41,540"
            trend={{ direction: "up", value: "15%" }}
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span style={{ color: "var(--color-text-secondary)" }}>Automation</span>
                  <span style={{ color: "var(--color-navy)" }}>$26,800</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-success)] w-[65%] rounded-full" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span style={{ color: "var(--color-text-secondary)" }}>Machine Learning</span>
                  <span style={{ color: "var(--color-navy)" }}>$10,400</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] w-[25%] rounded-full" />
                </div>
              </div>
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
            label="Active Vendors"
            value="106k"
          >
             <div className="flex justify-end text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>vs last period </span>
                <span className="font-medium ml-2" style={{ color: "var(--color-navy)" }}>+34,002</span>
             </div>
          </KpiCard>
          <KpiCard
            label="Models Deployed"
            value="1,284"
          >
             <div className="flex justify-end text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>vs last period </span>
                <span className="font-medium ml-2" style={{ color: "var(--color-navy)" }}>+320</span>
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
