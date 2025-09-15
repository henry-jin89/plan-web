/**
 * 修复删除浏览器数据后云同步初始化问题
 * 解决localStorage键名不一致和初始化检测失败的问题
 */

(function() {
    'use strict';
    
    console.log('🔧 加载同步初始化修复脚本...');
    
    // 等待DOM加载完成后执行修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSyncFix);
    } else {
        initSyncFix();
    }
    
    function initSyncFix() {
        console.log('🚀 开始执行同步初始化修复...');
        
        // 延迟执行，确保其他脚本已加载
        setTimeout(() => {
            try {
                fixSyncConfigKeys();
                fixSyncServiceInitialization();
                enhanceUniversalAutoSync();
                addSyncRecoveryMechanism();
                console.log('✅ 同步初始化修复完成');
            } catch (error) {
                console.error('❌ 同步初始化修复失败:', error);
            }
        }, 1000);
    }
    
    /**
     * 修复localStorage键名不一致问题
     */
    function fixSyncConfigKeys() {
        console.log('🔍 检查并修复localStorage键名不一致问题...');
        
        const possibleKeys = [
            'sync_config',      // sync-service.js 使用的键名
            'syncConfig',       // universal-auto-sync.js 查找的键名
            'syncService_config',
            'autoSyncConfig',
            'sync_settings'
        ];
        
        let foundConfig = null;
        let foundKey = null;
        
        // 查找现有的同步配置
        for (const key of possibleKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    const config = JSON.parse(value);
                    if (config && (config.enabled || config.isEnabled)) {
                        foundConfig = config;
                        foundKey = key;
                        console.log(`✅ 发现有效的同步配置: ${key}`, config);
                        break;
                    }
                } catch (e) {
                    // 忽略解析错误
                }
            }
        }
        
        // 如果找到配置，确保所有键名都有副本
        if (foundConfig) {
            console.log('🔄 同步配置到所有键名...');
            localStorage.setItem('sync_config', JSON.stringify(foundConfig));
            localStorage.setItem('syncConfig', JSON.stringify(foundConfig));
            console.log('✅ 配置已同步到所有键名');
        } else {
            console.log('ℹ️ 未找到现有的同步配置');
        }
    }
    
    /**
     * 修复SyncService初始化问题
     */
    function fixSyncServiceInitialization() {
        console.log('🔧 修复SyncService初始化...');
        
        // 防止重复执行
        if (window.syncServiceFixed) {
            console.log('✅ SyncService已经修复过，跳过');
            return;
        }
        
        // 等待SyncService加载
        if (typeof window.SyncService !== 'undefined' && window.syncService) {
            // 增强getSyncStatus方法
            const originalGetSyncStatus = window.syncService.getSyncStatus;
            if (originalGetSyncStatus) {
                window.syncService.getSyncStatus = function() {
                    try {
                        const status = originalGetSyncStatus.call(this);
                        console.log('🔍 getSyncStatus原始结果:', status);
                        
                        // 如果原始方法返回enabled=false，尝试从localStorage恢复
                        if (!status || !status.enabled) {
                            const config = this.getSyncConfig();
                            if (config && config.enabled) {
                                console.log('🔄 从localStorage恢复同步状态');
                                return {
                                    enabled: true,
                                    provider: config.provider,
                                    lastSync: config.lastSync || new Date().toISOString(),
                                    online: true
                                };
                            }
                        }
                        
                        return status;
                    } catch (error) {
                        console.error('❌ getSyncStatus错误:', error);
                        // 尝试从localStorage获取状态
                        try {
                            const config = this.getSyncConfig();
                            if (config && config.enabled) {
                                return {
                                    enabled: true,
                                    provider: config.provider,
                                    lastSync: config.lastSync || new Date().toISOString(),
                                    online: true
                                };
                            }
                        } catch (e) {
                            console.error('❌ 从localStorage恢复状态失败:', e);
                        }
                        return { enabled: false };
                    }
                };
            }
            
            // 增强getSyncConfig方法，支持多种键名
            const originalGetSyncConfig = window.syncService.getSyncConfig;
            if (originalGetSyncConfig) {
                window.syncService.getSyncConfig = function() {
                    try {
                        // 先尝试原始方法
                        let config = originalGetSyncConfig.call(this);
                        if (config && config.enabled) {
                            return config;
                        }
                        
                        // 尝试所有可能的键名
                        const possibleKeys = ['sync_config', 'syncConfig', 'syncService_config'];
                        for (const key of possibleKeys) {
                            const value = localStorage.getItem(key);
                            if (value) {
                                try {
                                    config = JSON.parse(value);
                                    if (config && config.enabled) {
                                        console.log(`✅ 通过${key}恢复同步配置`);
                                        return config;
                                    }
                                } catch (e) {
                                    // 继续尝试下一个键
                                }
                            }
                        }
                        
                        return null;
                    } catch (error) {
                        console.error('❌ getSyncConfig错误:', error);
                        return null;
                    }
                };
            }
            
            // 标记已修复，防止重复执行
            window.syncServiceFixed = true;
            console.log('✅ SyncService增强完成');
        } else {
            console.log('⚠️ SyncService未找到，将在其加载后重试');
            // 限制重试次数，防止无限循环
            if (!window.syncServiceRetryCount) {
                window.syncServiceRetryCount = 0;
            }
            window.syncServiceRetryCount++;
            
            if (window.syncServiceRetryCount <= 3) {
                console.log(`🔄 第${window.syncServiceRetryCount}次重试...`);
                setTimeout(fixSyncServiceInitialization, 2000);
            } else {
                console.log('❌ SyncService加载失败，停止重试');
            }
        }
    }
    
    /**
     * 增强UniversalAutoSync检测逻辑
     */
    function enhanceUniversalAutoSync() {
        console.log('🔧 增强UniversalAutoSync检测逻辑...');
        
        // 监听全局变量变化
        if (typeof window.UniversalAutoSync !== 'undefined') {
            console.log('✅ UniversalAutoSync已存在');
        } else {
            // 创建一个简单的检测增强器
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (window.universalAutoSync && typeof window.universalAutoSync.checkSyncStatus === 'function') {
                        const originalCheckSyncStatus = window.universalAutoSync.checkSyncStatus;
                        window.universalAutoSync.checkSyncStatus = function() {
                            console.log('🔍 增强的同步状态检测开始...');
                            
                            // 先执行原始检测
                            const result = originalCheckSyncStatus.call(this);
                            
                            // 如果原始检测失败，尝试强制恢复
                            if (!result.enabled) {
                                console.log('🔄 原始检测失败，尝试强制恢复...');
                                
                                // 检查是否有同步配置文件存在
                                const keys = ['sync_config', 'syncConfig'];
                                for (const key of keys) {
                                    const config = localStorage.getItem(key);
                                    if (config) {
                                        try {
                                            const parsedConfig = JSON.parse(config);
                                            if (parsedConfig && parsedConfig.enabled) {
                                                console.log(`✅ 通过${key}强制恢复同步状态`);
                                                return {
                                                    enabled: true,
                                                    provider: parsedConfig.provider,
                                                    method: '强制恢复',
                                                    autoSyncEnabled: true
                                                };
                                            }
                                        } catch (e) {
                                            // 继续检查下一个
                                        }
                                    }
                                }
                            }
                            
                            return result;
                        };
                        console.log('✅ UniversalAutoSync检测逻辑已增强');
                    }
                }, 3000);
            });
        }
    }
    
    /**
     * 添加同步恢复机制
     */
    function addSyncRecoveryMechanism() {
        console.log('🛠️ 添加同步恢复机制...');
        
        // 创建恢复按钮（仅在检测到配置但同步未启用时显示）
        function createRecoveryButton() {
            // 检查是否有配置但同步未启用
            const hasConfig = localStorage.getItem('sync_config') || localStorage.getItem('syncConfig');
            if (!hasConfig) {
                return;
            }
            
            let syncWorking = false;
            try {
                if (window.syncService && window.syncService.getSyncStatus) {
                    const status = window.syncService.getSyncStatus();
                    syncWorking = status && status.enabled;
                }
            } catch (e) {
                // 检测失败，假设需要恢复
            }
            
            if (syncWorking) {
                console.log('✅ 同步功能正常工作，无需恢复按钮');
                return;
            }
            
            // 创建恢复按钮
            const button = document.createElement('button');
            button.textContent = '🔄 恢复云同步';
            button.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                padding: 8px 16px;
                background: #ff9800;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            
            button.onclick = function() {
                recoverSyncConfiguration();
                button.remove();
            };
            
            document.body.appendChild(button);
            console.log('✅ 同步恢复按钮已添加');
            
            // 5秒后自动移除按钮
            setTimeout(() => {
                if (button.parentNode) {
                    button.remove();
                }
            }, 5000);
        }
        
        // 恢复同步配置的函数
        function recoverSyncConfiguration() {
            console.log('🔄 开始恢复同步配置...');
            
            try {
                const config = localStorage.getItem('sync_config') || localStorage.getItem('syncConfig');
                if (!config) {
                    alert('未找到同步配置，请重新设置云同步功能');
                    return;
                }
                
                const parsedConfig = JSON.parse(config);
                console.log('📋 找到同步配置:', parsedConfig);
                
                // 确保所有键名都有配置
                localStorage.setItem('sync_config', JSON.stringify(parsedConfig));
                localStorage.setItem('syncConfig', JSON.stringify(parsedConfig));
                
                // 显示恢复进度
                const progressDiv = document.createElement('div');
                progressDiv.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.9);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 10002;
                    text-align: center;
                    min-width: 300px;
                `;
                progressDiv.innerHTML = '🔄 正在恢复同步配置和数据...<br><br>第1步: 重新初始化同步服务...';
                document.body.appendChild(progressDiv);
                
                // 重新初始化同步服务
                setTimeout(() => {
                    progressDiv.innerHTML = '🔄 正在恢复同步配置和数据...<br><br>第2步: 启用同步功能...';
                    
                    if (window.syncService && typeof window.syncService.initSyncConfig === 'function') {
                        window.syncService.initSyncConfig();
                        console.log('✅ 同步服务已重新初始化');
                    }
                    
                    setTimeout(() => {
                        progressDiv.innerHTML = '🔄 正在恢复同步配置和数据...<br><br>第3步: 从云端恢复数据...';
                        
                        // 尝试从云端恢复数据
                        if (window.syncService && window.syncService.syncEnabled) {
                            window.syncService.syncData().then(() => {
                                progressDiv.innerHTML = '✅ 同步配置和数据恢复完成！<br><br>页面即将刷新...';
                                setTimeout(() => {
                                    location.reload();
                                }, 2000);
                            }).catch(error => {
                                console.warn('⚠️ 数据恢复失败:', error);
                                progressDiv.innerHTML = '⚠️ 配置已恢复，但数据恢复失败<br><br>页面即将刷新...';
                                setTimeout(() => {
                                    location.reload();
                                }, 2000);
                            });
                        } else {
                            progressDiv.innerHTML = '✅ 同步配置已恢复！<br><br>页面即将刷新...';
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        }
                    }, 1000);
                }, 1000);
                
            } catch (error) {
                console.error('❌ 恢复同步配置失败:', error);
                alert('恢复同步配置失败，请手动重新设置');
            }
        }
        
        // 延迟创建恢复按钮，确保页面加载完成
        setTimeout(createRecoveryButton, 2000);
    }
    
})();
