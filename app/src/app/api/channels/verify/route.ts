import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { pendingCodes } from "../link/route";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { channel, senderId, code } = await request.json();

  if (!channel || !senderId || !code) {
    return NextResponse.json(
      { error: "channel, senderId, and code are required" },
      { status: 400 }
    );
  }

  // Look up pending verification
  const verifyKey = `verify:${user!.id}:${channel}`;
  const pending = pendingCodes.get(verifyKey);

  if (!pending) {
    return NextResponse.json(
      { error: "Aucun code en attente. Demandez un nouveau code." },
      { status: 404 }
    );
  }

  if (Date.now() > pending.expiresAt) {
    pendingCodes.delete(verifyKey);
    return NextResponse.json(
      { error: "Code expire. Demandez un nouveau code." },
      { status: 410 }
    );
  }

  // pending.userId stores the code (reused field)
  if (pending.userId !== code) {
    return NextResponse.json(
      { error: "Code incorrect" },
      { status: 400 }
    );
  }

  if (pending.senderId !== senderId) {
    return NextResponse.json(
      { error: "Identifiant incorrect" },
      { status: 400 }
    );
  }

  // Create or update channel link
  const existingLink = await prisma.channelLink.findFirst({
    where: { userId: user!.id, channel, senderId },
  });

  if (existingLink) {
    await prisma.channelLink.update({
      where: { id: existingLink.id },
      data: { verified: true },
    });
  } else {
    await prisma.channelLink.create({
      data: {
        userId: user!.id,
        channel: channel as any,
        senderId,
        verified: true,
      },
    });
  }

  // Clean up pending codes
  pendingCodes.delete(verifyKey);
  pendingCodes.delete(`${channel}:${senderId}`);
  pendingCodes.delete(`code:${channel}:${senderId}`);

  return NextResponse.json({
    message: "Canal lie avec succes",
    verified: true,
  });
}
