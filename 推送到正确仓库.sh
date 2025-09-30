#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║       推送到正确的GitHub仓库: plan-web                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 设置正确的远程仓库
echo "📝 设置远程仓库为: https://github.com/henry-jin89/plan-web.git"
git remote set-url origin https://github.com/henry-jin89/plan-web.git

echo ""
echo "🚀 推送修复分支到GitHub..."
echo "   (如果需要，请输入GitHub密码或个人访问令牌)"
echo ""

# 推送修复分支
git push -u origin firebase-sync-fix

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                  ✅ 推送成功！                         ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "📍 下一步: 访问 https://github.com/henry-jin89/plan-web"
    echo "   创建 Pull Request 并测试"
else
    echo ""
    echo "❌ 推送失败，可能需要GitHub访问令牌"
    echo ""
    echo "💡 如果需要访问令牌，请访问："
    echo "   https://github.com/settings/tokens"
    echo "   创建新令牌后，使用令牌作为密码"
fi
