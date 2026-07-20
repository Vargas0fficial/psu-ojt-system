"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export type InternSummary = {
  id: string;
  name: string;
  email: string;
  role: "intern";
  course: string | null;
  requiredHours: number;
  ojtStartDate: string | null;
  avatar: string | null;
  totalHoursLabel: string;
  totalMinutes: number;
  logsThisWeek: number;
};

export function useInterns() {
  const [interns, setInterns] = useState<InternSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await api.get<InternSummary[]>("/api/supervisor/interns");
    if (res.success) setInterns(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    refresh();
  }, [refresh]);

  return { interns, loading, refresh };
}