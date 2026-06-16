"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Search, ExternalLink, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface UseCase {
  id: string;
  title: string;
  category: string;
  impact: string;
  cost: string;
  desc: string;
}

export default function LibraryPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/benchmarks/use-cases')
      .then(res => {
        setUseCases(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto space-y-6 animate-pulse h-screen bg-gray-50/50 rounded-3xl" />;
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>Use Case Library</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Explore 500+ curated AI use cases benchmarked for enterprise ROI.
          </p>
        </div>
      </div>

      <GlassCard className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Search by industry, technology, or department..." className="glass-input pl-10 w-full" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {useCases.map((uc) => (
          <GlassCard key={uc.id} interactive className="flex flex-col h-full hover:border-[var(--color-primary)] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2 py-1 rounded-md glass" style={{ color: "var(--color-text-secondary)" }}>
                {uc.category}
              </span>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="text-[var(--color-success)]">ROI: {uc.impact}</span>
                <span className="text-[var(--color-warning)]">Cost: {uc.cost}</span>
              </div>
            </div>
            
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--color-navy)" }}>{uc.title}</h3>
            <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "var(--color-text-secondary)" }}>{uc.desc}</p>
            
            <Button variant="ghost" className="w-full justify-between mt-auto">
              View Benchmark Data <ArrowRight size={14} />
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
