import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-5xl font-display font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last updated: June 2026</p>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            At StratosAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our platform.
          </p>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We may collect information about you in a variety of ways. The information we may collect includes personal data, derivative data, and financial data as necessary to provide our AI strategy services.
          </p>
          <p className="mt-12 text-sm text-gray-500">
            This is a placeholder privacy policy for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
