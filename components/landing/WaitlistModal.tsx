"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WaitlistModal({
  open,
  onOpenChange,
  source,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}) {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [alreadyOnList, setAlreadyOnList] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/landing/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: source ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error ?? "Something went wrong.");
        return;
      }
      setAlreadyOnList(Boolean(data?.alreadyOnList));
      setStatus("success");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
        setAlreadyOnList(false);
      }, 200);
    }
    onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border p-8 shadow-lg focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          style={{
            borderColor: "#e5ddd4",
            backgroundColor: "#FDFCF9",
          }}
          onPointerDownOutside={() => handleOpenChange(false)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title
                className="font-heading text-2xl font-medium"
                style={{ color: "#1E1E1E" }}
              >
                Join the waitlist
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                className="font-body mt-1 text-[15px]"
                style={{ color: "#6B6B6B" }}
              >
                We’re preparing for TestFlight. Leave your email and we’ll notify you when Lumina is ready to try.
              </DialogPrimitive.Description>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-full p-2 transition-colors hover:bg-black/5"
              style={{ color: "#6B6B6B" }}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {status === "success" ? (
            <p className="font-body mt-6 text-sm" style={{ color: "#1E1E1E" }}>
              {alreadyOnList
                ? "You’re already on the list. We’ll be in touch when TestFlight is live."
                : "You’re on the list. We’ll be in touch when TestFlight is live."}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waitlist-name" className="font-body" style={{ color: "#1E1E1E" }}>
                  Name (optional)
                </Label>
                <Input
                  id="waitlist-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg border-[#e5ddd4] bg-white font-body"
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waitlist-email" className="font-body" style={{ color: "#1E1E1E" }}>
                  Email *
                </Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg border-[#e5ddd4] bg-white font-body"
                  disabled={status === "loading"}
                />
              </div>
              {errorMessage && (
                <p className="font-body text-sm" style={{ color: "#dc2626" }}>
                  {errorMessage}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="font-body rounded-full px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                  style={{ color: "#6B6B6B" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="font-body rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {status === "loading" ? "Joining…" : "Join waitlist"}
                </button>
              </div>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
