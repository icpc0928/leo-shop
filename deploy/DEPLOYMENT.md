# Leo Shop 部署指南

> 從全新 CentOS 9 主機，到完整部署 Leo Shop 前後端的完整流程。

---

## 目錄

1. [架構總覽](#一架構總覽)
2. [主機基礎環境](#二主機基礎環境設定)
3. [安裝 Docker](#三安裝-docker--docker-compose)
4. [部署檔案結構](#四部署檔案結構)
5. [設定環境變數](#五設定環境變數)
6. [打包專案](#六打包專案本機執行)
7. [上傳到伺服器](#七上傳到伺服器)
8. [啟動服務](#八啟動服務)
9. [驗證部署](#九驗證部署)
10. [日常維運](#十日常維運)
11. [故障排除](#十一故障排除)
12. [SSL 設定（選配）](#十二ssl-設定選配)

---

## 一、架構總覽

```
                    ┌─────────────────────────────────────────┐
                    │           CentOS 9 Server               │
                    │                                         │
 User ──→ :3000 ──→│  ┌──────────┐     ┌──────────────────┐  │
                    │  │ Frontend │────→│  Backend (API)   │  │
                    │  │ Next.js  │     │  Spring Boot     │  │
                    │  │ :3000    │     │  :8080           │  │
                    │  └──────────┘     └────────┬─────────┘  │
                    │                            │            │
                    │                   ┌────────┴─────────┐  │
                    │                   │  PostgreSQL       │  │
                    │                   │  :5432            │  │
                    │                   └──────────────────┘  │
                    └─────────────────────────────────────────┘
```

**三個 Docker Container：**
| Container | Image | Port | 說明 |
|-----------|-------|------|------|
| `leoshop-frontend` | Node 20 + Next.js | 3000 | 前端 |
| `leoshop-backend` | Java 25 + Spring Boot | 8080 | 後端 API |
| `leoshop-db` | PostgreSQL 17 | 5432 | 資料庫 |

---

## 二、主機基礎環境設定

### 2.1 系統更新
```bash
sudo dnf update -y
```

### 2.2 安裝基本工具
```bash
sudo dnf install -y git vim curl wget tar unzip firewalld
```

### 2.3 防火牆設定
```bash
# 啟動防火牆
sudo systemctl enable --now firewalld

# 開放需要的 port
sudo firewall-cmd --permanent --add-port=3000/tcp   # 前端
sudo firewall-cmd --permanent --add-port=8080/tcp   # 後端 API
# 注意：PostgreSQL 5432 不開放外部，只有 Docker 內部通訊

sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### 2.4 關閉 SELinux（簡化部署，正式環境建議保留）
```bash
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
```

### 2.5 建立部署用帳號（可選）
```bash
sudo useradd -m deploy
sudo usermod -aG docker deploy
```

---

## 三、安裝 Docker & Docker Compose

### 3.1 安裝 Docker
```bash
# 移除舊版本
sudo dnf remove -y docker docker-client docker-client-latest docker-common

# 加入 Docker 官方 repo
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安裝
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 啟動 & 開機自動啟動
sudo systemctl enable --now docker

# 讓當前使用者不用 sudo 就能用 docker
sudo usermod -aG docker $USER
newgrp docker
```

### 3.2 驗證安裝
```bash
docker --version
docker compose version
```

---

## 四、部署檔案結構

伺服器上的目錄結構：

```
/opt/leoshop/
├── docker-compose.yml          # 容器編排
├── .env                        # 環境變數（⚠️ 不進 git）
├── frontend/
│   ├── Dockerfile
│   └── leo-shop/               # 前端原始碼（或打包好的）
├── backend/
│   ├── Dockerfile
│   └── leo-shop-api.jar        # 後端打包好的 jar
├── db/
│   └── init.sql                # 資料庫初始化腳本（可選）
├── uploads/                    # 商品圖片（持久化）
└── pgdata/                     # PostgreSQL 資料（持久化）
```

---

## 五、設定環境變數

### 5.1 建立 `.env` 檔案

在伺服器 `/opt/leoshop/.env`：

```env
# ============ PostgreSQL ============
POSTGRES_DB=leoshop
POSTGRES_USER=leoshop
POSTGRES_PASSWORD=your_secure_password_here

# ============ Backend ============
# DB 連線（container name 作為 host）
DB_URL=jdbc:postgresql://leoshop-db:5432/leoshop
DB_USERNAME=leoshop
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your-jwt-secret-key-change-this-to-random-string
JWT_EXPIRATION=86400000

# Etherscan
ETHERSCAN_API_KEY=Q57FT849EX8G9GYBVUDCK19JJ56219T7YE

# NOWPayments（測試環境用 sandbox）
NOWPAYMENTS_API_KEY=sandbox-key
NOWPAYMENTS_IPN_SECRET=sandbox-secret

# Crypto rate refresh (ms)
CRYPTO_RATE_REFRESH=3600000

# ============ Frontend ============
# ⚠️ 改成測試環境的實際 IP 或域名
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8080
```

> ⚠️ **`.env` 不要 commit 進 git！**

---

## 六、打包專案（本機執行）

### 6.1 後端打包（在你的 Mac / IntelliJ）

**方法 A：IntelliJ 打包（推薦）**
1. IntelliJ → Gradle → Tasks → build → `bootJar`
2. 產出的 jar 在 `build/libs/leo-shop-api-0.0.1-SNAPSHOT.jar`

**方法 B：命令列**
```bash
cd ~/IdeaProjects/leo-shop-api
./gradlew bootJar
```

打包完確認：
```bash
ls -la build/libs/leo-shop-api-0.0.1-SNAPSHOT.jar
```

### 6.2 前端不需要預先打包
Docker build 時會自動執行 `npm run build`，只需上傳原始碼。

---

## 七、上傳到伺服器

### 7.1 在伺服器建立目錄
```bash
sudo mkdir -p /opt/leoshop/{frontend,backend,db,uploads,pgdata}
sudo chown -R $USER:$USER /opt/leoshop
```

### 7.2 上傳檔案

```bash
# 從你的 Mac 執行：

# 上傳後端 jar
scp ~/IdeaProjects/leo-shop-api/build/libs/leo-shop-api-0.0.1-SNAPSHOT.jar \
    user@YOUR_SERVER_IP:/opt/leoshop/backend/

# 上傳前端原始碼（排除 node_modules 和 .next）
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
    ~/WebstormProjects/leo-shop/ \
    user@YOUR_SERVER_IP:/opt/leoshop/frontend/leo-shop/

# 上傳 Docker 設定檔
scp deploy/docker-compose.yml user@YOUR_SERVER_IP:/opt/leoshop/
scp deploy/backend/Dockerfile user@YOUR_SERVER_IP:/opt/leoshop/backend/
scp deploy/frontend/Dockerfile user@YOUR_SERVER_IP:/opt/leoshop/frontend/
scp deploy/.env.example user@YOUR_SERVER_IP:/opt/leoshop/.env
# ⚠️ 記得上去改 .env 裡的密碼和 IP
```

### 7.3 上傳商品圖片（如果有）
```bash
rsync -avz ~/IdeaProjects/leo-shop-api/uploads/ \
    user@YOUR_SERVER_IP:/opt/leoshop/uploads/
```

---

## 八、啟動服務

### 8.1 首次啟動
```bash
cd /opt/leoshop

# 建構並啟動所有服務（背景執行）
docker compose up -d --build

# 查看狀態
docker compose ps

# 查看 log
docker compose logs -f
```

### 8.2 確認容器狀態
```bash
$ docker compose ps

NAME               STATUS          PORTS
leoshop-db         Up (healthy)    5432/tcp
leoshop-backend    Up              0.0.0.0:8080->8080/tcp
leoshop-frontend   Up              0.0.0.0:3000->3000/tcp
```

### 8.3 等待啟動順序
1. `leoshop-db` 先啟動，健康檢查通過後
2. `leoshop-backend` 啟動，連接 DB，JPA 自動建表
3. `leoshop-frontend` 啟動

---

## 九、驗證部署

### 9.1 資料庫
```bash
# 進入 DB 容器
docker compose exec db psql -U leoshop -d leoshop

# 確認表已建立
\dt
\q
```

### 9.2 後端 API
```bash
# 健康檢查
curl http://localhost:8080/api/site-info

# 應回傳類似：
# {"siteName":"Leo Shop","baseCurrency":"TWD",...}
```

### 9.3 前端
```bash
curl -I http://localhost:3000

# 應回傳 HTTP 200
```

### 9.4 瀏覽器測試
打開 `http://YOUR_SERVER_IP:3000`

---

## 十、日常維運

### 10.1 常用指令
```bash
cd /opt/leoshop

# 查看狀態
docker compose ps

# 查看即時 log
docker compose logs -f
docker compose logs -f backend    # 只看後端
docker compose logs -f frontend   # 只看前端

# 停止所有服務
docker compose down

# 重啟某個服務
docker compose restart backend

# 重新建構並啟動（程式更新後）
docker compose up -d --build backend
docker compose up -d --build frontend
```

### 10.2 更新部署

**更新後端：**
```bash
# 1. 本機打包新的 jar
# 2. 上傳
scp leo-shop-api-0.0.1-SNAPSHOT.jar user@SERVER:/opt/leoshop/backend/
# 3. 重建容器
cd /opt/leoshop && docker compose up -d --build backend
```

**更新前端：**
```bash
# 1. 上傳新的原始碼
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
    ~/WebstormProjects/leo-shop/ user@SERVER:/opt/leoshop/frontend/leo-shop/
# 2. 重建容器
cd /opt/leoshop && docker compose up -d --build frontend
```

### 10.3 資料庫備份
```bash
# 備份
docker compose exec db pg_dump -U leoshop leoshop > backup_$(date +%Y%m%d).sql

# 還原
cat backup_20260311.sql | docker compose exec -T db psql -U leoshop -d leoshop
```

### 10.4 查看磁碟空間
```bash
docker system df
# 清理無用的 image
docker system prune -f
```

---

## 十一、故障排除

### 後端起不來
```bash
# 查看 log
docker compose logs backend

# 常見問題：
# 1. DB 連不上 → 確認 .env 的密碼一致
# 2. Port 被佔 → sudo lsof -i :8080
# 3. Java 版本 → Dockerfile 用 eclipse-temurin:25
```

### 前端起不來
```bash
docker compose logs frontend

# 常見問題：
# 1. NEXT_PUBLIC_API_URL 錯誤 → 確認 .env
# 2. build 失敗 → 進容器 debug：docker compose exec frontend sh
# 3. 記憶體不足 → 確認 NODE_OPTIONS
```

### DB 連不上
```bash
# 確認 DB 容器是否健康
docker compose ps
docker compose logs db

# 手動連線測試
docker compose exec db psql -U leoshop -d leoshop -c "SELECT 1"
```

### 圖片無法顯示
```bash
# 確認 uploads 目錄映射
ls /opt/leoshop/uploads/products/
# 確認 backend 容器內的路徑
docker compose exec backend ls /app/uploads/products/
```

---

## 十二、SSL 設定（選配）

如果需要 HTTPS，可以加一個 Nginx 反向代理：

```bash
# 安裝 Nginx
sudo dnf install -y nginx

# 安裝 certbot（Let's Encrypt）
sudo dnf install -y certbot python3-certbot-nginx
```

Nginx 設定範例 `/etc/nginx/conf.d/leoshop.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 後端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

申請 SSL：
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 快速指令總整理

| 動作 | 指令 |
|------|------|
| 啟動所有服務 | `docker compose up -d` |
| 停止所有服務 | `docker compose down` |
| 查看狀態 | `docker compose ps` |
| 查看 log | `docker compose logs -f` |
| 重建後端 | `docker compose up -d --build backend` |
| 重建前端 | `docker compose up -d --build frontend` |
| 進入 DB | `docker compose exec db psql -U leoshop` |
| 備份 DB | `docker compose exec db pg_dump -U leoshop leoshop > backup.sql` |
| 清理空間 | `docker system prune -f` |
