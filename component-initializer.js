/**
 * 组件初始化管理器
 * 确保所有组件正确初始化
 */

class ComponentInitializer {
    constructor() {
        this.components = new Map();
        this.initAttempts = new Map();
        this.maxAttempts = 10;
        this.checkInterval = 500; // 500ms检查间隔
        
        this.expectedComponents = [
            {
                name: 'syncPersistence',
                className: 'SyncPersistence',
                scriptUrl: 'sync-persistence.js'
            },
            {
                name: 'smartAutoSync', 
                className: 'SmartAutoSync',
                scriptUrl: 'smart-auto-sync.js'
            },
            {
                name: 'zeroConfigSyncEnhanced',
                className: 'ZeroConfigSyncEnhanced', 
                scriptUrl: 'zero-config-sync-enhanced.js'
            },
            {
                name: 'autoRestoreSystem',
                className: 'AutoRestoreSystem',
                scriptUrl: 'auto-restore-system.js'
            },
            {
                name: 'emergencyRecovery',
                className: 'EmergencyRecovery',
                scriptUrl: 'emergency-recovery.js'
            },
            {
                name: 'intelligentStartup',
                className: 'IntelligentStartup',
                scriptUrl: 'intelligent-startup.js'
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🔧 组件初始化管理器启动...');
        
        // 开始监控组件初始化
        this.startMonitoring();
        
        // 延迟启动主初始化流程
        setTimeout(() => {
            this.initializeAllComponents();
        }, 1000);
        
        console.log('✅ 组件初始化管理器准备就绪');
    }
    
    /**
     * 开始监控组件状态
     */
    startMonitoring() {
        const checkComponents = () => {
            this.expectedComponents.forEach(component => {
                if (!window[component.name]) {
                    this.tryInitializeComponent(component);
                } else {
                    if (!this.components.has(component.name)) {
                        this.components.set(component.name, {
                            status: 'loaded',
                            timestamp: Date.now()
                        });
                        console.log(`✅ 组件确认加载: ${component.name}`);
                    }
                }
            });
        };
        
        // 立即检查一次
        checkComponents();
        
        // 定期检查
        const monitorInterval = setInterval(() => {
            checkComponents();
            
            // 如果所有组件都已加载，停止监控
            const allLoaded = this.expectedComponents.every(comp => window[comp.name]);
            if (allLoaded) {
                console.log('🎉 所有组件均已成功加载');
                clearInterval(monitorInterval);
            }
        }, this.checkInterval);
        
        // 30秒后停止监控
        setTimeout(() => {
            clearInterval(monitorInterval);
            this.reportFinalStatus();
        }, 30000);
    }
    
    /**
     * 尝试初始化单个组件
     */
    tryInitializeComponent(component) {
        const attempts = this.initAttempts.get(component.name) || 0;
        
        if (attempts >= this.maxAttempts) {
            return; // 已达到最大重试次数
        }
        
        try {
            // 检查类是否存在
            if (window[component.className]) {
                // 尝试创建实例
                if (!window[component.name]) {
                    window[component.name] = new window[component.className]();
                    console.log(`✅ 手动初始化组件成功: ${component.name}`);
                    
                    this.components.set(component.name, {
                        status: 'manually_initialized',
                        timestamp: Date.now(),
                        attempts: attempts + 1
                    });
                }
            } else {
                // 类不存在，可能脚本还未加载完成
                console.log(`⏳ 等待类加载: ${component.className} (尝试 ${attempts + 1}/${this.maxAttempts})`);
            }
        } catch (error) {
            console.error(`❌ 初始化组件失败: ${component.name}`, error);
        }
        
        this.initAttempts.set(component.name, attempts + 1);
    }
    
    /**
     * 初始化所有组件
     */
    initializeAllComponents() {
        console.log('🚀 开始批量初始化组件...');
        
        this.expectedComponents.forEach(component => {
            if (!window[component.name]) {
                this.tryInitializeComponent(component);
            }
        });
        
        // 特别关注 emergencyRecovery 组件
        this.forceInitializeEmergencyRecovery();
    }
    
    /**
     * 强制初始化紧急恢复组件
     */
    forceInitializeEmergencyRecovery() {
        const maxRetries = 20;
        let retryCount = 0;
        
        const forceInit = () => {
            if (window.emergencyRecovery) {
                console.log('✅ emergencyRecovery 已存在，无需强制初始化');
                return;
            }
            
            if (retryCount >= maxRetries) {
                console.error('❌ emergencyRecovery 强制初始化失败，已达到最大重试次数');
                return;
            }
            
            try {
                // 方法1：检查 EmergencyRecovery 类
                if (window.EmergencyRecovery) {
                    window.emergencyRecovery = new window.EmergencyRecovery();
                    console.log('✅ emergencyRecovery 强制初始化成功 (方法1)');
                    return;
                }
                
                // 方法2：尝试调用全局初始化函数
                if (window.initEmergencyRecovery && typeof window.initEmergencyRecovery === 'function') {
                    window.initEmergencyRecovery();
                    console.log('✅ emergencyRecovery 强制初始化成功 (方法2)');
                    return;
                }
                
                // 方法3：重新加载脚本
                if (retryCount === 5) {
                    console.log('🔄 尝试重新加载 emergency-recovery.js');
                    this.reloadScript('emergency-recovery.js');
                }
                
                retryCount++;
                console.log(`⏳ emergencyRecovery 强制初始化重试 ${retryCount}/${maxRetries}`);
                
                // 继续重试
                setTimeout(forceInit, 300);
                
            } catch (error) {
                console.error('❌ emergencyRecovery 强制初始化异常:', error);
                retryCount++;
                setTimeout(forceInit, 300);
            }
        };
        
        // 延迟开始强制初始化
        setTimeout(forceInit, 100);
    }
    
    /**
     * 重新加载脚本
     */
    reloadScript(scriptName) {
        try {
            // 移除现有脚本
            const existingScript = document.querySelector(`script[src*="${scriptName}"]`);
            if (existingScript) {
                existingScript.remove();
                console.log(`🗑️ 移除现有脚本: ${scriptName}`);
            }
            
            // 创建新脚本
            const script = document.createElement('script');
            script.src = scriptName + '?reload=' + Date.now();
            script.async = false; // 同步加载
            
            script.onload = () => {
                console.log(`✅ 脚本重新加载成功: ${scriptName}`);
                // 重新加载后尝试初始化
                setTimeout(() => {
                    this.forceInitializeEmergencyRecovery();
                }, 100);
            };
            
            script.onerror = (error) => {
                console.error(`❌ 脚本重新加载失败: ${scriptName}`, error);
            };
            
            document.head.appendChild(script);
            
        } catch (error) {
            console.error(`❌ 重新加载脚本异常: ${scriptName}`, error);
        }
    }
    
    /**
     * 报告最终状态
     */
    reportFinalStatus() {
        console.log('📊 组件初始化最终状态报告:');
        
        this.expectedComponents.forEach(component => {
            const exists = !!window[component.name];
            const status = this.components.get(component.name);
            
            console.log(`${exists ? '✅' : '❌'} ${component.name}: ${exists ? '已加载' : '未加载'}${status ? ` (${status.status})` : ''}`);
        });
        
        const successCount = this.expectedComponents.filter(comp => window[comp.name]).length;
        const totalCount = this.expectedComponents.length;
        
        console.log(`📈 成功率: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    }
    
    /**
     * 获取组件状态
     */
    getComponentStatus() {
        const status = {};
        
        this.expectedComponents.forEach(component => {
            status[component.name] = {
                loaded: !!window[component.name],
                attempts: this.initAttempts.get(component.name) || 0,
                info: this.components.get(component.name) || null
            };
        });
        
        return status;
    }
    
    /**
     * 手动修复组件
     */
    manualRepairComponent(componentName) {
        const component = this.expectedComponents.find(comp => comp.name === componentName);
        if (!component) {
            console.error(`❌ 未知组件: ${componentName}`);
            return false;
        }
        
        console.log(`🔧 手动修复组件: ${componentName}`);
        
        // 重置重试计数
        this.initAttempts.set(componentName, 0);
        
        // 尝试初始化
        this.tryInitializeComponent(component);
        
        // 如果是 emergencyRecovery，使用特殊处理
        if (componentName === 'emergencyRecovery') {
            this.forceInitializeEmergencyRecovery();
        }
        
        return true;
    }
}

// 立即创建全局实例
window.componentInitializer = new ComponentInitializer();
