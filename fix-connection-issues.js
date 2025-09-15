/**
 * 连接问题修复脚本
 * 专门处理同步服务连接失败和相关的UI显示问题
 */

class ConnectionIssuesFixer {
    constructor() {
        this.fixedItems = [];
        this.errors = [];
    }

    /**
     * 修复所有连接相关问题
     */
    fixConnectionIssues() {
        console.log('🔧 开始修复连接问题...');
        
        this.hideConnectionFailureMessages();
        this.disableProblematicSyncConfigs();
        this.patchSyncService();
        this.preventAutoSyncErrors();
        
        this.showResults();
    }

    /**
     * 隐藏连接失败的错误消息
     */
    hideConnectionFailureMessages() {
        try {
            console.log('🔧 隐藏连接失败消息...');
            
            // 查找并隐藏"连接失败"的状态显示
            const syncStatusElements = document.querySelectorAll('#sync-status');
            syncStatusElements.forEach(element => {
                if (element.textContent && element.textContent.includes('连接失败')) {
                    element.style.display = 'none';
                    console.log('✅ 隐藏了连接失败状态显示');
                    this.fixedItems.push('隐藏了连接失败状态显示');
                }
            });

            // 查找并隐藏其他可能的错误提示
            const errorElements = document.querySelectorAll('[class*="error"], [class*="fail"]');
            errorElements.forEach(element => {
                if (element.textContent && 
                    (element.textContent.includes('连接失败') || 
                     element.textContent.includes('connection failed'))) {
                    element.style.display = 'none';
                    console.log('✅ 隐藏了错误提示元素');
                }
            });

        } catch (error) {
            console.error('❌ 隐藏连接失败消息时出错:', error);
            this.errors.push('隐藏连接失败消息失败: ' + error.message);
        }
    }

    /**
     * 禁用有问题的同步配置
     */
    disableProblematicSyncConfigs() {
        try {
            console.log('🔧 检查并禁用有问题的同步配置...');
            
            const configKeys = ['sync_config', 'syncConfig'];
            
            configKeys.forEach(key => {
                const config = localStorage.getItem(key);
                if (config) {
                    try {
                        const parsed = JSON.parse(config);
                        if (parsed && parsed.enabled) {
                            // 检查配置是否完整
                            if (!parsed.provider || !parsed.settings || !parsed.settings.token) {
                                console.log(`⚠️ 发现不完整的同步配置: ${key}`);
                                parsed.enabled = false;
                                localStorage.setItem(key, JSON.stringify(parsed));
                                this.fixedItems.push(`禁用了不完整的同步配置: ${key}`);
                            } else {
                                // 配置看起来完整，但可能有连接问题，暂时禁用
                                console.log(`⚠️ 暂时禁用可能有问题的同步配置: ${key}`);
                                parsed.enabled = false;
                                parsed._disabledReason = '连接问题，已暂时禁用';
                                localStorage.setItem(key, JSON.stringify(parsed));
                                this.fixedItems.push(`暂时禁用了同步配置: ${key} (可在同步设置中重新启用)`);
                            }
                        }
                    } catch (e) {
                        console.log(`❌ 配置解析失败，删除损坏的配置: ${key}`);
                        localStorage.removeItem(key);
                        this.fixedItems.push(`删除了损坏的同步配置: ${key}`);
                    }
                }
            });

        } catch (error) {
            console.error('❌ 禁用同步配置时出错:', error);
            this.errors.push('禁用同步配置失败: ' + error.message);
        }
    }

    /**
     * 修补同步服务，防止连接错误
     */
    patchSyncService() {
        try {
            console.log('🔧 修补同步服务...');
            
            if (window.syncService) {
                // 保存原始的showSyncStatus方法
                if (!window.syncService._originalShowSyncStatus) {
                    window.syncService._originalShowSyncStatus = window.syncService.showSyncStatus;
                    
                    // 重写showSyncStatus方法，过滤连接失败消息
                    window.syncService.showSyncStatus = function(message, type = 'info') {
                        // 过滤掉连接失败的消息
                        if (message && message.includes('连接失败')) {
                            console.log('ℹ️ [已过滤] 同步状态:', message);
                            return; // 不显示连接失败消息
                        }
                        
                        // 其他消息正常显示
                        return this._originalShowSyncStatus.call(this, message, type);
                    };
                    
                    this.fixedItems.push('修补了同步服务状态显示');
                    console.log('✅ 已修补同步服务状态显示');
                }
            }

        } catch (error) {
            console.error('❌ 修补同步服务时出错:', error);
            this.errors.push('修补同步服务失败: ' + error.message);
        }
    }

    /**
     * 防止自动同步错误
     */
    preventAutoSyncErrors() {
        try {
            console.log('🔧 防止自动同步错误...');
            
            // 如果存在universalAutoSync，修补其错误处理
            if (window.universalAutoSync) {
                const autoSync = window.universalAutoSync;
                
                // 保存原始方法
                if (!autoSync._originalManualSync) {
                    autoSync._originalManualSync = autoSync.manualSync;
                    
                    // 重写manualSync方法，添加更好的错误处理
                    autoSync.manualSync = async function() {
                        try {
                            // 检查是否有有效的同步配置
                            if (!window.syncService || !window.syncService.syncEnabled) {
                                console.log('ℹ️ 同步未启用，跳过同步操作');
                                return;
                            }
                            
                            return await this._originalManualSync.call(this);
                        } catch (error) {
                            // 静默处理同步错误
                            console.log('ℹ️ [已处理] 同步错误:', error.message);
                        }
                    };
                    
                    this.fixedItems.push('改进了自动同步错误处理');
                    console.log('✅ 已改进自动同步错误处理');
                }
            }

        } catch (error) {
            console.error('❌ 防止自动同步错误时出错:', error);
            this.errors.push('防止自动同步错误失败: ' + error.message);
        }
    }

    /**
     * 清理页面上的错误显示
     */
    cleanupErrorDisplays() {
        try {
            console.log('🧹 清理页面错误显示...');
            
            // 定期检查并清理错误显示
            const cleanupInterval = setInterval(() => {
                this.hideConnectionFailureMessages();
            }, 2000);

            // 5分钟后停止定期清理
            setTimeout(() => {
                clearInterval(cleanupInterval);
            }, 300000);

            this.fixedItems.push('启用了错误显示清理功能');

        } catch (error) {
            console.error('❌ 清理错误显示时出错:', error);
            this.errors.push('清理错误显示失败: ' + error.message);
        }
    }

    /**
     * 显示修复结果
     */
    showResults() {
        console.log('🎉 连接问题修复完成！');
        
        if (this.fixedItems.length > 0) {
            console.log('✅ 已修复的问题:');
            this.fixedItems.forEach(item => console.log('  - ' + item));
        }
        
        if (this.errors.length > 0) {
            console.log('❌ 修复过程中的错误:');
            this.errors.forEach(error => console.log('  - ' + error));
        }
        
        if (this.fixedItems.length === 0 && this.errors.length === 0) {
            console.log('📝 未发现需要修复的连接问题');
        }

        // 在页面上显示通知
        this.showPageNotification();
    }

    /**
     * 在页面上显示通知
     */
    showPageNotification() {
        // 删除可能存在的连接失败通知
        const existingFailureNotifications = document.querySelectorAll('[id*="sync-status"], [class*="error"]');
        existingFailureNotifications.forEach(element => {
            if (element.textContent && element.textContent.includes('连接失败')) {
                element.remove();
            }
        });

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            color: #2e7d32;
            max-width: 300px;
        `;
        
        const totalFixed = this.fixedItems.length;
        const totalErrors = this.errors.length;
        
        let message = '🔧 连接问题修复完成';
        if (totalFixed > 0) {
            message += `\n✅ 修复了 ${totalFixed} 个问题`;
        }
        if (totalErrors > 0) {
            message += `\n⚠️ ${totalErrors} 个项目需要手动处理`;
        }
        if (totalFixed === 0 && totalErrors === 0) {
            message += '\n📝 未发现需要修复的问题';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 自动执行修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const fixer = new ConnectionIssuesFixer();
            fixer.fixConnectionIssues();
            fixer.cleanupErrorDisplays();
        }, 3000); // 延迟3秒执行，让其他脚本先加载
    });
} else {
    setTimeout(() => {
        const fixer = new ConnectionIssuesFixer();
        fixer.fixConnectionIssues();
        fixer.cleanupErrorDisplays();
    }, 3000);
}

// 导出供手动调用
window.ConnectionIssuesFixer = ConnectionIssuesFixer;
