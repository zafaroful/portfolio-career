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
  DataTable,
  FormField,
  PageContainer,
  PageHeader,
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
import { Download, FileText, Upload } from "lucide-react";

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

  const resumes = data?.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Resumes"
        description="Upload and manage your resume files."
      />

      <Card className="max-w-xl shadow-elevation-sm">
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
            emptyDescription="Upload a resume file to get started."
            className="border-0 shadow-none"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Download</TableHead>
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
                      <a
                        href={`/api/v1/resumes/${resume.id}/download`}
                        className="inline-flex items-center gap-1 text-primary underline"
                      >
                        <Download className="size-4" />
                        {getDownloadLabel(resume)}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
