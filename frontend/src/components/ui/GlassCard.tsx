import { ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  tint?: "roi" | "risk" | "budget" | "maturity" | "none";
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  tint = "none",
  elevated = false,
  interactive = false,
  className,
  style,
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl p-5",
        tint !== "none" && `glass--${tint}`,
        elevated && "glass--elevated",
        interactive && "glass--interactive",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
