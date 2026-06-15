"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your response..."
        className="glass-input flex-1 py-3"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all disabled:opacity-40"
        style={{
          background: "var(--color-primary)",
          boxShadow: "0 2px 8px rgba(41,128,185,0.25)",
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
}
