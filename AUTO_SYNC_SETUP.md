# 全自动后台同步设置指南

## 🚀 零配置自动同步

现在您的计划管理器支持**全自动后台同步**！一旦配置完成，您的数据将：

- ✅ 自动保存到GitHub
- ✅ 删除浏览器数据后自动恢复
- ✅ 跨设备自动同步
- ✅ 无需手动点击任何按钮

## 📋 快速设置步骤

### 方法一：修改配置文件（推荐）

1. **打开 `config.js` 文件**
2. **找到 `GITHUB_CONFIG` 部分**
3. **按以下方式填写您的信息：**

```javascript
GITHUB_CONFIG: {
    enabled: true,                                          // 启用自动同步
    token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',     // 您的GitHub Token
    owner: 'your-username',                                 // 您的GitHub用户名
    repo: 'plan-data',                                      // 仓库名称
    branch: 'main'                                          // 分支名称
}
```

4. **保存文件**

### 方法二：URL参数传递（临时使用）

在浏览器地址栏添加参数：
```
?github_token=您的Token&github_owner=您的用户名&github_repo=仓库名
```

例如：
```
https://your-site.com/index.html?github_token=ghp_xxx&github_owner=john&github_repo=plan-data
```

## 🔑 获取GitHub Token

1. **访问** [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. **点击** "Generate new token"
3. **设置过期时间**（建议选择90天或No expiration）
4. **选择权限：**
   - ✅ `repo` - 完整仓库权限（私有仓库必需）
   - ✅ `public_repo` - 公开仓库权限（仅公开仓库时可选）
5. **点击** "Generate token"
6. **复制Token**（格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

## 📁 创建GitHub仓库

1. **访问** [GitHub](https://github.com)
2. **点击** "New repository"
3. **填写信息：**
   - Repository name: `plan-data`（或您喜欢的名称）
   - Description: `计划管理器数据备份`
   - ✅ Private（推荐，保护隐私）
4. **点击** "Create repository"

## ✅ 验证设置是否成功

配置完成后：

1. **打开任意页面**（如日计划、周计划等）
2. **查看浏览器控制台**（F12 → Console）
3. **寻找以下信息：**
   ```
   🚀 启动全自动后台同步服务...
   ✅ 从localStorage检测到GitHub配置
   🔧 正在自动启用GitHub同步...
   ✅ GitHub同步已自动启用
   🔄 执行初始后台同步...
   ✅ 初始同步完成，数据已备份到GitHub
   ```

4. **检查GitHub仓库**是否出现 `plan-data-backup.json` 文件

## 🔄 自动恢复测试

要测试自动恢复功能：

1. **确保已有数据备份到GitHub**
2. **清除浏览器数据**：
   - Chrome: 设置 → 隐私和安全 → 清除浏览数据
   - 或按 Ctrl+Shift+Delete
3. **重新打开网站**
4. **系统会自动检测并恢复数据**

## 🛠️ 高级功能

### 自动同步触发条件

- ✅ 数据变化后5秒自动同步
- ✅ 页面切换时同步
- ✅ 网络恢复时同步
- ✅ 长时间无操作后的定期同步
- ✅ 页面关闭前紧急同步

### 支持的数据类型

- 📅 日计划、周计划、月计划
- 📈 习惯跟踪数据
- 💭 感恩日记
- 😊 心情追踪
- 📝 反思模板
- 🎯 自定义目标

## ❓ 常见问题

### Q: 为什么同步没有启动？
A: 检查以下几点：
- Token格式是否正确（以 `ghp_` 开头）
- 仓库是否存在且有访问权限
- 网络连接是否正常

### Q: 数据没有自动恢复？
A: 可能原因：
- GitHub上没有备份文件
- Token权限不足
- 网络连接问题

### Q: 如何查看同步状态？
A: 打开浏览器开发者工具（F12），在Console中查看同步日志

### Q: 可以关闭自动同步吗？
A: 在 `config.js` 中设置 `enabled: false`

## 🔒 隐私和安全

- ✅ Token不会显示在界面上
- ✅ 建议使用私有仓库
- ✅ 支持Token权限限制
- ✅ 自动清除URL中的敏感参数

## 📞 获取帮助

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 确认GitHub Token和仓库设置
3. 验证网络连接
4. 尝试重新生成Token

---

🎉 **恭喜！您现在拥有了一个完全自动化的跨设备数据同步系统！**
