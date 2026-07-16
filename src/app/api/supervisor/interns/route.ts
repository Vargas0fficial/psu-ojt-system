import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { listInternsForSupervisor, toPublicUser } from "@/lib/users";
import { totalMinutesForUser, formatMinutesLabel, minutesThisWeekForUser } from "@/lib/logs";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);
  if (session.role !== "supervisor") return fail("Supervisors only.", 403);

  const rawInterns = await listInternsForSupervisor(session.id);

  const interns = await Promise.all(
    rawInterns.map(async (intern) => {
      const internId = intern._id.toString();
      const [totalMinutes, week] = await Promise.all([
        totalMinutesForUser(internId),
        minutesThisWeekForUser(internId),
      ]);
      return {
        ...toPublicUser(intern),
        totalHoursLabel: formatMinutesLabel(totalMinutes),
        totalMinutes,
        logsThisWeek: week.days,
      };
    })
  );

  return ok(interns);
}