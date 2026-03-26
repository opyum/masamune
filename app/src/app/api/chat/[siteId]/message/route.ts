import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { streamHaikuResponse } from "@/lib/ai/haiku";
import { HAIKU_QUALIFYING_SYSTEM_PROMPT, extractBriefJson } from "@/lib/ai/prompts";
import { addJob } from "@/lib/queue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { siteId } = await params;
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return new Response(JSON.stringify({ error: "Site not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { siteId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { siteId },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  // Build messages for Haiku
  const aiMessages = [
    ...conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Stream response from Groq (OpenAI SSE format)
  const stream = await streamHaikuResponse(
    HAIKU_QUALIFYING_SYSTEM_PROMPT,
    aiMessages
  );

  // Use TransformStream to collect full response while streaming
  let fullResponse = "";

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = stream.body!.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      // Save assistant message
      await prisma.message.create({
        data: {
          conversationId: conversation!.id,
          role: "assistant",
          content: fullResponse,
        },
      });

      // Check if brief_json was generated
      const briefJson = extractBriefJson(fullResponse);
      if (briefJson) {
        // Update site with brief and trigger generation
        await prisma.site.update({
          where: { id: siteId },
          data: {
            briefJson: briefJson as object,
            status: "generating",
          },
        });

        await prisma.conversation.update({
          where: { id: conversation!.id },
          data: { briefExtracted: true },
        });

        // Generation will be triggered by the client via /api/generate/[siteId]
        // (Vercel hobby plan has 10s timeout, so fire-and-forget doesn't work)
        console.log(`[chat] Brief extracted for site ${siteId} — client will trigger generation`);
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
