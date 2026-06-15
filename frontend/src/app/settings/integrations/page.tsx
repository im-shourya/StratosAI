"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Server, HardDrive, Key } from "lucide-react";

export default function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Integrations</h2>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Connect StratosAI with your existing workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass">
              <MessageSquare size={20} style={{ color: "var(--color-text-primary)" }} />
            </div>
            <StatusPill status="connected" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--color-navy)" }}>Slack / Teams</h3>
            <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Receive assessment completion notifications via webhook.</p>
          </div>
          <Button variant="glass" size="sm" className="mt-auto w-max">Configure</Button>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass">
              <Key size={20} style={{ color: "var(--color-text-primary)" }} />
            </div>
            <StatusPill status="not_connected" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--color-navy)" }}>Developer API</h3>
            <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Access assessment data programmatically via REST API.</p>
          </div>
          <Button size="sm" className="mt-auto w-max">Generate API Key</Button>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass">
              <HardDrive size={20} style={{ color: "var(--color-text-primary)" }} />
            </div>
            <StatusPill status="not_connected" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--color-navy)" }}>Google Drive Export</h3>
            <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Automatically export PDF reports to a shared team folder.</p>
          </div>
          <Button size="sm" className="mt-auto w-max">Connect Google Drive</Button>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass">
              <Server size={20} style={{ color: "var(--color-text-primary)" }} />
            </div>
            <StatusPill status="connected" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--color-navy)" }}>Vendor Data Sync</h3>
            <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Daily sync of the vendor marketplace capability scores.</p>
            <p className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>Last sync: 2 hours ago</p>
          </div>
          <Button variant="glass" size="sm" className="mt-auto w-max" disabled>Managed by Admin</Button>
        </GlassCard>

      </div>
    </div>
  );
}
