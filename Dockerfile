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

# Run type check first, then build assets with esbuild
RUN npm run type-check && npm run build

# Stage 3: Python environment for generating HTML
FROM python:3.14-slim AS builder

WORKDIR /app

# Copy version from first stage
COPY --from=version /version.txt /version/version.txt

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY mathnotes/ ./mathnotes/
COPY content/ ./content/
COPY templates/ ./templates/
COPY scripts/build_static_simple.py ./scripts/
COPY favicon.ico robots.txt ./

# Copy esbuild output from the esbuild-builder stage
COPY --from=esbuild-builder /app/static/dist ./static/dist

# Run static site generator (with esbuild assets already in place)
RUN python scripts/build_static_simple.py

# Stage 4: Final image with Flask/gunicorn serving static files + API
FROM python:3.14-slim

WORKDIR /app

# Install production dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask app and API
COPY server/ ./server/

# Copy generated static site from builder (includes esbuild assets)
COPY --from=builder /app/static-build ./static-build

ENV STATIC_BUILD_DIR=/app/static-build

# Expose port 80
EXPOSE 80

# Start gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:80", "--chdir", "/app/server", "app:app"]
