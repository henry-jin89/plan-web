/**
 * 紧急数据恢复系统
 * 当所有其他方法都失败时的最后手段
 */

class EmergencyRecovery {
    constructor() {
        this.isActive = false;
        this.recoveryMethods = [];
        this.dataSnapshot = null;
        
        this.init();
    }
    
    init() {
        console.log('🆘 紧急数据恢复系统初始化...');
        
        // 注册恢复方法
        this.registerRecoveryMethods();
        
        // 定期创建数据快照
        this.startDataSnapshots();
        
        // 监听紧急恢复请求
        this.setupEmergencyTriggers();
        
        console.log('✅ 紧急数据恢复系统准备就绪');
    }
    
    /**
     * 注册恢复方法
     */
    registerRecoveryMethods() {
        this.recoveryMethods = [
            {
                name: 'localStorage备份扫描',
                method: () => this.scanLocalStorageBackups(),
                priority: 1
            },
            {
                name: 'IndexedDB深度恢复',
                method: () => this.deepIndexedDBRecovery(),
                priority: 2
            },
            {
                name: '历史数据重构',
                method: () => this.reconstructFromHistory(),
                priority: 3
            },
            {
                name: '浏览器缓存恢复',
                method: () => this.recoverFromBrowserCache(),
                priority: 4
            },
            {
                name: '网络资源恢复',
                method: () => this.recoverFromNetworkSources(),
                priority: 5
            }
        ];
    }
    
    /**
     * 开始数据快照
     */
    startDataSnapshots() {
        // 每10分钟创建一次数据快照
        setInterval(() => {
            this.createDataSnapshot();
        }, 10 * 60 * 1000);
        
        // 立即创建一次快照
        this.createDataSnapshot();
    }
    
    /**
     * 创建数据快照
     */
    createDataSnapshot() {
        try {
            const snapshot = {
                timestamp: Date.now(),
                data: this.gatherAllData(),
                metadata: {
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    version: '1.0.0'
                }
            };
            
            // 保存到多个位置
            this.saveSnapshot(snapshot);
            
            console.log('📸 数据快照已创建');
            
        } catch (error) {
            console.error('创建数据快照失败:', error);
        }
    }
    
    /**
     * 收集所有数据
     */
    gatherAllData() {
        const allData = {};
        
        // 收集所有localStorage数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                allData[key] = localStorage.getItem(key);
            } catch (error) {
                console.warn(`收集${key}失败:`, error);
            }
        }
        
        return allData;
    }
    
    /**
     * 保存快照
     */
    saveSnapshot(snapshot) {
        const snapshotStr = JSON.stringify(snapshot);
        
        // 保存到localStorage
        try {
            localStorage.setItem('emergency_snapshot', snapshotStr);
            localStorage.setItem('emergency_snapshot_backup', snapshotStr);
        } catch (error) {
            console.warn('保存快照到localStorage失败:', error);
        }
        
        // 保存到IndexedDB
        this.saveSnapshotToIndexedDB(snapshot);
        
        // 保存到内存
        this.dataSnapshot = snapshot;
    }
    
    /**
     * 保存快照到IndexedDB
     */
    async saveSnapshotToIndexedDB(snapshot) {
        try {
            const dbName = 'EmergencyRecoveryDB';
            const storeName = 'snapshots';
            
            const request = indexedDB.open(dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // 保存当前快照
                store.put({
                    id: 'current',
                    ...snapshot
                });
                
                // 保存带时间戳的快照
                store.put({
                    id: `snapshot_${snapshot.timestamp}`,
                    ...snapshot
                });
                
                console.log('快照已保存到IndexedDB');
            };
            
        } catch (error) {
            console.warn('保存快照到IndexedDB失败:', error);
        }
    }
    
    /**
     * 设置紧急触发器
     */
    setupEmergencyTriggers() {
        // 键盘快捷键：Ctrl+Shift+R
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.startEmergencyRecovery();
            }
        });
        
        // URL参数触发：?emergency_recovery=true
        if (window.location.search.includes('emergency_recovery=true')) {
            setTimeout(() => {
                this.startEmergencyRecovery();
            }, 1000);
        }
        
        // 全局错误处理
        window.addEventListener('error', (event) => {
            if (event.error && event.error.message.includes('storage')) {
                console.log('检测到存储错误，可能需要紧急恢复');
                this.showEmergencyRecoveryHint();
            }
        });
    }
    
    /**
     * 开始紧急恢复
     */
    async startEmergencyRecovery() {
        if (this.isActive) {
            console.log('紧急恢复已在进行中');
            return;
        }
        
        this.isActive = true;
        console.log('🆘 启动紧急数据恢复...');
        
        // 显示恢复界面
        this.showRecoveryInterface();
        
        // 运行所有恢复方法
        const results = await this.runAllRecoveryMethods();
        
        // 分析和展示结果
        this.analyzeRecoveryResults(results);
    }
    
    /**
     * 运行所有恢复方法
     */
    async runAllRecoveryMethods() {
        const results = [];
        
        // 按优先级排序
        this.recoveryMethods.sort((a, b) => a.priority - b.priority);
        
        for (const method of this.recoveryMethods) {
            try {
                console.log(`运行恢复方法: ${method.name}`);
                
                const startTime = Date.now();
                const result = await method.method();
                const duration = Date.now() - startTime;
                
                results.push({
                    name: method.name,
                    success: !!result,
                    data: result,
                    duration: duration,
                    error: null
                });
                
                if (result) {
                    console.log(`✅ ${method.name} 成功恢复数据`);
                } else {
                    console.log(`❌ ${method.name} 未找到数据`);
                }
                
            } catch (error) {
                console.error(`❌ ${method.name} 失败:`, error);
                results.push({
                    name: method.name,
                    success: false,
                    data: null,
                    duration: 0,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    /**
     * localStorage备份扫描
     */
    scanLocalStorageBackups() {
        const backupData = {};
        let foundData = false;
        
        // 扫描所有可能的备份键
        const backupKeys = [
            'emergency_snapshot',
            'emergency_snapshot_backup',
            'sync_config_backup1',
            'sync_config_backup2',
            'sync_config_backup3',
            'planData_backup',
            'habitTrackerData_backup'
        ];
        
        backupKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    backupData[key] = JSON.parse(data);
                    foundData = true;
                } catch (error) {
                    backupData[key] = data;
                    foundData = true;
                }
            }
        });
        
        // 扫描所有以backup结尾的键
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('backup')) {
                const data = localStorage.getItem(key);
                if (data && !backupData[key]) {
                    try {
                        backupData[key] = JSON.parse(data);
                        foundData = true;
                    } catch (error) {
                        backupData[key] = data;
                        foundData = true;
                    }
                }
            }
        }
        
        return foundData ? backupData : null;
    }
    
    /**
     * IndexedDB深度恢复
     */
    deepIndexedDBRecovery() {
        return new Promise((resolve) => {
            const dbNames = ['PlanManagerDB', 'EmergencyRecoveryDB', 'SyncDataDB'];
            const recoveredData = {};
            let completedDbs = 0;
            
            dbNames.forEach(dbName => {
                const request = indexedDB.open(dbName);
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const storeNames = Array.from(db.objectStoreNames);
                    
                    if (storeNames.length === 0) {
                        completedDbs++;
                        if (completedDbs === dbNames.length) {
                            resolve(Object.keys(recoveredData).length > 0 ? recoveredData : null);
                        }
                        return;
                    }
                    
                    const transaction = db.transaction(storeNames, 'readonly');
                    let completedStores = 0;
                    
                    storeNames.forEach(storeName => {
                        const store = transaction.objectStore(storeName);
                        const getAllRequest = store.getAll();
                        
                        getAllRequest.onsuccess = () => {
                            if (getAllRequest.result && getAllRequest.result.length > 0) {
                                recoveredData[`${dbName}_${storeName}`] = getAllRequest.result;
                            }
                            
                            completedStores++;
                            if (completedStores === storeNames.length) {
                                completedDbs++;
                                if (completedDbs === dbNames.length) {
                                    resolve(Object.keys(recoveredData).length > 0 ? recoveredData : null);
                                }
                            }
                        };
                        
                        getAllRequest.onerror = () => {
                            completedStores++;
                            if (completedStores === storeNames.length) {
                                completedDbs++;
                                if (completedDbs === dbNames.length) {
                                    resolve(Object.keys(recoveredData).length > 0 ? recoveredData : null);
                                }
                            }
                        };
                    });
                };
                
                request.onerror = () => {
                    completedDbs++;
                    if (completedDbs === dbNames.length) {
                        resolve(Object.keys(recoveredData).length > 0 ? recoveredData : null);
                    }
                };
            });
            
            // 超时处理
            setTimeout(() => {
                resolve(Object.keys(recoveredData).length > 0 ? recoveredData : null);
            }, 5000);
        });
    }
    
    /**
     * 历史数据重构
     */
    reconstructFromHistory() {
        const reconstructed = {};
        
        // 从历史记录重构数据
        try {
            if (window.history && window.history.state) {
                Object.assign(reconstructed, window.history.state);
            }
            
            // 从内存快照重构
            if (this.dataSnapshot) {
                Object.assign(reconstructed, this.dataSnapshot.data);
            }
            
            return Object.keys(reconstructed).length > 0 ? reconstructed : null;
            
        } catch (error) {
            console.error('历史数据重构失败:', error);
            return null;
        }
    }
    
    /**
     * 浏览器缓存恢复
     */
    async recoverFromBrowserCache() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                const cachedData = {};
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    for (const request of requests) {
                        if (request.url.includes('data') || request.url.includes('backup')) {
                            try {
                                const response = await cache.match(request);
                                const data = await response.text();
                                cachedData[request.url] = data;
                            } catch (error) {
                                // 忽略缓存读取错误
                            }
                        }
                    }
                }
                
                return Object.keys(cachedData).length > 0 ? cachedData : null;
            }
        } catch (error) {
            console.error('浏览器缓存恢复失败:', error);
        }
        
        return null;
    }
    
    /**
     * 网络资源恢复
     */
    async recoverFromNetworkSources() {
        const networkData = {};
        
        // 尝试从可能的网络位置恢复数据
        const possibleUrls = [
            '/backup/latest.json',
            '/data/emergency.json',
            './emergency-backup.json'
        ];
        
        for (const url of possibleUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    networkData[url] = data;
                }
            } catch (error) {
                // 忽略网络错误
            }
        }
        
        return Object.keys(networkData).length > 0 ? networkData : null;
    }
    
    /**
     * 分析恢复结果
     */
    analyzeRecoveryResults(results) {
        const successfulRecoveries = results.filter(r => r.success);
        
        if (successfulRecoveries.length === 0) {
            this.showNoDataFoundMessage();
            return;
        }
        
        // 合并所有恢复的数据
        const mergedData = this.mergeRecoveredData(successfulRecoveries);
        
        // 显示恢复选项
        this.showRecoveryOptions(mergedData, successfulRecoveries);
    }
    
    /**
     * 合并恢复的数据
     */
    mergeRecoveredData(recoveries) {
        const merged = {};
        
        recoveries.forEach(recovery => {
            if (recovery.data && typeof recovery.data === 'object') {
                Object.assign(merged, recovery.data);
            }
        });
        
        return merged;
    }
    
    /**
     * 显示恢复界面
     */
    showRecoveryInterface() {
        const interface = document.createElement('div');
        interface.id = 'emergency-recovery-interface';
        interface.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        interface.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🆘</div>
                <h2 style="color: #d32f2f; margin-bottom: 16px;">紧急数据恢复</h2>
                <p style="color: #666; margin-bottom: 24px;">正在尝试从多个来源恢复您的数据...</p>
                
                <div id="recovery-progress" style="
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                    text-align: left;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    <div>🔍 正在扫描数据来源...</div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="emergencyRecovery.cancelRecovery()" style="
                        background: #f5f5f5;
                        color: #666;
                        border: 1px solid #e0e0e0;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                    ">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(interface);
    }
    
    /**
     * 显示恢复选项
     */
    showRecoveryOptions(mergedData, recoveries) {
        const progressDiv = document.getElementById('recovery-progress');
        if (!progressDiv) return;
        
        let optionsHtml = '<div style="color: #4caf50; font-weight: bold; margin-bottom: 16px;">✅ 找到可恢复的数据</div>';
        
        recoveries.forEach(recovery => {
            optionsHtml += `
                <div style="margin-bottom: 8px; padding: 8px; background: #e8f5e8; border-radius: 4px;">
                    ✅ ${recovery.name}: 找到数据 (${recovery.duration}ms)
                </div>
            `;
        });
        
        // 分析恢复的数据
        const planDataCount = this.countPlanData(mergedData);
        const syncConfigFound = this.findSyncConfig(mergedData);
        
        optionsHtml += `
            <div style="margin-top: 16px; padding: 12px; background: #f0f8ff; border-radius: 8px;">
                <div style="font-weight: bold; margin-bottom: 8px;">恢复数据概览:</div>
                <div>📋 计划数据: ${planDataCount.total} 个条目</div>
                ${syncConfigFound ? '<div>⚙️ 同步配置: 已找到</div>' : '<div style="color: #f57c00;">⚠️ 同步配置: 未找到</div>'}
            </div>
        `;
        
        optionsHtml += `
            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button onclick="emergencyRecovery.restoreData(${JSON.stringify(mergedData).replace(/"/g, '&quot;')})" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">恢复所有数据</button>
                <button onclick="emergencyRecovery.selectiveRestore(${JSON.stringify(mergedData).replace(/"/g, '&quot;')})" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">选择性恢复</button>
            </div>
        `;
        
        progressDiv.innerHTML = optionsHtml;
    }
    
    /**
     * 统计计划数据
     */
    countPlanData(data) {
        const counts = { total: 0, types: {} };
        
        Object.keys(data).forEach(key => {
            if (key.startsWith('planData_')) {
                try {
                    const planData = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
                    if (planData && typeof planData === 'object') {
                        const count = Object.keys(planData).length;
                        counts.total += count;
                        counts.types[key] = count;
                    }
                } catch (error) {
                    // 忽略解析错误
                }
            }
        });
        
        return counts;
    }
    
    /**
     * 查找同步配置
     */
    findSyncConfig(data) {
        const configKeys = ['sync_config', 'syncConfig'];
        
        for (const key of configKeys) {
            if (data[key]) {
                try {
                    const config = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
                    if (config && config.provider) {
                        return config;
                    }
                } catch (error) {
                    // 忽略解析错误
                }
            }
        }
        
        return null;
    }
    
    /**
     * 恢复数据
     */
    restoreData(data) {
        try {
            let restoredCount = 0;
            
            Object.keys(data).forEach(key => {
                try {
                    const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                    localStorage.setItem(key, value);
                    restoredCount++;
                } catch (error) {
                    console.warn(`恢复${key}失败:`, error);
                }
            });
            
            // 显示成功消息
            this.showRestoreSuccess(restoredCount);
            
            // 重新加载页面
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('数据恢复失败:', error);
            this.showRestoreError(error);
        }
    }
    
    /**
     * 显示恢复成功
     */
    showRestoreSuccess(count) {
        const progressDiv = document.getElementById('recovery-progress');
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div style="text-align: center; color: #4caf50;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                    <div style="font-weight: bold; margin-bottom: 8px;">恢复成功！</div>
                    <div>已恢复 ${count} 个数据项</div>
                    <div style="margin-top: 16px; color: #666;">页面将在2秒后重新加载...</div>
                </div>
            `;
        }
    }
    
    /**
     * 显示没有找到数据的消息
     */
    showNoDataFoundMessage() {
        const progressDiv = document.getElementById('recovery-progress');
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div style="text-align: center; color: #f57c00;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <div style="font-weight: bold; margin-bottom: 8px;">未找到可恢复的数据</div>
                    <div>所有恢复方法都没有找到有效的数据备份</div>
                    <div style="margin-top: 16px;">
                        <button onclick="emergencyRecovery.cancelRecovery()" style="
                            background: #f5f5f5;
                            color: #666;
                            border: 1px solid #e0e0e0;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                        ">关闭</button>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * 取消恢复
     */
    cancelRecovery() {
        const interface = document.getElementById('emergency-recovery-interface');
        if (interface) {
            interface.remove();
        }
        this.isActive = false;
    }
    
    /**
     * 显示紧急恢复提示
     */
    showEmergencyRecoveryHint() {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 12px 16px;
            max-width: 300px;
            z-index: 10000;
            font-size: 14px;
            color: #856404;
        `;
        
        hint.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">🆘 检测到存储问题</div>
            <div style="margin-bottom: 12px;">如果遇到数据丢失，可以尝试紧急恢复</div>
            <div>
                <button onclick="emergencyRecovery.startEmergencyRecovery(); this.parentElement.parentElement.remove();" style="
                    background: #ffc107;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                ">启动紧急恢复</button>
                <button onclick="this.parentElement.parentElement.remove();" style="
                    background: transparent;
                    border: none;
                    margin-left: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #856404;
                ">忽略</button>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // 30秒后自动隐藏
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 30000);
    }
}

// 创建全局实例 - 延迟初始化以确保正确加载
function initEmergencyRecovery() {
    try {
        if (!window.emergencyRecovery) {
            window.emergencyRecovery = new EmergencyRecovery();
            console.log('✅ 紧急恢复系统已初始化');
        }
        return true;
    } catch (error) {
        console.error('❌ 紧急恢复系统初始化失败:', error);
        // 重试初始化
        setTimeout(initEmergencyRecovery, 1000);
        return false;
    }
}

// 将初始化函数暴露到全局作用域
window.initEmergencyRecovery = initEmergencyRecovery;

// 多种初始化时机，确保能成功创建实例
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmergencyRecovery);
} else if (document.readyState === 'interactive') {
    setTimeout(initEmergencyRecovery, 100);
} else {
    initEmergencyRecovery();
}

// 额外的延迟初始化，作为后备方案
setTimeout(initEmergencyRecovery, 500);
setTimeout(initEmergencyRecovery, 2000);
