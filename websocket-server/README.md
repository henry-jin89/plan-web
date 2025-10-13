# WebSocket 实时同步服务器

⚡ 为计划管理器提供毫秒级跨设备实时数据同步

## 🌟 特性

- ✅ **毫秒级同步** - 保存后立即推送到所有设备
- 🔄 **自动重连** - 网络断开后自动恢复
- 📱 **多设备支持** - 同时支持电脑、手机、平板
- 💾 **数据缓存** - 服务器端缓存最新数据
- 🔒 **用户隔离** - 每个用户的数据完全独立
- 📊 **实时监控** - 提供状态监控接口

## 📦 安装步骤

### 1️⃣ 安装 Node.js

如果还没有安装 Node.js，请先安装：

**Windows/Mac:**
- 访问 https://nodejs.org/
- 下载并安装 LTS 版本（推荐 v18 或更高）

**验证安装:**
```bash
node --version
npm --version
```

### 2️⃣ 安装依赖

在 `websocket-server` 目录下运行：

```bash
cd websocket-server
npm install
```

这会安装以下依赖：
- `express` - Web 服务器框架
- `socket.io` - WebSocket 实时通信库
- `cors` - 跨域资源共享支持

## 🚀 启动服务器

### 本地开发

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

### 开发模式（自动重启）

```bash
npm run dev
```

使用 nodemon，代码修改后自动重启

## 📡 服务器端点

### WebSocket 连接
```
ws://localhost:3000
```

### HTTP 端点

**健康检查:**
```
GET http://localhost:3000/health
```

返回示例：
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T10:30:00.000Z",
  "connections": 3,
  "users": 2
}
```

**服务器状态:**
```
GET http://localhost:3000/status
```

返回示例：
```json
{
  "status": "running",
  "timestamp": "2025-10-13T10:30:00.000Z",
  "totalConnections": 3,
  "totalUsers": 2,
  "users": [
    {
      "userId": "user_1697192400000_abc123",
      "devices": 2
    }
  ]
}
```

## 🌐 部署到云服务器

### 方案 A: 免费云服务

#### 1. Render.com（推荐）

**优点：** 完全免费，自动部署，支持 WebSocket

**步骤：**

1. 注册 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接你的 GitHub 仓库
4. 配置：
   - **Name:** plan-websocket-server
   - **Environment:** Node
   - **Build Command:** `cd websocket-server && npm install`
   - **Start Command:** `cd websocket-server && npm start`
   - **Plan:** Free
5. 点击 "Create Web Service"

**获取服务器地址：**
```
https://your-app-name.onrender.com
```

#### 2. Railway.app

**优点：** 部署简单，免费额度充足

**步骤：**

1. 注册 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择仓库和分支
4. Railway 会自动检测 Node.js 项目
5. 设置根目录为 `websocket-server`
6. 自动部署完成

#### 3. Fly.io

**优点：** 性能好，支持多地区部署

**步骤：**

1. 安装 Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. 登录: `flyctl auth login`
3. 在 `websocket-server` 目录下运行:
   ```bash
   flyctl launch
   ```
4. 按提示完成配置
5. 部署: `flyctl deploy`

### 方案 B: 国内云服务器

#### 阿里云/腾讯云轻量应用服务器

**价格：** 约 ¥60-100/年

**步骤：**

1. 购买轻量应用服务器（选择 Ubuntu 系统）
2. SSH 连接到服务器
3. 安装 Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. 上传代码或使用 git clone
5. 安装依赖: `npm install`
6. 使用 PM2 保持运行:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name websocket-server
   pm2 startup
   pm2 save
   ```
7. 配置防火墙开放 3000 端口

### 方案 C: 使用 PM2 管理（推荐用于生产环境）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务器
pm2 start server.js --name websocket-server

# 查看状态
pm2 status

# 查看日志
pm2 logs websocket-server

# 重启
pm2 restart websocket-server

# 开机自启
pm2 startup
pm2 save
```

## ⚙️ 配置客户端

部署完成后，需要配置客户端连接地址：

### 方法 1: 在浏览器控制台设置

```javascript
localStorage.setItem('websocket_server_url', 'https://your-server.com');
```

### 方法 2: 创建配置文件

创建 `websocket-config.js`:

```javascript
window.WEBSOCKET_CONFIG = {
    serverUrl: 'https://your-server.com'
};
```

在 HTML 中引入：
```html
<script src="websocket-config.js"></script>
<script src="websocket-sync.js"></script>
```

## 🔧 环境变量

可以通过环境变量配置服务器：

```bash
# 端口号（默认 3000）
PORT=3000

# 允许的来源（CORS）
ALLOWED_ORIGINS=https://your-frontend.com
```

## 📊 监控和调试

### 查看实时连接

访问 `http://localhost:3000/status` 查看：
- 当前连接数
- 在线用户数
- 每个用户的设备数

### 查看日志

服务器会输出详细日志：
```
✅ 新设备连接: abc123
📱 设备注册成功: 用户=user_xxx, Socket=abc123, 设备=mobile
💾 收到数据保存请求: 用户=user_xxx, Key=planData_day
✅ 数据已同步到 1 个其他设备
```

### 客户端调试

在浏览器控制台：

```javascript
// 查看连接状态
console.log(window.websocketSync.getStatus());

// 查看在线设备
window.websocketSync.getDevices().then(devices => {
    console.log('在线设备:', devices);
});

// 手动同步数据
window.websocketSync.syncData('test_key', { data: 'test' });

// 请求全量同步
window.websocketSync.requestFullSync();
```

## 🛡️ 安全建议

### 生产环境配置

1. **限制 CORS 来源**

编辑 `server.js`:
```javascript
const io = socketIO(server, {
    cors: {
        origin: "https://your-domain.com", // 只允许你的域名
        methods: ["GET", "POST"]
    }
});
```

2. **添加身份验证**

可以添加 JWT 或其他认证机制

3. **使用 HTTPS/WSS**

部署时使用 SSL 证书（Render、Railway 等自动提供）

4. **限流保护**

安装 express-rate-limit:
```bash
npm install express-rate-limit
```

## 🐛 常见问题

### Q: 连接失败怎么办？

**A:** 检查：
1. 服务器是否正在运行（`npm start`）
2. 防火墙是否开放端口
3. 客户端地址是否正确
4. 浏览器控制台是否有错误

### Q: 数据没有同步？

**A:** 检查：
1. 是否成功连接（查看控制台日志）
2. 是否注册成功（应该看到 "设备注册成功"）
3. 是否在不同设备上使用相同的用户ID

### Q: 服务器重启后数据丢失？

**A:** 当前版本使用内存缓存，重启会清空。如需持久化，可以：
1. 添加 Redis 缓存
2. 添加数据库存储
3. 定期备份到文件

### Q: 如何支持更多用户？

**A:** 
1. 使用云服务器（更多资源）
2. 使用 Redis 集群
3. 使用负载均衡

## 📝 API 文档

### Socket.IO 事件

#### 客户端 → 服务器

| 事件 | 参数 | 说明 |
|------|------|------|
| `register` | `{userId, deviceInfo}` | 注册设备 |
| `sync-save` | `{key, value, timestamp}` | 同步单个数据 |
| `sync-batch` | `{items, timestamp}` | 批量同步数据 |
| `request-full-sync` | 无 | 请求全量数据 |
| `ping` | 无 | 心跳检测 |
| `get-devices` | 无 | 获取在线设备 |

#### 服务器 → 客户端

| 事件 | 参数 | 说明 |
|------|------|------|
| `registered` | `{success, userId, socketId}` | 注册成功 |
| `sync-data` | `{key, value, timestamp}` | 数据更新 |
| `sync-batch-data` | `{items, timestamp}` | 批量数据更新 |
| `full-sync-data` | `{data, timestamp}` | 全量数据 |
| `sync-saved` | `{success, key}` | 保存确认 |
| `device-connected` | `{socketId, deviceInfo}` | 设备连接 |
| `device-disconnected` | `{socketId}` | 设备断开 |
| `pong` | `{timestamp}` | 心跳响应 |

## 📞 技术支持

如有问题，请查看：
- 服务器日志
- 浏览器控制台
- `/status` 端点

## 📄 许可证

MIT License

