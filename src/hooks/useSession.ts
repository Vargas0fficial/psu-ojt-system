"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "intern" | "supervisor";
  course: string | null;
  department: string | null;
  requiredHours: number;
  ojtStartDate: string | null;
  supervisorId: string | null;
};

export function useSession(redirectIfUnauthenticated = true) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me");

      // A non-OK response from a crashed API route (e.g. DB connection
      // failure) often comes back as an HTML error page, not JSON. Guard
      // against that instead of letting res.json() throw and leaving the
      // caller stuck on a spinner forever.
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Server returned ${res.status} (not JSON) — check your API/DB setup.`);
      }

      const json = await res.json();
      if (json.success) {
        setUser(json.data);
      } else {
        setUser(null);
        if (redirectIfUnauthenticated) router.replace("/login");
      }
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, [redirectIfUnauthenticated, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/login");
  }, [router]);

  return { user, loading, error, refresh, logout };
}