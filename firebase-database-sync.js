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
            
            try {
                // 使用更稳定的版本 9.23.0（移动端兼容性更好）
                const version = '9.23.0';
                const baseUrl = 'https://www.gstatic.com/firebasejs';
                console.log(`📦 使用Firebase SDK版本: ${version}`);
            
            // 加载Firebase核心
                console.log('📦 加载 firebase-app...');
                await this.loadScript(`${baseUrl}/${version}/firebase-app-compat.js`);
                console.log('✅ firebase-app 加载完成');
                
                // 验证firebase对象已创建
                if (!window.firebase) {
                    throw new Error('Firebase对象未创建');
                }
            
            // 加载Firestore
                console.log('📦 加载 firebase-firestore...');
                await this.loadScript(`${baseUrl}/${version}/firebase-firestore-compat.js`);
                console.log('✅ firebase-firestore 加载完成');
            
            // 加载认证
                console.log('📦 加载 firebase-auth...');
                await this.loadScript(`${baseUrl}/${version}/firebase-auth-compat.js`);
                console.log('✅ firebase-auth 加载完成');
                
                console.log('✅ Firebase SDK全部加载完成');
                
            } catch (error) {
                console.error('❌ Firebase SDK加载失败:', error);
                throw new Error(`SDK加载失败: ${error.message}`);
            }
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
        
        async restoreFromDatabase() {
            if (!this.userId) return;
            
            try {
                console.log('🔍 从Firebase数据库恢复数据...');
                
                // 使用固定的共享ID
                const docRef = this.db.collection('planData').doc(this.sharedUserId);
                const doc = await docRef.get();
                
                if (doc.exists) {
                    const cloudData = doc.data();
                    console.log('📥 发现云端数据，正在恢复...');
                    
                    // 检查是否需要恢复数据
                    const lastLocalUpdate = localStorage.getItem('lastDataUpdate');
                    const cloudLastModified = cloudData.lastModified;
                    
                    // 只有云端数据更新时才恢复，避免重复刷新
                    if (!lastLocalUpdate || cloudLastModified > lastLocalUpdate) {
                    await this.mergeCloudData(cloudData);
                    this.showNotification('📥 已从Firebase恢复数据', 'success');
                        console.log('✅ 数据恢复完成，无需刷新页面');
                    } else {
                        console.log('✅ 本地数据已是最新，无需恢复');
                    }
                } else {
                    console.log('☁️ Firebase中暂无数据，使用本地数据');
                    // 首次使用，将本地数据同步到云端
                    await this.syncToDatabase();
                }
                
            } catch (error) {
                console.warn('Firebase数据恢复失败:', error);
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
        
        showNotification(message, type = 'info') {
            if (window.DISABLE_ALL_NOTIFICATIONS || window.DISABLE_SYNC_NOTIFICATIONS) {
                console.log(`[通知-${type}]:`, message);
                return;
            }
            console.log(`📢 ${message}`);
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

console.log('✅ Firebase数据库同步系统（修复版）已加载');
