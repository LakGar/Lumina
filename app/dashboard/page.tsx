import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
