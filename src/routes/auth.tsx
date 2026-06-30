import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — AI Productivity Assistant" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-primary-soft via-background to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elevated">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Productivity Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your AI workplace co-pilot</p>
        </div>
        <Card className="card-soft border-0 p-6 shadow-elevated">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <EmailForm
                cta="Sign in"
                loading={loading}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                onSubmit={handleEmail}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <EmailForm
                cta="Create account"
                loading={loading}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                onSubmit={handleEmail}
              />
            </TabsContent>
          </Tabs>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" className="w-full gap-2" onClick={signInGoogle} disabled={loading}>
            <GoogleIcon /> Continue with Google
          </Button>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to use AI responsibly. Outputs may be inaccurate — verify before acting.
        </p>
      </div>
    </div>
  );
}

function EmailForm(props: {
  cta: string;
  loading: boolean;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={props.email} onChange={(e) => props.setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={6} value={props.password} onChange={(e) => props.setPassword(e.target.value)} autoComplete={props.cta === "Sign in" ? "current-password" : "new-password"} />
      </div>
      <Button type="submit" className="w-full" disabled={props.loading}>
        {props.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {props.cta}
      </Button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}
