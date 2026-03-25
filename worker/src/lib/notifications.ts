import { prisma } from "./prisma";

const OPENCLAW_URL = process.env.OPENCLAW_URL || "http://openclaw:3002";
const OPENCLAW_WEBHOOK_SECRET = process.env.OPENCLAW_WEBHOOK_SECRET || "";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
}

/**
 * Send a notification to a user via all their linked channels (WhatsApp, Telegram, etc.)
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const { userId, title, message } = payload;

  const channelLinks = await prisma.channelLink.findMany({
    where: { userId, verified: true },
  });

  if (channelLinks.length === 0) {
    console.log(`[notifications] No linked channels for user ${userId}`);
    return;
  }

  const fullMessage = `${title}\n\n${message}`;

  for (const link of channelLinks) {
    try {
      await sendOpenClawMessage(link.channel, link.senderId, fullMessage);
      console.log(`[notifications] Sent to ${link.channel}:${link.senderId}`);
    } catch (error: any) {
      console.error(`[notifications] Failed to send to ${link.channel}:${link.senderId}:`, error.message);
    }
  }
}

/**
 * Notify user that their site is live
 */
export async function notifySiteLive(userId: string, siteName: string, siteUrl: string): Promise<void> {
  await sendNotification({
    userId,
    title: "Votre site est en ligne !",
    message: `${siteName} est maintenant accessible a l'adresse :\n${siteUrl}\n\nVous pouvez le modifier depuis votre tableau de bord Masamune.`,
  });
}

/**
 * Notify user about domain status change
 */
export async function notifyDomainStatus(
  userId: string,
  domainName: string,
  status: "purchased" | "dns_configured" | "ssl_active" | "error"
): Promise<void> {
  const messages: Record<string, string> = {
    purchased: `Le domaine ${domainName} a ete achete avec succes ! La configuration DNS est en cours.`,
    dns_configured: `Le DNS pour ${domainName} est configure. Le certificat SSL est en cours d'installation.`,
    ssl_active: `${domainName} est entierement configure et securise avec SSL ! Votre site est accessible a https://${domainName}`,
    error: `Un probleme est survenu avec ${domainName}. Consultez votre tableau de bord pour plus de details.`,
  };

  await sendNotification({
    userId,
    title: "Mise a jour de votre domaine",
    message: messages[status] || `Statut du domaine ${domainName} : ${status}`,
  });
}

/**
 * Notify user about SEO report
 */
export async function notifySeoReport(userId: string, siteName: string, score: number): Promise<void> {
  await sendNotification({
    userId,
    title: "Rapport SEO disponible",
    message: `Le score SEO de ${siteName} est de ${score}/100.\n\nConsultez le rapport complet dans votre tableau de bord.`,
  });
}

/**
 * Notify user about visit milestone
 */
export async function notifyVisitMilestone(userId: string, siteName: string, visits: number): Promise<void> {
  await sendNotification({
    userId,
    title: "Felicitations !",
    message: `${siteName} a atteint ${visits} visites ! Continuez comme ca.`,
  });
}

async function sendOpenClawMessage(
  channel: string,
  recipientId: string,
  message: string
): Promise<void> {
  const response = await fetch(`${OPENCLAW_URL}/api/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENCLAW_WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({ channel, recipientId, message }),
  });

  if (!response.ok) {
    throw new Error(`OpenClaw returned ${response.status}`);
  }
}
