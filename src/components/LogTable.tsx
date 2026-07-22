"use client";

import { Pencil, Trash2, AlertTriangle, MessageSquareText } from "lucide-react";
import { StatusBadge } from "./StatCard";
import { formatDateLabel, todayDateString } from "@/lib/time";
import type { LogRow, ApprovalStatus } from "@/lib/types";

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  pending: "bg-gray-100 text-gray-500",
  approved: "bg-success-50 text-success-600",
  flagged: "bg-red-50 text-red-600",
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  flagged: "Flagged",
};

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[status]}`}>
      {APPROVAL_LABELS[status]}
    </span>
  );
}

export function LogTable({
  logs,
  onEdit,
  onDelete,
  onReview,
  showApproval = false,
  emptyMessage = "No time logs yet.",
}: {
  logs: LogRow[];
  onEdit?: (log: LogRow) => void;
  onDelete?: (log: LogRow) => void;
  onReview?: (log: LogRow) => void;
  showApproval?: boolean;
  emptyMessage?: string;
}) {
  const editable = Boolean(onEdit || onDelete || onReview);
  const today = todayDateString();

  if (logs.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted border-b border-border">
            <th className="py-2.5 px-4 sm:px-2 font-medium">Date</th>
            <th className="py-2.5 px-2 font-medium">Time In</th>
            <th className="py-2.5 px-2 font-medium">Time Out</th>
            <th className="py-2.5 px-2 font-medium">Total Hours</th>
            <th className="py-2.5 px-2 font-medium">Status</th>
            {showApproval && <th className="py-2.5 px-2 font-medium">Approval</th>}
            {editable && <th className="py-2.5 px-2 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const isIncomplete = log.status === "Time In" && log.log_date !== today;
            return (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="py-3 px-4 sm:px-2 whitespace-nowrap text-gray-900">
                  {formatDateLabel(log.log_date)}
                </td>
                <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.time_in ?? "-"}</td>
                <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.time_out ?? "-"}</td>
                <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.duration}</td>
                <td className="py-3 px-2 whitespace-nowrap">
                  {isIncomplete ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600"
                      title="Time In recorded but never timed out."
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Incomplete
                    </span>
                  ) : (
                    <StatusBadge status={log.status} />
                  )}
                </td>
                {showApproval && (
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <ApprovalBadge status={log.approvalStatus} />
                      {log.supervisorRemark && (
                        <span title={log.supervisorRemark}>
                          <MessageSquareText className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      )}
                    </div>
                  </td>
                )}
                {editable && (
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-1">
                      {onReview && (
                        <button
                          onClick={() => onReview(log)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-navy-800 hover:bg-navy-900/5"
                        >
                          Review
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(log)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-navy-800 hover:bg-navy-900/5"
                          aria-label="Edit log"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(log)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                          aria-label="Delete log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}