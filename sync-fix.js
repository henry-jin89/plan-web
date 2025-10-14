/**
 * 同步修复工具 - 解决跨设备数据同步问题
 * 确保数据在电脑和手机之间正确同步
 */

(function() {
    'use strict';
    
    console.log('🔧 加载同步修复工具...');
    
    // 同步修复工具类
    class SyncFix {
        constructor() {
            this.isRunning = false;
            this.deviceType = this.detectDeviceType();
            this.init();
        }
        
        init() {
            // 等待Firebase初始化完成
            this.waitForFirebase().then(() => {
                this.setupSyncFix();
            });
        }
        
        async waitForFirebase(maxWait = 30000) {
            const startTime = Date.now();
            let lastLog = 0;
            
            while (Date.now() - startTime < maxWait) {
                if (window.firebaseSync && window.firebaseSync.isInitialized) {
                    console.log('✅ Firebase已初始化，开始同步修复');
                    return true;
                }
                
                // 每5秒输出一次等待状态
                const elapsed = Date.now() - startTime;
                if (elapsed - lastLog >= 5000) {
                    console.log(`⏳ 等待Firebase初始化... (${Math.floor(elapsed/1000)}秒/${Math.floor(maxWait/1000)}秒)`);
                    lastLog = elapsed;
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.warn('⚠️ Firebase初始化超时（30秒），使用本地存储');
            console.warn('💡 提示：可能是网络问题或CDN被墙，请检查控制台错误信息');
            return false;
        }
        
        detectDeviceType() {
            const userAgent = navigator.userAgent;
            if (/Mobile|Android|iP(hone|od|ad)|Opera Mini|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(userAgent)) {
                return 'mobile';
            } else if (/Tablet|iPad/.test(userAgent)) {
                return 'tablet';
            } else {
                return 'desktop';
            }
        }
        
        setupSyncFix() {
            console.log(`📱 设备类型: ${this.deviceType}`);
            
            // 移动端特殊处理
            if (this.deviceType === 'mobile') {
                this.fixMobileSync();
            }
            
            // 强制同步检查
            this.forceSyncCheck();
            
            // 定期同步检查
            setInterval(() => {
                this.checkAndSync();
            }, 30000); // 每30秒检查一次
        }
        
        fixMobileSync() {
            // 移动端viewport修复
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
            
            // 移动端触摸优化
            document.body.style.touchAction = 'manipulation';
            
            // 防止页面缩放
            document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
            });
            
            document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
            });
            
            document.addEventListener('gestureend', function(e) {
                e.preventDefault();
            });
        }
        
        async forceSyncCheck() {
            try {
                console.log('🔄 执行强制同步检查...');
                
                // 检查Firebase连接状态
                if (window.firebaseSync && window.firebaseSync.isEnabled) {
                    await window.firebaseSync.forceSync();
                    console.log('✅ Firebase强制同步完成');
                } else {
                    console.log('📱 使用本地存储同步');
                    this.syncLocalData();
                }
                
            } catch (error) {
                console.error('❌ 强制同步失败:', error);
                this.syncLocalData();
            }
        }
        
        syncLocalData() {
            try {
                // 获取所有本地存储的数据
                const allData = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('plan') || key.includes('data') || key.includes('sync'))) {
                        allData[key] = localStorage.getItem(key);
                    }
                }
                
                console.log('📊 本地数据状态:', Object.keys(allData).length, '条记录');
                
                // 触发页面数据刷新
                if (typeof window.loadAllData === 'function') {
                    window.loadAllData();
                }
                
                // 通知其他页面数据更新
                this.notifyDataUpdate();
                
            } catch (error) {
                console.error('❌ 本地数据同步失败:', error);
            }
        }
        
        async checkAndSync() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            
            try {
                // 检查是否有新数据需要同步
                const lastSync = localStorage.getItem('lastSyncTime');
                const now = Date.now();
                
                if (!lastSync || now - parseInt(lastSync) > 60000) { // 1分钟
                    await this.forceSyncCheck();
                    localStorage.setItem('lastSyncTime', now.toString());
                }
                
            } catch (error) {
                console.error('❌ 定期同步检查失败:', error);
            } finally {
                this.isRunning = false;
            }
        }
        
        notifyDataUpdate() {
            // 发送自定义事件通知数据更新
            const event = new CustomEvent('dataUpdated', {
                detail: {
                    timestamp: Date.now(),
                    deviceType: this.deviceType
                }
            });
            
            window.dispatchEvent(event);
            
            // 更新页面显示
            if (typeof window.refreshPageData === 'function') {
                window.refreshPageData();
            }
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new SyncFix();
        });
    } else {
        new SyncFix();
    }
    
    // 导出到全局
    window.SyncFix = SyncFix;
    
})();

console.log('🔧 同步修复工具已加载');
