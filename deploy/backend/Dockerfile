# ============================================
# Leo Shop Backend - Multi-stage Build
# Stage 1: 編譯 (Gradle + Java 25)
# Stage 2: 執行 (JRE only)
# ============================================

# --- Build Stage ---
FROM amazoncorretto:25 AS builder

WORKDIR /build

# 複製 Gradle 設定（利用 Docker cache）
COPY leo-shop-api/build.gradle leo-shop-api/settings.gradle ./
COPY leo-shop-api/gradle ./gradle
COPY leo-shop-api/gradlew ./
RUN chmod +x gradlew

# 先下載依賴（cache layer）
RUN ./gradlew dependencies --no-daemon || true

# 複製原始碼並編譯
COPY leo-shop-api/src ./src
RUN ./gradlew bootJar --no-daemon -x test

# --- Runtime Stage ---
FROM amazoncorretto:25-alpine

LABEL maintainer="Leo"

WORKDIR /app

# 從 build stage 複製 jar
COPY --from=builder /build/build/libs/*.jar app.jar

# 建立上傳目錄
RUN mkdir -p /app/uploads/products

# 設定時區
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime && \
    echo "Asia/Taipei" > /etc/timezone

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=docker"]
