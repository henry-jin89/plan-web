/**
 * Firebase数据库同步系统 - 修复版
 * 解决跨设备同步问题：使用固定的用户标识
 */

(function() {
    'use strict';
    
    console.log('🔥 加载Firebase数据库同步系统（修复版）...');
    
    // Firebase配置 - 从配置文件获取
    const firebaseConfig = window.firebaseConfig || {
        apiKey: "AIzaSyCDJRRK83dXaGsUiBtpgN5M0REJtV-3Uc0",
        authDomain: "plan-web-b0c39.firebaseapp.com",
        projectId: "plan-web-b0c39",
        storageBucket: "plan-web-b0c39.firebasestorage.app",
        messagingSenderId: "1087929904929",
        appId: "1:1087929904929:web:aa8790a7ee424fce3b1860",
        measurementId: "G-KFHYWN1P7D"
    };
    
    class FirebaseDatabaseSync {
        constructor() {
            this.app = null;
            this.db = null;
            this.auth = null;
            this.isInitialized = false;
            this.isEnabled = false;
            this.userId = null;
            this.sharedUserId = 'shared-plan-web-user'; // 固定的共享用户ID
            this.lastSync = null;
            this.syncInProgress = false;
            
            this.init();
        }
        
        async init() {
            try {
                console.log('🚀 初始化Firebase数据库同步...');
                console.log('📱 设备信息:', {
                    userAgent: navigator.userAgent.substring(0, 50),
                    platform: navigator.platform,
                    online: navigator.onLine
                });
                
                // 检查网络连接
                if (!navigator.onLine) {
                    throw new Error('设备处于离线状态');
                }
                
                // 动态加载Firebase SDK
                await this.loadFirebaseSDK();
                
                // 初始化Firebase应用
                this.app = window.firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase应用初始化成功');
                
                // 初始化Firestore数据库
                this.db = window.firebase.firestore();
                
                // 启用离线持久化（重要！提高可靠性）
                try {
                    await this.db.enablePersistence({ synchronizeTabs: true });
                    console.log('✅ Firestore离线持久化已启用');
                } catch (err) {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ 多个标签页打开，无法启用持久化');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠️ 浏览器不支持离线持久化');
                    } else {
                        console.warn('⚠️ 持久化启用失败:', err);
                    }
                }
                
                console.log('✅ Firestore数据库连接成功');
                
                // 初始化认证
                this.auth = window.firebase.auth();
                
                // 启用持久化认证（重要！）
                await this.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
                console.log('✅ 已启用认证持久化');
                
                // 检查是否已有登录状态
                const currentUser = this.auth.currentUser;
                if (currentUser) {
                    console.log('✅ 检测到已登录用户，跳过认证');
                    this.userId = currentUser.uid;
                    console.log('📌 用户ID:', this.userId.substring(0, 8) + '...');
                } else {
                    // 匿名登录（增加超时控制和重试）
                    let authSuccess = false;
                    let lastError;
                    
                    for (let attempt = 1; attempt <= 3; attempt++) {
                        try {
                            console.log(`🔐 尝试匿名登录 (第${attempt}次)...`);
                            await Promise.race([
                                this.signInAnonymously(),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('认证超时')), 30000))
                            ]);
                            authSuccess = true;
                            break;
                        } catch (error) {
                            lastError = error;
                            console.warn(`⚠️ 第${attempt}次认证失败:`, error.message);
                            if (attempt < 3) {
                                const waitTime = attempt * 2;
                                console.log(`⏳ 等待${waitTime}秒后重试...`);
                                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                            }
                        }
                    }
                    
                    if (!authSuccess) {
                        throw lastError || new Error('认证失败');
                    }
                }
                
                // 设置自动同步
                this.setupAutoSync();
                
                // 尝试恢复云端数据（不阻塞初始化）
                this.restoreFromDatabase().catch(err => {
                    console.warn('恢复数据失败，将使用本地数据:', err);
                });
                
                this.isInitialized = true;
                this.isEnabled = true;
                
                // 监听网络状态变化，网络恢复时重新尝试同步
                this.setupNetworkListener();
                
                console.log('✅ Firebase数据库同步初始化完成');
                this.showNotification('🔥 Firebase数据库同步已启用', 'success');
                
                // 触发初始化完成事件
                window.dispatchEvent(new CustomEvent('firebase-initialized', {
                    detail: { timestamp: new Date() }
                }));
                
            } catch (error) {
                console.error('❌ Firebase初始化失败:', error);
                console.error('错误详情:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack?.substring(0, 200)
                });
                this.fallbackToLocal(error);
                
                // 即使初始化失败，也监听网络恢复
                this.setupNetworkListener();
            }
        }
        
        setupNetworkListener() {
            // 监听网络恢复
            window.addEventListener('online', () => {
                console.log('🌐 网络已恢复，尝试重新连接Firebase...');
                if (!this.isEnabled && !this.isInitialized) {
                    // 如果之前失败了，重新尝试初始化
                    setTimeout(() => this.retryInit(), 2000);
                } else if (this.isEnabled) {
                    // 如果已连接，立即同步
                    this.syncToDatabase();
                }
            });
            
            window.addEventListener('offline', () => {
                console.log('📡 网络已断开');
            });
        }
        
        async retryInit() {
            console.log('🔄 重新尝试初始化Firebase...');
            try {
                if (!this.auth) {
                    // 如果完全没初始化，从头开始
                    await this.init();
                } else {
                    // 如果只是认证失败，只重试认证
                    await this.auth.signInAnonymously();
                    this.isInitialized = true;
                    this.isEnabled = true;
                    this.setupAutoSync();
                    console.log('✅ Firebase重新连接成功');
                    this.showNotification('✅ Firebase已重新连接', 'success');
                }
            } catch (error) {
                console.warn('⚠️ 重新连接失败:', error.message);
            }
        }
        
        async loadFirebaseSDK() {
            console.log('📦 加载Firebase SDK...');
            
            if (window.firebase) {
                console.log('✅ Firebase SDK已存在');
                return;
            }
            
            // 使用更稳定的版本 9.23.0（移动端兼容性更好）
            const version = '9.23.0';
            
            // 多 CDN 备选方案
            const cdnOptions = [
                {
                    name: 'Google官方CDN',
                    baseUrl: 'https://www.gstatic.com/firebasejs',
                    timeout: 15000 // 15秒超时（国内可能慢）
                },
                {
                    name: 'jsDelivr CDN',
                    baseUrl: 'https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase',
                    timeout: 15000
                },
                {
                    name: 'unpkg CDN',
                    baseUrl: 'https://unpkg.com/firebase@9.23.0/firebase',
                    timeout: 15000
                }
            ];
            
            let lastError;
            
            // 尝试每个 CDN
            for (const cdn of cdnOptions) {
                try {
                    console.log(`📦 尝试从 ${cdn.name} 加载 SDK...`);
                    console.log(`📦 使用Firebase SDK版本: ${version}`);
                    
                    // 加载Firebase核心
                    console.log('📦 加载 firebase-app...');
                    await this.loadScriptWithTimeout(
                        `${cdn.baseUrl}/${version}/firebase-app-compat.js`,
                        cdn.timeout
                    );
                    console.log('✅ firebase-app 加载完成');
                    
                    // 验证firebase对象已创建
                    if (!window.firebase) {
                        throw new Error('Firebase对象未创建');
                    }
                
                    // 加载Firestore
                    console.log('📦 加载 firebase-firestore...');
                    await this.loadScriptWithTimeout(
                        `${cdn.baseUrl}/${version}/firebase-firestore-compat.js`,
                        cdn.timeout
                    );
                    console.log('✅ firebase-firestore 加载完成');
                
                    // 加载认证
                    console.log('📦 加载 firebase-auth...');
                    await this.loadScriptWithTimeout(
                        `${cdn.baseUrl}/${version}/firebase-auth-compat.js`,
                        cdn.timeout
                    );
                    console.log('✅ firebase-auth 加载完成');
                    
                    console.log(`✅ Firebase SDK从 ${cdn.name} 加载完成`);
                    return; // 成功加载，退出
                    
                } catch (error) {
                    lastError = error;
                    console.warn(`⚠️ 从 ${cdn.name} 加载失败:`, error.message);
                    
                    // 清理可能部分加载的对象
                    if (window.firebase) {
                        delete window.firebase;
                    }
                    
                    // 如果不是最后一个CDN，继续尝试下一个
                    if (cdn !== cdnOptions[cdnOptions.length - 1]) {
                        console.log('🔄 尝试下一个CDN...');
                        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
                    }
                }
            }
            
            // 所有CDN都失败
            console.error('❌ 所有CDN加载失败');
            throw new Error(`SDK加载失败（尝试了${cdnOptions.length}个CDN）: ${lastError?.message}`);
        }
        
        loadScriptWithTimeout(src, timeout) {
            return new Promise((resolve, reject) => {
                console.log(`⏳ 开始加载脚本: ${src}`);
                
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.crossOrigin = 'anonymous';
                
                // 超时控制
                const timer = setTimeout(() => {
                    script.onerror = null;
                    script.onload = null;
                    document.head.removeChild(script);
                    reject(new Error(`加载超时（${timeout/1000}秒）`));
                }, timeout);
                
                script.onload = () => {
                    clearTimeout(timer);
                    console.log(`✅ 脚本加载成功: ${src.split('/').pop()}`);
                    resolve();
                };
                
                script.onerror = (error) => {
                    clearTimeout(timer);
                    document.head.removeChild(script);
                    console.error(`❌ 脚本加载失败: ${src.split('/').pop()}`);
                    reject(new Error(`加载失败`));
                };
                
                document.head.appendChild(script);
            });
        }
        
        loadScript(src) {
            return new Promise((resolve, reject) => {
                console.log(`⏳ 开始加载脚本: ${src}`);
                
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.crossOrigin = 'anonymous';
                
                // 添加超时控制
                const timeout = setTimeout(() => {
                    script.onerror = null;
                    script.onload = null;
                    reject(new Error(`脚本加载超时: ${src}`));
                }, 30000); // 30秒超时
                
                script.onload = () => {
                    clearTimeout(timeout);
                    console.log(`✅ 脚本加载成功: ${src}`);
                    resolve();
                };
                
                script.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error(`❌ 脚本加载失败: ${src}`, error);
                    reject(new Error(`脚本加载失败: ${src}`));
                };
                
                document.head.appendChild(script);
            });
        }
        
        async signInAnonymously() {
            try {
                console.log('🔐 执行匿名登录...');
                
                const userCredential = await this.auth.signInAnonymously();
                this.userId = userCredential.user.uid;
                
                console.log('✅ 匿名登录成功，用户ID:', this.userId.substring(0, 8) + '...');
                console.log('📌 使用共享ID进行跨设备同步:', this.sharedUserId);
                
                // 监听认证状态变化
                this.auth.onAuthStateChanged((user) => {
                    if (user) {
                        this.userId = user.uid;
                        console.log('👤 用户认证状态更新');
                    } else {
                        console.log('👤 用户已登出');
                        this.userId = null;
                    }
                });
                
            } catch (error) {
                console.error('❌ 匿名登录失败:', error);
                // 仍然使用共享ID
                this.userId = 'local_' + this.sharedUserId;
            }
        }
        
        setupAutoSync() {
            console.log('⚙️ 设置自动同步监听器...');
            
            // 监听localStorage变化
            if (!window.firebaseStorageListenerBound) {
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function(key, value) {
                    const result = originalSetItem.apply(this, arguments);
                    
                    if (key.startsWith('planData_') && window.firebaseSync?.isEnabled) {
                        console.log('📝 检测到计划数据变化:', key);
                        window.firebaseSync.debounceSync();
                    }
                    
                    return result;
                };
                window.firebaseStorageListenerBound = true;
            }
            
            // 页面可见性变化时同步
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isEnabled) {
                    setTimeout(() => this.syncToDatabase(), 2000);
                }
            });
            
            // 网络状态变化时同步
            window.addEventListener('online', () => {
                if (this.isEnabled) {
                    setTimeout(() => this.syncToDatabase(), 3000);
                }
            });
            
            // 页面卸载前同步
            window.addEventListener('beforeunload', () => {
                if (this.isEnabled && navigator.onLine) {
                    this.syncToDatabase(true);
                }
            });
            
            // 定期同步
            setInterval(() => {
                if (this.isEnabled && navigator.onLine && !this.syncInProgress) {
                    this.syncToDatabase();
                }
            }, 30000); // 每30秒同步一次
            
            // 页面加载时同步
            setTimeout(() => {
                if (this.isEnabled) {
                    this.restoreFromDatabase();
                }
            }, 2000);
        }
        
        debounceSync() {
            if (this.syncTimer) clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.syncToDatabase(), 3000);
        }
        
        async syncToDatabase(isSync = false) {
            if (!this.isEnabled || !this.userId || this.syncInProgress) return;
            
            try {
                this.syncInProgress = true;
                console.log('🔄 开始同步到Firebase数据库...');
                
                const planData = this.collectAllPlanData();
                const syncPackage = {
                    userId: this.sharedUserId, // 使用固定的共享ID
                    data: planData,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                    lastModified: new Date().toISOString(),
                    version: '2.0',
                    deviceInfo: {
                        userAgent: navigator.userAgent.substring(0, 100),
                        language: navigator.language,
                        platform: navigator.platform
                    }
                };
                
                // 保存到Firestore - 使用固定的共享ID
                const docRef = this.db.collection('planData').doc(this.sharedUserId);
                
                if (isSync) {
                    docRef.set(syncPackage);
                } else {
                    await docRef.set(syncPackage);
                    console.log('✅ 数据已同步到Firebase云端');
                    this.lastSync = new Date();
                }
                
            } catch (error) {
                console.error('❌ Firebase同步失败:', error);
                this.handleSyncError(error);
            } finally {
                this.syncInProgress = false;
            }
        }
        
        collectAllPlanData() {
            const allData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('planData_') || key.startsWith('habitData_') || 
                           key.startsWith('moodData_') || key.startsWith('reflectionData_'))) {
                    try {
                        const value = localStorage.getItem(key);
                        allData[key] = JSON.parse(value);
                    } catch (e) {
                        allData[key] = localStorage.getItem(key);
                    }
                }
            }
            return allData;
        }
        
        async restoreFromDatabase(force = false) {
            if (!this.userId) {
                console.warn('⚠️ 未登录，无法恢复数据');
                return;
            }
            
            try {
                console.log('🔍 从Firebase数据库恢复数据...');
                
                // 检查本地数据状态
                const localData = this.collectAllPlanData();
                const localDataCount = Object.keys(localData).length;
                const isLocalEmpty = localDataCount === 0;
                
                console.log(`📊 本地数据状态: ${localDataCount} 条记录`);
                
                if (isLocalEmpty) {
                    console.log('🆕 检测到本地数据为空，将尝试从云端恢复');
                    force = true; // 本地为空时强制恢复
                }
                
                // 使用固定的共享ID
                const docRef = this.db.collection('planData').doc(this.sharedUserId);
                const doc = await docRef.get();
                
                if (doc.exists) {
                    const cloudData = doc.data();
                    const cloudDataCount = cloudData.data ? Object.keys(cloudData.data).length : 0;
                    console.log(`☁️ 发现云端数据: ${cloudDataCount} 条记录`);
                    console.log(`📅 云端最后更新: ${cloudData.lastModified || '未知'}`);
                    
                    // 检查是否需要恢复数据
                    const lastLocalUpdate = localStorage.getItem('lastDataUpdate');
                    const cloudLastModified = cloudData.lastModified;
                    
                    // 决定是否恢复数据
                    const shouldRestore = force || 
                                         isLocalEmpty || 
                                         !lastLocalUpdate || 
                                         cloudLastModified > lastLocalUpdate;
                    
                    if (shouldRestore) {
                        console.log('📥 开始恢复数据...');
                        await this.mergeCloudData(cloudData);
                        
                        if (isLocalEmpty && cloudDataCount > 0) {
                            // 本地为空且成功恢复了数据
                            this.showNotification(`✅ 已从云端恢复 ${cloudDataCount} 条数据`, 'success', 5000);
                            console.log('✅ 数据恢复完成！建议刷新页面查看');
                            
                            // 触发页面刷新事件
                            window.dispatchEvent(new CustomEvent('data-restored', {
                                detail: { count: cloudDataCount, source: 'firebase' }
                            }));
                            
                            // 3秒后自动刷新页面
                            setTimeout(() => {
                                if (confirm('数据已从云端恢复，是否刷新页面查看？')) {
                                    window.location.reload();
                                }
                            }, 3000);
                        } else {
                            this.showNotification('📥 已从Firebase同步数据', 'success');
                            console.log('✅ 数据同步完成');
                        }
                    } else {
                        console.log('✅ 本地数据已是最新，无需恢复');
                    }
                } else {
                    console.log('☁️ Firebase中暂无数据');
                    
                    if (isLocalEmpty) {
                        console.log('⚠️ 本地和云端都没有数据');
                        this.showNotification('ℹ️ 暂无数据，请开始创建计划', 'info', 3000);
                    } else {
                        console.log('📤 将本地数据上传到云端...');
                        // 首次使用，将本地数据同步到云端
                        await this.syncToDatabase();
                        this.showNotification(`✅ 已将 ${localDataCount} 条数据备份到云端`, 'success');
                    }
                }
                
            } catch (error) {
                console.error('❌ Firebase数据恢复失败:', error);
                this.showNotification('❌ 数据恢复失败: ' + error.message, 'error', 5000);
                throw error; // 向上抛出错误
            }
        }
        
        async mergeCloudData(cloudData) {
            if (!cloudData.data) return;
            
                console.log('📥 合并Firebase云端数据...');
                
                let mergedCount = 0;
                for (const [key, value] of Object.entries(cloudData.data)) {
                    localStorage.setItem(key, JSON.stringify(value));
                    mergedCount++;
                }
                
                localStorage.setItem('lastDataUpdate', cloudData.lastModified);
            localStorage.setItem('lastCloudSync', new Date().toISOString());
                
                console.log(`✅ 已合并 ${mergedCount} 项数据`);
                
                // 通知页面刷新数据
                window.dispatchEvent(new CustomEvent('firebaseDataRestored', {
                    detail: { 
                        timestamp: cloudData.lastModified,
                        count: mergedCount,
                        source: 'firebase'
                    }
                }));
        }
        
        handleSyncError(error) {
            if (error.code === 'permission-denied') {
                console.warn('Firebase权限被拒绝，可能需要重新认证');
                this.signInAnonymously();
            } else if (error.code === 'unavailable') {
                console.warn('Firebase服务暂时不可用');
            }
        }
        
        async forceSync() {
            console.log('🔄 执行强制同步...');
            await this.syncToDatabase();
            await this.restoreFromDatabase();
        }
        
        async forceRestore() {
            console.log('📥 执行强制恢复...');
            await this.restoreFromDatabase();
            console.log('✅ 强制恢复完成');
        }
        
        /**
         * 获取同步状态 - 用于状态页面显示
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                isEnabled: this.isEnabled,
                userId: this.userId,
                sharedUserId: this.sharedUserId,
                lastSync: this.lastSync,
                syncInProgress: this.syncInProgress,
                hasFirebase: !!window.firebase,
                hasDb: !!this.db,
                hasAuth: !!this.auth,
                lastError: this.lastError,
                online: navigator.onLine,
                timestamp: new Date().toISOString()
            };
        }
        
        /**
         * 获取本地数据统计
         */
        getLocalDataStats() {
            const allData = this.collectAllPlanData();
            return {
                totalKeys: Object.keys(allData).length,
                dataSize: JSON.stringify(allData).length,
                keys: Object.keys(allData),
                lastUpdate: localStorage.getItem('lastDataUpdate'),
                lastSync: localStorage.getItem('lastCloudSync')
            };
        }
        
        /**
         * 获取完整的同步信息 - 用于调试
         */
        getSyncInfo() {
            return {
                status: this.getStatus(),
                localData: this.getLocalDataStats(),
                config: {
                    projectId: firebaseConfig.projectId,
                    authDomain: firebaseConfig.authDomain
                }
            };
        }
        
        fallbackToLocal(error) {
            console.log('📱 回退到本地存储模式');
            console.log('原因:', error?.message || '未知错误');
            this.isEnabled = false;
            this.isInitialized = false;
            
            // 保存错误信息供状态页面显示
            this.lastError = {
                message: error?.message || '初始化失败',
                code: error?.code,
                timestamp: new Date().toISOString()
            };
            
            this.showNotification('Firebase不可用，使用本地存储模式', 'info');
        }
        
        showNotification(message, type = 'info', duration = 3000) {
            // 控制台始终输出
            console.log(`📢 [${type.toUpperCase()}] ${message}`);
            
            // 如果禁用了通知，只输出到控制台
            if (window.DISABLE_ALL_NOTIFICATIONS || window.DISABLE_SYNC_NOTIFICATIONS) {
                return;
            }
            
            // 创建通知元素
            const notification = document.createElement('div');
            notification.className = `firebase-notification firebase-notification-${type}`;
            
            // 根据类型选择颜色
            const colors = {
                success: '#4caf50',
                error: '#f44336',
                warning: '#ff9800',
                info: '#2196f3'
            };
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type] || colors.info};
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10001;
                font-size: 14px;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // 自动移除
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
    }
    
    // 全局初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.firebaseSync = new FirebaseDatabaseSync();
        });
    } else {
            window.firebaseSync = new FirebaseDatabaseSync();
    }
    
})();

// 添加通知动画样式
if (!document.getElementById('firebase-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'firebase-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
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
}

console.log('✅ Firebase数据库同步系统（修复版）已加载');
