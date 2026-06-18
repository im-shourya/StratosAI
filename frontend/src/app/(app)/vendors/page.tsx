"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, ExternalLink, ShieldCheck } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Vendor {
  id: string | number;
  name: string;
  category: string;
  status: string;
  desc: string;
  website_url?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/vendors')
      .then(res => {
        setVendors(res);
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
        {vendors.map((v) => (
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
            
            <Button 
              variant="glass" 
              className="w-full justify-center gap-2 mt-auto"
              onClick={() => window.open(v.website_url || '#', '_blank')}
            >
              Vendor Profile <ExternalLink size={14} />
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
