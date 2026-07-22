export type ApprovalStatus = "pending" | "approved" | "flagged";

export type LogRow = {
  id: string;
  user_id: string;
  log_date: string;
  time_in: string | null;
  time_out: string | null;
  remarks: string | null;
  status: "Time In" | "Completed";
  duration: string;
  approvalStatus: ApprovalStatus;
  supervisorRemark: string | null;
  reviewedAt: string | Date | null;
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