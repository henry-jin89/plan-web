# GitHub Pages 部署指南

## 🎯 目标
将您的计划管理器部署到 `https://henry-jin89.github.io/plan-web/`，实现以下功能：
- ✅ 在线访问计划管理器
- ✅ 数据持久化（不会因清除浏览器数据而丢失）
- ✅ 跨设备数据同步
- ✅ 移动端 PWA 支持

## 📋 部署步骤

### 第一步：创建 GitHub 仓库

1. **登录 GitHub**
   - 访问：https://github.com
   - 使用您的账户：henry-jin89

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 仓库名称：`plan-web`
   - 设置为 Public（公开）
   - ✅ 勾选 "Add a README file"
   - 点击 "Create repository"

### 第二步：上传项目文件

#### 方法一：通过 Web 界面上传（推荐）

1. **进入仓库主页**
   - https://github.com/henry-jin89/plan-web

2. **上传文件**
   - 点击 "uploading an existing file"
   - 将整个 `plan-web-main` 文件夹中的所有文件拖拽到页面
   - 或点击 "choose your files" 选择文件

3. **重要文件清单**（确保包含）：
   ```
   ✅ index.html
   ✅ day_plan.html
   ✅ week_plan.html
   ✅ month_plan.html
   ✅ sync-settings.html
   ✅ style.css
   ✅ mobile-styles.css
   ✅ config.js
   ✅ data-persistence.js
   ✅ common.js
   ✅ day_plan.js
   ✅ sync-service.js
   ✅ sync-providers.js
   ✅ manifest.json
   ✅ sw.js
   ✅ icons/ 文件夹及所有图标
   ✅ README.md
   ```

4. **提交文件**
   - 在页面底部填写提交信息：`初始部署：智能计划管理器`
   - 点击 "Commit changes"

#### 方法二：使用 Git 命令行

```bash
# 克隆仓库
git clone https://github.com/henry-jin89/plan-web.git
cd plan-web

# 复制所有文件到仓库目录
# 将 plan-web-main 文件夹中的所有文件复制到当前目录

# 添加文件到 Git
git add .

# 提交更改
git commit -m "初始部署：智能计划管理器"

# 推送到 GitHub
git push origin main
```

### 第三步：启用 GitHub Pages

1. **进入仓库设置**
   - 在仓库页面点击 "Settings" 标签

2. **配置 Pages**
   - 在左侧菜单找到 "Pages"
   - Source 选择："Deploy from a branch"
   - Branch 选择："main"
   - Folder 选择："/ (root)"
   - 点击 "Save"

3. **等待部署**
   - GitHub 会显示：✅ "Your site is published at https://henry-jin89.github.io/plan-web/"
   - 通常需要 1-5 分钟完成部署

### 第四步：配置数据同步

#### 4.1 配置 GitHub 数据同步（推荐）

1. **创建数据存储仓库**
   - 创建新的私有仓库：`plan-data`
   - 设置为 Private（保护隐私）

2. **生成 Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - Token 名称：`计划管理器数据同步`
   - 过期时间：90 days 或 No expiration
   - 权限勾选：
     - ✅ **repo** (完整仓库权限)
   - 点击 "Generate token"
   - **重要**：复制并保存 token（只显示一次）

3. **配置同步设置**
   - 访问：https://henry-jin89.github.io/plan-web/sync-settings.html
   - 选择 "GitHub 同步"
   - 填写信息：
     - Personal Access Token：粘贴刚才的 token
     - 仓库所有者：`henry-jin89`
     - 仓库名称：`plan-data`
     - 分支名称：`main`
   - 点击 "测试连接"
   - 成功后点击 "启用同步"

#### 4.2 配置 Google Drive 同步（可选）

1. **创建 Google Cloud 项目**
   - 访问：https://console.cloud.google.com/
   - 创建新项目：`计划管理器`

2. **启用 Drive API**
   - 搜索并启用 "Google Drive API"

3. **创建凭据**
   - 创建 API 密钥
   - 创建 OAuth 2.0 客户端 ID
   - 添加授权来源：`https://henry-jin89.github.io`

4. **更新配置文件**
   - 编辑 `config.js` 文件
   - 填入正确的 CLIENT_ID 和 API_KEY

### 第五步：测试功能

#### 5.1 访问网站
- 打开：https://henry-jin89.github.io/plan-web/
- 检查页面是否正常加载

#### 5.2 测试数据持久化
1. **创建测试数据**
   - 在日计划中添加一些任务
   - 在周计划中添加一些内容

2. **测试本地持久化**
   - 清除浏览器缓存和 Cookie
   - 重新访问网站
   - 检查数据是否通过同步恢复

3. **测试跨设备同步**
   - 在另一台设备（或浏览器）访问网站
   - 配置相同的同步设置
   - 检查数据是否自动同步

#### 5.3 测试移动端
1. **在手机上访问**
   - 打开：https://henry-jin89.github.io/plan-web/
   - 检查响应式布局

2. **安装 PWA 应用**
   - **iPhone**: Safari → 分享 → 添加到主屏幕
   - **Android**: Chrome → 菜单 → 添加到主屏幕

## 🔧 高级配置

### 自定义域名（可选）
1. 购买域名（如：planmanager.com）
2. 在 DNS 设置中添加 CNAME 记录指向：`henry-jin89.github.io`
3. 在 GitHub Pages 设置中添加自定义域名
4. 等待 SSL 证书自动配置

### 性能优化
1. **启用 HTTPS**（GitHub Pages 自动启用）
2. **Gzip 压缩**（GitHub Pages 自动启用）
3. **CDN 加速**（GitHub Pages 自动提供）

## 🚨 常见问题解决

### Q1: 网站显示 404 错误
**解决方案**：
- 检查仓库名称是否为 `plan-web`
- 确认 `index.html` 在仓库根目录
- 等待 5-10 分钟让 GitHub Pages 部署完成

### Q2: 数据同步不工作
**解决方案**：
- 检查 Personal Access Token 是否正确
- 确认 token 有 `repo` 权限
- 检查网络连接
- 查看浏览器控制台错误信息

### Q3: 移动端显示异常
**解决方案**：
- 检查 `mobile-styles.css` 是否正确上传
- 清除手机浏览器缓存
- 检查 viewport meta 标签

### Q4: PWA 安装失败
**解决方案**：
- 确认 `manifest.json` 和 `sw.js` 文件存在
- 检查 HTTPS 是否启用（GitHub Pages 自动启用）
- 使用 Chrome DevTools 检查 PWA 配置

## 📊 监控和维护

### 数据备份
- 定期导出数据备份
- 检查同步状态
- 监控存储使用情况

### 更新维护
- 定期检查新功能更新
- 更新浏览器到最新版本
- 关注 GitHub Pages 服务状态

## 🎉 完成！

恭喜！您已经成功部署了智能计划管理器到 GitHub Pages。

**您的网站地址：** https://henry-jin89.github.io/plan-web/

### 下一步可以做的：
- 🔄 配置自动数据同步
- 📱 在手机上安装 PWA 应用
- 🎨 自定义主题和样式
- 👥 分享给朋友和家人使用

### 需要帮助？
- 📚 查看 [使用说明.md](使用说明.md)
- 🔧 访问 [sync-settings.html](sync-settings.html) 配置同步
- 💬 在 GitHub Issues 中提问

---

**祝您使用愉快！** 🎊
