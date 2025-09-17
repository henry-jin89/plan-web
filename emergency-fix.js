/**
 * 紧急修复脚本 - 解决网页空白问题
 * 2024年12月11日更新
 */

console.log('🔧 启动紧急修复脚本...');

// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('❌ 全局错误:', event.error);
    // 不让错误阻止页面显示
    event.preventDefault();
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ 未处理的Promise拒绝:', event.reason);
    // 不让Promise错误阻止页面显示
    event.preventDefault();
});

// 确保基础对象存在
window.APP_STATE = window.APP_STATE || {
    initialized: false,
    errors: []
};

// 基础工具函数 - 防止依赖缺失
if (!window.StorageUtils) {
    console.warn('⚠️ StorageUtils缺失，创建基础版本');
    window.StorageUtils = {
        savePlan: function(type, date, data) {
            try {
                const key = `planData_${type}`;
                const allPlans = JSON.parse(localStorage.getItem(key) || '{}');
                allPlans[date] = data;
                localStorage.setItem(key, JSON.stringify(allPlans));
                return true;
            } catch (e) {
                console.error('保存失败:', e);
                return false;
            }
        },
        loadPlan: function(type, date) {
            try {
                const key = `planData_${type}`;
                const allPlans = JSON.parse(localStorage.getItem(key) || '{}');
                return allPlans[date] || null;
            } catch (e) {
                console.error('加载失败:', e);
                return null;
            }
        },
        getAllPlans: function(type) {
            try {
                const key = `planData_${type}`;
                return JSON.parse(localStorage.getItem(key) || '{}');
            } catch (e) {
                console.error('获取所有计划失败:', e);
                return {};
            }
        }
    };
}

if (!window.DateUtils) {
    console.warn('⚠️ DateUtils缺失，创建基础版本');
    window.DateUtils = {
        formatDate: function(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        getToday: function() {
            return this.formatDate(new Date());
        }
    };
}

// 基础同步服务占位符
if (!window.syncService) {
    console.warn('⚠️ 同步服务缺失，创建占位符');
    window.syncService = {
        getSyncConfig: function() {
            return { enabled: false };
        },
        getSyncStatus: function() {
            return { enabled: false, online: false };
        }
    };
}

// 修复同步状态栏函数
window.initSyncStatusBar = function() {
    console.log('🔧 修复同步状态栏初始化');
    // 安全的初始化，不依赖具体的同步服务
    const statusBar = document.getElementById('syncStatusBar');
    if (statusBar) {
        // 默认隐藏，避免显示错误信息
        statusBar.style.display = 'none';
    }
};

window.updateSyncStatusBar = function() {
    // 安全的状态栏更新
    const statusBar = document.getElementById('syncStatusBar');
    if (statusBar) {
        statusBar.style.display = 'none'; // 暂时隐藏避免错误
    }
};

// 修复快速同步函数
window.quickSync = function() {
    console.log('📱 快速同步功能暂时不可用');
    if (window.MessageUtils && window.MessageUtils.info) {
        window.MessageUtils.info('同步功能正在初始化中，请稍后再试');
    } else {
        alert('同步功能正在初始化中，请稍后再试');
    }
};

// 修复强制刷新函数
window.forceRefresh = function() {
    console.log('🔄 执行强制刷新');
    if (confirm('即将强制刷新页面，是否继续？')) {
        // 清除可能的缓存
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(name) {
                    caches.delete(name);
                });
            }).finally(function() {
                window.location.reload(true);
            });
        } else {
            window.location.reload(true);
        }
    }
};

// 修复同步设置函数
window.openSyncSettings = function() {
    console.log('⚙️ 打开同步设置');
    try {
        window.open('sync-settings.html', '_blank');
    } catch (e) {
        console.error('无法打开同步设置:', e);
        if (window.MessageUtils && window.MessageUtils.warning) {
            window.MessageUtils.warning('同步设置页面暂时无法打开');
        }
    }
};

// 确保页面内容显示
function ensurePageVisible() {
    console.log('👁️ 确保页面内容可见');
    
    // 移除加载遮罩
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        console.log('隐藏加载遮罩');
        loadingOverlay.style.display = 'none';
    }
    
    // 确保主内容可见
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
    }
    
    const container = document.querySelector('.container');
    if (container) {
        container.style.visibility = 'visible';
        container.style.opacity = '1';
    }
    
    // 确保body可见
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
}

// 立即执行页面可见性修复
ensurePageVisible();

// DOM加载完成后再次确保
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM加载完成，再次确保页面可见');
        setTimeout(ensurePageVisible, 100);
    });
} else {
    console.log('📄 DOM已加载，立即确保页面可见');
    setTimeout(ensurePageVisible, 100);
}

// 超时保护 - 5秒后强制显示页面
setTimeout(function() {
    console.log('⏰ 超时保护：强制显示页面内容');
    ensurePageVisible();
    
    // 如果仍然有加载遮罩，强制移除
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay && loadingOverlay.style.display !== 'none') {
        console.log('🔧 强制移除持续存在的加载遮罩');
        loadingOverlay.remove();
    }
}, 5000);

// 修复统计更新函数
window.updateStats = function() {
    console.log('📊 更新统计数据');
    try {
        // 安全的统计更新
        const totalPlansEl = document.getElementById('totalPlans');
        const completedTasksEl = document.getElementById('completedTasks');
        const activeHabitsEl = document.getElementById('activeHabits');
        const weekStreakEl = document.getElementById('weekStreak');
        
        if (totalPlansEl) totalPlansEl.textContent = '0';
        if (completedTasksEl) completedTasksEl.textContent = '0';
        if (activeHabitsEl) activeHabitsEl.textContent = '0';
        if (weekStreakEl) weekStreakEl.textContent = '0';
        
        // 如果StorageUtils可用，尝试计算真实数据
        if (window.StorageUtils && typeof window.StorageUtils.getAllPlans === 'function') {
            let totalPlans = 0;
            let completedTasks = 0;
            
            const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
            planTypes.forEach(type => {
                try {
                    const plans = window.StorageUtils.getAllPlans(type);
                    totalPlans += Object.keys(plans).length;
                    
                    Object.values(plans).forEach(plan => {
                        if (plan.todos) {
                            const matches = plan.todos.match(/\[x\]/gi) || [];
                            completedTasks += matches.length;
                        }
                    });
                } catch (e) {
                    console.warn(`获取${type}计划数据失败:`, e);
                }
            });
            
            if (totalPlansEl) totalPlansEl.textContent = totalPlans;
            if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        }
        
    } catch (error) {
        console.error('更新统计数据失败:', error);
    }
};

// 修复计算连续规划天数函数
window.calculateStreak = function(dayPlans) {
    try {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = window.DateUtils.formatDate(date);
            
            if (dayPlans[dateKey] && dayPlans[dateKey].goals) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('计算连续规划天数失败:', error);
        return 0;
    }
};

console.log('✅ 紧急修复脚本加载完成');