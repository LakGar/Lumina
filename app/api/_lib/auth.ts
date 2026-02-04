import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export type AuthResult =
  | {
      ok: true;
      userId: string;
      user: { id: number; clerkId: string | null; email: string; name: string };
    }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, clerkId: true, email: true, name: true },
  });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { ok: true, userId: clerkId, user };
}
