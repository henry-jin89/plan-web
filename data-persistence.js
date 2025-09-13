/**
 * 数据持久化增强模块
 * 实现自动数据同步和恢复机制，确保数据不会因为清除浏览器数据而丢失
 */

// 数据持久化管理器
const DataPersistenceManager = {
    // 同步状态
    syncEnabled: false,
    syncProvider: null,
    lastSyncTime: null,
    
    /**
     * 初始化数据持久化管理器
     */
    init: function() {
        console.log('🔧 初始化数据持久化管理器...');
        
        // 检查是否已配置同步
        this.checkSyncConfiguration();
        
        // 设置自动保存监听器
        this.setupAutoSave();
        
        // 设置页面卸载时的数据保存
        this.setupPageUnloadSave();
        
        // 检查并恢复数据
        this.checkAndRestoreData();
        
        console.log('✅ 数据持久化管理器初始化完成');
    },
    
    /**
     * 检查同步配置
     */
    checkSyncConfiguration: function() {
        try {
            const syncConfig = JSON.parse(localStorage.getItem('syncConfig') || '{}');
            if (syncConfig.enabled && syncConfig.provider) {
                this.syncEnabled = true;
                this.syncProvider = syncConfig.provider;
                this.lastSyncTime = syncConfig.lastSync;
                console.log('📡 检测到同步配置:', syncConfig.provider);
                
                // 自动执行一次数据同步
                setTimeout(() => {
                    this.performSync();
                }, 3000);
            } else {
                console.log('⚠️ 未配置数据同步，建议前往同步设置页面配置');
                this.showSyncRecommendation();
            }
        } catch (error) {
            console.error('❌ 检查同步配置失败:', error);
        }
    },
    
    /**
     * 设置自动保存监听器
     */
    setupAutoSave: function() {
        // 监听数据变化事件
        window.addEventListener('planDataChanged', (event) => {
            console.log('📝 检测到计划数据变化:', event.detail);
            
            // 延迟保存，避免频繁触发
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.performAutoSave(event.detail);
            }, 2000);
        });
        
        // 监听输入事件
        document.addEventListener('input', (event) => {
            if (event.target.closest('.todo-list-container') || 
                event.target.id === 'day_reflection' || 
                event.target.id === 'day_goals') {
                
                // 触发计划数据变化事件
                window.dispatchEvent(new CustomEvent('planDataChanged', {
                    detail: {
                        type: 'input',
                        element: event.target.id || event.target.className,
                        timestamp: new Date().toISOString()
                    }
                }));
            }
        });
    },
    
    /**
     * 设置页面卸载时的数据保存
     */
    setupPageUnloadSave: function() {
        // 页面隐藏时保存（用户切换应用或关闭浏览器）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 页面隐藏，执行数据保存...');
                this.performEmergencySave();
            } else {
                console.log('📱 页面显示，检查数据同步...');
                setTimeout(() => {
                    this.checkAndRestoreData();
                }, 1000);
            }
        });
        
        // 页面卸载前保存
        window.addEventListener('beforeunload', () => {
            console.log('🚪 页面即将卸载，执行最终数据保存...');
            this.performEmergencySave();
        });
        
        // PWA 应用暂停时保存  
        window.addEventListener('pagehide', () => {
            console.log('📴 应用暂停，保存数据...');
            this.performEmergencySave();
        });
    },
    
    /**
     * 检查并恢复数据
     */
    checkAndRestoreData: function() {
        console.log('🔍 检查是否需要恢复数据...');
        
        // 检查本地存储是否为空
        const hasLocalData = this.checkLocalDataExists();
        
        if (!hasLocalData && this.syncEnabled) {
            console.log('📥 本地数据为空，尝试从云端恢复...');
            this.performDataRestore();
        } else if (hasLocalData) {
            console.log('✅ 本地数据存在，检查是否需要同步...');
            if (this.syncEnabled) {
                this.performSync();
            }
        } else {
            console.log('💭 这是第一次使用，显示欢迎信息...');
            this.showWelcomeMessage();
        }
    },
    
    /**
     * 检查本地数据是否存在
     */
    checkLocalDataExists: function() {
        const planTypes = ['day', 'week', 'month', 'quarter', 'year'];
        
        for (const type of planTypes) {
            const planData = localStorage.getItem(`planData_${type}`);
            if (planData && planData !== '{}') {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * 执行自动保存
     */
    performAutoSave: function(changeDetail) {
        try {
            console.log('💾 执行自动保存...', changeDetail);
            
            // 保存到本地备份
            this.saveToLocalBackup();
            
            // 如果启用了同步，执行云端保存
            if (this.syncEnabled) {
                clearTimeout(this.syncTimer);
                this.syncTimer = setTimeout(() => {
                    this.performSync();
                }, 5000); // 5秒后同步
            }
            
        } catch (error) {
            console.error('❌ 自动保存失败:', error);
        }
    },
    
    /**
     * 执行紧急保存
     */
    performEmergencySave: function() {
        try {
            // 立即保存到本地备份
            this.saveToLocalBackup();
            
            // 如果启用同步，尝试快速同步
            if (this.syncEnabled && navigator.onLine) {
                // 使用 sendBeacon 进行快速同步（不会被页面卸载中断）
                this.performBeaconSync();
            }
            
        } catch (error) {
            console.error('❌ 紧急保存失败:', error);
        }
    },
    
    /**
     * 保存到本地备份
     */
    saveToLocalBackup: function() {
        try {
            const timestamp = new Date().toISOString();
            const backupData = {
                timestamp: timestamp,
                data: {}
            };
            
            // 收集所有计划数据
            const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
            planTypes.forEach(type => {
                const planData = localStorage.getItem(`planData_${type}`);
                if (planData) {
                    backupData.data[`planData_${type}`] = JSON.parse(planData);
                }
            });
            
            // 收集其他重要数据
            const otherKeys = [
                'habitTrackerData', 
                'gratitude_history',
                'mood_history',
                'reflection_templates',
                'reflection_history',
                'reflection_to_dayplan',
                'monthlyEvents',
                'customTemplates',
                'userSettings', 
                'syncConfig',
                'sync_config'
            ];
            otherKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    backupData.data[key] = JSON.parse(data);
                }
            });
            
            // 保存到多个备份位置
            localStorage.setItem('dataBackup_latest', JSON.stringify(backupData));
            localStorage.setItem('dataBackup_' + Date.now(), JSON.stringify(backupData));
            
            // 清理旧备份（保留最近10个）
            this.cleanOldBackups();
            
            console.log('✅ 本地备份保存成功:', timestamp);
            
        } catch (error) {
            console.error('❌ 本地备份保存失败:', error);
        }
    },
    
    /**
     * 清理旧备份
     */
    cleanOldBackups: function() {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('dataBackup_') && key !== 'dataBackup_latest') {
                    backupKeys.push({
                        key: key,
                        timestamp: parseInt(key.split('_')[1])
                    });
                }
            }
            
            // 按时间排序，删除多余的备份
            backupKeys.sort((a, b) => b.timestamp - a.timestamp);
            if (backupKeys.length > 10) {
                const toDelete = backupKeys.slice(10);
                toDelete.forEach(item => {
                    localStorage.removeItem(item.key);
                });
                console.log(`🗑️ 清理了 ${toDelete.length} 个旧备份`);
            }
            
        } catch (error) {
            console.error('❌ 清理旧备份失败:', error);
        }
    },
    
    /**
     * 执行数据同步
     */
    performSync: function() {
        if (!this.syncEnabled || !navigator.onLine) {
            console.log('⏸️ 同步已禁用或网络离线，跳过同步');
            return;
        }
        
        console.log('🔄 开始数据同步...');
        
        try {
            // 触发同步服务
            if (window.syncService && typeof window.syncService.manualSync === 'function') {
                window.syncService.manualSync()
                    .then(() => {
                        this.lastSyncTime = new Date().toISOString();
                        console.log('✅ 数据同步成功:', this.lastSyncTime);
                        
                        // 更新同步状态
                        this.updateSyncStatus();
                    })
                    .catch((error) => {
                        console.error('❌ 数据同步失败:', error);
                        this.handleSyncError(error);
                    });
            } else {
                console.warn('⚠️ 同步服务不可用，请检查 sync-service.js 是否正确加载');
            }
        } catch (error) {
            console.error('❌ 同步执行异常:', error);
        }
    },
    
    /**
     * 使用 Beacon API 进行快速同步
     */
    performBeaconSync: function() {
        try {
            // 收集当前数据
            const syncData = this.collectSyncData();
            
            // 如果有同步端点，使用 sendBeacon 发送数据
            if (this.syncProvider === 'github' && window.APP_CONFIG && window.APP_CONFIG.SYNC_ENDPOINT) {
                const success = navigator.sendBeacon(
                    window.APP_CONFIG.SYNC_ENDPOINT,
                    JSON.stringify(syncData)
                );
                
                if (success) {
                    console.log('📡 Beacon 同步已发送');
                } else {
                    console.warn('⚠️ Beacon 同步发送失败');
                }
            }
        } catch (error) {
            console.error('❌ Beacon 同步失败:', error);
        }
    },
    
    /**
     * 收集同步数据
     */
    collectSyncData: function() {
        const syncData = {
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        // 收集所有需要同步的数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('planData_') || key === 'habitTrackerData' || key === 'userSettings')) {
                try {
                    syncData.data[key] = JSON.parse(localStorage.getItem(key));
                } catch (error) {
                    console.warn(`跳过无效数据: ${key}`, error);
                }
            }
        }
        
        return syncData;
    },
    
    /**
     * 执行数据恢复
     */
    performDataRestore: function() {
        console.log('🔄 正在从云端恢复数据...');
        
        try {
            if (window.syncService && typeof window.syncService.downloadData === 'function') {
                window.syncService.downloadData()
                    .then((data) => {
                        if (data && Object.keys(data).length > 0) {
                            this.restoreDataFromSync(data);
                            console.log('✅ 数据恢复成功');
                            
                            // 显示恢复成功消息
                            this.showRestoreSuccessMessage();
                            
                            // 重新加载当前页面数据
                            this.reloadCurrentPageData();
                        } else {
                            console.log('📭 云端暂无数据，这是第一次使用');
                            this.showWelcomeMessage();
                        }
                    })
                    .catch((error) => {
                        console.error('❌ 数据恢复失败:', error);
                        this.showRestoreFailureMessage(error);
                    });
            }
        } catch (error) {
            console.error('❌ 数据恢复异常:', error);
        }
    },
    
    /**
     * 从同步数据恢复到本地
     */
    restoreDataFromSync: function(syncData) {
        try {
            if (syncData && typeof syncData === 'object') {
                Object.entries(syncData).forEach(([key, value]) => {
                    if (key.startsWith('planData_') || key === 'habitTrackerData' || key === 'userSettings') {
                        localStorage.setItem(key, JSON.stringify(value));
                        console.log(`📥 恢复数据: ${key}`);
                    }
                });
                
                // 创建恢复备份
                this.saveToLocalBackup();
            }
        } catch (error) {
            console.error('❌ 恢复数据到本地失败:', error);
        }
    },
    
    /**
     * 重新加载当前页面数据
     */
    reloadCurrentPageData: function() {
        try {
            // 触发数据重新加载事件
            window.dispatchEvent(new CustomEvent('dataRestored', {
                detail: { timestamp: new Date().toISOString() }
            }));
            
            // 尝试调用页面特定的重新加载函数
            if (typeof loadTodayPlan === 'function') {
                loadTodayPlan();
            }
            if (typeof loadWeekPlan === 'function') {
                loadWeekPlan();
            }
            if (typeof loadMonthPlan === 'function') {
                loadMonthPlan();
            }
            
        } catch (error) {
            console.error('❌ 重新加载页面数据失败:', error);
        }
    },
    
    /**
     * 处理同步错误
     */
    handleSyncError: function(error) {
        console.error('🚨 同步错误处理:', error);
        
        // 记录错误到本地
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message || error.toString(),
            stack: error.stack
        };
        
        let errorHistory = JSON.parse(localStorage.getItem('syncErrorHistory') || '[]');
        errorHistory.push(errorLog);
        
        // 只保留最近10个错误
        if (errorHistory.length > 10) {
            errorHistory = errorHistory.slice(-10);
        }
        
        localStorage.setItem('syncErrorHistory', JSON.stringify(errorHistory));
    },
    
    /**
     * 更新同步状态
     */
    updateSyncStatus: function() {
        try {
            const syncConfig = JSON.parse(localStorage.getItem('syncConfig') || '{}');
            syncConfig.lastSync = this.lastSyncTime;
            localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
            
            // 触发同步状态更新事件
            window.dispatchEvent(new CustomEvent('syncStatusUpdated', {
                detail: {
                    lastSync: this.lastSyncTime,
                    provider: this.syncProvider
                }
            }));
            
        } catch (error) {
            console.error('❌ 更新同步状态失败:', error);
        }
    },
    
    /**
     * 显示同步推荐信息
     */
    showSyncRecommendation: function() {
        // 检查是否已经显示过推荐
        const hasShownRecommendation = localStorage.getItem('hasShownSyncRecommendation');
        
        if (!hasShownRecommendation) {
            setTimeout(() => {
                const shouldShow = confirm(
                    '💡 建议设置数据同步功能，防止数据丢失！\n\n' +
                    '点击"确定"前往同步设置页面，\n' +
                    '点击"取消"稍后提醒。\n\n' +
                    '同步功能可以：\n' +
                    '• 防止清除浏览器数据导致计划丢失\n' +
                    '• 在多设备间同步您的计划\n' +
                    '• 自动备份重要数据'
                );
                
                if (shouldShow) {
                    window.open('sync-settings.html', '_blank');
                }
                
                localStorage.setItem('hasShownSyncRecommendation', 'true');
            }, 3000);
        }
    },
    
    /**
     * 显示欢迎信息
     */
    showWelcomeMessage: function() {
        console.log('👋 欢迎使用智能计划管理器！');
        
        // 可以在这里添加新用户引导
        setTimeout(() => {
            if (typeof showWelcomeGuide === 'function') {
                showWelcomeGuide();
            }
        }, 2000);
    },
    
    /**
     * 显示恢复成功消息
     */
    showRestoreSuccessMessage: function() {
        if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
            MessageUtils.success('🎉 数据恢复成功！您的计划已从云端同步回来。', 'success', 3000);
        } else {
            console.log('🎉 数据恢复成功！');
        }
    },
    
    /**
     * 显示恢复失败消息
     */
    showRestoreFailureMessage: function(error) {
        if (typeof MessageUtils !== 'undefined' && MessageUtils.error) {
            MessageUtils.error('❌ 数据恢复失败，请检查网络连接和同步配置。', 'error', 5000);
        } else {
            console.error('❌ 数据恢复失败:', error);
        }
    }
};

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他脚本加载完成
    setTimeout(() => {
        DataPersistenceManager.init();
    }, 1000);
});

// 暴露到全局作用域
window.DataPersistenceManager = DataPersistenceManager;

console.log('📦 数据持久化模块已加载');
