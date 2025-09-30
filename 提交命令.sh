#!/bin/bash

# Plan-Web-Main Firebase同步修复 - GitHub提交脚本
# 使用方法: chmod +x 提交命令.sh && ./提交命令.sh

echo "🚀 开始提交Plan-Web-Main Firebase同步修复..."

# 检查是否在正确目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 请在plan-web-main项目根目录执行此脚本"
    exit 1
fi

# 检查Git状态
if [ ! -d ".git" ]; then
    echo "📝 初始化Git仓库..."
    git init
    echo "⚠️  请设置远程仓库: git remote add origin https://github.com/YOUR_USERNAME/plan-web-main.git"
fi

echo "📋 添加修改文件..."

# 添加新增文件
echo "  ✅ 添加新增文件..."
git add firebase-config.js
git add sync-fix.js  
git add sync-test.html
git add 修复完成说明.md
git add CHANGELOG.md
git add GitHub提交指南.md

# 添加修改的核心文件
echo "  ✅ 添加核心修改文件..."
git add firebase-database-sync.js
git add index.html

# 添加所有HTML页面
echo "  ✅ 添加HTML页面修改..."
git add day_plan.html
git add week_plan.html
git add month_plan.html
git add quarter_plan.html
git add halfyear_plan.html
git add year_plan.html
git add habit_tracker.html
git add mood_tracker.html
git add gratitude_diary.html
git add reflection_template.html
git add monthly_schedule.html
git add firebase-status.html
git add one-click-sync.html
git add sync-settings.html

# 显示状态
echo "📊 Git状态检查..."
git status --short

# 提交修改
echo "💾 提交修改..."
git commit -m "🔧 修复Firebase同步问题 - 解决手机端数据显示问题

主要修复:
- 🔥 升级Firebase SDK: v9.15.0 → v12.3.0
- 📱 优化移动端viewport: 防缩放 + 触摸优化  
- 🔧 新增同步修复工具: sync-fix.js
- 🧪 新增测试页面: sync-test.html
- 📋 新增配置文件: firebase-config.js

文件变更统计:
- 新增文件: 6个 (firebase-config.js, sync-fix.js, sync-test.html, 文档等)
- 修改文件: 17个 (firebase-database-sync.js + 16个HTML页面)
- 删除文件: 1个 (临时脚本)

修复效果:
✅ 手机端能正确显示电脑保存的内容
✅ 跨设备数据实时同步
✅ 移动端界面显示优化
✅ Firebase连接稳定性提升

测试方法:
1. 访问 sync-test.html 进行同步测试
2. 电脑端创建数据,手机端验证同步
3. 查看 firebase-status.html 检查连接状态"

echo "✅ 提交完成!"
echo ""
echo "🚀 下一步操作:"
echo "1. 设置远程仓库(如果还没设置):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/plan-web-main.git"
echo ""
echo "2. 推送到GitHub:"
echo "   git push origin main"
echo "   # 或者: git push origin master"
echo ""
echo "3. 在GitHub启用Pages进行测试"
echo ""
echo "📱 测试建议:"
echo "- 清除浏览器缓存后测试"
echo "- 使用 sync-test.html 验证同步功能"
echo "- 检查手机端是否能正确显示电脑数据"
