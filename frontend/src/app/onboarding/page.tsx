import Link from "next/link";
import Image from "next/image";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  { stat: "80%", label: "of AI implementations fail to deliver expected ROI" },
  { stat: "90%", label: "of enterprises adopt AI, but only 40% see EBITDA impact" },
  { stat: "48hrs", label: "from assessment to your board-ready strategic report" },
];

export default function OnboardingWelcome() {
  return (
    <AuthLayout>
      <div className="w-full max-w-[460px] mx-auto z-10 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <GlassCard elevated className="p-8 md:p-10 w-full">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] flex items-center justify-center mb-6">
              <Image src="/logo.png" alt="StratosAI" width={36} height={36} />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--color-navy)" }}>
              Welcome to StratosAI
            </h1>
            <p className="text-sm px-2" style={{ color: "var(--color-text-secondary)" }}>
              Your AI strategy advisor -- benchmarked against 10,000+ corporate decisions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {SLIDES.map((s, i) => (
              <GlassCard key={i} className="p-4 flex flex-col items-center text-center justify-center bg-white shadow-sm border border-[rgba(0,0,0,0.03)]" style={{ background: "rgba(255, 255, 255, 1)" }}>
                <p className="font-display text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--color-primary)" }}>{s.stat}</p>
                <p className="text-[10px] leading-tight font-medium opacity-80" style={{ color: "var(--color-text-secondary)" }}>{s.label}</p>
              </GlassCard>
            ))}
          </div>

          <Link href="/onboarding/profile">
            <Button size="lg" className="w-full gap-2 text-base rounded-2xl">
              Get Started <ArrowRight size={18} />
            </Button>
          </Link>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}
