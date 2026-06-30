import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, ShieldCheck, Bell, Brain, User, Info, Moon } from "lucide-react";
import { PageHeader } from "@/components/ui-helpers";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const [dark, setDark] = useState<boolean>(
    typeof window !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const [notif, setNotif] = useState({ email: true, product: false, weekly: true });
  const [ai, setAi] = useState({ longerAnswers: false, suggestPrompts: true, saveHistory: true });

  return (
    <div>
      <PageHeader icon={<SettingsIcon className="h-5 w-5" />} title="Settings" description="Manage your profile, AI behavior, and privacy." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-soft border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>User ID</Label>
              <Input value={user?.id ?? ""} readOnly className="mt-1 bg-muted font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center gap-2">
            <Moon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Dark mode" hint="Use a dark color theme">
              <Switch checked={dark} onCheckedChange={setDark} />
            </Row>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Email notifications" hint="Receive activity summaries by email">
              <Switch checked={notif.email} onCheckedChange={(v) => setNotif({ ...notif, email: v })} />
            </Row>
            <Separator />
            <Row label="Product updates" hint="New features and improvements">
              <Switch checked={notif.product} onCheckedChange={(v) => setNotif({ ...notif, product: v })} />
            </Row>
            <Separator />
            <Row label="Weekly productivity digest" hint="Your stats every Monday">
              <Switch checked={notif.weekly} onCheckedChange={(v) => setNotif({ ...notif, weekly: v })} />
            </Row>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">AI Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Longer, more detailed answers" hint="Prefer depth over brevity">
              <Switch checked={ai.longerAnswers} onCheckedChange={(v) => setAi({ ...ai, longerAnswers: v })} />
            </Row>
            <Separator />
            <Row label="Show suggested prompts" hint="In the chat empty state">
              <Switch checked={ai.suggestPrompts} onCheckedChange={(v) => setAi({ ...ai, suggestPrompts: v })} />
            </Row>
            <Separator />
            <Row label="Save chat history" hint="Conversations stored in your account">
              <Switch checked={ai.saveHistory} onCheckedChange={(v) => setAi({ ...ai, saveHistory: v })} />
            </Row>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Privacy & Responsible AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/85">
            <p><strong>Your data.</strong> Your chat history is stored in your account and protected by row-level security — only you can access it.</p>
            <p><strong>How we use AI.</strong> We send your prompts to a large language model to generate responses. We never use them to train external models.</p>
            <p><strong>Responsible AI policy.</strong> The AI Productivity Assistant is designed to support — not replace — your professional judgment. Always review AI-generated content for accuracy, bias, and appropriateness before sending or acting on it. Do not use the assistant to process confidential personal data, regulated information, or for high-stakes decisions without human review.</p>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/85">
            <p><strong>AI Productivity Assistant</strong> — v1.0</p>
            <p className="mt-1 text-muted-foreground">A unified workplace AI for emails, meetings, planning, research, and chat. Built with TanStack Start, Lovable Cloud, and the Lovable AI Gateway.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </div>
  );
}
