import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { PageHeader, CopyButton, ClearButton, RegenerateButton } from "@/components/ui-helpers";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator" }] }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Persuasive", "Follow-up", "Apology"] as const;
type Tone = (typeof TONES)[number];

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [instructions, setInstructions] = useState("");
  const [outSubject, setOutSubject] = useState("");
  const [outBody, setOutBody] = useState("");

  const fn = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: () =>
      fn({ data: { recipient, subject, purpose, tone, instructions } }),
    onSuccess: (res) => {
      setOutSubject(res.subject);
      setOutBody(res.body);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to generate email"),
  });

  function clearAll() {
    setRecipient(""); setSubject(""); setPurpose(""); setInstructions("");
    setOutSubject(""); setOutBody("");
  }

  const canGen = recipient.trim() && purpose.trim() && !mutation.isPending;

  return (
    <div>
      <PageHeader
        icon={<Mail className="h-5 w-5" />}
        title="Smart Email Generator"
        description="Draft professional, tone-tuned emails in seconds."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g., Sarah Chen, Product Manager at Acme"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="Leave blank and AI will craft one"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="purpose">Email purpose</Label>
              <Textarea
                id="purpose"
                rows={3}
                placeholder="What do you want this email to accomplish?"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ins">Additional instructions</Label>
              <Textarea
                id="ins"
                rows={3}
                placeholder="Specific points to include, constraints, length…"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => mutation.mutate()} disabled={!canGen} className="gap-2">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Email
              </Button>
              <ClearButton onClick={clearAll} />
            </div>
          </CardContent>
        </Card>

        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Generated email
              </h3>
              <div className="flex gap-2">
                <RegenerateButton
                  onClick={() => mutation.mutate()}
                  loading={mutation.isPending}
                />
                <CopyButton text={outSubject ? `Subject: ${outSubject}\n\n${outBody}` : ""} />
              </div>
            </div>
            {mutation.isPending && !outBody && (
              <div className="grid place-items-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                Drafting your email…
              </div>
            )}
            {!mutation.isPending && !outBody && (
              <div className="grid place-items-center rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                <Mail className="mb-2 h-8 w-8 text-muted-foreground/50" />
                Fill in the details and click Generate Email
              </div>
            )}
            {outBody && (
              <>
                <div>
                  <Label htmlFor="outsubj">Subject</Label>
                  <Input id="outsubj" value={outSubject} onChange={(e) => setOutSubject(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="outbody">Email body</Label>
                  <Textarea
                    id="outbody"
                    rows={14}
                    value={outBody}
                    onChange={(e) => setOutBody(e.target.value)}
                    className="font-mono text-sm leading-relaxed"
                  />
                </div>
                <ResponsibleAINotice />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
