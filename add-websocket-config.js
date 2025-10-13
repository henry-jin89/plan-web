/**
 * 自动在所有 HTML 文件中添加 WebSocket 配置引用
 * 使用方法: node add-websocket-config.js
 */

const fs = require('fs');
const path = require('path');

// 需要修改的 HTML 文件列表
const HTML_FILES = [
    'index.html',
    'day_plan.html',
    'week_plan.html',
    'month_plan.html',
    'quarter_plan.html',
    'year_plan.html',
    'halfyear_plan.html',
    'monthly_schedule.html',
    'habit_tracker.html',
    'mood_tracker.html',
    'gratitude_diary.html',
    'reflection_template.html',
    'websocket-test.html'
];

console.log('🚀 开始添加 WebSocket 配置引用...\n');

let successCount = 0;
let skipCount = 0;
let notFoundCount = 0;

HTML_FILES.forEach(filename => {
    const filepath = path.join(__dirname, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  ${filename} - 文件不存在，跳过`);
        notFoundCount++;
        return;
    }
    
    // 读取文件内容
    let content = fs.readFileSync(filepath, 'utf8');
    
    // 检查是否已经包含配置
    if (content.includes('websocket-config.js')) {
        console.log(`⏭️  ${filename} - 已包含配置，跳过`);
        skipCount++;
        return;
    }
    
    // 查找 websocket-sync.js 的位置
    if (content.includes('websocket-sync.js')) {
        // 在 websocket-sync.js 之前插入配置
        content = content.replace(
            /<script src="websocket-sync\.js"><\/script>/,
            `<script src="websocket-config.js"></script>\n    <script src="websocket-sync.js"></script>`
        );
        console.log(`✅ ${filename} - 已添加配置`);
    } else {
        // 在 </body> 之前添加
        content = content.replace(
            /<\/body>/,
            `    <!-- WebSocket 配置和同步 -->\n    <script src="websocket-config.js"></script>\n    <script src="websocket-sync.js"></script>\n</body>`
        );
        console.log(`✅ ${filename} - 已添加配置和同步脚本`);
    }
    
    // 写回文件
    fs.writeFileSync(filepath, content, 'utf8');
    successCount++;
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 完成！');
console.log(`✅ 成功处理: ${successCount} 个文件`);
console.log(`⏭️  已跳过: ${skipCount} 个文件`);
console.log(`⚠️  未找到: ${notFoundCount} 个文件`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 下一步:');
console.log('1. 打开 websocket-config.js 文件');
console.log('2. 修改其中的 SERVER_URL 为你的 Render 服务器地址');
console.log('   例如: const SERVER_URL = "https://plan-websocket-server.onrender.com";');
console.log('3. 提交到 GitHub:');
console.log('   git add .');
console.log('   git commit -m "配置WebSocket服务器地址"');
console.log('   git push origin main');
console.log('');

