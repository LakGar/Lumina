"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function BillingPage() {
  const checkoutMutation = useMutation({
    mutationFn: () => apiClient.billing.checkout(),
    onSuccess: (data) => {
      const url = data.data?.url;
      if (url) window.location.href = url;
      else toast.error("No checkout URL");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to start checkout"),
  });

  const portalMutation = useMutation({
    mutationFn: () => apiClient.billing.portal(),
    onSuccess: (data) => {
      const url = data.data?.url;
      if (url) window.location.href = url;
      else toast.error("No portal URL");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to open billing portal"),
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-muted-foreground text-sm">Upgrade to Pro or manage your subscription.</p>
      </div>
      <div className="grid gap-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Unlock more features with a Pro subscription.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                Upgrade to Pro
              </Button>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Manage subscription</CardTitle>
              <CardDescription>Update payment method or cancel.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
              >
                Open billing portal
              </Button>
            </div>
          </Card>
        </div>
    </div>
  );
}
