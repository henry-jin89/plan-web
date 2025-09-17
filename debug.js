/**
 * 调试和错误处理脚本
 * 提供全面的错误监控和调试信息
 */

console.log('🐛 启动调试脚本...');

// 创建调试命名空间
window.DEBUG = {
    enabled: true,
    errors: [],
    warnings: [],
    logs: []
};

// 增强的控制台日志
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    if (window.DEBUG.enabled) {
        window.DEBUG.logs.push({
            type: 'log',
            message: args.join(' '),
            timestamp: new Date().toISOString()
        });
    }
    originalLog.apply(console, args);
};

console.error = function(...args) {
    window.DEBUG.errors.push({
        type: 'error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
    });
    originalError.apply(console, args);
};

console.warn = function(...args) {
    window.DEBUG.warnings.push({
        type: 'warning',
        message: args.join(' '),
        timestamp: new Date().toISOString()
    });
    originalWarn.apply(console, args);
};

// 全局错误捕获
window.addEventListener('error', function(event) {
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.stack : null,
        timestamp: new Date().toISOString()
    };
    
    window.DEBUG.errors.push(errorInfo);
    console.error('🚨 全局JavaScript错误:', errorInfo);
    
    // 不阻止页面继续运行
    return false;
});

// Promise错误捕获
window.addEventListener('unhandledrejection', function(event) {
    const errorInfo = {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
    };
    
    window.DEBUG.errors.push(errorInfo);
    console.error('🚨 未处理的Promise拒绝:', errorInfo);
    
    // 防止错误传播
    event.preventDefault();
});

// 资源加载错误监控
document.addEventListener('DOMContentLoaded', function() {
    // 监控脚本加载错误
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        script.addEventListener('error', function() {
            const errorInfo = {
                type: 'script_load_error',
                src: script.src,
                timestamp: new Date().toISOString()
            };
            window.DEBUG.errors.push(errorInfo);
            console.error('❌ 脚本加载失败:', script.src);
        });
    });
    
    // 监控样式表加载错误
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        link.addEventListener('error', function() {
            const errorInfo = {
                type: 'css_load_error',
                href: link.href,
                timestamp: new Date().toISOString()
            };
            window.DEBUG.errors.push(errorInfo);
            console.error('❌ 样式表加载失败:', link.href);
        });
    });
});

// 调试工具函数
window.DEBUG.getErrorSummary = function() {
    return {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        recentErrors: this.errors.slice(-5),
        recentWarnings: this.warnings.slice(-5)
    };
};

window.DEBUG.clearLogs = function() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
    console.log('🧹 调试日志已清除');
};

window.DEBUG.exportLogs = function() {
    const debugData = {
        errors: this.errors,
        warnings: this.warnings,
        logs: this.logs.slice(-100), // 只导出最近100条日志
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📁 调试日志已导出');
};

// 性能监控
window.DEBUG.performance = {
    start: function(label) {
        performance.mark(`${label}-start`);
    },
    
    end: function(label) {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
    }
};

// 内存使用监控
window.DEBUG.checkMemory = function() {
    if (performance.memory) {
        const memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
        console.log('🧠 内存使用情况:', memory);
        return memory;
    } else {
        console.log('ℹ️ 浏览器不支持内存监控');
        return null;
    }
};

// 依赖检查工具
window.DEBUG.checkDependencies = function() {
    const dependencies = [
        'StorageUtils',
        'DateUtils',
        'TodoUtils',
        'MessageUtils',
        'ModalUtils',
        'ProgressUtils',
        'KeyboardUtils'
    ];
    
    const status = {};
    dependencies.forEach(dep => {
        status[dep] = window[dep] ? '✅' : '❌';
    });
    
    console.table(status);
    return status;
};

// DOM状态检查
window.DEBUG.checkDOM = function() {
    const info = {
        readyState: document.readyState,
        elementsCount: document.querySelectorAll('*').length,
        scriptsCount: document.querySelectorAll('script').length,
        stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length,
        imagesCount: document.querySelectorAll('img').length
    };
    
    console.log('📄 DOM状态:', info);
    return info;
};

// 本地存储状态检查
window.DEBUG.checkStorage = function() {
    try {
        const storageInfo = {
            available: typeof Storage !== 'undefined',
            itemsCount: localStorage.length,
            estimatedSize: JSON.stringify(localStorage).length
        };
        
        // 检查计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
        planTypes.forEach(type => {
            const key = `planData_${type}`;
            const data = localStorage.getItem(key);
            storageInfo[`${type}Plans`] = data ? Object.keys(JSON.parse(data)).length : 0;
        });
        
        console.log('💾 存储状态:', storageInfo);
        return storageInfo;
    } catch (error) {
        console.error('❌ 检查存储状态失败:', error);
        return { error: error.message };
    }
};

// 网络状态监控
window.DEBUG.networkStatus = {
    online: navigator.onLine,
    connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
};

window.addEventListener('online', function() {
    window.DEBUG.networkStatus.online = true;
    console.log('🌐 网络已连接');
});

window.addEventListener('offline', function() {
    window.DEBUG.networkStatus.online = false;
    console.log('📵 网络已断开');
});

// 自动诊断函数
window.DEBUG.diagnose = function() {
    console.log('🔍 开始自动诊断...');
    
    const report = {
        timestamp: new Date().toISOString(),
        dependencies: this.checkDependencies(),
        dom: this.checkDOM(),
        storage: this.checkStorage(),
        memory: this.checkMemory(),
        network: this.networkStatus,
        errors: this.getErrorSummary(),
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
    
    console.log('📋 诊断报告:', report);
    return report;
};

// 页面加载完成后的自动检查
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🔍 执行自动诊断检查...');
        window.DEBUG.diagnose();
        
        // 如果发现严重错误，提供修复建议
        if (window.DEBUG.errors.length > 0) {
            console.warn('⚠️ 发现错误，建议刷新页面或检查网络连接');
        }
    }, 3000);
});

// 快捷键：Ctrl+Shift+D 打开调试面板
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.DEBUG.showDebugPanel();
    }
});

// 简单的调试面板
window.DEBUG.showDebugPanel = function() {
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        max-height: 400px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    
    const report = this.diagnose();
    panel.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; color: #ffff00;">
            🐛 调试面板
            <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: #ff0000; color: white; border: none; padding: 2px 6px; border-radius: 3px;">×</button>
        </div>
        <div>错误: ${report.errors.totalErrors}</div>
        <div>警告: ${report.errors.totalWarnings}</div>
        <div>内存: ${report.memory ? report.memory.used + 'MB' : 'N/A'}</div>
        <div>网络: ${report.network.online ? '在线' : '离线'}</div>
        <div style="margin-top: 10px;">
            <button onclick="window.DEBUG.clearLogs()" style="margin: 2px; padding: 4px 8px; background: #333; color: white; border: none; border-radius: 3px;">清除日志</button>
            <button onclick="window.DEBUG.exportLogs()" style="margin: 2px; padding: 4px 8px; background: #333; color: white; border: none; border-radius: 3px;">导出日志</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 3秒后自动关闭
    setTimeout(() => {
        if (panel.parentElement) {
            panel.remove();
        }
    }, 10000);
};

console.log('✅ 调试脚本初始化完成');
console.log('💡 使用 Ctrl+Shift+D 打开调试面板');
console.log('💡 使用 window.DEBUG.diagnose() 进行诊断');
