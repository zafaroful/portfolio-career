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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Awards and milestones timeline.</p>
        </div>
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
                <Plus className="mr-2 h-4 w-4" />
                Add achievement
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit achievement" : "Add achievement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="space-y-4">
            {achievements.map((a) => (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(a.date), "PP")}
                      {a.category && ` · ${a.category}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {a.description && (
                  <CardContent>
                    <p className="text-sm">{a.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="list">
            <ul className="space-y-2">
              {achievements.map((a) => (
                <li key={a.id} className="flex justify-between border-b py-2 text-sm">
                  <span>{a.title}</span>
                  <span className="text-muted-foreground">{format(new Date(a.date), "PP")}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
