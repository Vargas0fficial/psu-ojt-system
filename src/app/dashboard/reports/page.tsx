"use client";

import { useMemo } from "react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Clock3, TrendingUp, CalendarRange } from "lucide-react";
import { computeDurationMinutesClient } from "@/lib/duration-client";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export default function ReportsPage() {
  const { user, logout, error, refresh } = useSession();
  const { logs, summary } = useLogs();
  const { toasts } = useToast();

  const monthly = useMemo(() => {
    const groups = new Map<string, number>();
    for (const log of logs) {
      if (!log.time_out) continue;
      const monthKey = log.log_date.slice(0, 7);
      const minutes = computeDurationMinutesClient(log.time_in, log.time_out);
      groups.set(monthKey, (groups.get(monthKey) ?? 0) + minutes);
    }
    return Array.from(groups.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, minutes]) => {
        const label = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        return { month, label, minutes };
      });
  }, [logs]);

  const requiredHours = summary?.requiredHours ?? 486;
  const totalMinutes = summary?.totalMinutes ?? 0;
  const progressPct = Math.min(100, Math.round((totalMinutes / (requiredHours * 60)) * 100));
  const remainingMinutes = Math.max(0, requiredHours * 60 - totalMinutes);

  return (
    <DashboardShell user={user} title="Reports" breadcrumb="Dashboard > Reports" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Hours Completed"
            value={summary?.totalHoursLabel ?? "0h 00m"}
            sublabel={`of ${requiredHours}h required`}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Hours Remaining"
            value={formatMinutes(remainingMinutes)}
            accent="gold"
          />
          <StatCard
            icon={<CalendarRange className="h-5 w-5" />}
            label="Completed Days"
            value={String(logs.filter((l) => l.status === "Completed").length)}
            accent="success"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">OJT Progress</h3>
            <span className="text-sm font-medium text-navy-800">{progressPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No completed logs yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {monthly.map((m) => (
                <div key={m.month} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-gray-700">{m.label}</span>
                  <span className="font-medium text-gray-900">{formatMinutes(m.minutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
