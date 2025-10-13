# 🚀 部署总览

本项目提供了完整的云端部署方案，让你的计划管理器支持跨设备实时同步。

---

## 📚 文档导航

### 🎯 快速开始（推荐新手）
- **[快速部署到Render.md](./快速部署到Render.md)** - 15分钟完成部署
- 适合：第一次部署云服务的用户

### 📖 详细指南
- **[Render部署指南.md](./Render部署指南.md)** - 完整的分步指南
- 包含：常见问题、故障排除、进阶配置

### 🛠️ 自动化工具

| 工具 | 说明 | 使用方法 |
|------|------|----------|
| `deploy-to-render.sh` | 一键部署脚本 | `./deploy-to-render.sh` |
| `add-websocket-config.js` | 自动配置 HTML | `node add-websocket-config.js` |
| `websocket-config.js` | 服务器地址配置 | 编辑此文件 |

---

## ⚡ 最快部署方式

### 方式 1: 一键脚本（推荐）

```bash
# 进入项目目录
cd /Users/henry/Desktop/plan-web-main

# 运行一键部署脚本
./deploy-to-render.sh
```

脚本会自动：
- ✅ 配置 WebSocket 服务器地址
- ✅ 更新所有 HTML 文件
- ✅ 提交到 GitHub
- ✅ 提供下一步指引

### 方式 2: 手动部署（4步）

#### 1️⃣ 部署服务器（10分钟）

访问 https://dashboard.render.com

配置：
```
Name: plan-websocket-server
Root Directory: websocket-server
Build Command: npm install
Start Command: npm start
```

#### 2️⃣ 配置地址（2分钟）

```bash
# 自动配置
node add-websocket-config.js
```

编辑 `websocket-config.js`，修改：
```javascript
const SERVER_URL = 'https://你的服务器.onrender.com';
```

#### 3️⃣ 提交代码（2分钟）

```bash
git add .
git commit -m "配置WebSocket服务器"
git push origin main
```

#### 4️⃣ 等待生效（1分钟）

访问 https://henry-jin89.github.io/plan-web/ 测试

---

## 🎯 部署架构

```
┌─────────────────────────────────────────────┐
│           用户设备（多端）                    │
│  电脑 / 手机 / 平板                          │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│         GitHub Pages（前端）                 │
│  https://henry-jin89.github.io/plan-web/    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│       Render.com（WebSocket服务器）          │
│  https://plan-websocket-server.onrender.com │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
            实时数据同步到所有设备
```

---

## ✅ 部署检查清单

### 部署前
- [ ] GitHub 代码已是最新
- [ ] Render.com 账号已注册
- [ ] 项目文件完整

### 部署中
- [ ] WebSocket 服务器已部署
- [ ] 服务器状态为 "Live"
- [ ] 获得服务器地址
- [ ] 配置文件已更新
- [ ] 代码已推送到 GitHub

### 部署后
- [ ] 服务器健康检查通过：`/health`
- [ ] 前端连接成功（浏览器控制台）
- [ ] 数据可以保存和读取
- [ ] 跨设备同步正常

---

## 🧪 测试方法

### 1. 测试服务器

```bash
# 健康检查
curl https://你的服务器.onrender.com/health

# 状态监控
curl https://你的服务器.onrender.com/status
```

预期响应：
```json
{
  "status": "ok",
  "connections": 0,
  "users": 0
}
```

### 2. 测试前端连接

1. 打开 https://henry-jin89.github.io/plan-web/
2. 按 F12 打开开发者工具
3. 查看 Console 标签
4. 应该看到：

```
✅ WebSocket服务器地址已设置
📡 WebSocket配置已加载
🔌 WebSocket正在连接...
✅ WebSocket已连接
📱 设备注册成功
```

### 3. 测试数据同步

**单设备测试：**
1. 创建一条计划
2. 刷新页面
3. 数据应该还在

**跨设备测试：**
1. 在电脑上创建计划
2. 在手机上打开网站
3. 数据应该自动同步

---

## 🔧 故障排除

### 问题 1: 服务器连接失败

**症状：**
```
❌ WebSocket连接失败
```

**解决方案：**
1. 检查服务器是否在线（访问 `/health`）
2. 检查 `websocket-config.js` 地址是否正确
3. 查看浏览器控制台错误信息
4. 检查网络防火墙设置

### 问题 2: 数据不同步

**症状：** 在另一台设备看不到数据

**解决方案：**
1. 检查是否成功连接（控制台应显示"已连接"）
2. 确认两台设备用的是同一个用户ID
3. 检查服务器日志（Render Dashboard → Logs）
4. 手动触发同步：刷新页面

### 问题 3: 服务器休眠

**症状：** 首次访问很慢

**解决方案：**
- 免费版会休眠，首次访问需等待 30-60 秒
- 升级到付费版（$7/月）永不休眠
- 使用 UptimeRobot 定期 ping 保持活跃

### 问题 4: 推送失败

**症状：**
```
❌ git push 失败
```

**解决方案：**
```bash
# 拉取最新代码
git pull origin main

# 解决冲突后重新推送
git push origin main
```

---

## 📊 性能优化

### Render 免费版限制

| 项目 | 限制 |
|------|------|
| 运行时间 | 750 小时/月 |
| 内存 | 512 MB |
| 休眠时间 | 15分钟无活动 |
| 带宽 | 100 GB/月 |
| 唤醒时间 | 30-60 秒 |

### 升级建议

**如果你需要：**
- ❌ 永不休眠
- ❌ 更快的响应
- ❌ 更多并发用户

**建议升级到：**
- Render Starter Plan: $7/月
- 或使用其他服务（Railway、Fly.io）

---

## 🌐 替代部署方案

### 方案 1: Railway.app
- ✅ 简单易用
- ✅ 不休眠（免费额度内）
- ⚠️ 免费额度有限

### 方案 2: Fly.io
- ✅ 性能优秀
- ✅ 多地区部署
- ⚠️ 需要信用卡

### 方案 3: 自有服务器
- ✅ 完全控制
- ✅ 不受限制
- ⚠️ 需要运维知识

详见：[Render部署指南.md](./Render部署指南.md) 的替代方案章节

---

## 📞 获取帮助

### 检查日志

**Render 服务器日志：**
1. 访问 https://dashboard.render.com
2. 点击你的服务
3. 点击 "Logs" 标签

**浏览器控制台：**
1. 按 F12 打开开发者工具
2. 查看 Console 标签
3. 查找红色错误信息

### 调试命令

```bash
# 查看本地服务器状态
curl http://localhost:3000/health

# 查看线上服务器状态
curl https://你的服务器.onrender.com/health

# 查看 Git 状态
git status

# 查看最近的提交
git log --oneline -5
```

### 常用链接

- **Render Dashboard**: https://dashboard.render.com
- **GitHub 仓库**: https://github.com/henry-jin89/plan-web
- **前端网站**: https://henry-jin89.github.io/plan-web/
- **项目文档**: [README.md](./README.md)

---

## 📝 更新部署

### 代码更新后重新部署

```bash
# 1. 提交更改
git add .
git commit -m "更新功能"
git push origin main

# 2. Render 会自动检测并重新部署（3-5分钟）

# 3. 查看部署状态
# 访问 Render Dashboard 查看进度
```

### 更新配置

```bash
# 1. 修改 websocket-config.js

# 2. 提交推送
git add websocket-config.js
git commit -m "更新配置"
git push origin main

# 3. 等待 GitHub Pages 更新（1-2分钟）
```

---

## 🎉 部署成功后

### 分享给朋友

你的朋友也可以使用：
```
https://henry-jin89.github.io/plan-web/
```

每个用户的数据是独立的，不会互相干扰。

### 安装到手机

**iOS:**
1. Safari 打开网站
2. 点击分享按钮
3. 选择"添加到主屏幕"

**Android:**
1. Chrome 打开网站
2. 点击菜单
3. 选择"添加到主屏幕"

### 享受功能

- ✅ 跨设备实时同步
- ✅ 离线使用
- ✅ 数据云端备份
- ✅ 多端协同

---

## 📄 许可证

MIT License - 开源免费使用

---

**准备好了吗？让我们开始部署吧！🚀**

推荐从这里开始：[快速部署到Render.md](./快速部署到Render.md)

