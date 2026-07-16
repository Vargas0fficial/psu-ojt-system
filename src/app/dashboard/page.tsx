"use client";

import { Clock3, CalendarCheck2, BadgeCheck, LogIn, LogOut } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard, StatusBadge } from "@/components/StatCard";
import { LogTable } from "@/components/LogTable";
import { SuccessModal } from "@/components/SuccessModal";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout, error, refresh } = useSession();
  const { logs, summary, loading, timeIn, timeOut } = useLogs();
  const { toasts, showToast } = useToast();
  const [successOpen, setSuccessOpen] = useState(false);
  const [successPayload, setSuccessPayload] = useState<{ title: string; details: { label: string; value: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const todayLog = summary?.todayLog ?? null;
  const isTimedIn = todayLog && todayLog.status === "Time In";

  async function handleTimeIn() {
    setBusy(true);
    const res = await timeIn();
    setBusy(false);
    if (!res.success) {
      showToast(res.error, "error");
      return;
    }
    setSuccessPayload({
      title: "Time In Recorded!",
      details: [
        { label: "Time In", value: res.data.time_in ?? "-" },
        { label: "Date", value: res.data.log_date },
      ],
    });
    setSuccessOpen(true);
  }

  async function handleTimeOut() {
    if (!todayLog) return;
    setBusy(true);
    const res = await timeOut(todayLog.id);
    setBusy(false);
    if (!res.success) {
      showToast(res.error, "error");
      return;
    }
    showToast("Time out recorded. Great work today!", "success");
  }

  return (
    <DashboardShell user={user} title="Dashboard" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-6xl mx-auto flex flex-col gap-5">
        <div className="rounded-xl bg-gradient-to-r from-navy-900 to-navy-700 text-white p-5 sm:p-6">
          <p className="text-white/70 text-sm">Welcome back,</p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-0.5">{user?.name ?? "..."}</h2>
          <p className="text-white/60 text-sm mt-1">
            {user?.course ?? "OJT Trainee"} &middot; OJT Trainee
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Total Hours"
            value={summary?.totalHoursLabel ?? "0h 00m"}
            sublabel={`of ${summary?.requiredHours ?? 486}h required`}
          />
          <StatCard
            icon={<CalendarCheck2 className="h-5 w-5" />}
            label="Logs This Week"
            value={String(summary?.logsThisWeek ?? 0)}
            sublabel="Days Logged"
            accent="gold"
          />
          <StatCard
            icon={<BadgeCheck className="h-5 w-5" />}
            label="OJT Status"
            value={isTimedIn ? "On Going" : "Ready"}
            sublabel={user?.ojtStartDate ? `Since ${user.ojtStartDate}` : undefined}
            accent="success"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Time Log</h3>
            <Link href="/dashboard/time-log" className="text-xs text-navy-800 hover:underline">
              Open full time log &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <p className="text-xs text-muted">Current Status</p>
              <div className="mt-1">
                <StatusBadge status={todayLog?.status ?? "Not started"} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Time In</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{todayLog?.time_in ?? "--:-- --"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Time Out</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{todayLog?.time_out ?? "--:-- --"}</p>
            </div>
            <div className="sm:ml-auto">
              {isTimedIn ? (
                <button
                  onClick={handleTimeOut}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Time Out
                </button>
              ) : (
                <button
                  onClick={handleTimeIn}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 text-sm font-medium px-5 py-2.5 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Time In
                </button>
              )}
            </div>
          </div>
          {!isTimedIn && !todayLog && (
            <p className="text-xs text-muted mt-3">Don&apos;t forget to time in when you arrive.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recent Logs</h3>
            <Link href="/dashboard/my-logs" className="text-xs text-navy-800 hover:underline">
              View All Logs
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted py-6 text-center">Loading logs...</p>
          ) : (
            <LogTable logs={logs.slice(0, 5)} />
          )}
        </div>
      </div>

      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={successPayload?.title ?? "Log Saved Successfully!"}
        details={successPayload?.details}
      />
    </DashboardShell>
  );
}
