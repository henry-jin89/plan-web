# 计划管理器 - Google Drive 网站部署指南

本指南将详细介绍如何将计划管理器项目部署到网络上，使其可以在电脑和手机浏览器中访问，并实现Google Drive同步功能。

## 目录
1. [准备工作](#准备工作)
2. [Google Drive API配置](#google-drive-api配置)
3. [Google Apps Script后端配置](#google-apps-script后端配置)
4. [网站部署选项](#网站部署选项)
5. [同步功能配置](#同步功能配置)
6. [移动端优化](#移动端优化)
7. [故障排除](#故障排除)

## 准备工作

### 1. 文件准备
确保你有以下文件：
- `index.html` - 主页文件
- `style.css` - 样式文件
- `mobile-styles.css` - 移动端样式
- `manifest.json` - PWA配置
- `sw.js` - Service Worker
- `google-drive-sync.js` - Google Drive同步核心
- `google-drive-provider.js` - 同步提供商
- `gas-backend.js` - Google Apps Script代码
- 其他HTML页面文件
- JavaScript功能文件

### 2. 创建图标文件夹
创建 `icons` 文件夹，并准备以下尺寸的图标：
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Google Drive API配置

### 步骤 1: 创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击"创建项目"或选择现有项目
3. 输入项目名称（如"计划管理器"）
4. 记录项目ID

### 步骤 2: 启用Drive API

1. 在左侧菜单中，选择"API和服务" > "库"
2. 搜索"Google Drive API"
3. 点击"启用"

### 步骤 3: 创建API凭据

1. 转到"API和服务" > "凭据"
2. 点击"创建凭据" > "API密钥"
3. 复制生成的API密钥，保存为 `API_KEY`

### 步骤 4: 创建OAuth 2.0客户端

1. 在"凭据"页面，点击"创建凭据" > "OAuth 2.0客户端ID"
2. 选择"Web应用程序"
3. 添加授权JavaScript来源：
   - `http://localhost:8080` (本地测试)
   - `https://your-domain.com` (实际域名)
   - `https://your-username.github.io` (GitHub Pages)
4. 添加授权重定向URI：
   - `http://localhost:8080`
   - `https://your-domain.com`
   - `https://your-username.github.io`
5. 复制生成的客户端ID，保存为 `CLIENT_ID`

## Google Apps Script后端配置

### 步骤 1: 创建Apps Script项目

1. 访问 [Google Apps Script](https://script.google.com/)
2. 点击"新建项目"
3. 将项目重命名为"计划管理器后端"

### 步骤 2: 添加代码

1. 删除默认的 `myFunction`
2. 复制 `gas-backend.js` 中的所有代码
3. 粘贴到Apps Script编辑器中
4. 保存项目 (Ctrl+S)

### 步骤 3: 部署为Web应用

1. 点击右上角"部署" > "新建部署"
2. 选择类型为"Web应用"
3. 填写描述："计划管理器后端服务"
4. 执行身份：选择"我"
5. 访问权限：选择"任何人"
6. 点击"部署"
7. 复制Web应用URL，保存为 `BACKEND_URL`

### 步骤 4: 授权权限

1. 首次部署时，会要求授权
2. 点击"授权访问"
3. 选择你的Google账户
4. 允许Apps Script访问Google Drive

## 网站部署选项

### 选项 1: GitHub Pages (推荐)

#### 准备步骤
1. 在GitHub上创建新仓库 `plan-manager-web`
2. 将所有文件上传到仓库根目录

#### 部署步骤
1. 进入仓库设置 (Settings)
2. 滚动到 "Pages" 部分
3. 源选择 "Deploy from a branch"
4. 分支选择 "main" 或 "master"
5. 文件夹选择 "/ (root)"
6. 点击 "Save"
7. 等待几分钟，GitHub会提供访问URL

#### 配置自定义域名（可选）
1. 在DNS设置中添加CNAME记录指向 `username.github.io`
2. 在GitHub Pages设置中添加自定义域名
3. 启用HTTPS

### 选项 2: Netlify

#### 部署步骤
1. 访问 [Netlify](https://www.netlify.com/)
2. 注册账户并登录
3. 点击 "New site from Git"
4. 连接你的GitHub仓库
5. 构建设置：
   - Build command: 留空
   - Publish directory: `/`
6. 点击 "Deploy site"

#### 配置自定义域名
1. 在Netlify控制台中选择你的站点
2. 转到 "Domain settings"
3. 添加自定义域名
4. 按照指示配置DNS记录

### 选项 3: Vercel

#### 部署步骤
1. 访问 [Vercel](https://vercel.com/)
2. 注册账户并登录
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 框架预设选择 "Other"
6. 点击 "Deploy"

### 选项 4: Firebase Hosting

#### 准备步骤
1. 安装Firebase CLI：`npm install -g firebase-tools`
2. 在项目文件夹中运行：`firebase login`
3. 初始化项目：`firebase init hosting`

#### 部署步骤
1. 选择现有Firebase项目或创建新项目
2. 公共目录设置为当前目录
3. 配置为单页应用：选择 "No"
4. 运行部署：`firebase deploy`

### 选项 5: 传统Web主机

#### 部署步骤
1. 通过FTP或主机控制面板上传所有文件
2. 确保 `index.html` 在根目录
3. 配置HTTPS（强烈推荐）
4. 测试所有功能

## 同步功能配置

### 步骤 1: 更新配置文件

在部署完成后，创建配置文件 `config.js`：

```javascript
// 网站配置
window.APP_CONFIG = {
    // Google Drive API配置
    GOOGLE_DRIVE: {
        CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
        API_KEY: 'your-api-key',
        SCOPE: 'https://www.googleapis.com/auth/drive.file'
    },
    
    // 后端服务配置
    BACKEND: {
        URL: 'https://script.google.com/macros/s/your-script-id/exec'
    },
    
    // 网站配置
    SITE: {
        URL: 'https://your-domain.com',
        NAME: '计划管理器',
        VERSION: '1.0.0'
    }
};
```

### 步骤 2: 更新HTML文件

在所有HTML文件的 `<head>` 部分添加：

```html
<script src="config.js"></script>
```

### 步骤 3: 测试同步功能

1. 打开网站
2. 点击"设置"按钮
3. 选择"Google Drive同步"
4. 输入API配置信息
5. 点击"连接"测试

## 移动端优化

### PWA安装提示

网站会自动检测移动设备并显示安装提示。用户可以：

1. 在Chrome中点击"添加到主屏幕"
2. 在Safari中点击分享按钮 > "添加到主屏幕"
3. 在Edge中点击"..." > "应用" > "将此站点安装为应用"

### 移动端测试

在部署后，使用以下方式测试移动端功能：

1. Chrome开发者工具设备模拟
2. 真实移动设备测试
3. 检查触摸友好性
4. 验证PWA功能

## 环境变量配置

为了安全起见，建议使用环境变量存储敏感信息：

### GitHub Pages + GitHub Secrets

1. 在仓库设置中添加Secrets：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_API_KEY`
   - `BACKEND_URL`

2. 创建构建脚本自动替换配置

### Netlify环境变量

1. 在Netlify站点设置中添加环境变量
2. 使用构建脚本处理配置文件

## 自定义域名配置

### DNS配置示例

```
A记录:
@ 指向 185.199.108.153
@ 指向 185.199.109.153
@ 指向 185.199.110.153
@ 指向 185.199.111.153

CNAME记录:
www 指向 username.github.io.
```

### SSL证书

大多数现代托管平台会自动提供SSL证书：
- GitHub Pages: 自动启用
- Netlify: 自动配置Let's Encrypt
- Vercel: 自动HTTPS
- Firebase: 自动SSL

## 性能优化

### 1. 启用Gzip压缩

添加 `_headers` 文件（Netlify）：
```
/*
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000
```

### 2. 配置缓存策略

添加 `_redirects` 文件：
```
# 缓存静态资源
/assets/*  /assets/:splat  200!  Cache-Control: max-age=31536000
/css/*     /css/:splat     200!  Cache-Control: max-age=31536000
/js/*      /js/:splat      200!  Cache-Control: max-age=31536000
```

### 3. 压缩图片

使用工具压缩图标文件：
- TinyPNG
- ImageOptim
- Squoosh

## 监控和分析

### Google Analytics集成

在 `<head>` 标签中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 错误监控

添加简单的错误收集：

```javascript
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // 可以发送到日志服务
});
```

## 故障排除

### 常见问题

#### 1. Google Drive API错误

**问题**: `Origin not allowed`
**解决**: 检查OAuth客户端的授权来源配置

**问题**: `API key not found`
**解决**: 确认API密钥正确且已启用Drive API

#### 2. 同步功能无法工作

**问题**: 无法连接到后端
**解决**: 检查Apps Script部署URL和权限设置

**问题**: 数据不同步
**解决**: 检查浏览器控制台错误信息

#### 3. 移动端显示问题

**问题**: 页面缩放不正确
**解决**: 检查viewport meta标签设置

**问题**: 触摸不响应
**解决**: 确认CSS触摸样式正确应用

#### 4. PWA安装问题

**问题**: 不显示安装提示
**解决**: 检查manifest.json和HTTPS配置

### 调试工具

1. **浏览器开发者工具**
   - Console: 查看JavaScript错误
   - Network: 检查网络请求
   - Application: 检查PWA配置

2. **Google Drive API测试**
   - 使用Google API Explorer测试API调用

3. **移动端调试**
   - Chrome Remote Debugging
   - Safari Web Inspector

## 维护和更新

### 定期备份

1. 设置自动备份到多个位置
2. 定期测试恢复流程
3. 监控同步状态

### 版本更新

1. 更新Service Worker缓存版本
2. 测试新功能兼容性
3. 更新用户文档

### 监控检查清单

- [ ] 网站可访问性
- [ ] HTTPS证书有效性
- [ ] Google Drive API配额使用情况
- [ ] 用户反馈和错误报告
- [ ] 性能指标监控

## 安全建议

1. **定期轮换API密钥**
2. **监控API使用情况**
3. **限制OAuth重定向URI**
4. **启用HTTPS强制**
5. **定期更新依赖项**

## 联系支持

如果遇到问题，可以：

1. 检查GitHub Issues
2. 查看项目文档
3. 联系技术支持

---

*本指南最后更新时间：2024年12月*
