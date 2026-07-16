"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { StatusBadge } from "@/components/StatCard";
import { SuccessModal } from "@/components/SuccessModal";
import { api } from "@/lib/api-client";
import { todayDateString } from "@/lib/time";

function to12Hour(value: string): string {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  let hours = parseInt(hStr, 10);
  const meridian = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${mStr} ${meridian}`;
}

export default function TimeLogPage() {
  const { user, logout, error: sessionError, refresh: refreshSession } = useSession();
  const { logs, refresh } = useLogs();
  const { toasts, showToast } = useToast();

  const [date, setDate] = useState(todayDateString());
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ label: string; value: string }[]>([]);

  const existingLogForDate = useMemo(
    () => logs.find((l) => l.log_date === date) ?? null,
    [logs, date]
  );

  function resetForm() {
    setTimeIn("");
    setTimeOut("");
    setRemarks("");
  }

  async function handleSave() {
    if (!timeIn && !existingLogForDate) {
      showToast("Please enter a time in.", "error");
      return;
    }

    setSaving(true);
    try {
      let logId = existingLogForDate?.id;

      if (!existingLogForDate) {
        const createRes = await api.post<{ id: string; time_in: string; log_date: string }>(
          "/api/logs",
          { logDate: date, timeIn: to12Hour(timeIn), remarks }
        );
        if (!createRes.success) {
          showToast(createRes.error, "error");
          return;
        }
        logId = createRes.data.id;

        if (!timeOut) {
          setSuccessDetails([
            { label: "Time In", value: createRes.data.time_in },
            { label: "Date", value: createRes.data.log_date },
          ]);
          setSuccessOpen(true);
          resetForm();
          await refresh();
          return;
        }
      }

      if (timeOut && logId) {
        const outRes = await api.post<{ time_in: string; time_out: string; log_date: string }>(
          "/api/logs/timeout",
          { logId, timeOut: to12Hour(timeOut), remarks }
        );
        if (!outRes.success) {
          showToast(outRes.error, "error");
          return;
        }
        setSuccessDetails([
          { label: "Time In", value: outRes.data.time_in },
          { label: "Time Out", value: outRes.data.time_out },
          { label: "Date", value: outRes.data.log_date },
        ]);
        setSuccessOpen(true);
        resetForm();
      }

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell user={user} title="Time Log" breadcrumb="Dashboard > Time Log" onLogout={logout} toasts={toasts} error={sessionError} onRetry={refreshSession}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Log Your Time</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Time In</label>
                <input
                  type="time"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  disabled={Boolean(existingLogForDate)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30 disabled:bg-gray-50 disabled:text-gray-400"
                />
                {existingLogForDate && (
                  <p className="text-xs text-muted mt-1">Already logged: {existingLogForDate.time_in}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Time Out</label>
                <input
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  disabled={existingLogForDate?.status === "Completed"}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted mb-1 block">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Enter remarks..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={resetForm}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || existingLogForDate?.status === "Completed"}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white transition-colors"
              >
                {saving ? "Saving..." : "Save Log"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 h-fit">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {date === todayDateString() ? "Today's Summary" : "Summary"}
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Time In</span>
              <span className="font-medium text-gray-900">{existingLogForDate?.time_in ?? "--:-- --"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Time Out</span>
              <span className="font-medium text-gray-900">{existingLogForDate?.time_out ?? "--:-- --"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Hours</span>
              <span className="font-medium text-gray-900">{existingLogForDate?.duration ?? "--:-- --"}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted">Status</span>
              <StatusBadge status={existingLogForDate?.status ?? "Not started"} />
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Log Saved Successfully!"
        details={successDetails}
      />
    </DashboardShell>
  );
}