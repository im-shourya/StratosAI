"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = value.length;
  const showCharCount = charCount > 100;

  return (
    <div className="space-y-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-end gap-2"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="glass-input py-3 pr-10 resize-none min-h-[48px] max-h-[160px] leading-relaxed"
            disabled={disabled}
            rows={1}
          />
          {showCharCount && (
            <span
              className="absolute bottom-2 right-3 text-[10px] font-mono tabular-nums select-none pointer-events-none"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {charCount}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all duration-200 disabled:opacity-40 hover:brightness-110 active:scale-95"
          style={{
            background: "var(--color-primary)",
            boxShadow: "0 2px 8px rgba(17, 24, 39, 0.2)",
          }}
        >
          <Send size={16} />
        </button>
      </form>
      <div className="flex justify-end px-1">
        <span
          className="text-[10px] flex items-center gap-1 select-none"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <CornerDownLeft size={10} />
          Enter to send · Shift+Enter for newline
        </span>
      </div>
    </div>
  );
}
