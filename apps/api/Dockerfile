# Copied from https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/api/Dockerfile

FROM node:alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo
COPY . .
RUN turbo prune --scope=api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer

ARG NPM_TOKEN

RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install --global turbo

# # First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install --global pnpm

RUN npm config set "@sandumorari:registry" "https://npm.pkg.github.com"
RUN npm config set //npm.pkg.github.com/:_authToken $NPM_TOKEN

RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
# RUN pnpm prisma generate
RUN pnpm turbo run build --filter=api...

FROM node:alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
RUN npm install --global pnpm

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app/ .

CMD cd apps/api && pnpm run start
