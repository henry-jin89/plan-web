/**
 * WebSocket 实时同步服务器
 * 使用 Socket.IO 实现多设备实时数据同步
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// 创建 Express 应用
const app = express();
const server = http.createServer(app);

// 配置 CORS
app.use(cors());
app.use(express.json());

// 创建 Socket.IO 实例
const io = socketIO(server, {
    cors: {
        origin: "*", // 允许所有来源（生产环境建议限制）
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// 存储用户的房间信息（用户ID -> Socket ID 映射）
const userRooms = new Map();
const userSockets = new Map();

// 存储最新数据（简单缓存）
const dataCache = new Map();

console.log('🚀 WebSocket 服务器启动中...');

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log(`✅ 新设备连接: ${socket.id}`);
    
    // 设备注册（加入用户房间）
    socket.on('register', (data) => {
        const { userId, deviceInfo } = data;
        
        if (!userId) {
            socket.emit('error', { message: '缺少用户ID' });
            return;
        }
        
        // 加入用户专属房间
        socket.join(userId);
        
        // 记录用户信息
        if (!userRooms.has(userId)) {
            userRooms.set(userId, new Set());
        }
        userRooms.get(userId).add(socket.id);
        
        userSockets.set(socket.id, {
            userId,
            deviceInfo: deviceInfo || {},
            connectedAt: new Date()
        });
        
        console.log(`📱 设备注册成功: 用户=${userId}, Socket=${socket.id}, 设备=${deviceInfo?.type || '未知'}`);
        
        // 发送注册成功消息
        socket.emit('registered', {
            success: true,
            userId,
            socketId: socket.id,
            connectedDevices: userRooms.get(userId).size
        });
        
        // 通知该用户的其他设备
        socket.to(userId).emit('device-connected', {
            socketId: socket.id,
            deviceInfo: deviceInfo || {},
            totalDevices: userRooms.get(userId).size
        });
        
        // 如果有缓存数据，发送给新连接的设备
        if (dataCache.has(userId)) {
            socket.emit('sync-data', {
                data: dataCache.get(userId),
                source: 'cache',
                timestamp: Date.now()
            });
        }
    });
    
    // 数据同步（保存）
    socket.on('sync-save', (data) => {
        const userInfo = userSockets.get(socket.id);
        
        if (!userInfo) {
            socket.emit('error', { message: '设备未注册' });
            return;
        }
        
        const { userId } = userInfo;
        const { key, value, timestamp } = data;
        
        console.log(`💾 收到数据保存请求: 用户=${userId}, Key=${key}`);
        
        // 更新缓存
        if (!dataCache.has(userId)) {
            dataCache.set(userId, {});
        }
        const userCache = dataCache.get(userId);
        userCache[key] = {
            value,
            timestamp: timestamp || Date.now(),
            updatedBy: socket.id
        };
        
        // 广播给该用户的所有其他设备
        socket.to(userId).emit('sync-data', {
            key,
            value,
            timestamp: timestamp || Date.now(),
            source: 'remote',
            updatedBy: socket.id
        });
        
        // 确认保存成功
        socket.emit('sync-saved', {
            success: true,
            key,
            timestamp: Date.now()
        });
        
        console.log(`✅ 数据已同步到 ${userRooms.get(userId).size - 1} 个其他设备`);
    });
    
    // 批量数据同步
    socket.on('sync-batch', (data) => {
        const userInfo = userSockets.get(socket.id);
        
        if (!userInfo) {
            socket.emit('error', { message: '设备未注册' });
            return;
        }
        
        const { userId } = userInfo;
        const { items, timestamp } = data;
        
        console.log(`💾 收到批量数据保存: 用户=${userId}, 数量=${items.length}`);
        
        // 更新缓存
        if (!dataCache.has(userId)) {
            dataCache.set(userId, {});
        }
        const userCache = dataCache.get(userId);
        
        items.forEach(item => {
            userCache[item.key] = {
                value: item.value,
                timestamp: timestamp || Date.now(),
                updatedBy: socket.id
            };
        });
        
        // 广播给该用户的所有其他设备
        socket.to(userId).emit('sync-batch-data', {
            items,
            timestamp: timestamp || Date.now(),
            source: 'remote',
            updatedBy: socket.id
        });
        
        // 确认保存成功
        socket.emit('sync-batch-saved', {
            success: true,
            count: items.length,
            timestamp: Date.now()
        });
        
        console.log(`✅ 批量数据已同步到 ${userRooms.get(userId).size - 1} 个其他设备`);
    });
    
    // 请求全量数据
    socket.on('request-full-sync', () => {
        const userInfo = userSockets.get(socket.id);
        
        if (!userInfo) {
            socket.emit('error', { message: '设备未注册' });
            return;
        }
        
        const { userId } = userInfo;
        
        if (dataCache.has(userId)) {
            socket.emit('full-sync-data', {
                data: dataCache.get(userId),
                timestamp: Date.now()
            });
            console.log(`📤 发送全量数据: 用户=${userId}`);
        } else {
            socket.emit('full-sync-data', {
                data: {},
                timestamp: Date.now()
            });
        }
    });
    
    // 心跳检测
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
    });
    
    // 获取在线设备列表
    socket.on('get-devices', () => {
        const userInfo = userSockets.get(socket.id);
        
        if (!userInfo) {
            socket.emit('error', { message: '设备未注册' });
            return;
        }
        
        const { userId } = userInfo;
        const devices = [];
        
        if (userRooms.has(userId)) {
            userRooms.get(userId).forEach(socketId => {
                const info = userSockets.get(socketId);
                if (info) {
                    devices.push({
                        socketId,
                        deviceInfo: info.deviceInfo,
                        connectedAt: info.connectedAt,
                        isCurrent: socketId === socket.id
                    });
                }
            });
        }
        
        socket.emit('devices-list', { devices });
    });
    
    // 断开连接
    socket.on('disconnect', () => {
        const userInfo = userSockets.get(socket.id);
        
        if (userInfo) {
            const { userId } = userInfo;
            
            // 从房间中移除
            if (userRooms.has(userId)) {
                userRooms.get(userId).delete(socket.id);
                
                // 如果该用户没有其他设备在线，清理房间
                if (userRooms.get(userId).size === 0) {
                    userRooms.delete(userId);
                    // 可选：清理缓存（根据需求决定）
                    // dataCache.delete(userId);
                } else {
                    // 通知其他设备
                    socket.to(userId).emit('device-disconnected', {
                        socketId: socket.id,
                        totalDevices: userRooms.get(userId).size
                    });
                }
            }
            
            userSockets.delete(socket.id);
            console.log(`❌ 设备断开: 用户=${userId}, Socket=${socket.id}`);
        } else {
            console.log(`❌ 未注册设备断开: Socket=${socket.id}`);
        }
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        connections: io.engine.clientsCount,
        users: userRooms.size
    });
});

// 服务器状态端点
app.get('/status', (req, res) => {
    const users = [];
    userRooms.forEach((sockets, userId) => {
        users.push({
            userId,
            devices: sockets.size
        });
    });
    
    res.json({
        status: 'running',
        timestamp: new Date(),
        totalConnections: io.engine.clientsCount,
        totalUsers: userRooms.size,
        users
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ WebSocket 服务器运行在端口 ${PORT}`);
    console.log(`📡 Socket.IO 端点: http://localhost:${PORT}`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    console.log(`📊 服务器状态: http://localhost:${PORT}/status`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('🛑 收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 收到 SIGINT 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

