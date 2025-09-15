/**
 * 通用自动同步管理器（修复版）
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
        
        console.log('启动通用自动同步管理器...');
        
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
        console.log('通用自动同步管理器初始化完成');
    }
    
    async checkSyncConfig() {
        try {
            console.log('检查同步配置状态...');
            
            // 等待主同步服务加载完成
            let retryCount = 0;
            while (retryCount < 15) {
                let syncEnabled = false;
                
                // 方法1: 检查localStorage的同步配置
                let syncConfig = localStorage.getItem('sync_config'); // 修复：使用正确的键名
                if (!syncConfig) {
                    syncConfig = localStorage.getItem('syncConfig'); // 兼容性检查
                }
                if (syncConfig) {
                    try {
                        const config = JSON.parse(syncConfig);
                        if (config && config.enabled) {
                            syncEnabled = true;
                            console.log('✅ 方法1: localStorage发现同步配置已启用');
                        } else {
                            console.log('⚠️ 方法1: 发现同步配置但未启用:', config);
                        }
                    } catch (e) {
                        console.log('❌ localStorage同步配置解析失败:', e);
                    }
                } else {
                    console.log('📝 方法1: 未发现sync_config配置');
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
                
                if (syncEnabled) {
                    this.autoSyncEnabled = true;
                    this.updateStatusBadge();
                    return;
                }
                
                // 等待500ms后重试
                await this.delay(500);
                retryCount++;
                
                if (retryCount % 5 === 0) {
                    console.log('第' + retryCount + '次检查同步状态，继续等待...');
                }
            }
            
            // 最后检查：查看是否有任何同步相关的配置存在
            const syncRelatedKeys = ['sync_config', 'syncConfig', 'sync_config_backup', 'hasShownSyncRecommendation'];
            const foundKeys = syncRelatedKeys.filter(key => localStorage.getItem(key));
            
            if (foundKeys.length > 0) {
                console.log('🔍 发现同步相关存储项:', foundKeys);
                console.log('💡 建议：请检查同步设置页面确保配置正确');
                // 显示配置提示
                this.showSyncConfigHint();
            } else {
                console.log('📝 未发现任何同步配置，建议设置自动同步');
            }
            
            console.log('经过多次检查，未发现有效的自动同步配置');
            this.autoSyncEnabled = false;
            this.updateStatusBadge();
        } catch (error) {
            console.log('检查同步配置时出错:', error);
            this.autoSyncEnabled = false;
        }
    }
    
    createStatusBadge() {
        // 创建浮动的同步状态指示器
        this.statusBadge = document.createElement('div');
        this.statusBadge.id = 'universal-sync-badge';
        this.statusBadge.style.cssText = 
            'position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; ' +
            'border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); ' +
            'color: white; display: flex; align-items: center; justify-content: center; ' +
            'box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; z-index: 9998; ' +
            'transition: all 0.3s ease; font-size: 20px; user-select: none;';
        
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
            style.textContent = 
                '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } ' +
                '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }';
            document.head.appendChild(style);
        }
    }
    
    showSyncMenu() {
        // 移除已存在的菜单
        const existingMenu = document.getElementById('sync-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        // 先强制刷新一次状态（在移除菜单后）
        this.forceRefreshStatus();
        
        const menu = document.createElement('div');
        menu.id = 'sync-menu';
        menu.style.cssText = 
            'position: fixed; bottom: 80px; right: 20px; background: white; ' +
            'border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); ' +
            'padding: 15px; z-index: 9999; min-width: 200px; animation: scaleIn 0.2s ease;';
        
        const syncStatus = this.autoSyncEnabled ? '已启用' : '未启用';
        const syncStatusColor = this.autoSyncEnabled ? '#4caf50' : '#f44336';
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleTimeString() : '从未';
        
        menu.innerHTML = 
            '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">' +
                '<div style="width: 8px; height: 8px; border-radius: 50%; background: ' + syncStatusColor + ';"></div>' +
                '<span style="font-weight: 500; color: #333;">同步状态: ' + syncStatus + '</span>' +
            '</div>' +
            '<div style="font-size: 12px; color: #666; margin-bottom: 15px;">' +
                '最后同步: ' + lastSync +
            '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
                (this.autoSyncEnabled ? 
                    '<button onclick="universalAutoSync.manualSync()" style="background: #1976d2; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">🔄 立即同步</button>' :
                    '<button onclick="universalAutoSync.quickSetup()" style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">⚡ 快速设置</button>'
                ) +
                '<button onclick="universalAutoSync.openSyncSettings()" style="background: #f5f5f5; color: #666; border: 1px solid #e0e0e0; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">⚙️ 同步设置</button>' +
                '<button onclick="universalAutoSync.refreshAndUpdateMenu();" style="background: #ff9800; color: white; border: 1px solid #ff9800; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">🔄 刷新状态</button>' +
            '</div>';
        
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
    
    forceRefreshStatus() {
        // 防止重复调用
        const now = Date.now();
        if (this.lastRefreshTime && (now - this.lastRefreshTime) < 1000) {
            console.log('刷新间隔过短，跳过本次刷新');
            return;
        }
        this.lastRefreshTime = now;
        
        console.log('开始强制刷新同步状态');
        
        // 立即检查所有可能的同步状态
        let syncEnabled = false;
        let detectionMethod = '';
        
        // 方法0: 检查页面URL，如果是同步设置页面，直接认为已启用
        if (window.location.href.includes('sync-settings.html')) {
            console.log('✅ 在同步设置页面，直接认为同步已启用');
            syncEnabled = true;
            detectionMethod = '同步设置页面';
        }
        
        // 方法1: 检查window.syncService
        if (!syncEnabled) {
            console.log('检查window.syncService:', !!window.syncService);
            if (window.syncService) {
                console.log('window.syncService存在，检查getSyncStatus方法:', typeof window.syncService.getSyncStatus);
                if (window.syncService.getSyncStatus) {
                    try {
                        const status = window.syncService.getSyncStatus();
                        console.log('syncService状态:', status);
                        if (status && status.enabled) {
                            syncEnabled = true;
                            detectionMethod = 'syncService';
                            console.log('✅ 方法1成功: syncService检测到同步已启用');
                            
                            // 获取最后同步时间
                            if (status.lastSync) {
                                this.lastSyncTime = new Date(status.lastSync).getTime();
                                console.log('获取到最后同步时间:', status.lastSync);
                            }
                        } else {
                            console.log('❌ 方法1失败: status.enabled =', status ? status.enabled : 'status为空');
                        }
                    } catch (e) {
                        console.log('❌ 方法1异常:', e);
                    }
                }
            }
        }
        
        // 方法2: 检查localStorage中的syncConfig
        if (!syncEnabled) {
            console.log('尝试方法2: 检查localStorage syncConfig');
            try {
                const syncConfig = localStorage.getItem('syncConfig');
                console.log('localStorage syncConfig:', syncConfig);
                if (syncConfig) {
                    const config = JSON.parse(syncConfig);
                    console.log('解析后的syncConfig:', config);
                    if (config && config.enabled) {
                        syncEnabled = true;
                        detectionMethod = 'localStorage';
                        console.log('✅ 方法2成功: localStorage检测到同步已启用');
                    }
                }
            } catch (e) {
                console.log('❌ 方法2异常:', e);
            }
        }
        
        // 方法2.5: 检查所有可能的localStorage同步配置键
        if (!syncEnabled) {
            console.log('尝试方法2.5: 扫描所有localStorage项');
            try {
                // 检查所有可能存储同步配置的键
                const possibleKeys = [
                    'sync_config', // 主要键名
                    'syncConfig', // 兼容键名
                    'syncService_config', 
                    'autoSyncConfig',
                    'sync_settings',
                    'planData_syncConfig'
                ];
                
                for (const key of possibleKeys) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        console.log('发现配置键:', key, '值:', value);
                        try {
                            const config = JSON.parse(value);
                            if (config && (config.enabled || config.isEnabled)) {
                                syncEnabled = true;
                                detectionMethod = 'localStorage扫描(' + key + ')';
                                console.log('✅ 方法2.5成功: 通过' + key + '检测到同步已启用');
                                break;
                            }
                        } catch (e) {
                            // 不是JSON，检查是否包含enabled关键字
                            if (value.includes('enabled') || value.includes('true')) {
                                syncEnabled = true;
                                detectionMethod = 'localStorage关键字(' + key + ')';
                                console.log('✅ 方法2.5成功: 通过' + key + '关键字检测到同步已启用');
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log('❌ 方法2.5异常:', e);
            }
        }
        
        // 方法3: 检查是否有同步按钮状态显示为"已启用"
        if (!syncEnabled) {
            console.log('尝试方法3: 检查页面同步按钮状态');
            const syncButtons = document.querySelectorAll('button');
            for (const button of syncButtons) {
                if (button.textContent && button.textContent.includes('同步已启用')) {
                    syncEnabled = true;
                    detectionMethod = 'button状态';
                    console.log('✅ 方法3成功: 从按钮状态检测到同步已启用');
                    break;
                }
            }
        }
        
        // 方法4: 详细扫描localStorage所有项
        if (!syncEnabled) {
            console.log('尝试方法4: 详细扫描localStorage所有项');
            try {
                const allKeys = Object.keys(localStorage);
                console.log('localStorage中的所有键:', allKeys);
                
                for (const key of allKeys) {
                    const value = localStorage.getItem(key);
                    // 检查键名或值是否包含同步相关信息
                    if ((key.toLowerCase().includes('sync') || 
                         key.toLowerCase().includes('github') || 
                         key.toLowerCase().includes('drive')) ||
                        (value && (value.includes('github.com') || 
                                  value.includes('ghp_') || 
                                  value.includes('enabled') ||
                                  value.includes('lastSync')))) {
                        console.log('发现同步相关项:', key, '→', value.substring(0, 100) + (value.length > 100 ? '...' : ''));
                        syncEnabled = true;
                        detectionMethod = 'localStorage深度扫描(' + key + ')';
                        console.log('✅ 方法4成功: 通过深度扫描检测到同步配置');
                        
                        // 尝试从value中提取最后同步时间
                        if (value.includes('lastSync')) {
                            try {
                                const match = value.match(/"lastSync":"([^"]+)"/);
                                if (match) {
                                    this.lastSyncTime = new Date(match[1]).getTime();
                                    console.log('提取到最后同步时间:', match[1]);
                                }
                            } catch (e) {}
                        }
                        break;
                    }
                }
            } catch (e) {
                console.log('❌ 方法4异常:', e);
            }
        }
        
        // 方法5: 检查页面是否有同步日志（兜底方案）
        if (!syncEnabled) {
            console.log('尝试方法5: 检查是否有同步完成日志');
            // 如果能看到同步日志，说明同步功能是启用的
            const logElements = document.querySelectorAll('*');
            for (const element of logElements) {
                if (element.textContent && (
                    element.textContent.includes('同步完成') || 
                    element.textContent.includes('手动同步完成') ||
                    element.textContent.includes('数据已更新')
                )) {
                    syncEnabled = true;
                    detectionMethod = '同步日志';
                    console.log('✅ 方法5成功: 从同步日志检测到同步已启用');
                    this.lastSyncTime = Date.now(); // 设置当前时间为最后同步时间
                    break;
                }
            }
        }
        
        console.log('检测结果:');
        console.log('同步状态:', syncEnabled);
        console.log('检测方法:', detectionMethod);
        console.log('当前autoSyncEnabled:', this.autoSyncEnabled);
        
        // 更新状态
        if (this.autoSyncEnabled !== syncEnabled) {
            this.autoSyncEnabled = syncEnabled;
            this.updateStatusBadge();
            console.log('🔄 状态已更新: ' + (syncEnabled ? '已启用' : '未启用') + ' (通过' + detectionMethod + '检测)');
        } else {
            console.log('ℹ️ 状态无变化，保持: ' + (syncEnabled ? '已启用' : '未启用'));
        }
        
        console.log('强制刷新完成');
    }
    
    refreshAndUpdateMenu() {
        console.log('刷新状态并更新菜单');
        
        // 先移除当前菜单
        const existingMenu = document.getElementById('sync-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // 刷新状态
        this.forceRefreshStatus();
        
        // 延迟重新显示菜单，让状态更新完成
        setTimeout(() => {
            this.showSyncMenu();
        }, 100);
    }
    
    setupChangeListeners() {
        // 监听localStorage变化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            // 监听所有应用相关的数据变化
            const syncableKeys = [
                'planData_',
                'habitTrackerData',
                'gratitude_history',
                'mood_history', // 修复：mood_tracker.html实际使用的键名
                'mood_tracker_data', // 保留兼容性
                'reflection_templates',
                'reflection_history',
                'reflection_to_dayplan', // 反思到日计划的数据传递
                'monthlyEvents',
                'customTemplates',
                'syncConfig', // 同步配置（跨设备同步配置）
                'reflection_' // 动态键名
            ];
            
            const shouldSync = syncableKeys.some(pattern => {
                return key.startsWith(pattern) || key === pattern;
            });
            
            if (shouldSync) {
                window.universalAutoSync.onDataChange(key);
            }
            originalSetItem.apply(this, arguments);
        };
    }
    
    setupStatusUpdater() {
        // 每5秒更新一次同步状态
        setInterval(() => {
            this.forceRefreshStatus();
        }, 5000);
    }
    
    setupPeriodicSync() {
        // 简化的定期同步
    }
    
    setupPageEventListeners() {
        // 简化的页面事件监听
    }
    
    onDataChange(key) {
        this.changeDetected = true;
        console.log('检测到数据变化:', key);
        
        // 如果同步已启用，触发防抖同步
        if (this.autoSyncEnabled && !this.syncInProgress) {
            this.debounceSync();
        }
    }
    
    // 防抖同步函数
    debounceSync() {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        // 5秒后执行同步
        this.syncTimer = setTimeout(() => {
            if (this.autoSyncEnabled && !this.syncInProgress && navigator.onLine) {
                console.log('执行自动同步...');
                this.manualSync();
            }
        }, 5000);
    }
    
    async manualSync() {
        if (this.syncInProgress) {
            console.log('同步正在进行中...');
            return;
        }
        
        try {
            this.syncInProgress = true;
            this.updateStatusBadge();
            
            if (window.syncService && window.syncService.manualSync) {
                // 检查同步是否已启用
                if (!window.syncService.syncEnabled) {
                    console.log('ℹ️ 同步功能未启用，跳过同步操作');
                    return;
                }
                
                const result = await window.syncService.manualSync();
                this.lastSyncTime = Date.now();
                
                if (result && result.success !== false) {
                    console.log('✅ 手动同步完成');
                } else {
                    console.log('ℹ️ 同步跳过:', result?.message || '未知原因');
                }
            } else {
                console.log('⚠️ 同步服务不可用');
            }
        } catch (error) {
            // 只有真正的错误才记录为错误，配置问题记录为信息
            if (error.message && error.message.includes('未启用')) {
                console.log('ℹ️ 同步跳过:', error.message);
            } else {
                console.error('❌ 同步失败:', error);
            }
        } finally {
            this.syncInProgress = false;
            this.updateStatusBadge();
        }
    }
    
    quickSetup() {
        if (window.smartAutoSync) {
            window.smartAutoSync.startQuickSetup();
        } else {
            this.openSyncSettings();
        }
    }
    
    openSyncSettings() {
        window.open('sync-settings.html', '_blank');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showSyncConfigHint() {
        // 在页面上显示同步配置提示
        const existingHint = document.getElementById('sync-config-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        const hint = document.createElement('div');
        hint.id = 'sync-config-hint';
        hint.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 300px;
            font-size: 14px;
            color: #856404;
        `;
        
        hint.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ 同步配置提醒</div>
            <div>检测到同步相关配置，但未正确启用。</div>
            <div style="margin-top: 8px;">
                <button onclick="window.open('sync-settings.html', '_blank')" style="
                    background: #ffc107;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                ">检查同步设置</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    border: none;
                    margin-left: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #856404;
                ">关闭</button>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 10000);
    }
}

// 自动创建全局实例
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.universalAutoSync = new UniversalAutoSync();
    });
} else {
    window.universalAutoSync = new UniversalAutoSync();
}
