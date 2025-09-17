/**
 * GitHub Pages 部署优化脚本
 * 确保在GitHub Pages环境下正常工作，无弹窗干扰
 */

(function() {
    'use strict';
    
    console.log('🚀 GitHub Pages优化脚本启动');
    
    // 立即禁用所有可能的弹窗
    window.GITHUB_PAGES_MODE = true;
    window.DISABLE_ALL_NOTIFICATIONS = true;
    window.DISABLE_SYNC_NOTIFICATIONS = true;
    
    // 重写可能导致弹窗的函数
    const blockPopups = () => {
        // 阻止alert
        const originalAlert = window.alert;
        window.alert = function(message) {
            console.log('[GitHub Pages - Alert已阻止]:', message);
            return;
        };
        
        // 阻止confirm
        const originalConfirm = window.confirm;
        window.confirm = function(message) {
            console.log('[GitHub Pages - Confirm已阻止]:', message);
            return true;
        };
        
        // 阻止prompt
        const originalPrompt = window.prompt;
        window.prompt = function(message, defaultValue) {
            console.log('[GitHub Pages - Prompt已阻止]:', message);
            return defaultValue || '';
        };
    };
    
    // 清理现有的同步相关元素
    const cleanupSyncElements = () => {
        const syncSelectors = [
            '#auto-sync-indicator',
            '#universal-sync-badge', 
            '[id*="sync-notification"]',
            '[id*="zero-config-sync"]',
            '.sync-notification',
            '.zero-config-notification',
            '[class*="sync-indicator"]',
            '[class*="sync-status"]'
        ];
        
        let cleanedCount = 0;
        syncSelectors.forEach(selector => {
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
    
    // 阻止同步脚本的执行
    const blockSyncScripts = () => {
        // 禁用可能的同步服务
        window.autoSyncService = null;
        window.syncService = null;
        window.universalAutoSync = null;
        window.ZeroConfigSync = null;
        
        // 阻止同步相关的全局函数
        window.enableAutoSync = () => console.log('[GitHub Pages] 同步功能已禁用');
        window.disableAutoSync = () => console.log('[GitHub Pages] 同步功能已禁用');
        window.manualSync = () => console.log('[GitHub Pages] 同步功能已禁用');
        
        console.log('🛡️ 同步脚本已阻止');
    };
    
    // 监听DOM变化，阻止同步元素的创建
    const observeAndBlock = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查是否是同步相关元素
                        const element = node;
                        if (element.id && (
                            element.id.includes('sync') || 
                            element.id.includes('notification') ||
                            element.id.includes('indicator')
                        )) {
                            element.remove();
                            console.log('🚫 阻止创建同步元素:', element.id);
                        }
                        
                        // 检查子元素
                        const syncChildren = element.querySelectorAll && element.querySelectorAll('[id*="sync"], [class*="sync"], [id*="notification"]');
                        if (syncChildren) {
                            syncChildren.forEach(child => {
                                if (child.textContent && (
                                    child.textContent.includes('同步') ||
                                    child.textContent.includes('失败') ||
                                    child.textContent.includes('sync')
                                )) {
                                    child.remove();
                                    console.log('🚫 阻止创建同步子元素');
                                }
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 DOM监听器已启动');
    };
    
    // 初始化优化
    const init = () => {
        blockPopups();
        blockSyncScripts();
        cleanupSyncElements();
        
        // 延迟启动DOM监听，确保页面基础元素加载完成
        setTimeout(() => {
            observeAndBlock();
        }, 1000);
        
        // 定期清理
        setInterval(cleanupSyncElements, 2000);
        
        console.log('✅ GitHub Pages优化完成');
    };
    
    // 根据文档状态决定何时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 页面卸载前清理
    window.addEventListener('beforeunload', () => {
        console.log('👋 GitHub Pages优化脚本卸载');
    });
    
})();
