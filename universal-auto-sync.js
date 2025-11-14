// 通用自动同步服务
// 监听所有页面的数据变化并自动同步

console.log('🔄 通用自动同步服务初始化...');

// 通用同步管理器
window.UniversalSync = {
    initialized: false,
    syncInterval: null,
    pendingSync: false,
    
    // 初始化自动同步
    init: function() {
        if (this.initialized) {
            console.log('⚠️ 通用同步已初始化');
            return;
        }
        
        console.log('🚀 启动通用自动同步...');
        
        // 等待主同步服务加载
        this.waitForSyncService(() => {
            this.setupAutoSync();
            this.setupPeriodicSync();
            this.initialized = true;
            console.log('✅ 通用自动同步初始化完成');
        });
    },
    
    // 等待同步服务加载
    waitForSyncService: function(callback) {
        if (window.syncService) {
            callback();
        } else {
            console.log('⏳ 等待同步服务加载...');
            setTimeout(() => {
                this.waitForSyncService(callback);
            }, 500);
        }
    },
    
    // 设置自动同步监听
    setupAutoSync: function() {
        // 监听关键数据变化
        const syncKeys = [
            'monthlyEvents',
            'weekPlan', 
            'dayPlan',
            'habitTrackerData',
            'moodData',
            'gratitudeData'
        ];
        
        // 重写 localStorage.setItem 以监听数据变化
        const originalSetItem = localStorage.setItem;
        
        localStorage.setItem = function(key, value) {
            // 调用原始方法
            originalSetItem.call(this, key, value);
            
            // 检查是否需要同步
            if (syncKeys.some(syncKey => key === syncKey || key.startsWith('planData_'))) {
                console.log(`📝 检测到数据变化: ${key}`);
                window.UniversalSync.triggerSync(key);
            }
        };
        
        console.log('✅ 自动同步监听已设置');
    },
    
    // 设置定期同步
    setupPeriodicSync: function() {
        // 每30秒检查一次是否需要同步
        this.syncInterval = setInterval(() => {
            if (!this.pendingSync && navigator.onLine) {
                this.performPeriodicSync();
            }
        }, 30000);
        
        console.log('⏰ 定期同步已启用（30秒间隔）');
    },
    
    // 触发同步
    triggerSync: function(changedKey) {
        if (this.pendingSync) {
            console.log('🔄 同步正在进行中，跳过重复触发');
            return;
        }
        
        this.pendingSync = true;
        
        // 防抖：500ms 后执行同步
        setTimeout(() => {
            this.performSync(changedKey);
        }, 500);
    },
    
    // 执行同步
    performSync: async function(changedKey) {
        if (!window.syncService) {
            console.warn('⚠️ 同步服务不可用');
            this.pendingSync = false;
            return;
        }
        
        try {
            console.log(`🚀 开始同步数据 (触发键: ${changedKey})`);
            
            const status = window.syncService.getSyncStatus();
            if (!status.enabled) {
                console.log('💡 同步未启用，跳过');
                return;
            }
            
            // 执行同步
            await window.syncService.manualSync();
            console.log('✅ 自动同步完成');
            
            // 触发同步完成事件
            document.dispatchEvent(new CustomEvent('auto-sync-complete', {
                detail: { changedKey, timestamp: new Date().toISOString() }
            }));
            
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
            
            // 触发同步失败事件
            document.dispatchEvent(new CustomEvent('auto-sync-error', {
                detail: { error: error.message, changedKey }
            }));
            
        } finally {
            this.pendingSync = false;
        }
    },
    
    // 定期同步检查
    performPeriodicSync: async function() {
        if (!window.syncService) return;
        
        try {
            const status = window.syncService.getSyncStatus();
            if (status.enabled && status.online) {
                // 静默同步，不显示通知
                await window.syncService.manualSync();
                console.log('🔄 定期同步完成');
            }
        } catch (error) {
            console.warn('⚠️ 定期同步失败:', error);
        }
    },
    
    // 手动触发立即同步
    forcSync: async function() {
        console.log('🚀 手动触发强制同步...');
        this.pendingSync = false; // 重置状态
        await this.performSync('manual');
    },
    
    // 停止自动同步
    stop: function() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.initialized = false;
        console.log('🛑 通用自动同步已停止');
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟启动，确保其他脚本先加载
    setTimeout(() => {
        window.UniversalSync.init();
    }, 1000);
});

// 页面卸载前停止同步
window.addEventListener('beforeunload', function() {
    if (window.UniversalSync) {
        window.UniversalSync.stop();
    }
});

// 提供全局访问
window.forceSync = function() {
    if (window.UniversalSync) {
        return window.UniversalSync.forcSync();
    }
};

console.log('✅ 通用自动同步服务已加载');
