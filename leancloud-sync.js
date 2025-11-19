/**
 * LeanCloud 实时同步系统
 * 替代 Firebase，国内速度快，实时同步
 */

(function () {
    'use strict';

    console.log('🚀 加载 LeanCloud 同步系统...');

    const SHARED_USER_ID = 'shared-plan-web-user'; // 固定的共享用户ID

    class LeanCloudSync {
        constructor() {
            console.log('🔧 创建 LeanCloudSync 实例...');
            this.isInitialized = false;
            this.isEnabled = false;
            this.sharedUserId = SHARED_USER_ID;
            this.lastSync = null;
            this.syncInProgress = false;
            this.PlanData = null; // LeanCloud 数据类
            this._syncDebounceTimer = null; // 同步防抖定时器
            this._originalSetItem = null; // 保存原始的 localStorage.setItem 方法
            this._isRestoringFromCloud = false; // 标记是否正在从云端恢复数据
            this.initError = null; // 保存初始化错误信息

            // 错误重试相关
            this.consecutiveErrors = 0;
            this.baseSyncInterval = 5000; // 基础间隔 5秒
            this.maxSyncInterval = 300000; // 最大间隔 5分钟
            this.syncTimer = null;

            console.log('🔧 LeanCloudSync 实例已创建，开始初始化...');
            this.init().catch(err => {
                console.error('❌ LeanCloudSync 初始化失败:', err);
                this.initError = err.message;
            });
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

                // 3秒后再次检查云端更新（确保获取最新数据）
                setTimeout(() => {
                    if (this.isEnabled && !this.syncInProgress) {
                        console.log('🔄 初始化后自动检查云端更新...');
                        this.checkAndPullUpdates();
                    }
                }, 3000);

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
                // 保存原始方法（绑定上下文，避免 Illegal invocation 错误）
                this._originalSetItem = localStorage.setItem.bind(localStorage);
                const originalSetItem = this._originalSetItem;

                localStorage.setItem = (key, value) => {
                    originalSetItem.call(localStorage, key, value);

                    // 如果正在从云端恢复数据，不触发同步（避免循环）
                    if (this._isRestoringFromCloud) {
                        console.log(`📥 从云端恢复数据中，跳过同步触发: ${key}`);
                        return;
                    }

                    // 只同步计划相关数据（兼容不同页面使用的存储键）
                    if (key.startsWith('planData_') || key.startsWith('habitData_') ||
                        key === 'habitTrackerData' || key === 'monthlyEvents' ||
                        key.startsWith('moodData_') || key.startsWith('gratitudeData_') ||
                        key.startsWith('reflection_') || key === 'reflection_history' ||
                        key === 'sync_test_data') { // 包含测试数据和月度日程
                        console.log(`📝 检测到数据变化: ${key}`);

                        // 立即更新本地修改时间戳（关键修复：防止刷新时丢失修改）
                        const now = new Date().toISOString();
                        originalSetItem.call(localStorage, 'leancloud_local_modified', now);
                        console.log(`⏰ 立即更新本地修改时间: ${now}`);

                        // 立即同步到云端（500ms 防抖，避免频繁保存）
                        clearTimeout(this._syncDebounceTimer);
                        this._syncDebounceTimer = setTimeout(() => {
                            console.log('💾 开始上传到 LeanCloud...');
                            this.syncToCloud();
                        }, 500);
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

            // 启动智能轮询（替代原来的 setInterval）
            this.scheduleNextSync();

            // 页面获得焦点时立即检查更新（用户切换回页面时）
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isEnabled && !this.syncInProgress) {
                    console.log('📱 页面重新可见，立即检查云端更新...');
                    this.checkAndPullUpdates();
                }
            });

            // 窗口获得焦点时也检查（从其他窗口切换回来）
            window.addEventListener('focus', () => {
                if (this.isEnabled && !this.syncInProgress) {
                    console.log('🔍 窗口获得焦点，立即检查云端更新...');
                    this.checkAndPullUpdates();
                }
            });

            // 鼠标移动时检查（防抖30秒，避免频繁检查）
            let mouseCheckTimer = null;
            let lastMouseCheck = 0;
            document.addEventListener('mousemove', () => {
                // 如果距离上次检查超过30秒，才允许再次检查
                const now = Date.now();
                if (now - lastMouseCheck < 30000) return;

                clearTimeout(mouseCheckTimer);
                mouseCheckTimer = setTimeout(() => {
                    if (this.isEnabled && !this.syncInProgress && !document.hidden) {
                        console.log('🖱️ 检测到用户活动，检查云端更新...');
                        this.checkAndPullUpdates();
                        lastMouseCheck = Date.now();
                    }
                }, 2000); // 鼠标停止移动2秒后检查
            }, { passive: true });

            // 页面滚动时检查（防抖30秒）
            let scrollCheckTimer = null;
            let lastScrollCheck = 0;
            window.addEventListener('scroll', () => {
                // 如果距离上次检查超过30秒，才允许再次检查
                const now = Date.now();
                if (now - lastScrollCheck < 30000) return;

                clearTimeout(scrollCheckTimer);
                scrollCheckTimer = setTimeout(() => {
                    if (this.isEnabled && !this.syncInProgress && !document.hidden) {
                        console.log('📜 检测到页面滚动，检查云端更新...');
                        this.checkAndPullUpdates();
                        lastScrollCheck = Date.now();
                    }
                }, 2000); // 滚动停止2秒后检查
            }, { passive: true });

            // 🔑 新增：手机端触摸事件监听（防抖10秒，更频繁检测）
            let touchCheckTimer = null;
            let lastTouchCheck = 0;
            const touchHandler = () => {
                const now = Date.now();
                if (now - lastTouchCheck < 10000) return; // 10秒防抖（从20秒减少到10秒）

                clearTimeout(touchCheckTimer);
                touchCheckTimer = setTimeout(() => {
                    if (this.isEnabled && !this.syncInProgress && !document.hidden) {
                        console.log('📱 检测到触摸活动，检查云端更新...');
                        this.checkAndPullUpdates();
                        lastTouchCheck = Date.now();
                    }
                }, 1000); // 触摸停止1秒后检查（从1.5秒减少到1秒）
            };

            // 监听触摸开始和触摸移动
            document.addEventListener('touchstart', touchHandler, { passive: true });
            document.addEventListener('touchmove', touchHandler, { passive: true });
            
            // 🔑 新增：手机端专用的更频繁轮询（检测是否为移动设备）
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                console.log('📱 检测到移动设备，启用增强同步检测...');
                // 移动设备每30秒检查一次云端更新（比桌面端更频繁）
                setInterval(() => {
                    if (this.isEnabled && !this.syncInProgress && !document.hidden) {
                        console.log('📱 移动设备定期检查云端更新...');
                        this.checkAndPullUpdates();
                    }
                }, 30 * 1000); // 30秒间隔
            }

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

                // 收集所有需要同步的数据
                if (key.startsWith('planData_') || key.startsWith('habitData_') ||
                    key === 'habitTrackerData' || key === 'monthlyEvents' ||
                    key.startsWith('moodData_') || key.startsWith('gratitudeData_') ||
                    key.startsWith('reflection_') || key === 'reflection_history' ||
                    key === 'sync_test_data' || key === 'gratitude_history') { // 包含测试数据、月度日程与感恩日记历史
                    const value = localStorage.getItem(key);
                    // 直接保存字符串值，在云端以字符串形式存储
                    // 恢复时也会以字符串形式写回 localStorage
                    allData[key] = value;
                }
            }

            return allData;
        }

        /**
         * 同步到云端
         */
        async syncToCloud() {
            if (!this.isEnabled) {
                console.warn('⚠️ LeanCloud 未启用，跳过同步');
                return;
            }

            if (this.syncInProgress) {
                console.warn('⚠️ 同步进行中，跳过本次同步');
                return;
            }

            try {
                this.syncInProgress = true;
                console.log('💾 开始同步到 LeanCloud...');
                console.log('📱 设备信息:', navigator.userAgent.substring(0, 50));

                // 更新状态指示器为同步中
                this.updateSyncStatusIndicator('syncing');

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

                // 更新数据 - 每次上传都生成新的云端时间戳
                const nowDate = new Date();
                const nowISO = nowDate.toISOString();

                planObject.set('data', planData);
                planObject.set('lastModified', nowISO);  // 🔑 使用 ISO 字符串（LeanCloud 字段为 String 类型）
                planObject.set('deviceInfo', navigator.userAgent.substring(0, 50));
                planObject.set('itemCount', dataCount);

                await planObject.save();

                // 上传成功后，更新最后同步时间（记录云端时间）
                // 使用原始方法避免触发监听器
                const setItem = this._originalSetItem || localStorage.setItem.bind(localStorage);
                setItem('leancloud_last_sync', nowISO);
                this.lastSync = nowDate;

                console.log('=== 同步成功 ===');
                console.log(`✅ 共同步 ${dataCount} 项数据`);
                console.log(`☁️ 云端时间: ${nowISO}`);
                console.log(`💾 本地修改时间: ${localStorage.getItem('leancloud_local_modified')}`);
                console.log(`💾 本地同步时间: ${localStorage.getItem('leancloud_last_sync')}`);
                console.log('=============');

                // 更新页面上的同步状态指示器（如果存在）
                this.updateSyncStatusIndicator('success', dataCount);

            } catch (error) {
                console.error('❌ 同步失败:', error);
                // 更新状态指示器为失败
                this.updateSyncStatusIndicator('error');
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
                console.log('=== 📥 开始检查云端数据 ===');

                // 检查本地数据状态
                const localData = this.collectAllPlanData();
                const localDataCount = Object.keys(localData).length;
                const isLocalEmpty = localDataCount === 0;

                console.log(`📊 本地数据: ${localDataCount} 条记录`);
                console.log(`🔄 强制恢复: ${forceRestore ? '是' : '否'}`);

                // 如果本地不为空且不是强制恢复，检查是否需要恢复
                if (!isLocalEmpty && !forceRestore) {
                    const localModified = localStorage.getItem('leancloud_local_modified');
                    const localLastSync = localStorage.getItem('leancloud_last_sync');
                    console.log(`💾 本地修改时间: ${localModified || '未知'}`);
                    console.log(`💾 本地同步时间: ${localLastSync || '未知'}`);

                    // 先查询云端数据的更新时间
                    const query = new AV.Query('PlanData');
                    query.equalTo('userId', this.sharedUserId);

                    try {
                        const planObject = await query.first();

                        if (planObject) {
                            const cloudLastModified = planObject.get('lastModified');
                            // 兼容处理：cloudLastModified 可能是 Date 对象或 ISO 字符串
                            const cloudLastModifiedStr = cloudLastModified instanceof Date ?
                                cloudLastModified.toISOString() : cloudLastModified;
                            console.log(`☁️ 云端最后更新时间: ${cloudLastModifiedStr || '未知'}`);

                            // 🔑 修复：只使用 localLastSync 来判断（最后一次同步时间）
                            // 不使用 localModified，避免本地草稿阻止云端更新拉取
                            if (localLastSync && cloudLastModified) {
                                const localSyncTime = new Date(localLastSync).getTime();
                                const cloudTime = new Date(cloudLastModified).getTime();
                                const diffSeconds = Math.round((cloudTime - localSyncTime) / 1000);

                                console.log(`⚖️ 时间戳比较:`);
                                console.log(`   本地同步: ${new Date(localSyncTime).toLocaleString()}`);
                                console.log(`   云端更新: ${new Date(cloudTime).toLocaleString()}`);
                                console.log(`   相差: ${diffSeconds} 秒`);

                                // 检查是否有未同步的本地修改 (Local Modified > Local Last Sync)
                                // 这是解决时钟偏差的关键：只比较本地时间
                                if (localModified && localLastSync && new Date(localModified) > new Date(localLastSync)) {
                                    console.log('⚠️ 本地有未同步的修改 (Local Modified > Last Sync)，跳过拉取，触发上传...');
                                    console.log(`   本地修改: ${new Date(localModified).toLocaleString()}`);
                                    console.log(`   上次同步: ${new Date(localLastSync).toLocaleString()}`);

                                    // 触发上传
                                    this.syncToCloud();
                                    return;
                                }

                                // 如果本地没有未同步的修改，且云端更新，则拉取
                                if (cloudTime <= localSyncTime) {
                                    console.log('✅ 本地数据已是最新（云端时间 <= 本地同步时间），跳过自动恢复');
                                    console.log('=========================');
                                    return;
                                } else {
                                    console.log(`🆕 云端有更新（云端比本地同步晚 ${diffSeconds} 秒），开始恢复...`);
                                }
                            } else if (!localLastSync) {
                                console.log('ℹ️ 本地从未同步过，将恢复云端数据');
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
                    // 兼容处理：转换为 ISO 字符串用于显示和存储
                    const lastModifiedStr = lastModified instanceof Date ?
                        lastModified.toISOString() : lastModified;

                    console.log(`☁️ 发现云端数据: ${itemCount} 条记录`);
                    console.log(`📅 云端最后更新: ${lastModifiedStr || '未知'}`);

                    if (cloudData && typeof cloudData === 'object') {
                        let restoredCount = 0;

                        // 设置标志位，表示正在从云端恢复数据
                        this._isRestoringFromCloud = true;

                        try {
                            Object.keys(cloudData).forEach(key => {
                                const value = cloudData[key];
                                const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                                // 使用原始方法保存数据，避免触发同步
                                if (this._originalSetItem) {
                                    this._originalSetItem.call(localStorage, key, jsonValue);
                                } else {
                                    localStorage.setItem(key, jsonValue);
                                }
                                restoredCount++;
                            });

                            // 更新本地时间戳（关键：避免重复恢复和数据冲突）
                            if (lastModifiedStr) {
                                const setItem = this._originalSetItem || localStorage.setItem.bind(localStorage);
                                setItem('leancloud_last_sync', lastModifiedStr);
                                setItem('leancloud_local_modified', lastModifiedStr);
                                console.log(`⏰ 已更新本地时间戳: ${lastModifiedStr}`);
                            }
                        } finally {
                            // 恢复完成，清除标志位
                            this._isRestoringFromCloud = false;
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
                if (!restoreInProgress) {
                    this.syncInProgress = false;
                }
            }
        }

        /**
         * 调度下一次同步
         */
        scheduleNextSync(delay = null) {
            if (this.syncTimer) {
                clearTimeout(this.syncTimer);
            }

            // 如果未指定延迟，根据错误次数计算指数退避
            if (delay === null) {
                if (this.consecutiveErrors === 0) {
                    delay = this.baseSyncInterval;
                } else {
                    // 指数退避: 5s, 10s, 20s, 40s... max 300s
                    delay = Math.min(
                        this.baseSyncInterval * Math.pow(2, this.consecutiveErrors),
                        this.maxSyncInterval
                    );
                }
            }

            // 只有在启用状态下才调度
            if (this.isEnabled) {
                if (this.consecutiveErrors > 0) {
                    console.log(`⏳ 同步遇到错误，将在 ${delay / 1000} 秒后重试 (错误次数: ${this.consecutiveErrors})`);
                }

                this.syncTimer = setTimeout(() => {
                    if (this.isEnabled && !this.syncInProgress) {
                        // 只有在没有连续错误时才打印常规日志，避免刷屏
                        if (this.consecutiveErrors === 0) {
                            console.log('🔄 定期检查云端更新...');
                        }
                        this.checkAndPullUpdates();
                    } else {
                        // 如果正在同步或未启用，稍后再次检查
                        this.scheduleNextSync(5000);
                    }
                }, delay);
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
                    // 兼容处理：cloudLastModified 可能是 Date 对象或 ISO 字符串
                    const cloudLastModifiedStr = cloudLastModified instanceof Date ?
                        cloudLastModified.toISOString() : cloudLastModified;

                    // 🔑 关键修复：同时检查本地修改时间和同步时间
                    const localModified = localStorage.getItem('leancloud_local_modified');
                    const localLastSync = localStorage.getItem('leancloud_last_sync');

                    console.log('☁️ 云端最后更新:', cloudLastModifiedStr);
                    console.log('💾 本地修改时间:', localModified);
                    console.log('💾 本地同步时间:', localLastSync);

                    // 🔑 核心修复：只有当本地修改时间晚于本地同步时间，才认为本地有未同步的修改
                    const hasUnsyncedLocalChanges = localModified && localLastSync && 
                        new Date(localModified) > new Date(localLastSync);
                    
                    if (hasUnsyncedLocalChanges) {
                        console.log('⚠️ 检测到本地有未同步的修改，跳过云端数据拉取');
                        console.log(`   本地修改: ${new Date(localModified).toLocaleString()}`);
                        console.log(`   上次同步: ${new Date(localLastSync).toLocaleString()}`);
                        return;
                    }
                    
                    // 使用本地同步时间来比较（而不是修改时间）
                    const compareTime = localLastSync;

                    // 🔑 修复：如果云端数据更新时间晚于本地时间（修改时间或同步时间中较新的）
                    if (cloudLastModified && (!compareTime || new Date(cloudLastModified) > new Date(compareTime))) {
                        console.log('🆕 发现云端有新数据！');
                        console.log(`   云端: ${new Date(cloudLastModified).toLocaleString()}`);
                        console.log(`   本地: ${compareTime ? new Date(compareTime).toLocaleString() : '无'}`);
                        console.log(`   相差: ${Math.round((new Date(cloudLastModified) - new Date(compareTime)) / 1000)} 秒`);

                        const cloudData = planObject.get('data');
                        const itemCount = planObject.get('itemCount') || 0;

                        if (cloudData && typeof cloudData === 'object') {
                            let updatedCount = 0;

                            // 设置标志位，表示正在从云端恢复数据
                            this._isRestoringFromCloud = true;

                            try {
                                // 更新本地数据
                                Object.keys(cloudData).forEach(key => {
                                    const value = cloudData[key];
                                    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                                    // 使用原始方法保存数据，避免触发同步
                                    if (this._originalSetItem) {
                                        this._originalSetItem.call(localStorage, key, jsonValue);
                                    } else {
                                        localStorage.setItem(key, jsonValue);
                                    }
                                    // *** 新增日志 ***
                                    if (key === 'planData_week') {
                                        console.log('[DEBUG] LeanCloud 拉取写入:', key, jsonValue);
                                    }
                                    updatedCount++;
                                });

                                // 更新本地时间戳（同步云端时间）
                                const setItem = this._originalSetItem || localStorage.setItem.bind(localStorage);
                                // 🔑 修复：确保存储字符串格式，兼容 Date 对象和字符串
                                const timestampStr = cloudLastModified instanceof Date ?
                                    cloudLastModified.toISOString() : cloudLastModified;
                                setItem('leancloud_last_sync', timestampStr);
                                setItem('leancloud_local_modified', timestampStr);
                                this.lastSync = new Date(cloudLastModified);
                                console.log(`⏰ 已更新本地时间戳为云端时间: ${timestampStr}`);
                            } finally {
                                // 恢复完成，清除标志位
                                this._isRestoringFromCloud = false;
                            }

                            console.log(`✅ 已拉取云端更新：${updatedCount} 条数据`);

                            // 触发页面刷新事件，让UI更新
                            window.dispatchEvent(new Event('storage'));

                            // 🔑 新增：显示简短的同步成功提示
                            if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
                                MessageUtils.success(`✅ 已同步云端最新数据（${itemCount}条）`, 2000);
                            }

                            // 显示通知（不阻塞）
                            this.showUpdateNotification(updatedCount);
                        }
                    } else {
                        console.log('✅ 本地数据已是最新');
                    }
                } else {
                    console.log('ℹ️ 云端暂无数据');
                }

                // 成功执行，重置错误计数
                if (this.consecutiveErrors > 0) {
                    console.log('✅ LeanCloud 连接已恢复');
                    this.consecutiveErrors = 0;
                    // 立即恢复正常频率
                    this.scheduleNextSync(this.baseSyncInterval);
                } else {
                    // 正常调度下一次
                    this.scheduleNextSync();
                }

            } catch (error) {
                this.consecutiveErrors++;

                // 只有在前3次错误或错误次数是5的倍数时才打印详细日志，避免刷屏
                if (this.consecutiveErrors <= 3 || this.consecutiveErrors % 5 === 0) {
                    console.error(`❌ 检查更新失败 (第${this.consecutiveErrors}次):`, error.message || error);
                }

                // 调度下一次（会应用退避策略）
                this.scheduleNextSync();
            }
        }

        /**
         * 显示更新通知（优化版 - 更友好的提示）
         */
        showUpdateNotification(count) {
            // 防止重复创建通知
            const existingNotification = document.getElementById('leancloud-sync-notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // 创建一个不阻塞的通知
            const notification = document.createElement('div');
            notification.id = 'leancloud-sync-notification';
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                z-index: 10000;
                font-size: 14px;
                animation: slideIn 0.3s ease-out;
                cursor: pointer;
                max-width: 320px;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">✅</div>
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">云端数据已更新</div>
                        <div style="opacity: 0.95; font-size: 13px;">同步了 ${count} 条数据，点击刷新查看</div>
                    </div>
                </div>
            `;

            // 添加动画样式（只添加一次）
            if (!document.getElementById('leancloud-notification-style')) {
                const style = document.createElement('style');
                style.id = 'leancloud-notification-style';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(400px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(400px); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            // 点击刷新页面
            notification.onclick = () => {
                console.log('🔄 用户点击通知，刷新页面...');
                window.location.reload();
            };

            // 鼠标悬停效果
            notification.onmouseenter = () => {
                notification.style.transform = 'scale(1.05)';
                notification.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5)';
            };

            notification.onmouseleave = () => {
                notification.style.transform = 'scale(1)';
                notification.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
            };

            document.body.appendChild(notification);

            // 8秒后自动消失
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 8000);
        }

        /**
         * 更新同步状态指示器（页面上的状态显示）
         */
        updateSyncStatusIndicator(status, count = 0) {
            const indicator = document.getElementById('sync-status-indicator');
            const icon = document.getElementById('sync-status-icon');
            const text = document.getElementById('sync-status-text');

            if (!indicator || !icon || !text) return;

            if (status === 'success') {
                // 同步成功 - 短暂显示成功状态
                icon.textContent = '✅';
                text.textContent = `已同步 ${count} 条`;
                indicator.style.background = 'rgba(76, 175, 80, 0.95)';
                indicator.style.color = 'white';

                // 2秒后恢复为正常状态
                setTimeout(() => {
                    icon.textContent = '🟢';
                    text.textContent = 'LeanCloud 已连接';
                }, 2000);
            } else if (status === 'syncing') {
                // 同步中
                icon.textContent = '🔄';
                text.textContent = '同步中...';
                indicator.style.background = 'rgba(33, 150, 243, 0.95)';
                indicator.style.color = 'white';
            } else if (status === 'error') {
                // 同步失败
                icon.textContent = '⚠️';
                text.textContent = '同步失败';
                indicator.style.background = 'rgba(244, 67, 54, 0.95)';
                indicator.style.color = 'white';

                // 5秒后恢复
                setTimeout(() => {
                    icon.textContent = '🟢';
                    text.textContent = 'LeanCloud 已连接';
                    indicator.style.background = 'rgba(76, 175, 80, 0.95)';
                }, 5000);
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

        /**
         * 获取同步状态 (兼容月度页面调用)
         */
        getSyncStatus() {
            return {
                enabled: this.isEnabled,
                online: navigator.onLine && this.isEnabled,
                lastSync: this.lastSync,
                error: this.initError,
                syncInProgress: this.syncInProgress
            };
        }

        /**
         * 手动同步 (兼容月度页面调用)
         */
        async manualSync() {
            console.log('🔄 手动触发同步...');

            // 🔄 等待初始化完成
            if (!this.isInitialized) {
                console.log('⏳ 等待 LeanCloud 初始化完成...');

                let attempts = 0;
                const maxAttempts = 30; // 最多等待15秒

                while (!this.isInitialized && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    attempts++;
                }

                if (!this.isInitialized) {
                    throw new Error('LeanCloud 初始化超时');
                }
            }

            if (!this.isEnabled) {
                throw new Error('同步服务未启用');
            }

            if (!navigator.onLine) {
                throw new Error('网络连接不可用');
            }

            // 先同步到云端
            await this.syncToCloud();

            // 然后从云端恢复（确保获取最新数据）
            await this.restoreFromCloud(false); // false = 不强制覆盖，只在云端更新时恢复

            console.log('✅ 手动同步完成');
        }
    }

    // 创建全局实例（注意：使用大写C以匹配index.html中的引用）
    try {
        console.log('📦 准备创建 LeanCloudSync 全局实例...');
        const leanCloudSyncInstance = new LeanCloudSync();
        window.leanCloudSync = leanCloudSyncInstance;

        // 🔑 关键修复：同时暴露为 window.syncService，供月度页面等其他页面使用
        window.syncService = leanCloudSyncInstance;

        console.log('✅ LeanCloud 同步系统已加载，全局实例已创建');
        console.log('🔄 window.syncService 已映射到 LeanCloud 同步服务');
    } catch (error) {
        console.error('❌ 创建 LeanCloudSync 实例失败:', error);
        // 创建一个带错误信息的占位对象
        const errorPlaceholder = {
            isInitialized: false,
            isEnabled: false,
            initError: error.message,
            getSyncStatus: function () {
                return {
                    enabled: false,
                    online: false,
                    lastSync: null,
                    error: this.initError
                };
            },
            manualSync: function () {
                return Promise.reject(new Error('同步服务初始化失败: ' + this.initError));
            },
            restoreFromCloud: function () {
                return Promise.reject(new Error('同步服务初始化失败: ' + this.initError));
            }
        };

        window.leanCloudSync = errorPlaceholder;
        // 🔑 同样暴露错误占位对象为 window.syncService
        window.syncService = errorPlaceholder;
    }

})();

