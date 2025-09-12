# GitHub同步配置教程

## 第一步：创建GitHub仓库

1. 登录GitHub: https://github.com
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`plan-data`（建议私有仓库）
4. 选择"Private"保护隐私
5. 点击"Create repository"

## 第二步：创建Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击"Generate new token" → "Generate new token (classic)"
3. 勾选权限：
   - ✅ repo (完整仓库权限)
   - ✅ user (用户信息)
4. 点击"Generate token"
5. **复制并保存token**（只显示一次）

## 第三步：配置同步

1. 在本地打开项目文件夹
2. 双击 `sync-settings.html` 打开同步设置页面
3. 选择"GitHub 同步"卡片
4. 填写配置：
   - Personal Access Token：粘贴刚才的token
   - 仓库所有者：你的GitHub用户名
   - 仓库名称：plan-data
   - 分支名称：main

5. 点击"测试连接"
6. 成功后点击"启用同步"

## 验证方法

1. 在计划管理器中添加一些数据
2. 检查GitHub仓库是否出现同步文件
3. 清除浏览器数据
4. 重新配置同步，数据应该恢复

## 多设备同步

在其他设备上：
1. 下载同样的项目文件
2. 配置相同的GitHub同步设置
3. 数据会自动从GitHub同步过来
