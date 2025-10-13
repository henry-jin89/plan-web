/**
 * LeanCloud 实时同步系统
 * 替代 Firebase，国内速度快，实时同步
 */

(function() {
    'use strict';
    
    console.log('🚀 加载 LeanCloud 同步系统...');
    
    const SHARED_USER_ID = 'shared-plan-web-user'; // 固定的共享用户ID
    
    class LeanCloudSync {
        constructor() {
            this.isInitialized = false;
            this.isEnabled = false;
            this.sharedUserId = SHARED_USER_ID;
            this.lastSync = null;
            this.syncInProgress = false;
            this.PlanData = null; // LeanCloud 数据类
            
            this.init();
        }
        
        async init() {
            try {
                console.log('🚀 初始化 LeanCloud...');
                
                // 检查网络
                if (!navigator.onLine) {
                    throw new Error('设备处于离线状态');
                }
                
                // 加载 LeanCloud SDK
                await this.loadLeanCloudSDK();
                
                // 初始化 LeanCloud
                const config = window.leancloudConfig;
                if (!config) {
                    throw new Error('LeanCloud 配置未加载');
                }
                
                AV.init({
                    appId: config.appId,
                    appKey: config.appKey,
                    serverURL: config.serverURL
                });
                
                console.log('✅ LeanCloud 初始化成功');
                console.log('📌 共享用户ID:', this.sharedUserId);
                
                // 定义数据类
                this.PlanData = AV.Object.extend('PlanData');
                
                this.isInitialized = true;
                this.isEnabled = true;
                
                // 设置自动同步
                this.setupAutoSync();
                
                // 恢复云端数据
                await this.restoreFromCloud();
                
                console.log('✅ LeanCloud 同步系统启动完成');
                
            } catch (error) {
                console.error('❌ LeanCloud 初始化失败:', error);
                this.isEnabled = false;
            }
        }
        
        /**
         * 加载 LeanCloud SDK
         */
        async loadLeanCloudSDK() {
            if (window.AV) {
                console.log('✅ LeanCloud SDK 已加载');
                return;
            }
            
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/leancloud-storage@4.15.0/dist/av-min.js';
                script.onload = () => {
                    console.log('✅ LeanCloud SDK 加载成功');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('LeanCloud SDK 加载失败'));
                };
                document.head.appendChild(script);
            });
        }
        
        /**
         * 设置自动同步
         */
        setupAutoSync() {
            console.log('⚙️ 设置自动同步监听器...');
            
            // 监听 localStorage 变化
            if (!window.leancloudStorageListenerBound) {
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = (key, value) => {
                    originalSetItem.call(localStorage, key, value);
                    
                    // 只同步计划相关数据
                    if (key.startsWith('planData_') || key.startsWith('habitData_') || 
                        key.startsWith('moodData_') || key.startsWith('gratitudeData_')) {
                        console.log(`📝 检测到数据变化: ${key}`);
                        this.syncToCloud();
                    }
                };
                window.leancloudStorageListenerBound = true;
            }
            
            // 定期同步（每5分钟）
            setInterval(() => {
                if (this.isEnabled && !this.syncInProgress) {
                    this.syncToCloud();
                }
            }, 5 * 60 * 1000);
            
            // 页面关闭前同步
            window.addEventListener('beforeunload', () => {
                if (this.isEnabled) {
                    this.syncToCloud();
                }
            });
        }
        
        /**
         * 收集所有计划数据
         */
        collectAllPlanData() {
            const allData = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith('planData_') || key.startsWith('habitData_') || 
                    key.startsWith('moodData_') || key.startsWith('gratitudeData_')) {
                    try {
                        const value = localStorage.getItem(key);
                        allData[key] = JSON.parse(value);
                    } catch (e) {
                        allData[key] = localStorage.getItem(key);
                    }
                }
            }
            
            return allData;
        }
        
        /**
         * 同步到云端
         */
        async syncToCloud() {
            if (!this.isEnabled || this.syncInProgress) return;
            
            try {
                this.syncInProgress = true;
                console.log('💾 开始同步到 LeanCloud...');
                
                const planData = this.collectAllPlanData();
                const dataCount = Object.keys(planData).length;
                
                if (dataCount === 0) {
                    console.log('ℹ️ 没有数据需要同步');
                    return;
                }
                
                // 查询是否已存在数据
                const query = new AV.Query('PlanData');
                query.equalTo('userId', this.sharedUserId);
                
                let planObject = await query.first();
                
                if (!planObject) {
                    // 创建新对象
                    planObject = new this.PlanData();
                    planObject.set('userId', this.sharedUserId);
                }
                
                // 更新数据
                planObject.set('data', planData);
                planObject.set('lastModified', new Date().toISOString());
                planObject.set('deviceInfo', navigator.userAgent.substring(0, 50));
                planObject.set('itemCount', dataCount);
                
                await planObject.save();
                
                this.lastSync = new Date();
                console.log(`✅ 同步成功！共 ${dataCount} 项数据`);
                
            } catch (error) {
                console.error('❌ 同步失败:', error);
            } finally {
                this.syncInProgress = false;
            }
        }
        
        /**
         * 从云端恢复数据
         */
        async restoreFromCloud() {
            try {
                console.log('📥 从 LeanCloud 恢复数据...');
                
                const query = new AV.Query('PlanData');
                query.equalTo('userId', this.sharedUserId);
                
                const planObject = await query.first();
                
                if (planObject) {
                    const cloudData = planObject.get('data');
                    const itemCount = planObject.get('itemCount') || 0;
                    
                    if (cloudData && typeof cloudData === 'object') {
                        let restoredCount = 0;
                        
                        Object.keys(cloudData).forEach(key => {
                            const value = cloudData[key];
                            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                            localStorage.setItem(key, jsonValue);
                            restoredCount++;
                        });
                        
                        console.log(`✅ 恢复成功！共 ${restoredCount} 项数据`);
                        this.lastSync = new Date();
                        
                        // 触发页面刷新（如果需要）
                        window.dispatchEvent(new Event('storage'));
                    } else {
                        console.log('ℹ️ 云端暂无数据');
                    }
                } else {
                    console.log('ℹ️ 云端暂无数据');
                }
                
            } catch (error) {
                console.error('❌ 恢复数据失败:', error);
            }
        }
        
        /**
         * 强制同步
         */
        async forceSync() {
            console.log('🔄 执行强制同步...');
            await this.syncToCloud();
            await this.restoreFromCloud();
            console.log('✅ 强制同步完成');
        }
        
        /**
         * 强制恢复
         */
        async forceRestore() {
            console.log('📥 执行强制恢复...');
            await this.restoreFromCloud();
            console.log('✅ 强制恢复完成');
        }
        
        /**
         * 清除云端数据
         */
        async clearCloudData() {
            try {
                console.log('🗑️ 清除云端数据...');
                
                const query = new AV.Query('PlanData');
                query.equalTo('userId', this.sharedUserId);
                
                const planObject = await query.first();
                
                if (planObject) {
                    await planObject.destroy();
                    console.log('✅ 云端数据已清除');
                } else {
                    console.log('ℹ️ 云端没有数据');
                }
                
            } catch (error) {
                console.error('❌ 清除失败:', error);
            }
        }
        
        /**
         * 获取状态
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                isEnabled: this.isEnabled,
                sharedUserId: this.sharedUserId,
                lastSync: this.lastSync,
                syncInProgress: this.syncInProgress
            };
        }
    }
    
    // 创建全局实例
    window.leancloudSync = new LeanCloudSync();
    
    console.log('✅ LeanCloud 同步系统已加载');
    
})();

