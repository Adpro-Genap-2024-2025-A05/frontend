FROM node:20-alpine AS builder

WORKDIR /app
RUN npm cache clean --force

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG NODE_ENV
ARG NEXT_PUBLIC_AUTH_BASE_URL
ARG NEXT_PUBLIC_CHAT_BASE_URL
ARG NEXT_PUBLIC_KONSULTASI_BASE_URL
ARG NEXT_PUBLIC_PROFILE_BASE_URL
ARG NEXT_PUBLIC_RATING_BASE_URL

ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_AUTH_BASE_URL=$NEXT_PUBLIC_AUTH_BASE_URL
ENV NEXT_PUBLIC_CHAT_BASE_URL=$NEXT_PUBLIC_CHAT_BASE_URL
ENV NEXT_PUBLIC_KONSULTASI_BASE_URL=$NEXT_PUBLIC_KONSULTASI_BASE_URL
ENV NEXT_PUBLIC_PROFILE_BASE_URL=$NEXT_PUBLIC_PROFILE_BASE_URL
ENV NEXT_PUBLIC_RATING_BASE_URL=$NEXT_PUBLIC_RATING_BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT_DURING_BUILD=false

RUN npm run build --verbose

FROM node:20-alpine AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]