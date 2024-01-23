# Start with a base node image
FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Install corepack and pnpm
RUN corepack enable
RUN corepack prepare pnpm@8.7.0 --activate
FROM base AS deps

# Add libc6-compat if necessary for your application
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
# This layer will be cached unless package.json or pnpm-lock.yaml changes
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Builder image
FROM base AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of your application's source code
COPY . .

# Build your application
RUN pnpm run build

# Production image
FROM base AS runner

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 8000
ENV HOSTNAME "0.0.0.0"

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the build output and necessary files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs

EXPOSE 8000

CMD ["node", "server.js"]
