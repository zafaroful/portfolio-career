"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FormField,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/common";
import { toast } from "sonner";
import { useState } from "react";
import { isValidHttpUrl, normalizeExternalUrl } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import { AiAssistButton } from "@/components/ai/ai-assist-button";
import { AiResultPanel } from "@/components/ai/ai-result-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Settings = {
  name: string;
  email: string;
  bio: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  isPublic: boolean;
};

function SettingsForm({ settings }: { settings: Settings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: settings.name,
    bio: settings.bio ?? "",
    photoUrl: settings.photoUrl ?? "",
    linkedinUrl: settings.linkedinUrl ?? "",
    isPublic: settings.isPublic,
  });
  const [aiBio, setAiBio] = useState<string | null>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<{
    title: string;
    description: string;
    keywords: string[];
  } | null>(null);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch<Settings>("/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bioMutation = useMutation({
    mutationFn: () => api.aiGenerateBio<{ bio: string }>({ tone: "professional" }),
    onSuccess: (res) => setAiBio(res.data.bio),
    onError: (e: Error) => toast.error(e.message),
  });

  const seoMutation = useMutation({
    mutationFn: () =>
      api.aiSeoOptimizer<{ title: string; description: string; keywords: string[] }>(),
    onSuccess: (res) => setSeoSuggestions(res.data),
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
    const normalizedLinkedIn = normalizeExternalUrl(form.linkedinUrl);
    if (form.linkedinUrl.trim() && !normalizedLinkedIn) {
      toast.error("Enter a valid LinkedIn profile URL");
      return;
    }
    if (normalizedLinkedIn && !isValidHttpUrl(normalizedLinkedIn)) {
      toast.error("Enter a valid LinkedIn profile URL");
      return;
    }
    updateMutation.mutate({
      name: form.name,
      bio: form.bio || null,
      photoUrl: form.photoUrl || null,
      linkedinUrl: normalizedLinkedIn,
      isPublic: form.isPublic,
    });
  }

  const linkedinHref = normalizeExternalUrl(form.linkedinUrl);

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <FormField label="Name">
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </FormField>
      <FormField
        label="Bio"
        action={
          <AiAssistButton
            onClick={() => bioMutation.mutate()}
            isLoading={bioMutation.isPending}
            label="Generate bio"
          />
        }
      >
        <Textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </FormField>
      {aiBio && (
        <AiResultPanel
          content={aiBio}
          onAccept={() => {
            setForm({ ...form, bio: aiBio });
            setAiBio(null);
          }}
          onRegenerate={() => bioMutation.mutate()}
          onDiscard={() => setAiBio(null)}
          isRegenerating={bioMutation.isPending}
        />
      )}
      <FormField label="Profile photo">
        <div className="space-y-3">
          {form.photoUrl && (
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage src={form.photoUrl} alt={form.name} />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                Current profile photo
              </div>
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>
      </FormField>
      <FormField
        label="LinkedIn profile URL"
        description="Your public LinkedIn profile link."
      >
        <Input
          type="url"
          value={form.linkedinUrl}
          onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
          placeholder="https://www.linkedin.com/in/your-profile"
        />
        {linkedinHref && isValidHttpUrl(linkedinHref) ? (
          <a
            href={linkedinHref}
            className="text-sm text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn profile
          </a>
        ) : null}
      </FormField>
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

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">SEO Optimizer</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => seoMutation.mutate()}
            disabled={seoMutation.isPending}
          >
            <Sparkles className="mr-1.5 size-3.5" />
            Optimize SEO
          </Button>
        </CardHeader>
        {seoSuggestions && (
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Suggested title</p>
              <p className="text-muted-foreground">{seoSuggestions.title}</p>
            </div>
            <div>
              <p className="font-medium">Meta description</p>
              <p className="text-muted-foreground">{seoSuggestions.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {seoSuggestions.keywords.map((kw) => (
                <Badge key={kw} variant="secondary">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </form>
  );
}

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/settings"),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Profile and public portfolio configuration."
      />

      {isLoading ? (
        <LoadingState variant="form" />
      ) : isError ? (
        <div className="max-w-lg space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {(error as Error).message || "Unable to load settings."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : data?.data ? (
        <SettingsForm settings={data.data} key={data.data.email} />
      ) : (
        <p className="text-muted-foreground">Unable to load settings.</p>
      )}
    </PageContainer>
  );
}
