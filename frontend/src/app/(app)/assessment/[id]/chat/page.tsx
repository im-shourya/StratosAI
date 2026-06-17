"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProgressRing } from "@/components/chat/ProgressRing";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { io, Socket } from "socket.io-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const totalQuestions = 7; 
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
    // 1. Fetch chat history
    fetchApi(`/api/assessments/${id}`)
      .then(res => {
        const history = res.chat_history || [];
        // Filter out system messages for display
        const displayMsgs = history.filter((m: any) => m.role !== 'system');
        setMessages(displayMsgs);
        
        // Count how many assistant messages (questions) there are
        const assistantMsgs = displayMsgs.filter((m: any) => m.role === 'assistant');
        setQuestionCount(assistantMsgs.length);
      })
      .catch(console.error);

    // 2. Connect to Socket.IO
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to ChatGateway");
    });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      setQuestionCount(prev => prev + 1);
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

  const isComplete = questionCount >= totalQuestions;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pt-2 md:pt-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <Link href="/dashboard" className="text-body-sm font-medium flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Phase 1: Discovery</span>
          <ProgressRing current={Math.min(questionCount, totalQuestions)} total={totalQuestions} size={40} />
        </div>
      </div>

      <GlassCard className="flex-1 flex flex-col mb-4 overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass glass--elevated px-4 py-3 rounded-2xl rounded-bl-md">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[rgba(255,255,255,0.3)] border-t border-[rgba(255,255,255,0.4)] backdrop-blur-md">
          {isComplete ? (
            <div className="flex flex-col items-center justify-center py-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={32} className="mb-2 text-[var(--color-success)]" />
              <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Assessment data collection complete.</p>
              <Button size="lg" className="w-full sm:w-auto" onClick={handleGenerateReport} disabled={isAnalyzing}>
                {isAnalyzing ? "Running ML Models..." : "Generate Strategic Report"}
              </Button>
            </div>
          ) : (
            <ChatInput onSend={handleSend} disabled={isTyping || messages.length === 0} />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
