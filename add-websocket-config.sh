#!/bin/bash

# 自动在所有 HTML 文件中添加 WebSocket 配置引用
# 使用方法: chmod +x add-websocket-config.sh && ./add-websocket-config.sh

echo "🚀 开始添加 WebSocket 配置引用..."

# 需要修改的 HTML 文件列表
HTML_FILES=(
    "index.html"
    "day_plan.html"
    "week_plan.html"
    "month_plan.html"
    "quarter_plan.html"
    "year_plan.html"
    "halfyear_plan.html"
    "monthly_schedule.html"
    "habit_tracker.html"
    "mood_tracker.html"
    "gratitude_diary.html"
    "reflection_template.html"
    "websocket-test.html"
)

CONFIG_LINE='    <script src="websocket-config.js"></script>'

# 遍历所有文件
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        # 检查是否已经包含配置
        if grep -q "websocket-config.js" "$file"; then
            echo "⏭️  $file - 已包含配置，跳过"
        else
            # 查找 websocket-sync.js 的位置
            if grep -q "websocket-sync.js" "$file"; then
                # 在 websocket-sync.js 之前插入配置
                sed -i.bak 's|<script src="websocket-sync.js"></script>|'"$CONFIG_LINE"'\n    <script src="websocket-sync.js"></script>|' "$file"
                echo "✅ $file - 已添加配置"
            else
                # 在 </body> 之前添加
                sed -i.bak 's|</body>|'"$CONFIG_LINE"'\n    <script src="websocket-sync.js"></script>\n</body>|' "$file"
                echo "✅ $file - 已添加配置和同步脚本"
            fi
        fi
    else
        echo "⚠️  $file - 文件不存在，跳过"
    fi
done

# 清理备份文件
rm -f *.html.bak

echo ""
echo "🎉 完成！已处理所有 HTML 文件"
echo ""
echo "📝 下一步："
echo "1. 检查 websocket-config.js 文件"
echo "2. 修改其中的 SERVER_URL 为你的 Render 服务器地址"
echo "3. 运行: git add . && git commit -m '配置WebSocket服务器' && git push"
echo ""

