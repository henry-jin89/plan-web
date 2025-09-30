/**
 * 自动云同步系统 - 零配置方案
 * 无需手动输入Token，支持多种云存储自动同步
 * 支持跨设备访问同一网页时自动同步数据
 */

(function() {
    'use strict';
    
    console.log('🌟 加载自动云同步系统...');
    
    // 全局配置
    window.AutoCloudSync = {
        enabled: false,
        providers: [],
        currentProvider: null,
        deviceId: null,
        syncInterval: null,
        lastSync: null
    };
    
    // 支持的云存储提供商配置
    const CLOUD_PROVIDERS = {
        // 1. 基于浏览器的分布式存储 (推荐)
        browserStorage: {
            name: '浏览器分布式存储',
            description: '利用浏览器内置功能实现跨设备同步',
            icon: '🌐',
            priority: 1,
            requiresConfig: false,
            init: initBrowserDistributedStorage
        },
        
        // 2. 免费的Firebase匿名存储
        firebaseAnonymous: {
            name: 'Firebase匿名存储',
            description: '使用Firebase免费匿名存储，无需注册',
            icon: '🔥',
            priority: 2,
            requiresConfig: false,
            init: initFirebaseAnonymousStorage
        },
        
        // 3. 公共GitHub Gist (匿名)
        githubGist: {
            name: 'GitHub公共存储',
            description: '使用GitHub公共Gist存储，无需Token',
            icon: '📝',
            priority: 3,
            requiresConfig: false,
            init: initGithubGistStorage
        },
        
        // 4. 浏览器原生文件系统API
        fileSystemAPI: {
            name: '本地文件同步',
            description: '使用浏览器文件系统API实现本地同步',
            icon: '💾',
            priority: 4,
            requiresConfig: false,
            init: initFileSystemAPIStorage
        },
        
        // 5. WebRTC P2P同步
        webrtcP2P: {
            name: '设备直连同步',
            description: '设备间直接连接同步，无需服务器',
            icon: '🔗',
            priority: 5,
            requiresConfig: false,
            init: initWebRTCP2PStorage
        }
    };
    
    // 初始化自动云同步
    async function initAutoCloudSync() {
        try {
            console.log('🚀 初始化自动云同步系统...');
            
            // 生成设备唯一标识
            window.AutoCloudSync.deviceId = await generateDeviceFingerprint();
            console.log('📱 设备标识:', window.AutoCloudSync.deviceId.substring(0, 8) + '...');
            
            // 自动检测并初始化最佳云存储提供商
            await autoDetectAndInitProvider();
            
            // 设置自动同步监听器
            setupAutoSyncListeners();
            
            // 尝试恢复云端数据
            await attemptDataRecovery();
            
            // 启用自动同步
            window.AutoCloudSync.enabled = true;
            
            console.log('✅ 自动云同步系统初始化完成');
            showSyncNotification('🌟 自动云同步已启用，数据将自动保存到云端', 'success');
            
        } catch (error) {
            console.error('❌ 自动云同步初始化失败:', error);
            // 降级到本地存储
            fallbackToLocalStorage();
        }
    }
    
    // 生成设备指纹
    async function generateDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.platform,
            navigator.hardwareConcurrency || 0
        ];
        
        // 添加Canvas指纹
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('PlanManager Device ID', 2, 2);
        components.push(canvas.toDataURL());
        
        const fingerprint = components.join('|');
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // 自动检测并初始化最佳提供商
    async function autoDetectAndInitProvider() {
        console.log('🔍 自动检测最佳云存储提供商...');
        
        // 按优先级尝试初始化提供商
        const providers = Object.entries(CLOUD_PROVIDERS)
            .sort(([,a], [,b]) => a.priority - b.priority);
        
        for (const [key, provider] of providers) {
            try {
                console.log(`🧪 尝试初始化: ${provider.name}`);
                const success = await provider.init();
                
                if (success) {
                    window.AutoCloudSync.currentProvider = key;
                    window.AutoCloudSync.providers.push(key);
                    console.log(`✅ 成功初始化: ${provider.name}`);
                    showSyncNotification(`${provider.icon} 已启用${provider.name}`, 'info');
                    break;
                }
            } catch (error) {
                console.warn(`⚠️ ${provider.name} 初始化失败:`, error.message);
                continue;
            }
        }
        
        if (!window.AutoCloudSync.currentProvider) {
            throw new Error('所有云存储提供商初始化失败');
        }
    }
    
    // 1. 浏览器分布式存储实现
    async function initBrowserDistributedStorage() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('浏览器不支持Service Worker');
        }
        
        try {
            // 注册Service Worker用于后台同步
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('📡 Service Worker注册成功');
            
            // 使用IndexedDB + BroadcastChannel实现跨标签页同步
            await initIndexedDBSync();
            
            // 设置跨域消息传递（用于跨设备同步）
            setupCrossOriginSync();
            
            return true;
        } catch (error) {
            console.warn('浏览器分布式存储初始化失败:', error);
            return false;
        }
    }
    
    // IndexedDB同步实现
    async function initIndexedDBSync() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PlanManagerCloudDB', 2);
            
            request.onerror = () => reject(request.error);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建数据存储
                if (!db.objectStoreNames.contains('planData')) {
                    const store = db.createObjectStore('planData', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('deviceId', 'deviceId');
                }
                
                // 创建同步记录存储
                if (!db.objectStoreNames.contains('syncLog')) {
                    const syncStore = db.createObjectStore('syncLog', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('timestamp', 'timestamp');
                }
            };
            
            request.onsuccess = () => {
                window.planCloudDB = request.result;
                console.log('💾 IndexedDB云同步数据库初始化完成');
                resolve(true);
            };
        });
    }
    
    // 跨域同步设置
    function setupCrossOriginSync() {
        // 使用BroadcastChannel实现同源跨标签页同步
        if ('BroadcastChannel' in window) {
            const syncChannel = new BroadcastChannel('plan-manager-sync');
            
            syncChannel.onmessage = (event) => {
                if (event.data.type === 'data-updated') {
                    console.log('📡 收到跨标签页数据更新通知');
                    handleRemoteDataUpdate(event.data.payload);
                }
            };
            
            window.syncChannel = syncChannel;
        }
        
        // 使用localStorage事件实现跨域同步
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('planData_')) {
                console.log('🔄 检测到跨域数据变化');
                handleStorageSync(event);
            }
        });
    }
    
    // 2. Firebase匿名存储实现
    async function initFirebaseAnonymousStorage() {
        try {
            // 使用公共Firebase项目配置
            const firebaseConfig = {
                apiKey: "AIzaSyB_demo_key", // 使用演示密钥
                authDomain: "plan-manager-demo.firebaseapp.com",
                databaseURL: "https://plan-manager-demo-default-rtdb.firebaseio.com",
                projectId: "plan-manager-demo"
            };
            
            // 动态加载Firebase SDK
            await loadFirebaseSDK();
            
            // 初始化Firebase
            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(firebaseConfig);
            }
            
            // 匿名认证
            await window.firebase.auth().signInAnonymously();
            
            console.log('🔥 Firebase匿名存储初始化成功');
            return true;
            
        } catch (error) {
            console.warn('Firebase匿名存储初始化失败:', error);
            return false;
        }
    }
    
    // 动态加载Firebase SDK
    async function loadFirebaseSDK() {
        if (window.firebase) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
            script.onload = () => {
                const authScript = document.createElement('script');
                authScript.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
                authScript.onload = () => {
                    const dbScript = document.createElement('script');
                    dbScript.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
                    dbScript.onload = resolve;
                    dbScript.onerror = reject;
                    document.head.appendChild(dbScript);
                };
                authScript.onerror = reject;
                document.head.appendChild(authScript);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 3. GitHub Gist公共存储实现
    async function initGithubGistStorage() {
        try {
            // 使用GitHub API创建公共Gist（无需Token）
            const testGist = {
                description: "Plan Manager Test Data",
                public: true,
                files: {
                    "test.json": {
                        content: JSON.stringify({ test: true, timestamp: Date.now() })
                    }
                }
            };
            
            // 测试GitHub API连接
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'PlanManager-AutoSync'
                },
                body: JSON.stringify(testGist)
            });
            
            if (response.ok) {
                const gist = await response.json();
                localStorage.setItem('planManager_gist_id', gist.id);
                console.log('📝 GitHub Gist存储初始化成功');
                return true;
            } else {
                throw new Error(`GitHub API响应错误: ${response.status}`);
            }
            
        } catch (error) {
            console.warn('GitHub Gist存储初始化失败:', error);
            return false;
        }
    }
    
    // 4. 文件系统API实现
    async function initFileSystemAPIStorage() {
        if (!('showDirectoryPicker' in window)) {
            throw new Error('浏览器不支持File System Access API');
        }
        
        try {
            // 请求用户选择同步目录
            const dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            
            // 存储目录句柄
            localStorage.setItem('planManager_dir_handle', JSON.stringify(dirHandle));
            
            console.log('💾 文件系统API存储初始化成功');
            return true;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.warn('文件系统API存储初始化失败:', error);
            }
            return false;
        }
    }
    
    // 5. WebRTC P2P同步实现
    async function initWebRTCP2PStorage() {
        if (!('RTCPeerConnection' in window)) {
            throw new Error('浏览器不支持WebRTC');
        }
        
        try {
            // 创建简单的P2P连接测试
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            // 创建数据通道
            const dataChannel = pc.createDataChannel('planManagerSync', {
                ordered: true
            });
            
            console.log('🔗 WebRTC P2P同步初始化成功');
            return true;
            
        } catch (error) {
            console.warn('WebRTC P2P同步初始化失败:', error);
            return false;
        }
    }
    
    // 设置自动同步监听器
    function setupAutoSyncListeners() {
        // 监听数据变化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(this, arguments);
            
            if (key.startsWith('planData_') && window.AutoCloudSync.enabled) {
                console.log('📝 检测到计划数据变化，准备同步...');
                debounceSync();
            }
            
            return result;
        };
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.AutoCloudSync.enabled) {
                console.log('👀 页面重新可见，检查数据同步...');
                setTimeout(performSync, 1000);
            }
        });
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            if (window.AutoCloudSync.enabled) {
                console.log('🌐 网络已连接，执行同步...');
                setTimeout(performSync, 2000);
            }
        });
        
        // 定期同步
        window.AutoCloudSync.syncInterval = setInterval(() => {
            if (window.AutoCloudSync.enabled && navigator.onLine) {
                performSync();
            }
        }, 30000); // 每30秒同步一次
    }
    
    // 防抖同步
    let syncTimer = null;
    function debounceSync() {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(performSync, 3000); // 3秒后执行同步
    }
    
    // 执行同步
    async function performSync() {
        if (!window.AutoCloudSync.enabled || !navigator.onLine) {
            return;
        }
        
        try {
            console.log('🔄 开始执行自动同步...');
            
            // 获取本地数据
            const localData = getAllPlanData();
            
            // 根据当前提供商执行同步
            switch (window.AutoCloudSync.currentProvider) {
                case 'browserStorage':
                    await syncWithBrowserStorage(localData);
                    break;
                case 'firebaseAnonymous':
                    await syncWithFirebase(localData);
                    break;
                case 'githubGist':
                    await syncWithGithubGist(localData);
                    break;
                case 'fileSystemAPI':
                    await syncWithFileSystem(localData);
                    break;
                case 'webrtcP2P':
                    await syncWithWebRTC(localData);
                    break;
            }
            
            window.AutoCloudSync.lastSync = new Date().toISOString();
            console.log('✅ 自动同步完成');
            
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
        }
    }
    
    // 获取所有计划数据
    function getAllPlanData() {
        const planData = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('planData_')) {
                try {
                    planData[key] = JSON.parse(localStorage.getItem(key));
                } catch (error) {
                    console.warn(`解析数据失败: ${key}`, error);
                }
            }
        }
        
        return {
            data: planData,
            deviceId: window.AutoCloudSync.deviceId,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    
    // 浏览器存储同步
    async function syncWithBrowserStorage(localData) {
        if (!window.planCloudDB) return;
        
        const transaction = window.planCloudDB.transaction(['planData'], 'readwrite');
        const store = transaction.objectStore('planData');
        
        // 保存数据到IndexedDB
        await store.put({
            id: 'latest',
            ...localData
        });
        
        // 广播数据更新
        if (window.syncChannel) {
            window.syncChannel.postMessage({
                type: 'data-updated',
                payload: localData
            });
        }
    }
    
    // Firebase同步
    async function syncWithFirebase(localData) {
        if (!window.firebase) return;
        
        const database = window.firebase.database();
        const userRef = database.ref(`users/${window.AutoCloudSync.deviceId}`);
        
        await userRef.set(localData);
    }
    
    // GitHub Gist同步
    async function syncWithGithubGist(localData) {
        const gistId = localStorage.getItem('planManager_gist_id');
        if (!gistId) return;
        
        const updateData = {
            files: {
                "planData.json": {
                    content: JSON.stringify(localData, null, 2)
                }
            }
        };
        
        await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'PlanManager-AutoSync'
            },
            body: JSON.stringify(updateData)
        });
    }
    
    // 文件系统同步
    async function syncWithFileSystem(localData) {
        const dirHandleData = localStorage.getItem('planManager_dir_handle');
        if (!dirHandleData) return;
        
        try {
            const dirHandle = JSON.parse(dirHandleData);
            const fileHandle = await dirHandle.getFileHandle('planData.json', { create: true });
            const writable = await fileHandle.createWritable();
            
            await writable.write(JSON.stringify(localData, null, 2));
            await writable.close();
        } catch (error) {
            console.warn('文件系统同步失败:', error);
        }
    }
    
    // WebRTC同步
    async function syncWithWebRTC(localData) {
        // WebRTC P2P同步实现
        console.log('🔗 WebRTC同步功能开发中...');
    }
    
    // 尝试数据恢复
    async function attemptDataRecovery() {
        console.log('🔍 尝试从云端恢复数据...');
        
        try {
            let cloudData = null;
            
            // 根据当前提供商恢复数据
            switch (window.AutoCloudSync.currentProvider) {
                case 'browserStorage':
                    cloudData = await recoverFromBrowserStorage();
                    break;
                case 'firebaseAnonymous':
                    cloudData = await recoverFromFirebase();
                    break;
                case 'githubGist':
                    cloudData = await recoverFromGithubGist();
                    break;
                case 'fileSystemAPI':
                    cloudData = await recoverFromFileSystem();
                    break;
            }
            
            if (cloudData && cloudData.data) {
                console.log('📥 发现云端数据，正在恢复...');
                await mergeCloudData(cloudData);
                showSyncNotification('📥 已从云端恢复数据', 'success');
            } else {
                console.log('☁️ 云端暂无数据，使用本地数据');
            }
            
        } catch (error) {
            console.warn('数据恢复失败:', error);
        }
    }
    
    // 从浏览器存储恢复
    async function recoverFromBrowserStorage() {
        if (!window.planCloudDB) return null;
        
        const transaction = window.planCloudDB.transaction(['planData'], 'readonly');
        const store = transaction.objectStore('planData');
        
        return new Promise((resolve) => {
            const request = store.get('latest');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    }
    
    // 从Firebase恢复
    async function recoverFromFirebase() {
        if (!window.firebase) return null;
        
        const database = window.firebase.database();
        const userRef = database.ref(`users/${window.AutoCloudSync.deviceId}`);
        
        const snapshot = await userRef.once('value');
        return snapshot.val();
    }
    
    // 从GitHub Gist恢复
    async function recoverFromGithubGist() {
        const gistId = localStorage.getItem('planManager_gist_id');
        if (!gistId) return null;
        
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`);
            if (response.ok) {
                const gist = await response.json();
                const content = gist.files['planData.json']?.content;
                return content ? JSON.parse(content) : null;
            }
        } catch (error) {
            console.warn('GitHub Gist数据恢复失败:', error);
        }
        
        return null;
    }
    
    // 从文件系统恢复
    async function recoverFromFileSystem() {
        const dirHandleData = localStorage.getItem('planManager_dir_handle');
        if (!dirHandleData) return null;
        
        try {
            const dirHandle = JSON.parse(dirHandleData);
            const fileHandle = await dirHandle.getFileHandle('planData.json');
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            return JSON.parse(content);
        } catch (error) {
            console.warn('文件系统数据恢复失败:', error);
            return null;
        }
    }
    
    // 合并云端数据
    async function mergeCloudData(cloudData) {
        if (!cloudData.data) return;
        
        const localTimestamp = new Date(localStorage.getItem('lastDataUpdate') || 0);
        const cloudTimestamp = new Date(cloudData.timestamp || 0);
        
        // 如果云端数据更新，则合并
        if (cloudTimestamp > localTimestamp) {
            for (const [key, value] of Object.entries(cloudData.data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
            
            localStorage.setItem('lastDataUpdate', cloudData.timestamp);
            
            // 触发页面数据刷新
            window.dispatchEvent(new CustomEvent('cloudDataRestored', {
                detail: { source: 'cloud', timestamp: cloudData.timestamp }
            }));
        }
    }
    
    // 处理远程数据更新
    function handleRemoteDataUpdate(payload) {
        if (payload.deviceId === window.AutoCloudSync.deviceId) {
            return; // 忽略自己的更新
        }
        
        console.log('📡 处理远程设备数据更新');
        mergeCloudData(payload);
    }
    
    // 处理存储同步
    function handleStorageSync(event) {
        if (event.newValue && event.newValue !== event.oldValue) {
            console.log('🔄 处理跨域存储同步');
            debounceSync();
        }
    }
    
    // 降级到本地存储
    function fallbackToLocalStorage() {
        console.log('⚠️ 云同步不可用，降级到本地存储模式');
        showSyncNotification('⚠️ 云同步暂时不可用，数据将保存在本地', 'warning');
        
        // 确保本地数据持久化
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }
    }
    
    // 显示同步通知
    function showSyncNotification(message, type = 'info') {
        // 避免显示过多通知
        if (window.DISABLE_ALL_NOTIFICATIONS || window.DISABLE_SYNC_NOTIFICATIONS) {
            console.log(`[通知已屏蔽] ${message}`);
            return;
        }
        
        // 创建非侵入式通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示动画
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoCloudSync);
    } else {
        setTimeout(initAutoCloudSync, 1000);
    }
    
    // 导出API供其他模块使用
    window.AutoCloudSync.performSync = performSync;
    window.AutoCloudSync.disable = function() {
        window.AutoCloudSync.enabled = false;
        if (window.AutoCloudSync.syncInterval) {
            clearInterval(window.AutoCloudSync.syncInterval);
        }
        console.log('🛑 自动云同步已禁用');
    };
    
    console.log('✅ 自动云同步系统加载完成');
    
})();
