/**
 * 数据备份助手 - 防止数据丢失
 * 增强版数据保护功能
 */

class BackupHelper {
    constructor() {
        this.backupInterval = 5 * 60 * 1000; // 5分钟自动备份
        this.maxBackups = 10; // 最多保留10个备份
        this.autoBackupTimer = null;
        this.init();
    }

    /**
     * 初始化备份助手
     */
    init() {
        console.log('🛡️ 数据备份助手已启动');
        this.startAutoBackup();
        this.setupBeforeUnloadProtection();
        this.setupSyncConfigProtection();
        this.createRecoveryScript();
    }

    /**
     * 启动自动备份
     */
    startAutoBackup() {
        this.autoBackupTimer = setInterval(() => {
            this.createFullBackup();
        }, this.backupInterval);
        
        console.log(`⏰ 自动备份已启动，每${this.backupInterval/60000}分钟备份一次`);
    }

    /**
     * 创建完整备份
     */
    createFullBackup() {
        try {
            const timestamp = new Date().toISOString();
            const backupData = this.collectAllData();
            
            // 保存到多个位置
            this.saveToLocalStorage(backupData, timestamp);
            this.saveToIndexedDB(backupData, timestamp);
            this.saveToFile(backupData, timestamp);
            
            console.log(`💾 数据备份完成: ${timestamp}`);
            
            // 清理旧备份
            this.cleanOldBackups();
            
        } catch (error) {
            console.error('❌ 数据备份失败:', error);
        }
    }

    /**
     * 收集所有数据
     */
    collectAllData() {
        const data = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: {}
        };

        // 收集所有 localStorage 数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('planData_') || 
                key.startsWith('sync_') ||
                key.includes('habit') ||
                key.includes('gratitude') ||
                key.includes('mood') ||
                key.includes('reflection') ||
                key.includes('template')
            )) {
                try {
                    data.data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data.data[key] = localStorage.getItem(key);
                }
            }
        }

        return data;
    }

    /**
     * 保存到 localStorage 备份区域
     */
    saveToLocalStorage(data, timestamp) {
        const backupKey = `backup_${timestamp}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
    }

    /**
     * 保存到 IndexedDB
     */
    async saveToIndexedDB(data, timestamp) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PlanManagerBackup', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                
                store.put({
                    id: timestamp,
                    data: data,
                    created: new Date()
                });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                const store = db.createObjectStore('backups', { keyPath: 'id' });
                store.createIndex('created', 'created', { unique: false });
            };
        });
    }

    /**
     * 保存到文件
     */
    saveToFile(data, timestamp) {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            // 创建隐藏的下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = `plan_backup_${timestamp.replace(/[:.]/g, '-')}.json`;
            a.style.display = 'none';
            
            // 询问用户是否需要下载备份文件
            if (confirm('是否下载最新的数据备份文件到本地？\n建议定期保存备份文件防止数据丢失。')) {
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('文件备份失败:', error);
        }
    }

    /**
     * 清理旧备份
     */
    cleanOldBackups() {
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                backupKeys.push(key);
            }
        }
        
        backupKeys.sort().reverse(); // 最新的在前
        
        // 删除超过最大数量的备份
        if (backupKeys.length > this.maxBackups) {
            const toDelete = backupKeys.slice(this.maxBackups);
            toDelete.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ 已删除旧备份: ${key}`);
            });
        }
    }

    /**
     * 恢复数据
     */
    async restoreFromBackup(backupKey) {
        try {
            let backupData;
            
            // 尝试从 localStorage 恢复
            const localData = localStorage.getItem(backupKey);
            if (localData) {
                backupData = JSON.parse(localData);
            } else {
                // 尝试从 IndexedDB 恢复
                backupData = await this.getFromIndexedDB(backupKey);
            }
            
            if (!backupData || !backupData.data) {
                throw new Error('备份数据不完整');
            }
            
            // 恢复数据
            Object.keys(backupData.data).forEach(key => {
                const value = backupData.data[key];
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            });
            
            console.log('✅ 数据恢复完成');
            
            // 刷新页面以应用恢复的数据
            if (confirm('数据恢复完成！是否刷新页面以加载恢复的数据？')) {
                window.location.reload();
            }
            
        } catch (error) {
            console.error('❌ 数据恢复失败:', error);
            alert('数据恢复失败: ' + error.message);
        }
    }

    /**
     * 从 IndexedDB 获取备份
     */
    async getFromIndexedDB(backupId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PlanManagerBackup', 1);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readonly');
                const store = transaction.objectStore('backups');
                const getRequest = store.get(backupId);
                
                getRequest.onsuccess = () => {
                    resolve(getRequest.result ? getRequest.result.data : null);
                };
                
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 获取所有备份列表
     */
    getBackupList() {
        const backups = [];
        
        // 从 localStorage 获取备份
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                const timestamp = key.replace('backup_', '');
                backups.push({
                    id: key,
                    timestamp: timestamp,
                    date: new Date(timestamp),
                    source: 'localStorage'
                });
            }
        }
        
        return backups.sort((a, b) => b.date - a.date);
    }

    /**
     * 设置页面关闭前的保护
     */
    setupBeforeUnloadProtection() {
        window.addEventListener('beforeunload', (e) => {
            // 创建紧急备份
            this.createFullBackup();
            
            // 不显示确认对话框，直接保存数据
            // const message = '您的数据可能未保存完成，确定要离开吗？';
            // e.returnValue = message;
            // return message;
        });
    }

    /**
     * 设置同步配置保护
     */
    setupSyncConfigProtection() {
        // 监听同步配置变化
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = (key, value) => {
            if (key === 'sync_config') {
                // 备份同步配置到独立存储
                localStorage.setItem('sync_config_backup', value);
                console.log('🔒 同步配置已备份');
            }
            originalSetItem(key, value);
        };
    }

    /**
     * 创建紧急恢复脚本
     */
    createRecoveryScript() {
        const script = `
        // 紧急数据恢复脚本
        function emergencyRestore() {
            console.log('🆘 启动紧急数据恢复');
            
            // 检查备份配置
            const syncBackup = localStorage.getItem('sync_config_backup');
            if (syncBackup && !localStorage.getItem('sync_config')) {
                localStorage.setItem('sync_config', syncBackup);
                console.log('✅ 同步配置已恢复');
            }
            
            // 显示可用备份
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('backup_')) {
                    backups.push(key);
                }
            }
            
            if (backups.length > 0) {
                console.log('📋 可用备份:', backups);
                const latest = backups.sort().reverse()[0];
                if (confirm('发现数据备份，是否恢复最新备份？\\n\\n' + latest)) {
                    window.backupHelper.restoreFromBackup(latest);
                }
            } else {
                alert('未找到可用的数据备份');
            }
        }
        
        // 在控制台中输入 emergencyRestore() 来恢复数据
        window.emergencyRestore = emergencyRestore;
        `;
        
        // 将脚本保存到页面中
        const scriptEl = document.createElement('script');
        scriptEl.textContent = script;
        document.head.appendChild(scriptEl);
        
        console.log('🆘 紧急恢复脚本已就绪，在控制台输入 emergencyRestore() 可紧急恢复数据');
    }

    /**
     * 停止自动备份
     */
    stop() {
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
            this.autoBackupTimer = null;
            console.log('⏹️ 自动备份已停止');
        }
    }

    /**
     * 显示备份管理界面
     */
    showBackupManager() {
        const backups = this.getBackupList();
        
        let html = `
            <div style="max-height: 400px; overflow-y: auto;">
                <h4>📋 数据备份管理</h4>
                <div style="margin-bottom: 15px;">
                    <button onclick="window.backupHelper.createFullBackup()" class="btn-main">
                        💾 立即备份
                    </button>
                    <button onclick="window.backupHelper.showRecoveryHelp()" class="btn-secondary">
                        🆘 恢复帮助
                    </button>
                </div>
                <h5>备份列表：</h5>
        `;
        
        if (backups.length === 0) {
            html += '<p>暂无备份数据</p>';
        } else {
            backups.forEach(backup => {
                html += `
                    <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        <div><strong>时间:</strong> ${backup.date.toLocaleString()}</div>
                        <div><strong>来源:</strong> ${backup.source}</div>
                        <button onclick="window.backupHelper.restoreFromBackup('${backup.id}')" 
                                class="btn-main" style="margin-top: 5px;">
                            🔄 恢复此备份
                        </button>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        
        if (typeof window.showModal === 'function') {
            window.showModal('数据备份管理', html, 'large');
        }
    }

    /**
     * 显示恢复帮助
     */
    showRecoveryHelp() {
        const help = `
            <div>
                <h4>🆘 数据恢复指南</h4>
                <div style="text-align: left; line-height: 1.6;">
                    <h5>如果数据丢失，请按以下步骤操作：</h5>
                    <ol>
                        <li><strong>检查自动备份：</strong>点击"数据备份管理"查看可用备份</li>
                        <li><strong>恢复同步配置：</strong>重新配置云同步服务</li>
                        <li><strong>从云端恢复：</strong>登录同步账户，手动同步数据</li>
                        <li><strong>紧急恢复：</strong>在浏览器控制台输入 <code>emergencyRestore()</code></li>
                    </ol>
                    
                    <h5>预防数据丢失：</h5>
                    <ul>
                        <li>定期下载备份文件到本地</li>
                        <li>启用云同步功能</li>
                        <li>清除浏览数据时排除此网站</li>
                        <li>使用隐私模式前先备份数据</li>
                    </ul>
                    
                    <h5>浏览器设置建议：</h5>
                    <p>在清除浏览数据时，请取消勾选"Cookie和其他网站数据"，以保留本应用的数据。</p>
                </div>
            </div>
        `;
        
        if (typeof window.showModal === 'function') {
            window.showModal('数据恢复帮助', help, 'large');
        }
    }
}

// 创建全局备份助手实例
window.backupHelper = new BackupHelper();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupHelper;
}
