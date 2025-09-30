/**
 * Firebase数据库同步系统
 * 使用您的Firebase配置实现真正的跨设备数据同步
 */

(function() {
    'use strict';
    
    console.log('🔥 加载Firebase数据库同步系统...');
    
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
                // 生成本地用户ID作为备用
                this.userId = 'local_' + this.generateLocalUserId();
            }
        }
        
        generateLocalUserId() {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset()
            ].join('|');
            
            // 简单哈希函数
            let hash = 0;
            for (let i = 0; i < components.length; i++) {
                const char = components.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 转换为32位整数
            }
            
            return Math.abs(hash).toString(16);
        }
        
        setupAutoSync() {
            console.log('⚙️ 设置自动同步监听器...');
            
            // 监听localStorage变化（防止重复绑定）
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
                    // 同步执行最后一次同步
                    this.syncToDatabase(true);
                }
            });
            
            // 定期同步
            setInterval(() => {
                if (this.isEnabled && navigator.onLine && !this.syncInProgress) {
                    this.syncToDatabase();
                }
            }, 30000); // 每30秒同步一次
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
                    userId: this.userId,
                    data: planData,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                    lastModified: new Date().toISOString(),
                    version: '1.0',
                    deviceInfo: {
                        userAgent: navigator.userAgent.substring(0, 100),
                        language: navigator.language,
                        platform: navigator.platform
                    }
                };
                
                // 保存到Firestore
                const docRef = this.db.collection('planData').doc(this.userId);
                
                if (isSync) {
                    // 同步操作，不等待结果
                    docRef.set(syncPackage, { merge: true });
                } else {
                    // 异步操作，等待结果
                    await docRef.set(syncPackage, { merge: true });
                }
                
                this.lastSync = new Date().toISOString();
                localStorage.setItem('lastFirebaseSync', this.lastSync);
                
                console.log('✅ Firebase数据库同步成功');
                this.showNotification('🔥 数据已同步到Firebase', 'success');
                
            } catch (error) {
                console.error('❌ Firebase同步失败:', error);
                this.handleSyncError(error);
            } finally {
                this.syncInProgress = false;
            }
        }
        
        collectAllPlanData() {
            const planData = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('planData_')) {
                    try {
                        planData[key] = JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        console.warn(`数据解析失败: ${key}`, error);
                    }
                }
            }
            
            return planData;
        }
        
        async restoreFromDatabase() {
            if (!this.userId) return;
            
            try {
                console.log('🔍 从Firebase数据库恢复数据...');
                
                const docRef = this.db.collection('planData').doc(this.userId);
                const doc = await docRef.get();
                
                if (doc.exists) {
                    const cloudData = doc.data();
                    console.log('📥 发现云端数据，正在恢复...');
                    
                    await this.mergeCloudData(cloudData);
                    this.showNotification('📥 已从Firebase恢复数据', 'success');
                } else {
                    console.log('☁️ Firebase中暂无数据，使用本地数据');
                }
                
            } catch (error) {
                console.warn('Firebase数据恢复失败:', error);
            }
        }
        
        async mergeCloudData(cloudData) {
            if (!cloudData.data) return;
            
            const localTimestamp = new Date(localStorage.getItem('lastDataUpdate') || 0);
            const cloudTimestamp = new Date(cloudData.lastModified || 0);
            
            // 如果云端数据更新，则合并
            if (cloudTimestamp > localTimestamp) {
                console.log('📥 合并Firebase云端数据...');
                
                let mergedCount = 0;
                for (const [key, value] of Object.entries(cloudData.data)) {
                    localStorage.setItem(key, JSON.stringify(value));
                    mergedCount++;
                }
                
                localStorage.setItem('lastDataUpdate', cloudData.lastModified);
                
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
        }
        
        handleSyncError(error) {
            if (error.code === 'permission-denied') {
                console.warn('Firebase权限被拒绝，可能需要重新认证');
                this.signInAnonymously();
            } else if (error.code === 'unavailable') {
                console.warn('Firebase服务暂时不可用，稍后重试');
                setTimeout(() => this.syncToDatabase(), 10000);
            } else {
                console.warn('Firebase同步错误:', error.message);
            }
        }
        
        fallbackToLocal() {
            console.log('⚠️ Firebase不可用，降级到本地存储');
            this.isEnabled = false;
            this.showNotification('⚠️ Firebase暂时不可用，使用本地存储', 'warning');
        }
        
        showNotification(message, type = 'info') {
            if (window.DISABLE_ALL_NOTIFICATIONS) {
                console.log(`[Firebase通知] ${message}`);
                return;
            }
            
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 9999;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            requestAnimationFrame(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            });
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }
        
        // 公共API
        getStatus() {
            return {
                initialized: this.isInitialized,
                enabled: this.isEnabled,
                userId: this.userId?.substring(0, 8) + '...',
                lastSync: this.lastSync,
                syncInProgress: this.syncInProgress
            };
        }
        
        async forceSync() {
            console.log('🔄 执行强制Firebase同步...');
            await this.syncToDatabase();
        }
        
        async forceRestore() {
            console.log('📥 执行强制数据恢复...');
            await this.restoreFromDatabase();
        }
        
        disable() {
            this.isEnabled = false;
            if (this.syncTimer) clearTimeout(this.syncTimer);
            console.log('🛑 Firebase数据库同步已禁用');
        }
        
        // 清除所有云端数据（谨慎使用）
        async clearCloudData() {
            if (!this.userId || !confirm('确定要清除所有云端数据吗？此操作不可恢复！')) {
                return;
            }
            
            try {
                await this.db.collection('planData').doc(this.userId).delete();
                console.log('✅ 云端数据已清除');
                this.showNotification('🗑️ 云端数据已清除', 'warning');
            } catch (error) {
                console.error('清除云端数据失败:', error);
            }
        }
    }
    
    // 初始化Firebase数据库同步
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.firebaseSync = new FirebaseDatabaseSync();
        });
    } else {
        setTimeout(() => {
            window.firebaseSync = new FirebaseDatabaseSync();
        }, 1000);
    }
    
    console.log('✅ Firebase数据库同步模块加载完成');
    
})();
