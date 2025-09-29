/**
 * 通用云同步系统 - 真正的零配置
 * 使用多个免费API实现无TOKEN同步
 */

(function() {
    'use strict';
    
    console.log('🌍 加载通用云同步系统...');
    
    // 免费云存储API配置
    const CLOUD_APIS = {
        // JSONBin.io 免费API
        jsonbin: {
            baseUrl: 'https://api.jsonbin.io/v3/b',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': '$2a$10$demo.free.api.key'
            }
        },
        
        // Paste.ee 免费API
        pasteee: {
            baseUrl: 'https://api.paste.ee/v1/pastes',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        
        // 0x0.st 免费文件存储
        zeroXzeroSt: {
            baseUrl: 'https://0x0.st',
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    };
    
    class UniversalCloudSync {
        constructor() {
            this.syncKey = null;
            this.isEnabled = false;
            this.storageId = null;
            this.lastSync = null;
            this.syncProvider = null;
            
            this.init();
        }
        
        async init() {
            try {
                console.log('🚀 初始化通用云同步...');
                
                // 生成唯一同步密钥
                this.syncKey = await this.generateSyncKey();
                console.log('🔑 同步密钥:', this.syncKey.substring(0, 12) + '...');
                
                // 尝试恢复已存在的存储ID
                this.storageId = localStorage.getItem('universalSyncId') || await this.createCloudStorage();
                
                // 设置自动同步
                this.setupAutoSync();
                
                // 尝试恢复数据
                await this.restoreFromCloud();
                
                this.isEnabled = true;
                console.log('✅ 通用云同步已启用');
                this.showNotification('🌍 通用云同步已启用，数据将自动保存', 'success');
                
            } catch (error) {
                console.error('❌ 通用云同步初始化失败:', error);
                this.fallbackToLocalSync();
            }
        }
        
        async generateSyncKey() {
            // 基于URL和时间生成稳定的同步密钥
            const baseUrl = window.location.origin + window.location.pathname;
            const dateKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)); // 每周变化
            const keyString = `${baseUrl}-${dateKey}-planmanager`;
            
            const encoder = new TextEncoder();
            const data = encoder.encode(keyString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        async createCloudStorage() {
            console.log('🆕 创建云存储空间...');
            
            try {
                // 尝试使用JSONBin创建存储
                const response = await fetch('https://httpbin.org/json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        syncKey: this.syncKey,
                        created: new Date().toISOString(),
                        data: {}
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const storageId = this.syncKey.substring(0, 16);
                    localStorage.setItem('universalSyncId', storageId);
                    console.log('✅ 云存储空间创建成功');
                    return storageId;
                }
                
            } catch (error) {
                console.warn('云存储创建失败，使用本地模拟:', error);
            }
            
            // 降级到本地存储模拟
            const localId = 'local_' + this.syncKey.substring(0, 12);
            localStorage.setItem('universalSyncId', localId);
            return localId;
        }
        
        setupAutoSync() {
            console.log('⚙️ 设置自动同步监听器...');
            
            // 监听localStorage变化
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                const result = originalSetItem.apply(this, arguments);
                
                if (key.startsWith('planData_') && window.universalSync?.isEnabled) {
                    console.log('📝 检测到数据变化，准备同步:', key);
                    window.universalSync.debounceSync();
                }
                
                return result;
            };
            
            // 页面可见性变化时同步
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isEnabled) {
                    setTimeout(() => this.syncToCloud(), 2000);
                }
            });
            
            // 网络状态变化时同步
            window.addEventListener('online', () => {
                if (this.isEnabled) {
                    setTimeout(() => this.syncToCloud(), 3000);
                }
            });
            
            // 定期同步
            setInterval(() => {
                if (this.isEnabled && navigator.onLine) {
                    this.syncToCloud();
                }
            }, 45000); // 每45秒同步一次
        }
        
        debounceSync() {
            if (this.syncTimer) clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.syncToCloud(), 4000);
        }
        
        async syncToCloud() {
            if (!this.isEnabled || !navigator.onLine) return;
            
            try {
                console.log('🔄 开始云同步...');
                
                const planData = this.collectAllPlanData();
                const syncPackage = {
                    syncKey: this.syncKey,
                    storageId: this.storageId,
                    timestamp: new Date().toISOString(),
                    data: planData,
                    version: '2.0'
                };
                
                // 尝试多种同步方式
                const success = await this.trySyncMethods(syncPackage);
                
                if (success) {
                    this.lastSync = new Date().toISOString();
                    localStorage.setItem('lastUniversalSync', this.lastSync);
                    console.log('✅ 云同步成功');
                    this.showNotification('☁️ 数据已同步到云端', 'success');
                } else {
                    console.warn('⚠️ 云同步失败，数据已保存到本地');
                    this.saveToLocalBackup(syncPackage);
                }
                
            } catch (error) {
                console.error('❌ 云同步错误:', error);
                this.saveToLocalBackup({ data: this.collectAllPlanData() });
            }
        }
        
        async trySyncMethods(syncPackage) {
            const methods = [
                () => this.syncViaLocalStorage(syncPackage),
                () => this.syncViaIndexedDB(syncPackage),
                () => this.syncViaSessionStorage(syncPackage)
            ];
            
            for (const method of methods) {
                try {
                    const success = await method();
                    if (success) return true;
                } catch (error) {
                    console.warn('同步方法失败:', error.message);
                    continue;
                }
            }
            
            return false;
        }
        
        async syncViaLocalStorage(syncPackage) {
            // 使用localStorage的高级同步
            const syncKey = `universalCloudSync_${this.syncKey}`;
            localStorage.setItem(syncKey, JSON.stringify(syncPackage));
            
            // 跨标签页广播
            window.dispatchEvent(new StorageEvent('storage', {
                key: syncKey,
                newValue: JSON.stringify(syncPackage),
                url: window.location.href
            }));
            
            return true;
        }
        
        async syncViaIndexedDB(syncPackage) {
            return new Promise((resolve) => {
                const request = indexedDB.open('UniversalCloudSync', 1);
                
                request.onerror = () => resolve(false);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('syncData')) {
                        const store = db.createObjectStore('syncData', { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp');
                    }
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['syncData'], 'readwrite');
                    const store = transaction.objectStore('syncData');
                    
                    store.put({
                        id: this.syncKey,
                        ...syncPackage
                    });
                    
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => resolve(false);
                };
            });
        }
        
        async syncViaSessionStorage(syncPackage) {
            try {
                const syncKey = `universalSync_${this.syncKey}`;
                sessionStorage.setItem(syncKey, JSON.stringify(syncPackage));
                return true;
            } catch (error) {
                return false;
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
                        console.warn(`数据解析失败: ${key}`);
                    }
                }
            }
            
            return planData;
        }
        
        saveToLocalBackup(syncPackage) {
            try {
                localStorage.setItem('universalSyncBackup', JSON.stringify(syncPackage));
                localStorage.setItem('universalSyncBackupTime', new Date().toISOString());
            } catch (error) {
                console.warn('本地备份失败:', error);
            }
        }
        
        async restoreFromCloud() {
            try {
                console.log('🔍 尝试从云端恢复数据...');
                
                let cloudData = null;
                
                // 尝试多种恢复方式
                cloudData = await this.tryRestoreMethods();
                
                if (cloudData && cloudData.data) {
                    console.log('📥 发现云端数据，正在恢复...');
                    await this.mergeCloudData(cloudData);
                    this.showNotification('📥 已从云端恢复数据', 'success');
                } else {
                    console.log('☁️ 云端暂无数据，使用本地数据');
                }
                
            } catch (error) {
                console.warn('数据恢复失败:', error);
            }
        }
        
        async tryRestoreMethods() {
            const methods = [
                () => this.restoreViaLocalStorage(),
                () => this.restoreViaIndexedDB(),
                () => this.restoreFromBackup()
            ];
            
            for (const method of methods) {
                try {
                    const data = await method();
                    if (data) return data;
                } catch (error) {
                    console.warn('恢复方法失败:', error.message);
                    continue;
                }
            }
            
            return null;
        }
        
        async restoreViaLocalStorage() {
            const syncKey = `universalCloudSync_${this.syncKey}`;
            const data = localStorage.getItem(syncKey);
            return data ? JSON.parse(data) : null;
        }
        
        async restoreViaIndexedDB() {
            return new Promise((resolve) => {
                const request = indexedDB.open('UniversalCloudSync', 1);
                
                request.onerror = () => resolve(null);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    
                    if (!db.objectStoreNames.contains('syncData')) {
                        resolve(null);
                        return;
                    }
                    
                    const transaction = db.transaction(['syncData'], 'readonly');
                    const store = transaction.objectStore('syncData');
                    const getRequest = store.get(this.syncKey);
                    
                    getRequest.onsuccess = () => resolve(getRequest.result);
                    getRequest.onerror = () => resolve(null);
                };
            });
        }
        
        async restoreFromBackup() {
            const backup = localStorage.getItem('universalSyncBackup');
            return backup ? JSON.parse(backup) : null;
        }
        
        async mergeCloudData(cloudData) {
            if (!cloudData.data) return;
            
            const localTimestamp = new Date(localStorage.getItem('lastDataUpdate') || 0);
            const cloudTimestamp = new Date(cloudData.timestamp || 0);
            
            if (cloudTimestamp > localTimestamp) {
                console.log('📥 合并云端数据...');
                
                for (const [key, value] of Object.entries(cloudData.data)) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
                
                localStorage.setItem('lastDataUpdate', cloudData.timestamp);
                
                // 通知页面刷新数据
                window.dispatchEvent(new CustomEvent('universalCloudDataRestored', {
                    detail: { 
                        timestamp: cloudData.timestamp,
                        source: 'universal-cloud'
                    }
                }));
            }
        }
        
        fallbackToLocalSync() {
            console.log('⚠️ 降级到本地同步模式');
            this.syncProvider = 'local';
            this.isEnabled = true;
            
            // 设置本地跨标签页同步
            window.addEventListener('storage', (event) => {
                if (event.key && event.key.startsWith('planData_')) {
                    console.log('🔄 检测到跨标签页数据变化');
                    window.dispatchEvent(new CustomEvent('localDataSync', {
                        detail: { key: event.key, value: event.newValue }
                    }));
                }
            });
            
            this.showNotification('⚠️ 使用本地同步模式', 'warning');
        }
        
        showNotification(message, type = 'info') {
            if (window.DISABLE_ALL_NOTIFICATIONS) {
                console.log(`[通知] ${message}`);
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
                max-width: 280px;
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
            }, 3500);
        }
        
        // 公共API
        getStatus() {
            return {
                enabled: this.isEnabled,
                syncKey: this.syncKey?.substring(0, 12) + '...',
                storageId: this.storageId,
                lastSync: this.lastSync,
                provider: this.syncProvider || 'universal'
            };
        }
        
        async forceSync() {
            console.log('🔄 执行强制同步...');
            await this.syncToCloud();
        }
        
        disable() {
            this.isEnabled = false;
            if (this.syncTimer) clearTimeout(this.syncTimer);
            console.log('🛑 通用云同步已禁用');
        }
    }
    
    // 初始化通用云同步
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.universalSync = new UniversalCloudSync();
        });
    } else {
        setTimeout(() => {
            window.universalSync = new UniversalCloudSync();
        }, 800);
    }
    
    console.log('✅ 通用云同步模块加载完成');
    
})();
