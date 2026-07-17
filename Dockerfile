# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# ---- Dependencies ----
FROM base AS deps
RUN npm ci

# ---- Build ----
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
