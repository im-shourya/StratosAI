import Link from "next/link";
import Image from "next/image";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, BarChart3, Shield, Brain, DollarSign } from "lucide-react";

const STATS = [
  { value: "80%", label: "of AI implementations fail to deliver expected ROI" },
  { value: "90%", label: "of enterprises adopt AI, but only 40% see EBITDA impact" },
  { value: "48hrs", label: "from assessment to your board-ready strategic report" },
];

const FEATURES = [
  { icon: BarChart3, title: "ROI Forecasting", desc: "XGBoost-powered 12 and 36-month ROI projections benchmarked against your industry.", color: "#2980B9" },
  { icon: Shield, title: "Risk Assessment", desc: "Multi-dimensional risk radar scoring Technical, Financial, Talent, Regulatory, and Market risks.", color: "#C0392B" },
  { icon: Brain, title: "Maturity Analysis", desc: "K-Means clustering maps your organization against peer benchmarks across 5 maturity tiers.", color: "#6C3483" },
  { icon: DollarSign, title: "Budget Optimization", desc: "Linear programming engine recommends mathematically optimal capital deployment across initiatives.", color: "#1D9E75" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <MeshBackground />

      {/* Nav */}
      <header className="glass glass--elevated sticky top-4 z-50 mx-4 md:mx-8 px-6 py-3 flex items-center justify-between" style={{ borderRadius: "var(--radius-xl)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="StratosAI" width={32} height={32} />
          <span className="font-display text-lg font-semibold" style={{ color: "var(--color-navy)" }}>StratosAI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-[rgba(41,128,185,0.06)]" style={{ color: "var(--color-primary)" }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2.5 rounded-xl text-white transition-all hover:brightness-110"
            style={{ background: "var(--color-primary)", boxShadow: "0 2px 10px rgba(41,128,185,0.3)" }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(41,128,185,0.08)", color: "var(--color-primary)" }}>
          Powered by 5 ML Models and Real-Time LLM Analysis
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--color-navy)" }}>
          AI Strategy Intelligence<br />
          <span style={{ color: "var(--color-primary)" }}>for the Enterprise</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Stop guessing. StratosAI guides your organization through an adaptive AI assessment, then delivers a data-driven strategic roadmap your board will trust.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-medium transition-all hover:brightness-110 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", boxShadow: "0 4px 20px rgba(41,128,185,0.3)" }}
          >
            Start Free Assessment <ArrowRight size={18} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium glass transition-all hover:bg-[var(--glass-bg-elevated)]"
            style={{ color: "var(--color-text-primary)" }}
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Stats Row */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <GlassCard key={i} className="text-center">
              <p className="font-display text-3xl font-bold mb-1" style={{ color: "var(--color-primary)" }}>{stat.value}</p>
              <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: "var(--color-navy)" }}>
          Enterprise-Grade AI Assessment
        </h2>
        <p className="text-center text-body mb-12 max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          Five specialized machine learning models work together to deliver actionable intelligence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <GlassCard key={f.title} interactive>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${f.color}15`, color: f.color }}>
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1" style={{ color: "var(--color-navy)" }}>{f.title}</h3>
                  <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{f.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(180,195,220,0.2)] py-8 text-center">
        <p className="text-body-sm" style={{ color: "var(--color-text-tertiary)" }}>
          StratosAI -- Built by Group 1, SRM Insider. June 2026.
        </p>
      </footer>
    </div>
  );
}
