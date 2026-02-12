"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ACTIVE_STATUSES = ["active", "trialing"];

export default function BillingPage() {
  const {
    data: subscription,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => apiClient.billing.subscription(),
    refetchOnWindowFocus: true,
  });

  const status = subscription?.data?.status ?? null;
  const isPro = status !== null && ACTIVE_STATUSES.includes(status);

  const syncMutation = useMutation({
    mutationFn: () => apiClient.billing.sync(),
    onSuccess: () => {
      refetch();
      toast.success("Subscription status updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to refresh status"),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => apiClient.billing.checkout(),
    onSuccess: (data) => {
      const url = data.data?.url;
      if (url) window.location.href = url;
      else toast.error("No checkout URL");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to start checkout"),
  });

  const portalMutation = useMutation({
    mutationFn: () => apiClient.billing.portal(),
    onSuccess: (data) => {
      const url = data.data?.url;
      if (url) window.location.href = url;
      else toast.error("No portal URL");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to open billing portal"),
  });

  const handlePortal = () => {
    portalMutation.mutate(undefined, {
      onSettled: () => refetch(),
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Upgrade to Pro or manage your subscription.
        </p>
      </div>
      <div className="grid gap-4 max-w-md">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isPro ? (
          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>
                Your subscription is active. You have access to all Pro
                features.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={portalMutation.isPending}
              >
                Manage subscription
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>
                Unlock more features with a Pro subscription.
              </CardDescription>
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
        )}
        {!isLoading && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Manage subscription</CardTitle>
                <CardDescription>
                  Update payment method or cancel.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handlePortal}
                  disabled={portalMutation.isPending}
                >
                  Open billing portal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? "Refreshing…" : "Refresh status"}
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
