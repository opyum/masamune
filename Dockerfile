FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
# Prisma generate
RUN npx prisma generate
# Cache bust to force rebuild when env changes
ARG CACHEBUST=1
# Build-time env vars - NEXT_PUBLIC_* are inlined at build time
ENV NEXT_PUBLIC_SUPABASE_URL=https://yetehiguoymisrsjrvzy.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldGVoaWd1b3ltaXNyc2pydnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDI3OTksImV4cCI6MjA5MDA3ODc5OX0.Kxd31q77C1X2eR4l-fNKA248bcNi2ickjxDwIRDzjhk
ENV STRIPE_SECRET_KEY=sk_placeholder
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy prisma schema for db push at startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# Startup script: migrate then start
COPY --from=builder /app/node_modules/.package-lock.json ./node_modules/.package-lock.json
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running prisma db push..."' >> /app/start.sh && \
    echo 'npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "DB push skipped"' >> /app/start.sh && \
    echo 'exec su -s /bin/sh nextjs -c "node /app/server.js"' >> /app/start.sh && \
    chmod +x /app/start.sh
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "/app/start.sh"]
