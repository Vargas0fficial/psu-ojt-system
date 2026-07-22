"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Printer } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useLogs } from "@/hooks/useLogs";
import { api } from "@/lib/api-client";

type Supervisor = { id: string; name: string };

function dayOfWeek(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatShortDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DtrPage() {
    const { user } = useSession();
    const { logs, summary } = useLogs();
    const [supervisorName, setSupervisorName] = useState<string | null>(null);

    useEffect(() => {
        api.get<Supervisor[]>("/api/supervisors").then((res) => {
            if (res.success && user?.supervisorId) {
                const match = res.data.find((s) => s.id === user.supervisorId);
                if (match) setSupervisorName(match.name);
            }
        });
    }, [user?.supervisorId]);

    const sortedLogs = [...logs].sort((a, b) => (a.log_date < b.log_date ? -1 : 1));
    const printedOn = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-surface">
            <div className="no-print sticky top-0 z-10 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
                <Link href="/dashboard/my-logs" className="flex items-center gap-1.5 text-sm text-navy-800 hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Logs
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2 transition-colors"
                >
                    <Printer className="h-4 w-4" />
                    Print / Save as PDF
                </button>
            </div>

            <div className="dtr-sheet max-w-3xl mx-auto bg-white my-6 p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-navy-900">
                    <Image src="/images/logo.jpg" alt="PSU seal" width={56} height={56} className="rounded-full" />
                    <div>
                        <p className="text-xs tracking-widest text-muted">PANGASINAN STATE UNIVERSITY</p>
                        <h1 className="text-lg font-bold text-gray-900">Daily Time Record</h1>
                        <p className="text-xs text-muted">On-the-Job Training Monitoring System</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <span className="text-muted">Name: </span>
                        <span className="font-medium text-gray-900">{user?.name ?? "-"}</span>
                    </div>
                    <div>
                        <span className="text-muted">Course / Program: </span>
                        <span className="font-medium text-gray-900">{user?.course || "-"}</span>
                    </div>
                    <div>
                        <span className="text-muted">Supervisor: </span>
                        <span className="font-medium text-gray-900">{supervisorName ?? "Not assigned"}</span>
                    </div>
                    <div>
                        <span className="text-muted">Required Hours: </span>
                        <span className="font-medium text-gray-900">{user?.requiredHours ?? 486}</span>
                    </div>
                    <div>
                        <span className="text-muted">Total Hours Rendered: </span>
                        <span className="font-medium text-gray-900">{summary?.totalHoursLabel ?? "0h 00m"}</span>
                    </div>
                    <div>
                        <span className="text-muted">Printed on: </span>
                        <span className="font-medium text-gray-900">{printedOn}</span>
                    </div>
                </div>

                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-y border-gray-400">
                            <th className="py-2 px-2 text-left font-semibold">Date</th>
                            <th className="py-2 px-2 text-left font-semibold">Day</th>
                            <th className="py-2 px-2 text-left font-semibold">Time In</th>
                            <th className="py-2 px-2 text-left font-semibold">Time Out</th>
                            <th className="py-2 px-2 text-left font-semibold">Total Hours</th>
                            <th className="py-2 px-2 text-left font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-6 text-center text-muted">
                                    No time logs recorded yet.
                                </td>
                            </tr>
                        ) : (
                            sortedLogs.map((log) => (
                                <tr key={log.id} className="border-b border-gray-200">
                                    <td className="py-1.5 px-2 whitespace-nowrap">{formatShortDate(log.log_date)}</td>
                                    <td className="py-1.5 px-2 whitespace-nowrap">{dayOfWeek(log.log_date)}</td>
                                    <td className="py-1.5 px-2 whitespace-nowrap">{log.time_in ?? "-"}</td>
                                    <td className="py-1.5 px-2 whitespace-nowrap">{log.time_out ?? "-"}</td>
                                    <td className="py-1.5 px-2 whitespace-nowrap">{log.duration}</td>
                                    <td className="py-1.5 px-2">{log.remarks || log.supervisorRemark || ""}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-400 font-semibold">
                            <td colSpan={4} className="py-2 px-2 text-right">
                                Total Hours Rendered:
                            </td>
                            <td colSpan={2} className="py-2 px-2">{summary?.totalHoursLabel ?? "0h 00m"}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="grid grid-cols-2 gap-8 mt-16 text-sm">
                    <div>
                        <div className="border-t border-gray-500 pt-1.5 text-center">
                            {user?.name ?? ""}
                            <p className="text-xs text-muted mt-0.5">Trainee&apos;s Signature</p>
                        </div>
                    </div>
                    <div>
                        <div className="border-t border-gray-500 pt-1.5 text-center">
                            {supervisorName ?? ""}
                            <p className="text-xs text-muted mt-0.5">Supervisor&apos;s Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .dtr-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
        @page {
          size: A4;
          margin: 1.5cm;
        }
      `}</style>
        </div>
    );
}