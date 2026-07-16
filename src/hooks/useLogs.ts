"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { LogRow, LogsResponse, LogsSummary } from "@/lib/types";
import { nowTimeLabel, todayDateString } from "@/lib/time";

export function useLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [summary, setSummary] = useState<LogsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await api.get<LogsResponse>("/api/logs");
    if (res.success) {
      setLogs(res.data.logs);
      setSummary(res.data.summary);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    refresh();
  }, [refresh]);

  const timeIn = useCallback(
    async (remarks?: string) => {
      const res = await api.post<LogRow>("/api/logs", {
        logDate: todayDateString(),
        timeIn: nowTimeLabel(),
        remarks,
      });
      if (res.success) await refresh();
      return res;
    },
    [refresh]
  );

  const timeOut = useCallback(
    async (logId: string, remarks?: string) => {
      const res = await api.post<LogRow>("/api/logs/timeout", {
        logId,
        timeOut: nowTimeLabel(),
        remarks,
      });
      if (res.success) await refresh();
      return res;
    },
    [refresh]
  );

  const updateLog = useCallback(
    async (
      logId: string,
      fields: Partial<Pick<LogRow, "log_date" | "time_in" | "time_out" | "remarks">>
    ) => {
      const res = await api.patch(`/api/logs/${logId}`, fields);
      if (res.success) await refresh();
      return res;
    },
    [refresh]
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      const res = await api.delete(`/api/logs/${logId}`);
      if (res.success) await refresh();
      return res;
    },
    [refresh]
  );

  return { logs, summary, loading, refresh, timeIn, timeOut, updateLog, deleteLog };
}