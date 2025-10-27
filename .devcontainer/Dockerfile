# Development container for Zoptal
FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    curl \
    jq \
    vim \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# Install Helm
RUN curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | tee /usr/share/keyrings/helm.gpg > /dev/null \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list \
    && apt-get update \
    && apt-get install helm \
    && rm -rf /var/lib/apt/lists/*

# Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    tee /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    tee /etc/apt/sources.list.d/hashicorp.list \
    && apt update \
    && apt install terraform \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh \
    && rm -rf /var/lib/apt/lists/*

# Set up pnpm configuration
USER node
RUN pnpm config set store-dir /home/node/.pnpm-store

# Set working directory
WORKDIR /workspace

# Copy package files first for better caching
COPY --chown=node:node package*.json pnpm-*.yaml ./
COPY --chown=node:node packages/*/package.json ./packages/*/
COPY --chown=node:node services/*/package.json ./services/*/
COPY --chown=node:node apps/*/package.json ./apps/*/

# Install dependencies
# RUN pnpm install --frozen-lockfile

# Set up shell aliases and environment
RUN echo 'alias ll="ls -la"' >> ~/.bashrc \
    && echo 'alias k="kubectl"' >> ~/.bashrc \
    && echo 'alias tf="terraform"' >> ~/.bashrc \
    && echo 'alias dc="docker-compose"' >> ~/.bashrc \
    && echo 'alias pn="pnpm"' >> ~/.bashrc \
    && echo 'export PATH="$PATH:/workspace/scripts"' >> ~/.bashrc

# Default command
CMD ["sleep", "infinity"]