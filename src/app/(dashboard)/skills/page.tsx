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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage your skills and proficiency levels.</p>
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
                Add skill
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit skill" : "Add skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency</Label>
                <Select
                  value={form.proficiency}
                  onValueChange={(v) => v && setForm({ ...form, proficiency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencies.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Years of experience</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.yearsExperience}
                  onChange={(e) =>
                    setForm({ ...form, yearsExperience: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
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
                  <Badge variant="secondary">{skill.proficiency}</Badge>
                </TableCell>
                <TableCell>{skill.yearsExperience}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(skill)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
