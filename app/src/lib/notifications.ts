import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";
import SiteReady from "@/emails/SiteReady";
import DomainConfigured from "@/emails/DomainConfigured";
import { createElement } from "react";

const SITE_URL = process.env.SITE_URL || "https://masamune.fr";

interface WelcomePayload {
  email: string;
}

interface SiteReadyPayload {
  email: string;
  businessName: string;
  slug: string;
  siteId: string;
}

interface DomainConfiguredPayload {
  email: string;
  domainName: string;
  businessName: string;
}

type NotificationEvent =
  | { type: "welcome"; payload: WelcomePayload }
  | { type: "site_ready"; payload: SiteReadyPayload }
  | { type: "domain_configured"; payload: DomainConfiguredPayload };

export async function sendNotification(event: NotificationEvent) {
  switch (event.type) {
    case "welcome":
      return sendEmail({
        to: event.payload.email,
        subject: "Bienvenue sur Masamune",
        react: createElement(WelcomeEmail, { email: event.payload.email }),
      });

    case "site_ready":
      return sendEmail({
        to: event.payload.email,
        subject: `Votre site ${event.payload.businessName} est en ligne !`,
        react: createElement(SiteReady, {
          businessName: event.payload.businessName,
          siteUrl: `https://${event.payload.slug}.masamune.app`,
          dashboardUrl: `${SITE_URL}/dashboard/sites/${event.payload.siteId}`,
        }),
      });

    case "domain_configured":
      return sendEmail({
        to: event.payload.email,
        subject: `Votre domaine ${event.payload.domainName} est configure`,
        react: createElement(DomainConfigured, {
          domainName: event.payload.domainName,
          businessName: event.payload.businessName,
          dashboardUrl: `${SITE_URL}/dashboard/domains`,
        }),
      });
  }
}
