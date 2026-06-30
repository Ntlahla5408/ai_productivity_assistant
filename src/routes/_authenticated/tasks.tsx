import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Loader2, Sparkles, Clock, Flame, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { planTasks } from "@/lib/ai.functions";
import { PageHeader, CopyButton, ClearButton } from "@/components/ui-helpers";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "AI Task Planner" }] }),
  component: TasksPage,
});

function parseSections(md: string) {
  const sections: Record<string, string[]> = {};
  let current = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) { current = h[1].trim(); sections[current] = []; }
    else if (current) {
      const t = line.trim();
      if (t) sections[current].push(t.replace(/^([-•]|\d+\.)\s?/, ""));
    }
  }
  return sections;
}

function TasksPage() {
  const [tasks, setTasks] = useState("");
  const [output, setOutput] = useState("");
  const fn = useServerFn(planTasks);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { tasks } }),
    onSuccess: (r) => setOutput(r.result),
    onError: (e: Error) => toast.error(e.message || "Failed to plan tasks"),
  });
  const sections = useMemo(() => (output ? parseSections(output) : null), [output]);

  return (
    <div>
      <PageHeader
        icon={<ListChecks className="h-5 w-5" />}
        title="AI Task Planner"
        description="Prioritize your day, get a suggested schedule, and ship more."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="card-soft border-0 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="tasks">Your tasks</Label>
              <Textarea
                id="tasks"
                rows={14}
                placeholder={"One task per line, for example:\n- Finish Q3 OKR draft\n- Prep board slides\n- Reply to vendor\n- 1:1 with Sam"}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => mutation.mutate()}
                disabled={tasks.trim().length < 5 || mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Plan my day
              </Button>
              <ClearButton onClick={() => { setTasks(""); setOutput(""); }} />
              {output && <CopyButton text={output} />}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mutation.isPending && (
            <Card className="card-soft border-0 shadow-soft">
              <CardContent className="grid place-items-center py-16 text-sm text-muted-foreground">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                Building your plan…
              </CardContent>
            </Card>
          )}
          {!mutation.isPending && !sections && (
            <Card className="card-soft border-0 shadow-soft">
              <CardContent className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
                <ListChecks className="mb-2 h-8 w-8 text-muted-foreground/50" />
                Add your tasks and we'll prioritize and schedule them
              </CardContent>
            </Card>
          )}
          {sections && (
            <>
              {sections["Priority Order"] && (
                <Card className="card-soft border-0 shadow-soft">
                  <CardContent className="p-5">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Priority Order</h3>
                    <ol className="space-y-2 text-sm">
                      {sections["Priority Order"].map((t, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
              {sections["High Priority Tasks"] && (
                <Card className="card-soft border-0 shadow-soft">
                  <CardContent className="p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-destructive">
                      <Flame className="h-4 w-4" /> High Priority
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sections["High Priority Tasks"].map((t, i) => (
                        <span key={i} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{t}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {sections["Suggested Daily Schedule"] && (
                <Card className="card-soft border-0 shadow-soft">
                  <CardContent className="p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                      <Clock className="h-4 w-4" /> Suggested Schedule
                    </h3>
                    <ol className="relative space-y-3 border-l-2 border-primary/20 pl-5">
                      {sections["Suggested Daily Schedule"].map((t, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                          <div className="text-sm">{t}</div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
              {sections["Estimated Time"] && (
                <Card className="card-soft border-0 shadow-soft">
                  <CardContent className="p-5">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Estimated Time</h3>
                    <ul className="space-y-1.5 text-sm">
                      {sections["Estimated Time"].map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {sections["Productivity Tips"] && (
                <Card className="card-soft border-0 bg-gradient-to-br from-amber-50 to-white shadow-soft dark:from-amber-950/30 dark:to-card">
                  <CardContent className="p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <Lightbulb className="h-4 w-4" /> Productivity Tips
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      {sections["Productivity Tips"].map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              <ResponsibleAINotice />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
