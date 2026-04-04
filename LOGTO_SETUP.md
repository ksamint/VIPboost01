# Logto 配置指南

## 什么是 Logto？

Logto 是一个开源的 Auth0 替代品，支持：
- 社交登录 (Google, GitHub, Apple, etc.)
- 邮箱密码登录
- 验证码登录
- SSO 企业登录

## 部署方式

### 方式一：Logto Cloud（推荐 - 免费额度）

1. 访问 https://logto.io 注册账号
2. 创建 Application，选择 "Traditional Web" 或 "SPA"
3. 获取 App ID 和 App Secret

### 方式二：Docker 自部署（低成本）

```bash
docker run -d \
  --name logto \
  -p 3001:3001 \
  -e LOGTO_DB_URL=postgresql://user:pass@host:5432/logto \
  -e LOGTO_ENDPOINT=http://localhost:3001 \
  ghcr.io/logto-io/logto
```

## 环境变量配置

在 `.env` 中添加：

```env
LOGTO_ENABLED=true
LOGTO_ENDPOINT=https://your-logto.cloud  # 或自部署地址
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_REDIRECT_URI=http://localhost:5174/callback
```

## 前端集成

### 1. 安装 Logto SDK

```bash
npm i @logto/browser
```

### 2. 配置 Logto 客户端

```javascript
// src/services/logto.ts
import Logto from '@logto/browser';

const logto = new Logto({
  endpoint: 'https://your-logto.cloud',
  appId: 'your-app-id',
});

export default logto;
```

### 3. 登录组件

```jsx
const LoginWithLogto = () => {
  const handleLogin = () => {
    logto.signIn('http://localhost:5174/callback');
  };

  return <button onClick={handleLogin}>使用 Logto 登录</button>;
};
```

## 低成本部署方案对比

| 方案 | 月费用 | 特点 |
|------|--------|------|
| Logto Cloud | 免费（有限额） | 最简单，无需维护 |
| Railway + Logto Cloud | $5+ | 有数据库需求 |
| Coolify 自部署 | $5-10 (VPS) | 完全控制 |
| 已有服务器 + Docker | $0 | 零额外成本 |

## 推荐：最小成本方案

1. **Logto Cloud 免费版** - 5000 MAU
2. **Railway PostgreSQL** - 免费额度
3. **Vercel 前端** - 免费
4. **Railway 后端** - 免费额度

或使用 **Coolify** 在已有 VPS 上一键部署所有服务。
