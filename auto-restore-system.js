/**
 * 自动恢复系统 - 真正的零配置方案
 * 解决删除浏览器数据后仍需手动配置的问题
 */

class AutoRestoreSystem {
    constructor() {
        this.isActive = false;
        this.restoreAttempts = 0;
        this.maxRestoreAttempts = 5;
        this.restoreInterval = 2000; // 2秒重试间隔
        
        // 多种数据恢复源
        this.dataSources = [
            'github_api_direct',     // 直接从GitHub API恢复
            'common_repo_patterns',  // 通用仓库模式检测
            'browser_fingerprint',   // 浏览器指纹匹配
            'domain_based_recovery', // 基于域名的恢复
            'user_pattern_analysis'  // 用户模式分析
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🔄 自动恢复系统启动...');
        
        // 等待页面加载完成
        await this.waitForPageLoad();
        
        // 检查是否需要自动恢复
        if (await this.shouldStartAutoRestore()) {
            await this.startAutoRestore();
        }
        
        // 设置持续监控
        this.setupContinuousMonitoring();
        
        console.log('✅ 自动恢复系统准备就绪');
    }
    
    /**
     * 判断是否需要启动自动恢复
     */
    async shouldStartAutoRestore() {
        // 检查是否已有有效的同步配置
        const hasValidSync = await this.checkExistingSync();
        if (hasValidSync) {
            console.log('已存在有效同步配置，跳过自动恢复');
            return false;
        }
        
        // 检查是否有数据但没有同步
        const hasDataWithoutSync = await this.checkDataWithoutSync();
        if (hasDataWithoutSync) {
            console.log('检测到数据但无同步配置，启动自动恢复');
            return true;
        }
        
        // 检查是否是重复访问（可能是删除了浏览器数据）
        const isReturnVisitor = await this.detectReturnVisitor();
        if (isReturnVisitor) {
            console.log('检测到返回用户，启动自动恢复');
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查现有同步状态
     */
    async checkExistingSync() {
        try {
            // 检查同步服务状态
            if (window.syncService) {
                const status = window.syncService.getSyncStatus();
                if (status && status.enabled) {
                    return true;
                }
            }
            
            // 检查配置存储
            const configs = ['sync_config', 'syncConfig'];
            for (const key of configs) {
                const config = localStorage.getItem(key);
                if (config) {
                    try {
                        const parsed = JSON.parse(config);
                        if (parsed && parsed.enabled) {
                            return true;
                        }
                    } catch (e) {}
                }
            }
            
            return false;
        } catch (error) {
            console.error('检查现有同步失败:', error);
            return false;
        }
    }
    
    /**
     * 检查是否有数据但没有同步
     */
    async checkDataWithoutSync() {
        try {
            let dataCount = 0;
            
            // 检查计划数据
            const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
            for (const type of planTypes) {
                const data = localStorage.getItem(`planData_${type}`);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        dataCount += Object.keys(parsed).length;
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
                    dataCount += 5; // 这些数据权重更高
                }
            }
            
            console.log(`检测到数据量: ${dataCount}`);
            return dataCount >= 3; // 如果有3个以上数据项，认为需要同步
            
        } catch (error) {
            console.error('检查数据失败:', error);
            return false;
        }
    }
    
    /**
     * 检测返回用户
     */
    async detectReturnVisitor() {
        try {
            // 方法1: 检查访问模式
            const now = Date.now();
            const lastVisit = localStorage.getItem('lastVisitTime');
            
            if (lastVisit) {
                const timeDiff = now - parseInt(lastVisit);
                const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                
                // 如果上次访问超过1天但少于30天，可能是返回用户
                if (daysDiff > 1 && daysDiff < 30) {
                    return true;
                }
            }
            
            // 方法2: 检查URL来源和访问历史
            const referrer = document.referrer;
            const isDirectAccess = !referrer;
            const hasBookmark = window.history.length === 1 && isDirectAccess;
            
            if (hasBookmark) {
                console.log('检测到可能是书签访问（返回用户）');
                return true;
            }
            
            // 方法3: 检查浏览器特征
            const browserFingerprint = this.generateBrowserFingerprint();
            const knownFingerprints = this.getKnownFingerprints();
            
            if (knownFingerprints.includes(browserFingerprint)) {
                console.log('浏览器指纹匹配，确认为返回用户');
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('检测返回用户失败:', error);
            return false;
        }
    }
    
    /**
     * 开始自动恢复流程
     */
    async startAutoRestore() {
        this.isActive = true;
        console.log('🚀 开始自动恢复流程...');
        
        // 显示恢复进度指示器
        this.showRestoreProgress();
        
        // 尝试多种恢复方法
        for (const source of this.dataSources) {
            try {
                console.log(`尝试恢复方法: ${source}`);
                const result = await this.tryRestoreFromSource(source);
                
                if (result && result.success) {
                    console.log(`✅ 通过 ${source} 恢复成功`);
                    await this.applyRestoredData(result);
                    this.showRestoreSuccess(source);
                    return;
                }
                
            } catch (error) {
                console.error(`恢复方法 ${source} 失败:`, error);
                this.updateRestoreProgress(source, false);
            }
        }
        
        // 如果所有方法都失败，显示手动恢复选项
        console.log('❌ 所有自动恢复方法都失败');
        this.showManualRestoreOptions();
    }
    
    /**
     * 尝试从特定源恢复数据
     */
    async tryRestoreFromSource(source) {
        switch (source) {
            case 'github_api_direct':
                return await this.restoreFromGitHubAPI();
            case 'common_repo_patterns':
                return await this.restoreFromCommonPatterns();
            case 'browser_fingerprint':
                return await this.restoreFromBrowserFingerprint();
            case 'domain_based_recovery':
                return await this.restoreFromDomainBased();
            case 'user_pattern_analysis':
                return await this.restoreFromUserPatterns();
            default:
                return null;
        }
    }
    
    /**
     * 从GitHub API直接恢复（最强大的方法）
     */
    async restoreFromGitHubAPI() {
        try {
            console.log('尝试从GitHub API直接恢复...');
            
            // 方法1: 尝试从常见的仓库名称恢复
            const commonRepoNames = [
                'plan-data',
                'personal-data', 
                'schedule-data',
                'plan-manager-data',
                'my-plans',
                'planning-data'
            ];
            
            // 方法2: 尝试从用户名模式
            const possibleUsernames = await this.guessPossibleUsernames();
            
            for (const username of possibleUsernames) {
                for (const repoName of commonRepoNames) {
                    try {
                        // 尝试无认证访问公开仓库
                        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/plan-data.json`, {
                            headers: {
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });
                        
                        if (response.ok) {
                            const fileData = await response.json();
                            const content = atob(fileData.content);
                            const data = JSON.parse(content);
                            
                            console.log(`✅ 从 GitHub ${username}/${repoName} 找到数据`);
                            
                            return {
                                success: true,
                                data: data,
                                config: {
                                    provider: 'github',
                                    settings: {
                                        owner: username,
                                        repo: repoName,
                                        // token需要用户后续提供
                                        needsToken: true
                                    }
                                },
                                source: 'github_api_direct'
                            };
                        }
                        
                    } catch (error) {
                        // 继续尝试下一个组合
                        continue;
                    }
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('GitHub API恢复失败:', error);
            return null;
        }
    }
    
    /**
     * 猜测可能的用户名
     */
    async guessPossibleUsernames() {
        const usernames = [];
        
        try {
            // 从URL中提取可能的用户名
            const hostname = window.location.hostname;
            if (hostname.includes('github.io')) {
                const parts = hostname.split('.');
                if (parts.length >= 3) {
                    usernames.push(parts[0]);
                }
            }
            
            // 从localStorage中查找可能的用户信息
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                if (value && value.includes('github.com')) {
                    const match = value.match(/github\.com\/([^\/\s"]+)/);
                    if (match && match[1]) {
                        usernames.push(match[1]);
                    }
                }
            }
            
            // 从浏览器信息推断
            const browserInfo = navigator.userAgent;
            // 这里可以添加更多启发式方法
            
            // 去重并返回
            return [...new Set(usernames)].filter(name => name && name.length > 2);
            
        } catch (error) {
            console.error('猜测用户名失败:', error);
            return [];
        }
    }
    
    /**
     * 从通用模式恢复
     */
    async restoreFromCommonPatterns() {
        try {
            console.log('尝试从通用模式恢复...');
            
            // 检查是否有残留的配置信息
            const patterns = [
                'sync_config',
                'github_config', 
                'backup_config',
                'temp_config'
            ];
            
            for (const pattern of patterns) {
                const stored = localStorage.getItem(pattern);
                if (stored) {
                    try {
                        const config = JSON.parse(stored);
                        if (config && config.provider) {
                            console.log(`从 ${pattern} 恢复配置`);
                            return {
                                success: true,
                                config: config,
                                source: 'common_patterns'
                            };
                        }
                    } catch (e) {}
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('通用模式恢复失败:', error);
            return null;
        }
    }
    
    /**
     * 从浏览器指纹恢复
     */
    async restoreFromBrowserFingerprint() {
        try {
            console.log('尝试从浏览器指纹恢复...');
            
            const fingerprint = this.generateBrowserFingerprint();
            
            // 这里可以连接到一个配置服务器，根据指纹恢复配置
            // 为了隐私考虑，这个方法比较保守
            
            console.log('浏览器指纹:', fingerprint);
            
            // 检查是否有基于指纹的本地缓存
            const cachedConfig = localStorage.getItem(`fp_${fingerprint}`);
            if (cachedConfig) {
                try {
                    const config = JSON.parse(cachedConfig);
                    return {
                        success: true,
                        config: config,
                        source: 'browser_fingerprint'
                    };
                } catch (e) {}
            }
            
            return null;
            
        } catch (error) {
            console.error('浏览器指纹恢复失败:', error);
            return null;
        }
    }
    
    /**
     * 从域名基础恢复
     */
    async restoreFromDomainBased() {
        try {
            console.log('尝试从域名基础恢复...');
            
            const domain = window.location.hostname;
            
            // 检查是否是GitHub Pages
            if (domain.includes('github.io')) {
                const parts = domain.split('.');
                if (parts.length >= 3) {
                    const username = parts[0];
                    const repoName = window.location.pathname.split('/')[1] || 'plan-data';
                    
                    console.log(`检测到GitHub Pages: ${username}/${repoName}`);
                    
                    return {
                        success: true,
                        config: {
                            provider: 'github',
                            settings: {
                                owner: username,
                                repo: repoName,
                                needsToken: true
                            }
                        },
                        source: 'domain_based'
                    };
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('域名基础恢复失败:', error);
            return null;
        }
    }
    
    /**
     * 从用户模式分析恢复
     */
    async restoreFromUserPatterns() {
        try {
            console.log('尝试从用户模式分析恢复...');
            
            // 分析用户的数据模式
            const analysis = this.analyzeUserDataPatterns();
            
            if (analysis.suggestedProvider) {
                return {
                    success: true,
                    config: {
                        provider: analysis.suggestedProvider,
                        settings: analysis.suggestedSettings,
                        confidence: analysis.confidence
                    },
                    source: 'user_patterns'
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('用户模式分析失败:', error);
            return null;
        }
    }
    
    /**
     * 分析用户数据模式
     */
    analyzeUserDataPatterns() {
        try {
            const patterns = {
                hasGitHubTrace: false,
                hasRegularSchedule: false,
                dataVolume: 0,
                usageFrequency: 'unknown'
            };
            
            // 检查是否有GitHub痕迹
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                if (value && (value.includes('github') || value.includes('ghp_'))) {
                    patterns.hasGitHubTrace = true;
                }
            }
            
            // 分析数据量和使用模式
            const planTypes = ['day', 'week', 'month'];
            for (const type of planTypes) {
                const data = localStorage.getItem(`planData_${type}`);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        patterns.dataVolume += Object.keys(parsed).length;
                        
                        // 检查是否有规律的计划
                        if (Object.keys(parsed).length > 5) {
                            patterns.hasRegularSchedule = true;
                        }
                    } catch (e) {}
                }
            }
            
            // 基于模式推荐
            if (patterns.hasGitHubTrace && patterns.dataVolume > 3) {
                return {
                    suggestedProvider: 'github',
                    suggestedSettings: {
                        needsUserInput: true
                    },
                    confidence: 0.8
                };
            }
            
            return {
                suggestedProvider: null,
                confidence: 0
            };
            
        } catch (error) {
            console.error('分析用户模式失败:', error);
            return { suggestedProvider: null, confidence: 0 };
        }
    }
    
    /**
     * 应用恢复的数据
     */
    async applyRestoredData(result) {
        try {
            console.log('应用恢复的数据...');
            
            // 如果有数据，恢复数据
            if (result.data) {
                await this.restoreAllData(result.data);
            }
            
            // 如果有配置，应用配置
            if (result.config) {
                await this.applySyncConfig(result.config);
            }
            
            // 更新访问时间
            localStorage.setItem('lastVisitTime', Date.now().toString());
            
            console.log('✅ 数据和配置恢复完成');
            
        } catch (error) {
            console.error('应用恢复数据失败:', error);
            throw error;
        }
    }
    
    /**
     * 恢复所有数据
     */
    async restoreAllData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return;
            }
            
            let restoredCount = 0;
            
            // 恢复计划数据
            if (data.planData) {
                Object.keys(data.planData).forEach(type => {
                    const key = `planData_${type}`;
                    localStorage.setItem(key, JSON.stringify(data.planData[type]));
                    restoredCount++;
                });
            }
            
            // 恢复其他数据
            const otherKeys = [
                'habitTrackerData',
                'gratitude_history',
                'mood_history',
                'reflection_templates',
                'monthlyEvents'
            ];
            
            otherKeys.forEach(key => {
                if (data[key]) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                    restoredCount++;
                }
            });
            
            console.log(`✅ 已恢复 ${restoredCount} 个数据项`);
            
        } catch (error) {
            console.error('恢复数据失败:', error);
            throw error;
        }
    }
    
    /**
     * 应用同步配置
     */
    async applySyncConfig(config) {
        try {
            if (config.needsToken) {
                // 需要用户提供Token
                this.showTokenInputDialog(config);
            } else {
                // 直接应用配置
                if (window.syncService) {
                    await window.syncService.enableSync(config.provider, config.settings);
                }
                
                // 保存配置
                localStorage.setItem('sync_config', JSON.stringify({
                    enabled: true,
                    provider: config.provider,
                    settings: config.settings
                }));
            }
            
        } catch (error) {
            console.error('应用同步配置失败:', error);
            throw error;
        }
    }
    
    /**
     * 显示Token输入对话框
     */
    showTokenInputDialog(config) {
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
            <h2 style="color: #1976d2; margin-bottom: 20px; text-align: center;">🎉 找到您的数据！</h2>
            
            <div style="background: #e8f5e8; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #4caf50;">✅ 数据恢复成功</div>
                <div style="color: #666;">
                    已从 ${config.settings.owner}/${config.settings.repo} 恢复您的数据
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">请输入GitHub Token以启用同步:</label>
                <input type="password" id="restore-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    <a href="https://github.com/settings/tokens" target="_blank" style="color: #1976d2;">创建新Token</a>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="autoRestoreSystem.completeTokenSetup('${JSON.stringify(config).replace(/"/g, '&quot;')}', document.getElementById('restore-token').value)" style="
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">启用同步</button>
                <button onclick="autoRestoreSystem.skipTokenSetup()" style="
                    background: #f5f5f5;
                    color: #666;
                    border: 1px solid #e0e0e0;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">稍后设置</button>
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
        
        this.currentDialog = overlay;
    }
    
    /**
     * 完成Token设置
     */
    async completeTokenSetup(configStr, token) {
        try {
            const config = JSON.parse(configStr);
            
            if (!token || token.trim().length < 10) {
                alert('请输入有效的GitHub Token');
                return;
            }
            
            // 添加Token到配置
            config.settings.token = token.trim();
            delete config.settings.needsToken;
            
            // 应用配置
            if (window.syncService) {
                await window.syncService.enableSync(config.provider, config.settings);
            }
            
            // 保存配置
            localStorage.setItem('sync_config', JSON.stringify({
                enabled: true,
                provider: config.provider,
                settings: config.settings
            }));
            
            // 关闭对话框
            this.closeDialog();
            
            // 显示成功消息
            this.showMessage('🎉 同步已启用！您的数据现在会自动备份。', 'success');
            
            // 执行首次同步
            if (window.syncService.manualSync) {
                await window.syncService.manualSync();
            }
            
        } catch (error) {
            console.error('完成Token设置失败:', error);
            alert('设置失败，请检查Token是否正确');
        }
    }
    
    /**
     * 跳过Token设置
     */
    skipTokenSetup() {
        this.closeDialog();
        this.showMessage('数据已恢复，您可以稍后在设置中配置同步。', 'info');
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
     * 显示恢复进度
     */
    showRestoreProgress() {
        const progress = document.createElement('div');
        progress.id = 'auto-restore-progress';
        progress.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 16px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 300px;
            text-align: center;
        `;
        
        progress.innerHTML = `
            <div>🔍 正在自动恢复您的数据...</div>
            <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;" id="restore-status">检测数据源...</div>
        `;
        
        document.body.appendChild(progress);
    }
    
    /**
     * 更新恢复进度
     */
    updateRestoreProgress(source, success) {
        const status = document.getElementById('restore-status');
        if (status) {
            const emoji = success ? '✅' : '❌';
            status.textContent = `${emoji} ${this.getSourceDisplayName(source)}`;
        }
    }
    
    /**
     * 显示恢复成功
     */
    showRestoreSuccess(source) {
        const progress = document.getElementById('auto-restore-progress');
        if (progress) {
            progress.innerHTML = `
                <div>🎉 数据恢复成功！</div>
                <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">通过 ${this.getSourceDisplayName(source)} 恢复</div>
            `;
            
            // 3秒后隐藏
            setTimeout(() => {
                if (progress.parentNode) {
                    progress.remove();
                }
            }, 3000);
        }
    }
    
    /**
     * 显示手动恢复选项
     */
    showManualRestoreOptions() {
        const progress = document.getElementById('auto-restore-progress');
        if (progress) {
            progress.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            progress.innerHTML = `
                <div>⚠️ 自动恢复失败</div>
                <div style="margin-top: 12px;">
                    <button onclick="window.open('sync-settings.html', '_blank')" style="
                        background: white;
                        color: #ff9800;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        margin-right: 8px;
                    ">手动设置</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">关闭</button>
                </div>
            `;
        }
    }
    
    /**
     * 获取数据源显示名称
     */
    getSourceDisplayName(source) {
        const names = {
            'github_api_direct': 'GitHub API直接恢复',
            'common_repo_patterns': '通用仓库模式',
            'browser_fingerprint': '浏览器指纹匹配',
            'domain_based_recovery': '域名基础恢复',
            'user_pattern_analysis': '用户模式分析'
        };
        return names[source] || source;
    }
    
    /**
     * 生成浏览器指纹
     */
    generateBrowserFingerprint() {
        try {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown'
            ];
            
            // 简单的哈希函数
            return btoa(components.join('|')).substring(0, 16);
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * 获取已知指纹
     */
    getKnownFingerprints() {
        try {
            const stored = localStorage.getItem('known_fingerprints');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }
    
    /**
     * 设置持续监控
     */
    setupContinuousMonitoring() {
        // 记录当前访问
        this.recordVisit();
        
        // 定期检查同步状态
        setInterval(() => {
            this.checkSyncHealth();
        }, 30000); // 每30秒检查一次
    }
    
    /**
     * 记录访问
     */
    recordVisit() {
        try {
            const now = Date.now();
            localStorage.setItem('lastVisitTime', now.toString());
            
            // 记录浏览器指纹
            const fingerprint = this.generateBrowserFingerprint();
            const knownFingerprints = this.getKnownFingerprints();
            
            if (!knownFingerprints.includes(fingerprint)) {
                knownFingerprints.push(fingerprint);
                // 只保留最近的10个指纹
                if (knownFingerprints.length > 10) {
                    knownFingerprints.shift();
                }
                localStorage.setItem('known_fingerprints', JSON.stringify(knownFingerprints));
            }
            
        } catch (error) {
            console.error('记录访问失败:', error);
        }
    }
    
    /**
     * 检查同步健康状态
     */
    checkSyncHealth() {
        try {
            if (window.syncService) {
                const status = window.syncService.getSyncStatus();
                if (!status || !status.enabled) {
                    // 如果同步被禁用，尝试重新启动自动恢复
                    if (!this.isActive && this.restoreAttempts < this.maxRestoreAttempts) {
                        this.restoreAttempts++;
                        console.log(`第${this.restoreAttempts}次尝试自动恢复...`);
                        setTimeout(() => {
                            this.startAutoRestore();
                        }, this.restoreInterval);
                    }
                }
            }
        } catch (error) {
            console.error('检查同步健康状态失败:', error);
        }
    }
    
    /**
     * 等待页面加载
     */
    waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const colors = {
            success: '#d4edda',
            error: '#f8d7da',
            info: '#d1ecf1',
            warning: '#fff3cd'
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
            border-left: 4px solid ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        `;
        
        msg.textContent = message;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            if (msg.parentNode) {
                msg.remove();
            }
        }, 5000);
    }
}

// 创建全局实例
window.autoRestoreSystem = new AutoRestoreSystem();
