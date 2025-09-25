/**
 * 同步配置持久化管理器
 * 确保同步配置在各种情况下都能恢复
 */

class SyncPersistence {
    constructor() {
        this.configBackupKeys = [
            'sync_config_primary',
            'sync_config_backup1', 
            'sync_config_backup2',
            'sync_config_backup3'
        ];
        
        this.init();
    }
    
    init() {
        console.log('🔒 同步配置持久化管理器启动...');
        
        // 监听配置变化
        this.setupConfigWatcher();
        
        // 定期备份配置
        this.startPeriodicBackup();
        
        // 尝试恢复配置
        this.attemptConfigRecovery();
    }
    
    /**
     * 保存同步配置（多重备份）
     */
    saveConfig(config) {
        try {
            const configData = {
                ...config,
                timestamp: Date.now(),
                version: '1.0.0',
                browser: navigator.userAgent,
                url: window.location.origin
            };
            
            const configStr = JSON.stringify(configData);
            
            // 保存到所有备份位置
            this.configBackupKeys.forEach((key, index) => {
                try {
                    localStorage.setItem(key, configStr);
                    console.log(`✅ 配置已保存到 ${key}`);
                } catch (error) {
                    console.warn(`⚠️ 保存到 ${key} 失败:`, error);
                }
            });
            
            // 保存到URL Hash（临时）
            this.saveToUrlHash(configData);
            
            // 保存到IndexedDB（持久化）
            this.saveToIndexedDB(configData);
            
            // 保存到SessionStorage
            sessionStorage.setItem('current_sync_config', configStr);
            
            console.log('✅ 同步配置已多重备份');
            
        } catch (error) {
            console.error('❌ 保存同步配置失败:', error);
        }
    }
    
    /**
     * 加载同步配置
     */
    loadConfig() {
        // 尝试从各个位置恢复配置
        const sources = [
            () => this.loadFromSessionStorage(),
            () => this.loadFromLocalStorage(),
            () => this.loadFromIndexedDB(),
            () => this.loadFromUrlHash(),
            () => this.loadFromBrowserHistory()
        ];
        
        for (const loadSource of sources) {
            try {
                const config = loadSource();
                if (config && this.validateConfig(config)) {
                    console.log('✅ 成功恢复同步配置');
                    return config;
                }
            } catch (error) {
                console.log('尝试恢复配置失败:', error);
            }
        }
        
        console.log('❌ 未找到有效的同步配置');
        return null;
    }
    
    /**
     * 从SessionStorage加载
     */
    loadFromSessionStorage() {
        const config = sessionStorage.getItem('current_sync_config');
        if (config) {
            console.log('从SessionStorage恢复配置');
            return JSON.parse(config);
        }
        return null;
    }
    
    /**
     * 从LocalStorage加载
     */
    loadFromLocalStorage() {
        // 尝试所有备份位置
        for (const key of this.configBackupKeys) {
            const config = localStorage.getItem(key);
            if (config) {
                try {
                    const parsed = JSON.parse(config);
                    console.log(`从LocalStorage ${key} 恢复配置`);
                    return parsed;
                } catch (error) {
                    console.warn(`解析 ${key} 失败:`, error);
                }
            }
        }
        
        // 尝试标准键名
        const standardKeys = ['sync_config', 'syncConfig'];
        for (const key of standardKeys) {
            const config = localStorage.getItem(key);
            if (config) {
                try {
                    const parsed = JSON.parse(config);
                    console.log(`从标准LocalStorage ${key} 恢复配置`);
                    return parsed;
                } catch (error) {
                    console.warn(`解析标准键 ${key} 失败:`, error);
                }
            }
        }
        
        return null;
    }
    
    /**
     * 保存到IndexedDB
     */
    async saveToIndexedDB(config) {
        try {
            const dbName = 'PlanManagerDB';
            const storeName = 'syncConfig';
            
            const request = indexedDB.open(dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                store.put({
                    id: 'primary',
                    config: config,
                    timestamp: Date.now()
                });
                
                console.log('✅ 配置已保存到IndexedDB');
            };
            
        } catch (error) {
            console.warn('保存到IndexedDB失败:', error);
        }
    }
    
    /**
     * 从IndexedDB加载
     */
    loadFromIndexedDB() {
        return new Promise((resolve) => {
            try {
                const dbName = 'PlanManagerDB';
                const storeName = 'syncConfig';
                const request = indexedDB.open(dbName, 1);
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    
                    if (!db.objectStoreNames.contains(storeName)) {
                        resolve(null);
                        return;
                    }
                    
                    const transaction = db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const getRequest = store.get('primary');
                    
                    getRequest.onsuccess = () => {
                        if (getRequest.result) {
                            console.log('从IndexedDB恢复配置');
                            resolve(getRequest.result.config);
                        } else {
                            resolve(null);
                        }
                    };
                    
                    getRequest.onerror = () => resolve(null);
                };
                
                request.onerror = () => resolve(null);
                
                // 超时处理
                setTimeout(() => resolve(null), 2000);
                
            } catch (error) {
                console.warn('从IndexedDB加载失败:', error);
                resolve(null);
            }
        });
    }
    
    /**
     * 保存到URL Hash（临时访问）
     */
    saveToUrlHash(config) {
        try {
            // 创建恢复链接（仅包含必要信息）
            const recoveryInfo = {
                provider: config.provider,
                enabled: config.enabled,
                // 不保存敏感信息到URL
                hasConfig: true,
                timestamp: Date.now()
            };
            
            const encoded = btoa(JSON.stringify(recoveryInfo));
            
            // 不直接修改当前URL，而是准备恢复链接
            this.prepareRecoveryUrl(encoded);
            
        } catch (error) {
            console.warn('URL Hash保存失败:', error);
        }
    }
    
    /**
     * 从URL Hash加载
     */
    loadFromUrlHash() {
        try {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            
            const recoveryData = params.get('recovery');
            if (recoveryData) {
                const decoded = JSON.parse(atob(recoveryData));
                
                if (decoded.hasConfig && decoded.provider) {
                    console.log('从URL Hash发现恢复信息');
                    
                    // 清除URL中的恢复信息
                    window.location.hash = '';
                    
                    return {
                        provider: decoded.provider,
                        enabled: decoded.enabled,
                        needsRestore: true,
                        timestamp: decoded.timestamp
                    };
                }
            }
            
        } catch (error) {
            console.warn('URL Hash解析失败:', error);
        }
        
        return null;
    }
    
    /**
     * 从浏览器历史加载
     */
    loadFromBrowserHistory() {
        // 检查浏览器存储的访问历史
        try {
            if (window.history.state && window.history.state.syncConfig) {
                console.log('从浏览器历史恢复配置');
                return window.history.state.syncConfig;
            }
        } catch (error) {
            console.warn('浏览器历史读取失败:', error);
        }
        
        return null;
    }
    
    /**
     * 验证配置有效性
     */
    validateConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        
        // 检查基本字段
        if (!config.provider) {
            return false;
        }
        
        // 检查时间戳（不超过30天）
        if (config.timestamp) {
            const age = Date.now() - config.timestamp;
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
            if (age > maxAge) {
                console.log('配置已过期');
                return false;
            }
        }
        
        // 针对不同提供商的验证
        if (config.provider === 'github') {
            return this.validateGitHubConfig(config);
        }
        
        return true;
    }
    
    /**
     * 验证GitHub配置
     */
    validateGitHubConfig(config) {
        if (!config.settings) {
            return false;
        }
        
        const settings = config.settings;
        return !!(settings.token && settings.owner && settings.repo);
    }
    
    /**
     * 监听配置变化
     */
    setupConfigWatcher() {
        // 监听localStorage变化
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.includes('sync')) {
                console.log('检测到同步配置变化');
                this.onConfigChange(event);
            }
        });
        
        // 定期检查配置状态
        setInterval(() => {
            this.checkConfigIntegrity();
        }, 60000); // 每分钟检查一次
    }
    
    /**
     * 配置变化处理
     */
    onConfigChange(event) {
        try {
            if (event.newValue) {
                const config = JSON.parse(event.newValue);
                if (config.enabled) {
                    // 新的配置已启用，进行备份
                    this.saveConfig(config);
                }
            }
        } catch (error) {
            console.warn('处理配置变化失败:', error);
        }
    }
    
    /**
     * 检查配置完整性
     */
    checkConfigIntegrity() {
        const primaryConfig = localStorage.getItem(this.configBackupKeys[0]);
        
        if (primaryConfig) {
            // 检查其他备份是否完整
            for (let i = 1; i < this.configBackupKeys.length; i++) {
                const backupConfig = localStorage.getItem(this.configBackupKeys[i]);
                if (!backupConfig || backupConfig !== primaryConfig) {
                    // 修复备份
                    localStorage.setItem(this.configBackupKeys[i], primaryConfig);
                    console.log(`修复备份配置 ${this.configBackupKeys[i]}`);
                }
            }
        }
    }
    
    /**
     * 启动定期备份
     */
    startPeriodicBackup() {
        // 每10分钟备份一次当前配置
        setInterval(() => {
            this.performPeriodicBackup();
        }, 10 * 60 * 1000);
    }
    
    /**
     * 执行定期备份
     */
    performPeriodicBackup() {
        try {
            // 检查当前同步状态
            if (window.syncService && window.syncService.getSyncStatus) {
                const status = window.syncService.getSyncStatus();
                if (status && status.enabled) {
                    const config = window.syncService.getSyncConfig();
                    if (config) {
                        this.saveConfig(config);
                        console.log('定期备份完成');
                    }
                }
            }
        } catch (error) {
            console.warn('定期备份失败:', error);
        }
    }
    
    /**
     * 尝试恢复配置
     */
    attemptConfigRecovery() {
        setTimeout(async () => {
            const config = await this.loadConfig();
            
            if (config && config.enabled) {
                console.log('🔄 尝试自动恢复同步配置...');
                
                // 等待同步服务准备就绪
                await this.waitForSyncService();
                
                try {
                    if (config.needsRestore) {
                        // 需要用户确认的恢复
                        this.showConfigRestorePrompt(config);
                    } else {
                        // 直接恢复
                        await this.restoreConfig(config);
                    }
                } catch (error) {
                    console.log('自动恢复失败:', error);
                }
            }
        }, 2000);
    }
    
    /**
     * 等待同步服务
     */
    waitForSyncService() {
        return new Promise((resolve) => {
            let attempts = 0;
            const check = () => {
                if (window.syncService && window.syncService.enableSync) {
                    resolve();
                } else if (attempts < 20) {
                    attempts++;
                    setTimeout(check, 500);
                } else {
                    resolve(); // 超时也要继续
                }
            };
            check();
        });
    }
    
    /**
     * 恢复配置
     */
    async restoreConfig(config) {
        try {
            if (window.syncService && config.settings) {
                await window.syncService.enableSync(config.provider, config.settings);
                console.log('✅ 同步配置自动恢复成功');
                
                this.showRestoreSuccess();
            }
        } catch (error) {
            console.error('配置恢复失败:', error);
            this.showRestoreError(error);
        }
    }
    
    /**
     * 显示配置恢复提示
     */
    showConfigRestorePrompt(config) {
        const prompt = document.createElement('div');
        prompt.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 12px;
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        prompt.innerHTML = `
            <div style="color: #1976d2; font-weight: bold; margin-bottom: 8px;">
                🔄 发现同步配置
            </div>
            <div style="color: #666; margin-bottom: 12px; font-size: 14px;">
                检测到之前的${config.provider}同步配置，是否恢复？
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="syncPersistence.restoreConfig(${JSON.stringify(config).replace(/"/g, '&quot;')}); this.parentElement.parentElement.remove();" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">恢复</button>
                <button onclick="this.parentElement.parentElement.remove();" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">忽略</button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
    }
    
    /**
     * 显示恢复成功
     */
    showRestoreSuccess() {
        this.showMessage('✅ 同步配置已自动恢复', 'success');
    }
    
    /**
     * 显示恢复错误
     */
    showRestoreError(error) {
        this.showMessage(`❌ 配置恢复失败: ${error.message}`, 'error');
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const colors = {
            success: '#d4edda',
            error: '#f8d7da',
            info: '#d1ecf1'
        };
        
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            border-radius: 8px;
            padding: 12px 16px;
            max-width: 300px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        msg.textContent = message;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            if (msg.parentNode) {
                msg.remove();
            }
        }, 3000);
    }
    
    /**
     * 准备恢复URL
     */
    prepareRecoveryUrl(encoded) {
        // 为用户准备一个可以在其他设备使用的恢复链接
        const recoveryUrl = `${window.location.origin}${window.location.pathname}#recovery=${encoded}`;
        
        // 存储到剪贴板API（如果可用）
        if (navigator.clipboard) {
            navigator.clipboard.writeText(recoveryUrl).then(() => {
                console.log('恢复链接已准备就绪');
            }).catch(() => {
                console.log('无法自动复制恢复链接');
            });
        }
        
        // 也可以显示给用户
        console.log('恢复链接:', recoveryUrl);
    }
    
    /**
     * 清理过期配置
     */
    cleanupExpiredConfigs() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
        const now = Date.now();
        
        this.configBackupKeys.forEach(key => {
            try {
                const config = localStorage.getItem(key);
                if (config) {
                    const parsed = JSON.parse(config);
                    if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                        localStorage.removeItem(key);
                        console.log(`清理过期配置: ${key}`);
                    }
                }
            } catch (error) {
                // 解析失败的配置也清理掉
                localStorage.removeItem(key);
            }
        });
    }
}

// 创建全局实例
window.syncPersistence = new SyncPersistence();
