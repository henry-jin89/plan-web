#!/bin/bash

# Plan-Web-Main 快速更新到GitHub脚本（直接更新法）
# 使用方法: ./快速更新到GitHub.sh YOUR_GITHUB_USERNAME

set -e  # 遇到错误立即停止

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Plan-Web-Main 快速更新到GitHub（直接更新法）        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 错误: 请提供GitHub用户名"
    echo "用法: ./快速更新到GitHub.sh YOUR_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_URL="https://github.com/${GITHUB_USERNAME}/plan-web-main.git"

echo "📝 配置信息:"
echo "   GitHub用户名: ${GITHUB_USERNAME}"
echo "   仓库地址: ${REPO_URL}"
echo ""

# 询问主分支名称
read -p "❓ 您的主分支名称是 (main/master)? [main]: " MAIN_BRANCH
MAIN_BRANCH=${MAIN_BRANCH:-main}

echo ""
echo "⚠️  警告: 这将直接更新您的 ${MAIN_BRANCH} 分支"
read -p "❓ 确认继续? (yes/no) [no]: " CONFIRM
CONFIRM=${CONFIRM:-no}

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 0
fi

echo ""
echo "🚀 开始快速更新流程..."
echo ""

# 1. 初始化Git
if [ ! -d ".git" ]; then
    echo "📦 步骤1: 初始化Git仓库..."
    git init
    git branch -M ${MAIN_BRANCH}
    echo "✅ Git仓库初始化完成"
else
    echo "✅ Git仓库已存在"
fi
echo ""

# 2. 配置远程仓库
echo "🔗 步骤2: 配置远程仓库..."
if git remote | grep -q "origin"; then
    git remote set-url origin ${REPO_URL}
else
    git remote add origin ${REPO_URL}
fi
echo "✅ 远程仓库配置完成"
echo ""

# 3. 尝试拉取并合并远程代码
echo "📥 步骤3: 拉取远程代码..."
if git pull origin ${MAIN_BRANCH} --allow-unrelated-histories 2>/dev/null; then
    echo "✅ 远程代码合并完成"
else
    echo "⚠️  拉取失败或有冲突，继续进行..."
fi
echo ""

# 4. 添加所有修改
echo "📋 步骤4: 添加所有修改..."
git add .
echo "✅ 文件添加完成"
echo ""

# 5. 提交修改
echo "💾 步骤5: 提交修改..."
git commit -m "🔧 修复Firebase同步问题 - v12.3.0更新

主要修复:
- 升级Firebase SDK到v12.3.0
- 优化16个HTML页面移动端viewport
- 新增同步修复工具和测试页面
- 完善跨设备数据同步机制

变更: 新增9个文件，修改17个文件" || echo "   (没有新的修改需要提交)"

echo "✅ 提交完成"
echo ""

# 6. 推送到GitHub
echo "🚀 步骤6: 推送到GitHub..."
git push -u origin ${MAIN_BRANCH}
echo "✅ 推送完成"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║                  ✅ 更新成功完成！                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📱 GitHub Pages地址:"
echo "   https://${GITHUB_USERNAME}.github.io/plan-web-main/"
echo ""
echo "🧪 测试步骤:"
echo "1. 清除浏览器缓存"
echo "2. 访问 firebase-status.html 检查连接"
echo "3. 访问 sync-test.html 测试同步"
echo "4. 电脑端创建数据，手机端验证同步"
echo ""
echo "🎉 更新完成！请立即测试！"
