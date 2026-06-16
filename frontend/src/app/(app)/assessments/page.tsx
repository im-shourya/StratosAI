"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface AssessmentItem {
  id: string;
  company: string; // Keep this name in frontend interface for now if we want, or change it
  project_name: string;
  department: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  date: string;
  roi: string;
  progress: number;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [department, setDepartment] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchApi('/api/assessments')
      .then(res => {
        setAssessments(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const res = await fetchApi('/api/assessments/start', {
        method: 'POST',
        body: JSON.stringify({
          project_name: projectName || "New Project",
          department: department || "Unknown"
        })
      });
      if (res.assessment_id) {
        router.push(`/assessment/${res.assessment_id}/chat`);
      }
    } catch (err) {
      console.error("Failed to start assessment:", err);
      setIsStarting(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto space-y-6 animate-pulse h-screen bg-gray-50/50 rounded-3xl" />;
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-display font-bold" style={{ color: "var(--color-navy)" }}>Assessments</h1>
          <p className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage and view all your strategic AI assessments.
          </p>
        </div>
        <Button size="md" className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Assessment
        </Button>
      </div>

      <GlassCard className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Search assessments..." className="glass-input pl-10 w-full" />
        </div>
        <Button variant="glass" className="gap-2 shrink-0">
          <Filter size={16} /> Filter
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No assessments found. Click "New Assessment" to start your first one!
          </div>
        ) : assessments.map((a) => (
          <GlassCard key={a.id} interactive className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <StatusPill status={a.status} />
              <span className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{a.date}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg mb-1" style={{ color: "var(--color-navy)" }}>{a.project_name}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>{a.department}</p>
            </div>

            <div className="mt-auto space-y-4">
              {a.status === "completed" ? (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--color-text-secondary)" }}>Projected ROI</p>
                    <p className="font-mono font-medium text-lg" style={{ color: "var(--color-primary)" }}>{a.roi}</p>
                  </div>
                  <Link href={`/assessment/${a.id}/report`}>
                    <Button variant="glass" size="sm">View Report</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-secondary)" }}>Progress</span>
                    <span className="font-mono" style={{ color: "var(--color-primary)" }}>{a.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-white border border-gray-100 shadow-sm rounded-full overflow-hidden p-[1.5px]">
                    <div 
                      className="h-full rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] transition-all duration-700"
                      style={{ 
                        width: `${a.progress}%`, 
                        background: a.status === "error" 
                          ? "repeating-linear-gradient(45deg, #EF4444, #EF4444 2px, #F87171 2px, #F87171 6px)" 
                          : "repeating-linear-gradient(45deg, #3B82F6, #3B82F6 2px, #60A5FA 2px, #60A5FA 6px)" 
                      }}
                    />
                  </div>
                  <div className="pt-2">
                    <Link href={`/assessment/${a.id}/chat`}>
                      <Button variant={a.status === "error" ? "danger" : "primary"} size="sm" className="w-full">
                        {a.status === "error" ? "Resolve Error" : "Continue Assessment"}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* New Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
          <GlassCard className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-display" style={{ color: "var(--color-navy)" }}>Start New Assessment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStartAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="e.g. Churn Prediction Model"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="e.g. Customer Success"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="glass" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isStarting}>
                  {isStarting ? "Starting..." : "Start Assessment"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
