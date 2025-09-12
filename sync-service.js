/**
 * 计划管理器 - 数据同步服务
 * 支持多种云存储后端的数据同步功能
 * Author: Plan Manager Team
 * Version: 1.0.0
 */

class SyncService {
    constructor() {
        this.syncEnabled = false;
        this.syncProvider = null;
        this.lastSyncTime = null;
        this.syncInterval = 30000; // 30秒自动同步间隔
        this.autoSyncTimer = null;
        this.conflictResolver = new ConflictResolver();
        
        // 初始化同步配置
        this.initSyncConfig();
    }

    /**
     * 初始化同步配置
     */
    initSyncConfig() {
        const config = this.getSyncConfig();
        if (config && config.enabled) {
            this.enableSync(config.provider, config.settings);
        }
    }

    /**
     * 获取同步配置
     * @returns {Object|null} 同步配置
     */
    getSyncConfig() {
        try {
            return JSON.parse(localStorage.getItem('sync_config'));
        } catch (error) {
            console.error('获取同步配置失败:', error);
            return null;
        }
    }

    /**
     * 保存同步配置
     * @param {Object} config 同步配置
     */
    setSyncConfig(config) {
        try {
            localStorage.setItem('sync_config', JSON.stringify(config));
            console.log('✅ 同步配置已保存');
        } catch (error) {
            console.error('❌ 保存同步配置失败:', error);
        }
    }

    /**
     * 启用同步功能
     * @param {string} provider 同步提供商 ('github', 'drive', 'server')
     * @param {Object} settings 提供商设置
     */
    async enableSync(provider, settings) {
        try {
            // 创建对应的同步提供商实例
            switch (provider) {
                case 'github':
                    this.syncProvider = new GitHubSyncProvider(settings);
                    break;
                case 'drive':
                    this.syncProvider = new GoogleDriveSyncProvider(settings);
                    break;
                case 'server':
                    this.syncProvider = new ServerSyncProvider(settings);
                    break;
                default:
                    throw new Error(`不支持的同步提供商: ${provider}`);
            }

            // 验证连接
            await this.syncProvider.connect();
            
            this.syncEnabled = true;
            this.lastSyncTime = new Date().toISOString();
            
            // 保存配置
            this.setSyncConfig({
                enabled: true,
                provider: provider,
                settings: settings,
                lastSync: this.lastSyncTime
            });

            // 启动自动同步
            this.startAutoSync();
            
            console.log(`✅ ${provider} 同步已启用`);
            this.showSyncStatus('已连接', 'success');
            
            // 执行首次同步
            await this.performSync();
            
        } catch (error) {
            console.error('❌ 启用同步失败:', error);
            this.showSyncStatus('连接失败', 'error');
            throw error;
        }
    }

    /**
     * 禁用同步功能
     */
    disableSync() {
        this.syncEnabled = false;
        this.syncProvider = null;
        this.stopAutoSync();
        
        // 清除配置
        localStorage.removeItem('sync_config');
        
        console.log('🔄 同步已禁用');
        this.showSyncStatus('已断开', 'warning');
    }

    /**
     * 启动自动同步
     */
    startAutoSync() {
        this.stopAutoSync(); // 先停止现有的定时器
        
        this.autoSyncTimer = setInterval(async () => {
            if (this.syncEnabled && navigator.onLine) {
                try {
                    await this.performSync();
                } catch (error) {
                    console.error('自动同步失败:', error);
                }
            }
        }, this.syncInterval);
        
        console.log('🔄 自动同步已启动');
    }

    /**
     * 停止自动同步
     */
    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
            console.log('⏹️ 自动同步已停止');
        }
    }

    /**
     * 执行同步操作
     */
    async performSync() {
        if (!this.syncEnabled || !this.syncProvider) {
            throw new Error('同步未启用');
        }

        this.showSyncStatus('同步中...', 'info');
        
        try {
            // 1. 获取本地数据
            const localData = this.getLocalData();
            
            // 2. 获取远程数据
            const remoteData = await this.syncProvider.downloadData();
            
            // 3. 合并数据（处理冲突）
            const mergedData = this.conflictResolver.resolve(localData, remoteData);
            
            // 4. 更新本地数据
            this.updateLocalData(mergedData);
            
            // 5. 上传合并后的数据
            await this.syncProvider.uploadData(mergedData);
            
            // 6. 更新同步时间
            this.lastSyncTime = new Date().toISOString();
            const config = this.getSyncConfig();
            if (config) {
                config.lastSync = this.lastSyncTime;
                this.setSyncConfig(config);
            }
            
            console.log('✅ 数据同步完成');
            this.showSyncStatus('同步完成', 'success');
            
            // 触发同步完成事件
            this.dispatchSyncEvent('sync-complete', { timestamp: this.lastSyncTime });
            
        } catch (error) {
            console.error('❌ 同步失败:', error);
            this.showSyncStatus('同步失败', 'error');
            throw error;
        }
    }

    /**
     * 手动触发同步
     */
    async manualSync() {
        if (!navigator.onLine) {
            this.showSyncStatus('网络离线', 'warning');
            return;
        }
        
        try {
            await this.performSync();
        } catch (error) {
            console.error('手动同步失败:', error);
            throw error;
        }
    }

    /**
     * 获取本地所有数据
     * @returns {Object} 本地数据
     */
    getLocalData() {
        const data = {
            metadata: {
                version: '1.0.0',
                deviceId: this.getDeviceId(),
                exportTime: new Date().toISOString(),
                platform: this.getPlatform()
            },
            planData: {},
            settings: {}
        };

        // 获取所有计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
        planTypes.forEach(type => {
            const key = `planData_${type}`;
            const planData = localStorage.getItem(key);
            if (planData) {
                try {
                    data.planData[type] = JSON.parse(planData);
                } catch (error) {
                    console.error(`解析${type}计划数据失败:`, error);
                }
            }
        });

        // 获取其他重要数据
        const otherKeys = [
            'habitTrackerData',
            'gratitude_history',
            'mood_history', // 修复：mood_tracker.html实际使用的键名
            'mood_tracker_data', // 保留兼容性
            'reflection_templates',
            'reflection_history',
            'reflection_to_dayplan', // 反思到日计划的数据传递
            'monthlyEvents',
            'customTemplates',
            'syncConfig' // 同步配置（跨设备同步配置）
        ];
        
        otherKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (error) {
                    console.error(`解析${key}数据失败:`, error);
                }
            }
        });

        // 获取动态键名数据（如reflection_YYYY-MM-DD）
        const dynamicPatterns = [
            'reflection_' // reflection_2024-01-01 格式
        ];
        
        dynamicPatterns.forEach(pattern => {
            const dynamicData = {};
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(pattern)) {
                    try {
                        dynamicData[key] = JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        console.error(`解析动态数据${key}失败:`, error);
                    }
                }
            });
            if (Object.keys(dynamicData).length > 0) {
                data.dynamicData = data.dynamicData || {};
                data.dynamicData[pattern] = dynamicData;
            }
        });

        return data;
    }

    /**
     * 更新本地数据
     * @param {Object} data 要更新的数据
     */
    updateLocalData(data) {
        try {
            // 更新计划数据
            if (data.planData) {
                Object.keys(data.planData).forEach(type => {
                    const key = `planData_${type}`;
                    localStorage.setItem(key, JSON.stringify(data.planData[type]));
                });
            }

            // 更新其他数据
            const otherKeys = [
                'habitTrackerData',
                'gratitude_history',
                'mood_history', // 修复：mood_tracker.html实际使用的键名
                'mood_tracker_data', // 保留兼容性
                'reflection_templates',
                'reflection_history',
                'reflection_to_dayplan', // 反思到日计划的数据传递
                'monthlyEvents',
                'customTemplates',
                'syncConfig' // 同步配置（跨设备同步配置）
            ];
            
            otherKeys.forEach(key => {
                if (data[key]) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            });

            // 更新动态数据
            if (data.dynamicData) {
                Object.keys(data.dynamicData).forEach(pattern => {
                    const patternData = data.dynamicData[pattern];
                    Object.keys(patternData).forEach(key => {
                        localStorage.setItem(key, JSON.stringify(patternData[key]));
                    });
                });
            }

            console.log('✅ 本地数据已更新');
            
            // 触发数据更新事件
            this.dispatchSyncEvent('data-updated', { timestamp: new Date().toISOString() });
            
        } catch (error) {
            console.error('❌ 更新本地数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取设备ID
     * @returns {string} 设备ID
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    /**
     * 获取平台信息
     * @returns {string} 平台信息
     */
    getPlatform() {
        if (window.electronAPI) {
            return 'desktop-electron';
        } else if (window.navigator.standalone) {
            return 'mobile-pwa';
        } else {
            return 'web-browser';
        }
    }

    /**
     * 显示同步状态
     * @param {string} message 状态消息
     * @param {string} type 状态类型 ('success', 'error', 'warning', 'info')
     */
    showSyncStatus(message, type = 'info') {
        // 创建或更新状态元素
        let statusElement = document.getElementById('sync-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'sync-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10000;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(statusElement);
        }

        // 设置状态样式
        const styles = {
            success: 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;',
            error: 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;',
            warning: 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;',
            info: 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;'
        };

        statusElement.style.cssText += styles[type];
        statusElement.textContent = message;

        // 自动隐藏
        setTimeout(() => {
            if (statusElement && statusElement.parentNode) {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    if (statusElement && statusElement.parentNode) {
                        statusElement.parentNode.removeChild(statusElement);
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * 触发同步事件
     * @param {string} eventName 事件名称
     * @param {Object} detail 事件详情
     */
    dispatchSyncEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    /**
     * 获取同步状态信息
     * @returns {Object} 同步状态
     */
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            provider: this.syncProvider ? this.syncProvider.name : null,
            lastSync: this.lastSyncTime,
            online: navigator.onLine,
            autoSync: !!this.autoSyncTimer
        };
    }
}

/**
 * 冲突解决器
 * 处理本地和远程数据之间的冲突
 */
class ConflictResolver {
    /**
     * 解决数据冲突
     * @param {Object} localData 本地数据
     * @param {Object} remoteData 远程数据
     * @returns {Object} 合并后的数据
     */
    resolve(localData, remoteData) {
        if (!remoteData || Object.keys(remoteData).length === 0) {
            console.log('远程数据为空，使用本地数据');
            return localData;
        }

        if (!localData || Object.keys(localData).length === 0) {
            console.log('本地数据为空，使用远程数据');
            return remoteData;
        }

        console.log('开始合并本地和远程数据...');
        
        const merged = {
            metadata: {
                ...localData.metadata,
                mergeTime: new Date().toISOString()
            },
            planData: {},
            settings: {}
        };

        // 合并计划数据
        if (localData.planData && remoteData.planData) {
            merged.planData = this.mergePlanData(localData.planData, remoteData.planData);
        } else {
            merged.planData = localData.planData || remoteData.planData || {};
        }

        // 合并其他数据
        const dataKeys = [
            'habitTrackerData',
            'gratitude_history',
            'mood_history', // 修复：mood_tracker.html实际使用的键名
            'mood_tracker_data', // 保留兼容性
            'reflection_templates',
            'reflection_history',
            'reflection_to_dayplan', // 反思到日计划的数据传递
            'monthlyEvents',
            'customTemplates',
            'syncConfig' // 同步配置（跨设备同步配置）
        ];

        dataKeys.forEach(key => {
            if (localData[key] || remoteData[key]) {
                merged[key] = this.mergeGenericData(localData[key], remoteData[key]);
            }
        });

        // 合并动态数据
        if (localData.dynamicData || remoteData.dynamicData) {
            merged.dynamicData = {};
            const allPatterns = new Set([
                ...Object.keys(localData.dynamicData || {}),
                ...Object.keys(remoteData.dynamicData || {})
            ]);
            
            allPatterns.forEach(pattern => {
                const localPattern = localData.dynamicData?.[pattern] || {};
                const remotePattern = remoteData.dynamicData?.[pattern] || {};
                merged.dynamicData[pattern] = this.mergeDateBasedData(localPattern, remotePattern);
            });
        }

        console.log('✅ 数据合并完成');
        return merged;
    }

    /**
     * 合并计划数据
     * @param {Object} local 本地计划数据
     * @param {Object} remote 远程计划数据
     * @returns {Object} 合并后的计划数据
     */
    mergePlanData(local, remote) {
        const merged = {};
        const allTypes = new Set([...Object.keys(local), ...Object.keys(remote)]);

        allTypes.forEach(type => {
            const localPlans = local[type] || {};
            const remotePlans = remote[type] || {};
            
            merged[type] = this.mergeDateBasedData(localPlans, remotePlans);
        });

        return merged;
    }

    /**
     * 合并基于日期的数据
     * @param {Object} local 本地数据
     * @param {Object} remote 远程数据
     * @returns {Object} 合并后的数据
     */
    mergeDateBasedData(local, remote) {
        const merged = {};
        const allDates = new Set([...Object.keys(local), ...Object.keys(remote)]);

        allDates.forEach(date => {
            const localItem = local[date];
            const remoteItem = remote[date];

            if (!localItem) {
                merged[date] = remoteItem;
            } else if (!remoteItem) {
                merged[date] = localItem;
            } else {
                // 两者都存在，比较最后修改时间
                const localTime = new Date(localItem.lastModified || 0);
                const remoteTime = new Date(remoteItem.lastModified || 0);
                
                if (localTime >= remoteTime) {
                    merged[date] = localItem;
                    console.log(`使用本地数据: ${date} (本地更新)`);
                } else {
                    merged[date] = remoteItem;
                    console.log(`使用远程数据: ${date} (远程更新)`);
                }
            }
        });

        return merged;
    }

    /**
     * 合并通用数据
     * @param {any} local 本地数据
     * @param {any} remote 远程数据
     * @returns {any} 合并后的数据
     */
    mergeGenericData(local, remote) {
        if (!remote) return local;
        if (!local) return remote;

        // 如果是对象，尝试深度合并
        if (typeof local === 'object' && typeof remote === 'object') {
            return { ...remote, ...local }; // 本地优先
        }

        // 其他情况，本地优先
        return local;
    }
}

// 创建全局同步服务实例
window.syncService = new SyncService();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SyncService, ConflictResolver };
}
