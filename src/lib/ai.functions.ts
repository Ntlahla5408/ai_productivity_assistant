import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getProvider() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const EmailIn = z.object({
  recipient: z.string().min(1),
  subject: z.string().optional().default(""),
  purpose: z.string().min(1),
  tone: z.enum(["Professional", "Friendly", "Persuasive", "Follow-up", "Apology"]),
  instructions: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailIn.parse(d))
  .handler(async ({ data }) => {
    const gateway = getProvider();
    const sys = `You are an expert workplace communication assistant. Write polished, concise, and contextually appropriate professional emails. Output strictly in this format:

SUBJECT: <one-line subject>
BODY:
<email body, well-structured with greeting, paragraphs, and sign-off>`;
    const user = `Recipient: ${data.recipient}
Suggested subject: ${data.subject || "(generate one)"}
Purpose: ${data.purpose}
Tone: ${data.tone}
Additional instructions: ${data.instructions || "(none)"}`;
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: sys,
      prompt: user,
    });
    const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i);
    return {
      subject: subjectMatch?.[1]?.trim() ?? data.subject ?? "",
      body: (bodyMatch?.[1] ?? text).trim(),
    };
  });

const SummarizeIn = z.object({ notes: z.string().min(20) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummarizeIn.parse(d))
  .handler(async ({ data }) => {
    const gateway = getProvider();
    const sys = `You summarize meeting notes for busy professionals. Output strictly in this exact format with these section headers:

## Executive Summary
<2-4 sentence overview>

## Key Decisions
- <decision>
- <decision>

## Action Items
- <owner if known>: <action>

## Deadlines
- <item>: <deadline>

## Participants Mentioned
- <name or role>

If a section has no content, write "- None noted".`;
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: sys,
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    return { result: text.trim() };
  });

const TasksIn = z.object({ tasks: z.string().min(5) });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TasksIn.parse(d))
  .handler(async ({ data }) => {
    const gateway = getProvider();
    const sys = `You are an AI productivity planner. Take a list of tasks (one per line or comma separated) and output strictly in this format:

## Priority Order
1. <task> — <reason>
2. <task> — <reason>

## High Priority Tasks
- <task>
- <task>

## Suggested Daily Schedule
- 09:00 – 10:00: <task>
- 10:00 – 11:30: <task>
(continue through the workday)

## Estimated Time
- <task>: <estimate>

## Productivity Tips
- <tip>
- <tip>`;
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: sys,
      prompt: `Tasks:\n${data.tasks}`,
    });
    return { result: text.trim() };
  });

const ResearchIn = z.object({ topic: z.string().min(2) });

export const research = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchIn.parse(d))
  .handler(async ({ data }) => {
    const gateway = getProvider();
    const sys = `You are a research analyst. Given a topic, return a structured briefing in this exact format:

## Summary
<3-5 sentence overview>

## Key Insights
- <insight>
- <insight>
- <insight>

## Recommendations
- <recommendation>
- <recommendation>

## Important Takeaways
- <takeaway>
- <takeaway>

## Suggested Follow-up Questions
- <question>
- <question>
- <question>

Be factual, balanced, and avoid speculation. If uncertain, say so.`;
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: sys,
      prompt: `Topic: ${data.topic}`,
    });
    return { result: text.trim() };
  });
