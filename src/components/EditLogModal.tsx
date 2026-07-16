"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { LogRow } from "@/lib/types";

function to24Hour(label: string | null): string {
  if (!label) return "";
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function to12Hour(value: string): string {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  let hours = parseInt(hStr, 10);
  const meridian = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${mStr} ${meridian}`;
}

export function EditLogModal({
  open,
  log,
  onClose,
  onSave,
}: {
  open: boolean;
  log: LogRow | null;
  onClose: () => void;
  onSave: (fields: {
    log_date: string;
    time_in: string;
    time_out: string;
    remarks: string;
  }) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- sync form fields to the log being edited */
  useEffect(() => {
    if (log) {
      setDate(log.log_date);
      setTimeIn(to24Hour(log.time_in));
      setTimeOut(to24Hour(log.time_out));
      setRemarks(log.remarks ?? "");
    }
  }, [log]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSave() {
    setSaving(true);
    await onSave({
      log_date: date,
      time_in: timeIn ? to12Hour(timeIn) : "",
      time_out: timeOut ? to12Hour(timeOut) : "",
      remarks,
    });
    setSaving(false);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Edit Time Log</h2>
      <div className="flex flex-col gap-3.5">
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
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Time Out</label>
            <input
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            placeholder="Enter remarks..."
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-800/30 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Log"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
