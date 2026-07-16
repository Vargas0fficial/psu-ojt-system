export function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  accent?: "default" | "success" | "gold";
}) {
  const iconBg =
    accent === "success"
      ? "bg-success-50 text-success-600"
      : accent === "gold"
      ? "bg-gold-500/15 text-gold-600"
      : "bg-navy-900/5 text-navy-800";

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-semibold text-gray-900 leading-tight mt-0.5">{value}</p>
        {sublabel && <p className="text-xs text-muted mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: "Time In" | "Completed" | string }) {
  const isCompleted = status === "Completed";
  return (
    <span
      key={status}
      className={`animate-status-pop inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isCompleted ? "bg-success-50 text-success-600" : "bg-gold-500/15 text-gold-600"
      }`}
    >
      {status}
    </span>
  );
}
