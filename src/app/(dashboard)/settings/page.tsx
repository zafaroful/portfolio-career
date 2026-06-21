"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

type Settings = {
  name: string;
  email: string;
  bio: string | null;
  photoUrl: string | null;
  portfolioSlug: string | null;
  isPublic: boolean;
};

function SettingsForm({ settings }: { settings: Settings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: settings.name,
    bio: settings.bio ?? "",
    photoUrl: settings.photoUrl ?? "",
    portfolioSlug: settings.portfolioSlug ?? "",
    isPublic: settings.isPublic,
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch<Settings>("/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.upload<{ fileUrl: string }>(fd);
      setForm((f) => ({ ...f, photoUrl: res.data.fileUrl }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      name: form.name,
      bio: form.bio || null,
      photoUrl: form.photoUrl || null,
      portfolioSlug: form.portfolioSlug,
      isPublic: form.isPublic,
    });
  }

  const slug = form.portfolioSlug;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Profile photo</Label>
        <Input type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>
      <div className="space-y-2">
        <Label>Portfolio slug</Label>
        <Input
          value={form.portfolioSlug}
          onChange={(e) => setForm({ ...form, portfolioSlug: e.target.value.toLowerCase() })}
          pattern="[a-z0-9-]+"
          required
        />
        {slug && form.isPublic && (
          <p className="text-sm text-muted-foreground">
            Public URL:{" "}
            <Link href={`/portfolio/${slug}`} className="text-primary underline" target="_blank">
              /portfolio/{slug}
            </Link>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.isPublic}
          onCheckedChange={(v) => setForm({ ...form, isPublic: v === true })}
        />
        <Label>Make portfolio public</Label>
      </div>
      <Button type="submit" disabled={updateMutation.isPending}>
        Save settings
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/settings"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Profile and public portfolio configuration.</p>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : data?.data ? (
        <SettingsForm settings={data.data} key={data.data.portfolioSlug ?? data.data.email} />
      ) : (
        <p className="text-muted-foreground">Unable to load settings.</p>
      )}
    </div>
  );
}
