/**
 * 增强版零配置同步系统
 * 完全自动化的同步设置和数据恢复
 */

class ZeroConfigSyncEnhanced {
    constructor() {
        this.isActive = false;
        this.autoSetupAttempts = 0;
        this.maxAutoSetupAttempts = 3;
        this.recoveryMethods = [];
        
        // 自动配置检测器
        this.configDetectors = [
            () => this.detectFromUrlParameters(),
            () => this.detectFromQRCode(),
            () => this.detectFromClipboard(),
            () => this.detectFromLocalNetwork(),
            () => this.detectFromBrowserSync(),
            () => this.detectFromUserPreferences()
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🔮 增强版零配置同步系统启动...');
        
        // 延迟启动，确保其他系统已初始化
        await this.delay(3000);
        
        // 检查是否需要启动零配置模式
        if (await this.shouldActivateZeroConfig()) {
            await this.activateZeroConfig();
        }
        
        // 设置自动检测监听器
        this.setupAutoDetectionListeners();
        
        console.log('✅ 增强版零配置同步系统准备就绪');
    }
    
    /**
     * 判断是否应该启动零配置模式
     */
    async shouldActivateZeroConfig() {
        // 检查是否已有有效的同步配置
        if (window.syncService && window.syncService.syncEnabled) {
            console.log('已存在有效同步配置，跳过零配置模式');
            return false;
        }
        
        // 检查是否是首次访问
        const isFirstVisit = !localStorage.getItem('hasVisited');
        if (isFirstVisit) {
            localStorage.setItem('hasVisited', Date.now().toString());
        }
        
        // 检查数据量
        const dataAnalysis = await this.analyzeDataVolume();
        
        // 如果有重要数据但没有同步配置，激活零配置
        return dataAnalysis.hasImportantData && !dataAnalysis.hasSyncConfig;
    }
    
    /**
     * 分析数据量
     */
    async analyzeDataVolume() {
        const analysis = {
            hasImportantData: false,
            hasSyncConfig: false,
            dataPoints: 0,
            dataSize: 0
        };
        
        // 检查计划数据
        const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
        for (const type of planTypes) {
            const data = localStorage.getItem(`planData_${type}`);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    analysis.dataPoints += Object.keys(parsed).length;
                    analysis.dataSize += data.length;
                } catch (e) {}
            }
        }
        
        // 检查其他重要数据
        const importantKeys = [
            'habitTrackerData',
            'gratitude_history',
            'mood_history',
            'reflection_templates',
            'monthlyEvents'
        ];
        
        for (const key of importantKeys) {
            if (localStorage.getItem(key)) {
                analysis.dataPoints += 1;
                analysis.hasImportantData = true;
            }
        }
        
        // 检查同步配置
        const syncKeys = ['sync_config', 'syncConfig'];
        for (const key of syncKeys) {
            if (localStorage.getItem(key)) {
                analysis.hasSyncConfig = true;
                break;
            }
        }
        
        // 判断是否有重要数据
        analysis.hasImportantData = analysis.hasImportantData || 
                                   analysis.dataPoints >= 5 || 
                                   analysis.dataSize > 10000;
        
        return analysis;
    }
    
    /**
     * 激活零配置模式
     */
    async activateZeroConfig() {
        this.isActive = true;
        console.log('🚀 启动零配置自动同步检测...');
        
        // 显示零配置指示器
        this.showZeroConfigIndicator();
        
        // 并行运行所有检测器
        const detectionPromises = this.configDetectors.map(detector => 
            this.runDetectorSafely(detector)
        );
        
        const results = await Promise.allSettled(detectionPromises);
        
        // 分析检测结果
        const validConfigs = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
        
        if (validConfigs.length > 0) {
            console.log(`✅ 检测到 ${validConfigs.length} 个可能的配置`);
            await this.processDetectedConfigs(validConfigs);
        } else {
            console.log('未检测到配置，启动智能推荐模式');
            await this.startSmartRecommendationMode();
        }
    }
    
    /**
     * 安全运行检测器
     */
    async runDetectorSafely(detector) {
        try {
            return await detector();
        } catch (error) {
            console.log('检测器运行失败:', error);
            return null;
        }
    }
    
    /**
     * 从URL参数检测
     */
    detectFromUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        // 检查多种参数格式
        const paramSources = [params, hashParams];
        
        for (const source of paramSources) {
            const config = this.extractConfigFromParams(source);
            if (config) {
                console.log('从URL参数检测到配置');
                return { ...config, source: 'url', confidence: 0.9 };
            }
        }
        
        return null;
    }
    
    /**
     * 从参数中提取配置
     */
    extractConfigFromParams(params) {
        // GitHub配置检测
        const githubConfig = {
            provider: 'github',
            settings: {
                token: params.get('token') || params.get('github_token') || params.get('gh_token'),
                owner: params.get('owner') || params.get('github_owner') || params.get('user'),
                repo: params.get('repo') || params.get('github_repo') || params.get('repository'),
                branch: params.get('branch') || params.get('github_branch') || 'main'
            }
        };
        
        if (githubConfig.settings.token && githubConfig.settings.owner && githubConfig.settings.repo) {
            return githubConfig;
        }
        
        // Google Drive配置检测
        const driveConfig = {
            provider: 'drive',
            settings: {
                accessToken: params.get('access_token') || params.get('drive_token'),
                refreshToken: params.get('refresh_token'),
                folderId: params.get('folder_id') || params.get('drive_folder')
            }
        };
        
        if (driveConfig.settings.accessToken) {
            return driveConfig;
        }
        
        return null;
    }
    
    /**
     * 从二维码检测
     */
    async detectFromQRCode() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return null;
        }
        
        try {
            // 这里可以集成二维码扫描库
            // 暂时返回null，等待实现
            console.log('二维码检测功能待实现');
            return null;
        } catch (error) {
            console.log('二维码检测失败:', error);
            return null;
        }
    }
    
    /**
     * 从剪贴板检测
     */
    async detectFromClipboard() {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            return null;
        }
        
        try {
            const clipText = await navigator.clipboard.readText();
            
            // 检测GitHub配置
            const githubMatch = clipText.match(/github\.com\/([^\/\s]+)\/([^\/\s]+)/);
            const tokenMatch = clipText.match(/(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+)/);
            
            if (githubMatch && tokenMatch) {
                console.log('从剪贴板检测到GitHub配置');
                return {
                    provider: 'github',
                    settings: {
                        token: tokenMatch[1],
                        owner: githubMatch[1],
                        repo: githubMatch[2],
                        branch: 'main'
                    },
                    source: 'clipboard',
                    confidence: 0.8
                };
            }
            
            // 检测配置JSON
            if (clipText.includes('{') && clipText.includes('token')) {
                try {
                    const config = JSON.parse(clipText);
                    if (this.validateConfigStructure(config)) {
                        console.log('从剪贴板检测到配置JSON');
                        return { ...config, source: 'clipboard', confidence: 0.9 };
                    }
                } catch (e) {}
            }
            
        } catch (error) {
            console.log('剪贴板读取失败或被拒绝');
        }
        
        return null;
    }
    
    /**
     * 从本地网络检测
     */
    async detectFromLocalNetwork() {
        // 检测局域网内的同步服务
        const commonPorts = [3000, 8080, 5000, 8000];
        const localIPs = ['192.168.1.1', '192.168.0.1', '10.0.0.1'];
        
        for (const ip of localIPs) {
            for (const port of commonPorts) {
                try {
                    const controller = new AbortController();
                    setTimeout(() => controller.abort(), 1000);
                    
                    const response = await fetch(`http://${ip}:${port}/sync-config`, {
                        signal: controller.signal,
                        mode: 'cors'
                    });
                    
                    if (response.ok) {
                        const config = await response.json();
                        if (this.validateConfigStructure(config)) {
                            console.log(`从本地网络 ${ip}:${port} 检测到配置`);
                            return { ...config, source: 'network', confidence: 0.7 };
                        }
                    }
                } catch (error) {
                    // 忽略网络错误
                }
            }
        }
        
        return null;
    }
    
    /**
     * 从浏览器同步检测
     */
    async detectFromBrowserSync() {
        // 检查浏览器的同步数据（如果可用）
        try {
            if (window.chrome && window.chrome.storage && window.chrome.storage.sync) {
                return new Promise((resolve) => {
                    chrome.storage.sync.get(['syncConfig'], (result) => {
                        if (result.syncConfig && this.validateConfigStructure(result.syncConfig)) {
                            console.log('从Chrome同步检测到配置');
                            resolve({ ...result.syncConfig, source: 'chrome-sync', confidence: 0.8 });
                        } else {
                            resolve(null);
                        }
                    });
                });
            }
        } catch (error) {
            console.log('浏览器同步检测失败:', error);
        }
        
        return null;
    }
    
    /**
     * 从用户偏好检测
     */
    async detectFromUserPreferences() {
        // 根据用户的使用模式推荐配置
        try {
            const userAgent = navigator.userAgent;
            const language = navigator.language;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            // 根据地理位置和语言推荐合适的服务
            const preferences = {
                provider: 'github', // 默认推荐GitHub
                reason: '基于使用模式推荐',
                confidence: 0.3,
                source: 'preference'
            };
            
            // 中国用户可能更适合其他服务
            if (language.startsWith('zh') && timezone.includes('Shanghai')) {
                preferences.alternative = 'gitee';
                preferences.reason += '（检测到中国用户）';
            }
            
            console.log('基于用户偏好生成推荐配置');
            return preferences;
            
        } catch (error) {
            console.log('用户偏好检测失败:', error);
        }
        
        return null;
    }
    
    /**
     * 验证配置结构
     */
    validateConfigStructure(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        
        if (config.provider === 'github') {
            return !!(config.settings && 
                     config.settings.token && 
                     config.settings.owner && 
                     config.settings.repo);
        }
        
        if (config.provider === 'drive') {
            return !!(config.settings && config.settings.accessToken);
        }
        
        return false;
    }
    
    /**
     * 处理检测到的配置
     */
    async processDetectedConfigs(configs) {
        // 按置信度排序
        configs.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        
        const bestConfig = configs[0];
        
        if (bestConfig.confidence >= 0.8) {
            // 高置信度，自动应用
            console.log('高置信度配置，自动应用');
            await this.autoApplyConfig(bestConfig);
        } else if (bestConfig.confidence >= 0.5) {
            // 中等置信度，询问用户
            console.log('中等置信度配置，询问用户确认');
            this.showConfigConfirmation(bestConfig, configs);
        } else {
            // 低置信度，显示建议
            console.log('低置信度配置，显示建议');
            this.showConfigSuggestions(configs);
        }
    }
    
    /**
     * 自动应用配置
     */
    async autoApplyConfig(config) {
        try {
            console.log(`🚀 自动应用${config.provider}配置 (来源: ${config.source})`);
            
            // 等待同步服务准备就绪
            await this.waitForSyncService();
            
            // 应用配置
            await window.syncService.enableSync(config.provider, config.settings);
            
            // 显示成功消息
            this.showAutoConfigSuccess(config);
            
            // 清除URL参数（如果来源是URL）
            if (config.source === 'url') {
                this.clearUrlParams();
            }
            
        } catch (error) {
            console.error('自动应用配置失败:', error);
            this.showAutoConfigError(error, config);
        }
    }
    
    /**
     * 显示配置确认
     */
    showConfigConfirmation(bestConfig, allConfigs) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            padding: 32px;
            max-width: 500px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        dialog.innerHTML = `
            <h2 style="color: #1976d2; margin-bottom: 20px; text-align: center;">🔮 检测到同步配置</h2>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 8px;">推荐配置:</div>
                <div style="color: #666;">
                    <div>提供商: ${bestConfig.provider}</div>
                    <div>来源: ${this.getSourceDisplayName(bestConfig.source)}</div>
                    <div>置信度: ${Math.round((bestConfig.confidence || 0) * 100)}%</div>
                </div>
            </div>
            
            <div style="color: #666; margin-bottom: 24px; line-height: 1.6;">
                检测到可能的同步配置。是否要立即启用自动同步？
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="zeroConfigSyncEnhanced.confirmConfig(${JSON.stringify(bestConfig).replace(/"/g, '&quot;')})" style="
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">✅ 启用同步</button>
                <button onclick="zeroConfigSyncEnhanced.showAllOptions(${JSON.stringify(allConfigs).replace(/"/g, '&quot;')})" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">查看所有选项</button>
                <button onclick="zeroConfigSyncEnhanced.closeDialog()" style="
                    background: transparent;
                    color: #999;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">跳过</button>
            </div>
        `;
        
        this.showDialog(dialog);
    }
    
    /**
     * 确认配置
     */
    async confirmConfig(config) {
        this.closeDialog();
        await this.autoApplyConfig(config);
    }
    
    /**
     * 显示所有选项
     */
    showAllOptions(configs) {
        this.closeDialog();
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            padding: 32px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        let optionsHtml = '';
        configs.forEach((config, index) => {
            optionsHtml += `
                <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 12px; cursor: pointer;" onclick="zeroConfigSyncEnhanced.confirmConfig(${JSON.stringify(config).replace(/"/g, '&quot;')})">
                    <div style="font-weight: bold; margin-bottom: 8px;">${config.provider} (${this.getSourceDisplayName(config.source)})</div>
                    <div style="color: #666; font-size: 14px;">
                        置信度: ${Math.round((config.confidence || 0) * 100)}%
                        ${config.reason ? '<br>' + config.reason : ''}
                    </div>
                </div>
            `;
        });
        
        dialog.innerHTML = `
            <h2 style="color: #1976d2; margin-bottom: 20px; text-align: center;">选择同步配置</h2>
            
            <div style="margin-bottom: 20px;">
                ${optionsHtml}
            </div>
            
            <div style="text-align: center;">
                <button onclick="zeroConfigSyncEnhanced.closeDialog()" style="
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
        
        this.showDialog(dialog);
    }
    
    /**
     * 启动智能推荐模式
     */
    async startSmartRecommendationMode() {
        console.log('启动智能推荐模式');
        
        // 分析用户数据，提供个性化推荐
        const analysis = await this.analyzeUserDataForRecommendation();
        
        this.showSmartRecommendation(analysis);
    }
    
    /**
     * 分析用户数据用于推荐
     */
    async analyzeUserDataForRecommendation() {
        const analysis = {
            dataVolume: 'low',
            userType: 'casual',
            recommendation: 'github',
            reasons: []
        };
        
        // 分析数据量
        const dataAnalysis = await this.analyzeDataVolume();
        
        if (dataAnalysis.dataPoints > 20) {
            analysis.dataVolume = 'high';
            analysis.userType = 'power';
            analysis.reasons.push('您有大量的计划数据');
        } else if (dataAnalysis.dataPoints > 5) {
            analysis.dataVolume = 'medium';
            analysis.userType = 'regular';
            analysis.reasons.push('您有一些重要的数据');
        }
        
        // 推荐最适合的服务
        analysis.reasons.push('GitHub是最可靠的免费选择');
        
        return analysis;
    }
    
    /**
     * 显示智能推荐
     */
    showSmartRecommendation(analysis) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            padding: 32px;
            max-width: 500px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        dialog.innerHTML = `
            <h2 style="color: #1976d2; margin-bottom: 20px; text-align: center;">🤖 智能同步推荐</h2>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">☁️</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">为您推荐: ${analysis.recommendation}</div>
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 8px;">推荐理由:</div>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    ${analysis.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="zeroConfigSyncEnhanced.startQuickSetup('${analysis.recommendation}')" style="
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">🚀 快速设置</button>
                <button onclick="zeroConfigSyncEnhanced.showManualOptions()" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">手动选择</button>
                <button onclick="zeroConfigSyncEnhanced.closeDialog()" style="
                    background: transparent;
                    color: #999;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">稍后设置</button>
            </div>
        `;
        
        this.showDialog(dialog);
    }
    
    /**
     * 开始快速设置
     */
    startQuickSetup(provider) {
        this.closeDialog();
        
        if (window.smartAutoSync) {
            window.smartAutoSync.startQuickSetup();
        } else {
            // 打开同步设置页面
            window.open('sync-settings.html', '_blank');
        }
    }
    
    /**
     * 显示手动选项
     */
    showManualOptions() {
        this.closeDialog();
        window.open('sync-settings.html', '_blank');
    }
    
    /**
     * 显示零配置指示器
     */
    showZeroConfigIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'zero-config-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: pulse 2s infinite;
        `;
        
        indicator.innerHTML = '🔮 正在检测同步配置...';
        
        document.body.appendChild(indicator);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 10000);
    }
    
    /**
     * 显示对话框
     */
    showDialog(dialog) {
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
        
        // 存储当前对话框引用
        this.currentDialog = overlay;
    }
    
    /**
     * 关闭对话框
     */
    closeDialog() {
        if (this.currentDialog && this.currentDialog.parentNode) {
            this.currentDialog.remove();
            this.currentDialog = null;
        }
    }
    
    /**
     * 设置自动检测监听器
     */
    setupAutoDetectionListeners() {
        // 监听剪贴板变化（如果支持）
        if (document.hasFocus && navigator.clipboard) {
            let lastClipboardCheck = 0;
            
            setInterval(async () => {
                if (document.hasFocus() && Date.now() - lastClipboardCheck > 5000) {
                    lastClipboardCheck = Date.now();
                    
                    try {
                        const config = await this.detectFromClipboard();
                        if (config && !this.isActive) {
                            console.log('剪贴板检测到新配置');
                            this.showQuickConfigFromClipboard(config);
                        }
                    } catch (e) {
                        // 忽略剪贴板错误
                    }
                }
            }, 5000);
        }
        
        // 监听URL变化
        let lastUrl = window.location.href;
        setInterval(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                
                const config = this.detectFromUrlParameters();
                if (config && !window.syncService.syncEnabled) {
                    console.log('URL变化检测到新配置');
                    this.autoApplyConfig(config);
                }
            }
        }, 1000);
    }
    
    /**
     * 显示来自剪贴板的快速配置
     */
    showQuickConfigFromClipboard(config) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 16px;
            max-width: 300px;
            z-index: 10002;
            border-left: 4px solid #4caf50;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #4caf50;">📋 检测到同步配置</div>
            <div style="color: #666; margin-bottom: 12px; font-size: 14px;">
                从剪贴板检测到${config.provider}配置
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="zeroConfigSyncEnhanced.autoApplyConfig(${JSON.stringify(config).replace(/"/g, '&quot;')}); this.closest('div[style*=\\"position: fixed\\"]').remove();" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">立即应用</button>
                <button onclick="this.closest('div[style*=\\"position: fixed\\"]').remove();" style="
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
        
        document.body.appendChild(notification);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    /**
     * 获取来源显示名称
     */
    getSourceDisplayName(source) {
        const names = {
            'url': 'URL参数',
            'clipboard': '剪贴板',
            'network': '本地网络',
            'chrome-sync': 'Chrome同步',
            'preference': '智能推荐'
        };
        return names[source] || source;
    }
    
    /**
     * 显示自动配置成功
     */
    showAutoConfigSuccess(config) {
        const success = document.createElement('div');
        success.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            padding: 32px;
            text-align: center;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        success.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h2 style="color: #4caf50; margin-bottom: 16px;">同步已启用</h2>
            <p style="color: #666; margin-bottom: 24px;">
                已自动配置${config.provider}同步<br>
                您的数据现在会自动备份
            </p>
            <button onclick="this.parentElement.remove(); if(window.syncService) window.syncService.manualSync();" style="
                background: #4caf50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
            ">立即同步</button>
        `;
        
        document.body.appendChild(success);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (success.parentNode) {
                success.remove();
            }
        }, 5000);
    }
    
    /**
     * 显示自动配置错误
     */
    showAutoConfigError(error, config) {
        console.error('自动配置失败:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
        `;
        
        errorDiv.innerHTML = `
            <div style="color: #721c24; font-weight: bold; margin-bottom: 8px;">❌ 自动配置失败</div>
            <div style="color: #721c24; margin-bottom: 12px; font-size: 14px;">
                ${error.message}
            </div>
            <button onclick="window.open('sync-settings.html', '_blank'); this.parentElement.remove();" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">手动设置</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 8000);
    }
    
    /**
     * 清除URL参数
     */
    clearUrlParams() {
        try {
            const url = new URL(window.location);
            url.search = '';
            url.hash = '';
            history.replaceState(null, '', url.toString());
            console.log('已清除URL参数以保护隐私');
        } catch (error) {
            console.log('清除URL参数失败:', error);
        }
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
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 自动启动增强版零配置同步
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.zeroConfigSyncEnhanced = new ZeroConfigSyncEnhanced();
    });
} else {
    window.zeroConfigSyncEnhanced = new ZeroConfigSyncEnhanced();
}
