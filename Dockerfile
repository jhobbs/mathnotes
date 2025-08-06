# Multi-stage build for static site generation
# Stage 1: Get git version
FROM alpine/git:latest AS version
WORKDIR /app
COPY .git .git
# For production builds, we use the commit version without --dirty
# since Docker builds should be from committed code
RUN git describe --always --tags > /version.txt || echo "unknown" > /version.txt

# Stage 2: Node environment for building assets with esbuild
FROM node:24-alpine AS esbuild-builder

WORKDIR /app

# Copy package files and config from root
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source files
COPY demos-framework/ ./demos-framework/
COPY styles/ ./styles/
COPY demos/ ./demos/

# Build assets with esbuild
RUN npm run build

# Stage 3: Python environment for generating HTML
FROM python:3.12-slim AS builder

WORKDIR /app

# Copy version from first stage
COPY --from=version /version.txt /version/version.txt

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code including new generator
COPY generator/ ./generator/
COPY mathnotes/ ./mathnotes/
COPY content/ ./content/
COPY templates/ ./templates/
COPY scripts/build_static_simple.py ./scripts/
COPY favicon.ico robots.txt ./

# Copy esbuild output from the esbuild-builder stage
COPY --from=esbuild-builder /app/static/dist ./static/dist

# Run static site generator (with esbuild assets already in place)
RUN python scripts/build_static_simple.py

# Stage 4: Final nginx image with static files only
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy generated static site from builder (includes esbuild assets)
COPY --from=builder /app/static-build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
