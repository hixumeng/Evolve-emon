# Global ARGs
ARG BUILDER_IMAGE=node:24-bookworm-slim
ARG NGINX_IMAGE=nginx:1.26.1-alpine
ARG WORKSPACE=/workspace
ARG WEB_PATH=/usr/share/nginx/html

# Builder
FROM $BUILDER_IMAGE as builder
ARG WORKSPACE

WORKDIR $WORKSPACE
COPY ./ $WORKSPACE/
RUN npm ci --no-audit --no-fund \
    && npm run build:static

# Web server
FROM $NGINX_IMAGE
ARG WORKSPACE
ARG WEB_PATH

COPY --from=builder $WORKSPACE/dist $WEB_PATH
