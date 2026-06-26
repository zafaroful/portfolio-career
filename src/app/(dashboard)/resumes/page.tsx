"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DataTable,
  FormField,
  PageContainer,
  PageHeader,
  ConfirmDialog,
} from "@/components/common";
import {
  cn,
  formatDate,
  getFileExtension,
  getVersionNameFromFilename,
  isAllowedResumeFile,
} from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Upload, Eye, Sparkles, Trash2, Target } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePreview, type ResumeTemplateId } from "@/components/resume/template-preview";

type Resume = {
  id: string;
  versionName: string;
  templateId: string;
  fileUrl: string | null;
  generatedAt: string;
};

function getTemplateLabel(templateId: string) {
  if (templateId === "uploaded") return "Uploaded";
  if (templateId === "modern") return "Modern";
  if (templateId === "classic") return "Classic";
  if (templateId === "minimal") return "Minimal";
  return templateId;
}

function getDownloadLabel(resume: Resume) {
  if (!resume.fileUrl) return "File";
  const ext = getFileExtension(resume.fileUrl.split("?")[0] ?? "");
  return ext?.toUpperCase() ?? "PDF";
}

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadVersionName, setUploadVersionName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [generateVersionName, setGenerateVersionName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("modern");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tailorPlan, setTailorPlan] = useState<{
    highlightedProjectIds: string[];
    highlightedSkillIds: string[];
    rewrittenProjectBullets: { projectId: string; bullets: string[] }[];
    summaryLine: string;
    suggestedVersionName: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get<Resume[]>("/resumes"),
  });

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (file && !isAllowedResumeFile(file)) {
      toast.error("Please choose a PDF, DOC, or DOCX file");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file && !uploadVersionName.trim()) {
      setUploadVersionName(getVersionNameFromFilename(file.name));
    }
  }

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error("No file selected");
      const resolvedName =
        uploadVersionName.trim() || getVersionNameFromFilename(selectedFile.name);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("versionName", resolvedName);
      return api.uploadResume<Resume>(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume uploaded");
      setUploadVersionName("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tailorMutation = useMutation({
    mutationFn: () =>
      api.aiTailorResume<NonNullable<typeof tailorPlan>>({
        jobDescription,
        targetRole: targetRole || undefined,
        templateId: selectedTemplate,
      }),
    onSuccess: (res) => {
      setTailorPlan(res.data);
      if (!generateVersionName.trim()) {
        setGenerateVersionName(res.data.suggestedVersionName);
      }
      toast.success("Tailoring preview ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      const versionName = generateVersionName.trim() || "Generated Resume";
      return api.generateResume<Resume>({
        versionName,
        templateId: selectedTemplate,
        jobDescription: jobDescription || undefined,
        tailoringHints: tailorPlan ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resume generated");
      setGenerateVersionName("");
      setTailorPlan(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Resume deleted");
      setDeleteTarget(null);
      setPreviewResume((current) => (current?.id === deletedId ? null : current));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resumes = data?.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Resumes"
        description="Generate PDF resumes from your portfolio or upload existing files."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="text-base">Generate resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Version name"
              description="Name this version for easy reference."
            >
              <Input
                value={generateVersionName}
                onChange={(e) => setGenerateVersionName(e.target.value)}
                placeholder="e.g. Senior Developer CV"
              />
            </FormField>
            <FormField label="Template" description="Choose a layout style for your PDF.">
              <TemplatePreview
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </FormField>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              <Sparkles className="mr-2 size-4" />
              {generateMutation.isPending ? "Generating..." : "Generate PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="text-base">Upload resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <FormField
            label="Version name"
            description="Optional — defaults to the file name if left empty."
          >
            <Input
              value={uploadVersionName}
              onChange={(e) => setUploadVersionName(e.target.value)}
              placeholder="e.g. Senior Developer CV"
            />
          </FormField>
          <FormField
            label="Resume file"
            description="PDF, DOC, or DOCX up to 10 MB."
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className={cn(
                "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
              )}
            />
            {selectedFile ? (
              <p className="text-caption">Selected: {selectedFile.name}</p>
            ) : null}
          </FormField>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            <Upload className="mr-2 size-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload file"}
          </Button>
        </CardContent>
      </Card>

        <Card className="shadow-elevation-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Tailor for job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Job description">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting here..."
                rows={4}
              />
            </FormField>
            <FormField label="Target role (optional)">
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
              />
            </FormField>
            <FormField label="Template">
              <TemplatePreview selected={selectedTemplate} onSelect={setSelectedTemplate} />
            </FormField>
            <Button
              variant="outline"
              onClick={() => tailorMutation.mutate()}
              disabled={tailorMutation.isPending || jobDescription.trim().length < 10}
            >
              <Target className="mr-2 size-4" />
              {tailorMutation.isPending ? "Analyzing..." : "Preview tailoring"}
            </Button>
            {tailorPlan && (
              <div className="space-y-2 rounded-md border p-3 text-sm">
                <p className="font-medium">Summary</p>
                <p className="text-muted-foreground">{tailorPlan.summaryLine}</p>
                <p className="font-medium">
                  Highlighting {tailorPlan.highlightedProjectIds.length} projects,{" "}
                  {tailorPlan.highlightedSkillIds.length} skills
                </p>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  <Sparkles className="mr-2 size-4" />
                  Generate tailored PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="text-base">Version history</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            isLoading={isLoading}
            isEmpty={!isLoading && resumes.length === 0}
            emptyIcon={FileText}
            emptyTitle="No resumes yet"
            emptyDescription="Generate a PDF from your portfolio or upload an existing file."
            className="border-0 shadow-none"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell>{resume.versionName}</TableCell>
                    <TableCell>
                      <Badge variant={resume.templateId === "uploaded" ? "secondary" : "default"}>
                        {getTemplateLabel(resume.templateId)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(resume.generatedAt, "PP p")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewResume(resume)}
                          className="h-8"
                        >
                          <Eye className="mr-1 size-4" />
                          Preview
                        </Button>
                        <a
                          href={`/api/v1/resumes/${resume.id}/download`}
                          className="inline-flex items-center gap-1 text-primary underline"
                        >
                          <Download className="size-4" />
                          {getDownloadLabel(resume)}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(resume)}
                          className="h-8 text-destructive hover:text-destructive"
                          aria-label={`Delete ${resume.versionName}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>

      <Dialog open={!!previewResume} onOpenChange={() => setPreviewResume(null)}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewResume?.versionName}</DialogTitle>
          </DialogHeader>
          {previewResume && (
            <div className="flex-1 overflow-hidden rounded-md border">
              {previewResume.fileUrl?.endsWith('.pdf') || 
               !previewResume.fileUrl?.match(/\.(doc|docx)$/i) ? (
                <iframe
                  src={`/api/v1/resumes/${previewResume.id}/preview`}
                  className="w-full h-full"
                  title={previewResume.versionName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="size-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Word documents (.doc, .docx) cannot be previewed in the browser.
                  </p>
                  <a
                    href={`/api/v1/resumes/${previewResume.id}/download`}
                    className="inline-flex items-center gap-2"
                  >
                    <Button>
                      <Download className="mr-2 size-4" />
                      Download to view
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete resume"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.versionName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
