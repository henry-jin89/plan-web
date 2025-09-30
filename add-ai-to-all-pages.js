/**
 * 为所有页面添加 AI 助手功能的通用脚本
 * 自动在页面中添加悬浮 AI 按钮
 */

(function() {
    'use strict';
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIAssistant);
    } else {
        initAIAssistant();
    }
    
    function initAIAssistant() {
        // 检查是否已经有 AI 按钮
        if (document.querySelector('.ai-assistant-btn')) {
            console.log('✅ AI 助手按钮已存在');
            return;
        }
        
        // 检查是否在主页（主页已经有按钮）
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            console.log('✅ 主页已有 AI 助手');
            return;
        }
        
        // 添加悬浮按钮
        addFloatingButton();
        
        console.log('✅ AI 助手已添加到当前页面');
    }
    
    function addFloatingButton() {
        // 创建悬浮按钮
        const btn = document.createElement('button');
        btn.className = 'ai-assistant-btn';
        btn.innerHTML = '🤖';
        btn.title = 'AI 智能分析';
        btn.onclick = startAIAnalysis;
        
        // 添加到页面
        document.body.appendChild(btn);
    }
    
    // AI 分析功能
    window.startAIAnalysis = async function() {
        const btn = document.querySelector('.ai-assistant-btn');
        
        // 检查 AI 助手是否已加载
        if (typeof geminiAssistant === 'undefined') {
            alert('AI 助手正在加载中，请稍后再试...');
            return;
        }
        
        // 显示加载状态
        if (btn) {
            btn.classList.add('analyzing');
            btn.innerHTML = '⏳';
        }
        
        // 创建加载提示
        const loadingModal = document.createElement('div');
        loadingModal.id = 'ai-suggestion-modal';
        loadingModal.innerHTML = `
            <div class="ai-modal-overlay">
                <div class="ai-modal-content">
                    <div class="ai-modal-header">
                        <h2>🤖 AI 智能分析中...</h2>
                    </div>
                    <div class="ai-modal-body">
                        <div class="ai-loading">
                            <div class="ai-loading-spinner"></div>
                            <div class="ai-loading-text">正在收集您的计划数据...</div>
                            <div class="ai-loading-text" style="margin-top: 10px; font-size: 0.9em; color: #999;">
                                这可能需要10-20秒，请耐心等待
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // 执行 AI 分析
            const result = await geminiAssistant.analyzeAndSuggest();
            
            // 移除加载提示
            loadingModal.remove();
            
            if (result.success) {
                // 显示结果
                geminiAssistant.showSuggestionModal(result);
            } else {
                // 显示错误
                alert(result.message || `分析失败: ${result.error}\n\n请确保您已经在计划页面中添加了一些内容。`);
            }
        } catch (error) {
            console.error('AI 分析出错:', error);
            loadingModal.remove();
            alert('AI 分析过程中出现错误，请稍后再试。');
        } finally {
            // 恢复按钮状态
            if (btn) {
                btn.classList.remove('analyzing');
                btn.innerHTML = '🤖';
            }
        }
    };
    
})();
