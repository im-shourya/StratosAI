"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MeshBackground } from "@/components/MeshBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "", password: "", company_name: "", industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetchApi("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      localStorage.setItem("token", response.access_token);
      setMessage("Account created! Redirecting...");
      window.location.href = "/onboarding";
    } catch (error: any) {
      setMessage(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[var(--color-bg-page)]">
      <MeshBackground />

      <div className="w-full max-w-[420px] mx-auto z-10 py-8">
        <GlassCard elevated className="p-8 md:p-10 w-full">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] flex items-center justify-center mb-6">
              <Image src="/logo.png" alt="StratosAI" width={36} height={36} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--color-navy)" }}>
              Create Your Account
            </h1>
            <p className="text-body-sm px-2" style={{ color: "var(--color-text-secondary)" }}>
              Start exploring exciting data insights and strategic AI deployments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <GlassInput
              name="company_name"
              label="Company Name*"
              type="text"
              placeholder="Acme Corp"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
            <GlassInput
              name="email"
              label="Email address*"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <GlassInput
              name="password"
              label="Password*"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="mt-1 mb-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full text-base tracking-wide rounded-2xl">
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>

          {message && (
            <div
              className="mt-4 p-3 rounded-xl text-sm font-medium text-center"
              style={{
                background: message.includes("created") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color: message.includes("created") ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {message}
            </div>
          )}

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[rgba(0,0,0,0.06)]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Or continue with</span>
            <div className="h-px flex-1 bg-[rgba(0,0,0,0.06)]" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="glass" className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.71 22.36 9.98H12V14.27H17.92C17.67 15.66 16.89 16.83 15.72 17.62V20.4H19.28C21.36 18.48 22.56 15.63 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.4L15.72 17.62C14.73 18.28 13.48 18.68 12 18.68C9.13 18.68 6.7 16.74 5.82 14.13H2.15V16.98C3.96 20.58 7.68 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.13C5.59 13.45 5.46 12.74 5.46 12C5.46 11.26 5.59 10.55 5.82 9.87V7.02H2.15C1.4 8.52 1 10.21 1 12C1 13.79 1.4 15.48 2.15 16.98L5.82 14.13Z" fill="#FBBC05"/>
                <path d="M12 5.32C13.62 5.32 15.07 5.88 16.21 6.96L19.36 3.81C17.46 2.05 14.97 1 12 1C7.68 1 3.96 3.42 2.15 7.02L5.82 9.87C6.7 7.26 9.13 5.32 12 5.32Z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="glass" className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-navy)" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28C15.82 22.06 14.53 23.82 12.59 23.82C10.61 23.82 9.98 22.61 7.74 22.61C5.47 22.61 4.77 23.78 2.89 23.82C0.87 23.86 -0.59 21.6 0.22 19.39C1.3 16.42 3.44 12.98 5.76 12.95C7.62 12.92 9.17 14.2 10.37 14.2C11.58 14.2 13.41 12.69 15.54 12.72C16.48 12.75 18.9 13.09 20.47 15.42C20.35 15.51 17.5 17.18 17.5 20.33C17.5 24.08 21.03 25.5 21.07 25.52C21.02 25.64 18.28 35 12.6 35C9.4 35 6.9 33.15 5.5 33.15C4.05 33.15 1.15 35 1.15 35M16 8.35C16.92 7.21 17.56 5.61 17.39 4C15.99 4.06 14.28 4.96 13.33 6.1C12.48 7.12 11.72 8.79 11.93 10.37C13.5 10.49 15.08 9.49 16 8.35Z" />
              </svg>
              Apple
            </Button>
          </div>

          <p className="text-center text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold" style={{ color: "var(--color-navy)" }}>
              Sign In
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
