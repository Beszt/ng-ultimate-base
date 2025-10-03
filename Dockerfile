# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BUILD_CONFIGURATION=production
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

FROM nginx:1.27-alpine AS runner

ARG DIST_DIR=ng-ultimate-base
ENV APP_NAME="Demo Playground" \
    APP_STORAGE_NAMESPACE="demo" \
    CONFIG_PATH="/usr/share/nginx/html/assets/settings.json"

RUN apk add --no-cache jq

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /app/dist/${DIST_DIR}/browser /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
