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

  // Stream response from Haiku
  const stream = await streamHaikuResponse(
    HAIKU_QUALIFYING_SYSTEM_PROMPT,
    aiMessages
  );

  // Use TransformStream to collect full response while streaming
  let fullResponse = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          fullResponse += text;
          controller.enqueue(encoder.encode(text));
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
            briefJson: briefJson as any,
            status: "generating",
          },
        });

        await prisma.conversation.update({
          where: { id: conversation!.id },
          data: { briefExtracted: true },
        });

        // Enqueue generation job
        await addJob("generate-site", {
          siteId,
          briefJson,
        });
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
