import clsx from "clsx";

type StatusType = "connected" | "not_connected" | "error" | "high" | "medium" | "low" | "active" | "completed" | "pending";

const statusStyles: Record<StatusType, string> = {
  connected:     "bg-emerald-100/60 text-emerald-700",
  active:        "bg-emerald-100/60 text-emerald-700",
  completed:     "bg-blue-100/60 text-blue-700",
  not_connected: "bg-gray-100/60 text-gray-700",
  pending:       "bg-amber-100/60 text-amber-700",
  error:         "bg-red-100/60 text-red-700",
  high:          "bg-red-100/60 text-red-700",
  medium:        "bg-amber-100/60 text-amber-700",
  low:           "bg-emerald-100/60 text-emerald-700",
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
        "inline-flex items-center px-3 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold",
        statusStyles[status],
        className
      )}
    >
      {label || statusLabels[status]}
    </span>
  );
}
