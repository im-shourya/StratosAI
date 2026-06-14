"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProgressRing } from "@/components/chat/ProgressRing";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MSG: Message = {
  role: "assistant",
  content: "Hello! I'm Stratos, your AI strategy advisor. To build your roadmap, I'll ask you a few questions about your current data infrastructure and business goals. Let's start with a high-level view: What is the primary business problem you are hoping to solve with AI?"
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const totalQuestions = 14;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (content: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: "user", content }]);
    setIsTyping(true);

    // Mock AI response delay
    setTimeout(() => {
      setIsTyping(false);
      setQuestionCount(prev => Math.min(prev + 1, totalQuestions));
      
      if (questionCount >= totalQuestions - 1) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Thank you. I have enough information to generate your comprehensive AI strategy report. Please click 'Generate Report' to view the results." 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Got it. Next question: How is your data currently structured? Are you using a centralized data warehouse, data lake, or mostly siloed databases?" 
        }]);
      }
    }, 1500);
  };

  const isComplete = questionCount >= totalQuestions;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pt-2 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Link href="/assessments" className="text-body-sm font-medium flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]">
          <ArrowLeft size={16} /> Back to Assessments
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Phase 1: Discovery</span>
          <ProgressRing current={questionCount} total={totalQuestions} size={40} />
        </div>
      </div>

      {/* Chat Area */}
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

        {/* Input Area */}
        <div className="p-4 bg-[rgba(255,255,255,0.3)] border-t border-[rgba(255,255,255,0.4)] backdrop-blur-md">
          {isComplete ? (
            <div className="flex flex-col items-center justify-center py-2">
              <CheckCircle2 size={32} className="mb-2 text-[var(--color-success)]" />
              <p className="text-body-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Assessment data collection complete.</p>
              <Link href="/assessment/1/report">
                <Button size="lg" className="w-full sm:w-auto">Generate Strategic Report</Button>
              </Link>
            </div>
          ) : (
            <ChatInput onSend={handleSend} disabled={isTyping} />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
