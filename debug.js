/**
 * 调试和错误处理脚本
 * 帮助诊断和解决常见问题
 */

// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('❌ 全局JavaScript错误:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // 显示用户友好的错误信息
    showUserFriendlyError('页面出现了一些问题，但不影响基本功能的使用。');
});

// Promise错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ 未处理的Promise拒绝:', event.reason);
    
    // 显示用户友好的错误信息
    showUserFriendlyError('某些后台功能可能暂时不可用，请稍后重试。');
});

// 显示用户友好的错误信息
function showUserFriendlyError(message) {
    // 避免重复显示错误
    if (window.lastErrorTime && Date.now() - window.lastErrorTime < 5000) {
        return;
    }
    window.lastErrorTime = Date.now();
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff5722;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // 显示动画
    setTimeout(() => {
        errorDiv.style.opacity = '1';
        errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // 5秒后自动隐藏
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 5000);
}

// 调试工具
window.DEBUG = {
    // 检查应用状态
    checkAppStatus: function() {
        console.log('=== 应用状态检查 ===');
        console.log('初始化状态:', window.APP_INIT || '未初始化');
        console.log('StorageUtils:', typeof window.StorageUtils);
        console.log('DateUtils:', typeof window.DateUtils);
        console.log('TodoUtils:', typeof window.TodoUtils);
        console.log('SyncService:', typeof window.SyncService);
        console.log('BackupHelper:', typeof window.BackupHelper);
        console.log('同步服务实例:', window.syncService ? '已创建' : '未创建');
        console.log('备份助手实例:', window.backupHelper ? '已创建' : '未创建');
        console.log('==================');
    },
    
    // 测试本地存储
    testStorage: function() {
        try {
            const testKey = 'debug_test_' + Date.now();
            const testValue = { test: true, timestamp: new Date().toISOString() };
            
            localStorage.setItem(testKey, JSON.stringify(testValue));
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            localStorage.removeItem(testKey);
            
            console.log('✅ 本地存储测试通过');
            return true;
        } catch (error) {
            console.error('❌ 本地存储测试失败:', error);
            return false;
        }
    },
    
    // 清理和重置
    reset: function() {
        if (confirm('确定要清理所有数据并重置应用吗？这将删除所有本地数据！')) {
            try {
                // 清理localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('plan') || key.startsWith('sync') || key.startsWith('backup')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                console.log('✅ 数据已清理');
                alert('数据已清理完成，页面将刷新');
                window.location.reload();
            } catch (error) {
                console.error('❌ 重置失败:', error);
                alert('重置失败: ' + error.message);
            }
        }
    },
    
    // 导出调试信息
    exportDebugInfo: function() {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            appInit: window.APP_INIT,
            localStorage: {},
            errors: []
        };
        
        // 收集localStorage数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                debugInfo.localStorage[key] = localStorage.getItem(key);
            } catch (error) {
                debugInfo.errors.push(`无法读取localStorage[${key}]: ${error.message}`);
            }
        }
        
        // 创建下载
        const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug_info_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 调试信息已导出');
    }
};

// 在控制台显示调试提示
console.log('%c🔧 调试工具已加载', 'color: #2196f3; font-size: 16px; font-weight: bold;');
console.log('%c使用 DEBUG.checkAppStatus() 检查应用状态', 'color: #4caf50;');
console.log('%c使用 DEBUG.testStorage() 测试本地存储', 'color: #4caf50;');
console.log('%c使用 DEBUG.reset() 重置应用数据', 'color: #ff9800;');
console.log('%c使用 DEBUG.exportDebugInfo() 导出调试信息', 'color: #9c27b0;');
