import Link from "next/link";
import Image from "next/image";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AboutPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <MeshBackground />

      <header className="glass glass--elevated sticky top-4 z-50 mx-4 md:mx-8 px-6 py-3 flex items-center justify-between" style={{ borderRadius: "var(--radius-xl)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="StratosAI" width={32} height={32} />
          <span className="font-display text-lg font-semibold" style={{ color: "var(--color-navy)" }}>StratosAI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/about" className="text-[var(--color-primary)] transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-[rgba(41,128,185,0.06)]" style={{ color: "var(--color-primary)" }}>
            Log in
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-navy)" }}>
          The Intelligence Behind Your AI Strategy
        </h1>
        <p className="text-lg mb-16" style={{ color: "var(--color-text-secondary)" }}>
          StratosAI was built by Group 1 at SRM Insider to bridge the gap between AI hype and enterprise reality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16">
          <GlassCard className="space-y-4">
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--color-navy)" }}>Our Mission</h3>
            <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              To democratize enterprise AI strategy. We believe that every organization should have access to top-tier strategic planning without paying millions to legacy consulting firms.
            </p>
          </GlassCard>
          <GlassCard className="space-y-4">
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--color-navy)" }}>The Methodology</h3>
            <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Our platform uses a combination of 5 machine learning models (XGBoost, K-Means) and real-time LLM analysis to evaluate your company against 10,000+ benchmarked data points.
            </p>
          </GlassCard>
        </div>

        <GlassCard elevated className="text-left">
          <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy)" }}>Built by Group 1, SRM Insider</h3>
          <p className="text-body-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>June 2026 Cohort</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass p-4 rounded-xl">
              <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>Machine Learning Engine</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>FastAPI, Python, Scikit-Learn</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>Real-time Gateway</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>NestJS, Socket.io, Prisma</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>Liquid Glass Frontend</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Next.js 16, React 19, Tailwind v4</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>Databases</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>PostgreSQL, MongoDB</p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
