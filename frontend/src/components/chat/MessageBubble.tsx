import clsx from "clsx";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div className={clsx("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          role === "user"
            ? "rounded-br-md text-white"
            : "glass glass--elevated rounded-bl-md"
        )}
        style={
          role === "user"
            ? { background: "var(--color-primary)" }
            : { color: "var(--color-text-primary)" }
        }
      >
        {content}
      </div>
    </div>
  );
}
