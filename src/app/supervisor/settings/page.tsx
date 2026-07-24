"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { AvatarUpload } from "@/components/AvatarUpload";
import { api } from "@/lib/api-client";

export default function SupervisorSettingsPage() {
    const { user, logout, error, refresh } = useSession();
    const { toasts, showToast } = useToast();

    const [requiredHours, setRequiredHours] = useState("");
    const [savingHours, setSavingHours] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sync input to loaded user data
        setRequiredHours(user?.requiredHours ? String(user.requiredHours) : "");
    }, [user?.requiredHours]);

    const hoursHasChanges = requiredHours !== (user?.requiredHours ? String(user.requiredHours) : "");

    async function handleSaveHours() {
        setSavingHours(true);
        const res = await api.post("/api/auth/required-hours", { requiredHours: Number(requiredHours) });
        setSavingHours(false);
        if (!res.success) {
            showToast(res.error, "error");
            return;
        }
        showToast("Required OJT hours updated.", "success");
        await refresh();
    }

    return (
        <DashboardShell user={user} title="Settings" breadcrumb="Dashboard > Settings" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Photo</h3>
                    <AvatarUpload
                        name={user?.name ?? ""}
                        avatar={user?.avatar ?? null}
                        onChange={refresh}
                        onResult={showToast}
                    />
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Required OJT Hours</h3>
                    <p className="text-sm text-muted mb-4">
                        This is the number of hours interns need to complete once they select you as
                        their supervisor. Existing interns keep their current target unless they
                        re-select you.
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={1}
                            max={5000}
                            value={requiredHours}
                            onChange={(e) => setRequiredHours(e.target.value)}
                            className="w-32 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
                        />
                        <span className="text-sm text-muted">hours</span>
                        {hoursHasChanges && (
                            <button
                                onClick={handleSaveHours}
                                disabled={savingHours}
                                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white transition-colors"
                            >
                                {savingHours ? "Saving..." : "Save"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                    <ChangePasswordForm onResult={showToast} />
                </div>
            </div>
        </DashboardShell>
    );
}