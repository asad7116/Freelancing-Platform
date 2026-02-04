# ============================================
# Multi-stage Dockerfile for Node.js Backend
# Optimized for AWS ECS Fargate deployment
# ============================================

# ============================================
# Stage 1: Dependencies (Builder)
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev for any build steps)
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Add labels for container identification
LABEL maintainer="Tixe Freelancing Platform"
LABEL description="Backend API for Tixe Freelancing Platform"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY package*.json ./
COPY src ./src
COPY scripts ./scripts

# Create uploads directory with proper permissions
RUN mkdir -p uploads/job-thumbnails && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check for ECS
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
