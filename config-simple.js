/**
 * 简化配置文件 - 无弹窗版本
 * 专为GitHub Pages部署优化
 */

// 全局配置对象
window.APP_CONFIG = {
    // 应用基础信息
    APP_NAME: '多层级计划表',
    VERSION: '2.0.0',
    
    // 数据存储配置
    STORAGE: {
        PREFIX: 'planData_',
        BACKUP_ENABLED: true,
        AUTO_SAVE: true,
        SAVE_INTERVAL: 5000 // 5秒自动保存
    },
    
    // 同步配置 - 默认禁用以避免弹窗
    SYNC: {
        ENABLED: false,
        SHOW_NOTIFICATIONS: false, // 关键：禁用所有同步通知
        AUTO_SYNC: false,
        GITHUB_CONFIG: {
            enabled: false
        }
    },
    
    // UI配置
    UI: {
        THEME: 'light',
        ANIMATIONS: true,
        SHOW_TIPS: false, // 禁用提示弹窗
        SHOW_NOTIFICATIONS: false // 禁用通知弹窗
    },
    
    // 功能开关
    FEATURES: {
        HABIT_TRACKER: true,
        MOOD_TRACKER: true,
        GRATITUDE_DIARY: true,
        REFLECTION_TEMPLATE: true,
        MONTHLY_SCHEDULE: true
    }
};

// 禁用所有可能的弹窗和通知
window.DISABLE_ALL_NOTIFICATIONS = true;
window.DISABLE_SYNC_NOTIFICATIONS = true;

// 重写alert、confirm等函数以避免弹窗
const originalAlert = window.alert;
const originalConfirm = window.confirm;

window.alert = function(message) {
    console.log('[ALERT BLOCKED]:', message);
    return true;
};

window.confirm = function(message) {
    console.log('[CONFIRM BLOCKED]:', message);
    return true;
};

// 阻止所有包含"同步"、"失败"等关键词的弹窗
const blockKeywords = ['同步', '失败', '错误', 'sync', 'error', 'fail'];

// 监听并阻止可能的弹窗
document.addEventListener('DOMContentLoaded', function() {
    // 移除任何现有的同步状态指示器
    const syncIndicators = document.querySelectorAll('[id*="sync"], [id*="indicator"], [class*="sync"]');
    syncIndicators.forEach(el => {
        if (el.textContent && blockKeywords.some(keyword => 
            el.textContent.toLowerCase().includes(keyword.toLowerCase())
        )) {
            el.remove();
        }
    });
    
    console.log('✅ 简化配置已加载，弹窗已禁用');
});

// 导出配置
window.getAppConfig = () => window.APP_CONFIG;
