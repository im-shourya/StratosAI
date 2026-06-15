"use client";

import { useState } from "react";
import Link from "next/link";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput, GlassSelect } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

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
  const [selectedSize, setSelectedSize] = useState("");

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
          <GlassInput label="Company Name" placeholder="Acme Corp" />
          <GlassSelect label="Industry" options={INDUSTRIES} />

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
          <Link href="/onboarding/theme">
            <Button size="lg" className="gap-2">
              Continue <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
