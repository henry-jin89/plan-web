/**
 * 应用初始化脚本
 * 确保所有依赖正确加载和初始化
 */

// 初始化状态跟踪
window.APP_INIT = {
    loaded: false,
    errors: [],
    dependencies: {
        common: false,
        config: false,
        backup: false
    }
};

// 安全的初始化函数
function safeInit() {
    console.log('🚀 开始应用初始化...');
    
    try {
        // 检查必要的全局对象
        if (!window.StorageUtils) {
            console.error('❌ StorageUtils未加载');
            window.APP_INIT.errors.push('StorageUtils未加载');
        } else {
            console.log('✅ StorageUtils已加载');
        }
        
        if (!window.DateUtils) {
            console.error('❌ DateUtils未加载');
            window.APP_INIT.errors.push('DateUtils未加载');
        } else {
            console.log('✅ DateUtils已加载');
        }
        
        if (!window.TodoUtils) {
            console.error('❌ TodoUtils未加载');
            window.APP_INIT.errors.push('TodoUtils未加载');
        } else {
            console.log('✅ TodoUtils已加载');
        }
        
        // 初始化备份助手（如果存在）
        if (window.BackupHelper) {
            try {
                window.backupHelper = new BackupHelper();
                console.log('✅ 备份助手初始化成功');
            } catch (error) {
                console.warn('⚠️ 备份助手初始化失败:', error);
            }
        }
        
        // 延迟初始化同步服务
        setTimeout(() => {
            if (window.SyncService) {
                try {
                    window.syncService = new SyncService();
                    console.log('✅ 同步服务初始化成功');
                } catch (error) {
                    console.warn('⚠️ 同步服务初始化失败:', error);
                }
            }
        }, 2000);
        
        // 标记初始化完成
        window.APP_INIT.loaded = true;
        console.log('✅ 应用初始化完成');
        
        // 如果有错误，显示警告但不阻止应用运行
        if (window.APP_INIT.errors.length > 0) {
            console.warn('⚠️ 初始化过程中发现问题:', window.APP_INIT.errors);
            console.log('📝 应用将继续运行，但某些功能可能不可用');
        }
        
    } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        window.APP_INIT.errors.push(error.message);
    }
}

// 确保DOM加载完成后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

// 导出初始化状态检查函数
window.checkInitStatus = function() {
    return {
        loaded: window.APP_INIT.loaded,
        errors: window.APP_INIT.errors,
        hasErrors: window.APP_INIT.errors.length > 0
    };
};

// 提供重新初始化功能
window.reinitialize = function() {
    window.APP_INIT.loaded = false;
    window.APP_INIT.errors = [];
    safeInit();
};
