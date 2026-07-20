"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { AvatarUpload } from "@/components/AvatarUpload";
import { formatDateLabel } from "@/lib/time";
import { api } from "@/lib/api-client";

type Supervisor = { id: string; name: string };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, error, refresh } = useSession();
  const { summary } = useLogs();
  const { toasts, showToast } = useToast();

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Supervisor[]>("/api/supervisors").then((res) => {
      if (res.success) setSupervisors(res.data);
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync dropdown to loaded user data
    setSelectedId(user?.supervisorId ?? "");
  }, [user?.supervisorId]);

  const currentSupervisor = supervisors.find((s) => s.id === user?.supervisorId);
  const hasChanges = selectedId !== (user?.supervisorId ?? "");

  async function handleSaveSupervisor() {
    setSaving(true);
    const res = await api.post("/api/auth/supervisor", { supervisorId: selectedId || null });
    setSaving(false);
    if (!res.success) {
      showToast(res.error, "error");
      return;
    }
    showToast("Supervisor updated.", "success");
    await refresh();
  }

  return (
    <DashboardShell user={user} title="OJT Profile" breadcrumb="Dashboard > OJT Profile" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4 mb-6">
            <AvatarUpload
              name={user?.name ?? ""}
              avatar={user?.avatar ?? null}
              onChange={refresh}
              onResult={showToast}
            />
            <div>
              <h3 className="text-base font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-muted">{user?.course || "OJT Trainee"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Email" value={user?.email ?? "-"} />
            <Field label="Course / Program" value={user?.course || "Not set"} />
            <Field
              label="OJT Start Date"
              value={user?.ojtStartDate ? formatDateLabel(user.ojtStartDate) : "Not set"}
            />
            <Field label="Required Hours" value={`${user?.requiredHours ?? 486} hours`} />
            <Field label="Total Hours Rendered" value={summary?.totalHoursLabel ?? "0h 00m"} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Supervisor</h3>
          <p className="text-sm text-muted mb-4">
            {currentSupervisor
              ? `Currently assigned to ${currentSupervisor.name}.`
              : "You don't have a supervisor assigned yet."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="text-xs text-muted mb-1 block">Select Supervisor</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
              >
                <option value="">No supervisor</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSaveSupervisor}
              disabled={saving || !hasChanges}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {supervisors.length === 0 && (
            <p className="text-xs text-muted mt-3">
              No supervisor accounts exist yet — ask your supervisor to create one first.
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}