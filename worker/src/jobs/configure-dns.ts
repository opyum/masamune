import { prisma } from "../lib/prisma";
import { configureDNS } from "../lib/ovh";
import { generateNginxConfig } from "../lib/nginx";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const VPS_IP = process.env.VPS_IP || "127.0.0.1";

export async function handleConfigureDNS(data: {
  domainId: string;
  domainName: string;
  siteId: string;
}) {
  const { domainId, domainName, siteId } = data;
  console.log(`[configure-dns] Starting DNS configuration for ${domainName}`);

  try {
    // 1. Get site slug for Nginx config
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error(`Site ${siteId} not found`);

    // 2. Configure DNS records via OVH
    console.log(`[configure-dns] Setting A/CNAME records for ${domainName} -> ${VPS_IP}`);
    await configureDNS(domainName, VPS_IP);

    // 3. Update domain status
    await prisma.domain.update({
      where: { id: domainId },
      data: { status: "dns_configured" },
    });

    // 4. Generate Nginx config for the domain
    console.log(`[configure-dns] Generating Nginx config for ${domainName}`);
    await generateNginxConfig(domainName, site.slug);

    // 5. Update site with custom domain
    await prisma.site.update({
      where: { id: siteId },
      data: { customDomain: domainName },
    });

    // 6. Request SSL certificate via Certbot
    console.log(`[configure-dns] Requesting SSL certificate for ${domainName}`);
    try {
      await execAsync(
        `docker compose exec certbot certbot certonly --webroot -w /var/www/certbot ` +
        `-d ${domainName} -d www.${domainName} --non-interactive --agree-tos ` +
        `--email admin@masamune.fr`
      );

      // Update domain status to ssl_active
      await prisma.domain.update({
        where: { id: domainId },
        data: { status: "ssl_active" },
      });

      console.log(`[configure-dns] SSL certificate obtained for ${domainName}`);
    } catch (sslError: any) {
      console.warn(`[configure-dns] SSL failed (DNS may not have propagated yet): ${sslError.message}`);
      // DNS is configured but SSL will need to be retried
      // Domain stays in dns_configured status
    }

    console.log(`[configure-dns] DNS configuration complete for ${domainName}`);

  } catch (error: any) {
    console.error(`[configure-dns] Error:`, error.message);

    await prisma.domain.update({
      where: { id: domainId },
      data: { status: "error" },
    });

    throw error;
  }
}
