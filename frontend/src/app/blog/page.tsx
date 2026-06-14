import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-5xl font-display font-bold mb-12">StratosAI Blog</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-sm font-semibold text-purple-600 mb-4 inline-block">AI Strategy</span>
            <h2 className="text-2xl font-bold mb-4">Building a Board-Ready AI Roadmap in 2026</h2>
            <p className="text-gray-600 mb-6">Learn how to translate technical capabilities into strategic business value for your executive team.</p>
            <span className="text-sm text-gray-400">June 12, 2026</span>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-sm font-semibold text-blue-600 mb-4 inline-block">Product Update</span>
            <h2 className="text-2xl font-bold mb-4">Introducing Predictive ROI Analytics</h2>
            <p className="text-gray-600 mb-6">Our new pipeline charts help you instantly visualize where your AI initiatives are generating the most value.</p>
            <span className="text-sm text-gray-400">June 5, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
