import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsibleAINotice } from "@/components/responsible-ai";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "Dashboard — AI Productivity Assistant" }],
  }),
  component: Dashboard,
});

const quickActions = [
  { title: "Generate Email", desc: "Draft professional emails in seconds", icon: Mail, to: "/email", color: "bg-blue-500/10 text-blue-600" },
  { title: "Summarize Meeting", desc: "Turn notes into action items", icon: FileText, to: "/meetings", color: "bg-violet-500/10 text-violet-600" },
  { title: "Plan Tasks", desc: "Prioritize and schedule your day", icon: ListChecks, to: "/tasks", color: "bg-emerald-500/10 text-emerald-600" },
  { title: "Research Topic", desc: "Get a structured briefing", icon: Search, to: "/research", color: "bg-amber-500/10 text-amber-700" },
  { title: "Open AI Chat", desc: "Ask anything, workplace-ready", icon: MessageSquare, to: "/chat", color: "bg-rose-500/10 text-rose-600" },
] as const;

const stats = [
  { label: "Emails Generated", value: 124, delta: "+12 this week", icon: Mail },
  { label: "Meetings Summarized", value: 38, delta: "+4 this week", icon: FileText },
  { label: "Tasks Planned", value: 76, delta: "+9 this week", icon: ListChecks },
  { label: "Research Requests", value: 21, delta: "+3 this week", icon: Search },
];

const activity = [
  { title: "Summarized Q3 Planning Sync", time: "2h ago", icon: FileText },
  { title: "Drafted follow-up email to Acme Co.", time: "5h ago", icon: Mail },
  { title: "Planned tomorrow's tasks", time: "Yesterday", icon: ListChecks },
  { title: "Researched 'B2B onboarding benchmarks'", time: "2 days ago", icon: Search },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-elevated sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90">
          <Sparkles className="h-4 w-4" /> Welcome back
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Let's make today productive
        </h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">
          Your AI workplace co-pilot for emails, meetings, planning and research — all in one
          professional workspace.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group card-soft p-5 transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className={`mb-4 inline-grid h-11 w-11 place-items-center rounded-xl ${a.color}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{a.title}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Productivity overview
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="card-soft border-0 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="h-3 w-3" /> {s.delta}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="card-soft border-0 shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-4">
            {activity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-muted"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="truncate text-sm font-medium">{item.title}</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {item.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-soft border-0 bg-gradient-to-br from-amber-50 to-white shadow-soft dark:from-amber-950/30 dark:to-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-600">
                <Lightbulb className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">AI Tip of the Day</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">
              Start your prompts with the goal and the audience. "Write a 3-sentence
              follow-up to a client after a discovery call" beats "write an email."
            </p>
            <ResponsibleAINotice className="mt-4" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
