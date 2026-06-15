"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, ExternalLink, ShieldCheck } from "lucide-react";

const VENDORS = [
  { id: 1, name: "Databricks", category: "Data Infrastructure", status: "Verified", desc: "Unified analytics platform for massive scale data engineering, collaborative data science, and machine learning." },
  { id: 2, name: "Snowflake", category: "Data Infrastructure", status: "Verified", desc: "Cloud data platform enabling data storage, processing, and analytic solutions that are faster, easier to use, and far more flexible." },
  { id: 3, name: "Anthropic", category: "Foundation Models", status: "Verified", desc: "AI safety and research company building reliable, interpretable, and steerable AI systems (Claude)." },
  { id: 4, name: "Scale AI", category: "Data Labeling", status: "Partner", desc: "High-quality training data for AI applications, combining human intelligence with machine learning." },
  { id: 5, name: "Hugging Face", category: "MLOps", status: "Verified", desc: "The AI community building the future. Build, train and deploy state of the art models powered by the reference open source in machine learning." },
  { id: 6, name: "DataRobot", category: "AutoML", status: "Verified", desc: "Enterprise AI platform that democratizes data science and automates the end-to-end process for building, deploying, and maintaining machine learning." },
];

export default function VendorsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>Vendor Ecosystem</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Explore our curated network of 1,200+ verified enterprise AI vendors.
          </p>
        </div>
      </div>

      <GlassCard className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Search vendors by name or capability..." className="glass-input pl-10 w-full" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VENDORS.map((v) => (
          <GlassCard key={v.id} interactive className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2 py-1 rounded-md glass" style={{ color: "var(--color-text-secondary)" }}>
                {v.category}
              </span>
              {v.status === "Verified" && (
                <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--color-primary)" }}>
                  <ShieldCheck size={12} /> Verified
                </div>
              )}
            </div>
            
            <h3 className="font-display font-semibold text-xl mb-2" style={{ color: "var(--color-navy)" }}>{v.name}</h3>
            <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "var(--color-text-secondary)" }}>{v.desc}</p>
            
            <Button variant="glass" className="w-full justify-center gap-2 mt-auto">
              Vendor Profile <ExternalLink size={14} />
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
