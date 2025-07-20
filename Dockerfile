# Stage 1: Get git version
FROM alpine/git:latest AS version
WORKDIR /app
COPY .git .git
# For production builds, we use the commit version without --dirty
# since Docker builds should be from committed code
RUN git describe --always --tags > /version.txt || echo "unknown" > /version.txt

# Stage 2: Build frontend assets
FROM node:24-alpine AS frontend
WORKDIR /app
COPY package.json ./
# Don't copy package-lock.json to avoid platform-specific issues
RUN npm install
COPY tsconfig.json vite.config.ts ./
COPY demos-framework ./demos-framework
COPY demos ./demos
RUN npm run build

# Stage 3: Build the actual application
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy version from first stage
COPY --from=version /version.txt /version/version.txt

# Copy the rest of the application first (excluding static/dist)
COPY . .

# Copy built frontend assets from frontend stage (this overwrites any local static/dist)
COPY --from=frontend /app/static/dist ./static/dist

# Expose port
EXPOSE 5000

# Run the application with gunicorn using the WSGI entry point
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "--log-level", "info", "wsgi:application"]
