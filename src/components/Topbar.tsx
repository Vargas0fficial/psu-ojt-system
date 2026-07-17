"use client";

import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/hooks/useSession";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial clock sync on mount
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function Topbar({
  title,
  breadcrumb,
  user,
  onMenuClick,
}: {
  title: string;
  breadcrumb?: string;
  user: SessionUser | null;
  onMenuClick?: () => void;
}) {
  const now = useNow();
  const dateLabel = now
    ? now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const timeLabel = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden -ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {breadcrumb && <p className="text-xs text-muted mt-0.5">{breadcrumb}</p>}
        </div>
      </div>
      <div className="flex items-center gap-5">
        {now && (
          <p className="hidden sm:block text-sm text-muted">
            {dateLabel} <span className="text-gray-300">|</span> {timeLabel}
          </p>
        )}
        <div className="flex items-center gap-2 cursor-default">
          <div className="h-9 w-9 rounded-full bg-navy-800 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.name?.charAt(0) ?? "?"}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-gray-900">{user?.name ?? "..."}</p>
            <p className="text-xs text-muted capitalize">{user?.role ?? ""}</p>
          </div>
          <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}