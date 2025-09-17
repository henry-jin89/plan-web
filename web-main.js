// Web版本主文件 - 替代Electron的main.js
// 确保Web版本正常运行

console.log('🌐 运行在Web浏览器中');

// 立即执行的初始化
(function() {
    console.log('🚀 立即初始化Web应用...');
    
    // 确保页面可见
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    // 移除可能存在的加载遮罩
    const removeLoadingOverlay = () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ 移除加载遮罩');
        }
    };
    
    // 立即尝试移除，然后定时移除
    removeLoadingOverlay();
    setTimeout(removeLoadingOverlay, 1000);
    setTimeout(removeLoadingOverlay, 3000);
})();

// Web应用初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM加载完成，开始初始化...');
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('📱 检测到移动设备');
    } else {
        document.body.classList.add('desktop-device');
        console.log('🖥️ 检测到桌面设备');
    }
    
    // 初始化Service Worker（用于PWA功能）- 非阻塞
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ Service Worker 注册成功:', registration);
            })
            .catch(error => {
                console.log('⚠️ Service Worker 注册失败:', error);
            });
    }
    
    // 立即初始化应用
    try {
        initWebApp();
    } catch (error) {
        console.error('❌ Web应用初始化失败:', error);
    }
});

function initWebApp() {
    console.log('🔧 初始化Web应用...');
    
    // 设置应用版本信息
    window.appInfo = {
        name: 'Plan Manager Web',
        version: '1.0.0',
        platform: 'web'
    };
    
    // 模拟Electron API（为了兼容性）
    window.electronAPI = {
        getAppVersion: () => Promise.resolve('1.0.0'),
        getAppName: () => Promise.resolve('Plan Manager Web')
    };
    
    // 确保基础函数存在
    ensureBasicFunctions();
    
    // 初始化统计数据
    setTimeout(() => {
        try {
            if (typeof window.updateStats === 'function') {
                window.updateStats();
                console.log('✅ 统计数据已更新');
            }
        } catch (error) {
            console.warn('⚠️ 更新统计数据失败:', error);
        }
    }, 500);
    
    // 延迟初始化同步服务（非关键功能）
    setTimeout(() => {
        try {
            if (window.SyncService) {
                window.syncService = new SyncService();
                console.log('✅ 同步服务初始化完成');
            } else {
                console.log('ℹ️ SyncService未加载，使用占位符');
                // 创建占位符同步服务
                window.syncService = {
                    getSyncConfig: () => ({ enabled: false }),
                    getSyncStatus: () => ({ enabled: false, online: false })
                };
            }
        } catch (error) {
            console.warn('⚠️ 同步服务初始化失败:', error);
        }
    }, 2000);
    
    console.log('✅ Web应用初始化完成');
}

// 确保基础函数存在
function ensureBasicFunctions() {
    // 确保updateStats函数存在
    if (!window.updateStats) {
        window.updateStats = function() {
            console.log('📊 更新统计数据（占位符版本）');
            try {
                const elements = {
                    totalPlans: document.getElementById('totalPlans'),
                    completedTasks: document.getElementById('completedTasks'),
                    activeHabits: document.getElementById('activeHabits'),
                    weekStreak: document.getElementById('weekStreak')
                };
                
                Object.keys(elements).forEach(key => {
                    if (elements[key]) {
                        elements[key].textContent = '0';
                    }
                });
            } catch (error) {
                console.error('更新统计显示失败:', error);
            }
        };
    }
    
    // 确保calculateStreak函数存在
    if (!window.calculateStreak) {
        window.calculateStreak = function(dayPlans) {
            return 0; // 占位符实现
        };
    }
}

// 添加安装提示（PWA）
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

function showInstallBanner() {
    const banner = document.createElement('div');
    banner.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #1976d2; color: white; padding: 10px; text-align: center; z-index: 10000;">
            <span>📱 安装计划管理器到主屏幕以获得更好体验</span>
            <button onclick="installApp()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #1976d2; border: none; border-radius: 3px; cursor: pointer;">安装</button>
            <button onclick="dismissInstallBanner()" style="margin-left: 5px; padding: 5px 10px; background: transparent; color: white; border: 1px solid white; border-radius: 3px; cursor: pointer;">忽略</button>
        </div>
    `;
    banner.id = 'install-banner';
    document.body.appendChild(banner);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('用户接受了安装提示');
            }
            deferredPrompt = null;
            dismissInstallBanner();
        });
    }
}

function dismissInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.remove();
    }
}

// 防止右键菜单（可选）
document.addEventListener('contextmenu', function(e) {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        e.preventDefault();
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (window.currentPlan && window.currentPlan.save) {
            window.currentPlan.save();
        }
    }
    
    // Ctrl+1-9 快速导航
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const pages = [
            'day_plan.html',
            'week_plan.html', 
            'month_plan.html',
            'quarter_plan.html',
            'halfyear_plan.html',
            'year_plan.html',
            'habit_tracker.html',
            'reflection_template.html',
            'mood_tracker.html'
        ];
        const pageIndex = parseInt(e.key) - 1;
        if (pages[pageIndex]) {
            window.location.href = pages[pageIndex];
        }
    }
});

// 在线状态检测
window.addEventListener('online', function() {
    console.log('🌐 网络已连接');
    if (window.syncService) {
        window.syncService.handleNetworkChange(true);
    }
});

window.addEventListener('offline', function() {
    console.log('📴 网络已断开');
    if (window.syncService) {
        window.syncService.handleNetworkChange(false);
    }
});

}



