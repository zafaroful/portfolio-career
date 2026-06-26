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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  FormField,
  PageContainer,
  PageHeader,
  TableActions,
} from "@/components/common";
import { SkillBadge } from "@/components/features/skills/skill-badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { InterviewQuestionsDialog } from "@/components/ai/interview-questions-dialog";

type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  yearsExperience: number;
};

const proficiencies = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    proficiency: "INTERMEDIATE",
    yearsExperience: 0,
  });
  const [interviewTarget, setInterviewTarget] = useState<Skill | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.get<Skill[]>("/skills"),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post<Skill>("/skills", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill created");
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof form }) =>
      api.patch<Skill>(`/skills/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill updated");
      setOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setForm({
      name: "",
      category: "",
      proficiency: "INTERMEDIATE",
      yearsExperience: 0,
    });
  }

  function openEdit(skill: Skill) {
    setEditing(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      yearsExperience: skill.yearsExperience,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const skills = data?.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Skills"
        description="Manage your skills and proficiency levels."
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
                  Add skill
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit skill" : "Add skill"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Name">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Category">
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Proficiency">
                  <Select
                    value={form.proficiency}
                    onValueChange={(v) => v && setForm({ ...form, proficiency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencies.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Years of experience">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.yearsExperience}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        yearsExperience: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </FormField>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        isLoading={isLoading}
        isEmpty={!isLoading && skills.length === 0}
        emptyIcon={Sparkles}
        emptyTitle="No skills yet"
        emptyDescription="Add your first skill to build your portfolio profile."
        emptyAction={{
          label: "Add your first skill",
          onClick: () => {
            resetForm();
            setOpen(true);
          },
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Proficiency</TableHead>
              <TableHead>Years</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell>{skill.name}</TableCell>
                <TableCell>{skill.category}</TableCell>
                <TableCell>
                  <SkillBadge proficiency={skill.proficiency} showLevel />
                </TableCell>
                <TableCell>{skill.yearsExperience}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setInterviewTarget(skill)}>
                      Prep
                    </Button>
                    <TableActions
                      onEdit={() => openEdit(skill)}
                      onDelete={() => deleteMutation.mutate(skill.id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <InterviewQuestionsDialog
        open={!!interviewTarget}
        onOpenChange={(open) => !open && setInterviewTarget(null)}
        entityType="skill"
        entityId={interviewTarget?.id ?? ""}
        entityName={interviewTarget?.name ?? ""}
      />
    </PageContainer>
  );
}
