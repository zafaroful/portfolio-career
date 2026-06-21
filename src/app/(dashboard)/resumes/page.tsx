"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";

type Resume = {
  id: string;
  versionName: string;
  templateId: string;
  fileUrl: string | null;
  generatedAt: string;
};

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [versionName, setVersionName] = useState("");
  const [templateId, setTemplateId] = useState<"modern" | "classic">("modern");

  const { data, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get<Resume[]>("/resumes"),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      api.post<Resume>("/resumes/generate", { versionName, templateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume generated");
      setVersionName("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resumes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resumes</h1>
        <p className="text-muted-foreground">Generate and download PDF resumes from your data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Version name</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Software Engineer 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateId} onValueChange={(v) => setTemplateId(v as "modern" | "classic")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!versionName || generateMutation.isPending}
          >
            <FileText className="mr-2 h-4 w-4" />
            {generateMutation.isPending ? "Generating..." : "Generate PDF"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell>{resume.versionName}</TableCell>
                    <TableCell>{resume.templateId}</TableCell>
                    <TableCell>{format(new Date(resume.generatedAt), "PP p")}</TableCell>
                    <TableCell>
                      <a
                        href={`/api/v1/resumes/${resume.id}/download`}
                        className="inline-flex items-center gap-1 text-primary underline"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
