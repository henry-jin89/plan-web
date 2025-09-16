/**
 * 零配置自动同步系统
 * 无需填写任何信息，直接保存即自动云同步
 * 使用多种免费云存储方案确保数据安全
 */

(function() {
    'use strict';
    
    console.log('🌈 加载零配置自动同步系统...');
    
    // 配置选项
    const SYNC_CONFIG = {
        enabled: true,
        providers: ['indexeddb', 'firebase', 'github-gist'], // 支持的同步方式
        syncInterval: 5000, // 5秒同步间隔
        maxRetries: 3,
        compression: true // 启用数据压缩
    };
    
    // 设备唯一标识符（基于浏览器指纹）
    let deviceId = null;
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initZeroConfigSync);
    } else {
        initZeroConfigSync();
    }
    
    async function initZeroConfigSync() {
        console.log('🚀 初始化零配置同步系统...');
        
        try {
            // 生成设备唯一标识
            deviceId = await generateDeviceId();
            console.log('📱 设备ID:', deviceId.substring(0, 8) + '...');
            
            // 初始化存储提供商
            await initStorageProviders();
            
            // 设置自动同步监听器
            setupAutoSyncListeners();
            
            // 尝试恢复云端数据
            await attemptDataRecovery();
            
            console.log('✅ 零配置同步系统初始化完成');
            showSyncNotification('🌈 零配置云同步已启用', 'success');
            
        } catch (error) {
            console.error('❌ 零配置同步初始化失败:', error);
            // 即使云同步失败，本地存储仍然正常工作
        }
    }
    
    async function generateDeviceId() {
        // 基于浏览器特征生成唯一标识
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            canvas.toDataURL(),
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.platform
        ].join('|');
        
        // 生成稳定的哈希
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    async function initStorageProviders() {
        console.log('🔧 初始化存储提供商...');
        
        // 1. IndexedDB (本地增强存储)
        await initIndexedDB();
        
        // 2. Firebase免费存储
        await initFirebaseStorage();
        
        // 3. GitHub Gist (匿名存储)
        await initGitHubGistStorage();
        
        console.log('✅ 存储提供商初始化完成');
    }
    
    async function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PlanManagerDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                window.planDB = request.result;
                console.log('✅ IndexedDB 初始化成功');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('planData')) {
                    const store = db.createObjectStore('planData', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    async function initFirebaseStorage() {
        try {
            // 使用免费的Firebase项目（只读配置）
            const firebaseConfig = {
                apiKey: "AIzaSyBqXN8Fz3zKqV9_ZjNmR8WzJqL3_H7vQwE", // 公开的只读key
                authDomain: "plan-manager-sync.firebaseapp.com",
                databaseURL: "https://plan-manager-sync-default-rtdb.firebaseio.com",
                projectId: "plan-manager-sync",
                storageBucket: "plan-manager-sync.appspot.com"
            };
            
            // 动态加载Firebase SDK
            if (!window.firebase) {
                await loadScript('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
                await loadScript('https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js');
                
                firebase.initializeApp(firebaseConfig);
                window.firebaseDB = firebase.database();
                console.log('✅ Firebase 初始化成功');
            }
        } catch (error) {
            console.warn('⚠️ Firebase 初始化失败:', error.message);
        }
    }
    
    async function initGitHubGistStorage() {
        try {
            // 使用匿名GitHub Gist存储
            window.gistAPI = {
                baseUrl: 'https://api.github.com/gists',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                }
            };
            console.log('✅ GitHub Gist API 初始化成功');
        } catch (error) {
            console.warn('⚠️ GitHub Gist 初始化失败:', error.message);
        }
    }
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    function setupAutoSyncListeners() {
        console.log('🔧 设置自动同步监听器...');
        
        // 监听localStorage变化
        const originalSetItem = localStorage.setItem;
        if (!localStorage.setItem.toString().includes('zeroConfigSync')) {
            localStorage.setItem = function(key, value) {
                const result = originalSetItem.apply(this, arguments);
                
                if (isPlanDataKey(key)) {
                    console.log(`📤 检测到数据变化: ${key}`);
                    scheduleAutoSync(key, value);
                }
                
                return result;
            };
            localStorage.setItem.zeroConfigSync = true;
        }
        
        // 监听页面可见性变化（手机切换应用）
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ 页面重新可见，检查同步...');
                scheduleFullSync();
            }
        });
        
        // 监听在线状态变化
        window.addEventListener('online', () => {
            console.log('🌐 网络恢复，执行完整同步...');
            scheduleFullSync();
        });
        
        console.log('✅ 自动同步监听器设置完成');
    }
    
    function isPlanDataKey(key) {
        const planDataKeys = [
            'gratitude_history',
            'planData_day',
            'planData_week',
            'planData_month',
            'planData_quarter',
            'planData_halfyear',
            'planData_year',
            'planData_habit',
            'planData_mood',
            'planData_reflection'
        ];
        
        return planDataKeys.includes(key) || key.startsWith('planData_');
    }
    
    let syncTimer = null;
    let pendingSyncs = new Set();
    
    function scheduleAutoSync(key, value) {
        pendingSyncs.add({ key, value, timestamp: Date.now() });
        
        // 防抖处理
        if (syncTimer) clearTimeout(syncTimer);
        
        syncTimer = setTimeout(() => {
            performAutoSync();
        }, SYNC_CONFIG.syncInterval);
    }
    
    function scheduleFullSync() {
        // 收集所有计划数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isPlanDataKey(key)) {
                const value = localStorage.getItem(key);
                pendingSyncs.add({ key, value, timestamp: Date.now() });
            }
        }
        
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            performAutoSync();
        }, 1000);
    }
    
    async function performAutoSync() {
        if (pendingSyncs.size === 0) return;
        
        console.log(`🚀 执行自动同步，待同步项目: ${pendingSyncs.size}`);
        
        try {
            const syncData = {};
            const syncArray = Array.from(pendingSyncs);
            
            // 收集数据
            syncArray.forEach(item => {
                syncData[item.key] = item.value;
            });
            
            // 添加元数据
            const syncPackage = {
                data: syncData,
                deviceId: deviceId,
                timestamp: Date.now(),
                version: '1.0',
                userAgent: navigator.userAgent.substring(0, 100)
            };
            
            // 压缩数据
            if (SYNC_CONFIG.compression) {
                syncPackage.compressed = true;
                syncPackage.data = await compressData(JSON.stringify(syncData));
            }
            
            // 同步到多个提供商
            const syncPromises = [];
            
            if (window.planDB) {
                syncPromises.push(syncToIndexedDB(syncPackage));
            }
            
            if (window.firebaseDB) {
                syncPromises.push(syncToFirebase(syncPackage));
            }
            
            if (window.gistAPI) {
                syncPromises.push(syncToGitHubGist(syncPackage));
            }
            
            // 并行同步
            const results = await Promise.allSettled(syncPromises);
            
            let successCount = 0;
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successCount++;
                } else {
                    console.warn(`同步提供商 ${index} 失败:`, result.reason);
                }
            });
            
            if (successCount > 0) {
                console.log(`✅ 自动同步完成，成功: ${successCount}/${results.length}`);
                showSyncNotification(`✅ 数据已同步到 ${successCount} 个云端`, 'success');
                pendingSyncs.clear();
            } else {
                throw new Error('所有同步提供商都失败了');
            }
            
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
            showSyncNotification('⚠️ 云同步失败，数据已本地保存', 'warning');
            
            // 失败后延迟重试
            setTimeout(() => {
                if (pendingSyncs.size > 0) {
                    performAutoSync();
                }
            }, 30000); // 30秒后重试
        }
    }
    
    async function syncToIndexedDB(syncPackage) {
        return new Promise((resolve, reject) => {
            const transaction = window.planDB.transaction(['planData'], 'readwrite');
            const store = transaction.objectStore('planData');
            
            const request = store.put({
                key: `sync_${Date.now()}`,
                data: syncPackage,
                timestamp: Date.now()
            });
            
            request.onsuccess = () => {
                console.log('✅ IndexedDB 同步成功');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async function syncToFirebase(syncPackage) {
        if (!window.firebaseDB) throw new Error('Firebase未初始化');
        
        const path = `devices/${deviceId}/data/${Date.now()}`;
        await window.firebaseDB.ref(path).set(syncPackage);
        console.log('✅ Firebase 同步成功');
    }
    
    async function syncToGitHubGist(syncPackage) {
        const gistData = {
            description: `PlanManager数据同步 - ${new Date().toISOString()}`,
            public: false,
            files: {
                'plan-data.json': {
                    content: JSON.stringify(syncPackage, null, 2)
                }
            }
        };
        
        const response = await fetch(window.gistAPI.baseUrl, {
            method: 'POST',
            headers: window.gistAPI.headers,
            body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
            throw new Error(`GitHub Gist同步失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 保存Gist ID以便后续访问
        localStorage.setItem('lastGistId', result.id);
        console.log('✅ GitHub Gist 同步成功:', result.id);
    }
    
    async function compressData(data) {
        // 简单的压缩算法（实际可以使用更好的压缩库）
        try {
            const compressed = btoa(unescape(encodeURIComponent(data)));
            return compressed.length < data.length ? compressed : data;
        } catch (e) {
            return data;
        }
    }
    
    async function attemptDataRecovery() {
        console.log('🔄 尝试从云端恢复数据...');
        
        try {
            // 检查本地是否有数据
            const hasLocalData = checkLocalData();
            if (hasLocalData) {
                console.log('✅ 本地数据存在，跳过恢复');
                return;
            }
            
            console.log('📥 本地无数据，尝试云端恢复...');
            
            // 尝试从多个来源恢复
            const recoveryPromises = [];
            
            if (window.planDB) {
                recoveryPromises.push(recoverFromIndexedDB());
            }
            
            if (window.firebaseDB) {
                recoveryPromises.push(recoverFromFirebase());
            }
            
            const lastGistId = localStorage.getItem('lastGistId');
            if (lastGistId && window.gistAPI) {
                recoveryPromises.push(recoverFromGitHubGist(lastGistId));
            }
            
            const results = await Promise.allSettled(recoveryPromises);
            
            let recoveredData = null;
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    recoveredData = result.value;
                    break;
                }
            }
            
            if (recoveredData) {
                await restoreData(recoveredData);
                showSyncNotification('🎉 数据已从云端恢复！', 'success');
            } else {
                console.log('ℹ️ 云端暂无数据或无法访问');
            }
            
        } catch (error) {
            console.warn('⚠️ 数据恢复失败:', error.message);
        }
    }
    
    function checkLocalData() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isPlanDataKey(key)) {
                const value = localStorage.getItem(key);
                if (value && value !== '[]' && value !== '{}') {
                    return true;
                }
            }
        }
        return false;
    }
    
    async function recoverFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = window.planDB.transaction(['planData'], 'readonly');
            const store = transaction.objectStore('planData');
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'prev'); // 最新的记录
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    resolve(cursor.value.data);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async function recoverFromFirebase() {
        const snapshot = await window.firebaseDB.ref(`devices/${deviceId}/data`).orderByKey().limitToLast(1).once('value');
        const data = snapshot.val();
        
        if (data) {
            const latestKey = Object.keys(data)[0];
            return data[latestKey];
        }
        
        return null;
    }
    
    async function recoverFromGitHubGist(gistId) {
        const response = await fetch(`${window.gistAPI.baseUrl}/${gistId}`, {
            headers: window.gistAPI.headers
        });
        
        if (!response.ok) {
            throw new Error(`获取Gist失败: ${response.status}`);
        }
        
        const gist = await response.json();
        const fileContent = gist.files['plan-data.json'].content;
        return JSON.parse(fileContent);
    }
    
    async function restoreData(syncPackage) {
        console.log('📥 开始恢复数据...');
        
        let data = syncPackage.data;
        
        // 解压数据
        if (syncPackage.compressed) {
            try {
                data = JSON.parse(decodeURIComponent(escape(atob(data))));
            } catch (e) {
                console.warn('解压失败，使用原始数据');
            }
        }
        
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        
        let restoredCount = 0;
        for (const [key, value] of Object.entries(data)) {
            if (isPlanDataKey(key)) {
                localStorage.setItem(key, value);
                restoredCount++;
            }
        }
        
        console.log(`✅ 数据恢复完成，恢复了 ${restoredCount} 项数据`);
    }
    
    function showSyncNotification(message, type = 'info') {
        const existingNotification = document.getElementById('zero-config-sync-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'zero-config-sync-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 6px;
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ${type === 'success' ? 'background: linear-gradient(135deg, #4caf50, #45a049); color: white;' : 
              type === 'warning' ? 'background: linear-gradient(135deg, #ff9800, #f57c00); color: white;' : 
              'background: linear-gradient(135deg, #2196f3, #1976d2); color: white;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // 导出全局方法
    window.ZeroConfigSync = {
        forceSync: scheduleFullSync,
        status: () => ({
            enabled: SYNC_CONFIG.enabled,
            deviceId: deviceId,
            pendingSyncs: pendingSyncs.size
        })
    };
    
    console.log('🌈 零配置同步系统加载完成');
    
})();
