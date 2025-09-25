/**
 * 智能自动同步检测器
 * 自动检测GitHub配置并恢复同步，减少手动配置需求
 */

class SmartAutoSync {
    constructor() {
        this.isInitialized = false;
        this.detectionAttempts = 0;
        this.maxDetectionAttempts = 5;
        this.quickSetupShown = false;
        
        // 自动检测配置
        this.autoDetectionConfig = {
            enabled: true,
            detectOnPageLoad: true,
            detectFromUrlParams: true,
            detectFromRecentData: true,
            autoRestore: true
        };
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('🤖 智能自动同步检测器启动...');
        
        // 等待页面加载完成
        await this.waitForPageReady();
        
        // 开始自动检测流程
        await this.startAutoDetection();
        
        this.isInitialized = true;
        console.log('✅ 智能自动同步检测器初始化完成');
    }
    
    async waitForPageReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    async startAutoDetection() {
        console.log('🔍 开始智能检测GitHub同步配置...');
        
        // 1. 从URL参数检测
        const urlConfig = this.detectFromUrlParams();
        if (urlConfig) {
            console.log('✅ 从URL参数检测到GitHub配置');
            await this.autoSetupSync(urlConfig, 'URL参数');
            return;
        }
        
        // 2. 从localStorage历史配置检测
        const storedConfig = await this.detectFromStoredConfig();
        if (storedConfig) {
            console.log('✅ 从存储配置检测到GitHub配置');
            await this.autoSetupSync(storedConfig, '存储配置');
            return;
        }
        
        // 3. 从数据特征检测
        const inferredConfig = await this.detectFromDataPattern();
        if (inferredConfig) {
            console.log('✅ 从数据模式推断出GitHub配置');
            await this.autoSetupSync(inferredConfig, '数据推断');
            return;
        }
        
        // 4. 智能推荐设置
        await this.showSmartRecommendation();
    }
    
    /**
     * 从URL参数检测GitHub配置
     * 支持格式: ?github_token=xxx&github_repo=xxx&github_owner=xxx
     */
    detectFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        const config = {
            token: params.get('github_token') || params.get('token'),
            owner: params.get('github_owner') || params.get('owner'),
            repo: params.get('github_repo') || params.get('repo'),
            branch: params.get('github_branch') || 'main'
        };
        
        // 检查必需参数
        if (config.token && config.owner && config.repo) {
            // 清除URL参数以保护隐私
            const cleanUrl = window.location.pathname;
            history.replaceState(null, '', cleanUrl);
            
            return config;
        }
        
        return null;
    }
    
    /**
     * 从localStorage历史配置检测
     */
    async detectFromStoredConfig() {
        // 检查多个可能的配置位置
        const configKeys = [
            'sync_config',
            'syncConfig', 
            'github_sync_config',
            'sync_config_backup',
            'last_working_sync_config'
        ];
        
        for (const key of configKeys) {
            try {
                const configStr = localStorage.getItem(key);
                if (configStr) {
                    const config = JSON.parse(configStr);
                    
                    // 检查GitHub配置
                    if (config.provider === 'github' && 
                        config.settings && 
                        config.settings.token && 
                        config.settings.owner && 
                        config.settings.repo) {
                        
                        console.log(`从${key}恢复GitHub配置`);
                        return config.settings;
                    }
                }
            } catch (error) {
                console.log(`解析${key}失败:`, error);
            }
        }
        
        // 检查历史记录中的配置
        return this.detectFromHistoricalData();
    }
    
    /**
     * 从历史数据检测配置信息
     */
    detectFromHistoricalData() {
        try {
            // 检查是否有GitHub相关的数据特征
            const allKeys = Object.keys(localStorage);
            
            for (const key of allKeys) {
                const value = localStorage.getItem(key);
                
                // 寻找包含GitHub信息的数据
                if (value && (value.includes('github.com') || 
                             value.includes('ghp_') || 
                             value.includes('"provider":"github"'))) {
                    
                    try {
                        const data = JSON.parse(value);
                        
                        // 尝试从同步元数据提取配置
                        if (data.metadata && data.metadata.syncInfo) {
                            const syncInfo = data.metadata.syncInfo;
                            if (syncInfo.provider === 'github' && syncInfo.config) {
                                console.log('从同步元数据恢复GitHub配置');
                                return syncInfo.config;
                            }
                        }
                        
                        // 尝试从备份数据提取
                        if (data.syncConfig && data.syncConfig.github) {
                            console.log('从备份数据恢复GitHub配置');
                            return data.syncConfig.github;
                        }
                        
                    } catch (e) {
                        // 如果不是JSON，检查是否包含token模式
                        const tokenMatch = value.match(/ghp_[a-zA-Z0-9]{36}/);
                        const repoMatch = value.match(/github\.com\/([^\/]+)\/([^\/\s"]+)/);
                        
                        if (tokenMatch && repoMatch) {
                            console.log('从文本模式提取GitHub配置');
                            return {
                                token: tokenMatch[0],
                                owner: repoMatch[1],
                                repo: repoMatch[2],
                                branch: 'main'
                            };
                        }
                    }
                }
            }
            
        } catch (error) {
            console.log('历史数据检测失败:', error);
        }
        
        return null;
    }
    
    /**
     * 从数据模式推断配置
     */
    async detectFromDataPattern() {
        // 检查数据的同步特征
        const syncPatterns = await this.analyzeSyncPatterns();
        
        if (syncPatterns.hasRecentSync) {
            // 有最近的同步记录，尝试推断配置
            return this.inferConfigFromPatterns(syncPatterns);
        }
        
        return null;
    }
    
    /**
     * 分析同步模式
     */
    async analyzeSyncPatterns() {
        const patterns = {
            hasRecentSync: false,
            hasSyncMetadata: false,
            hasGithubTrace: false,
            lastSyncTime: null,
            dataVolume: 0
        };
        
        // 检查所有localStorage数据
        const allKeys = Object.keys(localStorage);
        patterns.dataVolume = allKeys.length;
        
        for (const key of allKeys) {
            const value = localStorage.getItem(key);
            
            if (value) {
                // 检查同步时间戳
                if (value.includes('lastModified') || value.includes('lastSync')) {
                    try {
                        const data = JSON.parse(value);
                        if (data.lastModified) {
                            const syncTime = new Date(data.lastModified);
                            if (!patterns.lastSyncTime || syncTime > patterns.lastSyncTime) {
                                patterns.lastSyncTime = syncTime;
                            }
                        }
                        if (data.lastSync) {
                            patterns.hasRecentSync = true;
                            patterns.lastSyncTime = new Date(data.lastSync);
                        }
                    } catch (e) {}
                }
                
                // 检查GitHub痕迹
                if (value.includes('github') || value.includes('ghp_')) {
                    patterns.hasGithubTrace = true;
                }
                
                // 检查同步元数据
                if (value.includes('syncInfo') || value.includes('metadata')) {
                    patterns.hasSyncMetadata = true;
                }
            }
        }
        
        // 判断是否有最近的同步
        if (patterns.lastSyncTime) {
            const daysSinceSync = (Date.now() - patterns.lastSyncTime.getTime()) / (1000 * 60 * 60 * 24);
            patterns.hasRecentSync = daysSinceSync < 30; // 30天内的同步
        }
        
        return patterns;
    }
    
    /**
     * 从模式推断配置
     */
    inferConfigFromPatterns(patterns) {
        if (patterns.hasGithubTrace && patterns.dataVolume > 5) {
            // 如果有GitHub痕迹且数据量不少，提供快速设置选项
            return {
                suggested: true,
                provider: 'github',
                reason: '检测到GitHub使用痕迹和丰富的数据'
            };
        }
        
        return null;
    }
    
    /**
     * 自动设置同步
     */
    async autoSetupSync(config, source) {
        console.log(`🚀 开始自动设置同步 (来源: ${source})`);
        
        try {
            // 等待同步服务准备就绪
            await this.waitForSyncService();
            
            if (config.suggested) {
                // 这是建议配置，显示快速设置
                this.showQuickSetup(config);
                return;
            }
            
            // 验证配置
            const validConfig = await this.validateGitHubConfig(config);
            if (!validConfig) {
                console.log('❌ 配置验证失败，显示手动配置选项');
                this.showConfigError(config, source);
                return;
            }
            
            // 启用同步
            await window.syncService.enableSync('github', validConfig);
            
            // 显示成功通知
            this.showAutoSetupSuccess(source);
            
            // 执行首次同步
            await this.performInitialSync();
            
        } catch (error) {
            console.error('❌ 自动设置同步失败:', error);
            this.showAutoSetupError(error, source);
        }
    }
    
    /**
     * 等待同步服务准备就绪
     */
    async waitForSyncService() {
        let attempts = 0;
        while (attempts < 20) {
            if (window.syncService && window.syncService.enableSync) {
                return;
            }
            await this.delay(500);
            attempts++;
        }
        throw new Error('同步服务未准备就绪');
    }
    
    /**
     * 验证GitHub配置
     */
    async validateGitHubConfig(config) {
        try {
            // 基本验证
            if (!config.token || !config.owner || !config.repo) {
                return null;
            }
            
            // 验证token格式
            if (!config.token.startsWith('ghp_') && !config.token.startsWith('github_pat_')) {
                console.log('⚠️ Token格式可能不正确');
                // 但仍然尝试使用
            }
            
            // 测试连接（可选）
            if (config.testConnection !== false) {
                const testResult = await this.testGitHubConnection(config);
                if (!testResult) {
                    console.log('⚠️ GitHub连接测试失败，但继续尝试');
                }
            }
            
            return {
                token: config.token,
                owner: config.owner,
                repo: config.repo,
                branch: config.branch || 'main'
            };
            
        } catch (error) {
            console.log('配置验证失败:', error);
            return null;
        }
    }
    
    /**
     * 测试GitHub连接
     */
    async testGitHubConnection(config) {
        try {
            const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.log('GitHub连接测试失败:', error);
            return false;
        }
    }
    
    /**
     * 执行初始同步
     */
    async performInitialSync() {
        try {
            console.log('🔄 执行初始同步...');
            
            if (window.syncService && window.syncService.manualSync) {
                await window.syncService.manualSync();
                console.log('✅ 初始同步完成');
            }
            
        } catch (error) {
            console.log('初始同步失败，但不影响自动设置:', error);
        }
    }
    
    /**
     * 显示自动设置成功通知
     */
    showAutoSetupSuccess(source) {
        this.showNotification({
            type: 'success',
            title: '🎉 自动同步已启用',
            message: `成功从${source}恢复GitHub同步配置`,
            duration: 5000,
            actions: [
                {
                    text: '立即同步',
                    action: () => window.syncService.manualSync()
                }
            ]
        });
    }
    
    /**
     * 显示配置错误通知
     */
    showConfigError(config, source) {
        this.showNotification({
            type: 'warning',
            title: '⚠️ 配置需要更新',
            message: `从${source}找到的配置可能已过期`,
            duration: 8000,
            actions: [
                {
                    text: '手动配置',
                    action: () => window.open('sync-settings.html', '_blank')
                },
                {
                    text: '忽略',
                    action: () => {}
                }
            ]
        });
    }
    
    /**
     * 显示自动设置错误
     */
    showAutoSetupError(error, source) {
        this.showNotification({
            type: 'error',
            title: '❌ 自动设置失败',
            message: `无法从${source}恢复同步: ${error.message}`,
            duration: 10000,
            actions: [
                {
                    text: '手动设置',
                    action: () => window.open('sync-settings.html', '_blank')
                }
            ]
        });
    }
    
    /**
     * 显示智能推荐
     */
    async showSmartRecommendation() {
        // 检查是否已经显示过推荐
        const hasShown = localStorage.getItem('hasShownSyncRecommendation');
        if (hasShown) {
            console.log('已显示过同步推荐，跳过');
            return;
        }
        
        // 分析用户数据
        const dataAnalysis = await this.analyzeUserData();
        
        if (dataAnalysis.shouldRecommendSync) {
            this.showSyncRecommendation(dataAnalysis);
            localStorage.setItem('hasShownSyncRecommendation', 'true');
        }
    }
    
    /**
     * 分析用户数据
     */
    async analyzeUserData() {
        const analysis = {
            planCount: 0,
            dataSize: 0,
            hasImportantData: false,
            shouldRecommendSync: false
        };
        
        // 统计计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
        for (const type of planTypes) {
            const key = `planData_${type}`;
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    analysis.planCount += Object.keys(parsed).length;
                    analysis.dataSize += data.length;
                } catch (e) {}
            }
        }
        
        // 检查其他重要数据
        const importantKeys = [
            'habitTrackerData',
            'gratitude_history',
            'mood_history',
            'reflection_templates'
        ];
        
        for (const key of importantKeys) {
            if (localStorage.getItem(key)) {
                analysis.hasImportantData = true;
                break;
            }
        }
        
        // 判断是否应该推荐同步
        analysis.shouldRecommendSync = (
            analysis.planCount >= 3 || 
            analysis.dataSize > 5000 || 
            analysis.hasImportantData
        );
        
        return analysis;
    }
    
    /**
     * 显示同步推荐
     */
    showSyncRecommendation(analysis) {
        const recommendation = document.createElement('div');
        recommendation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            padding: 32px;
            max-width: 480px;
            z-index: 10001;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        recommendation.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">☁️</div>
            <h2 style="color: #1976d2; margin-bottom: 16px; font-size: 24px;">保护您的数据</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                检测到您已创建了 <strong>${analysis.planCount}</strong> 个计划和重要数据。
                <br>建议启用云同步，避免数据丢失。
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="smartAutoSync.startQuickSetup()" style="
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">🚀 快速设置</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">稍后提醒</button>
            </div>
            <div style="margin-top: 16px;">
                <button onclick="localStorage.setItem('hasShownSyncRecommendation', 'permanent'); this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    border: none;
                    color: #999;
                    font-size: 14px;
                    cursor: pointer;
                ">不再提醒</button>
            </div>
        `;
        
        // 添加背景遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        `;
        
        overlay.appendChild(recommendation);
        document.body.appendChild(overlay);
        
        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
    
    /**
     * 开始快速设置
     */
    startQuickSetup() {
        // 移除推荐对话框
        const overlay = document.querySelector('div[style*="position: fixed"][style*="rgba(0,0,0,0.5)"]');
        if (overlay) overlay.remove();
        
        this.showQuickSetupDialog();
    }
    
    /**
     * 显示快速设置对话框
     */
    showQuickSetupDialog() {
        if (this.quickSetupShown) return;
        this.quickSetupShown = true;
        
        const dialog = document.createElement('div');
        dialog.id = 'quick-setup-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            padding: 32px;
            max-width: 500px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        dialog.innerHTML = `
            <h2 style="color: #1976d2; margin-bottom: 20px; text-align: center;">⚡ 快速设置GitHub同步</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">GitHub Token:</label>
                <input type="password" id="quick-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    <a href="https://github.com/settings/tokens" target="_blank" style="color: #1976d2;">创建Token</a>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">用户名:</label>
                    <input type="text" id="quick-owner" placeholder="username" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">仓库名:</label>
                    <input type="text" id="quick-repo" placeholder="plan-data" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #666;">
                <strong>💡 提示:</strong> 建议创建一个私有仓库来存储个人数据。
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="smartAutoSync.processQuickSetup()" style="
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">✅ 立即启用</button>
                <button onclick="smartAutoSync.closeQuickSetup()" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">取消</button>
            </div>
        `;
        
        // 添加背景遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    /**
     * 处理快速设置
     */
    async processQuickSetup() {
        const token = document.getElementById('quick-token').value.trim();
        const owner = document.getElementById('quick-owner').value.trim();
        const repo = document.getElementById('quick-repo').value.trim();
        
        if (!token || !owner || !repo) {
            alert('请填写完整的GitHub配置信息');
            return;
        }
        
        const config = {
            token,
            owner,
            repo,
            branch: 'main'
        };
        
        // 关闭对话框
        this.closeQuickSetup();
        
        // 设置同步
        await this.autoSetupSync(config, '快速设置');
    }
    
    /**
     * 关闭快速设置
     */
    closeQuickSetup() {
        const overlay = document.querySelector('div[style*="position: fixed"][style*="rgba(0,0,0,0.5)"]');
        if (overlay) overlay.remove();
        this.quickSetupShown = false;
    }
    
    /**
     * 显示通知
     */
    showNotification({type, title, message, duration = 5000, actions = []}) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 20px;
            max-width: 400px;
            z-index: 10002;
            border-left: 4px solid ${this.getTypeColor(type)};
            animation: slideIn 0.3s ease;
        `;
        
        let actionsHtml = '';
        if (actions.length > 0) {
            actionsHtml = '<div style="margin-top: 12px; display: flex; gap: 8px;">';
            actions.forEach(action => {
                actionsHtml += `
                    <button onclick="(${action.action.toString()})(); this.closest('[style*=\\"position: fixed\\"]').remove();" style="
                        padding: 6px 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 6px;
                        background: white;
                        cursor: pointer;
                        font-size: 14px;
                    ">${action.text}</button>
                `;
            });
            actionsHtml += '</div>';
        }
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: ${this.getTypeColor(type)};">${title}</div>
            <div style="color: #666; line-height: 1.4;">${message}</div>
            ${actionsHtml}
        `;
        
        document.body.appendChild(notification);
        
        // 自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        // 添加动画样式
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 获取类型颜色
     */
    getTypeColor(type) {
        const colors = {
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 自动启动智能检测
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.smartAutoSync = new SmartAutoSync();
    });
} else {
    window.smartAutoSync = new SmartAutoSync();
}
