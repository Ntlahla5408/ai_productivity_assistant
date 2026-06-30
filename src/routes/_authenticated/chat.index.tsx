import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread, listThreads } from "@/lib/threads.functions";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const { data: threads } = useQuery({ queryKey: ["threads"], queryFn: () => listFn() });
  const create = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
    },
  });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !threads) return;
    ran.current = true;
    if (threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
    } else {
      create.mutate();
    }
  }, [threads, create, navigate]);

  return (
    <div className="grid flex-1 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          {create.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <h2 className="text-lg font-semibold">Starting a new conversation…</h2>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" /> Your AI workplace assistant
        </p>
      </div>
    </div>
  );
}
