import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || "/etc/nginx/conf.d";
const TEMPLATE_PATH = process.env.NGINX_TEMPLATE_PATH || "/app/docker/nginx/templates/client-site.conf.template";

export async function generateNginxConfig(domain: string, sitePath: string): Promise<void> {
  // Read template
  let template: string;
  try {
    template = await fs.readFile(TEMPLATE_PATH, "utf-8");
  } catch {
    // Fallback: generate config inline
    template = `server {
    listen 80;
    server_name DOMAIN_NAME www.DOMAIN_NAME;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    root /var/www/sites-clients/SITE_PATH;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}`;
  }

  // Replace placeholders
  const config = template
    .replace(/DOMAIN_NAME/g, domain)
    .replace(/SITE_PATH/g, sitePath);

  // Write config
  const configPath = path.join(NGINX_CONF_DIR, `${domain}.conf`);
  await fs.writeFile(configPath, config, "utf-8");
  console.log(`[nginx] Config written: ${configPath}`);

  // Reload nginx
  try {
    await execAsync("docker compose exec nginx nginx -s reload");
    console.log("[nginx] Reloaded successfully");
  } catch (error: any) {
    console.warn("[nginx] Reload failed (may not be in Docker context):", error.message);
  }
}

export async function removeNginxConfig(domain: string): Promise<void> {
  const configPath = path.join(NGINX_CONF_DIR, `${domain}.conf`);
  try {
    await fs.unlink(configPath);
    await execAsync("docker compose exec nginx nginx -s reload");
    console.log(`[nginx] Removed config for ${domain}`);
  } catch (error: any) {
    console.warn(`[nginx] Failed to remove config for ${domain}:`, error.message);
  }
}
