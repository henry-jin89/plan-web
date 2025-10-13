# 🚀 Render.com 部署指南（15分钟完成）

> 本指南将帮助你把计划管理器部署到 Render.com 云平台

---

## 📋 目录

1. [准备工作](#准备工作)
2. [步骤1: 推送代码到GitHub](#步骤1-推送代码到github)
3. [步骤2: 部署WebSocket服务器](#步骤2-部署websocket服务器)
4. [步骤3: 配置前端连接](#步骤3-配置前端连接)
5. [步骤4: 部署前端（可选）](#步骤4-部署前端可选)
6. [验证和测试](#验证和测试)

---

## 准备工作

### ✅ 需要准备的账号

1. **GitHub 账号**（已有）
   - 你的仓库：https://github.com/henry-jin89/plan-web

2. **Render.com 账号**（免费注册）
   - 注册地址：https://render.com
   - 点击右上角 "Get Started" 或 "Sign Up"
   - 选择 "Sign up with GitHub" 直接用GitHub登录（推荐）

### 📝 你将获得

- ✅ WebSocket 服务器地址：`https://你的项目名.onrender.com`
- ✅ 前端网站地址：继续使用 `https://henry-jin89.github.io/plan-web/`
- ✅ 跨设备实时同步功能

---

## 步骤1: 推送代码到GitHub

### 1.1 检查代码状态

打开终端，进入项目目录：

```bash
cd /Users/henry/Desktop/plan-web-main
git status
```

### 1.2 提交所有更改

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "准备部署到Render"

# 推送到GitHub
git push origin main
```

> **说明**：如果主分支名为 `master`，请将 `main` 改为 `master`

### 1.3 验证推送成功

访问你的GitHub仓库，确认文件已更新：
- https://github.com/henry-jin89/plan-web

---

## 步骤2: 部署WebSocket服务器

### 2.1 登录 Render.com

1. 访问 https://dashboard.render.com
2. 使用 GitHub 账号登录

### 2.2 创建新的 Web Service

1. 点击页面右上角的 **"New +"** 按钮
2. 选择 **"Web Service"**

### 2.3 连接 GitHub 仓库

1. 在仓库列表中找到 **`plan-web`**
   - 如果没看到，点击 "Configure account" 授权访问
2. 点击 **"Connect"** 连接仓库

### 2.4 配置服务器参数

填写以下配置：

| 配置项 | 值 |
|--------|-----|
| **Name** | `plan-websocket-server`（或你喜欢的名字） |
| **Region** | `Singapore` (新加坡，速度快) 或 `Oregon` |
| **Branch** | `main` (或 `master`) |
| **Root Directory** | `websocket-server` ⚠️ **重要** |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (免费版) |

### 2.5 高级设置（可选）

点击 **"Advanced"** 展开高级设置：

1. **环境变量**（可选添加）：
   ```
   PORT=10000
   NODE_ENV=production
   ```

2. **健康检查路径**：
   ```
   /health
   ```

### 2.6 开始部署

1. 点击页面底部的 **"Create Web Service"** 按钮
2. Render 会自动开始构建和部署
3. 等待 3-5 分钟，直到状态变为 **"Live"** (绿色)

### 2.7 获取服务器地址

部署成功后，你会看到服务器地址：

```
https://plan-websocket-server.onrender.com
```

**📋 记下这个地址，后面会用到！**

### 2.8 测试服务器

在浏览器访问健康检查端点：

```
https://plan-websocket-server.onrender.com/health
```

如果看到类似以下 JSON 响应，说明部署成功：

```json
{
  "status": "ok",
  "timestamp": "2025-10-13T10:30:00.000Z",
  "connections": 0,
  "users": 0
}
```

---

## 步骤3: 配置前端连接

现在需要让前端连接到你刚部署的 WebSocket 服务器。

### 3.1 创建配置文件

在项目根目录创建 `websocket-config.js` 文件：

```javascript
// WebSocket 服务器配置
window.WEBSOCKET_CONFIG = {
    // 替换为你的 Render 服务器地址
    serverUrl: 'https://plan-websocket-server.onrender.com'
};

console.log('✅ WebSocket配置已加载:', window.WEBSOCKET_CONFIG.serverUrl);
```

> ⚠️ **重要**：将上面的地址替换为你在步骤 2.7 获得的实际地址

### 3.2 在所有页面引入配置

需要在以下 HTML 文件的 `<head>` 或 `<body>` 底部（在 `websocket-sync.js` 之前）添加：

```html
<!-- WebSocket 配置 -->
<script src="websocket-config.js"></script>
```

**需要修改的文件列表：**

- `index.html`
- `day_plan.html`
- `week_plan.html`
- `month_plan.html`
- `quarter_plan.html`
- `year_plan.html`
- `halfyear_plan.html`
- `monthly_schedule.html`
- `habit_tracker.html`
- `mood_tracker.html`
- `gratitude_diary.html`
- `reflection_template.html`
- `websocket-test.html`

**示例**（在 `</body>` 之前添加）：

```html
    <!-- WebSocket 配置和同步 -->
    <script src="websocket-config.js"></script>
    <script src="websocket-sync.js"></script>
</body>
```

### 3.3 提交并推送更改

```bash
# 添加新文件
git add websocket-config.js

# 添加所有修改的 HTML 文件
git add *.html

# 提交
git commit -m "配置WebSocket服务器地址"

# 推送到 GitHub
git push origin main
```

### 3.4 等待 GitHub Pages 更新

GitHub Pages 会自动部署，等待 1-2 分钟后访问：

```
https://henry-jin89.github.io/plan-web/
```

---

## 步骤4: 部署前端（可选）

如果你想同时把前端也部署到 Render（而不是使用 GitHub Pages），可以按以下步骤操作：

### 4.1 创建静态站点

1. 在 Render Dashboard 点击 **"New +"**
2. 选择 **"Static Site"**
3. 连接同一个 GitHub 仓库 `plan-web`

### 4.2 配置静态站点

| 配置项 | 值 |
|--------|-----|
| **Name** | `plan-web-app` |
| **Branch** | `main` |
| **Root Directory** | 留空 |
| **Build Command** | 留空 |
| **Publish Directory** | `.` (当前目录) |

### 4.3 部署

点击 **"Create Static Site"**，等待部署完成。

你会获得一个新的网址：

```
https://plan-web-app.onrender.com
```

---

## 验证和测试

### ✅ 测试清单

#### 1. 测试 WebSocket 服务器

访问健康检查：
```
https://your-server.onrender.com/health
```

访问状态监控：
```
https://your-server.onrender.com/status
```

#### 2. 测试前端连接

1. 访问你的前端网站
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签页
4. 应该看到类似信息：

```
✅ WebSocket配置已加载: https://plan-websocket-server.onrender.com
🔌 WebSocket正在连接...
✅ WebSocket已连接
📱 设备注册成功
```

#### 3. 测试跨设备同步

1. 在电脑上打开网站，创建一条计划
2. 在手机上打开同一网站
3. 应该能看到刚才创建的计划（实时同步）

#### 4. 测试离线恢复

1. 关闭 WiFi
2. 重新打开
3. 应该自动重连并同步数据

---

## 🎯 完成后的架构

```
用户设备
    ↓
GitHub Pages 前端
(https://henry-jin89.github.io/plan-web/)
    ↓
Render WebSocket 服务器
(https://plan-websocket-server.onrender.com)
    ↓
实时同步到所有设备
```

---

## 📱 客户端地址配置

如果你使用了不同的服务器地址，用户可以在浏览器控制台手动配置：

```javascript
// 设置自定义服务器地址
localStorage.setItem('websocket_server_url', 'https://your-custom-server.com');

// 刷新页面生效
location.reload();
```

---

## 🔧 常见问题

### Q1: Render 免费版会自动休眠吗？

**A:** 是的，免费版在 15 分钟无活动后会休眠。首次访问需要 30-60 秒唤醒。

**解决方案：**
- 升级到付费版（$7/月）
- 使用 UptimeRobot 等服务定期 ping 保持活跃
- 使用其他不休眠的服务（Railway.app 等）

### Q2: WebSocket 连接失败？

**A:** 检查：
1. 服务器是否处于 "Live" 状态
2. `websocket-config.js` 中的地址是否正确
3. 浏览器控制台是否有错误信息
4. 防火墙/网络是否阻止了 WebSocket 连接

### Q3: 如何查看服务器日志？

**A:** 
1. 登录 Render Dashboard
2. 点击你的 Web Service
3. 点击 "Logs" 标签页
4. 查看实时日志

### Q4: 如何更新部署？

**A:** 只需推送代码到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Render 会自动检测并重新部署。

### Q5: 可以使用自定义域名吗？

**A:** 可以！在 Render 的 Settings → Custom Domains 中添加你的域名。

---

## 💰 费用说明

### Render 免费版限制

- ✅ 免费 750 小时/月（足够单个服务使用）
- ✅ 自动 HTTPS
- ✅ 无限带宽
- ⚠️ 15分钟无活动后休眠
- ⚠️ 每月 100GB 流量

### 升级选项

如果需要不休眠 + 更好性能：

- **Starter Plan**: $7/月
  - 不休眠
  - 更快的 CPU
  - 更多内存

---

## 🎉 部署完成！

恭喜！你已经成功将计划管理器部署到云端。

### 接下来可以：

1. ✅ 分享网站给朋友
2. ✅ 在多个设备上使用
3. ✅ 享受实时同步功能
4. ✅ 添加到手机主屏幕（PWA）

### 有用的链接

- **前端网站**: https://henry-jin89.github.io/plan-web/
- **WebSocket 服务器**: https://你的服务器.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **GitHub 仓库**: https://github.com/henry-jin89/plan-web

---

## 📞 需要帮助？

如遇到问题，请检查：

1. Render 服务器日志
2. 浏览器控制台错误
3. 网络连接状态
4. GitHub 代码是否正确推送

---

**祝部署顺利！🚀**

