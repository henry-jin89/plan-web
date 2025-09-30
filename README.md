# 🔥 智能计划管理器

一个功能完整的在线计划管理系统，支持多层级规划和Firebase数据库跨设备同步。

## ✨ 核心特点

- 🎯 **多层级计划**：日计划、周计划、月计划、季度计划、年度计划
- 🔥 **Firebase同步**：企业级云数据库，真正的跨设备数据同步
- 📱 **响应式设计**：完美支持电脑、平板、手机
- 📊 **智能分析**：习惯追踪、心情记录、反思模板
- 📴 **PWA支持**：离线使用，可安装到桌面
- 🔒 **数据安全**：Firebase云端加密存储

## 🚀 在线访问

**网站地址：** [https://henry-jin89.github.io/plan-web/](https://henry-jin89.github.io/plan-web/)

## 🔥 Firebase数据库同步

### 特色功能
- ✅ **零配置**：无需输入任何Token或密钥
- ✅ **自动同步**：数据变更时自动上传到Firebase
- ✅ **跨设备访问**：在任何设备访问网站，数据自动同步
- ✅ **实时备份**：Google Firebase企业级云数据库
- ✅ **匿名认证**：保护隐私，无需注册账号

### 使用方法
1. 访问网站，系统自动连接Firebase数据库
2. 开始创建计划，数据自动保存到云端
3. 在其他设备访问相同网址，数据自动恢复
4. 查看Firebase状态：访问 `/firebase-status.html`

## 📱 功能模块

### 📋 计划管理
- **日计划**：优先级矩阵、时间块规划
- **周计划**：目标分解、进度跟踪
- **月计划**：里程碑设定、数据分析
- **季度计划**：OKR管理、战略规划
- **年度计划**：长期愿景、价值观规划

### 📊 生活记录
- **习惯追踪**：数据可视化、行为分析
- **心情记录**：情绪模式分析
- **感恩日记**：积极心态培养
- **反思模板**：结构化思考框架

### 📅 日程管理
- **月度日历**：事件提醒、统计分析
- **时间管理**：全方位时间规划

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript ES6+
- **数据库**：Firebase Firestore
- **认证**：Firebase Anonymous Auth
- **存储**：localStorage + Firebase Cloud
- **PWA**：Service Worker, Web App Manifest

## 📱 移动端使用

### 安装到主屏幕
- **iPhone/iPad**：Safari → 分享 → "添加到主屏幕"
- **Android**：Chrome → 菜单 → "添加到主屏幕"

### 跨设备同步
1. 在电脑上制定计划
2. 在手机上查看和更新
3. 在平板上进行反思
4. 所有数据自动同步

## 🔒 数据安全

- **Firebase云端**：Google企业级数据库
- **加密传输**：HTTPS安全协议
- **匿名认证**：无需个人信息
- **多重备份**：本地+云端双重保护

## 📂 项目结构

```
plan-web/
├── index.html                 # 主页
├── firebase-database-sync.js  # Firebase数据库同步
├── firebase-status.html       # Firebase状态监控
├── day_plan.html             # 日计划
├── week_plan.html            # 周计划
├── month_plan.html           # 月计划
├── habit_tracker.html        # 习惯追踪
├── mood_tracker.html         # 心情记录
├── gratitude_diary.html      # 感恩日记
├── reflection_template.html  # 反思模板
├── style.css                 # 主样式
├── mobile-styles.css         # 移动端样式
├── sw.js                     # Service Worker
├── manifest.json             # PWA配置
└── icons/                    # 应用图标
```

## 🎯 使用场景

### 个人用户
- 日常计划管理和时间规划
- 习惯养成和目标追踪
- 跨设备数据同步使用

### 团队协作
- 共享计划模板
- 目标对齐和进度同步
- 反思总结和经验分享

## 📄 许可证

MIT License - 开源免费使用

## 🎉 开始使用

立即访问：[https://henry-jin89.github.io/plan-web/](https://henry-jin89.github.io/plan-web/)

让计划管理变得简单高效！🚀
