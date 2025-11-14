// 同步修复工具
// 修复常见的跨设备同步问题

console.log('🔧 同步修复工具已加载');

// 同步状态检测和修复
window.SyncFixer = {
    // 检查同步服务状态
    checkSyncStatus: function() {
        if (typeof window.syncService === 'undefined') {
            console.warn('⚠️ 同步服务未加载');
            return false;
        }
        
        const status = window.syncService.getSyncStatus();
        if (!status.enabled) {
            console.warn('⚠️ 同步服务未启用');
            return false;
        }
        
        console.log('✅ 同步服务正常');
        return true;
    },

    // 强制重新初始化同步
    reinitializeSync: function() {
        console.log('🔄 重新初始化同步服务...');
        
        if (window.syncService && typeof window.syncService.init === 'function') {
            try {
                window.syncService.init();
                console.log('✅ 同步服务重新初始化完成');
            } catch (error) {
                console.error('❌ 同步服务重新初始化失败:', error);
            }
        } else {
            console.warn('⚠️ 无法重新初始化同步服务');
        }
    },

    // 修复数据键不一致问题
    fixDataKeys: function() {
        console.log('🔧 检查并修复数据键...');
        
        const keys = ['monthlyEvents', 'weekPlan', 'dayPlan', 'habitTrackerData'];
        
        keys.forEach(key => {
            const localData = localStorage.getItem(key);
            const cloudKey = 'planData_' + key;
            const cloudData = localStorage.getItem(cloudKey);
            
            if (localData && !cloudData) {
                console.log(`🔄 同步 ${key} 到云键 ${cloudKey}`);
                localStorage.setItem(cloudKey, localData);
            } else if (!localData && cloudData) {
                console.log(`🔄 恢复 ${key} 从云键 ${cloudKey}`);
                localStorage.setItem(key, cloudData);
            }
        });
        
        console.log('✅ 数据键检查完成');
    },

    // 诊断同步问题
    diagnosSync: function() {
        console.log('🔍 开始同步诊断...');
        
        // 检查网络连接
        if (!navigator.onLine) {
            console.error('❌ 网络连接异常');
            return false;
        }
        
        // 检查 localStorage 可用性
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            console.error('❌ localStorage 不可用:', error);
            return false;
        }
        
        // 检查同步服务
        if (!this.checkSyncStatus()) {
            return false;
        }
        
        // 检查数据键
        this.fixDataKeys();
        
        console.log('✅ 同步诊断完成');
        return true;
    },

    // 自动修复常见问题
    autoFix: function() {
        console.log('🛠️ 启动自动修复...');
        
        // 等待页面完全加载
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => {
                setTimeout(() => this.autoFix(), 1000);
            });
            return;
        }
        
        // 诊断并修复
        if (this.diagnosSync()) {
            console.log('✅ 自动修复完成');
        } else {
            console.log('⚠️ 需要手动检查同步配置');
        }
    }
};

// 页面加载后自动运行修复
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.SyncFixer.autoFix();
    }, 2000);
});

console.log('✅ 同步修复工具初始化完成');
