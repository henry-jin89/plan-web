/**
 * 批量修复所有页面的弹窗问题
 * 这个脚本会自动处理所有页面的同步相关弹窗
 */

(function() {
    'use strict';
    
    console.log('🚀 启动全页面弹窗修复脚本');
    
    // 立即设置全局标志
    window.DISABLE_ALL_NOTIFICATIONS = true;
    window.DISABLE_SYNC_NOTIFICATIONS = true;
    window.GITHUB_PAGES_MODE = true;
    window.POPUP_PROTECTION_ACTIVE = true;
    
    // 重写所有可能的弹窗函数
    const blockAllPopups = () => {
        // 保存原始函数
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        const originalPrompt = window.prompt;
        
        // 重写alert - 完全静默
        window.alert = function(message) {
            console.log('[弹窗已阻止] Alert:', message);
            return;
        };
        
        // 重写confirm - 完全静默
        window.confirm = function(message) {
            console.log('[弹窗已阻止] Confirm:', message);
            return true;
        };
        
        // 重写prompt - 完全静默
        window.prompt = function(message, defaultValue) {
            console.log('[弹窗已阻止] Prompt:', message);
            return defaultValue || '';
        };
        
        // 阻止所有可能的通知API
        if (window.Notification) {
            const OriginalNotification = window.Notification;
            window.Notification = function() {
                console.log('[弹窗已阻止] Notification:', arguments[0]);
                return { close: () => {} };
            };
            window.Notification.requestPermission = () => Promise.resolve('denied');
        }
        
        console.log('✅ 所有弹窗函数已被重写');
    };
    
    // 阻止同步服务初始化
    const blockSyncServices = () => {
        // 阻止各种同步服务的创建
        window.autoSyncService = null;
        window.syncService = null;
        window.universalAutoSync = null;
        window.ZeroConfigSync = null;
        window.SyncStatusManager = null;
        
        // 重写同步相关的全局函数
        window.enableAutoSync = () => console.log('[弹窗阻止] 同步功能已禁用');
        window.disableAutoSync = () => console.log('[弹窗阻止] 同步功能已禁用');
        window.manualSync = () => console.log('[弹窗阻止] 同步功能已禁用');
        
        // 阻止构造函数
        window.AutoSyncService = function() { console.log('[弹窗阻止] AutoSyncService构造被阻止'); };
        window.UniversalAutoSync = function() { console.log('[弹窗阻止] UniversalAutoSync构造被阻止'); };
        
        console.log('✅ 同步服务已被阻止');
    };
    
    // 清理现有的同步元素
    const cleanupSyncElements = () => {
        const selectors = [
            '#auto-sync-indicator',
            '#universal-sync-badge',
            '[id*="sync-notification"]',
            '[id*="zero-config-sync"]',
            '.sync-notification',
            '.zero-config-notification',
            '[class*="sync-indicator"]',
            '[class*="sync-status"]',
            '[id*="sync-menu"]'
        ];
        
        let cleanedCount = 0;
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.remove();
                cleanedCount++;
            });
        });
        
        if (cleanedCount > 0) {
            console.log(`🧹 已清理 ${cleanedCount} 个同步相关元素`);
        }
    };
    
    // 监听DOM变化，阻止新的同步元素创建
    const observeAndBlock = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        
                        // 检查元素本身
                        if (element.id && (
                            element.id.includes('sync') || 
                            element.id.includes('notification') ||
                            element.id.includes('indicator')
                        )) {
                            console.log('🚫 阻止创建同步元素:', element.id);
                            element.remove();
                            return;
                        }
                        
                        // 检查class
                        if (element.className && typeof element.className === 'string' && (
                            element.className.includes('sync') ||
                            element.className.includes('notification')
                        )) {
                            console.log('🚫 阻止创建同步元素 (class):', element.className);
                            element.remove();
                            return;
                        }
                        
                        // 检查文本内容 - 扩展阻止列表
                        if (element.textContent && (
                            element.textContent.includes('自动同步失败') ||
                            element.textContent.includes('同步中') ||
                            element.textContent.includes('连接失败') ||
                            element.textContent.includes('感恩日记修复完成') ||
                            element.textContent.includes('修复了') ||
                            element.textContent.includes('同步完成') ||
                            element.textContent.includes('零配置') ||
                            element.textContent.includes('云同步') ||
                            element.textContent.includes('数据已同步') ||
                            element.textContent.includes('网络连接异常') ||
                            element.textContent.includes('同步认证失败') ||
                            element.textContent.includes('云同步暂时失败')
                        )) {
                            console.log('🚫 阻止创建通知弹窗 (文本):', element.textContent.substring(0, 50));
                            element.remove();
                            return;
                        }
                        
                        // 递归检查子元素
                        if (element.querySelectorAll) {
                            const syncChildren = element.querySelectorAll('[id*="sync"], [class*="sync"], [id*="notification"]');
                            syncChildren.forEach(child => {
                                if (child.textContent && (
                                    child.textContent.includes('同步') ||
                                    child.textContent.includes('失败') ||
                                    child.textContent.includes('sync')
                                )) {
                                    console.log('🚫 阻止创建同步子元素');
                                    child.remove();
                                }
                            });
                        }
                    }
                });
            });
        });
        
        // 开始观察
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('👀 DOM观察器已启动');
        } else {
            // 如果body还没加载，延迟启动
            setTimeout(() => {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    console.log('👀 DOM观察器已延迟启动');
                }
            }, 1000);
        }
    };
    
    // 阻止脚本加载
    const blockScriptLoading = () => {
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    if (name === 'src' && typeof value === 'string') {
                        const blockedScripts = [
                            'zero-config-sync.js',
                            'universal-auto-sync.js',
                            'global-sync-config.js',
                            'fix-sync-initialization.js',
                            'cross-browser-sync-recovery.js',
                            'auto-sync-service.js'
                        ];
                        
                        const isBlocked = blockedScripts.some(script => value.includes(script));
                        if (isBlocked) {
                            console.log('🚫 阻止加载同步脚本:', value);
                            return; // 不设置src，脚本不会加载
                        }
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }
            
            return element;
        };
        
        console.log('✅ 脚本加载拦截器已启用');
    };
    
    // 初始化所有防护
    const init = () => {
        blockAllPopups();
        blockSyncServices();
        blockScriptLoading();
        
        // 立即清理一次
        setTimeout(cleanupSyncElements, 100);
        
        // 启动DOM观察
        setTimeout(observeAndBlock, 500);
        
        // 定期清理 - 更频繁的清理
        setInterval(cleanupSyncElements, 1000);
        
        // 额外的积极清理机制
        setInterval(() => {
            // 清理所有可能的弹窗元素
            const popupSelectors = [
                '[style*="position: fixed"]',
                '[style*="z-index"]',
                'div[style*="top:"]',
                'div[style*="right:"]',
                '.notification',
                '.toast',
                '.alert',
                '.popup'
            ];
            
            popupSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.textContent && (
                        element.textContent.includes('同步') ||
                        element.textContent.includes('修复') ||
                        element.textContent.includes('失败') ||
                        element.textContent.includes('完成') ||
                        element.textContent.includes('连接')
                    )) {
                        console.log('🧹 积极清理弹窗元素:', element.textContent.substring(0, 30));
                        element.remove();
                    }
                });
            });
        }, 500);
        
        console.log('✅ 全页面弹窗防护已启用');
    };
    
    // 根据文档状态决定何时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 页面卸载前清理
    window.addEventListener('beforeunload', () => {
        console.log('👋 全页面弹窗防护脚本卸载');
    });
    
    // 暴露状态检查函数
    window.PopupProtectionStatus = {
        isActive: () => window.POPUP_PROTECTION_ACTIVE,
        getBlockedCount: () => {
            return document.querySelectorAll('[data-blocked-popup]').length;
        }
    };
    
})();
