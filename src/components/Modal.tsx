"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  children,
  widthClass = "max-w-md",
  showCloseButton = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  showCloseButton?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`animate-modal-in relative w-full ${widthClass} rounded-2xl bg-white p-6 shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
