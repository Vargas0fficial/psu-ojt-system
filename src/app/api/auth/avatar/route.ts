import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { updateAvatar, findUserById, toPublicUser } from "@/lib/users";

const MAX_AVATAR_BYTES = 1_500_000;

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return fail("Not authenticated.", 401);

    const body = await req.json().catch(() => ({}));
    const { avatar } = body;

    if (!avatar || typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
        return fail("Please provide a valid image.");
    }

    if (avatar.length > MAX_AVATAR_BYTES) {
        return fail("Image is too large. Please choose a smaller photo.");
    }

    await updateAvatar(session.id, avatar);

    const updated = await findUserById(session.id);
    if (!updated) return fail("Account not found.", 404);

    return ok(toPublicUser(updated));
}

export async function DELETE() {
    const session = await getSession();
    if (!session) return fail("Not authenticated.", 401);

    await updateAvatar(session.id, null);

    const updated = await findUserById(session.id);
    if (!updated) return fail("Account not found.", 404);

    return ok(toPublicUser(updated));
}