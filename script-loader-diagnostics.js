/**
 * 脚本加载诊断器
 * 帮助诊断和解决脚本加载问题
 */

class ScriptLoaderDiagnostics {
    constructor() {
        this.loadedScripts = new Map();
        this.loadingErrors = [];
        this.expectedComponents = [
            'syncPersistence',
            'smartAutoSync', 
            'zeroConfigSyncEnhanced',
            'autoRestoreSystem',
            'emergencyRecovery',
            'intelligentStartup'
        ];
        
        this.init();
    }
    
    init() {
        console.log('🔍 脚本加载诊断器启动...');
        
        // 监听脚本加载事件
        this.monitorScriptLoading();
        
        // 定期检查组件状态
        this.startPeriodicCheck();
        
        console.log('✅ 脚本加载诊断器准备就绪');
    }
    
    /**
     * 监听脚本加载
     */
    monitorScriptLoading() {
        // 监听所有script标签的加载状态
        const scripts = document.querySelectorAll('script[src]');
        
        scripts.forEach(script => {
            const src = script.src;
            
            script.addEventListener('load', () => {
                this.loadedScripts.set(src, {
                    status: 'loaded',
                    timestamp: Date.now(),
                    element: script
                });
                console.log(`✅ 脚本加载成功: ${this.getScriptName(src)}`);
            });
            
            script.addEventListener('error', (error) => {
                this.loadingErrors.push({
                    src: src,
                    error: error,
                    timestamp: Date.now()
                });
                console.error(`❌ 脚本加载失败: ${this.getScriptName(src)}`, error);
            });
        });
        
        // 监听动态添加的脚本
        this.observeNewScripts();
    }
    
    /**
     * 监听动态添加的脚本
     */
    observeNewScripts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        console.log(`🔄 检测到新脚本: ${this.getScriptName(node.src)}`);
                        this.monitorSingleScript(node);
                    }
                });
            });
        });
        
        observer.observe(document.head, { childList: true });
        observer.observe(document.body, { childList: true });
    }
    
    /**
     * 监听单个脚本
     */
    monitorSingleScript(script) {
        const src = script.src;
        
        script.addEventListener('load', () => {
            this.loadedScripts.set(src, {
                status: 'loaded',
                timestamp: Date.now(),
                element: script
            });
            console.log(`✅ 动态脚本加载成功: ${this.getScriptName(src)}`);
            
            // 检查是否创建了预期的组件
            setTimeout(() => {
                this.checkComponentCreation(src);
            }, 100);
        });
        
        script.addEventListener('error', (error) => {
            this.loadingErrors.push({
                src: src,
                error: error,
                timestamp: Date.now(),
                dynamic: true
            });
            console.error(`❌ 动态脚本加载失败: ${this.getScriptName(src)}`, error);
        });
    }
    
    /**
     * 检查组件创建
     */
    checkComponentCreation(scriptSrc) {
        const scriptName = this.getScriptName(scriptSrc);
        
        // 根据脚本名推断应该创建的组件
        const expectedComponent = this.mapScriptToComponent(scriptName);
        
        if (expectedComponent) {
            const component = window[expectedComponent];
            if (component) {
                console.log(`✅ 组件创建成功: ${expectedComponent} (来自 ${scriptName})`);
            } else {
                console.warn(`⚠️ 脚本已加载但组件未创建: ${expectedComponent} (来自 ${scriptName})`);
                
                // 尝试手动创建组件
                this.attemptManualComponentCreation(expectedComponent, scriptName);
            }
        }
    }
    
    /**
     * 脚本名到组件的映射
     */
    mapScriptToComponent(scriptName) {
        const mapping = {
            'sync-persistence': 'syncPersistence',
            'smart-auto-sync': 'smartAutoSync',
            'zero-config-sync-enhanced': 'zeroConfigSyncEnhanced',
            'auto-restore-system': 'autoRestoreSystem',
            'emergency-recovery': 'emergencyRecovery',
            'intelligent-startup': 'intelligentStartup'
        };
        
        return mapping[scriptName];
    }
    
    /**
     * 尝试手动创建组件
     */
    attemptManualComponentCreation(componentName, scriptName) {
        console.log(`🔧 尝试手动创建组件: ${componentName}`);
        
        try {
            // 根据组件类型尝试创建
            switch (componentName) {
                case 'emergencyRecovery':
                    if (typeof EmergencyRecovery === 'function') {
                        window.emergencyRecovery = new EmergencyRecovery();
                        console.log('✅ 手动创建 emergencyRecovery 成功');
                    }
                    break;
                    
                case 'syncPersistence':
                    if (typeof SyncPersistence === 'function') {
                        window.syncPersistence = new SyncPersistence();
                        console.log('✅ 手动创建 syncPersistence 成功');
                    }
                    break;
                    
                // 可以添加更多组件的手动创建逻辑
            }
        } catch (error) {
            console.error(`❌ 手动创建组件失败: ${componentName}`, error);
        }
    }
    
    /**
     * 获取脚本名称
     */
    getScriptName(src) {
        if (!src) return 'unknown';
        
        const url = new URL(src, window.location.href);
        const pathname = url.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        
        return filename.replace('.js', '');
    }
    
    /**
     * 开始定期检查
     */
    startPeriodicCheck() {
        // 每5秒检查一次组件状态
        setInterval(() => {
            this.performHealthCheck();
        }, 5000);
        
        // 30秒后进行一次完整诊断
        setTimeout(() => {
            this.performFullDiagnostics();
        }, 30000);
    }
    
    /**
     * 执行健康检查
     */
    performHealthCheck() {
        const missingComponents = this.expectedComponents.filter(
            name => !window[name]
        );
        
        if (missingComponents.length > 0) {
            console.warn(`⚠️ 缺失组件: ${missingComponents.join(', ')}`);
            
            // 尝试恢复缺失的组件
            this.attemptComponentRecovery(missingComponents);
        }
    }
    
    /**
     * 尝试恢复组件
     */
    attemptComponentRecovery(missingComponents) {
        missingComponents.forEach(componentName => {
            console.log(`🔄 尝试恢复组件: ${componentName}`);
            
            // 检查对应的类是否存在
            const className = this.getComponentClassName(componentName);
            if (className && window[className]) {
                try {
                    window[componentName] = new window[className]();
                    console.log(`✅ 恢复组件成功: ${componentName}`);
                } catch (error) {
                    console.error(`❌ 恢复组件失败: ${componentName}`, error);
                }
            }
        });
    }
    
    /**
     * 获取组件类名
     */
    getComponentClassName(componentName) {
        const mapping = {
            'syncPersistence': 'SyncPersistence',
            'smartAutoSync': 'SmartAutoSync',
            'zeroConfigSyncEnhanced': 'ZeroConfigSyncEnhanced',
            'autoRestoreSystem': 'AutoRestoreSystem',
            'emergencyRecovery': 'EmergencyRecovery',
            'intelligentStartup': 'IntelligentStartup'
        };
        
        return mapping[componentName];
    }
    
    /**
     * 执行完整诊断
     */
    performFullDiagnostics() {
        console.log('🔍 执行完整系统诊断...');
        
        const diagnosis = {
            timestamp: new Date().toISOString(),
            scriptsLoaded: Array.from(this.loadedScripts.keys()).map(src => this.getScriptName(src)),
            scriptsWithErrors: this.loadingErrors.map(error => this.getScriptName(error.src)),
            componentsPresent: this.expectedComponents.filter(name => !!window[name]),
            componentsMissing: this.expectedComponents.filter(name => !window[name]),
            recommendations: []
        };
        
        // 生成建议
        if (diagnosis.componentsMissing.length > 0) {
            diagnosis.recommendations.push('重新加载页面可能解决组件缺失问题');
        }
        
        if (diagnosis.scriptsWithErrors.length > 0) {
            diagnosis.recommendations.push('检查网络连接和脚本文件是否存在');
        }
        
        if (diagnosis.componentsMissing.length === 0 && diagnosis.scriptsWithErrors.length === 0) {
            diagnosis.recommendations.push('所有组件正常加载，系统运行良好');
        }
        
        console.log('📊 系统诊断报告:', diagnosis);
        
        // 保存诊断报告
        try {
            localStorage.setItem('script_diagnostics', JSON.stringify(diagnosis));
        } catch (error) {
            console.warn('保存诊断报告失败:', error);
        }
        
        return diagnosis;
    }
    
    /**
     * 获取诊断报告
     */
    getDiagnostics() {
        return this.performFullDiagnostics();
    }
    
    /**
     * 强制重新加载所有脚本
     */
    forceReloadScripts() {
        console.log('🔄 强制重新加载所有脚本...');
        
        const scripts = [
            'sync-persistence.js',
            'smart-auto-sync.js',
            'zero-config-sync-enhanced.js',
            'auto-restore-system.js',
            'emergency-recovery.js',
            'intelligent-startup.js'
        ];
        
        scripts.forEach(scriptName => {
            this.reloadScript(scriptName);
        });
    }
    
    /**
     * 重新加载单个脚本
     */
    reloadScript(scriptName) {
        try {
            // 移除现有脚本
            const existingScript = document.querySelector(`script[src*="${scriptName}"]`);
            if (existingScript) {
                existingScript.remove();
            }
            
            // 创建新脚本
            const script = document.createElement('script');
            script.src = scriptName + '?t=' + Date.now(); // 添加时间戳防止缓存
            script.async = true;
            
            this.monitorSingleScript(script);
            
            document.head.appendChild(script);
            console.log(`🔄 重新加载脚本: ${scriptName}`);
            
        } catch (error) {
            console.error(`❌ 重新加载脚本失败: ${scriptName}`, error);
        }
    }
}

// 创建全局实例
window.scriptDiagnostics = new ScriptLoaderDiagnostics();
