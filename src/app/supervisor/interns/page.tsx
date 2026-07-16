"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useInterns } from "@/hooks/useInterns";
import { useToast } from "@/components/Toast";
import { DashboardShell } from "@/components/DashboardShell";
import { LogTable } from "@/components/LogTable";
import { api } from "@/lib/api-client";
import type { LogRow } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

type InternLogsResponse = {
    intern: { id: string; name: string; email: string; course: string | null };
    logs: LogRow[];
};

function InternsContent() {
    const { user, logout, error, refresh } = useSession();
    const { interns, loading } = useInterns();
    const { toasts, showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const internId = searchParams.get("intern");

    const [detail, setDetail] = useState<InternLogsResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect -- sync detail panel to the selected intern query param */
    useEffect(() => {
        if (!internId) {
            setDetail(null);
            return;
        }
        setDetailLoading(true);
        api.get<InternLogsResponse>(`/api/supervisor/logs?internId=${internId}`).then((res) => {
            setDetailLoading(false);
            if (res.success) {
                setDetail(res.data);
            } else {
                showToast(res.error, "error");
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [internId]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (internId) {
        return (
            <DashboardShell user={user} title="Intern Logs" breadcrumb="Dashboard > My Interns" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <button
                        onClick={() => router.push("/supervisor/interns")}
                        className="flex items-center gap-1.5 text-sm text-navy-800 hover:underline w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to all interns
                    </button>

                    {detailLoading ? (
                        <p className="text-sm text-muted py-8 text-center">Loading logs...</p>
                    ) : detail ? (
                        <div className="rounded-xl border border-border bg-card p-5">
                            <h3 className="text-base font-semibold text-gray-900">{detail.intern.name}</h3>
                            <p className="text-sm text-muted mb-4">
                                {detail.intern.course || "OJT Trainee"} &middot; {detail.intern.email}
                            </p>
                            <LogTable logs={detail.logs} emptyMessage="This intern has no logged hours yet." />
                        </div>
                    ) : (
                        <p className="text-sm text-muted py-8 text-center">Intern not found.</p>
                    )}
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell user={user} title="My Interns" breadcrumb="Dashboard > My Interns" onLogout={logout} toasts={toasts} error={error} onRetry={refresh}>
            <div className="max-w-5xl mx-auto rounded-xl border border-border bg-card p-5">
                {loading ? (
                    <p className="text-sm text-muted py-8 text-center">Loading interns...</p>
                ) : interns.length === 0 ? (
                    <p className="text-sm text-muted py-8 text-center">
                        No interns assigned yet. Interns can select you as their supervisor when they create their account.
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-border">
                        {interns.map((intern) => (
                            <button
                                key={intern.id}
                                onClick={() => router.push(`/supervisor/interns?intern=${intern.id}`)}
                                className="flex items-center justify-between py-3.5 hover:bg-surface/60 -mx-2 px-2 rounded-lg transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-semibold">
                                        {intern.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{intern.name}</p>
                                        <p className="text-xs text-muted">{intern.course || "OJT Trainee"} &middot; {intern.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{intern.totalHoursLabel}</p>
                                    <p className="text-xs text-muted">of {intern.requiredHours}h &middot; {intern.logsThisWeek} logs this week</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

export default function SupervisorInternsPage() {
    return (
        <Suspense fallback={null}>
            <InternsContent />
        </Suspense>
    );
}