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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  FormField,
  LoadingState,
  PageContainer,
  PageHeader,
  TableActions,
} from "@/components/common";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Plus, ExternalLink, X, ImageIcon } from "lucide-react";

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
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  category: string | null;
  tags: string[];
};

const PROJECT_STATUSES = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;

function getStatusVariant(status: Project["status"]) {
  switch (status) {
    case "ACTIVE":
      return "default" as const;
    case "COMPLETED":
      return "secondary" as const;
    case "DRAFT":
      return "outline" as const;
    case "ARCHIVED":
      return "outline" as const;
  }
}

function ProjectPreviewImage({
  title,
  imageUrl,
  className,
}: {
  title: string;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-muted/40 ${className ?? ""}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="size-10 opacity-40" />
          <span className="text-xs">No preview image</span>
        </div>
      )}
    </div>
  );
}

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
    links: [] as Array<{ label: string; url: string }>,
    imageUrl: "",
    isPublic: true,
    status: "ACTIVE" as Project["status"],
    category: "",
    tags: "",
  });
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (categoryFilter !== "all") queryParams.set("category", categoryFilter);
  if (tagFilter !== "all") queryParams.set("tag", tagFilter);
  const queryString = queryParams.toString();

  const { data, isLoading } = useQuery({
    queryKey: ["projects", statusFilter, categoryFilter, tagFilter],
    queryFn: () =>
      api.get<Project[]>(`/projects${queryString ? `?${queryString}` : ""}`),
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
      links: [],
      imageUrl: "",
      isPublic: true,
      status: "ACTIVE",
      category: "",
      tags: "",
    });
    setCurrentLink({ label: "", url: "" });
  }

  function addLink() {
    if (!currentLink.url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    setForm({
      ...form,
      links: [...form.links, { label: currentLink.label || currentLink.url, url: currentLink.url }],
    });
    setCurrentLink({ label: "", url: "" });
  }

  function removeLink(index: number) {
    setForm({
      ...form,
      links: form.links.filter((_, i) => i !== index),
    });
  }

  function toPayload() {
    return {
      title: form.title,
      description: form.description || null,
      techStack: form.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      role: form.role || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      links: form.links,
      imageUrl: form.imageUrl || null,
      isPublic: form.isPublic,
      status: form.status,
      category: form.category || null,
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
      links: p.links,
      imageUrl: p.imageUrl ?? "",
      isPublic: p.isPublic,
      status: p.status,
      category: p.category ?? "",
      tags: (p.tags ?? []).join(", "),
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
  const filterMeta = data?.meta as
    | { filters?: { categories: string[]; tags: string[] } }
    | undefined;
  const categories = filterMeta?.filters?.categories ?? [];
  const tags = filterMeta?.filters?.tags ?? [];

  const bulkArchiveMutation = useMutation({
    mutationFn: async () => {
      const completed = projects.filter((p) => p.status === "COMPLETED");
      await Promise.all(
        completed.map((p) => api.patch(`/projects/${p.id}`, { status: "ARCHIVED" })),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Completed projects archived");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Showcase your work and tech stack."
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
                  Add project
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit project" : "Add project"}</DialogTitle>
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
                <FormField label="Tech stack" description="Comma-separated values.">
                  <Input
                    value={form.techStack}
                    onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  />
                </FormField>
                <FormField label="Role">
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm({ ...form, status: v as Project["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Category">
                    <Input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Web App, Open Source"
                      list="project-categories"
                    />
                    <datalist id="project-categories">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </FormField>
                </div>
                <FormField label="Tags" description="Comma-separated tags for filtering.">
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. react, typescript, saas"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start date">
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </FormField>
                  <FormField label="End date">
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField
                  label="Links"
                  description="Add links to your project (GitHub, Live Demo, etc.)"
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                      <Input
                        placeholder="Label (e.g., GitHub)"
                        value={currentLink.label}
                        onChange={(e) =>
                          setCurrentLink({ ...currentLink, label: e.target.value })
                        }
                      />
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={currentLink.url}
                        onChange={(e) =>
                          setCurrentLink({ ...currentLink, url: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLink}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    {form.links.length > 0 && (
                      <div className="space-y-2">
                        {form.links.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              {link.label}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(idx)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>
                <FormField label="Project image" description="Upload a screenshot or cover image for this project.">
                  {form.imageUrl ? (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-md border">
                        <ProjectPreviewImage title={form.title || "Project preview"} imageUrl={form.imageUrl} />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                </FormField>
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
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={(v) => v && setTagFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projects.some((p) => p.status === "COMPLETED") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkArchiveMutation.mutate()}
            disabled={bulkArchiveMutation.isPending}
          >
            Archive completed
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState variant="cards" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add projects to showcase your work on your public portfolio."
          action={{
            label: "Add your first project",
            onClick: () => {
              resetForm();
              setOpen(true);
            },
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden shadow-elevation-sm">
              <ProjectPreviewImage title={project.title} imageUrl={project.imageUrl} />
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  {project.role && (
                    <p className="text-sm text-muted-foreground">{project.role}</p>
                  )}
                  {project.category && (
                    <Badge variant="outline" className="mt-1">
                      {project.category}
                    </Badge>
                  )}
                </div>
                <TableActions
                  onEdit={() => openEdit(project)}
                  onDelete={() => deleteMutation.mutate(project.id)}
                  isDeleting={deleteMutation.isPending}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && <p className="text-sm">{project.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {(project.techStack as string[]).map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                {(project.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(project.tags ?? []).map((t) => (
                      <Badge key={t} variant="outline">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}
                {project.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-caption">
                  {formatDate(project.startDate)} –{" "}
                  {project.endDate ? formatDate(project.endDate) : "Present"}
                </p>
                {!project.isPublic && <Badge variant="outline">Private</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
