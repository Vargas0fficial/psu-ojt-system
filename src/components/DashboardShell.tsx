"use client";

import { AlertTriangle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastStack, type ToastItem } from "./Toast";
import type { SessionUser } from "@/hooks/useSession";

export function DashboardShell({
  user,
  title,
  breadcrumb,
  onLogout,
  toasts,
  error,
  onRetry,
  children,
}: {
  user: SessionUser | null;
  title: string;
  breadcrumb?: string;
  onLogout: () => void;
  toasts: ToastItem[];
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-sm text-center">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">Couldn&apos;t load your account</p>
          <p className="text-sm text-muted mt-1">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-navy-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role={user.role} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} breadcrumb={breadcrumb} user={user} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}