/**
 * 全自动后台同步服务
 * 零配置，自动检测并启用GitHub同步，删除浏览器数据后自动恢复
 */

class AutoBackgroundSync {
    constructor() {
        this.isEnabled = false;
        this.syncConfig = null;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.changeQueue = [];
        this.syncTimer = null;
        
        // 自动检测到的配置
        this.detectedConfig = null;
        
        // 初始化
        this.init();
    }
    
    async init() {
        console.log('🚀 启动全自动后台同步服务...');
        
        // 延迟初始化，等待页面完全加载
        await this.delay(1000);
        
        // 自动检测配置
        await this.autoDetectConfig();
        
        // 如果检测到配置，自动启用同步
        if (this.detectedConfig) {
            await this.autoEnableSync();
        }
        
        // 设置数据变化监听
        this.setupChangeListeners();
        
        // 设置页面事件监听
        this.setupPageEventListeners();
        
        // 定期检测和同步
        this.startPeriodicSync();
        
        console.log('✅ 全自动后台同步服务初始化完成');
    }
    
    /**
     * 自动检测同步配置
     */
    async autoDetectConfig() {
        console.log('🔍 正在自动检测GitHub同步配置...');
        
        // 方法1: 从localStorage检测现有配置
        let config = this.detectFromStorage();
        if (config) {
            console.log('✅ 从localStorage检测到GitHub配置');
            this.detectedConfig = config;
            return;
        }
        
        // 方法2: 从URL参数检测
        config = this.detectFromURL();
        if (config) {
            console.log('✅ 从URL参数检测到GitHub配置');
            this.detectedConfig = config;
            return;
        }
        
        // 方法3: 从预设配置检测
        config = this.detectFromPreset();
        if (config) {
            console.log('✅ 使用预设GitHub配置');
            this.detectedConfig = config;
            return;
        }
        
        console.log('⚠️ 未检测到有效的GitHub配置');
    }
    
    /**
     * 从localStorage检测配置
     */
    detectFromStorage() {
        try {
            // 检查多种可能的配置位置
            const possibleKeys = [
                'sync_config',
                'syncConfig', 
                'github_sync_config',
                'autoSyncConfig',
                'planData_syncConfig'
            ];
            
            for (const key of possibleKeys) {
                const configStr = localStorage.getItem(key);
                if (configStr) {
                    try {
                        const config = JSON.parse(configStr);
                        if (this.isValidGitHubConfig(config)) {
                            return this.extractGitHubConfig(config);
                        }
                    } catch (e) {
                        // 尝试从字符串中提取配置
                        const extracted = this.extractConfigFromString(configStr);
                        if (extracted) return extracted;
                    }
                }
            }
            
            // 扫描所有localStorage项寻找GitHub相关信息
            return this.scanAllStorageForGitHub();
            
        } catch (error) {
            console.log('localStorage检测失败:', error);
            return null;
        }
    }
    
    /**
     * 扫描所有localStorage项寻找GitHub配置
     */
    scanAllStorageForGitHub() {
        try {
            const allKeys = Object.keys(localStorage);
            
            for (const key of allKeys) {
                const value = localStorage.getItem(key);
                if (value && (value.includes('ghp_') || value.includes('github.com'))) {
                    const config = this.extractConfigFromString(value);
                    if (config) {
                        console.log(`从${key}提取到GitHub配置`);
                        return config;
                    }
                }
            }
        } catch (error) {
            console.log('存储扫描失败:', error);
        }
        return null;
    }
    
    /**
     * 从字符串中提取GitHub配置
     */
    extractConfigFromString(str) {
        try {
            // 提取GitHub token
            const tokenMatch = str.match(/ghp_[a-zA-Z0-9]{36}/);
            if (!tokenMatch) return null;
            
            // 提取仓库信息
            const repoMatch = str.match(/github\.com\/([^\/\s"]+)\/([^\/\s"]+)/);
            if (!repoMatch) {
                // 尝试从其他格式提取
                const ownerMatch = str.match(/"owner":\s*"([^"]+)"/);
                const repoNameMatch = str.match(/"repo":\s*"([^"]+)"/);
                
                if (ownerMatch && repoNameMatch) {
                    return {
                        token: tokenMatch[0],
                        owner: ownerMatch[1],
                        repo: repoNameMatch[1],
                        branch: 'main'
                    };
                }
                return null;
            }
            
            return {
                token: tokenMatch[0],
                owner: repoMatch[1],
                repo: repoMatch[2],
                branch: 'main'
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 从URL参数检测配置
     */
    detectFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            
            const config = {
                token: params.get('github_token') || params.get('token'),
                owner: params.get('github_owner') || params.get('owner'),
                repo: params.get('github_repo') || params.get('repo'),
                branch: params.get('github_branch') || 'main'
            };
            
            if (config.token && config.owner && config.repo) {
                // 清除URL参数保护隐私
                const cleanUrl = window.location.pathname;
                history.replaceState(null, '', cleanUrl);
                return config;
            }
        } catch (error) {
            console.log('URL参数检测失败:', error);
        }
        return null;
    }
    
    /**
     * 从预设配置检测
     */
    detectFromPreset() {
        try {
            // 检查全局配置
            if (window.APP_CONFIG && window.APP_CONFIG.SYNC && window.APP_CONFIG.SYNC.GITHUB_CONFIG) {
                const config = window.APP_CONFIG.SYNC.GITHUB_CONFIG;
                if (this.isValidGitHubConfig({settings: config})) {
                    return config;
                }
            }
            
            // 检查config.js中的配置
            if (window.GITHUB_SYNC_CONFIG) {
                const config = window.GITHUB_SYNC_CONFIG;
                if (this.isValidGitHubConfig({settings: config})) {
                    return config;
                }
            }
        } catch (error) {
            console.log('预设配置检测失败:', error);
        }
        return null;
    }
    
    /**
     * 验证GitHub配置是否有效
     */
    isValidGitHubConfig(config) {
        if (!config) return false;
        
        // 检查直接配置
        if (config.token && config.owner && config.repo) {
            return true;
        }
        
        // 检查嵌套配置
        if (config.settings) {
            return config.settings.token && config.settings.owner && config.settings.repo;
        }
        
        // 检查provider配置
        if (config.provider === 'github' && config.settings) {
            return this.isValidGitHubConfig(config.settings);
        }
        
        return false;
    }
    
    /**
     * 提取GitHub配置
     */
    extractGitHubConfig(config) {
        if (config.token && config.owner && config.repo) {
            return config;
        }
        
        if (config.settings) {
            return config.settings;
        }
        
        if (config.provider === 'github' && config.settings) {
            return config.settings;
        }
        
        return null;
    }
    
    /**
     * 自动启用同步
     */
    async autoEnableSync() {
        if (!this.detectedConfig) return;
        
        console.log('🔧 正在自动启用GitHub同步...');
        
        try {
            // 验证配置有效性
            const isValid = await this.validateConfig(this.detectedConfig);
            if (!isValid) {
                console.log('❌ 配置验证失败，跳过自动启用');
                return;
            }
            
            // 保存配置
            this.syncConfig = {
                enabled: true,
                provider: 'github',
                settings: this.detectedConfig,
                lastSync: null,
                autoEnabled: true // 标记为自动启用
            };
            
            // 保存到localStorage
            localStorage.setItem('sync_config', JSON.stringify(this.syncConfig));
            
            this.isEnabled = true;
            
            console.log('✅ GitHub同步已自动启用');
            
            // 延迟执行首次同步
            setTimeout(() => {
                this.performInitialSync();
            }, 3000);
            
        } catch (error) {
            console.error('❌ 自动启用同步失败:', error);
        }
    }
    
    /**
     * 验证配置
     */
    async validateConfig(config) {
        if (!config.token || !config.owner || !config.repo) {
            return false;
        }
        
        // 快速格式验证
        if (!config.token.startsWith('ghp_') && !config.token.startsWith('github_pat_')) {
            console.log('⚠️ Token格式可能不正确，但尝试使用');
        }
        
        // 可选：测试连接（超时3秒）
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                console.log('✅ GitHub连接验证成功');
                return true;
            } else if (response.status === 404) {
                console.log('⚠️ 仓库不存在，但配置可能有效');
                return true; // 仓库可能需要创建
            } else {
                console.log('⚠️ GitHub连接验证失败，但继续尝试');
                return true; // 不因网络问题阻止使用
            }
        } catch (error) {
            console.log('⚠️ 连接测试失败，但继续使用配置:', error.message);
            return true; // 网络问题不应阻止自动启用
        }
    }
    
    /**
     * 执行初始同步
     */
    async performInitialSync() {
        if (!this.isEnabled || this.syncInProgress) return;
        
        console.log('🔄 执行初始后台同步...');
        
        try {
            await this.performSync('初始同步');
            console.log('✅ 初始同步完成，数据已备份到GitHub');
        } catch (error) {
            console.log('⚠️ 初始同步失败，将在后续重试:', error.message);
        }
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
            if (window.autoBackgroundSync && window.autoBackgroundSync.shouldSyncKey(key)) {
                window.autoBackgroundSync.onDataChange(key, value);
            }
            
            return result;
        };
        
        // 监听其他数据变化事件
        window.addEventListener('planDataChanged', (e) => {
            this.onDataChange('planDataChanged', e.detail);
        });
        
        // 监听存储事件（跨标签页）
        window.addEventListener('storage', (e) => {
            if (this.shouldSyncKey(e.key)) {
                this.onDataChange('storage', e.key);
            }
        });
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
            'customTemplates'
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
        
        // 防抖处理
        this.debounceSync();
    }
    
    /**
     * 防抖同步
     */
    debounceSync() {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        // 5秒后执行同步
        this.syncTimer = setTimeout(() => {
            if (this.isEnabled && !this.syncInProgress && navigator.onLine) {
                this.performSync('数据变化触发');
            }
        }, 5000);
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
            console.log(`🔄 开始后台同步 (${reason})...`);
            
            // 收集所有需要同步的数据
            const syncData = this.collectSyncData();
            
            // 上传到GitHub
            await this.uploadToGitHub(syncData);
            
            // 同步成功
            this.lastSyncTime = new Date().toISOString();
            this.retryCount = 0;
            this.changeQueue = [];
            
            // 更新配置
            if (this.syncConfig) {
                this.syncConfig.lastSync = this.lastSyncTime;
                localStorage.setItem('sync_config', JSON.stringify(this.syncConfig));
            }
            
            console.log(`✅ 后台同步完成 (${reason})`);
            
        } catch (error) {
            console.error(`❌ 后台同步失败 (${reason}):`, error);
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
            'customTemplates'
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
            source: 'auto-background-sync',
            userAgent: navigator.userAgent,
            url: window.location.href,
            data: data,
            metadata: {
                changeCount: this.changeQueue.length,
                lastSync: this.lastSyncTime,
                dataKeys: Object.keys(data)
            }
        };
    }
    
    /**
     * 上传到GitHub
     */
    async uploadToGitHub(syncData) {
        if (!this.detectedConfig) {
            throw new Error('GitHub配置未设置');
        }
        
        const { token, owner, repo, branch = 'main' } = this.detectedConfig;
        const fileName = 'plan-data-backup.json';
        const content = JSON.stringify(syncData, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        // 获取文件SHA（用于更新）
        let sha = null;
        try {
            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileInfo = await getResponse.json();
                sha = fileInfo.sha;
            }
        } catch (error) {
            // 文件不存在，将创建新文件
        }
        
        // 上传文件
        const uploadData = {
            message: `自动备份数据 - ${new Date().toLocaleString()}`,
            content: encodedContent,
            branch: branch
        };
        
        if (sha) {
            uploadData.sha = sha;
        }
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API错误: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * 处理同步错误
     */
    handleSyncError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
            console.log(`🔄 ${retryDelay/1000}秒后重试同步 (${this.retryCount}/${this.maxRetries})`);
            
            setTimeout(() => {
                this.performSync('重试');
            }, retryDelay);
        } else {
            console.log('❌ 同步重试次数已用尽，等待下次触发');
            this.retryCount = 0;
        }
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
                console.log('📡 网络恢复，执行同步');
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
            
            // 使用sendBeacon发送数据
            const formData = new FormData();
            formData.append('data', JSON.stringify(syncData));
            
            // 这里可以发送到一个接收端点，但GitHub API不支持sendBeacon
            // 作为替代，我们保存到临时存储
            sessionStorage.setItem('pendingSync', JSON.stringify(syncData));
            
            console.log('📡 快速同步数据已保存');
        } catch (error) {
            console.error('快速同步失败:', error);
        }
    }
    
    /**
     * 定期同步
     */
    startPeriodicSync() {
        // 每10分钟检查一次是否需要同步
        setInterval(() => {
            if (this.isEnabled && !this.syncInProgress) {
                const now = Date.now();
                const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).getTime() : 0;
                
                // 如果超过30分钟没有同步且有变化，执行同步
                if (now - lastSync > 1800000 && this.changeQueue.length > 0) {
                    this.performSync('定期同步');
                }
            }
        }, 600000); // 10分钟间隔
        
        // 检查是否有待处理的同步
        this.checkPendingSync();
    }
    
    /**
     * 检查待处理的同步
     */
    async checkPendingSync() {
        try {
            const pendingData = sessionStorage.getItem('pendingSync');
            if (pendingData && this.isEnabled) {
                console.log('🔄 发现待处理的同步数据，正在上传...');
                const syncData = JSON.parse(pendingData);
                await this.uploadToGitHub(syncData);
                sessionStorage.removeItem('pendingSync');
                console.log('✅ 待处理同步完成');
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
     * 获取同步状态
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            config: this.detectedConfig ? 'detected' : 'none',
            lastSync: this.lastSyncTime,
            pendingChanges: this.changeQueue.length,
            inProgress: this.syncInProgress
        };
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 创建全局实例并自动启动
window.autoBackgroundSync = new AutoBackgroundSync();

// 在页面加载完成后进行数据恢复检查
window.addEventListener('load', async () => {
    // 检查是否需要从GitHub恢复数据
    if (window.autoBackgroundSync.isEnabled) {
        await window.autoBackgroundSync.checkAndRestoreData();
    }
});

// 添加数据恢复功能
AutoBackgroundSync.prototype.checkAndRestoreData = async function() {
    try {
        // 检查本地是否有数据
        const hasLocalData = this.hasAnyLocalData();
        
        if (!hasLocalData) {
            console.log('🔍 检测到本地无数据，尝试从GitHub恢复...');
            await this.restoreFromGitHub();
        } else {
            console.log('✅ 检测到本地已有数据，跳过恢复');
        }
    } catch (error) {
        console.log('数据恢复检查失败:', error);
    }
};

// 检查是否有本地数据
AutoBackgroundSync.prototype.hasAnyLocalData = function() {
    const importantKeys = [
        'planData_day',
        'planData_week', 
        'planData_month',
        'habitTrackerData',
        'gratitude_history'
    ];
    
    return importantKeys.some(key => {
        const data = localStorage.getItem(key);
        return data && data.length > 10; // 有意义的数据
    });
};

// 从GitHub恢复数据
AutoBackgroundSync.prototype.restoreFromGitHub = async function() {
    if (!this.detectedConfig) return;
    
    try {
        const { token, owner, repo, branch = 'main' } = this.detectedConfig;
        const fileName = 'plan-data-backup.json';
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const fileData = await response.json();
            const content = atob(fileData.content);
            const backupData = JSON.parse(content);
            
            if (backupData.data) {
                // 恢复数据到localStorage
                Object.keys(backupData.data).forEach(key => {
                    const value = backupData.data[key];
                    if (value !== null && value !== undefined) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });
                
                console.log('✅ 数据已从GitHub成功恢复');
                
                // 刷新页面以显示恢复的数据
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else if (response.status === 404) {
            console.log('📝 GitHub上暂无备份数据');
        } else {
            console.log('⚠️ 无法访问GitHub备份:', response.status);
        }
    } catch (error) {
        console.error('❌ GitHub数据恢复失败:', error);
    }
};

console.log('🚀 全自动后台同步服务已加载');
