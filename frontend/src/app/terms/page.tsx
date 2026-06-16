import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-5xl font-display font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last updated: June 2026</p>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using StratosAI, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
          </p>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            StratosAI provides an automated AI strategy consulting platform for enterprises, including tools for ROI forecasting, readiness evaluation, and roadmap generation.
          </p>
          <p className="mt-12 text-sm text-gray-500">
            This is a placeholder terms of service document for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
