#!/bin/bash

# Plan-Web-Main 一键更新到GitHub（交互式）
# 使用方法: ./一键更新.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║        Plan-Web-Main Firebase同步修复更新工具         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📊 本次更新内容："
echo "   • 升级Firebase SDK到v12.3.0"
echo "   • 优化16个HTML页面移动端适配"
echo "   • 新增同步修复工具和测试页面"
echo "   • 新增9个文件，修改17个文件"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# 1. 获取GitHub用户名
read -p "📝 请输入您的GitHub用户名: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 错误: GitHub用户名不能为空"
    exit 1
fi

REPO_URL="https://github.com/${GITHUB_USERNAME}/plan-web-main.git"

echo ""
echo "🔍 仓库地址: ${REPO_URL}"
echo ""

# 2. 选择主分支
echo "📌 请选择您的主分支名称："
echo "   1) main (默认)"
echo "   2) master"
read -p "请输入选项 [1]: " BRANCH_CHOICE
BRANCH_CHOICE=${BRANCH_CHOICE:-1}

if [ "$BRANCH_CHOICE" = "2" ]; then
    MAIN_BRANCH="master"
else
    MAIN_BRANCH="main"
fi

echo "✅ 主分支: ${MAIN_BRANCH}"
echo ""

# 3. 选择更新方式
echo "📌 请选择更新方式："
echo "   1) 安全更新 - 创建测试分支，先测试再合并（推荐）⭐"
echo "   2) 快速更新 - 直接更新主分支"
read -p "请输入选项 [1]: " UPDATE_METHOD
UPDATE_METHOD=${UPDATE_METHOD:-1}

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

if [ "$UPDATE_METHOD" = "2" ]; then
    echo "⚠️  您选择了【快速更新】模式"
    echo "   这将直接更新您的 ${MAIN_BRANCH} 分支"
    echo ""
    read -p "❓ 确认继续? (输入 yes 确认): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ 操作已取消"
        exit 0
    fi
    
    echo ""
    echo "🚀 开始快速更新..."
    echo ""
    
    # 快速更新流程
    if [ ! -d ".git" ]; then
        git init
        git branch -M ${MAIN_BRANCH}
    fi
    
    if git remote | grep -q "origin"; then
        git remote set-url origin ${REPO_URL}
    else
        git remote add origin ${REPO_URL}
    fi
    
    echo "📥 拉取远程代码..."
    git pull origin ${MAIN_BRANCH} --allow-unrelated-histories 2>/dev/null || true
    
    echo "📋 添加所有修改..."
    git add .
    
    echo "💾 提交修改..."
    git commit -m "🔧 修复Firebase同步问题 - v12.3.0更新

- 升级Firebase SDK到v12.3.0
- 优化16个HTML页面移动端viewport
- 新增同步修复工具sync-fix.js
- 新增测试页面sync-test.html
- 新增Firebase配置文件

变更: 新增9个文件，修改17个文件" || echo "没有新的修改"
    
    echo "🚀 推送到GitHub..."
    git push -u origin ${MAIN_BRANCH}
    
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                  ✅ 更新完成！                         ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "📱 访问地址:"
    echo "   https://${GITHUB_USERNAME}.github.io/plan-web-main/"
    
else
    echo "✅ 您选择了【安全更新】模式（推荐）"
    echo ""
    echo "🚀 开始安全更新..."
    echo ""
    
    BRANCH_NAME="firebase-sync-fix"
    
    # 安全更新流程
    if [ ! -d ".git" ]; then
        git init
    fi
    
    if git remote | grep -q "origin"; then
        git remote set-url origin ${REPO_URL}
    else
        git remote add origin ${REPO_URL}
    fi
    
    echo "📥 拉取远程代码..."
    git fetch origin
    
    echo "🌿 创建/切换到修复分支: ${BRANCH_NAME}..."
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    
    if [ "$CURRENT_BRANCH" = "$BRANCH_NAME" ]; then
        echo "   已在分支 ${BRANCH_NAME} 上"
    elif git show-ref --verify --quiet refs/heads/${BRANCH_NAME}; then
        git checkout ${BRANCH_NAME}
    elif git show-ref --verify --quiet refs/remotes/origin/${MAIN_BRANCH}; then
        git checkout -b ${BRANCH_NAME} origin/${MAIN_BRANCH}
    else
        git checkout -b ${BRANCH_NAME}
    fi
    
    echo "📋 添加所有修改..."
    git add .
    
    echo "💾 提交修改..."
    git commit -m "🔧 修复Firebase同步问题 - 解决手机端数据显示

主要修复:
- 🔥 升级Firebase SDK: v9.15.0 → v12.3.0
- 📱 优化16个HTML页面移动端viewport
- 🔧 新增同步修复工具sync-fix.js
- 🧪 新增测试页面sync-test.html
- 📋 新增Firebase配置文件

文件变更:
- 新增: 9个文件
- 修改: 17个文件 (1个JS + 16个HTML)

修复效果:
✅ 手机端正确显示电脑保存的内容
✅ 实时跨设备数据同步
✅ 移动端界面优化
✅ Firebase连接稳定性提升" || echo "没有新的修改"
    
    echo "🚀 推送修复分支到GitHub..."
    git push -u origin ${BRANCH_NAME}
    
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║              ✅ 修复分支推送成功！                     ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "📍 分支名称: ${BRANCH_NAME}"
    echo ""
    echo "🧪 下一步操作（2选1）："
    echo ""
    echo "【方法1】在GitHub网站上创建PR并测试（推荐）⭐"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. 访问: https://github.com/${GITHUB_USERNAME}/plan-web-main"
    echo "2. 会看到提示 'Compare & pull request' - 点击它"
    echo "3. 查看所有改动，确认无误"
    echo "4. 点击 'Create pull request'"
    echo "5. 在GitHub Pages设置中临时切换到 ${BRANCH_NAME} 分支测试"
    echo "6. 测试通过后，点击 'Merge pull request'"
    echo ""
    echo "【方法2】命令行直接合并"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "git checkout ${MAIN_BRANCH}"
    echo "git merge ${BRANCH_NAME}"
    echo "git push origin ${MAIN_BRANCH}"
fi

echo ""
echo "📱 测试清单："
echo "   □ 清除浏览器缓存"
echo "   □ 访问 firebase-status.html"
echo "   □ 访问 sync-test.html"
echo "   □ 测试电脑↔手机数据同步"
echo ""
echo "🎉 完成！"
