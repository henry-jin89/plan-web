/**
 * 联想个人云零配置同步服务
 * 比GitHub更简单，无需Token，只需要IP地址和用户名密码
 */

class LenovoCloudSync {
    constructor() {
        this.isEnabled = false;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.changeQueue = [];
        this.syncTimer = null;
        
        // 联想个人云配置 - 用户可以直接在这里修改
        this.defaultConfig = {
            enabled: false,  // 设置为true启用同步
            url: 'http://192.168.1.100:5005',  // 联想个人云WebDAV地址
            username: '',    // 用户名（请在lenovo-config.js中配置）
            password: '',    // 密码（请在lenovo-config.js中配置）
            timeout: 30000,  // 连接超时（毫秒）
            autoDetect: true // 是否自动检测设备
        };
        
        // 初始化
        this.init();
    }
    
    async init() {
        console.log('🏠 启动联想个人云零配置同步服务...');
        
        // 优先检查外部配置文件
        let configToUse = this.defaultConfig;
        
        if (window.LENOVO_CLOUD_CONFIG) {
            configToUse = { ...this.defaultConfig, ...window.LENOVO_CLOUD_CONFIG };
            console.log('✅ 使用外部配置文件 lenovo-config.js');
        }
        
        // 如果启用了自动检测，先尝试自动发现设备
        if (configToUse.autoDetect && !configToUse.url.includes('192.168')) {
            await this.autoDetectLenovoCloud();
            configToUse.url = this.defaultConfig.url;
        }
        
        this.defaultConfig = configToUse;
        
        // 检查配置是否有效
        if (this.isValidConfig(configToUse)) {
            console.log('✅ 使用联想个人云配置启动同步');
            this.isEnabled = true;
            
            // 设置数据变化监听
            this.setupChangeListeners();
            
            // 设置页面事件监听
            this.setupPageEventListeners();
            
            // 延迟3秒后执行首次同步
            setTimeout(() => {
                this.performInitialSync();
            }, 3000);
            
            // 启动定期同步
            this.startPeriodicSync();
            
            console.log('✅ 联想个人云同步服务已启用');
        } else {
            console.log('⚠️ 请配置联想个人云连接信息');
            this.showConfigHint();
        }
    }
    
    /**
     * 自动检测联想个人云设备
     */
    async autoDetectLenovoCloud() {
        console.log('🔍 正在自动检测联想个人云设备...');
        
        // 常见的联想个人云IP地址
        const commonIPs = [
            '192.168.1.100',
            '192.168.1.101', 
            '192.168.1.102',
            '192.168.0.100',
            '192.168.0.101',
            '192.168.31.100',
            '192.168.31.101'
        ];
        
        for (const ip of commonIPs) {
            try {
                const testUrl = `http://${ip}:5005`;
                console.log(`🔍 检测: ${testUrl}`);
                
                // 使用AbortController设置超时
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch(testUrl, {
                    method: 'OPTIONS',
                    signal: controller.signal
                });
                
                clearTimeout(timeout);
                
                // 如果收到响应（包括401认证错误），说明设备存在
                if (response.status === 401 || response.ok) {
                    this.defaultConfig.url = testUrl;
                    console.log(`✅ 发现联想个人云设备: ${testUrl}`);
                    return testUrl;
                }
            } catch (error) {
                // 继续检测下一个IP
                continue;
            }
        }
        
        console.log('⚠️ 未自动检测到联想个人云设备');
        return null;
    }
    
    /**
     * 验证配置是否有效
     */
    isValidConfig(config) {
        return config.enabled && 
               config.url && 
               config.username && 
               config.password &&
               config.url.includes('http');
    }
    
    /**
     * 显示配置提示
     */
    showConfigHint() {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 8px;
            padding: 20px;
            max-width: 350px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            color: #1976d2;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        hint.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">🏠 配置联想个人云同步</div>
            <div style="margin-bottom: 15px; font-size: 13px;">
                比GitHub更简单！只需要三个信息：
            </div>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px;">
                <li><strong>设备IP地址</strong>（如：192.168.1.100）</li>
                <li><strong>用户名</strong>（在联想云上创建的用户）</li>
                <li><strong>密码</strong></li>
            </ul>
            <div style="background: #f0f8ff; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 12px;">
                💡 <strong>提示：</strong>如果您不知道IP地址，系统会自动尝试检测常见地址
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button onclick="this.parentElement.remove()" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                ">我知道了</button>
                <button onclick="window.open('sync-settings.html', '_blank')" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 12px;
                ">去设置</button>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // 15秒后自动隐藏
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 15000);
    }
    
    /**
     * 设置数据变化监听
     */
    setupChangeListeners() {
        // 监听localStorage变化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(this, arguments);
            
            // 检查是否是需要同步的数据
            if (window.lenovoCloudSync && window.lenovoCloudSync.shouldSyncKey(key)) {
                window.lenovoCloudSync.onDataChange(key, value);
            }
            
            return result;
        };
        
        // 监听页面级数据变化事件
        window.addEventListener('planDataChanged', (e) => {
            this.onDataChange('planDataChanged', e.detail);
        });
        
        // 监听存储事件（跨标签页）
        window.addEventListener('storage', (e) => {
            if (this.shouldSyncKey(e.key)) {
                this.onDataChange('storage', e.key);
            }
        });
        
        console.log('✅ 数据变化监听器已设置');
    }
    
    /**
     * 判断是否需要同步的键
     */
    shouldSyncKey(key) {
        if (!key) return false;
        
        const syncableKeys = [
            'planData_',
            'habitTrackerData',
            'gratitude_history',
            'mood_history',
            'reflection_templates',
            'reflection_history',
            'monthlyEvents',
            'customTemplates',
            'userSettings'
        ];
        
        return syncableKeys.some(pattern => key.startsWith(pattern) || key === pattern);
    }
    
    /**
     * 数据变化处理
     */
    onDataChange(type, data) {
        if (!this.isEnabled) return;
        
        console.log(`📝 检测到数据变化: ${type}`);
        
        this.changeQueue.push({
            type,
            data,
            timestamp: Date.now()
        });
        
        // 防抖处理 - 3秒后同步
        this.debounceSync();
    }
    
    /**
     * 防抖同步
     */
    debounceSync() {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        // 3秒后执行同步
        this.syncTimer = setTimeout(() => {
            if (this.isEnabled && !this.syncInProgress && navigator.onLine) {
                this.performSync('数据变化触发');
            }
        }, 3000);
    }
    
    /**
     * 执行初始同步
     */
    async performInitialSync() {
        if (!this.isEnabled || this.syncInProgress) return;
        
        console.log('🔄 执行初始联想云同步...');
        
        try {
            await this.performSync('初始同步');
            console.log('✅ 初始同步完成，您的数据已安全备份到联想个人云');
        } catch (error) {
            console.log('⚠️ 初始同步失败，将在后续重试:', error.message);
        }
    }
    
    /**
     * 执行同步
     */
    async performSync(reason = '手动触发') {
        if (!this.isEnabled || this.syncInProgress) {
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            console.log(`🔄 开始同步数据到联想云 (${reason})...`);
            
            // 收集所有需要同步的数据
            const syncData = this.collectSyncData();
            
            // 上传到联想个人云
            await this.uploadToLenovoCloud(syncData);
            
            // 同步成功
            this.lastSyncTime = new Date().toISOString();
            this.retryCount = 0;
            this.changeQueue = [];
            
            console.log(`✅ 联想云同步完成 (${reason}) - ${new Date().toLocaleTimeString()}`);
            
            // 保存同步状态
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
        } catch (error) {
            console.error(`❌ 联想云同步失败 (${reason}):`, error);
            this.handleSyncError(error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 收集同步数据
     */
    collectSyncData() {
        const data = {};
        
        // 收集计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
        planTypes.forEach(type => {
            const key = `planData_${type}`;
            const planData = localStorage.getItem(key);
            if (planData) {
                try {
                    data[key] = JSON.parse(planData);
                } catch (e) {
                    console.warn(`跳过无效数据: ${key}`);
                }
            }
        });
        
        // 收集其他重要数据
        const otherKeys = [
            'habitTrackerData',
            'gratitude_history', 
            'mood_history',
            'reflection_templates',
            'reflection_history',
            'monthlyEvents',
            'customTemplates',
            'userSettings'
        ];
        
        otherKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (e) {
                    data[key] = value; // 保存原始字符串
                }
            }
        });
        
        return {
            timestamp: new Date().toISOString(),
            source: 'lenovo-cloud-sync',
            userAgent: navigator.userAgent,
            url: window.location.href,
            data: data,
            metadata: {
                changeCount: this.changeQueue.length,
                lastSync: this.lastSyncTime,
                dataKeys: Object.keys(data),
                totalDataSize: JSON.stringify(data).length,
                device: 'lenovo-personal-cloud'
            }
        };
    }
    
    /**
     * 上传到联想个人云
     */
    async uploadToLenovoCloud(syncData) {
        const { url, username, password, timeout } = this.defaultConfig;
        const fileName = 'plan-data-backup.json';
        const content = JSON.stringify(syncData, null, 2);
        
        // 创建Basic认证头
        const auth = btoa(`${username}:${password}`);
        
        try {
            console.log('📤 正在上传数据到联想个人云...');
            
            // 使用PUT方法上传文件到WebDAV
            const response = await fetch(`${url}/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    'Content-Length': content.length.toString()
                },
                body: content,
                signal: AbortSignal.timeout(timeout)
            });
            
            if (response.ok || response.status === 201 || response.status === 204) {
                console.log('✅ 数据已成功上传到联想个人云');
                return { success: true, status: response.status };
            } else if (response.status === 401) {
                throw new Error('认证失败：用户名或密码错误');
            } else if (response.status === 403) {
                throw new Error('权限不足：请检查用户权限设置');
            } else if (response.status === 404) {
                throw new Error('设备未找到：请检查IP地址和端口');
            } else {
                throw new Error(`上传失败: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('连接超时：请检查网络连接和设备状态');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('网络错误：无法连接到联想个人云设备');
            } else {
                throw error;
            }
        }
    }
    
    /**
     * 处理同步错误
     */
    handleSyncError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
            console.log(`🔄 ${retryDelay/1000}秒后重试联想云同步 (${this.retryCount}/${this.maxRetries})`);
            
            setTimeout(() => {
                this.performSync('重试');
            }, retryDelay);
        } else {
            console.log('❌ 联想云同步重试次数已用尽');
            this.retryCount = 0;
            
            // 显示错误提示
            this.showSyncError(error);
        }
    }
    
    /**
     * 显示同步错误
     */
    showSyncError(error) {
        const errorHint = document.createElement('div');
        errorHint.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffebee;
            border: 2px solid #f44336;
            border-radius: 8px;
            padding: 15px 20px;
            max-width: 350px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            color: #c62828;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        let errorMsg = error.message;
        let suggestion = '';
        
        if (errorMsg.includes('认证失败')) {
            suggestion = '💡 请检查用户名和密码是否正确';
        } else if (errorMsg.includes('权限不足')) {
            suggestion = '💡 请在联想云管理界面给用户分配写入权限';
        } else if (errorMsg.includes('设备未找到')) {
            suggestion = '💡 请检查设备IP地址和WebDAV端口设置';
        } else if (errorMsg.includes('连接超时')) {
            suggestion = '💡 请检查设备是否开机和网络连接';
        } else {
            suggestion = '💡 请检查联想个人云设备状态和网络连接';
        }
        
        errorHint.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">❌ 联想云同步失败</div>
            <div style="margin-bottom: 10px; font-size: 13px;">
                ${errorMsg}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                ${suggestion}
            </div>
            <div style="text-align: center;">
                <button onclick="this.parentElement.remove()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                ">关闭</button>
                <button onclick="window.lenovoCloudSync.performSync('手动重试'); this.parentElement.remove()" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                ">重试</button>
            </div>
        `;
        
        document.body.appendChild(errorHint);
        
        // 15秒后自动隐藏
        setTimeout(() => {
            if (errorHint.parentNode) {
                errorHint.remove();
            }
        }, 15000);
    }
    
    /**
     * 设置页面事件监听
     */
    setupPageEventListeners() {
        // 页面卸载前同步
        window.addEventListener('beforeunload', () => {
            if (this.isEnabled && this.changeQueue.length > 0) {
                // 快速同步
                this.performQuickSync();
            }
        });
        
        // 页面隐藏时同步（移动端）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isEnabled && this.changeQueue.length > 0) {
                this.performQuickSync();
            }
        });
        
        // 网络恢复时同步
        window.addEventListener('online', () => {
            if (this.isEnabled && this.changeQueue.length > 0) {
                console.log('📡 网络恢复，执行联想云同步');
                setTimeout(() => {
                    this.performSync('网络恢复');
                }, 1000);
            }
        });
        
        // 应用重新获得焦点时检查同步
        window.addEventListener('focus', () => {
            if (this.isEnabled && this.lastSyncTime) {
                const timeSinceLastSync = Date.now() - new Date(this.lastSyncTime).getTime();
                if (timeSinceLastSync > 300000) { // 5分钟
                    this.performSync('长时间未同步');
                }
            }
        });
    }
    
    /**
     * 快速同步（页面卸载时）
     */
    performQuickSync() {
        if (this.syncInProgress) return;
        
        try {
            const syncData = this.collectSyncData();
            
            // 保存到临时存储，下次启动时处理
            sessionStorage.setItem('pendingLenovoSync', JSON.stringify(syncData));
            console.log('📡 快速同步数据已保存，将在下次启动时上传到联想云');
        } catch (error) {
            console.error('快速同步失败:', error);
        }
    }
    
    /**
     * 定期同步
     */
    startPeriodicSync() {
        // 每5分钟检查一次是否需要同步
        setInterval(() => {
            if (this.isEnabled && !this.syncInProgress) {
                const now = Date.now();
                const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).getTime() : 0;
                
                // 如果超过15分钟没有同步且有变化，执行同步
                if (now - lastSync > 900000 && this.changeQueue.length > 0) {
                    this.performSync('定期同步');
                }
            }
        }, 300000); // 5分钟间隔
        
        // 检查是否有待处理的同步
        this.checkPendingSync();
    }
    
    /**
     * 检查待处理的同步
     */
    async checkPendingSync() {
        try {
            const pendingData = sessionStorage.getItem('pendingLenovoSync');
            if (pendingData && this.isEnabled) {
                console.log('🔄 发现待处理的联想云同步数据，正在上传...');
                const syncData = JSON.parse(pendingData);
                await this.uploadToLenovoCloud(syncData);
                sessionStorage.removeItem('pendingLenovoSync');
                console.log('✅ 待处理联想云同步完成');
            }
        } catch (error) {
            console.log('处理待同步数据失败:', error);
        }
    }
    
    /**
     * 手动触发同步
     */
    async manualSync() {
        return await this.performSync('手动触发');
    }
    
    /**
     * 从联想个人云恢复数据
     */
    async restoreFromLenovoCloud() {
        if (!this.isEnabled) {
            console.log('⚠️ 联想云同步未启用，无法恢复数据');
            return;
        }
        
        try {
            console.log('📥 正在从联想个人云恢复数据...');
            
            const { url, username, password, timeout } = this.defaultConfig;
            const fileName = 'plan-data-backup.json';
            
            // 创建Basic认证头
            const auth = btoa(`${username}:${password}`);
            
            const response = await fetch(`${url}/${fileName}`, {
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                signal: AbortSignal.timeout(timeout)
            });
            
            if (response.ok) {
                const backupData = await response.json();
                
                if (backupData.data) {
                    // 恢复数据到localStorage
                    Object.keys(backupData.data).forEach(key => {
                        const value = backupData.data[key];
                        if (value !== null && value !== undefined) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    });
                    
                    console.log('✅ 数据已从联想个人云成功恢复');
                    console.log('🔄 3秒后刷新页面以显示恢复的数据...');
                    
                    // 刷新页面以显示恢复的数据
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                    
                    return true;
                }
            } else if (response.status === 404) {
                console.log('📝 联想个人云上暂无备份数据');
                return false;
            } else if (response.status === 401) {
                console.log('❌ 认证失败：用户名或密码错误');
                return false;
            } else {
                console.log('⚠️ 无法访问联想个人云备份:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ 联想个人云数据恢复失败:', error);
            return false;
        }
    }
    
    /**
     * 检查并自动恢复数据
     */
    async checkAndAutoRestore() {
        // 检查本地是否有重要数据
        const hasLocalData = this.hasImportantLocalData();
        
        if (!hasLocalData) {
            console.log('🔍 检测到本地无重要数据，尝试从联想云自动恢复...');
            const restored = await this.restoreFromLenovoCloud();
            if (restored) {
                console.log('🎉 数据从联想个人云自动恢复成功！');
            } else {
                console.log('📝 联想个人云上暂无备份数据，这可能是首次使用');
            }
        } else {
            console.log('✅ 检测到本地已有数据，跳过自动恢复');
        }
    }
    
    /**
     * 检查是否有重要的本地数据
     */
    hasImportantLocalData() {
        const importantKeys = [
            'planData_day',
            'planData_week', 
            'planData_month',
            'habitTrackerData',
            'gratitude_history'
        ];
        
        return importantKeys.some(key => {
            const data = localStorage.getItem(key);
            return data && data.length > 50; // 有意义的数据
        });
    }
    
    /**
     * 测试连接
     */
    async testConnection() {
        if (!this.defaultConfig.url || !this.defaultConfig.username || !this.defaultConfig.password) {
            throw new Error('请先配置联想个人云连接信息');
        }
        
        try {
            const { url, username, password, timeout } = this.defaultConfig;
            const auth = btoa(`${username}:${password}`);
            
            console.log('🔗 正在测试联想个人云连接...');
            
            const response = await fetch(url, {
                method: 'PROPFIND',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Depth': '1'
                },
                signal: AbortSignal.timeout(timeout)
            });
            
            if (response.ok || response.status === 207) {
                console.log('✅ 联想个人云连接测试成功');
                return true;
            } else if (response.status === 401) {
                throw new Error('认证失败：用户名或密码错误');
            } else {
                throw new Error(`连接失败: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ 联想个人云连接测试失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取同步状态
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            configured: this.isValidConfig(this.defaultConfig),
            lastSync: this.lastSyncTime,
            pendingChanges: this.changeQueue.length,
            inProgress: this.syncInProgress,
            device: this.defaultConfig.url,
            username: this.defaultConfig.username
        };
    }
}

// 创建全局实例
window.lenovoCloudSync = new LenovoCloudSync();

// 页面加载完成后检查是否需要自动恢复数据
window.addEventListener('load', async () => {
    if (window.lenovoCloudSync.isEnabled) {
        await window.lenovoCloudSync.checkAndAutoRestore();
    }
});

console.log('🏠 联想个人云零配置同步服务已加载');
