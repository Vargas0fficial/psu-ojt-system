"use client";

import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatCard";
import { formatDateLabel } from "@/lib/time";
import type { LogRow } from "@/lib/types";

export function LogTable({
  logs,
  onEdit,
  onDelete,
  emptyMessage = "No time logs yet.",
}: {
  logs: LogRow[];
  onEdit?: (log: LogRow) => void;
  onDelete?: (log: LogRow) => void;
  emptyMessage?: string;
}) {
  const editable = Boolean(onEdit || onDelete);

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
            {editable && <th className="py-2.5 px-2 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface/60">
              <td className="py-3 px-4 sm:px-2 whitespace-nowrap text-gray-900">
                {formatDateLabel(log.log_date)}
              </td>
              <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.time_in ?? "-"}</td>
              <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.time_out ?? "-"}</td>
              <td className="py-3 px-2 whitespace-nowrap text-gray-700">{log.duration}</td>
              <td className="py-3 px-2 whitespace-nowrap">
                <StatusBadge status={log.status} />
              </td>
              {editable && (
                <td className="py-3 px-2">
                  <div className="flex items-center justify-end gap-1">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
