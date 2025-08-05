FROM node:24.2.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

COPY prisma ./prisma/
RUN npx prisma generate
RUN npm run build

FROM node:24.2.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3001
CMD ["node", "server.js"]