/**
 * AI分析功能通用修复脚本
 * 确保所有页面的 startAIAnalysis 函数都能正常工作
 * 注意：此脚本不会干扰其他页面功能
 */

(function() {
    'use strict';
    
    console.log('🔧 [AI-FIX] 加载AI分析功能修复脚本...');
    console.log('🔧 [AI-FIX] 注意：此脚本仅处理AI分析功能，不影响其他按钮');
    
    // 强制定义全局函数（立即执行，不等待DOM）
    console.log('✅ [AI-FIX] 定义全局 startAIAnalysis 函数');
    
    // 只定义AI分析函数，不干扰其他事件
    window.startAIAnalysis = async function() {
        console.log('🚀 [AI-FIX] startAIAnalysis 函数被调用');
        
        // 检查 AI 助手是否已加载
        if (typeof geminiAssistant === 'undefined') {
            console.error('❌ [AI-FIX] geminiAssistant 未加载');
            alert('AI 助手正在加载中，请稍后再试...\n\n提示：请刷新页面重试');
            return;
        }
        
        console.log('✅ [AI-FIX] geminiAssistant 已加载，开始分析');
        
        // 创建加载提示
        const loadingModal = document.createElement('div');
        loadingModal.id = 'ai-suggestion-modal';
        loadingModal.innerHTML = `
            <div class="ai-modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="ai-modal-content" style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div class="ai-modal-header" style="text-align: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; color: #333; font-size: 1.5em;">🤖 AI 智能分析中...</h2>
                    </div>
                    <div class="ai-modal-body">
                        <div class="ai-loading" style="text-align: center;">
                            <div class="ai-loading-spinner" style="margin: 0 auto 20px; width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <div class="ai-loading-text" style="color: #666; font-size: 1.1em; margin-bottom: 10px;">正在收集您的计划数据...</div>
                            <div class="ai-loading-text" style="color: #999; font-size: 0.9em;">这可能需要10-20秒，请耐心等待</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // 执行 AI 分析
            console.log('📊 [AI-FIX] 开始执行AI分析...');
            const result = await geminiAssistant.analyzeAndSuggest();
            console.log('📊 [AI-FIX] AI分析结果:', result);
            
            // 移除加载提示
            loadingModal.remove();
            
            if (result.success) {
                console.log('✅ [AI-FIX] AI分析成功，显示结果');
                // 显示结果
                geminiAssistant.showSuggestionModal(result);
            } else {
                console.error('❌ [AI-FIX] AI分析失败:', result.error);
                // 显示错误
                alert(result.message || `分析失败: ${result.error}\n\n请确保您已经在计划页面中添加了一些内容。`);
            }
        } catch (error) {
            console.error('❌ [AI-FIX] AI 分析出错:', error);
            loadingModal.remove();
            alert('AI 分析过程中出现错误，请稍后再试。\n\n错误信息: ' + error.message);
        }
    };
    
    console.log('✅ [AI-FIX] startAIAnalysis 函数已定义完成');
    console.log('✅ [AI-FIX] 函数类型检查:', typeof window.startAIAnalysis);
    
    // 等待DOM加载完成后再次检查
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIFix);
    } else {
        initAIFix();
    }
    
    function initAIFix() {
        console.log('✅ [AI-FIX] DOM加载完成，再次确认函数');
        
        // 再次确认函数存在
        if (typeof window.startAIAnalysis === 'function') {
            console.log('✅ [AI-FIX] startAIAnalysis 函数确认存在');
        } else {
            console.error('❌ [AI-FIX] startAIAnalysis 函数定义失败！');
        }
        
        console.log('✅ [AI-FIX] AI分析功能修复完成');
        console.log('📊 [AI-FIX] 最终检查 - typeof startAIAnalysis:', typeof window.startAIAnalysis);
    }
})();

