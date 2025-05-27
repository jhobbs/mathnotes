# Stage 1: Get git version
FROM alpine/git:latest AS version
WORKDIR /app
COPY .git .git
# For production builds, we use the commit version without --dirty
# since Docker builds should be from committed code
RUN git describe --always --tags > /version.txt || echo "unknown" > /version.txt

# Stage 2: Build the actual application
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy version from first stage
COPY --from=version /version.txt /version/version.txt

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Run the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]