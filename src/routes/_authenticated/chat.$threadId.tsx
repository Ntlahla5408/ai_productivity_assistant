import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Sparkles, User, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

const SUGGESTED = [
  "Draft a polite follow-up email after a sales demo.",
  "Summarize the key risks of launching a feature this week.",
  "Help me prepare 5 questions for my 1:1 with my manager.",
  "Brainstorm 10 names for an internal AI productivity tool.",
];

function ChatThread() {
  const { threadId } = Route.useParams();
  const getMessages = useServerFn(getThreadMessages);
  const qc = useQueryClient();

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: async () => {
      const rows = await getMessages({ data: { threadId } });
      return rows.map((r) => ({
        id: r.id,
        role: r.role,
        parts: r.parts as UIMessage["parts"],
      })) as UIMessage[];
    },
  });

  if (isLoading || !initialMessages) {
    return (
      <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  return <ChatInner threadId={threadId} initial={initialMessages} onTitled={() => qc.invalidateQueries({ queryKey: ["threads"] })} />;
}

function ChatInner({
  threadId,
  initial,
  onTitled,
}: {
  threadId: string;
  initial: UIMessage[];
  onTitled: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        fetch: async (url, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(url, { ...init, headers });
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onFinish: () => onTitled(),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const loading = status === "submitted" || status === "streaming";

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI Chat Assistant</div>
            <div className="text-xs text-muted-foreground">Workplace co-pilot</div>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl space-y-6 py-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">How can I help you today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these workplace prompts:</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="card-soft p-3 text-left text-sm transition hover:border-primary/40 hover:shadow-elevated"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 pt-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="ml-2">Thinking…</span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.message || "Something went wrong"}
            </div>
          )}
        </div>
      </div>
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="relative"
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              rows={1}
              placeholder="Ask anything for work… (Shift + Enter for newline)"
              className="min-h-[52px] resize-none rounded-2xl border-border bg-card pr-14 text-sm shadow-soft"
              disabled={loading}
            />
            <div className="absolute bottom-2 right-2">
              {loading ? (
                <Button type="button" size="icon" variant="secondary" onClick={() => stop()} aria-label="Stop">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
          <ResponsibleAINotice className="mt-3" />
        </div>
      </div>
    </>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[85%]", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground prose-chat",
          )}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{text}</span>
          ) : (
            <ReactMarkdown>{text}</ReactMarkdown>
          )}
        </div>
        <div className="mt-1 px-1 text-[10px] text-muted-foreground">{time}</div>
      </div>
    </div>
  );
}
