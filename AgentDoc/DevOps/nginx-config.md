# Nginx Configuration — Masamune

## Architecture

Nginx sert deux roles :
1. **Reverse proxy** pour la plateforme Masamune (app.masamune.fr -> Next.js)
2. **Serveur statique** pour les sites clients (*.masamune.app + domaines custom)

## Fichiers

| Fichier | Role |
|---------|------|
| `docker/nginx/nginx.conf` | Config principale (gzip, rate limiting, headers securite) |
| `docker/nginx/conf.d/default.conf` | Vhosts plateforme + sous-domaines clients |
| `docker/nginx/templates/client-site.conf.template` | Template pour domaines custom |
| `docker/nginx/conf.d/<domain>.conf` | Configs generees par le Worker (un par domaine custom) |

## Ajouter un site client (domaine custom)

Le Worker fait cela automatiquement. Procedure manuelle :

1. Copier le template :
```bash
cp docker/nginx/templates/client-site.conf.template docker/nginx/conf.d/example-domain.fr.conf
```

2. Remplacer les placeholders :
```bash
sed -i 's/DOMAIN_NAME/example-domain.fr/g' docker/nginx/conf.d/example-domain.fr.conf
sed -i 's/SITE_PATH/example-domain.fr/g' docker/nginx/conf.d/example-domain.fr.conf
```

3. Reload Nginx :
```bash
docker compose exec nginx nginx -s reload
```

## SSL (Let's Encrypt)

Generer un certificat pour un domaine :
```bash
docker compose exec certbot certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email admin@masamune.fr --agree-tos --no-eff-email \
    -d example-domain.fr -d www.example-domain.fr
docker compose exec nginx nginx -s reload
```

Le renouvellement est automatique (certbot tourne en boucle toutes les 12h).

## Rate Limiting

| Zone | Limite | Usage |
|------|--------|-------|
| api | 10 req/s, burst 20 | Routes /api/* |
| auth | 5 req/s, burst 5 | Routes /api/auth/* |

## Headers de securite

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000; includeSubDomains

## Upstream dynamique

Le default.conf utilise `resolver 127.0.0.11` (DNS Docker) avec des variables pour les upstreams. Cela permet a Nginx de demarrer meme si le service `app` n'existe pas encore (retourne 502 au lieu de crasher).
