/**
 * 通用自动同步管理器
 * 可在所有页面使用的智能自动同步功能
 */

class UniversalAutoSync {
    constructor() {
        this.isInitialized = false;
        this.autoSyncEnabled = false;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.changeDetected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // 同步状态指示器
        this.statusBadge = null;
        
        // 防抖定时器
        this.syncTimer = null;
        this.statusUpdateTimer = null;
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 启动通用自动同步管理器...');
        
        // 延迟1秒初始化，等待页面完全加载
        await this.delay(1000);
        
        // 检查同步配置
        await this.checkSyncConfig();
        
        // 创建状态指示器
        this.createStatusBadge();
        
        // 设置数据变化监听
        this.setupChangeListeners();
        
        // 设置定期同步
        this.setupPeriodicSync();
        
        // 设置页面事件监听
        this.setupPageEventListeners();
        
        // 设置定期状态更新
        this.setupStatusUpdater();
        
        this.isInitialized = true;
        console.log('✅ 通用自动同步管理器初始化完成');
    }
    
    async checkSyncConfig() {
        try {
            console.log('🔍 检查同步配置状态...');
            
            // 等待主同步服务加载完成
            let retryCount = 0;
            while (retryCount < 15) { // 增加重试次数
                let syncEnabled = false;
                
                // 方法1: 检查localStorage的同步配置
                const syncConfig = localStorage.getItem('syncConfig');
                if (syncConfig) {
                    try {
                        const config = JSON.parse(syncConfig);
                        if (config && config.enabled) {
                            syncEnabled = true;
                            console.log('✅ 方法1: localStorage发现同步配置已启用');
                        }
                    } catch (e) {
                        console.log('⚠️ localStorage同步配置解析失败:', e);
                    }
                }
                
                // 方法2: 检查window.syncService
                if (!syncEnabled && window.syncService) {
                    try {
                        if (typeof window.syncService.getSyncStatus === 'function') {
                            const status = window.syncService.getSyncStatus();
                            if (status && status.enabled) {
                                syncEnabled = true;
                                console.log('方法2: window.syncService检测到同步已启用');
                            }
                        }
                    } catch (e) {
                        console.log('window.syncService检查失败:', e);
                    }
                }
                
                // 方法3: 检查window.autoSyncService
                if (!syncEnabled && window.autoSyncService) {
                    try {
                        if (window.autoSyncService.isEnabled) {
                            syncEnabled = true;
                            console.log('方法3: window.autoSyncService检测到同步已启用');
                        }
                    } catch (e) {
                        console.log('window.autoSyncService检查失败:', e);
                    }
                }
                
                // 方法4: 检查是否有同步相关的localStorage项目
                if (!syncEnabled) {
                    const syncKeys = Object.keys(localStorage).filter(key => 
                        key.includes('sync') || key.includes('Sync') || key.includes('github') || key.includes('drive')
                    );
                    if (syncKeys.length > 0) {
                        console.log('📋 发现同步相关存储项:', syncKeys);
                        // 进一步检查是否真的配置了同步
                        for (const key of syncKeys) {
                            try {
                                const value = localStorage.getItem(key);
                                if (value && (value.includes('enabled') || value.includes('token') || value.includes('github'))) {
                                    syncEnabled = true;
                                    console.log(`✅ 方法4: 通过${key}检测到同步配置`);
                                    break;
                                }
                            } catch (e) {}
                        }
                    }
                }
                
                if (syncEnabled) {
                    this.autoSyncEnabled = true;
                    this.updateStatusBadge();
                    return;
                }
                
                // 等待500ms后重试
                await this.delay(500);
                retryCount++;
                
                if (retryCount % 5 === 0) {
                    console.log(`🔄 第${retryCount}次检查同步状态，继续等待...`);
                }
            }
            
            console.log('ℹ️ 经过多次检查，未发现自动同步配置');
            this.autoSyncEnabled = false;
            this.updateStatusBadge();
        } catch (error) {
            console.log('⚠️ 检查同步配置时出错:', error);
            this.autoSyncEnabled = false;
        }
    }
    
    createStatusBadge() {
        // 创建浮动的同步状态指示器
        this.statusBadge = document.createElement('div');
        this.statusBadge.id = 'universal-sync-badge';
        this.statusBadge.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            z-index: 9998;
            transition: all 0.3s ease;
            font-size: 20px;
            user-select: none;
        `;
        
        this.updateStatusBadge();
        
        // 点击事件
        this.statusBadge.addEventListener('click', () => {
            this.showSyncMenu();
        });
        
        // 悬停效果
        this.statusBadge.addEventListener('mouseenter', () => {
            this.statusBadge.style.transform = 'scale(1.1)';
            this.statusBadge.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        });
        
        this.statusBadge.addEventListener('mouseleave', () => {
            this.statusBadge.style.transform = 'scale(1)';
            this.statusBadge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        document.body.appendChild(this.statusBadge);
    }
    
    updateStatusBadge() {
        if (!this.statusBadge) return;
        
        if (this.syncInProgress) {
            this.statusBadge.innerHTML = '⏳';
            this.statusBadge.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            this.statusBadge.style.animation = 'spin 2s linear infinite';
        } else if (this.autoSyncEnabled) {
            this.statusBadge.innerHTML = '☁️';
            this.statusBadge.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
            this.statusBadge.style.animation = 'none';
        } else {
            this.statusBadge.innerHTML = '📱';
            this.statusBadge.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            this.statusBadge.style.animation = 'pulse 2s infinite';
        }
        
        // 添加CSS动画
        if (!document.getElementById('universal-sync-animations')) {
            const style = document.createElement('style');
            style.id = 'universal-sync-animations';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showSyncMenu() {
        // 先强制刷新一次状态
        this.forceRefreshStatus();
        
        // 移除已存在的菜单
        const existingMenu = document.getElementById('sync-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.id = 'sync-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 15px;
            z-index: 9999;
            min-width: 200px;
            animation: scaleIn 0.2s ease;
        `;
        
        const syncStatus = this.autoSyncEnabled ? '已启用' : '未启用';
        const syncStatusColor = this.autoSyncEnabled ? '#4caf50' : '#f44336';
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleTimeString() : '从未';
        
        menu.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${syncStatusColor};"></div>
                <span style="font-weight: 500; color: #333;">同步状态: ${syncStatus}</span>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                最后同步: ${lastSync}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${this.autoSyncEnabled ? `
                    <button onclick="universalAutoSync.manualSync()" style="
                        background: #1976d2;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#1565c0'" onmouseout="this.style.background='#1976d2'">
                        🔄 立即同步
                    </button>
                ` : `
                    <button onclick="universalAutoSync.quickSetup()" style="
                        background: #4caf50;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4caf50'">
                        ⚡ 快速设置
                    </button>
                `}
                
                <button onclick="universalAutoSync.openSyncSettings()" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f5f5f5'">
                    ⚙️ 同步设置
                </button>
                
                <button onclick="universalAutoSync.forceRefreshStatus(); universalAutoSync.showSyncMenu();" style="
                    background: #ff9800;
                    color: white;
                    border: 1px solid #ff9800;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
                    🔄 刷新状态
                </button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if (menu.parentNode) {
                menu.remove();
            }
        }, 5000);
        
        // 点击其他地方隐藏菜单
        const hideMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== this.statusBadge) {
                menu.remove();
                document.removeEventListener('click', hideMenu);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', hideMenu);
        }, 100);
    }
    
    setupChangeListeners() {
        // 监听localStorage变化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key.startsWith('planData_')) {
                window.universalAutoSync.onDataChange(key);
            }
            originalSetItem.apply(this, arguments);
        };
        
        // 监听表单变化
        this.setupFormListeners();
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.autoSyncEnabled && !this.syncInProgress) {
                // 页面重新可见时检查同步
                this.checkAndSync();
            }
        });
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            if (this.autoSyncEnabled && this.changeDetected) {
                this.scheduleSync(3000); // 网络恢复后3秒同步
            }
        });
    }
    
    setupFormListeners() {
        // 监听所有输入框、文本域的变化
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            ['input', 'change'].forEach(event => {
                input.addEventListener(event, () => {
                    this.onDataChange(`form_${input.name || input.id || 'unknown'}`);
                });
            });
        });
        
        // 监听动态添加的元素
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // 元素节点
                        const newInputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
                        newInputs.forEach(input => {
                            ['input', 'change'].forEach(event => {
                                input.addEventListener(event, () => {
                                    this.onDataChange(`form_${input.name || input.id || 'unknown'}`);
                                });
                            });
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupPeriodicSync() {
        if (!this.autoSyncEnabled) return;
        
        // 每5分钟检查一次同步
        setInterval(() => {
            if (this.autoSyncEnabled && !this.syncInProgress && navigator.onLine) {
                this.checkAndSync();
            }
        }, 300000); // 5分钟
    }
    
    setupStatusUpdater() {
        // 每5秒更新一次同步状态
        setInterval(() => {
            this.refreshSyncStatus();
        }, 5000);
        
        // 监听存储变化
        window.addEventListener('storage', (e) => {
            if (e.key === 'syncConfig') {
                this.refreshSyncStatus();
            }
        });
        
        // 监听自定义同步事件
        window.addEventListener('sync-complete', () => {
            this.refreshSyncStatus();
            this.lastSyncTime = Date.now();
        });
        
        window.addEventListener('sync-enabled', () => {
            this.refreshSyncStatus();
        });
    }
    
    async refreshSyncStatus() {
        const oldStatus = this.autoSyncEnabled;
        await this.checkSyncConfig();
        
        // 如果状态发生变化，更新UI
        if (oldStatus !== this.autoSyncEnabled) {
            this.updateStatusBadge();
            console.log(`🔄 同步状态已更新: ${this.autoSyncEnabled ? '已启用' : '未启用'}`);
        }
    }
    
    forceRefreshStatus() {
        console.log('🔄 强制刷新同步状态...');
        
        // 立即检查所有可能的同步状态
        let syncEnabled = false;
        
        // 检查localStorage
        try {
            const syncConfig = localStorage.getItem('syncConfig');
            if (syncConfig) {
                const config = JSON.parse(syncConfig);
                if (config && config.enabled) {
                    syncEnabled = true;
                    console.log('💡 强制检查: localStorage同步已启用');
                }
            }
        } catch (e) {}
        
        // 检查window对象
        if (!syncEnabled) {
            if (window.syncService && window.syncService.getSyncStatus) {
                try {
                    const status = window.syncService.getSyncStatus();
                    if (status && status.enabled) {
                        syncEnabled = true;
                        console.log('💡 强制检查: syncService同步已启用');
                        
                        // 获取最后同步时间
                        if (status.lastSync) {
                            this.lastSyncTime = new Date(status.lastSync).getTime();
                        }
                    }
                } catch (e) {}
            }
        }
        
        // 检查是否有GitHub相关配置
        if (!syncEnabled) {
            try {
                const keys = Object.keys(localStorage);
                for (const key of keys) {
                    const value = localStorage.getItem(key);
                    if (value && (value.includes('github.com') || value.includes('ghp_') || value.includes('"enabled":true'))) {
                        syncEnabled = true;
                        console.log('💡 强制检查: 通过GitHub配置检测到同步已启用');
                        break;
                    }
                }
            } catch (e) {}
        }
        
        // 更新状态
        if (this.autoSyncEnabled !== syncEnabled) {
            this.autoSyncEnabled = syncEnabled;
            this.updateStatusBadge();
            console.log(`⚡ 强制更新同步状态: ${syncEnabled ? '已启用' : '未启用'}`);
        }
    }
    
    setupPageEventListeners() {
        // 页面卸载前同步
        window.addEventListener('beforeunload', () => {
            if (this.autoSyncEnabled && this.changeDetected && navigator.onLine) {
                // 执行快速同步
                this.performQuickSync();
            }
        });
        
        // 页面获得焦点时同步
        window.addEventListener('focus', () => {
            if (this.autoSyncEnabled && !this.syncInProgress) {
                this.scheduleSync(2000);
            }
        });
    }
    
    onDataChange(key) {
        this.changeDetected = true;
        console.log('📝 检测到数据变化:', key);
        
        if (this.autoSyncEnabled) {
            this.scheduleSync(10000); // 10秒后同步
        }
    }
    
    scheduleSync(delay = 10000) {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        this.syncTimer = setTimeout(() => {
            if (this.autoSyncEnabled && !this.syncInProgress && navigator.onLine) {
                this.performSync();
            }
        }, delay);
    }
    
    async checkAndSync() {
        const now = Date.now();
        const timeSinceLastSync = now - (this.lastSyncTime || 0);
        
        // 如果距离上次同步超过10分钟，或有未同步的变化，则执行同步
        if (timeSinceLastSync > 600000 || this.changeDetected) {
            await this.performSync();
        }
    }
    
    async performSync() {
        if (this.syncInProgress || !this.autoSyncEnabled || !navigator.onLine) {
            return;
        }
        
        try {
            this.syncInProgress = true;
            this.updateStatusBadge();
            
            console.log('🔄 开始自动同步...');
            
            if (window.syncService && window.syncService.manualSync) {
                await window.syncService.manualSync();
                this.lastSyncTime = Date.now();
                this.changeDetected = false;
                this.retryCount = 0;
                
                console.log('✅ 自动同步完成');
                this.showSyncNotification('数据同步完成', 'success');
            } else {
                throw new Error('同步服务不可用');
            }
            
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
            this.retryCount++;
            
            if (this.retryCount < this.maxRetries) {
                // 重试机制
                setTimeout(() => {
                    this.performSync();
                }, 30000); // 30秒后重试
            } else {
                this.showSyncNotification('同步失败，请检查网络连接', 'error');
                this.retryCount = 0;
            }
        } finally {
            this.syncInProgress = false;
            this.updateStatusBadge();
        }
    }
    
    async performQuickSync() {
        // 页面卸载前的快速同步，不等待结果
        if (window.syncService && window.syncService.manualSync) {
            try {
                await window.syncService.manualSync();
            } catch (error) {
                console.log('快速同步失败:', error);
            }
        }
    }
    
    async manualSync() {
        const menu = document.getElementById('sync-menu');
        if (menu) menu.remove();
        
        if (this.syncInProgress) {
            this.showSyncNotification('同步正在进行中...', 'warning');
            return;
        }
        
        this.showSyncNotification('正在同步数据...', 'info');
        await this.performSync();
    }
    
    quickSetup() {
        const menu = document.getElementById('sync-menu');
        if (menu) menu.remove();
        
        // 跳转到主页的快速设置
        if (window.smartAutoSync) {
            window.smartAutoSync.startQuickSetup();
        } else {
            // 如果在其他页面，打开同步设置
            this.openSyncSettings();
        }
    }
    
    openSyncSettings() {
        const menu = document.getElementById('sync-menu');
        if (menu) menu.remove();
        
        window.open('sync-settings.html', '_blank');
    }
    
    showSyncNotification(message, type = 'info') {
        // 创建通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        
        // 设置样式
        const styles = {
            success: 'background: #4caf50;',
            error: 'background: #f44336;',
            warning: 'background: #ff9800;',
            info: 'background: #2196f3;'
        };
        
        notification.style.cssText += styles[type] || styles.info;
        notification.textContent = message;
        
        // 添加动画
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 自动创建全局实例（延迟执行以确保页面加载完成）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.universalAutoSync = new UniversalAutoSync();
    });
} else {
    window.universalAutoSync = new UniversalAutoSync();
}
