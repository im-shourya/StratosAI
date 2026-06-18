"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", response.access_token);
      setMessage("Login successful! Redirecting...");
      window.location.href = "/dashboard";
    } catch (error: any) {
      setMessage(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await fetchApi("/api/auth/oauth", {
        method: "POST",
        body: JSON.stringify({ email: user.email, uid: user.uid }),
      });
      localStorage.setItem("token", response.access_token);
      setMessage("Login successful! Redirecting...");
      window.location.href = "/dashboard";
    } catch (error: any) {
      setMessage(error.message || "Google sign-in failed");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px] mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <GlassCard elevated className="p-8 md:p-10 w-full">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] flex items-center justify-center mb-6">
              <Image src="/logo.png" alt="StratosAI" width={36} height={36} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--color-navy)" }}>
              Welcome Back
            </h1>
            <p className="text-body-sm px-2" style={{ color: "var(--color-text-secondary)" }}>
              Sign in to access your intelligent, personalized corporate strategy plans.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <GlassInput
              label="Email address*"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <GlassInput
              label="Password*"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex items-center justify-between mt-1 mb-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer group" style={{ color: "var(--color-text-secondary)" }}>
                <div className="w-4 h-4 rounded border border-[rgba(0,0,0,0.2)] group-hover:border-[var(--color-primary)] transition-colors" />
                Remember me
              </label>
              <Link href="#" className="hover:text-[var(--color-primary)] transition-colors" style={{ color: "var(--color-text-tertiary)" }}>
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full text-base tracking-wide rounded-2xl">
              {loading ? "Authenticating..." : "Sign in"}
            </Button>
          </form>

          {message && (
            <div
              className="mt-4 p-3 rounded-xl text-sm font-medium text-center"
              style={{
                background: message.includes("successful") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color: message.includes("successful") ? "var(--color-success)" : "var(--color-danger)",
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

          <div className="mb-6">
            <Button variant="glass" onClick={handleGoogleSignIn} type="button" className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.71 22.36 9.98H12V14.27H17.92C17.67 15.66 16.89 16.83 15.72 17.62V20.4H19.28C21.36 18.48 22.56 15.63 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.4L15.72 17.62C14.73 18.28 13.48 18.68 12 18.68C9.13 18.68 6.7 16.74 5.82 14.13H2.15V16.98C3.96 20.58 7.68 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.13C5.59 13.45 5.46 12.74 5.46 12C5.46 11.26 5.59 10.55 5.82 9.87V7.02H2.15C1.4 8.52 1 10.21 1 12C1 13.79 1.4 15.48 2.15 16.98L5.82 14.13Z" fill="#FBBC05"/>
                <path d="M12 5.32C13.62 5.32 15.07 5.88 16.21 6.96L19.36 3.81C17.46 2.05 14.97 1 12 1C7.68 1 3.96 3.42 2.15 7.02L5.82 9.87C6.7 7.26 9.13 5.32 12 5.32Z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold" style={{ color: "var(--color-navy)" }}>
              Sign up
            </Link>
          </p>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}
