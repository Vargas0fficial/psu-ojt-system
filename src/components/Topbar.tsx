"use client";

import Link from "next/link";
import { ChevronDown, Menu, UserCircle, Settings, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/hooks/useSession";
import { Avatar } from "./Avatar";

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

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOutside]);
  return ref;
}

export function Topbar({
  title,
  breadcrumb,
  user,
  onMenuClick,
  onLogout,
}: {
  title: string;
  breadcrumb?: string;
  user: SessionUser | null;
  onMenuClick?: () => void;
  onLogout?: () => void;
}) {
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  const dateLabel = now
    ? now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const timeLabel = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const profileHref = user?.role === "supervisor" ? null : "/dashboard/profile";
  const settingsHref = user?.role === "supervisor" ? "/supervisor/settings" : "/dashboard/settings";

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

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={user?.name ?? "?"} avatar={user?.avatar} size={36} className="text-sm" />
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name ?? "..."}</p>
              <p className="text-xs text-muted capitalize">{user?.role ?? ""}</p>
            </div>
            <ChevronDown
              className={`hidden sm:block h-4 w-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="animate-modal-in absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-white shadow-lg py-1.5 z-40">
              <div className="px-3.5 py-2 border-b border-border sm:hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-muted capitalize">{user?.role}</p>
              </div>

              {profileHref && (
                <Link
                  href={profileHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-surface"
                >
                  <UserCircle className="h-4 w-4 text-gray-400" />
                  OJT Profile
                </Link>
              )}
              <Link
                href={settingsHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-surface"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </Link>

              <div className="my-1 border-t border-border" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}