/**
 * 紧急恢复系统 - 简化版本
 * 确保 emergencyRecovery 组件能够正确加载
 */

// 简化的紧急恢复类
class EmergencyRecoverySimple {
    constructor() {
        this.isActive = false;
        this.recoveryAttempts = 0;
        this.maxAttempts = 3;
        this.recoveryInterval = null;
        
        console.log('🆘 紧急恢复系统(简化版)启动...');
        this.init();
    }
    
    init() {
        this.setupKeyboardShortcuts();
        this.monitorStorageIssues();
        console.log('✅ 紧急恢复系统(简化版)准备就绪');
    }
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.activateRecoveryMode();
            }
        });
        
        console.log('⌨️ 紧急恢复快捷键已设置: Ctrl+Shift+R');
    }
    
    /**
     * 监控存储问题
     */
    monitorStorageIssues() {
        // 检查是否有同步配置丢失
        const checkStorageHealth = () => {
            try {
                const syncConfig = localStorage.getItem('sync_config');
                const hasData = localStorage.getItem('planData_day') || 
                               localStorage.getItem('habitTrackerData') ||
                               localStorage.getItem('monthlyGoals');
                
                if (hasData && !syncConfig && !this.isActive) {
                    this.showStorageIssueHint();
                }
            } catch (error) {
                console.warn('存储健康检查失败:', error);
            }
        };
        
        // 页面加载完成后检查
        setTimeout(checkStorageHealth, 5000);
        
        // 定期检查
        setInterval(checkStorageHealth, 30000);
    }
    
    /**
     * 显示存储问题提示
     */
    showStorageIssueHint() {
        console.log('⚠️ 检测到存储问题，显示恢复提示');
        
        const hint = document.createElement('div');
        hint.id = 'storage-issue-hint';
        hint.style.cssText = `
            position: fixed;
            top: 20px;
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
                <button onclick="window.emergencyRecovery.activateRecoveryMode(); this.parentElement.parentElement.remove();" style="
                    background: #ffc107;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    margin-right: 8px;
                ">启动恢复</button>
                <button onclick="this.parentElement.parentElement.remove();" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                ">忽略</button>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // 30秒后自动移除
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 30000);
    }
    
    /**
     * 激活恢复模式
     */
    activateRecoveryMode() {
        if (this.isActive) {
            console.log('⚠️ 紧急恢复已在进行中...');
            return;
        }
        
        this.isActive = true;
        this.recoveryAttempts++;
        
        console.log('🆘 激活紧急恢复模式');
        
        // 显示恢复界面
        this.showRecoveryInterface();
        
        // 开始恢复流程
        this.performRecovery();
    }
    
    /**
     * 显示恢复界面
     */
    showRecoveryInterface() {
        const modal = document.createElement('div');
        modal.id = 'emergency-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                text-align: center;
            ">
                <h2 style="color: #dc3545; margin-bottom: 20px;">🆘 紧急数据恢复</h2>
                <p style="margin-bottom: 20px;">正在尝试恢复您的数据...</p>
                <div id="recovery-status" style="margin-bottom: 20px; color: #007bff;">
                    🔄 检查恢复选项...
                </div>
                <button onclick="this.parentElement.parentElement.remove(); window.emergencyRecovery.isActive = false;" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    cursor: pointer;
                ">关闭</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * 执行恢复
     */
    async performRecovery() {
        const statusElement = document.getElementById('recovery-status');
        
        try {
            if (statusElement) {
                statusElement.innerHTML = '🔍 检查本地存储...';
            }
            
            // 尝试从各种源恢复数据
            const recovered = await this.tryMultipleRecoveryMethods();
            
            if (recovered) {
                if (statusElement) {
                    statusElement.innerHTML = '✅ 数据恢复成功！';
                    statusElement.style.color = '#28a745';
                }
                console.log('✅ 紧急恢复成功');
            } else {
                if (statusElement) {
                    statusElement.innerHTML = '⚠️ 未找到可恢复的数据，请手动配置同步';
                    statusElement.style.color = '#ffc107';
                }
                console.log('⚠️ 紧急恢复未找到数据');
            }
            
        } catch (error) {
            if (statusElement) {
                statusElement.innerHTML = '❌ 恢复过程出错，请手动配置';
                statusElement.style.color = '#dc3545';
            }
            console.error('❌ 紧急恢复失败:', error);
        }
        
        this.isActive = false;
    }
    
    /**
     * 尝试多种恢复方法
     */
    async tryMultipleRecoveryMethods() {
        // 方法1：检查 sessionStorage
        try {
            const sessionBackup = sessionStorage.getItem('emergency_backup');
            if (sessionBackup) {
                const data = JSON.parse(sessionBackup);
                this.restoreFromBackup(data);
                return true;
            }
        } catch (error) {
            console.warn('SessionStorage恢复失败:', error);
        }
        
        // 方法2：检查 URL 参数
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('github_owner') && urlParams.get('github_repo')) {
                const config = {
                    provider: 'github',
                    githubOwner: urlParams.get('github_owner'),
                    githubRepo: urlParams.get('github_repo'),
                    githubToken: urlParams.get('github_token') || ''
                };
                
                localStorage.setItem('sync_config', JSON.stringify(config));
                return true;
            }
        } catch (error) {
            console.warn('URL参数恢复失败:', error);
        }
        
        // 方法3：尝试默认 GitHub 配置
        try {
            const defaultConfig = {
                provider: 'github',
                githubOwner: 'henry-jin89',
                githubRepo: 'plan-web',
                githubToken: ''
            };
            
            // 测试是否可以访问
            const testUrl = `https://api.github.com/repos/${defaultConfig.githubOwner}/${defaultConfig.githubRepo}`;
            const response = await fetch(testUrl);
            
            if (response.ok) {
                localStorage.setItem('sync_config', JSON.stringify(defaultConfig));
                return true;
            }
        } catch (error) {
            console.warn('默认配置恢复失败:', error);
        }
        
        return false;
    }
    
    /**
     * 从备份恢复数据
     */
    restoreFromBackup(backup) {
        try {
            Object.keys(backup).forEach(key => {
                if (backup[key]) {
                    localStorage.setItem(key, backup[key]);
                }
            });
            
            console.log('✅ 从备份恢复数据成功');
        } catch (error) {
            console.error('❌ 从备份恢复数据失败:', error);
        }
    }
}

// 立即创建实例
try {
    if (!window.emergencyRecovery) {
        window.emergencyRecovery = new EmergencyRecoverySimple();
        console.log('✅ emergencyRecovery (简化版) 创建成功');
    }
} catch (error) {
    console.error('❌ emergencyRecovery (简化版) 创建失败:', error);
}

// 确保全局可用
window.EmergencyRecovery = EmergencyRecoverySimple;
