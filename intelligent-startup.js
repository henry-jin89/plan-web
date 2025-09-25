/**
 * 智能启动器 - 协调所有自动恢复系统
 * 确保各个系统按正确顺序启动，避免冲突
 */

class IntelligentStartup {
    constructor() {
        this.startupPhases = [
            'initialization',
            'data_detection', 
            'config_recovery',
            'auto_restore',
            'sync_activation',
            'completion'
        ];
        
        this.currentPhase = 'initialization';
        this.systemStatus = {
            syncPersistence: false,
            smartAutoSync: false,
            zeroConfigSync: false,
            autoRestoreSystem: false,
            emergencyRecovery: false
        };
        
        this.startupResults = {
            dataRestored: false,
            configRestored: false,
            syncEnabled: false,
            method: null
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 智能启动器开始启动...');
        
        // 等待页面和基础系统就绪
        await this.waitForPageReady();
        
        // 开始智能启动流程
        await this.startIntelligentBootstrap();
        
        console.log('✅ 智能启动器完成');
    }
    
    /**
     * 等待页面就绪
     */
    async waitForPageReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    /**
     * 开始智能启动流程
     */
    async startIntelligentBootstrap() {
        try {
            // 阶段1: 初始化检查
            await this.executePhase('initialization');
            
            // 阶段2: 数据检测
            await this.executePhase('data_detection');
            
            // 阶段3: 配置恢复
            await this.executePhase('config_recovery');
            
            // 阶段4: 自动恢复
            await this.executePhase('auto_restore');
            
            // 阶段5: 同步激活
            await this.executePhase('sync_activation');
            
            // 阶段6: 完成
            await this.executePhase('completion');
            
        } catch (error) {
            console.error('智能启动流程失败:', error);
            this.handleStartupFailure(error);
        }
    }
    
    /**
     * 执行指定阶段
     */
    async executePhase(phase) {
        console.log(`📍 执行阶段: ${phase}`);
        this.currentPhase = phase;
        
        switch (phase) {
            case 'initialization':
                await this.initializationPhase();
                break;
            case 'data_detection':
                await this.dataDetectionPhase();
                break;
            case 'config_recovery':
                await this.configRecoveryPhase();
                break;
            case 'auto_restore':
                await this.autoRestorePhase();
                break;
            case 'sync_activation':
                await this.syncActivationPhase();
                break;
            case 'completion':
                await this.completionPhase();
                break;
        }
        
        console.log(`✅ 阶段 ${phase} 完成`);
    }
    
    /**
     * 初始化阶段
     */
    async initializationPhase() {
        // 等待所有系统组件加载
        await this.waitForSystemComponents();
        
        // 检查系统完整性
        this.checkSystemIntegrity();
        
        // 初始化状态监控
        this.setupStatusMonitoring();
    }
    
    /**
     * 等待系统组件
     */
    async waitForSystemComponents() {
        const maxWaitTime = 10000; // 最多等待10秒
        const checkInterval = 200; // 每200ms检查一次
        let elapsed = 0;
        
        while (elapsed < maxWaitTime) {
            // 检查各个系统是否已加载
            this.systemStatus.syncPersistence = !!window.syncPersistence;
            this.systemStatus.smartAutoSync = !!window.smartAutoSync;
            this.systemStatus.zeroConfigSync = !!window.zeroConfigSyncEnhanced;
            this.systemStatus.autoRestoreSystem = !!window.autoRestoreSystem;
            this.systemStatus.emergencyRecovery = !!window.emergencyRecovery;
            
            // 检查是否所有系统都已加载
            const allLoaded = Object.values(this.systemStatus).every(status => status);
            
            if (allLoaded) {
                console.log('✅ 所有系统组件已加载');
                return;
            }
            
            await this.delay(checkInterval);
            elapsed += checkInterval;
        }
        
        // 记录未加载的组件
        const notLoaded = Object.entries(this.systemStatus)
            .filter(([_, loaded]) => !loaded)
            .map(([name, _]) => name);
            
        console.warn('⚠️ 以下组件未能及时加载:', notLoaded);
    }
    
    /**
     * 检查系统完整性
     */
    checkSystemIntegrity() {
        const issues = [];
        
        // 检查localStorage可用性
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            issues.push('localStorage不可用');
        }
        
        // 检查IndexedDB可用性
        if (!window.indexedDB) {
            issues.push('IndexedDB不支持');
        }
        
        // 检查网络连接
        if (!navigator.onLine) {
            issues.push('网络离线');
        }
        
        if (issues.length > 0) {
            console.warn('⚠️ 系统完整性检查发现问题:', issues);
        } else {
            console.log('✅ 系统完整性检查通过');
        }
    }
    
    /**
     * 数据检测阶段
     */
    async dataDetectionPhase() {
        console.log('🔍 开始数据检测...');
        
        const dataAnalysis = await this.analyzeExistingData();
        
        console.log('数据分析结果:', dataAnalysis);
        
        // 根据数据情况决定后续策略
        if (dataAnalysis.hasSignificantData && !dataAnalysis.hasSyncConfig) {
            console.log('📊 检测到重要数据但无同步配置，需要恢复');
            this.startupResults.needsRestore = true;
        } else if (dataAnalysis.hasSyncConfig) {
            console.log('⚙️ 检测到现有同步配置');
            this.startupResults.configExists = true;
        } else {
            console.log('📝 新用户或无重要数据');
            this.startupResults.isNewUser = true;
        }
    }
    
    /**
     * 分析现有数据
     */
    async analyzeExistingData() {
        const analysis = {
            hasSignificantData: false,
            hasSyncConfig: false,
            dataVolume: 0,
            dataTypes: [],
            lastActivity: null
        };
        
        try {
            // 检查计划数据
            const planTypes = ['day', 'week', 'month', 'quarter', 'halfyear', 'year'];
            for (const type of planTypes) {
                const data = localStorage.getItem(`planData_${type}`);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        const count = Object.keys(parsed).length;
                        analysis.dataVolume += count;
                        if (count > 0) {
                            analysis.dataTypes.push(type);
                        }
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
                    analysis.dataVolume += 5; // 这些数据权重更高
                    analysis.dataTypes.push(key);
                }
            }
            
            // 检查同步配置
            const syncConfigs = ['sync_config', 'syncConfig'];
            for (const key of syncConfigs) {
                const config = localStorage.getItem(key);
                if (config) {
                    try {
                        const parsed = JSON.parse(config);
                        if (parsed && parsed.enabled) {
                            analysis.hasSyncConfig = true;
                            break;
                        }
                    } catch (e) {}
                }
            }
            
            // 检查最后活动时间
            const lastVisit = localStorage.getItem('lastVisitTime');
            if (lastVisit) {
                analysis.lastActivity = new Date(parseInt(lastVisit));
            }
            
            // 判断是否有重要数据
            analysis.hasSignificantData = analysis.dataVolume >= 3;
            
        } catch (error) {
            console.error('数据分析失败:', error);
        }
        
        return analysis;
    }
    
    /**
     * 配置恢复阶段
     */
    async configRecoveryPhase() {
        if (this.startupResults.configExists) {
            console.log('✅ 配置已存在，跳过恢复阶段');
            return;
        }
        
        if (!this.startupResults.needsRestore) {
            console.log('ℹ️ 无需配置恢复，跳过此阶段');
            return;
        }
        
        console.log('🔄 开始配置恢复...');
        
        // 尝试多种恢复方法
        const recoveryMethods = [
            () => this.recoverFromPersistence(),
            () => this.recoverFromSmartDetection(),
            () => this.recoverFromZeroConfig()
        ];
        
        for (const method of recoveryMethods) {
            try {
                const result = await method();
                if (result && result.success) {
                    console.log('✅ 配置恢复成功:', result.method);
                    this.startupResults.configRestored = true;
                    this.startupResults.method = result.method;
                    return;
                }
            } catch (error) {
                console.warn('配置恢复方法失败:', error);
            }
        }
        
        console.log('❌ 所有配置恢复方法都失败');
    }
    
    /**
     * 从持久化系统恢复
     */
    async recoverFromPersistence() {
        if (!window.syncPersistence) {
            return null;
        }
        
        try {
            const config = window.syncPersistence.loadConfig();
            if (config && config.enabled) {
                return {
                    success: true,
                    method: 'persistence',
                    config: config
                };
            }
        } catch (error) {
            console.error('从持久化系统恢复失败:', error);
        }
        
        return null;
    }
    
    /**
     * 从智能检测恢复
     */
    async recoverFromSmartDetection() {
        if (!window.smartAutoSync) {
            return null;
        }
        
        try {
            // 触发智能检测（但不显示UI）
            const detected = await this.triggerSilentDetection();
            if (detected) {
                return {
                    success: true,
                    method: 'smart_detection',
                    config: detected
                };
            }
        } catch (error) {
            console.error('智能检测恢复失败:', error);
        }
        
        return null;
    }
    
    /**
     * 从零配置系统恢复
     */
    async recoverFromZeroConfig() {
        if (!window.zeroConfigSyncEnhanced) {
            return null;
        }
        
        try {
            // 尝试各种零配置检测方法
            const methods = [
                'detectFromUrlParameters',
                'detectFromClipboard',
                'detectFromBrowserSync'
            ];
            
            for (const methodName of methods) {
                if (typeof window.zeroConfigSyncEnhanced[methodName] === 'function') {
                    const result = await window.zeroConfigSyncEnhanced[methodName]();
                    if (result && result.confidence > 0.5) {
                        return {
                            success: true,
                            method: 'zero_config_' + methodName,
                            config: result
                        };
                    }
                }
            }
        } catch (error) {
            console.error('零配置恢复失败:', error);
        }
        
        return null;
    }
    
    /**
     * 自动恢复阶段
     */
    async autoRestorePhase() {
        if (this.startupResults.configRestored) {
            console.log('✅ 配置已恢复，跳过自动恢复阶段');
            return;
        }
        
        if (!this.startupResults.needsRestore) {
            console.log('ℹ️ 无需自动恢复，跳过此阶段');
            return;
        }
        
        console.log('🔄 开始自动恢复阶段...');
        
        // 启动自动恢复系统（静默模式）
        if (window.autoRestoreSystem && !window.autoRestoreSystem.isActive) {
            try {
                // 设置静默模式
                const originalShowProgress = window.autoRestoreSystem.showRestoreProgress;
                window.autoRestoreSystem.showRestoreProgress = () => {
                    console.log('自动恢复系统已启动（静默模式）');
                };
                
                // 启动自动恢复
                await window.autoRestoreSystem.startAutoRestore();
                
                // 恢复原始方法
                window.autoRestoreSystem.showRestoreProgress = originalShowProgress;
                
                this.startupResults.dataRestored = true;
                this.startupResults.method = 'auto_restore_system';
                
            } catch (error) {
                console.error('自动恢复阶段失败:', error);
            }
        }
    }
    
    /**
     * 同步激活阶段
     */
    async syncActivationPhase() {
        console.log('🔄 检查同步激活状态...');
        
        // 等待同步服务就绪
        await this.waitForSyncService();
        
        // 检查同步状态
        if (window.syncService) {
            const status = window.syncService.getSyncStatus();
            if (status && status.enabled) {
                this.startupResults.syncEnabled = true;
                console.log('✅ 同步已激活');
            } else {
                console.log('⚠️ 同步未激活');
                
                // 尝试激活同步
                await this.tryActivateSync();
            }
        }
    }
    
    /**
     * 尝试激活同步
     */
    async tryActivateSync() {
        try {
            // 尝试从现有配置激活
            const config = window.syncService.getSyncConfig();
            if (config && config.enabled && config.settings) {
                await window.syncService.enableSync(config.provider, config.settings);
                this.startupResults.syncEnabled = true;
                console.log('✅ 从现有配置激活同步成功');
            }
        } catch (error) {
            console.error('激活同步失败:', error);
        }
    }
    
    /**
     * 完成阶段
     */
    async completionPhase() {
        console.log('🎉 智能启动流程完成');
        
        // 生成启动报告
        this.generateStartupReport();
        
        // 设置后续监控
        this.setupPostStartupMonitoring();
        
        // 显示用户反馈（如果需要）
        this.showUserFeedback();
    }
    
    /**
     * 生成启动报告
     */
    generateStartupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            phases: this.startupPhases,
            currentPhase: this.currentPhase,
            systemStatus: this.systemStatus,
            results: this.startupResults,
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 启动报告:', report);
        
        // 保存报告
        try {
            localStorage.setItem('startup_report', JSON.stringify(report));
        } catch (error) {
            console.warn('保存启动报告失败:', error);
        }
        
        return report;
    }
    
    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.startupResults.syncEnabled) {
            recommendations.push({
                type: 'sync_setup',
                message: '建议设置数据同步以保护您的数据',
                action: 'open_sync_settings'
            });
        }
        
        if (this.startupResults.dataRestored) {
            recommendations.push({
                type: 'data_backup',
                message: '数据已恢复，建议立即进行备份',
                action: 'manual_sync'
            });
        }
        
        if (!this.systemStatus.syncPersistence) {
            recommendations.push({
                type: 'system_issue',
                message: '持久化系统未正常加载，可能影响数据安全',
                action: 'check_system'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 显示用户反馈
     */
    showUserFeedback() {
        // 只在特殊情况下显示反馈
        if (this.startupResults.dataRestored && !this.startupResults.syncEnabled) {
            this.showDataRestoredNotification();
        }
        
        // 如果是新用户且有数据，建议设置同步
        if (this.startupResults.isNewUser && this.startupResults.needsRestore) {
            this.showSyncRecommendation();
        }
    }
    
    /**
     * 显示数据恢复通知
     */
    showDataRestoredNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div style="color: #4caf50; font-weight: bold; margin-bottom: 8px;">
                ✅ 数据已自动恢复
            </div>
            <div style="color: #666; margin-bottom: 12px;">
                我们已经恢复了您之前的数据，建议设置自动同步以保护数据安全。
            </div>
            <div>
                <button onclick="window.open('sync-settings.html', '_blank'); this.parentElement.parentElement.remove();" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                ">设置同步</button>
                <button onclick="this.parentElement.parentElement.remove();" style="
                    background: transparent;
                    color: #4caf50;
                    border: 1px solid #4caf50;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">稍后提醒</button>
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
     * 设置启动后监控
     */
    setupPostStartupMonitoring() {
        // 定期检查系统健康状态
        setInterval(() => {
            this.checkSystemHealth();
        }, 60000); // 每分钟检查一次
        
        // 监听同步状态变化
        if (window.syncService) {
            window.addEventListener('sync-complete', () => {
                console.log('✅ 同步完成，系统状态良好');
            });
            
            window.addEventListener('sync-error', (event) => {
                console.warn('⚠️ 同步错误:', event.detail);
                this.handleSyncError(event.detail);
            });
        }
    }
    
    /**
     * 检查系统健康状态
     */
    checkSystemHealth() {
        try {
            const health = {
                timestamp: Date.now(),
                syncService: !!window.syncService,
                syncEnabled: window.syncService ? window.syncService.syncEnabled : false,
                dataIntegrity: this.checkDataIntegrity(),
                storageHealth: this.checkStorageHealth()
            };
            
            console.log('💓 系统健康检查:', health);
            
            // 如果发现问题，尝试自动修复
            if (!health.syncEnabled && health.dataIntegrity.hasData) {
                this.attemptAutoRepair();
            }
            
        } catch (error) {
            console.error('系统健康检查失败:', error);
        }
    }
    
    /**
     * 检查数据完整性
     */
    checkDataIntegrity() {
        try {
            let dataCount = 0;
            let corruptedKeys = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                if (key.startsWith('planData_') || key.includes('tracker') || key.includes('history')) {
                    dataCount++;
                    
                    try {
                        if (value.startsWith('{') || value.startsWith('[')) {
                            JSON.parse(value);
                        }
                    } catch (error) {
                        corruptedKeys.push(key);
                    }
                }
            }
            
            return {
                hasData: dataCount > 0,
                dataCount: dataCount,
                corruptedKeys: corruptedKeys,
                isHealthy: corruptedKeys.length === 0
            };
            
        } catch (error) {
            console.error('数据完整性检查失败:', error);
            return { hasData: false, isHealthy: false };
        }
    }
    
    /**
     * 检查存储健康状态
     */
    checkStorageHealth() {
        try {
            // 测试localStorage
            const testKey = 'health_check_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            return {
                localStorage: true,
                quota: this.getStorageQuota()
            };
            
        } catch (error) {
            return {
                localStorage: false,
                error: error.message
            };
        }
    }
    
    /**
     * 获取存储配额
     */
    getStorageQuota() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                return navigator.storage.estimate();
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 尝试自动修复
     */
    async attemptAutoRepair() {
        console.log('🔧 尝试自动修复系统...');
        
        try {
            // 重新启动自动恢复
            if (window.autoRestoreSystem && !window.autoRestoreSystem.isActive) {
                await window.autoRestoreSystem.startAutoRestore();
            }
            
            console.log('✅ 自动修复完成');
            
        } catch (error) {
            console.error('自动修复失败:', error);
        }
    }
    
    /**
     * 处理同步错误
     */
    handleSyncError(error) {
        console.warn('处理同步错误:', error);
        
        // 根据错误类型决定处理方式
        if (error.message && error.message.includes('token')) {
            // Token相关错误，可能需要重新认证
            console.log('检测到Token错误，可能需要重新设置');
        } else if (error.message && error.message.includes('network')) {
            // 网络错误，稍后重试
            console.log('网络错误，将稍后重试');
        }
    }
    
    /**
     * 静默检测
     */
    async triggerSilentDetection() {
        // 这里实现静默的配置检测逻辑
        // 返回检测到的配置或null
        return null;
    }
    
    /**
     * 等待同步服务
     */
    async waitForSyncService() {
        const maxWait = 5000;
        let elapsed = 0;
        
        while (elapsed < maxWait) {
            if (window.syncService) {
                return;
            }
            await this.delay(100);
            elapsed += 100;
        }
    }
    
    /**
     * 设置状态监控
     */
    setupStatusMonitoring() {
        // 监控系统状态变化
        setInterval(() => {
            const newStatus = {
                syncPersistence: !!window.syncPersistence,
                smartAutoSync: !!window.smartAutoSync,
                zeroConfigSync: !!window.zeroConfigSyncEnhanced,
                autoRestoreSystem: !!window.autoRestoreSystem,
                emergencyRecovery: !!window.emergencyRecovery
            };
            
            // 检查状态变化
            const changed = Object.keys(newStatus).some(
                key => newStatus[key] !== this.systemStatus[key]
            );
            
            if (changed) {
                console.log('系统状态变化:', newStatus);
                this.systemStatus = newStatus;
            }
        }, 1000);
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 创建全局实例并自动启动
window.intelligentStartup = new IntelligentStartup();
