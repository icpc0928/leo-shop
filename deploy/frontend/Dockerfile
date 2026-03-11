# ============================================
# Leo Shop Frontend - Multi-stage Build
# Stage 1: 安裝依賴 + 建構
# Stage 2: 只保留執行必要檔案
# ============================================

# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# 接收 build-time 環境變數
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 安裝依賴（利用 Docker cache）
COPY git/leo-shop/package.json git/leo-shop/package-lock.json* ./
RUN npm install

# 複製原始碼並建構
COPY git/leo-shop/ .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# --- Runtime Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# 設定時區
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime && \
    echo "Asia/Taipei" > /etc/timezone

ENV NODE_ENV=production

# 複製必要檔案
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
