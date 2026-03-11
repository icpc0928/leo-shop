#!/bin/bash
# ============================================
# CryptoShop 一鍵更新部署
# 用法：cd ~/cryptoshop && bash build.sh
# ============================================

set -e

cd "$(dirname "$0")"
echo "🔄 CryptoShop 更新部署開始..."

# 1. Git Pull
echo ""
echo "📥 拉取最新程式碼..."
cd git/leo-shop && git pull && cd ../..
cd git/leo-shop-api && git pull && cd ../..

# 2. 複製部署檔案
echo ""
echo "📋 更新部署設定..."
cp git/leo-shop/deploy/docker-compose.yml .
cp git/leo-shop/deploy/backend/Dockerfile backend/
cp git/leo-shop/deploy/frontend/Dockerfile frontend/
cp git/leo-shop/deploy/db/init.sql db/
cp git/leo-shop/deploy/build.sh .

# 3. 重建並啟動
echo ""
echo "🔨 重建容器..."
docker compose up -d --build

# 4. 等待啟動
echo ""
echo "⏳ 等待服務啟動..."
sleep 10

# 5. 顯示狀態
echo ""
echo "📊 容器狀態："
docker compose ps

echo ""
echo "✅ 更新完成！"
echo "   查看 log: docker compose logs -f"
