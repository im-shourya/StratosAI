import clsx from "clsx";

type StatusType = "connected" | "not_connected" | "error" | "high" | "medium" | "low" | "active" | "completed" | "pending";

const statusStyles: Record<StatusType, string> = {
  connected:     "bg-[rgba(29,158,117,0.12)] text-[var(--color-success)] border-[rgba(29,158,117,0.25)]",
  active:        "bg-[rgba(29,158,117,0.12)] text-[var(--color-success)] border-[rgba(29,158,117,0.25)]",
  completed:     "bg-[rgba(41,128,185,0.12)] text-[var(--color-primary)] border-[rgba(41,128,185,0.25)]",
  not_connected: "bg-[rgba(156,163,180,0.12)] text-[var(--color-text-tertiary)] border-[rgba(156,163,180,0.25)]",
  pending:       "bg-[rgba(212,172,13,0.12)] text-[var(--color-warning)] border-[rgba(212,172,13,0.25)]",
  error:         "bg-[rgba(192,57,43,0.12)] text-[var(--color-danger)] border-[rgba(192,57,43,0.25)]",
  high:          "bg-[rgba(192,57,43,0.12)] text-[var(--color-danger)] border-[rgba(192,57,43,0.25)]",
  medium:        "bg-[rgba(212,172,13,0.12)] text-[var(--color-warning)] border-[rgba(212,172,13,0.25)]",
  low:           "bg-[rgba(29,158,117,0.12)] text-[var(--color-success)] border-[rgba(29,158,117,0.25)]",
};

const statusLabels: Record<StatusType, string> = {
  connected: "Connected",
  not_connected: "Not connected",
  error: "Error",
  high: "High",
  medium: "Medium",
  low: "Low",
  active: "Active",
  completed: "Completed",
  pending: "Pending",
};

interface StatusPillProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {label || statusLabels[status]}
    </span>
  );
}
