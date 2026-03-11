#!/bin/bash
# ============================================
# Leo Shop 一鍵部署腳本
# 在伺服器上的 /opt/leoshop/ 執行
# ============================================

set -e

echo "🚀 Leo Shop 部署開始..."

# 確認 .env 存在
if [ ! -f .env ]; then
    echo "❌ 找不到 .env 檔案！"
    echo "   請複製 .env.example 為 .env 並修改設定："
    echo "   cp .env.example .env"
    echo "   vim .env"
    exit 1
fi

# 確認 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 確認 jar 檔案
if [ ! -f backend/leo-shop-api-0.0.1-SNAPSHOT.jar ]; then
    echo "❌ 找不到後端 jar 檔案！"
    echo "   請先上傳 leo-shop-api-0.0.1-SNAPSHOT.jar 到 backend/ 目錄"
    exit 1
fi

# 確認前端原始碼
if [ ! -f frontend/leo-shop/package.json ]; then
    echo "❌ 找不到前端原始碼！"
    echo "   請先上傳前端程式碼到 frontend/leo-shop/ 目錄"
    exit 1
fi

echo "📦 建構並啟動容器..."
docker compose up -d --build

echo ""
echo "⏳ 等待服務啟動..."
sleep 10

echo ""
echo "📊 容器狀態："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo "   前端: http://$(hostname -I | awk '{print $1}'):3000"
echo "   後端: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "   查看 log: docker compose logs -f"
