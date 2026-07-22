"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Flag, RotateCcw } from "lucide-react";
import { Modal } from "./Modal";
import { formatDateLabel } from "@/lib/time";
import type { LogRow, ApprovalStatus } from "@/lib/types";

export function ReviewLogModal({
  open,
  log,
  onClose,
  onSave,
}: {
  open: boolean;
  log: LogRow | null;
  onClose: () => void;
  onSave: (approvalStatus: ApprovalStatus, remark: string) => Promise<void>;
}) {
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState<ApprovalStatus | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync remark field to the log being reviewed
    if (log) setRemark(log.supervisorRemark ?? "");
  }, [log]);

  async function handleSave(status: ApprovalStatus) {
    setSaving(status);
    await onSave(status, remark);
    setSaving(null);
  }

  if (!log) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Review Log</h2>
      <p className="text-sm text-muted mb-4">
        {formatDateLabel(log.log_date)} &middot; {log.time_in ?? "-"} to {log.time_out ?? "-"} &middot; {log.duration}
      </p>

      <label className="text-xs text-muted mb-1 block">Remark (optional)</label>
      <textarea
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        rows={3}
        placeholder="e.g. Please double-check your time out next time."
        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30 resize-none mb-4"
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleSave("approved")}
          disabled={saving !== null}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-success-600 hover:bg-success-600/90 disabled:opacity-60 text-white transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving === "approved" ? "Saving..." : "Approve"}
        </button>
        <button
          onClick={() => handleSave("flagged")}
          disabled={saving !== null}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors"
        >
          <Flag className="h-4 w-4" />
          {saving === "flagged" ? "Saving..." : "Flag"}
        </button>
        {log.approvalStatus !== "pending" && (
          <button
            onClick={() => handleSave("pending")}
            disabled={saving !== null}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-60 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </Modal>
  );
}