/**
 * 全自动同步服务
 * 实现真正的后台自动同步，无需手动操作
 */

class AutoSyncService {
    constructor() {
        this.isEnabled = false;
        this.syncConfig = null;
        this.lastSyncTime = null;
        this.syncInProgress = false;
        this.changeQueue = [];
        this.syncTimer = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // 同步状态指示器
        this.statusIndicator = null;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化自动同步服务
     */
    init() {
        console.log('🔄 初始化全自动同步服务...');
        
        // 加载同步配置
        this.loadSyncConfig();
        
        // 创建状态指示器
        this.createStatusIndicator();
        
        // 设置数据变化监听
        this.setupChangeListeners();
        
        // 设置定期同步
        this.setupPeriodicSync();
        
        // 设置页面事件监听
        this.setupPageEventListeners();
        
        console.log('✅ 全自动同步服务初始化完成');
    }
    
    /**
     * 加载同步配置
     */
    loadSyncConfig() {
        try {
            // 从配置文件加载
            if (window.APP_CONFIG && window.APP_CONFIG.SYNC && window.APP_CONFIG.SYNC.GITHUB_CONFIG) {
                const config = window.APP_CONFIG.SYNC.GITHUB_CONFIG;
                if (config.enabled && config.token && config.owner && config.repo) {
                    this.syncConfig = {
                        provider: 'github',
                        settings: {
                            token: config.token,
                            owner: config.owner,
                            repo: config.repo,
                            branch: config.branch || 'main'
                        }
                    };
                    this.isEnabled = true;
                    console.log('✅ 从配置文件加载同步设置成功');
                }
            }
            
            // 从 localStorage 加载（优先级更高）
            const localConfig = localStorage.getItem('syncConfig');
            if (localConfig) {
                const config = JSON.parse(localConfig);
                if (config.enabled && config.provider === 'github') {
                    this.syncConfig = config;
                    this.isEnabled = true;
                    this.lastSyncTime = config.lastSync;
                    console.log('✅ 从本地存储加载同步设置成功');
                }
            }
            
            if (this.isEnabled) {
                this.updateStatusIndicator('ready', '同步已启用');
            } else {
                this.updateStatusIndicator('disabled', '同步未配置');
            }
            
        } catch (error) {
            console.error('❌ 加载同步配置失败:', error);
        }
    }
    
    /**
     * 创建状态指示器
     */
    createStatusIndicator() {
        // 如果已存在，不重复创建
        if (document.getElementById('auto-sync-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'auto-sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #4caf50;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 500;
            color: #2e7d32;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            max-width: 200px;
        `;
        
        // 添加点击事件（点击查看详情）
        indicator.addEventListener('click', () => {
            this.showSyncStatus();
        });
        
        document.body.appendChild(indicator);
        this.statusIndicator = indicator;
    }
    
    /**
     * 更新状态指示器
     */
    updateStatusIndicator(status, message) {
        if (!this.statusIndicator) return;
        
        const statusConfig = {
            disabled: { color: '#999', border: '#ddd', icon: '⚪' },
            ready: { color: '#2e7d32', border: '#4caf50', icon: '✅' },
            syncing: { color: '#1976d2', border: '#2196f3', icon: '🔄' },
            success: { color: '#2e7d32', border: '#4caf50', icon: '✅' },
            error: { color: '#d32f2f', border: '#f44336', icon: '❌' }
        };
        
        const config = statusConfig[status] || statusConfig.disabled;
        
        this.statusIndicator.style.color = config.color;
        this.statusIndicator.style.borderColor = config.border;
        this.statusIndicator.innerHTML = `
            <span style="animation: ${status === 'syncing' ? 'spin 1s linear infinite' : 'none'};">${config.icon}</span>
            <span>${message}</span>
        `;
        
        // 添加旋转动画样式
        if (status === 'syncing' && !document.getElementById('sync-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'sync-animation-styles';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 设置数据变化监听
     */
    setupChangeListeners() {
        // 监听所有输入元素
        const inputSelectors = [
            'input[type="text"]',
            'input[type="date"]', 
            'textarea',
            '.todo-list-container',
            '[contenteditable="true"]'
        ];
        
        inputSelectors.forEach(selector => {
            document.addEventListener('input', (e) => {
                if (e.target.matches(selector)) {
                    this.onDataChange('input', e.target);
                }
            });
            
            document.addEventListener('change', (e) => {
                if (e.target.matches(selector)) {
                    this.onDataChange('change', e.target);
                }
            });
        });
        
        // 监听复选框变化
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('custom-checkbox')) {
                this.onDataChange('checkbox', e.target);
            }
        });
        
        // 监听拖拽排序等操作
        document.addEventListener('dragend', () => {
            this.onDataChange('dragend', null);
        });
        
        // 监听自定义数据变化事件
        window.addEventListener('planDataChanged', (e) => {
            this.onDataChange('custom', e.detail);
        });
        
        console.log('✅ 数据变化监听器已设置');
    }
    
    /**
     * 数据变化处理
     */
    onDataChange(type, element) {
        if (!this.isEnabled) return;
        
        console.log(`📝 检测到数据变化: ${type}`, element);
        
        // 添加到变化队列
        this.changeQueue.push({
            type: type,
            timestamp: Date.now(),
            element: element?.id || element?.className || 'unknown'
        });
        
        // 防抖处理 - 延迟同步避免频繁触发
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
            this.performAutoSync();
        }, 3000); // 3秒后同步
        
        // 更新状态指示器
        this.updateStatusIndicator('syncing', '准备同步...');
    }
    
    /**
     * 执行自动同步
     */
    async performAutoSync() {
        if (!this.isEnabled || this.syncInProgress) {
            console.log('⏸️ 跳过同步：未启用或正在同步中');
            return;
        }
        
        // 检查网络状态
        if (!navigator.onLine) {
            console.log('📡 网络离线，延迟同步');
            this.updateStatusIndicator('error', '网络离线');
            return;
        }
        
        this.syncInProgress = true;
        this.updateStatusIndicator('syncing', '正在同步...');
        
        try {
            console.log('🔄 开始自动同步...');
            
            // 收集所有数据
            const syncData = this.collectAllData();
            
            // 执行同步
            await this.uploadToGitHub(syncData);
            
            // 同步成功
            this.lastSyncTime = new Date().toISOString();
            this.retryCount = 0;
            this.changeQueue = []; // 清空变化队列
            
            // 保存同步状态
            if (this.syncConfig) {
                this.syncConfig.lastSync = this.lastSyncTime;
                localStorage.setItem('syncConfig', JSON.stringify(this.syncConfig));
            }
            
            this.updateStatusIndicator('success', `已同步 ${new Date().toLocaleTimeString()}`);
            console.log('✅ 自动同步完成');
            
            // 3秒后恢复正常状态
            setTimeout(() => {
                this.updateStatusIndicator('ready', '同步已启用');
            }, 3000);
            
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
            this.handleSyncError(error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 收集所有数据
     */
    collectAllData() {
        const data = {};
        
        // 收集计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'year'];
        planTypes.forEach(type => {
            const planData = localStorage.getItem(`planData_${type}`);
            if (planData) {
                try {
                    data[`planData_${type}`] = JSON.parse(planData);
                } catch (e) {
                    console.warn(`跳过无效数据: planData_${type}`);
                }
            }
        });
        
        // 收集其他重要数据
        const otherKeys = ['habitTrackerData', 'userSettings', 'moodData'];
        otherKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (e) {
                    console.warn(`跳过无效数据: ${key}`);
                }
            }
        });
        
        return {
            timestamp: new Date().toISOString(),
            source: 'auto-sync-service',
            data: data
        };
    }
    
    /**
     * 上传到 GitHub
     */
    async uploadToGitHub(syncData) {
        if (!this.syncConfig || this.syncConfig.provider !== 'github') {
            throw new Error('GitHub 配置未正确设置');
        }
        
        const { token, owner, repo, branch } = this.syncConfig.settings;
        const fileName = 'plan-data.json';
        const content = JSON.stringify(syncData, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        // 先获取文件信息（用于更新）
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
            console.log('文件不存在，将创建新文件');
        }
        
        // 上传或更新文件
        const uploadData = {
            message: `自动同步数据 - ${new Date().toLocaleString()}`,
            content: encodedContent,
            branch: branch
        };
        
        if (sha) {
            uploadData.sha = sha; // 更新现有文件
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
            throw new Error(`GitHub API 错误: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * 处理同步错误
     */
    handleSyncError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            // 重试机制
            const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000); // 指数退避，最大30秒
            this.updateStatusIndicator('error', `同步失败，${retryDelay/1000}秒后重试`);
            
            setTimeout(() => {
                console.log(`🔄 重试同步 (${this.retryCount}/${this.maxRetries})`);
                this.performAutoSync();
            }, retryDelay);
        } else {
            // 重试次数用尽
            this.updateStatusIndicator('error', '同步失败，请检查网络');
            this.retryCount = 0;
            
            // 10分钟后重置重试
            setTimeout(() => {
                if (this.isEnabled) {
                    this.updateStatusIndicator('ready', '同步已启用');
                }
            }, 600000);
        }
    }
    
    /**
     * 设置定期同步
     */
    setupPeriodicSync() {
        // 每5分钟执行一次定期同步
        setInterval(() => {
            if (this.isEnabled && !this.syncInProgress && this.changeQueue.length === 0) {
                console.log('⏰ 执行定期同步检查');
                
                // 如果超过10分钟没有同步，执行一次同步
                const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).getTime() : 0;
                const now = Date.now();
                if (now - lastSync > 600000) { // 10分钟
                    this.performAutoSync();
                }
            }
        }, 300000); // 5分钟间隔
    }
    
    /**
     * 设置页面事件监听
     */
    setupPageEventListeners() {
        // 页面卸载前同步
        window.addEventListener('beforeunload', () => {
            if (this.isEnabled && this.changeQueue.length > 0) {
                // 使用 sendBeacon 进行快速同步
                this.performBeaconSync();
            }
        });
        
        // 页面隐藏时同步（移动端）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isEnabled && this.changeQueue.length > 0) {
                this.performBeaconSync();
            }
        });
        
        // 网络恢复时同步
        window.addEventListener('online', () => {
            if (this.isEnabled && this.changeQueue.length > 0) {
                console.log('📡 网络恢复，执行同步');
                setTimeout(() => {
                    this.performAutoSync();
                }, 1000);
            }
        });
    }
    
    /**
     * 使用 Beacon API 进行快速同步
     */
    performBeaconSync() {
        if (!this.isEnabled || this.syncInProgress) return;
        
        try {
            const syncData = this.collectAllData();
            const { token, owner, repo } = this.syncConfig.settings;
            
            // 简化的数据用于 Beacon 同步
            const beaconData = JSON.stringify({
                action: 'emergency_sync',
                timestamp: syncData.timestamp,
                dataSize: Object.keys(syncData.data).length
            });
            
            // 尝试发送紧急同步信号
            navigator.sendBeacon(
                `https://api.github.com/repos/${owner}/${repo}/dispatches`,
                beaconData
            );
            
            console.log('📡 紧急同步信号已发送');
        } catch (error) {
            console.error('❌ 紧急同步失败:', error);
        }
    }
    
    /**
     * 显示同步状态详情
     */
    showSyncStatus() {
        const status = this.isEnabled ? '已启用' : '未启用';
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleString() : '从未同步';
        const changeCount = this.changeQueue.length;
        
        alert(`🔄 自动同步状态

状态: ${status}
最后同步: ${lastSync}
待同步变化: ${changeCount} 个
同步提供商: ${this.syncConfig?.provider || '未配置'}

点击确定关闭`);
    }
    
    /**
     * 手动触发同步
     */
    async manualSync() {
        if (!this.isEnabled) {
            throw new Error('同步未启用');
        }
        
        this.changeQueue.push({
            type: 'manual',
            timestamp: Date.now(),
            element: 'manual_trigger'
        });
        
        await this.performAutoSync();
    }
    
    /**
     * 启用自动同步
     */
    enableAutoSync(config) {
        this.syncConfig = config;
        this.isEnabled = true;
        this.updateStatusIndicator('ready', '同步已启用');
        
        // 保存配置
        localStorage.setItem('syncConfig', JSON.stringify(config));
        
        console.log('✅ 自动同步已启用');
    }
    
    /**
     * 禁用自动同步
     */
    disableAutoSync() {
        this.isEnabled = false;
        this.syncConfig = null;
        this.changeQueue = [];
        
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        this.updateStatusIndicator('disabled', '同步已禁用');
        
        // 清除配置
        localStorage.removeItem('syncConfig');
        
        console.log('⏸️ 自动同步已禁用');
    }
}

// 创建全局自动同步服务实例
window.autoSyncService = new AutoSyncService();

// 暴露给其他脚本使用的接口
window.enableAutoSync = (config) => window.autoSyncService.enableAutoSync(config);
window.disableAutoSync = () => window.autoSyncService.disableAutoSync();
window.manualSync = () => window.autoSyncService.manualSync();

console.log('🚀 全自动同步服务已加载');
