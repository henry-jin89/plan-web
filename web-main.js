// Web版本主文件 - 替代Electron的main.js
// 这个文件在Web版本中不需要，但保留用于兼容性

console.log('🌐 运行在Web浏览器中');

// Web应用初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('📱 检测到移动设备');
    } else {
        document.body.classList.add('desktop-device');
        console.log('🖥️ 检测到桌面设备');
    }
    
     // 初始化Service Worker（用于PWA功能）
   if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('sw.js')
           .then(registration => {
               console.log('Service Worker 注册成功:', registration);
           })
           .catch(error => {
               console.log('Service Worker 注册失败:', error);
           });
   }
    
    // 初始化应用
    initWebApp();
});

function initWebApp() {
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
    
    // 初始化同步服务（延迟初始化以确保依赖已加载）
    setTimeout(() => {
        if (window.SyncService) {
            window.syncService = new SyncService();
            console.log('✅ 同步服务初始化完成');
        } else {
            console.log('⚠️ SyncService未加载，跳过同步服务初始化');
        }
    }, 1000);

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



