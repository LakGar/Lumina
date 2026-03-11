import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type AuthResult =
  | {
      ok: true;
      userId: string;
      user: { id: number; clerkId: string | null; email: string; name: string };
    }
  | { ok: false; response: NextResponse };

/**
 * If the user exists in Clerk but not in our DB (e.g. webhook didn't reach ngrok),
 * fetch from Clerk and create the User row so sign-in works without the webhook.
 */
async function getOrCreateUser(clerkId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, clerkId: true, email: true, name: true },
  });
  if (user) return user;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;
  const email = primaryEmail ?? `${clerkId}@clerk.user`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    "User";

  user = await prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      provider: "clerk",
    },
    select: { id: true, clerkId: true, email: true, name: true },
  });
  return user;
}

export async function requireAuth(): Promise<AuthResult> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const user = await getOrCreateUser(clerkId);
    return { ok: true, userId: clerkId, user };
  } catch (e) {
    const err = e as Error;
    const body: { error: string; detail?: string } = {
      error: "Authentication failed",
    };
    if (process.env.NODE_ENV !== "production") body.detail = err.message;
    return {
      ok: false,
      response: NextResponse.json(body, { status: 500 }),
    };
  }
}
