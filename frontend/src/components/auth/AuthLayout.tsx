"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MeshBackground } from "@/components/MeshBackground";
import { Search, Brain, Shield, BarChart3, Hexagon } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Intelligent Corporate Strategy",
      description: "Harness the power of AI to align your teams and drive measurable ROI across all departments.",
      icon: <Brain className="w-12 h-12 text-cyan-500" />,
      color: "from-cyan-500/20 to-blue-500/20",
    },
    {
      title: "Enterprise Grade Security",
      description: "Bank-level encryption and strict access controls ensure your sensitive corporate data is always protected.",
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Real-Time ROI Analytics",
      description: "Monitor the exact financial impact of your initiatives with beautiful, up-to-the-minute dashboards.",
      icon: <BarChart3 className="w-12 h-12 text-emerald-500" />,
      color: "from-emerald-500/20 to-teal-500/20",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen flex w-full bg-[var(--color-bg-page)] relative overflow-hidden">
      {/* Mobile Background */}
      <div className="absolute inset-0 lg:hidden">
        <MeshBackground />
      </div>

      {/* Left Panel: Slider (Hidden on Mobile, 50% width on Desktop) */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden border-r border-[rgba(0,0,0,0.05)] bg-white/50">
        <MeshBackground />
        
        {/* Floating Abstract Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr ${slides[activeSlide].color} blur-[100px] transition-colors duration-1000 opacity-60`} />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-[#A855F7] fill-purple-100" />
          <span className="font-display text-2xl font-bold tracking-tight text-black">StratosAI</span>
        </div>

        {/* Center Mockup / Glass Panel */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-lg mx-auto">
          <div className="w-full aspect-square bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 flex flex-col items-center justify-center text-center transition-all duration-700 transform hover:scale-[1.02]">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 transform transition-transform duration-500">
              {slides[activeSlide].icon}
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight mb-4 text-[#111111] leading-tight transition-all duration-500">
              {slides[activeSlide].title}
            </h2>
            <p className="text-lg text-[#6B7280] font-medium leading-relaxed max-w-sm transition-all duration-500">
              {slides[activeSlide].description}
            </p>
          </div>
        </div>

        {/* Bottom Navigation Dots */}
        <div className="relative z-10 flex items-center gap-3 w-full max-w-lg mx-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeSlide === idx ? "w-8 bg-black" : "w-3 bg-black/10 hover:bg-black/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Panel: Form Area (100% width on Mobile, 50% width on Desktop) */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
