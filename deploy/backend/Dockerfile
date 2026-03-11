# ============================================
# Leo Shop Backend - Spring Boot (Java 25)
# ============================================
FROM eclipse-temurin:25-jre-alpine

LABEL maintainer="Leo <leohsu9527>"

WORKDIR /app

# 複製打包好的 jar
COPY leo-shop-api-0.0.1-SNAPSHOT.jar app.jar

# 建立上傳目錄
RUN mkdir -p /app/uploads/products

# 設定時區
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime && \
    echo "Asia/Taipei" > /etc/timezone

EXPOSE 8080

# 啟動
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=docker"]
