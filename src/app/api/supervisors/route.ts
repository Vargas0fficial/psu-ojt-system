import { ok } from "@/lib/api-response";
import { listSupervisors } from "@/lib/users";

export async function GET() {
  return ok(await listSupervisors());
}
