/**
 * 跨浏览器数据同步恢复脚本
 * 解决不同浏览器间数据不同步的问题
 * 即使没有本地同步配置也能从云端恢复数据
 */

(function() {
    'use strict';
    
    console.log('🌐 加载跨浏览器数据恢复脚本...');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCrossBrowserRecovery);
    } else {
        initCrossBrowserRecovery();
    }
    
    function initCrossBrowserRecovery() {
        console.log('🚀 开始跨浏览器数据恢复检测...');
        
        // 延迟执行，确保其他脚本已加载
        setTimeout(() => {
            try {
                checkAndRecoverData();
            } catch (error) {
                console.error('❌ 跨浏览器数据恢复失败:', error);
            }
        }, 2000);
    }
    
    async function checkAndRecoverData() {
        console.log('🔍 检查本地数据状态...');
        
        // 检查是否有本地数据
        const hasLocalData = checkLocalData();
        const hasSyncConfig = checkSyncConfig();
        
        console.log('📊 数据状态:', { hasLocalData, hasSyncConfig });
        
        if (!hasLocalData && !hasSyncConfig) {
            console.log('🌍 检测到新浏览器或清空状态，尝试云端数据恢复...');
            showCloudRecoveryOptions();
        } else if (!hasLocalData && hasSyncConfig) {
            console.log('⚡ 有同步配置但无本地数据，自动恢复...');
            await autoRecoverFromCloud();
        } else if (hasLocalData && !hasSyncConfig) {
            console.log('💾 有本地数据但无同步配置，提示设置同步...');
            showSyncSetupPrompt();
        } else {
            console.log('✅ 数据和配置都正常');
        }
    }
    
    function checkLocalData() {
        const dataKeys = [
            'gratitude_history',
            'planData_day',
            'planData_week', 
            'planData_month',
            'planData_quarter',
            'planData_halfyear',
            'planData_year'
        ];
        
        for (const key of dataKeys) {
            const data = localStorage.getItem(key);
            if (data && data !== '[]' && data !== '{}') {
                console.log(`✅ 发现本地数据: ${key}`);
                return true;
            }
        }
        
        console.log('📝 未发现本地数据');
        return false;
    }
    
    function checkSyncConfig() {
        const configKeys = ['sync_config', 'syncConfig'];
        
        for (const key of configKeys) {
            const config = localStorage.getItem(key);
            if (config) {
                try {
                    const parsed = JSON.parse(config);
                    if (parsed && parsed.enabled) {
                        console.log(`✅ 发现同步配置: ${key}`);
                        return true;
                    }
                } catch (e) {
                    // 忽略解析错误
                }
            }
        }
        
        console.log('⚠️ 未发现同步配置');
        return false;
    }
    
    function showCloudRecoveryOptions() {
        // 检查是否已经显示过
        if (document.getElementById('cross-browser-recovery')) {
            return;
        }
        
        const recoveryPanel = document.createElement('div');
        recoveryPanel.id = 'cross-browser-recovery';
        recoveryPanel.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        recoveryPanel.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3 style="margin: 0 0 10px 0;">🌐 检测到新浏览器环境</h3>
                <p style="margin: 0 0 15px 0;">您可能在其他浏览器中保存过数据。选择一种方式来恢复数据：</p>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="tryGitHubRecovery()" style="padding: 8px 16px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📱 从GitHub恢复
                    </button>
                    <button onclick="tryGoogleDriveRecovery()" style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ☁️ 从Google Drive恢复
                    </button>
                    <button onclick="setupNewSync()" style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ⚙️ 重新设置同步
                    </button>
                    <button onclick="closeRecoveryPanel()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ❌ 稍后处理
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(recoveryPanel);
        
        // 添加全局函数
        window.tryGitHubRecovery = tryGitHubRecovery;
        window.tryGoogleDriveRecovery = tryGoogleDriveRecovery;
        window.setupNewSync = setupNewSync;
        window.closeRecoveryPanel = closeRecoveryPanel;
        
        console.log('✅ 显示跨浏览器恢复选项');
    }
    
    async function tryGitHubRecovery() {
        const recoveryPanel = document.getElementById('cross-browser-recovery');
        if (recoveryPanel) {
            recoveryPanel.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto;">
                    <h3 style="margin: 0 0 15px 0;">📱 GitHub数据恢复</h3>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <input type="text" id="github-token" placeholder="GitHub Personal Access Token" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 4px;">
                        <input type="text" id="github-owner" placeholder="仓库所有者 (GitHub用户名)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 4px;">
                        <input type="text" id="github-repo" placeholder="仓库名称" style="width: 100%; padding: 8px; margin-bottom: 8px; border: none; border-radius: 4px;">
                        <input type="text" id="github-branch" placeholder="分支名称 (默认: main)" value="main" style="width: 100%; padding: 8px; border: none; border-radius: 4px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="github-recovery-btn" onclick="executeGitHubRecovery()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🔄 开始恢复
                        </button>
                        <button onclick="showCloudRecoveryOptions()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ← 返回
                        </button>
                    </div>
                    <div id="recovery-status" style="margin-top: 15px; font-size: 14px;"></div>
                </div>
            `;
        }
        
        window.executeGitHubRecovery = executeGitHubRecovery;
        window.showCloudRecoveryOptions = showCloudRecoveryOptions;
        
        // 备用事件绑定机制
        setTimeout(() => {
            const recoveryBtn = document.getElementById('github-recovery-btn');
            if (recoveryBtn) {
                recoveryBtn.addEventListener('click', function(e) {
                    console.log('🖱️ 通过备用事件处理器点击恢复按钮');
                    e.preventDefault();
                    executeGitHubRecovery();
                });
                console.log('✅ 备用事件绑定完成');
            }
        }, 100);
    }
    
    async function executeGitHubRecovery() {
        console.log('🔄 开始执行GitHub数据恢复...');
        
        const tokenEl = document.getElementById('github-token');
        const ownerEl = document.getElementById('github-owner');
        const repoEl = document.getElementById('github-repo');
        const branchEl = document.getElementById('github-branch');
        const statusDiv = document.getElementById('recovery-status');
        
        if (!statusDiv) {
            console.error('❌ 找不到状态显示元素');
            alert('页面元素异常，请刷新页面重试');
            return;
        }
        
        // 调试信息
        console.log('📋 输入框元素检查:', {
            tokenEl: !!tokenEl,
            ownerEl: !!ownerEl, 
            repoEl: !!repoEl,
            branchEl: !!branchEl
        });
        
        if (!tokenEl || !ownerEl || !repoEl || !branchEl) {
            statusDiv.innerHTML = '<span style="color: #f44336;">❌ 页面元素异常，请刷新页面重试</span>';
            console.error('❌ 输入框元素缺失');
            return;
        }
        
        const token = tokenEl.value.trim();
        const owner = ownerEl.value.trim();
        const repo = repoEl.value.trim();
        const branch = branchEl.value.trim() || 'main';
        
        // 调试信息
        console.log('📝 输入值检查:', {
            token: token ? `${token.substring(0,8)}...` : '空',
            owner: owner || '空',
            repo: repo || '空',
            branch: branch || '空'
        });
        
        if (!token || !owner || !repo) {
            statusDiv.innerHTML = '<span style="color: #ffeb3b;">⚠️ 请填写完整的GitHub信息</span>';
            console.warn('⚠️ GitHub信息不完整:', { token: !!token, owner: !!owner, repo: !!repo });
            return;
        }
        
        try {
            statusDiv.innerHTML = '<span style="color: #2196f3;">🔄 正在连接GitHub...</span>';
            
            // 创建GitHub同步配置
            const syncConfig = {
                enabled: true,
                provider: 'github',
                settings: { token, owner, repo, branch },
                lastSync: new Date().toISOString()
            };
            
            // 保存同步配置
            localStorage.setItem('sync_config', JSON.stringify(syncConfig));
            localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
            
            statusDiv.innerHTML = '<span style="color: #4caf50;">📝 同步配置已保存</span>';
            
            // 尝试下载数据
            statusDiv.innerHTML = '<span style="color: #2196f3;">☁️ 正在从GitHub下载数据...</span>';
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/plan-data.json?ref=${branch}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content);
                const cloudData = JSON.parse(content);
                
                // 恢复数据到localStorage
                let restoredCount = 0;
                for (const [key, value] of Object.entries(cloudData)) {
                    localStorage.setItem(key, JSON.stringify(value));
                    restoredCount++;
                }
                
                statusDiv.innerHTML = `<span style="color: #4caf50;">✅ 成功恢复 ${restoredCount} 项数据！页面即将刷新...</span>`;
                
                setTimeout(() => {
                    location.reload();
                }, 2000);
                
            } else if (response.status === 404) {
                statusDiv.innerHTML = '<span style="color: #ff9800;">📝 GitHub仓库中暂无数据，将启用同步功能</span>';
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                throw new Error(`GitHub API错误: ${response.status}`);
            }
            
        } catch (error) {
            console.error('GitHub恢复失败:', error);
            statusDiv.innerHTML = `<span style="color: #f44336;">❌ 恢复失败: ${error.message}</span>`;
        }
    }
    
    function tryGoogleDriveRecovery() {
        const recoveryPanel = document.getElementById('cross-browser-recovery');
        if (recoveryPanel) {
            recoveryPanel.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto;">
                    <h3 style="margin: 0 0 15px 0;">☁️ Google Drive数据恢复</h3>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p>Google Drive恢复需要OAuth授权，建议使用GitHub恢复方式。</p>
                        <p>如需使用Google Drive，请先到同步设置页面配置。</p>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="window.open('sync-settings.html', '_blank')" style="padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🔧 打开同步设置
                        </button>
                        <button onclick="showCloudRecoveryOptions()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ← 返回
                        </button>
                    </div>
                </div>
            `;
        }
        
        window.showCloudRecoveryOptions = showCloudRecoveryOptions;
    }
    
    function setupNewSync() {
        window.open('sync-settings.html', '_blank');
        closeRecoveryPanel();
    }
    
    function closeRecoveryPanel() {
        const panel = document.getElementById('cross-browser-recovery');
        if (panel) {
            panel.remove();
        }
    }
    
    async function autoRecoverFromCloud() {
        console.log('⚡ 自动从云端恢复数据...');
        
        try {
            // 检查同步服务是否可用
            if (window.syncService && typeof window.syncService.syncData === 'function') {
                console.log('🔄 通过syncService自动同步...');
                await window.syncService.syncData();
                console.log('✅ 自动同步完成');
                
                // 检查是否恢复了数据
                if (checkLocalData()) {
                    showSuccessMessage('✅ 数据已从云端自动恢复！');
                }
            } else {
                console.log('⚠️ syncService不可用，稍后重试');
                setTimeout(autoRecoverFromCloud, 3000);
            }
        } catch (error) {
            console.error('自动恢复失败:', error);
            showCloudRecoveryOptions();
        }
    }
    
    function showSyncSetupPrompt() {
        if (document.getElementById('sync-setup-prompt')) {
            return;
        }
        
        const prompt = document.createElement('div');
        prompt.id = 'sync-setup-prompt';
        prompt.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        prompt.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">💾 本地数据检测</h4>
            <p style="margin: 0 0 10px 0; font-size: 14px;">发现本地数据，建议设置云同步以保护数据安全。</p>
            <div style="display: flex; gap: 8px;">
                <button onclick="window.open('sync-settings.html', '_blank')" style="padding: 6px 12px; background: white; color: #ff9800; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    设置同步
                </button>
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 6px 12px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    稍后
                </button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // 10秒后自动移除
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
    }
    
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4caf50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10001;
            text-align: center;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
    
    // 导出函数供全局使用
    window.showCloudRecoveryOptions = showCloudRecoveryOptions;
    
})();
