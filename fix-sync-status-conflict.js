/**
 * 修复同步状态显示冲突问题
 * 解决多个同步系统同时显示状态导致的界面混乱
 */

(function() {
    'use strict';
    
    console.log('🔧 加载同步状态冲突修复脚本...');
    
    // 全局同步状态管理器
    window.SyncStatusManager = {
        currentNotification: null,
        isShowing: false,
        
        // 清除所有同步相关的通知
        clearAllSyncNotifications() {
            const selectors = [
                '[id*="sync"]',
                '[id*="notification"]', 
                '[id*="status"]',
                '.sync-status',
                '.sync-notification',
                '.sync-status-bar'
            ];
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element && element.parentNode) {
                            const text = element.textContent || '';
                            // 只清除同步相关的通知
                            if (text.includes('同步') || 
                                text.includes('失败') ||
                                text.includes('连接') ||
                                text.includes('中...') ||
                                text.includes('成功')) {
                                
                                // 不清除固定的同步状态栏
                                if (!element.classList.contains('sync-status-bar') && 
                                    element.id !== 'syncStatusBar') {
                                    element.remove();
                                }
                            }
                        }
                    });
                } catch (e) {
                    // 忽略清除过程中的错误
                }
            });
        },
        
        // 显示统一的同步通知
        showNotification(message, type = 'info', duration = 4000) {
            // 防止重复显示
            if (this.isShowing) {
                console.log('同步通知已在显示中，跳过:', message);
                return;
            }
            
            this.isShowing = true;
            this.clearAllSyncNotifications();
            
            const notification = document.createElement('div');
            notification.id = 'unified-sync-notification';
            notification.className = 'sync-notification';
            
            const styles = {
                success: 'background: linear-gradient(135deg, #4caf50, #45a049); color: white;',
                error: 'background: linear-gradient(135deg, #f44336, #d32f2f); color: white;',
                warning: 'background: linear-gradient(135deg, #ff9800, #f57c00); color: white;',
                info: 'background: linear-gradient(135deg, #2196f3, #1976d2); color: white;'
            };
            
            notification.style.cssText = `
                position: fixed;
                top: 60px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                max-width: 320px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                transform: translateX(100%);
                ${styles[type]}
            `;
            
            // 添加图标
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">${icons[type]}</span>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            this.currentNotification = notification;
            
            // 显示动画
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.transform = 'translateX(0)';
                }
            }, 100);
            
            // 自动隐藏
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        },
        
        // 隐藏通知
        hideNotification() {
            if (this.currentNotification && this.currentNotification.parentNode) {
                this.currentNotification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (this.currentNotification && this.currentNotification.parentNode) {
                        this.currentNotification.remove();
                    }
                    this.currentNotification = null;
                    this.isShowing = false;
                }, 300);
            } else {
                this.isShowing = false;
            }
        },
        
        // 更新同步状态栏
        updateStatusBar(message, type = 'info') {
            const statusBar = document.getElementById('syncStatusBar');
            const statusText = document.getElementById('syncStatusText');
            const indicator = document.getElementById('syncIndicator');
            
            if (statusBar && statusText && indicator) {
                statusBar.style.display = 'flex';
                statusText.textContent = message;
                
                // 清除之前的状态类
                indicator.className = 'sync-indicator';
                
                // 根据类型添加对应的状态类
                switch (type) {
                    case 'success':
                        // 默认绿色，不需要额外类
                        break;
                    case 'warning':
                        indicator.classList.add('disconnected');
                        break;
                    case 'error':
                        indicator.classList.add('error');
                        break;
                }
            }
        }
    };
    
    // 重写全局的同步通知函数
    if (typeof window.showSyncNotification === 'function') {
        const originalShowSyncNotification = window.showSyncNotification;
        window.showSyncNotification = function(message, type = 'info') {
            window.SyncStatusManager.showNotification(message, type);
        };
    }
    
    // 监听同步事件
    window.addEventListener('sync-start', function() {
        window.SyncStatusManager.showNotification('正在同步数据...', 'info');
    });
    
    window.addEventListener('sync-success', function(event) {
        const detail = event.detail || {};
        window.SyncStatusManager.showNotification(
            detail.message || '数据同步成功', 'success'
        );
    });
    
    window.addEventListener('sync-error', function(event) {
        const detail = event.detail || {};
        window.SyncStatusManager.showNotification(
            detail.message || '同步失败，请检查网络连接', 'error'
        );
    });
    
    // 页面加载完成后清理一次
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                window.SyncStatusManager.clearAllSyncNotifications();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.SyncStatusManager.clearAllSyncNotifications();
        }, 1000);
    }
    
    console.log('✅ 同步状态冲突修复脚本加载完成');
    
})();
