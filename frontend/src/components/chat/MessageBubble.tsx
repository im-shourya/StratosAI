import clsx from "clsx";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isLatest?: boolean;
}

/**
 * Renders a basic subset of markdown:
 * **bold**, bullet lists, and line breaks.
 */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-1.5">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^\s*[-•*]\s+(.*)$/);

    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
    } else {
      flushList();
      if (line.trim() === "") {
        // Skip consecutive blank lines
        if (elements.length > 0 && elements[elements.length - 1] !== null) {
          elements.push(<div key={`br-${i}`} className="h-2" />);
        }
      } else {
        elements.push(
          <p key={`p-${i}`} className="text-sm leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
    }
  }
  flushList();

  return elements;
}

/** Renders inline markdown: **bold** */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function MessageBubble({ role, content, isLatest = false }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={clsx(
        "flex gap-3 items-start",
        isUser ? "flex-row-reverse" : "flex-row",
        isLatest && "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm mt-0.5",
        )}
        style={{
          background: isUser
            ? "var(--color-primary)"
            : "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.1))",
          color: isUser ? "white" : "var(--color-text-secondary)",
        }}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          "max-w-[75%] px-4 py-3 rounded-2xl",
          isUser
            ? "rounded-tr-md text-white"
            : "glass glass--elevated rounded-tl-md"
        )}
        style={
          isUser
            ? { background: "var(--color-primary)" }
            : { color: "var(--color-text-primary)" }
        }
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(content)}</div>
        )}
      </div>
    </div>
  );
}
