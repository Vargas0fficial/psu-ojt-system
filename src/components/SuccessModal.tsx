"use client";

import { CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";

export function SuccessModal({
  open,
  onClose,
  title,
  details,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  details?: { label: string; value: string }[];
}) {
  return (
    <Modal open={open} onClose={onClose} showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-success-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-success-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-muted mt-1">Your time log has been recorded.</p>

        {details && details.length > 0 && (
          <div className="w-full mt-4 rounded-lg bg-surface p-3.5 text-left">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between text-sm py-0.5">
                <span className="text-muted">{d.label}:</span>
                <span className="font-medium text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 text-sm transition-colors"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
