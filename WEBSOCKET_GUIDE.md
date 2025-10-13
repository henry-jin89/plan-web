# 🚀 WebSocket 实时同步完整指南

## 📖 目录

1. [快速开始](#快速开始)
2. [本地测试](#本地测试)
3. [部署到云服务器](#部署到云服务器)
4. [使用说明](#使用说明)
5. [故障排除](#故障排除)
6. [高级配置](#高级配置)

---

## 🎯 快速开始

### 第一步：安装 Node.js

**检查是否已安装：**
```bash
node --version
npm --version
```

**如果未安装：**
- 访问 https://nodejs.org/
- 下载并安装 LTS 版本（推荐 v18 或更高）

### 第二步：启动本地服务器

```bash
# 1. 进入服务器目录
cd websocket-server

# 2. 安装依赖（首次运行）
npm install

# 3. 启动服务器
npm start
```

看到以下输出表示成功：
```
✅ WebSocket 服务器运行在端口 3000
📡 Socket.IO 端点: http://localhost:3000
🏥 健康检查: http://localhost:3000/health
📊 服务器状态: http://localhost:3000/status
```

### 第三步：测试同步功能

1. **打开测试页面**
   - 在浏览器中打开 `websocket-test.html`
   - 点击 **"🔌 连接服务器"** 按钮

2. **验证连接**
   - 连接状态应显示 **"✅ 已连接"**
   - 查看实时日志，应该看到 **"✅ WebSocket 已连接"**

3. **测试数据同步**
   - 在 **"数据同步测试"** 区域输入测试数据
   - 点击 **"📤 发送数据"** 按钮
   - 在另一个设备（或浏览器窗口）打开同一页面
   - 应该能立即看到数据同步

---

## 🧪 本地测试

### 测试场景 1：电脑 ↔ 电脑

1. **启动服务器**
   ```bash
   cd websocket-server
   npm start
   ```

2. **打开两个浏览器窗口**
   - 窗口 A：打开 `day_plan.html`
   - 窗口 B：打开 `day_plan.html`

3. **测试同步**
   - 在窗口 A 中添加一条计划并保存
   - 窗口 B 应该立即显示通知：**"✅ 数据已从其他设备同步"**
   - 刷新窗口 B，数据应该已经更新

### 测试场景 2：电脑 ↔ 手机（同一 WiFi）

1. **获取电脑 IP 地址**
   
   **Mac/Linux:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   
   **Windows:**
   ```bash
   ipconfig
   ```
   
   例如：`192.168.1.100`

2. **修改服务器地址**
   
   在手机浏览器中打开 `websocket-test.html`，修改服务器地址为：
   ```
   http://192.168.1.100:3000
   ```

3. **测试同步**
   - 电脑端保存数据
   - 手机端应该立即收到同步通知

### 测试场景 3：使用测试页面

1. **打开测试页面**
   ```
   websocket-test.html
   ```

2. **连接服务器**
   - 点击 **"🔌 连接服务器"**

3. **查看在线设备**
   - 点击 **"🔄 刷新设备列表"**
   - 应该能看到所有连接的设备

4. **测试数据同步**
   - 输入测试数据
   - 点击 **"📤 发送数据"**
   - 在其他设备上应该能立即收到

---

## ☁️ 部署到云服务器

### 方案 A：Render.com（推荐，完全免费）

#### 1. 准备代码仓库

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Add WebSocket server"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

#### 2. 部署到 Render

1. **注册账号**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 **"New +"** → **"Web Service"**
   - 选择你的 GitHub 仓库

3. **配置服务**
   ```
   Name: plan-websocket-server
   Environment: Node
   Build Command: cd websocket-server && npm install
   Start Command: cd websocket-server && npm start
   Plan: Free
   ```

4. **部署**
   - 点击 **"Create Web Service"**
   - 等待部署完成（约 2-5 分钟）

5. **获取服务器地址**
   ```
   https://plan-websocket-server.onrender.com
   ```

#### 3. 配置客户端

在浏览器控制台执行：
```javascript
localStorage.setItem('websocket_server_url', 'https://plan-websocket-server.onrender.com');
```

或者在 `websocket-test.html` 中修改默认服务器地址。

### 方案 B：Railway.app

#### 1. 注册并连接 GitHub

- 访问 https://railway.app
- 使用 GitHub 账号登录

#### 2. 部署项目

1. 点击 **"New Project"** → **"Deploy from GitHub repo"**
2. 选择你的仓库
3. Railway 会自动检测 Node.js 项目
4. 在设置中指定根目录为 `websocket-server`
5. 自动部署完成

#### 3. 获取服务器地址

- 在项目设置中找到 **"Public URL"**
- 例如：`https://your-app.up.railway.app`

### 方案 C：阿里云/腾讯云服务器

#### 1. 购买服务器

- 选择轻量应用服务器（约 ¥60-100/年）
- 系统：Ubuntu 20.04 或更高

#### 2. 连接服务器

```bash
ssh root@你的服务器IP
```

#### 3. 安装 Node.js

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 4. 上传代码

**方法 1：使用 Git**
```bash
# 安装 Git
apt install git -y

# 克隆仓库
git clone https://github.com/你的用户名/你的仓库.git
cd 你的仓库/websocket-server
```

**方法 2：使用 SCP**
```bash
# 在本地电脑执行
scp -r websocket-server root@你的服务器IP:/root/
```

#### 5. 安装依赖并启动

```bash
cd websocket-server
npm install
npm start
```

#### 6. 使用 PM2 保持运行

```bash
# 安装 PM2
npm install -g pm2

# 启动服务器
pm2 start server.js --name websocket-server

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs websocket-server
```

#### 7. 配置防火墙

```bash
# 开放 3000 端口
ufw allow 3000
ufw enable
```

#### 8. 配置域名（可选）

如果有域名，可以配置 Nginx 反向代理：

```bash
# 安装 Nginx
apt install nginx -y

# 创建配置文件
nano /etc/nginx/sites-available/websocket
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/websocket /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 📱 使用说明

### 自动同步

系统会自动同步以下操作：
- ✅ 保存日计划
- ✅ 保存周计划
- ✅ 保存月计划
- ✅ 保存季度/半年/年计划
- ✅ 保存习惯追踪
- ✅ 保存心情记录
- ✅ 保存感恩日记

**同步流程：**
1. 在设备 A 保存数据
2. 数据立即发送到 WebSocket 服务器
3. 服务器广播给所有其他设备
4. 设备 B 收到数据并自动保存
5. 显示通知：**"✅ 数据已从其他设备同步"**

### 手动操作

#### 查看连接状态

在浏览器控制台执行：
```javascript
console.log(window.websocketSync.getStatus());
```

输出示例：
```json
{
  "isConnected": true,
  "userId": "user_1697192400000_abc123",
  "deviceInfo": {
    "type": "desktop",
    "platform": "MacIntel"
  },
  "reconnectAttempts": 0,
  "queueSize": 0
}
```

#### 查看在线设备

```javascript
window.websocketSync.getDevices().then(devices => {
    console.log('在线设备:', devices);
});
```

#### 手动同步数据

```javascript
// 同步单个数据
window.websocketSync.syncData('planData_day', {
    date: '2025-10-13',
    tasks: [...]
});

// 批量同步
window.websocketSync.syncBatch([
    { key: 'planData_day', value: {...} },
    { key: 'planData_week', value: {...} }
]);

// 请求全量同步
window.websocketSync.requestFullSync();
```

#### 修改服务器地址

```javascript
// 方法 1：通过 localStorage
localStorage.setItem('websocket_server_url', 'https://your-server.com');
location.reload();

// 方法 2：直接连接
window.websocketSync.connect('https://your-server.com');
```

---

## 🔧 故障排除

### 问题 1：无法连接到服务器

**症状：**
- 连接状态显示 **"❌ 未连接"**
- 控制台显示 **"连接错误"**

**解决方案：**

1. **检查服务器是否运行**
   ```bash
   # 访问健康检查端点
   curl http://localhost:3000/health
   ```
   
   应该返回：
   ```json
   {"status":"ok","timestamp":"...","connections":0,"users":0}
   ```

2. **检查防火墙**
   ```bash
   # Mac
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   
   # Linux
   sudo ufw status
   ```

3. **检查端口占用**
   ```bash
   # Mac/Linux
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

4. **查看服务器日志**
   ```bash
   # 如果使用 PM2
   pm2 logs websocket-server
   
   # 或直接运行时查看控制台输出
   ```

### 问题 2：连接成功但不同步

**症状：**
- 连接状态显示 **"✅ 已连接"**
- 但数据不同步

**解决方案：**

1. **检查用户ID是否一致**
   ```javascript
   // 在两个设备上执行
   console.log(localStorage.getItem('websocket_userId'));
   ```
   
   应该返回相同的用户ID。

2. **检查数据键名**
   ```javascript
   // 确保使用正确的键名格式
   'planData_day'  // ✅ 正确
   'day_plan'      // ❌ 错误
   ```

3. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签
   - 搜索 **"[WebSocket同步]"** 相关日志

4. **测试心跳**
   ```javascript
   window.websocketSync.sendHeartbeat();
   ```
   
   应该在控制台看到 **"💓 心跳响应"**

### 问题 3：频繁断开重连

**症状：**
- 连接状态反复变化
- 控制台显示多次重连尝试

**解决方案：**

1. **检查网络稳定性**
   ```bash
   ping your-server.com
   ```

2. **增加重连延迟**
   
   编辑 `websocket-sync.js`：
   ```javascript
   this.socket = io(serverUrl, {
       reconnectionDelay: 2000,      // 从 1000 改为 2000
       reconnectionDelayMax: 10000,  // 从 5000 改为 10000
   });
   ```

3. **检查服务器资源**
   ```bash
   # 查看服务器负载
   top
   
   # 查看内存使用
   free -h
   ```

### 问题 4：手机端无法连接

**症状：**
- 电脑端正常
- 手机端无法连接

**解决方案：**

1. **确保在同一 WiFi**
   - 电脑和手机必须在同一局域网

2. **使用正确的 IP 地址**
   ```javascript
   // ❌ 错误
   'http://localhost:3000'
   
   // ✅ 正确（使用电脑的局域网IP）
   'http://192.168.1.100:3000'
   ```

3. **检查防火墙**
   - 确保电脑防火墙允许局域网访问

4. **使用云服务器**
   - 部署到 Render/Railway 等云平台
   - 使用公网地址，不受局域网限制

### 问题 5：数据丢失

**症状：**
- 同步后数据消失
- 刷新页面后数据不见了

**解决方案：**

1. **检查 localStorage**
   ```javascript
   // 查看所有计划数据
   for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key.startsWith('planData_')) {
           console.log(key, localStorage.getItem(key));
       }
   }
   ```

2. **检查数据格式**
   ```javascript
   // 确保数据是有效的 JSON
   try {
       JSON.parse(localStorage.getItem('planData_day'));
       console.log('✅ 数据格式正确');
   } catch (e) {
       console.log('❌ 数据格式错误:', e);
   }
   ```

3. **使用测试页面验证**
   - 打开 `websocket-test.html`
   - 发送测试数据
   - 在另一设备上检查是否收到

---

## ⚙️ 高级配置

### 修改服务器端口

编辑 `websocket-server/server.js`：
```javascript
const PORT = process.env.PORT || 8080; // 改为 8080
```

或使用环境变量：
```bash
PORT=8080 npm start
```

### 配置 CORS

编辑 `websocket-server/server.js`：
```javascript
const io = socketIO(server, {
    cors: {
        origin: "https://your-domain.com", // 只允许你的域名
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

### 添加身份验证

在 `server.js` 中添加：
```javascript
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (isValidToken(token)) {
        next();
    } else {
        next(new Error('Authentication error'));
    }
});
```

在客户端 `websocket-sync.js` 中：
```javascript
this.socket = io(serverUrl, {
    auth: {
        token: 'your-auth-token'
    }
});
```

### 数据持久化

使用 Redis 存储数据：

```bash
# 安装 Redis 客户端
cd websocket-server
npm install redis
```

编辑 `server.js`：
```javascript
const redis = require('redis');
const client = redis.createClient();

// 保存数据到 Redis
socket.on('sync-save', async (data) => {
    const { userId } = userSockets.get(socket.id);
    const { key, value } = data;
    
    // 保存到 Redis
    await client.set(`${userId}:${key}`, JSON.stringify(value));
    
    // 广播给其他设备
    socket.to(userId).emit('sync-data', data);
});
```

### 性能优化

#### 1. 启用压缩

```javascript
const compression = require('compression');
app.use(compression());
```

#### 2. 限制连接数

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100 // 最多 100 个请求
});

app.use(limiter);
```

#### 3. 使用集群

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // 启动服务器
    server.listen(PORT);
}
```

---

## 📊 监控和日志

### 查看服务器状态

访问：`http://your-server.com/status`

返回：
```json
{
  "status": "running",
  "timestamp": "2025-10-13T10:30:00.000Z",
  "totalConnections": 5,
  "totalUsers": 3,
  "users": [
    {"userId": "user_xxx", "devices": 2},
    {"userId": "user_yyy", "devices": 1}
  ]
}
```

### 查看实时日志

```bash
# 使用 PM2
pm2 logs websocket-server --lines 100

# 或使用 tail
tail -f /path/to/logs/server.log
```

### 配置日志记录

安装 Winston：
```bash
npm install winston
```

在 `server.js` 中：
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 使用 logger
logger.info('服务器启动');
logger.error('发生错误', { error: err });
```

---

## 🎓 最佳实践

### 1. 使用心跳保持连接

```javascript
// 每 30 秒发送一次心跳
setInterval(() => {
    if (window.websocketSync.isConnected) {
        window.websocketSync.sendHeartbeat();
    }
}, 30000);
```

### 2. 处理网络断开

```javascript
window.addEventListener('online', () => {
    console.log('网络已恢复，重新连接...');
    window.websocketSync.connect();
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
});
```

### 3. 批量同步优化

```javascript
// 收集一段时间内的所有变更，然后批量同步
let pendingChanges = [];
let syncTimer = null;

function scheduleBatchSync(key, value) {
    pendingChanges.push({ key, value });
    
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        if (pendingChanges.length > 0) {
            window.websocketSync.syncBatch(pendingChanges);
            pendingChanges = [];
        }
    }, 1000); // 1秒后批量同步
}
```

### 4. 错误重试

```javascript
async function syncWithRetry(key, value, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await window.websocketSync.syncData(key, value);
            return true;
        } catch (error) {
            console.error(`同步失败 (${i + 1}/${maxRetries}):`, error);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    return false;
}
```

---

## 📞 技术支持

### 常用命令速查

```bash
# 启动服务器
npm start

# 开发模式（自动重启）
npm run dev

# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs websocket-server

# 重启服务器
pm2 restart websocket-server

# 停止服务器
pm2 stop websocket-server

# 删除 PM2 进程
pm2 delete websocket-server
```

### 调试技巧

1. **启用详细日志**
   ```javascript
   localStorage.setItem('debug', 'socket.io-client:*');
   ```

2. **查看 WebSocket 连接**
   - 打开浏览器开发者工具
   - Network 标签 → WS（WebSocket）
   - 查看消息收发记录

3. **测试服务器连接**
   ```bash
   curl http://localhost:3000/health
   ```

---

## 🎉 完成！

现在您已经完全掌握了 WebSocket 实时同步系统！

**下一步：**
1. ✅ 启动本地服务器测试
2. ✅ 在多个设备上测试同步
3. ✅ 部署到云服务器
4. ✅ 配置客户端连接
5. ✅ 享受毫秒级实时同步！

**有问题？**
- 查看 [故障排除](#故障排除) 章节
- 使用 `websocket-test.html` 进行诊断
- 查看服务器日志和浏览器控制台

祝您使用愉快！🚀

