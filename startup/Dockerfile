FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Set working directory
WORKDIR /app

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Copy package.json
COPY package.json /app/package.json

# Create necessary directories
RUN mkdir -p logs pids data

# Expose ports
EXPOSE 3000 3001 11434

# Set environment variables
ENV NODE_ENV=production

# Start command
CMD ["./start.sh", "start"] 