"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  fileUrl: string | null;
};

function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) return { label: "No expiry", variant: "secondary" as const };
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < now) return { label: "Expired", variant: "destructive" as const };
  const days = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return { label: "Expiring soon", variant: "destructive" as const };
  if (days <= 90) return { label: "Expiring", variant: "outline" as const };
  return { label: "Valid", variant: "default" as const };
}

export default function CertificationsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    fileUrl: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["certifications"],
    queryFn: () => api.get<Certification[]>("/certifications"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Certification>("/certifications", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification created");
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch<Certification>(`/certifications/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification updated");
      setOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/certifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setForm({
      title: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      fileUrl: "",
    });
  }

  function toPayload() {
    return {
      title: form.title,
      issuer: form.issuer,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate || null,
      credentialId: form.credentialId || null,
      fileUrl: form.fileUrl || null,
    };
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("relatedTable", "certifications");
    try {
      const res = await api.upload<{ fileUrl: string }>(fd);
      setForm((f) => ({ ...f, fileUrl: res.data.fileUrl }));
      toast.success("File uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function openEdit(cert: Certification) {
    setEditing(cert);
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      issueDate: cert.issueDate.split("T")[0],
      expiryDate: cert.expiryDate?.split("T")[0] ?? "",
      credentialId: cert.credentialId ?? "",
      fileUrl: cert.fileUrl ?? "",
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

  const certs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Track credentials and expiry dates.</p>
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
                Add certification
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit certification" : "Add certification"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue date</Label>
                  <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Expiry date</Label>
                  <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Credential ID</Label>
                <Input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Certificate file</Label>
                <Input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                {form.fileUrl && <p className="text-xs text-muted-foreground">Uploaded</p>}
              </div>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.map((cert) => {
              const status = getExpiryStatus(cert.expiryDate);
              return (
                <TableRow key={cert.id}>
                  <TableCell>{cert.title}</TableCell>
                  <TableCell>{cert.issuer}</TableCell>
                  <TableCell>{format(new Date(cert.issueDate), "PP")}</TableCell>
                  <TableCell>
                    {cert.expiryDate ? format(new Date(cert.expiryDate), "PP") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {cert.fileUrl ? (
                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(cert)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(cert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
