"use client";

import Link from "next/link";
import { Users, Clock3, TrendingUp } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useInterns } from "@/hooks/useInterns";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";

export default function SupervisorDashboardPage() {
  const { user, logout, error, refresh } = useSession();
  const { interns, loading } = useInterns();
  const { toasts } = useToast();

  const totalHoursThisWeek = interns.reduce((sum, i) => sum + i.logsThisWeek, 0);
  const avgMinutes = interns.length
    ? Math.round(interns.reduce((sum, i) => sum + i.totalMinutes, 0) / interns.length)
    : 0;

  return (
    <DashboardShell user={user} title="Dashboard" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-6xl mx-auto flex flex-col gap-5">
        <div className="rounded-xl bg-gradient-to-r from-navy-900 to-navy-700 text-white p-5 sm:p-6">
          <p className="text-white/70 text-sm">Welcome back,</p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-0.5">{user?.name ?? "..."}</h2>
          <p className="text-white/60 text-sm mt-1">{user?.department || "OJT Supervisor"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Interns Supervised"
            value={String(interns.length)}
          />
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Logs This Week"
            value={String(totalHoursThisWeek)}
            sublabel="across all interns"
            accent="gold"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Avg. Hours per Intern"
            value={`${Math.floor(avgMinutes / 60)}h ${(avgMinutes % 60).toString().padStart(2, "0")}m`}
            accent="success"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My Interns</h3>
            <Link href="/supervisor/interns" className="text-xs text-navy-800 hover:underline">
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted py-8 text-center">Loading interns...</p>
          ) : interns.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No interns assigned yet. Interns can select you as their supervisor when they create their account.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {interns.slice(0, 5).map((intern) => (
                <Link
                  key={intern.id}
                  href={`/supervisor/interns?intern=${intern.id}`}
                  className="flex items-center justify-between py-3 hover:bg-surface/60 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-semibold">
                      {intern.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{intern.name}</p>
                      <p className="text-xs text-muted">{intern.course || "OJT Trainee"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{intern.totalHoursLabel}</p>
                    <p className="text-xs text-muted">of {intern.requiredHours}h</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}