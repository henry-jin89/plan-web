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
                
                // 动态加载Firebase SDK
                await this.loadFirebaseSDK();
                
                // 初始化Firebase应用
                this.app = window.firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase应用初始化成功');
                
                // 初始化Firestore数据库
                this.db = window.firebase.firestore();
                console.log('✅ Firestore数据库连接成功');
                
                // 初始化认证
                this.auth = window.firebase.auth();
                
                // 匿名登录
                await this.signInAnonymously();
                
                // 设置自动同步
                this.setupAutoSync();
                
                // 尝试恢复云端数据
                await this.restoreFromDatabase();
                
                this.isInitialized = true;
                this.isEnabled = true;
                
                console.log('✅ Firebase数据库同步初始化完成');
                this.showNotification('🔥 Firebase数据库同步已启用', 'success');
                
            } catch (error) {
                console.error('❌ Firebase初始化失败:', error);
                this.fallbackToLocal();
            }
        }
        
        async loadFirebaseSDK() {
            console.log('📦 加载Firebase SDK...');
            
            if (window.firebase) {
                console.log('✅ Firebase SDK已存在');
                return;
            }
            
            // 加载Firebase核心 - 更新到最新版本12.3.0
            await this.loadScript('https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js');
            
            // 加载Firestore
            await this.loadScript('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore-compat.js');
            
            // 加载认证
            await this.loadScript('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth-compat.js');
            
            console.log('✅ Firebase SDK加载完成');
        }
        
        loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
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
                    
                    await this.mergeCloudData(cloudData);
                    this.showNotification('📥 已从Firebase恢复数据', 'success');
                    
                    // 触发页面刷新
                    window.location.reload();
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
        
        fallbackToLocal() {
            console.log('📱 回退到本地存储模式');
            this.isEnabled = false;
            this.showNotification('使用本地存储模式', 'info');
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
