-- Leo Shop 資料庫初始化腳本
-- JPA ddl-auto=update 會自動建表，這裡放額外的初始化

-- 確保 UUID 擴展可用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 歡迎訊息
DO $$
BEGIN
    RAISE NOTICE 'Leo Shop database initialized successfully!';
END $$;
