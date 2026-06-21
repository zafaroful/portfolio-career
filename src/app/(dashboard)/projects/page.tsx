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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Project = {
  id: string;
  title: string;
  description: string | null;
  techStack: string[];
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  links: Array<{ label: string; url: string }>;
  imageUrl: string | null;
  isPublic: boolean;
};

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    techStack: "",
    role: "",
    startDate: "",
    endDate: "",
    links: "",
    imageUrl: "",
    isPublic: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Project>("/projects", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch<Project>(`/projects/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
      setOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setForm({
      title: "",
      description: "",
      techStack: "",
      role: "",
      startDate: "",
      endDate: "",
      links: "",
      imageUrl: "",
      isPublic: true,
    });
  }

  function toPayload() {
    const links = form.links
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split("|").map((s) => s.trim());
        return { label: label || url, url };
      })
      .filter((l) => l.url);

    return {
      title: form.title,
      description: form.description || null,
      techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      role: form.role || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      links,
      imageUrl: form.imageUrl || null,
      isPublic: form.isPublic,
    };
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("relatedTable", "projects");
    try {
      const res = await api.upload<{ fileUrl: string }>(fd);
      setForm((f) => ({ ...f, imageUrl: res.data.fileUrl }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      techStack: (p.techStack as string[]).join(", "),
      role: p.role ?? "",
      startDate: p.startDate?.split("T")[0] ?? "",
      endDate: p.endDate?.split("T")[0] ?? "",
      links: p.links.map((l) => `${l.label}|${l.url}`).join("\n"),
      imageUrl: p.imageUrl ?? "",
      isPublic: p.isPublic,
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

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Showcase your work and tech stack.</p>
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
                Add project
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit project" : "Add project"}</DialogTitle>
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
              <div className="space-y-2">
                <Label>Tech stack (comma-separated)</Label>
                <Input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Links (label|url per line)</Label>
                <Textarea value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} placeholder="GitHub|https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Project image</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.isPublic}
                  onCheckedChange={(v) => setForm({ ...form, isPublic: v === true })}
                />
                <Label>Public on portfolio</Label>
              </div>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  {project.role && (
                    <p className="text-sm text-muted-foreground">{project.role}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(project)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.imageUrl} alt={project.title} className="rounded-md h-32 w-full object-cover" />
                )}
                {project.description && <p className="text-sm">{project.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {(project.techStack as string[]).map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {project.startDate ? format(new Date(project.startDate), "PP") : "—"}
                  {" – "}
                  {project.endDate ? format(new Date(project.endDate), "PP") : "Present"}
                </p>
                {!project.isPublic && <Badge variant="outline">Private</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
