"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { LogTable } from "@/components/LogTable";
import { EditLogModal } from "@/components/EditLogModal";
import type { LogRow } from "@/lib/types";

export default function MyLogsPage() {
  const { user, logout, error, refresh } = useSession();
  const { logs, loading, updateLog, deleteLog } = useLogs();
  const { toasts, showToast } = useToast();
  const [editingLog, setEditingLog] = useState<LogRow | null>(null);

  async function handleSave(fields: {
    log_date: string;
    time_in: string;
    time_out: string;
    remarks: string;
  }) {
    if (!editingLog) return;
    const res = await updateLog(editingLog.id, fields);
    if (!res.success) {
      showToast(res.error, "error");
      return;
    }
    showToast("Log updated successfully.", "success");
    setEditingLog(null);
  }

  async function handleDelete(log: LogRow) {
    if (!confirm(`Delete the log for ${log.log_date}? This cannot be undone.`)) return;
    const res = await deleteLog(log.id);
    if (!res.success) {
      showToast(res.error, "error");
      return;
    }
    showToast("Log deleted.", "info");
  }

  return (
    <DashboardShell user={user} title="My Logs" breadcrumb="Dashboard > My Logs" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-5xl mx-auto rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">All Time Logs</h3>
        {loading ? (
          <p className="text-sm text-muted py-8 text-center">Loading logs...</p>
        ) : (
          <LogTable logs={logs} onEdit={setEditingLog} onDelete={handleDelete} />
        )}
      </div>

      <EditLogModal
        open={Boolean(editingLog)}
        log={editingLog}
        onClose={() => setEditingLog(null)}
        onSave={handleSave}
      />
    </DashboardShell>
  );
}
