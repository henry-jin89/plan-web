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
                
                // 触发初始化完成事件
                window.dispatchEvent(new CustomEvent('leancloud-initialized', {
                    detail: { timestamp: new Date() }
                }));
                
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
            
            // 定期上传本地数据到云端（每5分钟）
            setInterval(() => {
                if (this.isEnabled && !this.syncInProgress) {
                    console.log('⏰ 定期上传本地数据到云端...');
                    this.syncToCloud();
                }
            }, 5 * 60 * 1000);
            
            // 定期从云端拉取最新数据（每2分钟）- 解决跨设备同步问题
            setInterval(() => {
                if (this.isEnabled && !this.syncInProgress) {
                    console.log('🔄 检查云端是否有更新...');
                    this.checkAndPullUpdates();
                }
            }, 2 * 60 * 1000); // 2分钟检查一次
            
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
                
                let planObject = null;
                
                try {
                    // 尝试查询是否已存在数据
                    const query = new AV.Query('PlanData');
                    query.equalTo('userId', this.sharedUserId);
                    planObject = await query.first();
                } catch (queryError) {
                    // 如果是 404 或表不存在错误，这是首次使用，继续创建新对象
                    if (queryError.code === 101 || queryError.message.includes('404') || queryError.message.includes("doesn't exist")) {
                        console.log('ℹ️ 首次同步，正在创建数据表...');
                        planObject = null;
                    } else {
                        throw queryError;
                    }
                }
                
                if (!planObject) {
                    // 创建新对象
                    planObject = new this.PlanData();
                    planObject.set('userId', this.sharedUserId);
                    console.log('📝 创建新的数据记录...');
                }
                
                // 更新数据
                const now = new Date().toISOString();
                planObject.set('data', planData);
                planObject.set('lastModified', now);
                planObject.set('deviceInfo', navigator.userAgent.substring(0, 50));
                planObject.set('itemCount', dataCount);
                
                await planObject.save();
                
                // 保存同步时间到本地（用于检测云端更新）
                localStorage.setItem('leancloud_last_sync', now);
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
        async restoreFromCloud(forceRestore = false) {
            if (this.syncInProgress && !forceRestore) {
                console.log('⏸️ 同步进行中，跳过恢复');
                return;
            }
            
            const restoreInProgress = this.syncInProgress;
            this.syncInProgress = true; // 设置锁，防止恢复时触发同步
            
            try {
                console.log('📥 从 LeanCloud 恢复数据...');
                
                // 检查本地数据状态
                const localData = this.collectAllPlanData();
                const localDataCount = Object.keys(localData).length;
                const isLocalEmpty = localDataCount === 0;
                
                console.log(`📊 本地数据状态: ${localDataCount} 条记录`);
                
                // 如果本地不为空且不是强制恢复，检查是否需要恢复
                if (!isLocalEmpty && !forceRestore) {
                    const localLastSync = localStorage.getItem('leancloud_last_sync');
                    console.log(`💾 本地最后同步时间: ${localLastSync || '未知'}`);
                    
                    // 先查询云端数据的更新时间
                    const query = new AV.Query('PlanData');
                    query.equalTo('userId', this.sharedUserId);
                    
                    try {
                        const planObject = await query.first();
                        
                        if (planObject) {
                            const cloudLastModified = planObject.get('lastModified');
                            console.log(`☁️ 云端最后更新时间: ${cloudLastModified || '未知'}`);
                            
                            // 如果本地有同步时间，且不早于云端更新时间，则跳过恢复
                            if (localLastSync && cloudLastModified) {
                                const localTime = new Date(localLastSync).getTime();
                                const cloudTime = new Date(cloudLastModified).getTime();
                                
                                if (localTime >= cloudTime) {
                                    console.log('✅ 本地数据已是最新，跳过自动恢复');
                                    return;
                                } else {
                                    console.log(`🆕 云端有更新（相差 ${Math.round((cloudTime - localTime) / 1000)} 秒），开始恢复...`);
                                }
                            }
                        }
                    } catch (queryError) {
                        // 如果查询失败（如首次使用），继续正常流程
                        console.log('ℹ️ 无法查询云端数据，继续正常流程');
                    }
                }
                
                if (isLocalEmpty) {
                    console.log('🆕 检测到本地数据为空，将尝试从云端恢复');
                }
                
                if (forceRestore) {
                    console.log('🔄 强制恢复模式');
                }
                
                const query = new AV.Query('PlanData');
                query.equalTo('userId', this.sharedUserId);
                
                const planObject = await query.first();
                
                if (planObject) {
                    const cloudData = planObject.get('data');
                    const itemCount = planObject.get('itemCount') || 0;
                    const lastModified = planObject.get('lastModified');
                    
                    console.log(`☁️ 发现云端数据: ${itemCount} 条记录`);
                    console.log(`📅 云端最后更新: ${lastModified || '未知'}`);
                    
                    if (cloudData && typeof cloudData === 'object') {
                        let restoredCount = 0;
                        
                        Object.keys(cloudData).forEach(key => {
                            const value = cloudData[key];
                            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                            localStorage.setItem(key, jsonValue);
                            restoredCount++;
                        });
                        
                        // 更新本地同步时间戳（关键：避免重复恢复）
                        if (lastModified) {
                            localStorage.setItem('leancloud_last_sync', lastModified);
                            console.log(`⏰ 已更新本地同步时间: ${lastModified}`);
                        }
                        
                        console.log(`✅ 恢复成功！共 ${restoredCount} 项数据`);
                        this.lastSync = new Date(lastModified || Date.now());
                        
                        // 如果本地为空且成功恢复了数据，触发通知
                        if (isLocalEmpty && restoredCount > 0) {
                            console.log('🎉 已从云端恢复数据到本地！');
                            
                            // 触发数据恢复事件
                            window.dispatchEvent(new CustomEvent('data-restored', {
                                detail: { count: restoredCount, source: 'leancloud' }
                            }));
                            
                            // 触发页面刷新事件
                            window.dispatchEvent(new Event('storage'));
                            
                            // 3秒后询问是否刷新页面
                            setTimeout(() => {
                                if (confirm(`✅ 已从 LeanCloud 恢复 ${restoredCount} 条数据！\n\n是否刷新页面查看？`)) {
                                    window.location.reload();
                                }
                            }, 1000);
                        } else {
                            // 触发页面刷新事件
                            window.dispatchEvent(new Event('storage'));
                        }
                    } else {
                        console.log('ℹ️ 云端暂无数据');
                    }
                } else {
                    console.log('ℹ️ 云端暂无数据（首次使用）');
                    
                    if (isLocalEmpty) {
                        console.log('⚠️ 本地和云端都没有数据');
                    } else {
                        console.log('📤 将本地数据上传到云端...');
                        // 首次使用，将本地数据同步到云端
                        await this.syncToCloud();
                    }
                }
                
            } catch (error) {
                // 如果是 404 错误（表不存在），这是正常的首次使用情况
                if (error.code === 101 || error.code === 404 || 
                    error.message?.includes('404') || 
                    error.message?.includes("doesn't exist") ||
                    error.message?.includes("Class or object")) {
                    console.log('ℹ️ 云端暂无数据（首次使用），这是正常的');
                    console.log('💡 开始创建计划后，数据会自动同步到云端');
                    return; // 正常退出，不抛出错误
                }
                // 其他错误才记录
                console.error('❌ 恢复数据失败:', error);
            } finally {
                // 恢复同步锁状态
                if (!restoreInProgress) {
                    this.syncInProgress = false;
                }
            }
        }
        
        /**
         * 检查云端更新并拉取（用于跨设备同步）
         */
        async checkAndPullUpdates() {
            if (!this.isEnabled) return;
            
            try {
                console.log('🔍 检查云端是否有新数据...');
                
                const query = new AV.Query('PlanData');
                query.equalTo('userId', this.sharedUserId);
                
                const planObject = await query.first();
                
                if (planObject) {
                    const cloudLastModified = planObject.get('lastModified');
                    const localLastSync = localStorage.getItem('leancloud_last_sync');
                    
                    console.log('☁️ 云端最后更新:', cloudLastModified);
                    console.log('💾 本地最后同步:', localLastSync);
                    
                    // 如果云端数据更新时间晚于本地最后同步时间
                    if (cloudLastModified && (!localLastSync || new Date(cloudLastModified) > new Date(localLastSync))) {
                        console.log('🆕 发现云端有新数据！');
                        
                        const cloudData = planObject.get('data');
                        const itemCount = planObject.get('itemCount') || 0;
                        
                        if (cloudData && typeof cloudData === 'object') {
                            let updatedCount = 0;
                            
                            // 更新本地数据
                            Object.keys(cloudData).forEach(key => {
                                const value = cloudData[key];
                                const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                                localStorage.setItem(key, jsonValue);
                                updatedCount++;
                            });
                            
                            // 更新最后同步时间
                            localStorage.setItem('leancloud_last_sync', cloudLastModified);
                            this.lastSync = new Date(cloudLastModified);
                            
                            console.log(`✅ 已拉取云端更新：${updatedCount} 条数据`);
                            
                            // 触发页面刷新事件，让UI更新
                            window.dispatchEvent(new Event('storage'));
                            
                            // 显示通知（不阻塞）
                            this.showUpdateNotification(updatedCount);
                        }
                    } else {
                        console.log('✅ 本地数据已是最新');
                    }
                } else {
                    console.log('ℹ️ 云端暂无数据');
                }
                
            } catch (error) {
                console.error('❌ 检查更新失败:', error);
            }
        }
        
        /**
         * 显示更新通知
         */
        showUpdateNotification(count) {
            // 创建一个不阻塞的通知
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                font-size: 14px;
                animation: slideIn 0.3s ease-out;
                cursor: pointer;
            `;
            notification.innerHTML = `
                🔄 已同步其他设备的更新 (${count} 条数据)<br>
                <small style="opacity: 0.9;">点击刷新页面查看</small>
            `;
            
            // 添加动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            // 点击刷新页面
            notification.onclick = () => {
                window.location.reload();
            };
            
            document.body.appendChild(notification);
            
            // 5秒后自动消失
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
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
            await this.restoreFromCloud(true); // 传入 true 强制恢复
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
    
    // 创建全局实例（注意：使用大写C以匹配index.html中的引用）
    window.leanCloudSync = new LeanCloudSync();
    
    console.log('✅ LeanCloud 同步系统已加载');
    
})();

