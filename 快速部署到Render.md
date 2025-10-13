# ⚡ 快速部署到 Render.com（15分钟）

> 简化版部署指南 - 只需 4 个步骤

---

## 📋 准备工作

1. ✅ GitHub 账号（已有）
2. 🆕 注册 Render.com 账号：https://render.com （用 GitHub 登录）

---

## 🚀 部署步骤

### 步骤 1: 配置 WebSocket 服务器地址（1分钟）

**暂时跳过，先部署服务器，获得地址后再配置**

---

### 步骤 2: 推送代码到 GitHub（2分钟）

在终端运行：

```bash
cd /Users/henry/Desktop/plan-web-main

# 提交所有更改
git add .
git commit -m "准备部署到Render"
git push origin main
```

---

### 步骤 3: 部署 WebSocket 服务器到 Render（10分钟）

#### 3.1 登录 Render

1. 访问：https://dashboard.render.com
2. 用 GitHub 登录

#### 3.2 创建 Web Service

1. 点击右上角 **"New +"** → **"Web Service"**
2. 找到并连接 `plan-web` 仓库
3. 填写配置：

```
Name: plan-websocket-server
Region: Singapore (或 Oregon)
Branch: main
Root Directory: websocket-server  ⚠️ 重要！
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

4. 点击 **"Create Web Service"**
5. 等待部署完成（3-5分钟），状态变为 "Live"

#### 3.3 获取服务器地址

部署成功后，复制你的服务器地址：

```
https://plan-websocket-server.onrender.com
```

📋 **保存这个地址！**

---

### 步骤 4: 配置前端连接到服务器（2分钟）

#### 4.1 自动添加配置（推荐）

在终端运行：

```bash
cd /Users/henry/Desktop/plan-web-main
node add-websocket-config.js
```

#### 4.2 修改配置文件

打开 `websocket-config.js`，修改第 10 行：

```javascript
// 修改前：
const SERVER_URL = 'http://localhost:3000';

// 修改后（替换为你的实际地址）：
const SERVER_URL = 'https://plan-websocket-server.onrender.com';
```

#### 4.3 推送到 GitHub

```bash
git add .
git commit -m "配置WebSocket服务器地址"
git push origin main
```

等待 1-2 分钟，GitHub Pages 自动更新。

---

## ✅ 测试部署

### 1. 测试服务器

访问：`https://你的服务器.onrender.com/health`

应该看到：

```json
{
  "status": "ok",
  "connections": 0,
  "users": 0
}
```

### 2. 测试前端

1. 访问：https://henry-jin89.github.io/plan-web/
2. 按 F12 打开开发者工具
3. 查看 Console，应该看到：

```
✅ WebSocket服务器地址已设置
📡 WebSocket配置已加载
🔌 WebSocket正在连接...
✅ WebSocket已连接
📱 设备注册成功
```

### 3. 测试跨设备同步

1. 在电脑上创建一条计划
2. 在手机上打开网站
3. 数据应该实时同步 ✨

---

## 🎉 完成！

你的计划管理器已成功部署到云端！

### 访问地址

- 🌐 前端：https://henry-jin89.github.io/plan-web/
- 🔌 后端：https://plan-websocket-server.onrender.com

### 功能

- ✅ 跨设备实时同步
- ✅ 自动备份到云端
- ✅ 离线使用
- ✅ 手机、平板、电脑通用

---

## 🔧 手动配置（可选）

如果自动脚本失败，可以手动添加配置：

在每个 HTML 文件的 `</body>` 之前添加：

```html
<!-- WebSocket 配置 -->
<script src="websocket-config.js"></script>
<script src="websocket-sync.js"></script>
```

需要修改的文件：
- index.html
- day_plan.html
- week_plan.html
- month_plan.html
- quarter_plan.html
- year_plan.html
- halfyear_plan.html
- monthly_schedule.html
- habit_tracker.html
- mood_tracker.html
- gratitude_diary.html
- reflection_template.html
- websocket-test.html

---

## ❓ 常见问题

### Q: 免费版会休眠吗？

A: 是的，15分钟无活动后休眠，首次访问需要 30秒 唤醒。

### Q: 如何查看日志？

A: Render Dashboard → 你的服务 → Logs 标签

### Q: 如何更新代码？

A: 只需 `git push`，Render 会自动重新部署。

---

## 📚 详细文档

查看完整指南：[Render部署指南.md](./Render部署指南.md)

---

**祝部署顺利！🚀**

如有问题，请检查：
1. Render 服务器是否 "Live"
2. GitHub 代码是否已推送
3. 配置文件地址是否正确
4. 浏览器控制台是否有错误

