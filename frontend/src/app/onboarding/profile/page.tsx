"use client";

import { useState } from "react";
import Link from "next/link";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput, GlassSelect } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { COUNTRIES, MAIN_MARKET_COUNTRIES } from "@/lib/countries";

const INDUSTRIES = [
  { value: "Technology", label: "Technology" },
  { value: "Financial Services", label: "Financial Services" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Other", label: "Other" },
];

const SIZES = ["<50", "50-200", "200-1000", "1000-5000", "5000+"];

export default function OnboardingProfile() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    industry: "Technology",
    country: "US",
    main_market_country: "Global"
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await fetchApi('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: formData.company_name,
          country: formData.country,
          main_market_country: formData.main_market_country
        })
      });
      router.push('/onboarding/theme');
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Proceeding anyway.");
      router.push('/onboarding/theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MeshBackground />
      <GlassCard elevated className="max-w-lg w-full p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-body-sm font-medium" style={{ color: "var(--color-primary)" }}>Step 2 of 3</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--color-navy)" }}>
          Company Profile
        </h1>
        <p className="text-body-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          This helps us pre-fill your assessment and find the right benchmarks.
        </p>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jane" />
            <GlassInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" />
          </div>
          <GlassInput label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Acme Corp" />
          <GlassSelect label="Industry" name="industry" value={formData.industry} onChange={handleChange} options={INDUSTRIES} />
          
          <div className="grid grid-cols-2 gap-4">
            <GlassSelect label="Company Country" name="country" value={formData.country} onChange={handleChange} options={COUNTRIES} />
            <GlassSelect label="Main Market" name="main_market_country" value={formData.main_market_country} onChange={handleChange} options={MAIN_MARKET_COUNTRIES} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Company Size (Employees)
            </label>
            <div className="segmented w-full flex">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`segmented__option flex-1 text-center ${selectedSize === size ? "segmented__option--active" : ""}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link href="/onboarding">
            <Button variant="ghost">Back</Button>
          </Link>
          <Button size="lg" className="gap-2" onClick={handleContinue} disabled={saving}>
            {saving ? 'Saving...' : 'Continue'} <ArrowRight size={16} />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
