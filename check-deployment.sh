#!/bin/bash

# 部署状态检查脚本
# 使用方法: ./check-deployment.sh [服务器地址]

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 部署状态检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 获取服务器地址
if [ -z "$1" ]; then
    echo "📝 请输入你的 Render 服务器地址"
    echo "   例如: https://plan-websocket-server.onrender.com"
    echo ""
    read -p "服务器地址: " SERVER_URL
else
    SERVER_URL=$1
fi

# 去除末尾的斜杠
SERVER_URL=${SERVER_URL%/}

echo ""
echo "🔗 检查服务器: $SERVER_URL"
echo ""

# 检查 1: Git 状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 1. 检查 Git 仓库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git 仓库正常"
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  有未提交的更改:"
        git status --short | head -5
        echo ""
    else
        echo "✅ 所有更改已提交"
    fi
    
    # 显示最后一次提交
    echo "📝 最后提交:"
    git log -1 --oneline
    echo ""
else
    echo "❌ 不是 Git 仓库"
    echo ""
fi

# 检查 2: 项目文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 2. 检查项目文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 (未找到)"
    fi
}

check_file "websocket-config.js"
check_file "websocket-sync.js"
check_file "websocket-server/server.js"
check_file "websocket-server/package.json"
echo ""

# 检查 3: 服务器健康检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 3. 服务器健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH_URL="$SERVER_URL/health"
echo "🔗 检查: $HEALTH_URL"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 服务器在线 (HTTP $HTTP_CODE)"
    echo "📊 响应:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
else
    echo "❌ 服务器离线或无响应 (HTTP ${HTTP_CODE:-000})"
    echo ""
    echo "💡 可能原因:"
    echo "   1. 服务器地址错误"
    echo "   2. 服务器正在启动（首次访问需要 30-60 秒）"
    echo "   3. 服务器部署失败"
    echo ""
    echo "🔧 建议:"
    echo "   1. 检查 Render Dashboard 服务状态"
    echo "   2. 等待 1 分钟后重试"
    echo "   3. 查看 Render 日志"
    echo ""
fi

# 检查 4: 服务器状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 4. 服务器状态监控"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATUS_URL="$SERVER_URL/status"
echo "🔗 检查: $STATUS_URL"
echo ""

STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" "$STATUS_URL" 2>/dev/null)
HTTP_CODE=$(echo "$STATUS_RESPONSE" | tail -n 1)
BODY=$(echo "$STATUS_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 状态接口正常"
    echo "📊 详细信息:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
else
    echo "⚠️  无法获取状态信息"
    echo ""
fi

# 检查 5: GitHub Pages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 5. GitHub Pages 状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

GITHUB_URL="https://henry-jin89.github.io/plan-web/"
echo "🔗 检查: $GITHUB_URL"
echo ""

GITHUB_RESPONSE=$(curl -s -w "\n%{http_code}" -L "$GITHUB_URL" 2>/dev/null)
HTTP_CODE=$(echo "$GITHUB_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GitHub Pages 在线"
    echo ""
else
    echo "❌ GitHub Pages 无法访问"
    echo ""
fi

# 检查 6: 配置文件内容
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  6. 检查配置文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "websocket-config.js" ]; then
    CONFIG_SERVER=$(grep "const SERVER_URL" websocket-config.js | sed "s/.*'\(.*\)'.*/\1/")
    echo "📝 配置的服务器: $CONFIG_SERVER"
    echo ""
    
    if [ "$CONFIG_SERVER" = "http://localhost:3000" ]; then
        echo "⚠️  警告: 配置文件使用本地地址"
        echo ""
        echo "🔧 建议修改为:"
        echo "   const SERVER_URL = '$SERVER_URL';"
        echo ""
    elif [ "$CONFIG_SERVER" = "$SERVER_URL" ]; then
        echo "✅ 配置地址与检查地址一致"
        echo ""
    else
        echo "⚠️  配置地址与检查地址不一致"
        echo "   配置: $CONFIG_SERVER"
        echo "   检查: $SERVER_URL"
        echo ""
    fi
else
    echo "❌ 配置文件不存在"
    echo ""
fi

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 检查总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 恭喜！部署看起来一切正常"
    echo ""
    echo "📱 下一步:"
    echo "   1. 访问: https://henry-jin89.github.io/plan-web/"
    echo "   2. 打开浏览器开发者工具（F12）"
    echo "   3. 查看 Console 确认连接成功"
    echo "   4. 测试创建计划和跨设备同步"
    echo ""
else
    echo "⚠️  发现一些问题，请检查上述错误"
    echo ""
    echo "🔧 故障排除:"
    echo "   1. 确认 Render 服务器已部署: https://dashboard.render.com"
    echo "   2. 检查服务器日志"
    echo "   3. 确认代码已推送到 GitHub"
    echo "   4. 等待服务器启动（首次需要 30-60 秒）"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示:"
echo "   - 查看详细文档: cat 快速部署到Render.md"
echo "   - 测试页面: open deployment-test.html"
echo "   - 重新检查: ./check-deployment.sh $SERVER_URL"
echo ""

