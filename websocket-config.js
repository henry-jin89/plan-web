/**
 * WebSocket 服务器配置
 * 部署到 Render.com 后，请修改 serverUrl 为你的实际服务器地址
 */

(function() {
    // 🔧 配置你的 WebSocket 服务器地址
    // 部署到 Render 后，将下面的地址替换为你的服务器地址
    // 例如: 'https://plan-websocket-server.onrender.com'
    const SERVER_URL = 'http://localhost:3000';  // 👈 修改这里
    
    // 保存到 localStorage，让 websocket-sync.js 读取
    if (!localStorage.getItem('websocket_server_url')) {
        localStorage.setItem('websocket_server_url', SERVER_URL);
        console.log('✅ WebSocket服务器地址已设置:', SERVER_URL);
    } else {
        console.log('ℹ️ 使用已保存的WebSocket服务器地址:', localStorage.getItem('websocket_server_url'));
        console.log('💡 如需更改，请在控制台运行: localStorage.setItem("websocket_server_url", "你的新地址")');
    }
    
    // 提供全局配置对象（可选）
    window.WEBSOCKET_CONFIG = {
        serverUrl: localStorage.getItem('websocket_server_url') || SERVER_URL,
        autoConnect: true,
        reconnectAttempts: 10,
        reconnectDelay: 1000
    };
    
    console.log('📡 WebSocket配置已加载');
})();

