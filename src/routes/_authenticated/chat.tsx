import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/threads.functions";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chat Assistant" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn(),
  });

  const createMut = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (pathname.includes(id)) navigate({ to: "/chat" });
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      <aside className="card-soft flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden">
        <div className="border-b p-3">
          <Button className="w-full gap-2" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && (
            <div className="grid place-items-center p-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!isLoading && threads.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet
            </div>
          )}
          <ul className="space-y-1">
            {threads.map((t) => {
              const active = pathname.endsWith(t.id);
              return (
                <li key={t.id} className="group flex items-center gap-1">
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-sm transition",
                      active ? "bg-primary-soft text-primary" : "hover:bg-muted",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={() => deleteMut.mutate(t.id)}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
      <section className="card-soft flex max-h-[calc(100dvh-7rem)] min-h-[calc(100dvh-7rem)] flex-col overflow-hidden">
        <Outlet />
      </section>
    </div>
  );
}
