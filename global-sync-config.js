/**
 * 全局同步配置管理器
 * 提供一次性配置，全站自动同步功能
 */

(function() {
    'use strict';
    
    console.log('🌐 加载全局同步配置管理器...');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalSyncConfig);
    } else {
        initGlobalSyncConfig();
    }
    
    function initGlobalSyncConfig() {
        console.log('🚀 初始化全局同步配置...');
        
        // 延迟执行，确保其他脚本已加载
        setTimeout(() => {
            try {
                setupGlobalSyncManager();
            } catch (error) {
                console.error('❌ 全局同步配置初始化失败:', error);
            }
        }, 1000);
    }
    
    function setupGlobalSyncManager() {
        // 检查是否已有同步配置
        const hasConfig = checkExistingSyncConfig();
        
        if (!hasConfig) {
            console.log('🔧 检测到未配置同步，显示快速配置面板...');
            showQuickConfigPanel();
        } else {
            console.log('✅ 已有同步配置，启用自动同步...');
            ensureSyncEnabled();
        }
        
        // 设置全局同步监听器
        setupGlobalSyncListeners();
    }
    
    function checkExistingSyncConfig() {
        const configKeys = ['sync_config', 'syncConfig'];
        
        for (const key of configKeys) {
            const config = localStorage.getItem(key);
            if (config) {
                try {
                    const parsed = JSON.parse(config);
                    if (parsed && parsed.enabled && parsed.provider === 'github' && 
                        parsed.settings && parsed.settings.token && parsed.settings.owner && parsed.settings.repo) {
                        console.log('✅ 发现完整的GitHub同步配置');
                        return true;
                    }
                } catch (e) {
                    // 忽略解析错误
                }
            }
        }
        
        return false;
    }
    
    function showQuickConfigPanel() {
        // 检查是否已经显示过配置面板
        if (document.getElementById('global-sync-config-panel')) {
            return;
        }
        
        const configPanel = document.createElement('div');
        configPanel.id = 'global-sync-config-panel';
        configPanel.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        configPanel.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">⚡ 一次性配置全站自动同步</h3>
                <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;">
                    配置一次，全站自动同步！之后在任何页面保存数据都会自动上传到GitHub。
                </p>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333;">GitHub Personal Access Token</label>
                    <input type="password" id="global-github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                    <div style="font-size: 12px; color: #666; margin-top: 3px;">
                        <a href="https://github.com/settings/tokens" target="_blank" style="color: #1976d2;">创建Token</a> 需要"repo"权限
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333;">GitHub用户名</label>
                    <input type="text" id="global-github-owner" placeholder="your-username" value="henry-jin89" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333;">仓库名称</label>
                    <input type="text" id="global-github-repo" placeholder="my-plan-data" value="my-plan-data" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="save-global-config" style="padding: 12px 24px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        ✅ 保存配置并启用自动同步
                    </button>
                    <button id="skip-global-config" style="padding: 12px 24px; background: #999; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        稍后配置
                    </button>
                </div>
                
                <div id="global-config-status" style="margin-top: 15px; font-size: 14px; text-align: center;"></div>
            </div>
        `;
        
        document.body.appendChild(configPanel);
        
        // 绑定事件
        document.getElementById('save-global-config').onclick = saveGlobalConfig;
        document.getElementById('skip-global-config').onclick = closeConfigPanel;
        
        console.log('✅ 显示全局同步配置面板');
    }
    
    async function saveGlobalConfig() {
        const token = document.getElementById('global-github-token').value.trim();
        const owner = document.getElementById('global-github-owner').value.trim();
        const repo = document.getElementById('global-github-repo').value.trim();
        const statusDiv = document.getElementById('global-config-status');
        
        if (!token || !owner || !repo) {
            statusDiv.innerHTML = '<span style="color: #f44336;">请填写完整信息</span>';
            return;
        }
        
        try {
            statusDiv.innerHTML = '<span style="color: #2196f3;">🔄 正在验证配置...</span>';
            
            // 创建同步配置
            const syncConfig = {
                enabled: true,
                provider: 'github',
                settings: {
                    token: token,
                    owner: owner,
                    repo: repo,
                    branch: 'main'
                },
                lastSync: new Date().toISOString(),
                autoConfigured: true // 标记为全局自动配置
            };
            
            // 测试GitHub连接
            statusDiv.innerHTML = '<span style="color: #2196f3;">🔄 测试GitHub连接...</span>';
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    statusDiv.innerHTML = '<span style="color: #ff9800;">🔄 仓库不存在，正在创建...</span>';
                    await createGitHubRepo(token, repo);
                } else {
                    throw new Error(`GitHub API错误: ${response.status}`);
                }
            }
            
            // 保存配置到所有可能的键名
            localStorage.setItem('sync_config', JSON.stringify(syncConfig));
            localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
            
            statusDiv.innerHTML = '<span style="color: #4caf50;">✅ 配置保存成功！</span>';
            
            // 初始化同步服务
            if (window.syncService) {
                await window.syncService.enableSync('github', syncConfig.settings);
                console.log('✅ 同步服务已启用');
            }
            
            statusDiv.innerHTML = '<span style="color: #4caf50;">🎉 全站自动同步已启用！页面即将刷新...</span>';
            
            setTimeout(() => {
                closeConfigPanel();
                location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('保存配置失败:', error);
            statusDiv.innerHTML = `<span style="color: #f44336;">❌ 配置失败: ${error.message}</span>`;
        }
    }
    
    async function createGitHubRepo(token, repoName) {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: repoName,
                description: '计划管理器数据同步仓库',
                private: true,
                auto_init: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`创建仓库失败: ${response.status}`);
        }
        
        console.log('✅ GitHub仓库创建成功');
    }
    
    function closeConfigPanel() {
        const panel = document.getElementById('global-sync-config-panel');
        if (panel) {
            panel.remove();
        }
    }
    
    function ensureSyncEnabled() {
        // 确保同步服务已启用
        if (window.syncService && !window.syncService.syncEnabled) {
            const config = JSON.parse(localStorage.getItem('sync_config') || localStorage.getItem('syncConfig'));
            if (config && config.enabled) {
                console.log('🔄 重新启用同步服务...');
                window.syncService.enableSync(config.provider, config.settings).catch(error => {
                    console.warn('⚠️ 同步服务启用失败:', error.message);
                });
            }
        }
    }
    
    function setupGlobalSyncListeners() {
        console.log('🔧 设置全局同步监听器...');
        
        // 监听localStorage变化
        const originalSetItem = localStorage.setItem;
        if (!localStorage.setItem.toString().includes('globalSyncListener')) {
            localStorage.setItem = function(key, value) {
                const result = originalSetItem.apply(this, arguments);
                
                // 检查是否是计划数据
                if (isPlanDataKey(key)) {
                    console.log(`📤 检测到数据变化: ${key}`);
                    triggerAutoSync(key);
                }
                
                return result;
            };
            
            // 标记已添加监听器
            localStorage.setItem.globalSyncListener = true;
        }
        
        // 监听页面卸载时的同步
        window.addEventListener('beforeunload', function() {
            if (hasUnsyncedChanges()) {
                triggerQuickSync();
            }
        });
        
        console.log('✅ 全局同步监听器设置完成');
    }
    
    function isPlanDataKey(key) {
        const planDataKeys = [
            'gratitude_history',
            'planData_day',
            'planData_week',
            'planData_month',
            'planData_quarter',
            'planData_halfyear',
            'planData_year',
            'planData_habit',
            'planData_mood',
            'planData_reflection'
        ];
        
        return planDataKeys.includes(key) || key.startsWith('planData_');
    }
    
    let syncTimer = null;
    let lastSyncAttempt = 0;
    
    function triggerAutoSync(dataKey) {
        const now = Date.now();
        const minInterval = 5000; // 最小同步间隔5秒
        
        // 防抖处理
        if (syncTimer) clearTimeout(syncTimer);
        
        const delay = Math.max(0, minInterval - (now - lastSyncAttempt));
        
        syncTimer = setTimeout(() => {
            performAutoSync(dataKey);
        }, delay);
        
        console.log(`⏰ 计划${delay/1000}秒后同步数据: ${dataKey}`);
    }
    
    async function performAutoSync(dataKey) {
        try {
            if (!window.syncService || !window.syncService.syncEnabled) {
                console.log('⚠️ 同步服务未启用，跳过自动同步');
                return;
            }
            
            lastSyncAttempt = Date.now();
            console.log(`🚀 执行自动同步: ${dataKey}`);
            
            await window.syncService.syncData();
            console.log(`✅ 自动同步完成: ${dataKey}`);
            
            // 显示同步成功提示
            showSyncStatusNotification('✅ 数据已自动同步到云端', 'success');
            
        } catch (error) {
            console.warn('⚠️ 自动同步失败:', error.message);
            showSyncStatusNotification('⚠️ 自动同步失败，请检查网络', 'warning');
        }
    }
    
    function triggerQuickSync() {
        if (window.syncService && window.syncService.syncEnabled) {
            console.log('🚀 执行页面卸载前快速同步...');
            window.syncService.syncData().catch(error => {
                console.warn('⚠️ 快速同步失败:', error.message);
            });
        }
    }
    
    function hasUnsyncedChanges() {
        // 检查是否有未同步的更改
        const config = localStorage.getItem('sync_config') || localStorage.getItem('syncConfig');
        if (!config) return false;
        
        try {
            const parsed = JSON.parse(config);
            const lastSync = new Date(parsed.lastSync || 0).getTime();
            const timeSinceLastSync = Date.now() - lastSync;
            
            return timeSinceLastSync > 30000; // 30秒内没有同步
        } catch (e) {
            return false;
        }
    }
    
    function showSyncStatusNotification(message, type = 'info') {
        // 移除旧的通知
        const oldNotification = document.getElementById('sync-status-notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'sync-status-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 6px;
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ${type === 'success' ? 'background: #4caf50; color: white;' : 
              type === 'warning' ? 'background: #ff9800; color: white;' : 
              'background: #2196f3; color: white;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // 导出全局方法
    window.GlobalSyncConfig = {
        showQuickConfig: showQuickConfigPanel,
        triggerSync: triggerAutoSync,
        checkConfig: checkExistingSyncConfig
    };
    
})();
