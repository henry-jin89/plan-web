# 智能计划管理器

一个功能完整的在线计划管理系统，支持日计划、周计划、月计划等多层级规划，具备跨设备数据同步功能。

## 📋 功能特点

- 🎯 **多层级计划**：日计划、周计划、月计划、季度计划、年度计划
- 📱 **响应式设计**：支持电脑、平板、手机等多设备
- ☁️ **数据同步**：支持 GitHub、Google Drive、联想个人云等多种同步方式
- 📊 **智能分析**：习惯追踪、进度分析、生产力统计
- 🧠 **AI 助手**：智能建议、任务分类、时间规划
- 📴 **离线支持**：PWA 应用，支持离线使用

## 🚀 快速开始

### 在线访问
访问：`https://henry-jin89.github.io/plan-web/`

### 本地部署
1. 下载或克隆此仓库
2. 在文件夹中运行：`python -m http.server 8080`
3. 打开浏览器访问：`http://localhost:8080`

## ⚙️ 配置同步功能

### GitHub 同步（推荐）
1. 打开 `sync-settings.html`
2. 选择 "GitHub 同步"
3. 按照指引配置 Personal Access Token
4. 创建私有仓库存储数据

### Google Drive 同步
1. 在 Google Cloud Console 创建项目
2. 启用 Drive API 并获取 API 密钥
3. 在同步设置中配置 OAuth 信息

## 📱 移动端安装

### iPhone/iPad
1. 用 Safari 打开网站
2. 点击分享按钮 → "添加到主屏幕"

### Android
1. 用 Chrome 打开网站  
2. 点击菜单 → "添加到主屏幕"

## 🔒 数据安全

- 所有数据存储在您的个人云服务中
- 支持多重备份机制
- 端到端加密传输
- 定期自动备份

## 📚 使用指南

详细使用说明请查看：
- [快速部署指南](快速部署指南.md)
- [数据同步配置](setup-github-sync.md) 
- [数据恢复指南](数据恢复指南.md)

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript ES6+
- **存储**：localStorage, IndexedDB, Cloud Storage
- **同步**：GitHub API, Google Drive API, WebDAV
- **PWA**：Service Worker, Web App Manifest

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

---

**享受高效的计划管理体验！** 🎊
