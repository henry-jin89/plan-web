/**
 * 强制修复所有按钮功能
 * 此脚本会覆盖所有按钮的事件处理，确保它们能够正常工作
 */

(function() {
    'use strict';
    
    console.log('💪 [强制修复] 开始强制修复所有按钮功能...');
    
    // 延迟执行，确保DOM完全加载
    function forceFixButtons() {
        console.log('💪 [强制修复] DOM已加载，开始修复按钮...');
        
        // 1. 修复快速导航按钮
        const quickNavBtn = document.getElementById('quick-nav-btn');
        if (quickNavBtn) {
            console.log('✅ [强制修复] 找到快速导航按钮，添加事件');
            quickNavBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📅 快速导航按钮被点击');
                if (typeof showQuickNavigation === 'function') {
                    showQuickNavigation();
                } else {
                    alert('快速导航功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到快速导航按钮');
        }
        
        // 2. 修复专注模式按钮
        const focusModeBtn = document.getElementById('focus-mode-btn');
        if (focusModeBtn) {
            console.log('✅ [强制修复] 找到专注模式按钮，添加事件');
            focusModeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 专注模式按钮被点击');
                if (typeof toggleFocusMode === 'function') {
                    toggleFocusMode();
                } else if (typeof handleFocusMode === 'function') {
                    handleFocusMode();
                } else {
                    alert('专注模式功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到专注模式按钮');
        }
        
        // 3. 修复能量跟踪按钮
        const energyTrackerBtn = document.getElementById('energy-tracker-btn');
        if (energyTrackerBtn) {
            console.log('✅ [强制修复] 找到能量跟踪按钮，添加事件');
            energyTrackerBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚡ 能量跟踪按钮被点击');
                if (typeof showEnergyTracker === 'function') {
                    showEnergyTracker();
                } else if (typeof handleEnergyTracker === 'function') {
                    handleEnergyTracker();
                } else {
                    alert('能量跟踪功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到能量跟踪按钮');
        }
        
        // 4. 修复智能洞察按钮
        const smartInsightsBtn = document.getElementById('smart-insights-btn');
        if (smartInsightsBtn) {
            console.log('✅ [强制修复] 找到智能洞察按钮，添加事件');
            smartInsightsBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🧠 智能洞察按钮被点击');
                if (typeof handleSmartInsights === 'function') {
                    handleSmartInsights();
                } else if (typeof showSmartInsights === 'function') {
                    showSmartInsights();
                } else {
                    alert('智能洞察功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到智能洞察按钮');
        }
        
        // 5. 修复生产力分析按钮
        const productivityBtn = document.getElementById('productivity-analytics-btn');
        if (productivityBtn) {
            console.log('✅ [强制修复] 找到生产力分析按钮，添加事件');
            productivityBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📊 生产力分析按钮被点击');
                if (typeof handleProductivityAnalysis === 'function') {
                    handleProductivityAnalysis();
                } else if (typeof showProductivityAnalysis === 'function') {
                    showProductivityAnalysis();
                } else {
                    alert('生产力分析功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到生产力分析按钮');
        }
        
        // 6. 修复番茄钟按钮
        const pomodoroBtn = document.getElementById('priority-timer-btn');
        if (pomodoroBtn) {
            console.log('✅ [强制修复] 找到番茄钟按钮，添加事件');
            pomodoroBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⏰ 番茄钟按钮被点击');
                if (typeof handlePomodoroTimer === 'function') {
                    handlePomodoroTimer();
                } else {
                    alert('番茄钟功能正在加载中...');
                }
            };
        } else {
            console.warn('⚠️ [强制修复] 未找到番茄钟按钮');
        }
        
        // 7. 修复所有快捷插入按钮
        const quickInsertButtons = document.querySelectorAll('.quick-insert');
        console.log(`✅ [强制修复] 找到 ${quickInsertButtons.length} 个快捷插入按钮`);
        
        quickInsertButtons.forEach((btn, index) => {
            const targetId = btn.getAttribute('data-target');
            console.log(`  ${index + 1}. 快捷插入按钮 -> 目标: ${targetId}`);
            
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`📝 快捷插入按钮被点击 (目标: ${targetId})`);
                
                if (typeof showQuickInsertMenu === 'function') {
                    showQuickInsertMenu(this, targetId);
                } else {
                    // 如果函数未加载，提供简单的备用方案
                    alert(`快捷插入功能正在加载中...\n目标区域: ${targetId}`);
                }
            };
        });
        
        // 8. 修复AI建议按钮
        const aiSuggestBtn = document.getElementById('ai-suggest-priorities-btn');
        if (aiSuggestBtn) {
            console.log('✅ [强制修复] 找到AI建议按钮，添加事件');
            aiSuggestBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🤖 AI建议按钮被点击');
                if (typeof generatePrioritySuggestions === 'function') {
                    generatePrioritySuggestions();
                } else {
                    alert('AI建议功能正在加载中...');
                }
            };
        }
        
        // 9. 修复习惯分析按钮
        const habitAnalyticsBtn = document.getElementById('habit-analytics-btn');
        if (habitAnalyticsBtn) {
            console.log('✅ [强制修复] 找到习惯分析按钮，添加事件');
            habitAnalyticsBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📊 习惯分析按钮被点击');
                if (typeof handleHabitAnalytics === 'function') {
                    handleHabitAnalytics();
                } else if (typeof showHabitAnalytics === 'function') {
                    showHabitAnalytics();
                } else {
                    alert('习惯分析功能正在加载中...');
                }
            };
        }
        
        // 10. 修复智能提醒按钮
        const habitReminderBtn = document.getElementById('habit-reminder-btn');
        if (habitReminderBtn) {
            console.log('✅ [强制修复] 找到智能提醒按钮，添加事件');
            habitReminderBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔔 智能提醒按钮被点击');
                if (typeof handleHabitReminder === 'function') {
                    handleHabitReminder();
                } else if (typeof showHabitReminder === 'function') {
                    showHabitReminder();
                } else {
                    alert('智能提醒功能正在加载中...');
                }
            };
        }
        
        // 11. 修复智能分类按钮
        const autoCategorizeBtn = document.getElementById('auto-categorize-btn');
        if (autoCategorizeBtn) {
            console.log('✅ [强制修复] 找到智能分类按钮，添加事件');
            autoCategorizeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏷️ 智能分类按钮被点击');
                if (typeof handleAutoCategorize === 'function') {
                    handleAutoCategorize();
                } else if (typeof showAutoCategorize === 'function') {
                    showAutoCategorize();
                } else {
                    alert('智能分类功能正在加载中...');
                }
            };
        }
        
        // 12. 修复难度评估按钮
        const difficultyEstimatorBtn = document.getElementById('difficulty-estimator-btn');
        if (difficultyEstimatorBtn) {
            console.log('✅ [强制修复] 找到难度评估按钮，添加事件');
            difficultyEstimatorBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 难度评估按钮被点击');
                if (typeof showDifficultyEstimator === 'function') {
                    showDifficultyEstimator();
                } else {
                    alert('难度评估功能正在加载中...');
                }
            };
        }
        
        // 13. 修复优先级分析按钮
        const priorityAnalyticsBtn = document.getElementById('priority-analytics-btn');
        if (priorityAnalyticsBtn) {
            console.log('✅ [强制修复] 找到优先级分析按钮，添加事件');
            priorityAnalyticsBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📊 优先级分析按钮被点击');
                if (typeof handlePriorityAnalytics === 'function') {
                    handlePriorityAnalytics();
                } else if (typeof showPriorityAnalytics === 'function') {
                    showPriorityAnalytics();
                } else {
                    alert('优先级分析功能正在加载中...');
                }
            };
        }
        
        // 14. 修复时间块相关按钮
        const timeblockTemplatesBtn = document.getElementById('timeblock-templates');
        if (timeblockTemplatesBtn) {
            console.log('✅ [强制修复] 找到时间块模板按钮，添加事件');
            timeblockTemplatesBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🧠 时间块模板按钮被点击');
                if (typeof showTimeblockTemplates === 'function') {
                    showTimeblockTemplates();
                } else {
                    alert('时间块模板功能正在加载中...');
                }
            };
        }
        
        const timeblockSuggestBtn = document.getElementById('timeblock-suggest');
        if (timeblockSuggestBtn) {
            console.log('✅ [强制修复] 找到时间块建议按钮，添加事件');
            timeblockSuggestBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('💡 时间块建议按钮被点击');
                if (typeof suggestTimeblocks === 'function') {
                    suggestTimeblocks();
                } else {
                    alert('时间块建议功能正在加载中...');
                }
            };
        }
        
        const timeblockCheckBtn = document.getElementById('timeblock-check');
        if (timeblockCheckBtn) {
            console.log('✅ [强制修复] 找到时间块冲突检测按钮，添加事件');
            timeblockCheckBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚠️ 时间块冲突检测按钮被点击');
                if (typeof checkTimeblockConflicts === 'function') {
                    checkTimeblockConflicts();
                } else {
                    alert('时间块冲突检测功能正在加载中...');
                }
            };
        }
        
        const energyOptimizationBtn = document.getElementById('energy-optimization-btn');
        if (energyOptimizationBtn) {
            console.log('✅ [强制修复] 找到能量优化按钮，添加事件');
            energyOptimizationBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚡ 能量优化按钮被点击');
                if (typeof showEnergyOptimization === 'function') {
                    showEnergyOptimization();
                } else {
                    alert('能量优化功能正在加载中...');
                }
            };
        }
        
        const breakSchedulerBtn = document.getElementById('break-scheduler-btn');
        if (breakSchedulerBtn) {
            console.log('✅ [强制修复] 找到休息安排按钮，添加事件');
            breakSchedulerBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🧘 休息安排按钮被点击');
                if (typeof showBreakScheduler === 'function') {
                    showBreakScheduler();
                } else {
                    alert('休息安排功能正在加载中...');
                }
            };
        }
        
        // 9. 修复保存按钮
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            console.log('✅ [强制修复] 找到保存按钮，添加事件');
            // 保存按钮可能已经有事件，不覆盖，只是确保它存在
            if (!saveBtn.onclick && !saveBtn.getAttribute('data-listener')) {
                saveBtn.onclick = function(e) {
                    console.log('💾 保存按钮被点击');
                    if (typeof saveDayPlan === 'function') {
                        saveDayPlan();
                    } else {
                        alert('保存功能正在加载中...');
                    }
                };
            }
        }
        
        // 10. 修复历史记录按钮
        const historyBtn = document.querySelector('.save-view-btn');
        if (historyBtn) {
            console.log('✅ [强制修复] 找到历史记录按钮，添加事件');
            if (!historyBtn.onclick && !historyBtn.getAttribute('data-listener')) {
                historyBtn.onclick = function(e) {
                    console.log('📚 历史记录按钮被点击');
                    if (typeof showDayHistory === 'function') {
                        showDayHistory();
                    } else {
                        alert('历史记录功能正在加载中...');
                    }
                };
            }
        }
        
        console.log('💪 [强制修复] 所有按钮修复完成！');
        console.log('💡 [提示] 现在可以点击任意按钮测试功能');
    }
    
    // 多次尝试修复，确保成功
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceFixButtons);
    } else {
        forceFixButtons();
    }
    
    // 额外的延迟修复，以防其他脚本覆盖了事件
    setTimeout(forceFixButtons, 1000);
    setTimeout(forceFixButtons, 2000);
    setTimeout(forceFixButtons, 3000);
    
    console.log('✅ [强制修复] 按钮强制修复脚本已加载');
})();

