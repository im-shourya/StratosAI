"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";

export default function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Account Settings</h2>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Update your personal information and company details.</p>
      </div>

      <GlassCard className="space-y-6">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput label="First Name" defaultValue="Alex" />
          <GlassInput label="Last Name" defaultValue="Chen" />
          <GlassInput label="Email Address" type="email" defaultValue="alex@acmefintech.com" className="sm:col-span-2" />
        </div>
        <div className="pt-2 flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Company Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput label="Company Name" defaultValue="Acme Fintech Ltd" className="sm:col-span-2" />
          <GlassInput label="Industry" defaultValue="Financial Services" disabled />
          <GlassInput label="Region" defaultValue="North America" disabled />
        </div>
        <div className="pt-2 flex justify-end">
          <Button size="sm">Update Company</Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6" tint="risk">
        <h3 className="font-semibold" style={{ color: "var(--color-danger)" }}>Danger Zone</h3>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Permanently delete your account and all assessment data.</p>
        <div className="pt-2">
          <Button variant="danger" size="sm">Delete Account</Button>
        </div>
      </GlassCard>
    </div>
  );
}
