"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { GlassSelect } from "@/components/ui/GlassInput";
import { COUNTRIES, MAIN_MARKET_COUNTRIES } from "@/lib/countries";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  country: string;
  main_market_country: string;
  plan_tier: string;
}

export default function AccountSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi('/api/auth/me')
      .then(res => {
        setProfile(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetchApi('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          company_name: profile.company_name,
          country: profile.country,
          main_market_country: profile.main_market_country
        })
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-6 animate-pulse bg-gray-50/50 h-screen rounded-3xl" />;
  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Account Settings</h2>
        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Update your personal information and company details.</p>
      </div>

      <GlassCard className="space-y-6">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput name="first_name" label="First Name" value={profile.first_name || ''} onChange={handleChange} />
          <GlassInput name="last_name" label="Last Name" value={profile.last_name || ''} onChange={handleChange} />
          <GlassInput name="email" label="Email Address" type="email" value={profile.email || ''} onChange={handleChange} className="sm:col-span-2" />
        </div>
        <div className="pt-2 flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <h3 className="font-semibold" style={{ color: "var(--color-navy)" }}>Company Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput name="company_name" label="Company Name" value={profile.company_name || ''} onChange={handleChange} className="sm:col-span-2" />
          <GlassSelect name="country" label="Company Country" value={profile.country || 'US'} onChange={handleChange as any} options={COUNTRIES} />
          <GlassSelect name="main_market_country" label="Main Market" value={profile.main_market_country || 'Global'} onChange={handleChange as any} options={MAIN_MARKET_COUNTRIES} />
          <GlassInput label="Industry" defaultValue="Technology" disabled />
          <GlassInput label="Plan Tier" value={profile.plan_tier || 'free'} disabled />
        </div>
        <div className="pt-2 flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Company'}
          </Button>
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
