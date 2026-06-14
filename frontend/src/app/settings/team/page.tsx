"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { GlassInput, GlassSelect } from "@/components/ui/GlassInput";
import { StatusPill } from "@/components/ui/StatusPill";

const TEAM = [
  { id: 1, name: "Alex Chen", email: "alex@acmefintech.com", role: "Admin", status: "active" as const },
  { id: 2, name: "Sarah Jenkins", email: "sarah@acmefintech.com", role: "Editor", status: "active" as const },
  { id: 3, name: "Michael Chang", email: "mchang@acmefintech.com", role: "Viewer", status: "pending" as const },
];

export default function TeamSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Team Management</h2>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Manage who has access to your assessments and reports.</p>
        </div>
      </div>

      <GlassCard className="space-y-4">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Invite Member</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <GlassInput label="Email Address" placeholder="colleague@company.com" />
          </div>
          <div className="w-full sm:w-48">
            <GlassSelect 
              label="Role" 
              options={[
                { value: "admin", label: "Admin" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" }
              ]} 
            />
          </div>
          <Button className="w-full sm:w-auto mt-2 sm:mt-0">Send Invite</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="glass border-b border-[rgba(180,195,220,0.2)]">
              <tr>
                <th className="py-3 px-4 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>User</th>
                <th className="py-3 px-4 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>Role</th>
                <th className="py-3 px-4 text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>Status</th>
                <th className="py-3 px-4 text-xs font-medium text-right" style={{ color: "var(--color-text-tertiary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((member) => (
                <tr key={member.id} className="border-b border-[rgba(180,195,220,0.1)] last:border-0">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>{member.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{member.email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>{member.role}</td>
                  <td className="py-3 px-4"><StatusPill status={member.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
