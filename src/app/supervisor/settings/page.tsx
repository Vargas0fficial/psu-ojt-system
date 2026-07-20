"use client";

import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { AvatarUpload } from "@/components/AvatarUpload";

export default function SupervisorSettingsPage() {
    const { user, logout, error, refresh } = useSession();
    const { toasts, showToast } = useToast();

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
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                    <ChangePasswordForm onResult={showToast} />
                </div>
            </div>
        </DashboardShell>
    );
}