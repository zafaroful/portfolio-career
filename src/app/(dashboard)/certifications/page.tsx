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
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  FormField,
  PageContainer,
  PageHeader,
  TableActions,
} from "@/components/common";
import { getExpiryStatus } from "@/components/features/certifications/expiry-status";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Plus, Sparkles } from "lucide-react";
import { InterviewQuestionsDialog } from "@/components/ai/interview-questions-dialog";

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  fileUrl: string | null;
};

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
  const [interviewTarget, setInterviewTarget] = useState<Certification | null>(null);
  const [relevanceScores, setRelevanceScores] = useState<
    Record<string, { score: number; relevance: string; feedback: string }>
  >({});

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

  const relevanceMutation = useMutation({
    mutationFn: () =>
      api.aiCertRelevance<{
        scores: Array<{
          certificationId: string;
          score: number;
          relevance: string;
          feedback: string;
        }>;
      }>(),
    onSuccess: (res) => {
      const map: Record<string, { score: number; relevance: string; feedback: string }> = {};
      for (const item of res.data.scores) {
        map[item.certificationId] = item;
      }
      setRelevanceScores(map);
      toast.success("Relevance scores updated");
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
    <PageContainer>
      <PageHeader
        title="Certifications"
        description="Track credentials and expiry dates."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => relevanceMutation.mutate()}
              disabled={relevanceMutation.isPending || certs.length === 0}
            >
              <Sparkles className="mr-2 size-4" />
              Score relevance
            </Button>
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
                  Add certification
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit certification" : "Add certification"}
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
                <FormField label="Issuer">
                  <Input
                    value={form.issuer}
                    onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                    required
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Issue date">
                    <Input
                      type="date"
                      value={form.issueDate}
                      onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                      required
                    />
                  </FormField>
                  <FormField label="Expiry date">
                    <Input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField label="Credential ID">
                  <Input
                    value={form.credentialId}
                    onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                  />
                </FormField>
                <FormField
                  label="Certificate file"
                  description={form.fileUrl ? "File uploaded successfully." : undefined}
                >
                  <Input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                </FormField>
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        }
      />

      <DataTable
        isLoading={isLoading}
        isEmpty={!isLoading && certs.length === 0}
        emptyIcon={BadgeCheck}
        emptyTitle="No certifications yet"
        emptyDescription="Add credentials to track expiry dates and showcase expertise."
        emptyAction={{
          label: "Add your first certification",
          onClick: () => {
            resetForm();
            setOpen(true);
          },
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Relevance</TableHead>
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
                  <TableCell>{formatDate(cert.issueDate)}</TableCell>
                  <TableCell>{formatDate(cert.expiryDate)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {relevanceScores[cert.id] ? (
                      <Badge variant="outline" title={relevanceScores[cert.id].feedback}>
                        {relevanceScores[cert.id].score}% · {relevanceScores[cert.id].relevance}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setInterviewTarget(cert)}>
                        Prep
                      </Button>
                      <TableActions
                        onEdit={() => openEdit(cert)}
                        onDelete={() => deleteMutation.mutate(cert.id)}
                        isDeleting={deleteMutation.isPending}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTable>

      <InterviewQuestionsDialog
        open={!!interviewTarget}
        onOpenChange={(open) => !open && setInterviewTarget(null)}
        entityType="certification"
        entityId={interviewTarget?.id ?? ""}
        entityName={interviewTarget?.title ?? ""}
      />
    </PageContainer>
  );
}
