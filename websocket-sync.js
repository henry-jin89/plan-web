/**
 * WebSocket 实时同步客户端
 * 实现毫秒级跨设备数据同步
 */

class WebSocketSync {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3; // 减少重试次数
        this.reconnectDelay = 1000;
        this.deviceInfo = this.getDeviceInfo();
        this.syncQueue = [];
        this.isSyncing = false;
        
        // 配置开关：默认禁用 WebSocket 自动连接
        // 如果需要启用，在 localStorage 中设置 'websocket_enabled' = 'true'
        this.enabled = localStorage.getItem('websocket_enabled') === 'true';
        
        if (this.enabled) {
            console.log('[WebSocket同步] ✅ WebSocket已启用');
        } else {
            console.log('[WebSocket同步] ⚠️ WebSocket已禁用（需要单独的服务器）');
            console.log('[WebSocket同步] 💡 如需启用，请运行: localStorage.setItem("websocket_enabled", "true")');
        }
    }
    
    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        return {
            type: isMobile ? 'mobile' : 'desktop',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`
        };
    }
    
    /**
     * 获取或创建用户ID
     */
    getUserId() {
        if (this.userId) return this.userId;
        
        // 尝试从 localStorage 获取
        let userId = localStorage.getItem('websocket_userId');
        
        if (!userId) {
            // 尝试使用 Firebase 的用户ID
            userId = localStorage.getItem('sharedUserId');
        }
        
        if (!userId) {
            // 生成新的用户ID
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('websocket_userId', userId);
        }
        
        this.userId = userId;
        return userId;
    }
    
    /**
     * 连接到 WebSocket 服务器
     */
    async connect(serverUrl = 'http://localhost:3000') {
        return new Promise((resolve, reject) => {
            try {
                console.log(`[WebSocket同步] 连接到服务器: ${serverUrl}`);
                
                // 加载 Socket.IO 客户端库
                if (!window.io) {
                    this.loadSocketIO().then(() => {
                        this.establishConnection(serverUrl, resolve, reject);
                    }).catch(reject);
                } else {
                    this.establishConnection(serverUrl, resolve, reject);
                }
            } catch (error) {
                console.error('[WebSocket同步] 连接失败:', error);
                reject(error);
            }
        });
    }
    
    /**
     * 加载 Socket.IO 客户端库
     */
    loadSocketIO() {
        return new Promise((resolve, reject) => {
            if (window.io) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log('[WebSocket同步] Socket.IO 客户端库加载成功');
                resolve();
            };
            
            script.onerror = () => {
                console.error('[WebSocket同步] Socket.IO 客户端库加载失败');
                reject(new Error('无法加载 Socket.IO 客户端库'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 建立连接
     */
    establishConnection(serverUrl, resolve, reject) {
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });
        
        // 连接成功
        this.socket.on('connect', () => {
            console.log('[WebSocket同步] ✅ 连接成功');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // 注册设备
            this.register();
            
            resolve();
        });
        
        // 注册成功
        this.socket.on('registered', (data) => {
            console.log('[WebSocket同步] ✅ 设备注册成功:', data);
            this.userId = data.userId;
            
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('websocket-connected', { 
                detail: data 
            }));
        });
        
        // 接收远程数据更新
        this.socket.on('sync-data', (data) => {
            console.log('[WebSocket同步] 📥 收到远程数据:', data.key);
            this.handleRemoteData(data);
        });
        
        // 接收批量数据更新
        this.socket.on('sync-batch-data', (data) => {
            console.log('[WebSocket同步] 📥 收到批量远程数据:', data.items.length, '项');
            this.handleRemoteBatchData(data);
        });
        
        // 接收全量数据
        this.socket.on('full-sync-data', (data) => {
            console.log('[WebSocket同步] 📥 收到全量数据');
            this.handleFullSyncData(data);
        });
        
        // 数据保存确认
        this.socket.on('sync-saved', (data) => {
            console.log('[WebSocket同步] ✅ 数据保存确认:', data.key);
        });
        
        // 批量保存确认
        this.socket.on('sync-batch-saved', (data) => {
            console.log('[WebSocket同步] ✅ 批量保存确认:', data.count, '项');
        });
        
        // 设备连接通知
        this.socket.on('device-connected', (data) => {
            console.log('[WebSocket同步] 📱 新设备连接:', data.deviceInfo.type);
            window.dispatchEvent(new CustomEvent('device-connected', { 
                detail: data 
            }));
        });
        
        // 设备断开通知
        this.socket.on('device-disconnected', (data) => {
            console.log('[WebSocket同步] 📴 设备断开:', data.socketId);
            window.dispatchEvent(new CustomEvent('device-disconnected', { 
                detail: data 
            }));
        });
        
        // 心跳响应
        this.socket.on('pong', (data) => {
            // console.log('[WebSocket同步] 💓 心跳响应');
        });
        
        // 连接错误
        this.socket.on('connect_error', (error) => {
            console.error('[WebSocket同步] ❌ 连接错误:', error.message);
            this.isConnected = false;
        });
        
        // 断开连接
        this.socket.on('disconnect', (reason) => {
            console.log('[WebSocket同步] ⚠️ 连接断开:', reason);
            this.isConnected = false;
            
            window.dispatchEvent(new CustomEvent('websocket-disconnected', { 
                detail: { reason } 
            }));
        });
        
        // 重连尝试
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`[WebSocket同步] 🔄 重连尝试 ${attemptNumber}/${this.maxReconnectAttempts}`);
            this.reconnectAttempts = attemptNumber;
        });
        
        // 重连成功
        this.socket.on('reconnect', (attemptNumber) => {
            console.log('[WebSocket同步] ✅ 重连成功');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // 重新注册
            this.register();
            
            // 请求全量同步
            this.requestFullSync();
        });
        
        // 错误处理
        this.socket.on('error', (error) => {
            console.error('[WebSocket同步] ❌ 错误:', error);
        });
    }
    
    /**
     * 注册设备
     */
    register() {
        const userId = this.getUserId();
        console.log('[WebSocket同步] 📝 注册设备:', userId);
        
        this.socket.emit('register', {
            userId,
            deviceInfo: this.deviceInfo
        });
    }
    
    /**
     * 同步单个数据项
     */
    syncData(key, value) {
        if (!this.enabled) {
            // WebSocket未启用，静默跳过
            return;
        }
        
        if (!this.isConnected) {
            console.warn('[WebSocket同步] ⚠️ 未连接，数据已加入队列');
            this.syncQueue.push({ key, value });
            return;
        }
        
        console.log('[WebSocket同步] 📤 同步数据:', key);
        
        this.socket.emit('sync-save', {
            key,
            value,
            timestamp: Date.now()
        });
    }
    
    /**
     * 批量同步数据
     */
    syncBatch(items) {
        if (!this.isConnected) {
            console.warn('[WebSocket同步] ⚠️ 未连接，批量数据已加入队列');
            this.syncQueue.push(...items);
            return;
        }
        
        console.log('[WebSocket同步] 📤 批量同步数据:', items.length, '项');
        
        this.socket.emit('sync-batch', {
            items,
            timestamp: Date.now()
        });
    }
    
    /**
     * 请求全量同步
     */
    requestFullSync() {
        if (!this.isConnected) {
            console.warn('[WebSocket同步] ⚠️ 未连接，无法请求全量同步');
            return;
        }
        
        console.log('[WebSocket同步] 📥 请求全量同步');
        this.socket.emit('request-full-sync');
    }
    
    /**
     * 处理远程数据更新
     */
    handleRemoteData(data) {
        const { key, value, timestamp, source } = data;
        
        try {
            // 保存到 localStorage
            localStorage.setItem(key, JSON.stringify(value));
            
            console.log(`[WebSocket同步] ✅ 远程数据已保存: ${key}`);
            
            // 触发自定义事件，通知页面数据已更新
            window.dispatchEvent(new CustomEvent('remote-data-updated', {
                detail: { key, value, timestamp, source }
            }));
            
            // 如果当前页面正在显示该数据，刷新显示
            this.refreshPageData(key);
            
        } catch (error) {
            console.error('[WebSocket同步] ❌ 保存远程数据失败:', error);
        }
    }
    
    /**
     * 处理批量远程数据更新
     */
    handleRemoteBatchData(data) {
        const { items, timestamp } = data;
        
        try {
            items.forEach(item => {
                localStorage.setItem(item.key, JSON.stringify(item.value));
            });
            
            console.log(`[WebSocket同步] ✅ 批量远程数据已保存: ${items.length} 项`);
            
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('remote-batch-updated', {
                detail: { items, timestamp }
            }));
            
            // 刷新页面显示
            items.forEach(item => this.refreshPageData(item.key));
            
        } catch (error) {
            console.error('[WebSocket同步] ❌ 保存批量远程数据失败:', error);
        }
    }
    
    /**
     * 处理全量同步数据
     */
    handleFullSyncData(data) {
        const { data: syncData, timestamp } = data;
        
        try {
            let count = 0;
            
            for (const [key, item] of Object.entries(syncData)) {
                localStorage.setItem(key, JSON.stringify(item.value));
                count++;
            }
            
            console.log(`[WebSocket同步] ✅ 全量数据已同步: ${count} 项`);
            
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('full-sync-completed', {
                detail: { count, timestamp }
            }));
            
            // 刷新整个页面（可选）
            if (count > 0 && typeof window.loadPlanData === 'function') {
                window.loadPlanData();
            }
            
        } catch (error) {
            console.error('[WebSocket同步] ❌ 全量同步失败:', error);
        }
    }
    
    /**
     * 刷新页面数据显示
     */
    refreshPageData(key) {
        // 根据不同的数据类型，调用相应的刷新函数
        if (key.startsWith('planData_')) {
            const planType = key.replace('planData_', '');
            
            // 如果页面有对应的加载函数，调用它
            if (typeof window.loadPlanData === 'function') {
                console.log(`[WebSocket同步] 🔄 刷新页面数据: ${planType}`);
                window.loadPlanData();
            }
            
            // 显示通知
            this.showSyncNotification(planType);
        }
    }
    
    /**
     * 显示同步通知
     */
    showSyncNotification(planType) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = `✅ 数据已从其他设备同步`;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * 发送心跳
     */
    sendHeartbeat() {
        if (this.isConnected) {
            this.socket.emit('ping');
        }
    }
    
    /**
     * 获取在线设备列表
     */
    getDevices() {
        return new Promise((resolve) => {
            if (!this.isConnected) {
                resolve([]);
                return;
            }
            
            this.socket.emit('get-devices');
            
            this.socket.once('devices-list', (data) => {
                resolve(data.devices);
            });
        });
    }
    
    /**
     * 断开连接
     */
    disconnect() {
        if (this.socket) {
            console.log('[WebSocket同步] 🔌 断开连接');
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
    
    /**
     * 获取连接状态
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            userId: this.userId,
            deviceInfo: this.deviceInfo,
            reconnectAttempts: this.reconnectAttempts,
            queueSize: this.syncQueue.length
        };
    }
}

// 创建全局实例
window.websocketSync = new WebSocketSync();

// 页面加载完成后自动连接（仅在启用时）
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否启用 WebSocket
    if (!window.websocketSync.enabled) {
        console.log('[WebSocket同步] ⏭️ WebSocket未启用，跳过连接');
        console.log('[WebSocket同步] ℹ️ 系统将使用Firebase云同步作为主要同步方式');
        return;
    }
    
    console.log('[WebSocket同步] 页面加载完成，准备连接...');
    
    // 从配置文件或环境变量读取服务器地址
    const serverUrl = localStorage.getItem('websocket_server_url') || 'http://localhost:3000';
    
    // 自动连接（带超时控制）
    const connectTimeout = setTimeout(() => {
        console.warn('[WebSocket同步] ⚠️ 连接超时（5秒），停止尝试');
        window.websocketSync.disconnect();
    }, 5000);
    
    window.websocketSync.connect(serverUrl)
        .then(() => {
            clearTimeout(connectTimeout);
            console.log('[WebSocket同步] ✅ 自动连接成功');
            
            // 开始心跳
            setInterval(() => {
                window.websocketSync.sendHeartbeat();
            }, 30000);
        })
        .catch((error) => {
            clearTimeout(connectTimeout);
            console.warn('[WebSocket同步] ⚠️ 连接失败，将使用Firebase同步');
            console.log('[WebSocket同步] 💡 提示：如不需要WebSocket，可运行: localStorage.setItem("websocket_enabled", "false")');
        });
});

// 监听 localStorage 变化，自动同步
window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('planData_') && e.newValue) {
        console.log('[WebSocket同步] 📝 检测到本地数据变化:', e.key);
        
        try {
            const value = JSON.parse(e.newValue);
            window.websocketSync.syncData(e.key, value);
        } catch (error) {
            console.error('[WebSocket同步] ❌ 同步失败:', error);
        }
    }
});

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('[WebSocket同步] 客户端脚本已加载');

