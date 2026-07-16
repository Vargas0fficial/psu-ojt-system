"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  ListChecks,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  Users,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const internNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: "Time Log", href: "/dashboard/time-log", icon: <Clock className="h-[18px] w-[18px]" /> },
  { label: "My Logs", href: "/dashboard/my-logs", icon: <ListChecks className="h-[18px] w-[18px]" /> },
  { label: "Reports", href: "/dashboard/reports", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { label: "OJT Profile", href: "/dashboard/profile", icon: <UserCircle className="h-[18px] w-[18px]" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-[18px] w-[18px]" /> },
];

const supervisorNav: NavItem[] = [
  { label: "Dashboard", href: "/supervisor", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: "My Interns", href: "/supervisor/interns", icon: <Users className="h-[18px] w-[18px]" /> },
  { label: "Reports", href: "/supervisor/reports", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { label: "Settings", href: "/supervisor/settings", icon: <Settings className="h-[18px] w-[18px]" /> },
];

export function Sidebar({
  role,
  onLogout,
}: {
  role: "intern" | "supervisor";
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const items = role === "intern" ? internNav : supervisorNav;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-navy-900 text-white min-h-screen sticky top-0">
      <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-6 border-b border-white/10">
        <div className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-gold-500/70 bg-white shrink-0">
          <Image src="/images/logo.jpg" alt="PSU seal" width={56} height={56} className="h-full w-full object-cover" />
        </div>
        <div className="text-center leading-tight">
          <p className="text-[13px] font-semibold tracking-wide">PSU OJT</p>
          <p className="text-[11px] text-white/60 tracking-wide">MONITORING SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
