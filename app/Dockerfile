#syntax=docker/dockerfile:1.4

# This Dockerfile uses the service folder as context.


# --
# Upstream images

FROM node:20-slim AS node_upstream
FROM nginx:alpine AS nginx_upstream


# --
# Base image

FROM node_upstream AS app_base

WORKDIR /app

# Set exposed port
ARG PORT=80
ENV PORT=${PORT}

# Install curl for healthcheck
RUN apt-get update && \
	apt-get install -y --no-install-recommends curl && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

COPY --link --chmod=755 ./docker-healthcheck.sh /usr/local/bin/docker-healthcheck

HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=30s CMD [ "docker-healthcheck" ]


# --
# Npm image

FROM app_base AS app_npm

ENV APP_ENV=dev
ENV NODE_ENV=development

# Source code should be mounted here
VOLUME /app

COPY --link --chmod=755 ./docker-npm-entrypoint.sh /usr/local/bin/docker-npm-entrypoint

ENTRYPOINT [ "docker-npm-entrypoint" ]
CMD ["--help"]


# --
# Dev image

FROM app_base AS app_dev

ENV APP_ENV=dev
ENV NODE_ENV=development

# Install dev dependencies
COPY --link ./app/package*.json ./app/tsconfig*.json ./app/astro.config.mjs .
RUN npm clean-install --include=dev && \
	# Clean up
	npm cache clean --force

# Source code should be mounted here
VOLUME /app
VOLUME /app/node_modules

COPY --link --chmod=755 ./docker-dev-command.sh /usr/local/bin/docker-dev-command

CMD [ "docker-dev-command" ]


# --
# Prod build image

FROM app_base AS app_prod_build

ENV APP_ENV=prod
ENV NODE_ENV=production

# Install dev dependencies, required for build
COPY --link ./app/package*.json ./app/tsconfig*.json ./app/astro.config.mjs .
RUN npm clean-install --include=dev && \
	# Clean up
	npm cache clean --force

# Copy source code for build
COPY --link ./app .

# Build source code
RUN npm run build


# --
# Prod image

FROM nginx_upstream AS app_prod

WORKDIR /usr/share/nginx/html

# Copy built website
COPY --from=app_prod_build --link /app/dist .
