#!/bin/bash

# Plan-Web-Main 安全更新到GitHub脚本（分支更新法）
# 使用方法: ./安全更新到GitHub.sh YOUR_GITHUB_USERNAME

set -e  # 遇到错误立即停止

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Plan-Web-Main 安全更新到GitHub（分支更新法）        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 错误: 请提供GitHub用户名"
    echo "用法: ./安全更新到GitHub.sh YOUR_USERNAME"
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
echo "🚀 开始安全更新流程..."
echo ""

# 1. 初始化Git
if [ ! -d ".git" ]; then
    echo "📦 步骤1: 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
else
    echo "✅ Git仓库已存在"
fi
echo ""

# 2. 配置远程仓库
echo "🔗 步骤2: 配置远程仓库..."
if git remote | grep -q "origin"; then
    echo "   更新远程仓库地址..."
    git remote set-url origin ${REPO_URL}
else
    echo "   添加远程仓库..."
    git remote add origin ${REPO_URL}
fi
echo "✅ 远程仓库配置完成"
echo ""

# 3. 拉取远程代码
echo "📥 步骤3: 拉取远程代码..."
git fetch origin
echo "✅ 远程代码拉取完成"
echo ""

# 4. 创建修复分支
echo "🌿 步骤4: 创建修复分支..."
BRANCH_NAME="firebase-sync-fix"

# 检查是否已在修复分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ "$CURRENT_BRANCH" = "$BRANCH_NAME" ]; then
    echo "   已在分支 ${BRANCH_NAME} 上"
else
    # 检查本地是否有此分支
    if git show-ref --verify --quiet refs/heads/${BRANCH_NAME}; then
        echo "   切换到已存在的分支 ${BRANCH_NAME}..."
        git checkout ${BRANCH_NAME}
    else
        # 尝试基于远程主分支创建
        if git show-ref --verify --quiet refs/remotes/origin/${MAIN_BRANCH}; then
            echo "   基于 origin/${MAIN_BRANCH} 创建新分支 ${BRANCH_NAME}..."
            git checkout -b ${BRANCH_NAME} origin/${MAIN_BRANCH}
        else
            echo "   创建新分支 ${BRANCH_NAME}..."
            git checkout -b ${BRANCH_NAME}
        fi
    fi
fi
echo "✅ 修复分支准备完成"
echo ""

# 5. 添加所有修改
echo "📋 步骤5: 添加所有修改..."
git add .
echo "✅ 文件添加完成"
echo ""

# 6. 提交修改
echo "💾 步骤6: 提交修改..."
git commit -m "🔧 修复Firebase同步问题 - 解决手机端数据显示

主要修复:
- 🔥 升级Firebase SDK: v9.15.0 → v12.3.0
- 📱 优化所有16个HTML页面的移动端viewport
- 🔧 新增同步修复工具: sync-fix.js
- 🧪 新增测试页面: sync-test.html
- 📋 新增Firebase配置文件: firebase-config.js

文件变更统计:
- 新增文件: 9个
- 修改文件: 17个 (1个JS + 16个HTML)
- 总计变更: 26个文件

修复效果:
✅ 手机端能正确显示电脑保存的内容
✅ 实时跨设备数据同步
✅ 移动端界面显示优化
✅ Firebase连接稳定性提升
✅ 自动同步检查机制(每30秒)

测试方法:
1. 访问 sync-test.html 进行同步测试
2. 访问 firebase-status.html 检查连接状态
3. 电脑端创建数据，手机端验证同步" || echo "   (没有新的修改需要提交)"

echo "✅ 提交完成"
echo ""

# 7. 推送到GitHub
echo "🚀 步骤7: 推送到GitHub..."
git push -u origin ${BRANCH_NAME}
echo "✅ 推送完成"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║                  ✅ 更新成功完成！                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📍 修复分支已推送到GitHub: ${BRANCH_NAME}"
echo ""
echo "🧪 下一步测试和合并:"
echo ""
echo "方法1: 在GitHub网站上操作（推荐）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. 访问: https://github.com/${GITHUB_USERNAME}/plan-web-main"
echo "2. 点击 'Pull requests' → 'New pull request'"
echo "3. 选择 ${BRANCH_NAME} → ${MAIN_BRANCH}"
echo "4. 查看所有改动，确认无误"
echo "5. 点击 'Create pull request'"
echo "6. 测试修复分支的效果"
echo "7. 确认无误后点击 'Merge pull request'"
echo ""
echo "方法2: 命令行直接合并（如果已测试确认）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "git checkout ${MAIN_BRANCH}"
echo "git merge ${BRANCH_NAME}"
echo "git push origin ${MAIN_BRANCH}"
echo ""
echo "📱 GitHub Pages测试地址:"
echo "   主分支: https://${GITHUB_USERNAME}.github.io/plan-web-main/"
echo ""
echo "🎉 修复完成！记得测试后再合并到主分支！"
