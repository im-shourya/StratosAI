import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, Shield, Brain, Activity, Search, Box, Mail, Users, FileText, CheckCircle2, Hexagon, Star, MessageSquare, Video, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans selection:bg-[#8B5CF6] selection:text-white overflow-x-hidden">
      
      {/* Floating Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-1000">
        <nav className="bg-white/70 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 px-6 py-3 flex items-center gap-8 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-black group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center transition-transform group-hover:scale-105">
              <Hexagon className="w-5 h-5 text-white fill-white" />
            </div>
            StratosAI
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#4B5563]">
            <Link href="#product" className="hover:text-black transition-colors">Product</Link>
            <Link href="#features" className="hover:text-black transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="#resources" className="hover:text-black transition-colors">Resources</Link>
          </div>
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200/50">
            <Link href="/login" className="text-sm font-semibold text-[#4B5563] hover:text-black transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-[#111111] text-white px-5 py-2.5 rounded-full hover:bg-black shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all">
              Request a Demo
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-gradient-to-b from-white to-[#F9FAFB] flex flex-col items-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Icons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-[10%] left-[20%] bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-[0_8px_30px_rgba(234,179,8,0.2)] border border-white/50 transform -rotate-6 animate-[float_6s_ease-in-out_infinite]">
            <Search className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="absolute top-[40%] left-[10%] bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(6,182,212,0.2)] border border-white/50 transform rotate-12 animate-[float_8s_ease-in-out_infinite_1s]">
            <Brain className="w-10 h-10 text-cyan-500" />
          </div>
          <div className="absolute top-[15%] right-[20%] bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(239,68,68,0.2)] border border-white/50 transform rotate-6 animate-[float_7s_ease-in-out_infinite_0.5s]">
            <Shield className="w-9 h-9 text-red-500" />
          </div>
          <div className="absolute top-[45%] right-[12%] bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgba(107,114,128,0.2)] border border-white/50 transform -rotate-12 animate-[float_9s_ease-in-out_infinite_1.5s]">
            <BarChart3 className="w-8 h-8 text-gray-700" />
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-[#A855F7] to-[#6366F1] shadow-[0_20px_60px_rgba(139,92,246,0.35)] flex items-center justify-center mb-10 transform hover:scale-105 transition-transform duration-500 relative">
            <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-white/20" />
            <CheckCircle2 className="w-16 h-16 text-white drop-shadow-md" />
          </div>
          <h1 className="font-display text-6xl md:text-[5.5rem] leading-[1.05] font-bold tracking-tighter mb-8 text-[#111111]">
            All-in-one AI<br />strategy platform
          </h1>
          <p className="text-xl md:text-2xl text-[#6B7280] mb-12 max-w-2xl font-medium leading-relaxed tracking-tight">
            StratosAI is a modern, all-in-one strategy platform<br className="hidden md:block" />designed to perfectly fit your business needs.
          </p>
          <Link href="/signup" className="text-lg font-semibold bg-gradient-to-b from-[#F05252] to-[#E02424] text-white px-10 py-4 rounded-full shadow-[0_8px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_40px_rgba(239,68,68,0.4)] hover:-translate-y-1 transition-all duration-300 ring-4 ring-red-500/10">
            Request a Demo
          </Link>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-32 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-8 border border-purple-100 shadow-inner">
            <Users className="w-10 h-10 text-[#A855F7]" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-[#111111]">
            Core AI<br />solutions
          </h2>
          <p className="text-xl text-[#6B7280] mb-12 max-w-xl font-medium leading-relaxed">
            Streamline strategy processes in one centralized<br />platform, enhancing team transparency.
          </p>
          <Link href="/about" className="text-base font-semibold bg-[#F3E8FF] text-[#7E22CE] px-8 py-4 rounded-full hover:bg-purple-200 transition-colors duration-300">
            Learn more
          </Link>
        </div>
      </section>

      {/* Built For Everyone Section */}
      <section className="py-32 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center mb-20">
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tighter mb-6">Built for everyone</h2>
          <p className="text-xl text-[#6B7280] font-medium max-w-2xl mx-auto leading-relaxed">
            Thousands of businesses, from startups to enterprises, use StratosAI to handle AI strategy.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.02)] text-left group hover:-translate-y-2 transition-all duration-300">
            <div className="h-56 bg-[#F9FAFB] rounded-3xl mb-8 flex items-center justify-center p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
              <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex gap-3 items-end h-24">
                  <div className="w-1/4 bg-blue-100 rounded-t-lg h-[40%] group-hover:h-[60%] transition-all duration-500 delay-100" />
                  <div className="w-1/4 bg-blue-300 rounded-t-lg h-[60%] group-hover:h-[80%] transition-all duration-500 delay-150" />
                  <div className="w-1/4 bg-purple-400 rounded-t-lg h-[80%] group-hover:h-[50%] transition-all duration-500 delay-200" />
                  <div className="w-1/4 bg-purple-600 rounded-t-lg h-[100%] group-hover:h-[100%] transition-all duration-500 delay-300" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">For strategy leaders</h3>
            <p className="text-[#6B7280] leading-relaxed font-medium">Use a single cloud system for your assessments, reporting and ROI processes info.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.02)] text-left group hover:-translate-y-2 transition-all duration-300">
            <div className="h-56 bg-[#F9FAFB] rounded-3xl mb-8 flex items-center justify-center p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
               <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                   <Activity className="w-6 h-6 text-orange-600" />
                 </div>
                 <span className="font-bold text-lg tracking-tight">Real-Time Insights</span>
               </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">For managers</h3>
            <p className="text-[#6B7280] leading-relaxed font-medium">Get always up-to-date data and monitor performance of the company initiatives.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.02)] text-left group hover:-translate-y-2 transition-all duration-300">
            <div className="h-56 bg-[#F9FAFB] rounded-3xl mb-8 flex items-center justify-center p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-6 transition-transform duration-500">
                <Box className="w-10 h-10 text-purple-600" />
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center absolute top-10 left-10 transform -rotate-12 group-hover:-rotate-6 transition-transform duration-500">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">For IT teams</h3>
            <p className="text-[#6B7280] leading-relaxed font-medium">StratosAI helps technical teams by streamlining architecture, managing vendors and deployments.</p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-32 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
            <Box className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tighter mb-20">
            Integrate with your existing<br />tools in seconds
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-16">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.02)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 animate-[float_7s_ease-in-out_infinite_0s]">
              <Mail className="w-10 h-10 text-red-500" />
            </div>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.02)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 animate-[float_6s_ease-in-out_infinite_1s]">
              <Video className="w-8 h-8 text-green-500" />
            </div>
            <div className="w-28 h-28 bg-white rounded-[2rem] shadow-[0_16px_50px_rgba(0,0,0,0.1)] border border-[rgba(0,0,0,0.02)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 z-10 animate-[float_8s_ease-in-out_infinite_0.5s]">
              <MessageSquare className="w-12 h-12 text-blue-600" />
            </div>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.02)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 animate-[float_7s_ease-in-out_infinite_1.5s]">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.02)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 animate-[float_9s_ease-in-out_infinite_2s]">
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold tracking-tight mb-4">Seamless integration</h3>
          <p className="text-xl text-[#6B7280] font-medium">Connect StratosAI with the tools you already use every day.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center mb-20">
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tighter mb-6">Words of Appreciation</h2>
          <p className="text-xl text-[#6B7280] font-medium">
            Thousands of businesses, from startups to enterprises, use StratosAI.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-14 rounded-[3rem] shadow-[0_12px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center relative group hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 bg-white rounded-full p-2 shadow-xl border border-gray-50">
                <div className="w-full h-full bg-gradient-to-tr from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-600 font-display font-bold text-2xl">
                  SM
                </div>
              </div>
            </div>
            <div className="pt-10" />
            <h4 className="text-2xl font-bold mb-2 tracking-tight">Sarah Mitchell</h4>
            <p className="text-[#6B7280] font-medium mb-8">VP of Strategy at Nexa Solutions</p>
            <div className="flex justify-center gap-1.5 mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-2xl text-[#4B5563] italic leading-relaxed font-medium max-w-3xl mx-auto">
              "StratosAI has streamlined our strategic processes, making tasks like adoption tracking more efficient. It helps us stay organized and saves our team time, allowing us to focus more on supporting our employees."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-32 pb-16 overflow-hidden border-t border-[rgba(0,0,0,0.05)] relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-32">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-black mb-6">
                <Hexagon className="w-6 h-6 text-black fill-black" />
                StratosAI
              </Link>
              <p className="text-[#6B7280] font-medium max-w-sm leading-relaxed text-lg">
                StratosAI is the AI platform that builds a thriving workplace culture—all in one place.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-6 tracking-tight">Product</h5>
              <ul className="space-y-4 text-[#6B7280] font-medium">
                <li><Link href="#" className="hover:text-black transition-colors">CoreAI</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Recruit</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Perform</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Pulse</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-6 tracking-tight">Features</h5>
              <ul className="space-y-4 text-[#6B7280] font-medium">
                <li><Link href="#" className="hover:text-black transition-colors">Desk</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Time</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-6 tracking-tight">Resources</h5>
              <ul className="space-y-4 text-[#6B7280] font-medium">
                <li><Link href="#" className="hover:text-black transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Massive Blurred Text */}
        <div className="absolute -bottom-[2vw] left-0 right-0 text-center pointer-events-none select-none overflow-hidden h-[30vw]">
          <h2 className="font-display text-[22vw] font-bold tracking-tighter text-[#EF4444] opacity-[0.85] blur-[3px] leading-none whitespace-nowrap">
            StratosAI
          </h2>
        </div>
      </footer>
    </div>
  );
}
