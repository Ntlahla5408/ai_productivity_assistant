import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, Sparkles, BookOpen, CheckCircle2, KeyRound, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { research } from "@/lib/ai.functions";
import { PageHeader, CopyButton, ClearButton } from "@/components/ui-helpers";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant" }] }),
  component: ResearchPage,
});

function parseSections(md: string) {
  const sections: Record<string, string[]> = {};
  let current = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) { current = h[1].trim(); sections[current] = []; }
    else if (current) {
      const t = line.trim();
      if (t) sections[current].push(t.replace(/^[-•]\s?/, ""));
    }
  }
  return sections;
}

const ICONS: Record<string, typeof BookOpen> = {
  "Summary": BookOpen,
  "Key Insights": KeyRound,
  "Recommendations": CheckCircle2,
  "Important Takeaways": Sparkles,
  "Suggested Follow-up Questions": HelpCircle,
};

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const fn = useServerFn(research);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { topic } }),
    onSuccess: (r) => setOutput(r.result),
    onError: (e: Error) => toast.error(e.message || "Failed to research"),
  });
  const sections = useMemo(() => (output ? parseSections(output) : null), [output]);
  const order = ["Summary", "Key Insights", "Recommendations", "Important Takeaways", "Suggested Follow-up Questions"];

  return (
    <div>
      <PageHeader
        icon={<Search className="h-5 w-5" />}
        title="AI Research Assistant"
        description="Get a structured briefing on any topic, ready to share."
      />
      <Card className="card-soft mb-6 border-0 shadow-soft">
        <CardContent className="p-6">
          <Label htmlFor="topic">Research topic</Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="topic"
              placeholder="e.g., B2B onboarding benchmarks for fintech in 2025"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && topic.trim().length >= 2) mutation.mutate(); }}
              className="sm:flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={() => mutation.mutate()} disabled={topic.trim().length < 2 || mutation.isPending} className="gap-2">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Research
              </Button>
              <ClearButton onClick={() => { setTopic(""); setOutput(""); }} />
              {output && <CopyButton text={output} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="grid place-items-center py-20 text-sm text-muted-foreground">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
            Researching "{topic}"…
          </CardContent>
        </Card>
      )}
      {!mutation.isPending && !sections && (
        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="grid place-items-center py-20 text-center text-sm text-muted-foreground">
            <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
            Enter a topic to generate a briefing
          </CardContent>
        </Card>
      )}
      {sections && (
        <div className="grid gap-4 md:grid-cols-2">
          {order.map((title) => {
            const items = sections[title];
            if (!items) return null;
            const Icon = ICONS[title] ?? BookOpen;
            const isSummary = title === "Summary";
            return (
              <Card
                key={title}
                className={`card-soft border-0 shadow-soft ${isSummary ? "md:col-span-2" : ""}`}
              >
                <CardContent className="p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                    <Icon className="h-4 w-4" /> {title}
                  </h3>
                  {isSummary ? (
                    <p className="text-sm leading-relaxed text-foreground/90">{items.join(" ")}</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {items.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
          <div className="md:col-span-2"><ResponsibleAINotice /></div>
        </div>
      )}
    </div>
  );
}
