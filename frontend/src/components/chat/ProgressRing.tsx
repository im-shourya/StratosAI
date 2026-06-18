interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
}

export function ProgressRing({ current, total, size = 64 }: ProgressRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? current / total : 0;
  const progress = pct * circumference;
  const offset = circumference - progress;

  // Color transitions: gray → warning → success
  let strokeColor = "var(--color-text-tertiary)";
  if (pct >= 1) {
    strokeColor = "var(--color-success)";
  } else if (pct >= 0.5) {
    strokeColor = "var(--color-warning)";
  } else if (pct > 0) {
    strokeColor = "var(--color-primary)";
  }

  let textColor = strokeColor;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={4}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute text-xs font-mono font-semibold tabular-nums transition-colors duration-500"
        style={{ color: textColor }}
      >
        {current}/{total}
      </span>
    </div>
  );
}
