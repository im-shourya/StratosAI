"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProgressRing } from "@/components/chat/ProgressRing";
import { DataCollectionTracker } from "@/components/chat/DataCollectionTracker";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles, PanelRightOpen, PanelRightClose } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { io, Socket } from "socket.io-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CompletionStatus {
  fields: Array<{
    key: string;
    label: string;
    description: string;
    unit: string;
    collected: boolean;
    value: number | null;
    raw_answer: string | null;
  }>;
  collectedCount: number;
  totalCount: number;
  pct: number;
  isComplete: boolean;
  missingFields: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [showTracker, setShowTracker] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // 1. Fetch chat history + completion status
    fetchApi(`/api/assessments/${id}`)
      .then(res => {
        const history = res.chat_history || [];
        // Filter out system messages for display
        const displayMsgs = history.filter((m: any) => m.role !== 'system');
        setMessages(displayMsgs);
        
        // Set completion status from the server
        if (res.completion_status) {
          setCompletionStatus(res.completion_status);
        }
      })
      .catch(console.error);

    // 2. Connect to Socket.IO
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to ChatGateway");
    });

    socket.on("receiveMessage", (msg: any) => {
      setMessages(prev => [...prev, { role: msg.role, content: msg.content }]);
      setIsTyping(false);

      // Update completion status from the message payload
      if (msg.completion_status) {
        setCompletionStatus(msg.completion_status);
      }
    });

    // Real-time field extraction updates
    socket.on("fieldUpdate", (status: CompletionStatus) => {
      setCompletionStatus(status);
    });

    // All fields collected
    socket.on("assessmentReady", (data: any) => {
      if (data.completion_status) {
        setCompletionStatus(data.completion_status);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setIsTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleSend = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
    setIsTyping(true);

    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        assessmentId: id,
        message: content
      });
    }
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    try {
      await fetchApi(`/api/assessments/${id}/analyze`, { method: 'POST' });
      router.push(`/assessment/${id}/report`);
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Failed to analyze assessment. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const isComplete = completionStatus?.isComplete ?? false;
  const collectedCount = completionStatus?.collectedCount ?? 0;
  const totalCount = completionStatus?.totalCount ?? 6;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-2 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Link href="/dashboard" className="text-body-sm font-medium flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium hidden sm:inline" style={{ color: "var(--color-text-secondary)" }}>
            {isComplete ? "Ready for Analysis" : "Collecting Data"}
          </span>
          <ProgressRing current={collectedCount} total={totalCount} size={40} />
          <button
            onClick={() => setShowTracker(!showTracker)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(0,0,0,0.04)] md:hidden"
            style={{ color: "var(--color-text-secondary)" }}
            title={showTracker ? "Hide tracker" : "Show tracker"}
          >
            {showTracker ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </div>

      {/* Main content: Chat + Sidebar */}
      <div className="flex-1 flex gap-4 mb-4 overflow-hidden min-h-0">
        {/* Chat area */}
        <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                isLatest={i === messages.length - 1}
              />
            ))}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <div
                  className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.1))",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Sparkles size={14} />
                </div>
                <div className="glass glass--elevated px-4 py-3 rounded-2xl rounded-tl-md">
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="p-4"
            style={{
              background: "rgba(255,255,255,0.4)",
              borderTop: "1px solid rgba(255,255,255,0.5)",
              backdropFilter: "blur(24px)",
            }}
          >
            {isComplete ? (
              <div className="flex flex-col items-center justify-center py-3 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={28} className="mb-2 text-[var(--color-success)]" />
                <p className="text-body-sm mb-1 font-medium" style={{ color: "var(--color-text-primary)" }}>
                  All data points captured
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  Your ML-powered strategic report is ready to generate.
                </p>
                <Button size="lg" className="w-full sm:w-auto" onClick={handleGenerateReport} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running ML Models...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles size={16} />
                      Generate Strategic Report
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <ChatInput onSend={handleSend} disabled={isTyping || messages.length === 0} />
            )}
          </div>
        </GlassCard>

        {/* Sidebar: Data Collection Tracker */}
        <div
          className={`w-64 shrink-0 transition-all duration-300 ${
            showTracker ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none hidden"
          } hidden md:block`}
        >
          <DataCollectionTracker completionStatus={completionStatus} />
        </div>
      </div>

      {/* Mobile tracker (slide-up panel) */}
      {showTracker && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom duration-300 bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-gray-100 pb-24 max-h-[75vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
             <h3 className="font-semibold text-lg" style={{ color: "var(--color-navy)" }}>Data Collection</h3>
             <button onClick={() => setShowTracker(false)} className="text-gray-400 hover:text-gray-600 font-medium text-sm px-2 py-1 bg-gray-100 rounded-full">Close</button>
          </div>
          <div className="overflow-y-auto flex-1 -mx-2 px-2 pb-8">
             <DataCollectionTracker completionStatus={completionStatus} />
          </div>
        </div>
      )}
    </div>
  );
}
