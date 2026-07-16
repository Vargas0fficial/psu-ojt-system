"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

export function ChangePasswordForm({
  onResult,
}: {
  onResult: (message: string, kind: "success" | "error") => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onResult("New passwords do not match.", "error");
      return;
    }
    setSubmitting(true);
    const res = await api.post("/api/auth/change-password", { currentPassword, newPassword });
    setSubmitting(false);
    if (!res.success) {
      onResult(res.error, "error");
      return;
    }
    onResult("Password updated successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 max-w-sm">
      <div>
        <label className="text-xs text-muted mb-1 block">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
        />
      </div>
      <div>
        <label className="text-xs text-muted mb-1 block">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
        />
      </div>
      <div>
        <label className="text-xs text-muted mb-1 block">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="self-start px-5 py-2.5 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white transition-colors mt-1"
      >
        {submitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
