#!/bin/bash
# ============================================
# CryptoShop 一鍵部署腳本
# 用法：
#   1. git clone 兩個 repo 到部署目錄
#   2. 設定 .env
#   3. bash deploy.sh
# ============================================

set -e

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

echo "🚀 CryptoShop 部署開始..."

# 確認 .env 存在
if [ ! -f .env ]; then
    echo "❌ 找不到 .env 檔案！"
    echo "   cp .env.example .env && vi .env"
    exit 1
fi

# 確認 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝"
    exit 1
fi

# 確認後端原始碼
if [ ! -f leo-shop-api/build.gradle ]; then
    echo "❌ 找不到後端原始碼！"
    echo "   git clone https://github.com/icpc0928/leo-shop-api.git"
    exit 1
fi

# 確認前端原始碼
if [ ! -f leo-shop/package.json ]; then
    echo "❌ 找不到前端原始碼！"
    echo "   git clone https://github.com/icpc0928/leo-shop.git"
    exit 1
fi

echo "📦 建構並啟動容器（首次需要較長時間）..."
docker compose up -d --build

echo ""
echo "⏳ 等待服務啟動..."
sleep 15

echo ""
echo "📊 容器狀態："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo "   前端: http://$(hostname -I | awk '{print $1}'):3000"
echo "   後端: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "   查看 log: docker compose logs -f"
