/**
 * 通用按钮修复脚本
 * 适用于所有计划页面：日、周、月、季度、半年、年计划
 */

(function() {
    'use strict';
    
    console.log('🔧 [通用修复] 通用按钮修复脚本已加载');
    
    // 等待页面完全加载后执行
    function universalButtonFix() {
        console.log('🔧 [通用修复] 开始修复按钮...');
        
        let fixCount = 0;
        
        // 1. 修复快速导航按钮（如果存在）
        const quickNavBtn = document.getElementById('quick-nav-btn');
        if (quickNavBtn && !quickNavBtn.getAttribute('data-fixed')) {
            quickNavBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('📅 [通用修复] 快速导航按钮被点击');
                if (typeof showQuickNavigation === 'function') {
                    showQuickNavigation();
                } else {
                    console.warn('showQuickNavigation 函数未定义');
                }
            };
            quickNavBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 快速导航按钮已修复');
        }
        
        // 2. 修复专注模式按钮
        const focusModeBtn = document.getElementById('focus-mode-btn');
        if (focusModeBtn && !focusModeBtn.getAttribute('data-fixed')) {
            focusModeBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('🎯 [通用修复] 专注模式按钮被点击');
                if (typeof toggleFocusMode === 'function') {
                    toggleFocusMode();
                } else if (typeof handleFocusMode === 'function') {
                    handleFocusMode();
                } else {
                    console.warn('专注模式函数未定义');
                }
            };
            focusModeBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 专注模式按钮已修复');
        }
        
        // 3. 修复能量跟踪按钮
        const energyTrackerBtn = document.getElementById('energy-tracker-btn');
        if (energyTrackerBtn && !energyTrackerBtn.getAttribute('data-fixed')) {
            energyTrackerBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('⚡ [通用修复] 能量跟踪按钮被点击');
                if (typeof showEnergyTracker === 'function') {
                    showEnergyTracker();
                } else if (typeof handleEnergyTracker === 'function') {
                    handleEnergyTracker();
                } else {
                    console.warn('能量跟踪函数未定义');
                }
            };
            energyTrackerBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 能量跟踪按钮已修复');
        }
        
        // 4. 修复智能洞察按钮
        const smartInsightsBtn = document.getElementById('smart-insights-btn');
        if (smartInsightsBtn && !smartInsightsBtn.getAttribute('data-fixed')) {
            smartInsightsBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('🧠 [通用修复] 智能洞察按钮被点击');
                if (typeof handleSmartInsights === 'function') {
                    handleSmartInsights();
                } else if (typeof showSmartInsights === 'function') {
                    showSmartInsights();
                } else {
                    console.warn('智能洞察函数未定义');
                }
            };
            smartInsightsBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 智能洞察按钮已修复');
        }
        
        // 5. 修复生产力分析按钮
        const productivityBtn = document.getElementById('productivity-analytics-btn');
        if (productivityBtn && !productivityBtn.getAttribute('data-fixed')) {
            productivityBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('📊 [通用修复] 生产力分析按钮被点击');
                if (typeof handleProductivityAnalysis === 'function') {
                    handleProductivityAnalysis();
                } else if (typeof showProductivityAnalysis === 'function') {
                    showProductivityAnalysis();
                } else {
                    console.warn('生产力分析函数未定义');
                }
            };
            productivityBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 生产力分析按钮已修复');
        }
        
        // 6. 修复番茄钟按钮
        const pomodoroBtn = document.getElementById('priority-timer-btn');
        if (pomodoroBtn && !pomodoroBtn.getAttribute('data-fixed')) {
            pomodoroBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('⏰ [通用修复] 番茄钟按钮被点击');
                if (typeof handlePomodoroTimer === 'function') {
                    handlePomodoroTimer();
                } else {
                    console.warn('番茄钟函数未定义');
                }
            };
            pomodoroBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] 番茄钟按钮已修复');
        }
        
        // 7. 修复所有快捷插入按钮
        const quickInsertButtons = document.querySelectorAll('.quick-insert');
        if (quickInsertButtons.length > 0) {
            console.log(`🔧 [通用修复] 找到 ${quickInsertButtons.length} 个快捷插入按钮`);
            
            quickInsertButtons.forEach((btn, index) => {
                if (btn.getAttribute('data-fixed')) return;
                
                const targetId = btn.getAttribute('data-target');
                
                btn.onclick = function(e) {
                    e && e.preventDefault && e.preventDefault();
                    e && e.stopPropagation && e.stopPropagation();
                    console.log(`📝 [通用修复] 快捷插入按钮被点击 (目标: ${targetId})`);
                    
                    if (typeof showQuickInsertMenu === 'function') {
                        showQuickInsertMenu(this, targetId);
                    } else {
                        console.warn('showQuickInsertMenu 函数未定义');
                        // 简单的备用方案
                        alert(`快捷插入功能\n目标: ${targetId}`);
                    }
                };
                
                btn.setAttribute('data-fixed', 'true');
                fixCount++;
            });
            
            console.log(`✅ [通用修复] ${quickInsertButtons.length} 个快捷插入按钮已修复`);
        }
        
        // 8. 修复AI建议按钮
        const aiSuggestBtn = document.getElementById('ai-suggest-priorities-btn');
        if (aiSuggestBtn && !aiSuggestBtn.getAttribute('data-fixed')) {
            aiSuggestBtn.onclick = function(e) {
                e && e.preventDefault && e.preventDefault();
                e && e.stopPropagation && e.stopPropagation();
                console.log('🤖 [通用修复] AI建议按钮被点击');
                if (typeof generatePrioritySuggestions === 'function') {
                    generatePrioritySuggestions();
                } else {
                    console.warn('AI建议函数未定义');
                }
            };
            aiSuggestBtn.setAttribute('data-fixed', 'true');
            fixCount++;
            console.log('✅ [通用修复] AI建议按钮已修复');
        }
        
        console.log(`✅ [通用修复] 按钮修复完成！共修复 ${fixCount} 个按钮`);
        
        // 返回修复数量
        return fixCount;
    }
    
    // 在不同时机尝试修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🔧 [通用修复] DOM加载完成，执行修复...');
            universalButtonFix();
        });
    } else {
        // DOM已经加载，立即执行
        universalButtonFix();
    }
    
    // 延迟修复，以防其他脚本覆盖
    setTimeout(function() {
        console.log('🔧 [通用修复] 延迟修复（1秒）...');
        universalButtonFix();
    }, 1000);
    
    setTimeout(function() {
        console.log('🔧 [通用修复] 延迟修复（3秒）...');
        const count = universalButtonFix();
        if (count > 0) {
            console.log('💡 [通用修复] 按钮已准备就绪，现在可以点击测试！');
        }
    }, 3000);
    
    console.log('✅ [通用修复] 通用按钮修复脚本初始化完成');
})();

