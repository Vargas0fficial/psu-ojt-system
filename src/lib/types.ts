export type LogRow = {
  id: string;
  user_id: string;
  log_date: string;
  time_in: string | null;
  time_out: string | null;
  remarks: string | null;
  status: "Time In" | "Completed";
  duration: string;
};

export type LogsSummary = {
  totalHoursLabel: string;
  totalMinutes: number;
  requiredHours: number;
  logsThisWeek: number;
  weekHoursLabel: string;
  todayLog: LogRow | null;
};

export type LogsResponse = {
  logs: LogRow[];
  summary: LogsSummary;
};