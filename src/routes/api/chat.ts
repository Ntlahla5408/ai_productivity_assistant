import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are the AI Productivity Assistant — a helpful, accurate, professional workplace assistant.

Guidelines:
- Be concise, action-oriented, and structured. Use bullets and short paragraphs.
- Help with emails, meeting prep, summarization, planning, research, brainstorming, and writing.
- If a request needs information you don't have, ask one clarifying question.
- Avoid speculation; flag uncertainty plainly.
- Never produce harmful, discriminatory, or confidential-data-leaking content.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const auth = request.headers.get("authorization") ?? "";
        if (!auth.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
        const token = auth.slice(7);

        const url = process.env.SUPABASE_URL!;
        const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${token}`, apikey: anon } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        const messages = body.messages ?? [];
        const threadId = body.threadId;
        if (!threadId) return new Response("Missing threadId", { status: 400 });

        // Verify thread ownership
        const { data: thread, error: tErr } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (tErr || !thread) return new Response("Thread not found", { status: 404 });

        // Persist latest user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts as never,
          });

          // Auto-title if default
          if (thread.title === "New conversation") {
            const userText = (lastUser.parts as Array<{ type: string; text?: string }>)
              .filter((p) => p.type === "text" && p.text)
              .map((p) => p.text)
              .join(" ")
              .slice(0, 60);
            if (userText) {
              await supabase
                .from("chat_threads")
                .update({ title: userText })
                .eq("id", threadId);
            }
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistant = [...finalMessages].reverse().find((m) => m.role === "assistant");
            if (assistant) {
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "assistant",
                parts: assistant.parts as never,
              });
              await supabase
                .from("chat_threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            }
          },
        });
      },
    },
  },
});
