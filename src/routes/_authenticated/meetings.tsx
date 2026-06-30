import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { summarizeMeeting } from "@/lib/ai.functions";
import { PageHeader, CopyButton, ClearButton } from "@/components/ui-helpers";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer" }] }),
  component: MeetingsPage,
});

function parseSections(md: string) {
  const sections: Record<string, string[]> = {};
  let current = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      current = h[1].trim();
      sections[current] = [];
    } else if (current) {
      const t = line.trim();
      if (t) sections[current].push(t.replace(/^[-•]\s?/, ""));
    }
  }
  return sections;
}

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const fn = useServerFn(summarizeMeeting);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onSuccess: (r) => setOutput(r.result),
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });
  const sections = useMemo(() => (output ? parseSections(output) : null), [output]);
  const order = ["Executive Summary", "Key Decisions", "Action Items", "Deadlines", "Participants Mentioned"];

  return (
    <div>
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Meeting Notes Summarizer"
        description="Turn raw meeting notes into a structured, scannable summary."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="notes">Paste your meeting notes</Label>
              <Textarea
                id="notes"
                rows={18}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the full transcript or your raw bullet-point notes here…"
                className="text-sm leading-relaxed"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => mutation.mutate()}
                disabled={notes.trim().length < 20 || mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Summarize
              </Button>
              <ClearButton onClick={() => { setNotes(""); setOutput(""); }} />
              {output && <CopyButton text={output} />}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mutation.isPending && (
            <Card className="card-soft border-0 shadow-soft">
              <CardContent className="grid place-items-center py-16 text-sm text-muted-foreground">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                Analyzing meeting notes…
              </CardContent>
            </Card>
          )}
          {!mutation.isPending && !sections && (
            <Card className="card-soft border-0 shadow-soft">
              <CardContent className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
                Paste notes and click Summarize to see the breakdown
              </CardContent>
            </Card>
          )}
          {sections &&
            order.map((title) => {
              const items = sections[title];
              if (!items) return null;
              return (
                <Card key={title} className="card-soft border-0 shadow-soft">
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                      {title}
                    </h3>
                    {title === "Executive Summary" ? (
                      <p className="text-sm leading-relaxed text-foreground/90">{items.join(" ")}</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {items.map((i, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          {sections && <ResponsibleAINotice />}
        </div>
      </div>
    </div>
  );
}
