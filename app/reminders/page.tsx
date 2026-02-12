"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { apiClient } from "@/lib/api/client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

const REPEAT_OPTIONS = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
];

type Reminder = {
  id: number;
  dateISO: string;
  time: string;
  repeat: string;
  title: string;
  journalId: number | null;
  createdAt: string;
  updatedAt: string;
};

const defaultForm = {
  dateISO: format(new Date(), "yyyy-MM-dd"),
  time: "09:00",
  repeat: "none",
  title: "",
  journalId: null as number | null,
};

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  const now = new Date();
  const from = format(startOfMonth(now), "yyyy-MM-dd");
  const to = format(endOfMonth(now), "yyyy-MM-dd");

  const { data: remindersData, isLoading } = useQuery({
    queryKey: ["reminders", from, to],
    queryFn: () => apiClient.me.reminders.list(from, to),
  });

  const { data: journalsData } = useQuery({
    queryKey: ["journals"],
    queryFn: () => apiClient.journals.list(),
  });

  const reminders = (remindersData?.data ?? []) as Reminder[];
  const journals = (journalsData?.data ?? []) as {
    id: number;
    title: string;
  }[];

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.me.reminders.create({
        ...form,
        journalId: form.journalId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setSheetOpen(false);
      setForm(defaultForm);
      toast.success("Reminder created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.me.reminders.update(id, {
        dateISO: form.dateISO,
        time: form.time,
        repeat: form.repeat,
        title: form.title,
        journalId: form.journalId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setSheetOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      toast.success("Reminder updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.me.reminders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setSheetOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setForm({
      dateISO: r.dateISO,
      time: r.time,
      repeat: r.repeat,
      title: r.title,
      journalId: r.journalId,
    });
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editingId != null) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reminders</h1>
            <p className="text-muted-foreground text-sm">
              Schedule journal reminders for this month.
            </p>
          </div>
          <Button onClick={openCreate}>
            <IconPlus className="size-4" />
            Add reminder
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
            No reminders this month. Add one to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.dateISO} at {r.time}
                    {r.repeat !== "none" ? ` · ${r.repeat}` : ""}
                    {r.journalId
                      ? ` · ${journals.find((j) => j.id === r.journalId)?.title ?? "Journal"}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(r)}
                    aria-label="Edit"
                  >
                    <IconEdit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(r.id)}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingId != null ? "Edit reminder" : "New reminder"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="rem-title">Title</Label>
              <Input
                id="rem-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Morning journal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rem-date">Date</Label>
                <Input
                  id="rem-date"
                  type="date"
                  value={form.dateISO}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateISO: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rem-time">Time</Label>
                <Input
                  id="rem-time"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Repeat</Label>
              <Select
                value={form.repeat}
                onValueChange={(v) => setForm((f) => ({ ...f, repeat: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPEAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Journal (optional)</Label>
              <Select
                value={form.journalId?.toString() ?? "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    journalId: v === "none" ? null : Number(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any</SelectItem>
                  {journals.map((j) => (
                    <SelectItem key={j.id} value={j.id.toString()}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !form.title.trim() ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {editingId != null ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </SidebarInset>
  );
}
