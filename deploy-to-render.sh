#!/bin/bash

# 一键部署到 Render.com 脚本
# 使用方法: chmod +x deploy-to-render.sh && ./deploy-to-render.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Render.com 一键部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否在正确的目录
if [ ! -f "websocket-config.js" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 步骤 1: 询问是否已部署服务器
echo "📝 步骤 1/4: 检查 Render 服务器部署状态"
echo ""
echo "你是否已经在 Render.com 部署了 WebSocket 服务器？"
echo ""
echo "  1) 是的，我已经部署了（输入服务器地址）"
echo "  2) 还没有，带我去手动部署"
echo "  3) 跳过，稍后配置"
echo ""
read -p "请选择 [1-3]: " choice

case $choice in
    1)
        echo ""
        read -p "请输入你的 Render 服务器地址（例如: https://plan-websocket-server.onrender.com）: " server_url
        
        # 验证地址格式
        if [[ ! $server_url =~ ^https?:// ]]; then
            echo "⚠️  警告: 地址应该以 http:// 或 https:// 开头"
            read -p "继续使用这个地址吗？[y/N] " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                echo "❌ 已取消"
                exit 1
            fi
        fi
        
        echo "✅ 服务器地址: $server_url"
        echo ""
        ;;
    2)
        echo ""
        echo "📋 请按照以下步骤操作："
        echo ""
        echo "1. 访问: https://dashboard.render.com"
        echo "2. 点击 'New +' → 'Web Service'"
        echo "3. 连接 GitHub 仓库: plan-web"
        echo "4. 配置："
        echo "   - Name: plan-websocket-server"
        echo "   - Root Directory: websocket-server"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "5. 点击 'Create Web Service'"
        echo "6. 等待部署完成，复制服务器地址"
        echo ""
        echo "部署完成后，重新运行此脚本选择选项 1"
        echo ""
        exit 0
        ;;
    3)
        echo "⏭️  跳过服务器配置，稍后手动设置"
        server_url="http://localhost:3000"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 步骤 2: 添加配置到 HTML 文件
echo ""
echo "📝 步骤 2/4: 添加 WebSocket 配置到 HTML 文件"
echo ""

if command -v node &> /dev/null; then
    node add-websocket-config.js
    if [ $? -eq 0 ]; then
        echo "✅ 配置添加成功"
    else
        echo "⚠️  自动配置失败，需要手动添加"
        echo "   查看 README 了解手动配置方法"
    fi
else
    echo "⚠️  未找到 Node.js，跳过自动配置"
    echo "   请手动在 HTML 文件中添加 <script src=\"websocket-config.js\"></script>"
fi

# 步骤 3: 修改配置文件
echo ""
echo "📝 步骤 3/4: 更新配置文件"
echo ""

if [ -f "websocket-config.js" ]; then
    # 使用 sed 替换服务器地址
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|const SERVER_URL = '[^']*';|const SERVER_URL = '$server_url';|" websocket-config.js
    else
        # Linux
        sed -i "s|const SERVER_URL = '[^']*';|const SERVER_URL = '$server_url';|" websocket-config.js
    fi
    
    echo "✅ 配置文件已更新: $server_url"
else
    echo "⚠️  未找到 websocket-config.js"
fi

# 步骤 4: 提交到 GitHub
echo ""
echo "📝 步骤 4/4: 提交到 GitHub"
echo ""

# 检查 git 状态
if ! git status &> /dev/null; then
    echo "❌ 错误: 不是一个 Git 仓库"
    exit 1
fi

# 显示将要提交的文件
echo "将要提交的文件："
git status --short

echo ""
read -p "是否提交并推送到 GitHub？[Y/n] " confirm

if [[ $confirm =~ ^[Nn]$ ]]; then
    echo "⏭️  跳过提交，你可以稍后手动提交"
    echo ""
    echo "手动提交命令："
    echo "  git add ."
    echo "  git commit -m '配置WebSocket服务器地址'"
    echo "  git push origin main"
    exit 0
fi

# 添加文件
git add .

# 提交
git commit -m "配置WebSocket服务器地址: $server_url"

# 推送
echo ""
echo "🚀 正在推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
else
    echo "❌ 推送失败，请检查网络连接和 Git 权限"
    exit 1
fi

# 完成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 你的应用："
echo ""
echo "  🌐 前端网站:"
echo "     https://henry-jin89.github.io/plan-web/"
echo ""
echo "  🔌 WebSocket 服务器:"
echo "     $server_url"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 下一步:"
echo ""
echo "  1. 等待 1-2 分钟让 GitHub Pages 更新"
echo "  2. 访问前端网站测试"
echo "  3. 打开浏览器控制台（F12）查看连接状态"
echo "  4. 测试跨设备同步功能"
echo ""
echo "🔍 测试服务器是否运行:"
echo "   curl $server_url/health"
echo ""
echo "📚 查看详细文档:"
echo "   cat 快速部署到Render.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "祝使用愉快！🚀"
echo ""

