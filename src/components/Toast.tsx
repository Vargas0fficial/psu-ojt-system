"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export type ToastKind = "success" | "error" | "info";
export type ToastItem = { id: number; kind: ToastKind; message: string };

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, showToast };
}

const kindStyles: Record<ToastKind, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-white",
    border: "border-l-4 border-success-600",
    icon: <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />,
  },
  error: {
    bg: "bg-white",
    border: "border-l-4 border-red-500",
    icon: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  },
  info: {
    bg: "bg-white",
    border: "border-l-4 border-navy-700",
    icon: <Info className="h-5 w-5 text-navy-700 shrink-0" />,
  },
};

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[calc(100%-2.5rem)] max-w-sm">
      {toasts.map((t) => {
        const style = kindStyles[t.kind];
        return (
          <div
            key={t.id}
            className={`animate-toast-in flex items-start gap-2.5 rounded-lg ${style.bg} ${style.border} px-4 py-3 shadow-lg shadow-black/10`}
          >
            {style.icon}
            <p className="text-sm text-gray-800 leading-snug">{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}
