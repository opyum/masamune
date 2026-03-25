import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import crypto from "crypto";

const OPENCLAW_URL = process.env.OPENCLAW_URL || "http://openclaw:3002";
const OPENCLAW_WEBHOOK_SECRET = process.env.OPENCLAW_WEBHOOK_SECRET || "";

import { pendingCodes } from "@/lib/verification-codes";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { channel, senderId } = await request.json();

  if (!channel || !senderId) {
    return NextResponse.json(
      { error: "channel and senderId are required" },
      { status: 400 }
    );
  }

  const validChannels = ["whatsapp", "telegram", "discord"];
  if (!validChannels.includes(channel)) {
    return NextResponse.json(
      { error: "Invalid channel. Must be whatsapp, telegram, or discord" },
      { status: 400 }
    );
  }

  // Check if already linked
  const existing = await prisma.channelLink.findFirst({
    where: { userId: user!.id, channel, senderId, verified: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ce canal est deja lie a votre compte" },
      { status: 409 }
    );
  }

  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const codeKey = `${channel}:${senderId}`;

  pendingCodes.set(codeKey, {
    userId: user!.id,
    channel,
    senderId,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Store the code separately for verification
  pendingCodes.set(`code:${codeKey}`, {
    userId: user!.id,
    channel,
    senderId,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  // Use a second map entry for the actual code
  pendingCodes.set(`verify:${user!.id}:${channel}`, {
    userId: code, // Reuse field to store code
    channel,
    senderId,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  // Send verification code via OpenClaw
  try {
    await fetch(`${OPENCLAW_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCLAW_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        channel,
        recipientId: senderId,
        message: `Votre code de verification Masamune : ${code}\n\nCe code expire dans 10 minutes.`,
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[channel-link] Failed to send verification code:", message);
    return NextResponse.json(
      { error: "Impossible d'envoyer le code. Verifiez votre identifiant." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Code de verification envoye",
    expiresIn: 600,
  });
}
