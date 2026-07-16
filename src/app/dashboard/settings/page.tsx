"use client";

import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default function SettingsPage() {
  const { user, logout, error, refresh } = useSession();
  const { toasts, showToast } = useToast();

  return (
    <DashboardShell user={user} title="Settings" breadcrumb="Dashboard > Settings" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
      <div className="max-w-3xl mx-auto rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
        <ChangePasswordForm onResult={showToast} />
      </div>
    </DashboardShell>
  );
}
