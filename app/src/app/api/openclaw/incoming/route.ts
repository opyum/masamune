import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const OPENCLAW_WEBHOOK_SECRET = process.env.OPENCLAW_WEBHOOK_SECRET || "";
const OPENCLAW_URL = process.env.OPENCLAW_URL || "http://openclaw:3002";

interface IncomingMessage {
  channel: "whatsapp" | "telegram" | "discord";
  senderId: string;
  senderName?: string;
  message: string;
  messageId: string;
  timestamp: string;
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!OPENCLAW_WEBHOOK_SECRET || !signature) return !OPENCLAW_WEBHOOK_SECRET;
  const expected = crypto
    .createHmac("sha256", OPENCLAW_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-openclaw-signature");

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let incoming: IncomingMessage;
  try {
    incoming = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { channel, senderId, message } = incoming;

  // Look up user via channel_links
  const channelLink = await prisma.channelLink.findFirst({
    where: {
      channel,
      senderId,
      verified: true,
    },
    include: {
      user: {
        include: {
          sites: {
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!channelLink) {
    // Unlinked user — send instruction to link their account
    await sendOpenClawMessage(channel, senderId,
      "Bienvenue sur Masamune ! Pour utiliser ce service, liez votre compte depuis votre tableau de bord : https://masamune.app/dashboard/channels"
    );
    return NextResponse.json({ handled: true, action: "unlinked_user" });
  }

  const user = channelLink.user;
  const activeSite = user.sites[0];

  if (!activeSite) {
    await sendOpenClawMessage(channel, senderId,
      "Vous n'avez pas encore de site. Creez-en un depuis votre tableau de bord : https://masamune.app/dashboard/new"
    );
    return NextResponse.json({ handled: true, action: "no_site" });
  }

  // Route message to chat API for the active site
  try {
    const chatResponse = await fetch(
      `${process.env.SITE_URL || "http://app:3000"}/api/chat/${activeSite.id}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Internal call — bypass auth with service header
          "x-service-key": process.env.SUPABASE_SERVICE_KEY || "",
        },
        body: JSON.stringify({ message, userId: user.id }),
      }
    );

    if (!chatResponse.ok) {
      throw new Error(`Chat API returned ${chatResponse.status}`);
    }

    // Read the streamed response fully
    const responseText = await chatResponse.text();

    // Send AI response back via OpenClaw
    // Strip brief_json blocks from response
    const cleanResponse = responseText.replace(/```brief_json[\s\S]*?```/g, "").trim();

    if (cleanResponse) {
      await sendOpenClawMessage(channel, senderId, cleanResponse);
    }

    return NextResponse.json({ handled: true, action: "chat_response" });

  } catch (error: any) {
    console.error("[openclaw-incoming] Error routing message:", error.message);
    await sendOpenClawMessage(channel, senderId,
      "Desole, une erreur est survenue. Reessayez dans quelques instants."
    );
    return NextResponse.json({ handled: true, action: "error" });
  }
}

async function sendOpenClawMessage(
  channel: string,
  recipientId: string,
  message: string
): Promise<void> {
  try {
    await fetch(`${OPENCLAW_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCLAW_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ channel, recipientId, message }),
    });
  } catch (error: any) {
    console.error(`[openclaw] Failed to send message:`, error.message);
  }
}
