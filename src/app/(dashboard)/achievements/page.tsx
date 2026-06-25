"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  FormField,
  LoadingState,
  PageContainer,
  PageHeader,
  TableActions,
  Timeline,
} from "@/components/common";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Award, Plus } from "lucide-react";

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  category: string | null;
};

export default function AchievementsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api.get<Achievement[]>("/achievements"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Achievement>("/achievements", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement created");
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch<Achievement>(`/achievements/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement updated");
      setOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/achievements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", description: "", date: "", category: "" });
  }

  function toPayload() {
    return {
      title: form.title,
      description: form.description || null,
      date: form.date,
      category: form.category || null,
    };
  }

  function openEdit(a: Achievement) {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description ?? "",
      date: a.date.split("T")[0],
      category: a.category ?? "",
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = toPayload();
    if (editing) {
      updateMutation.mutate({ id: editing.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const achievements = data?.data ?? [];
  const timelineItems = achievements.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.description ?? undefined,
    date: formatDate(a.date),
    badge: a.category ?? undefined,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Achievements"
        description="Awards and milestones timeline."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setEditing(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 size-4" />
                  Add achievement
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit achievement" : "Add achievement"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Description">
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date">
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </FormField>
                  <FormField label="Category">
                    <Input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </FormField>
                </div>
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <LoadingState variant="page" />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No achievements yet"
          description="Record awards, promotions, and milestones on your career timeline."
          action={{
            label: "Add your first achievement",
            onClick: () => {
              resetForm();
              setOpen(true);
            },
          }}
        />
      ) : (
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-4 rounded-lg border bg-card p-6 shadow-elevation-sm">
            <Timeline items={timelineItems} />
            <div className="mt-6 space-y-2 border-t pt-4">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{a.title}</span>
                  <TableActions
                    onEdit={() => openEdit(a)}
                    onDelete={() => deleteMutation.mutate(a.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <ul className="divide-y rounded-lg border shadow-elevation-sm">
              {achievements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span>{a.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{formatDate(a.date)}</span>
                    <TableActions
                      onEdit={() => openEdit(a)}
                      onDelete={() => deleteMutation.mutate(a.id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}
