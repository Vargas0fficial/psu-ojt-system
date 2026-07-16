"use client";

import { useSession } from "@/hooks/useSession";
import { useInterns } from "@/hooks/useInterns";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";

export default function SupervisorReportsPage() {
  const { user, logout, error, refresh } = useSession();
  const { interns, loading } = useInterns();
  const { toasts } = useToast();

  return (
    <DashboardShell user={user} title="Reports" breadcrumb="Dashboard > Reports" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-5xl mx-auto rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Intern Progress Overview</h3>
        {loading ? (
          <p className="text-sm text-muted py-8 text-center">Loading...</p>
        ) : interns.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No interns assigned yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {interns.map((intern) => {
              const pct = Math.min(
                100,
                Math.round((intern.totalMinutes / (intern.requiredHours * 60)) * 100)
              );
              return (
                <div key={intern.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-900">{intern.name}</span>
                    <span className="text-muted">
                      {intern.totalHoursLabel} / {intern.requiredHours}h ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}