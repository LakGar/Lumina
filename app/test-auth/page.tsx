"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>

        <div className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>

          {session ? (
            <div>
              <strong>User:</strong> {session.user?.name} ({session.user?.email}
              )
              <br />
              <strong>User ID:</strong>{" "}
              {(session.user as any)?.id || "Not available"}
            </div>
          ) : (
            <div>No active session</div>
          )}

          <div className="flex gap-2">
            {session ? (
              <Button onClick={() => signOut()}>Sign Out</Button>
            ) : (
              <Button onClick={() => signIn("google")}>
                Sign In with Google
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p>Check the browser console for any errors.</p>
            <p>Check Application/Storage tab for cookies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
