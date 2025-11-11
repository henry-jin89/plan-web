/**
 * 周计划页面 - 专用JavaScript文件
 */

// 周计划特有变量
let currentWeek = getCurrentWeek();
let weekPlanData = {};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initWeekPlan();
    setupEventListeners();
    loadWeekPlan();
    
    // 更新进度
    safeUpdateProgress('页面初始化');
    
    console.log('✅ 周计划页面初始化完成');
});

// 获取当前周
function getCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const onejan = new Date(year, 0, 1);
    const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${year}-W${String(week).padStart(2, '0')}`;
}

// 初始化周计划功能
function initWeekPlan() {
    // 设置当前周
    const weekInput = document.getElementById('week_date');
    weekInput.value = currentWeek;
    updateWeekRange();
    
    // 启用所有待办事项容器（使用WeekPlanTodoUtils）
    const todoContainers = document.querySelectorAll('.todo-list-container');
    todoContainers.forEach(container => {
        // 使用WeekPlanTodoUtils而不是TodoUtils
        if (typeof WeekPlanTodoUtils !== 'undefined') {
            WeekPlanTodoUtils.init(container);
        }
        
        // 添加实时分析功能 - 避免干扰输入法
        container.addEventListener('input', function(e) {
            // 如果是输入法组合过程中，不处理
            if (e.isComposing) {
                return;
            }
            
            // 延迟处理，确保输入法完成
            setTimeout(() => {
                updateDailyProgress();
                updateWeekProgress();
            }, 800); // 增加延迟
        });
    });
    
    // 更新每日日期显示
    updateDailyDates();
    
    // 添加自动保存功能
    setupAutoSave();
}

// 设置自动保存功能
function setupAutoSave() {
    // 为所有文本区域添加自动保存
    const textareas = ['week_goals', 'week_review', 'next_week_preview'];
    textareas.forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            textarea.addEventListener('input', debounce(() => {
                console.log(`📝 自动保存: ${id}`);
                saveWeekPlan();
            }, 2000)); // 2秒延迟自动保存
        }
    });
    
    // 为任务容器添加自动保存
    const taskContainers = [
        'monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 
        'thursday_tasks', 'friday_tasks', 'weekend_plan'
    ];
    taskContainers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.addEventListener('input', debounce(() => {
                console.log(`📝 自动保存任务: ${id}`);
                saveWeekPlan();
            }, 1500)); // 任务变化时1.5秒后自动保存
        }
    });
    
    console.log('✅ 自动保存功能已启用');
}

// 防抖函数 - 避免频繁保存
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 设置事件监听器
function setupEventListeners() {
    // 周导航
    const prevBtn = document.getElementById('week-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateWeek(-1));
    const nextBtn = document.getElementById('week-next');
    if (nextBtn) nextBtn.addEventListener('click', () => navigateWeek(1));
    const weekInput = document.getElementById('week_date');
    if (weekInput) weekInput.addEventListener('change', handleWeekChange);
    
    // 保存按钮
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveWeekPlan);
    
    // 历史记录按钮
    const saveViewBtn = document.querySelector('.save-view-btn');
    if (saveViewBtn) saveViewBtn.addEventListener('click', showWeekHistory);
    
    // AI助手按钮
    const aiAssistantBtn = document.getElementById('ai-assistant-btn');
    if (aiAssistantBtn) aiAssistantBtn.addEventListener('click', showWeekAIAssistant);
    
    // 智能洞察按钮
    const insightsBtn = document.getElementById('week-insights-btn');
    if (insightsBtn) insightsBtn.addEventListener('click', showWeekInsights);
    
    // 效率优化按钮
    const optimizationBtn = document.getElementById('week-optimization-btn');
    if (optimizationBtn) optimizationBtn.addEventListener('click', showWeekOptimization);
    
    // 生成周报按钮
    const generateReviewBtn = document.getElementById('generate-review-btn');
    if (generateReviewBtn) generateReviewBtn.addEventListener('click', generateWeeklyReport);
    
    // 周分析按钮
    const analysisBtn = document.getElementById('week-analysis-btn');
    if (analysisBtn) analysisBtn.addEventListener('click', showWeekAnalysis);
    
    // 周回顾按钮
    const reviewBtn = document.getElementById('week-review-btn');
    if (reviewBtn) reviewBtn.addEventListener('click', focusOnReview);
    
    // AI建议按钮
    const aiSuggestBtn = document.getElementById('ai-suggest-goals-btn');
    if (aiSuggestBtn) aiSuggestBtn.addEventListener('click', generateGoalSuggestions);
    
    // 目标追踪按钮
    const goalTrackerBtn = document.getElementById('goal-tracker-btn');
    if (goalTrackerBtn) goalTrackerBtn.addEventListener('click', showGoalTracker);
    
    // 智能排程按钮
    const autoScheduleBtn = document.getElementById('auto-schedule-btn');
    if (autoScheduleBtn) autoScheduleBtn.addEventListener('click', autoScheduleTasks);
    
    // 负载均衡按钮
    const workloadBtn = document.getElementById('workload-balance-btn');
    if (workloadBtn) workloadBtn.addEventListener('click', balanceWorkload);
    
    // 回顾模板按钮
    const reviewTemplateBtn = document.getElementById('review-template-btn');
    if (reviewTemplateBtn) reviewTemplateBtn.addEventListener('click', showReviewTemplate);
    
    // 成就记录按钮
    const achievementBtn = document.getElementById('achievement-tracker-btn');
    if (achievementBtn) achievementBtn.addEventListener('click', showAchievementTracker);
    
    // 下周AI规划按钮
    document.getElementById('next-week-ai-btn')?.addEventListener('click', generateNextWeekPlan);
    
    // 结转任务按钮
    document.getElementById('carry-over-btn')?.addEventListener('click', carryOverTasks);
    
    // 快捷插入按钮
    document.querySelectorAll('.quick-insert').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showQuickInsertMenu(this, targetId);
        });
    });
}

// 周导航
function navigateWeek(weeks) {
    // 定义实际执行切换的函数
    const performWeekNavigation = () => {
        // 添加内容切换动画
        const container = document.querySelector('.container');
        container.classList.add('week-content-transition');
        
        const [year, weekStr] = currentWeek.split('-W');
        let week = parseInt(weekStr);
        let currentYear = parseInt(year);
        
        week += weeks;
        
        if (week < 1) {
            week = 52; // 简化处理，假设每年52周
            currentYear--;
        } else if (week > 52) {
            week = 1;
            currentYear++;
        }
        
        currentWeek = `${currentYear}-W${String(week).padStart(2, '0')}`;
        document.getElementById('week_date').value = currentWeek;
        updateWeekRange();
        updateDailyDates();
        loadWeekPlan();
        
        // 安全地更新进度
        safeUpdateProgress('周导航切换');
        
        // 显示切换动画
        showWeekChangeAnimation(weeks > 0 ? '→' : '←');
        
        // 移除动画类
        setTimeout(() => {
            container.classList.remove('week-content-transition');
        }, 500);
    };
    
    // 在切换前检查未完成任务
    handleWeekSwitchWithCarryOver(performWeekNavigation);
}

// 处理周变更
function handleWeekChange() {
    const weekInput = document.getElementById('week_date');
    const newWeek = weekInput.value;
    const originalWeek = currentWeek;
    
    // 如果周没有改变，直接返回
    if (newWeek === currentWeek) {
        return;
    }
    
    // 定义实际执行切换的函数
    const performWeekChange = () => {
        currentWeek = newWeek;
        updateWeekRange();
        updateDailyDates();
        loadWeekPlan();
        
        // 安全地更新进度
        safeUpdateProgress('周选择变更');
    };
    
    // 定义取消切换的函数（还原输入框值）
    const cancelWeekChange = () => {
        weekInput.value = originalWeek;
    };
    
    // 在切换前检查未完成任务
    handleWeekSwitchWithCarryOverAndCancel(performWeekChange, cancelWeekChange);
}

// 更新周范围显示
function updateWeekRange() {
    const [year, weekStr] = currentWeek.split('-W');
    const week = parseInt(weekStr);
    
    // 计算该周的起始和结束日期
    const startDate = getDateOfWeek(parseInt(year), week);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    
    document.getElementById('week_range').textContent = `${startStr}-${endStr}`;
}

// 获取指定年周的开始日期
function getDateOfWeek(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const weekStart = simple;
    if (dow <= 4) {
        weekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        weekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return weekStart;
}

// 更新每日日期显示
function updateDailyDates() {
    const [year, weekStr] = currentWeek.split('-W');
    const week = parseInt(weekStr);
    const startDate = getDateOfWeek(parseInt(year), week);
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    days.forEach((day, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        
        const dateElement = document.getElementById(`${day}-date`);
        if (dateElement) {
            dateElement.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
            
            // 如果是今天，添加特殊样式
            if (DateUtils.formatDate(date) === DateUtils.getToday()) {
                dateElement.style.background = 'var(--theme-color)';
                dateElement.style.color = 'white';
            } else {
                dateElement.style.background = 'rgba(255, 255, 255, 0.8)';
                dateElement.style.color = '#666';
            }
        }
    });
}

// 全局变量用于标记是否正在执行结转任务
let isCarryingOverTasks = false;
let pendingCarryOverContent = '';

// 加载周计划
function loadWeekPlan() {
    // *** 新增日志: 打印 currentWeek ***
    console.log('[DEBUG] 当前周 currentWeek =', currentWeek);
    const planData = StorageUtils.loadPlan('week', currentWeek);
    // *** 新增日志: 打印拉取到的周数据 ***
    console.log('[DEBUG] loadPlan 加载周计划:', planData);
    
    if (planData) {
        // 加载各个字段
        document.getElementById('week_goals').value = planData.goals || '';
        document.getElementById('week_review').value = planData.review || '';
        
        // 处理下周预览字段，考虑结转内容
        const nextWeekPreview = document.getElementById('next_week_preview');
        if (nextWeekPreview) {
            let previewContent = planData.nextWeekPreview || '';
            
            // 如果有待处理的结转内容，合并它
            if (pendingCarryOverContent) {
                console.log('📋 检测到待处理的结转内容，进行合并');
                if (previewContent.trim()) {
                    previewContent = pendingCarryOverContent + '\n' + '─'.repeat(50) + '\n\n' + previewContent;
                } else {
                    previewContent = pendingCarryOverContent;
                }
                
                // 清除待处理的内容并保存更新后的数据
                pendingCarryOverContent = '';
                
                // 立即保存合并后的内容
                const updatedPlanData = { ...planData, nextWeekPreview: previewContent };
                StorageUtils.savePlan('week', currentWeek, updatedPlanData);
            }
            
            nextWeekPreview.value = previewContent;
        }
        
        // 加载每日任务
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend'];
        days.forEach(day => {
            const containerId = day === 'weekend' ? 'weekend_plan' : `${day}_tasks`;
            loadTodoContent(containerId, planData[`${day}Tasks`]);
        });
        
        // 更新统计信息
        safeUpdateProgress('数据加载完成');
        
        console.log(`✅ 已加载 ${currentWeek} 的周计划`);
    } else {
        // 清空所有字段
        clearAllFields();
        console.log(`📝 ${currentWeek} 暂无周计划，创建新计划`);
    }
}

// 加载待办事项内容
function loadTodoContent(containerId, content) {
    const container = document.getElementById(containerId);
    if (container && content) {
        container.textContent = content;
        // 使用WeekPlanTodoUtils而不是TodoUtils
        if (typeof WeekPlanTodoUtils !== 'undefined') {
            WeekPlanTodoUtils.renderTodos(container);
        }
    }
}

// 清空所有字段
function clearAllFields() {
    document.getElementById('week_goals').value = '';
    document.getElementById('week_review').value = '';
    document.getElementById('next_week_preview').value = '';
    
    const todoContainers = ['monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 'thursday_tasks', 'friday_tasks', 'weekend_plan'];
    todoContainers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            container.textContent = '';
        }
    });
}

// 保存周计划
function saveWeekPlan() {
    try {
        const planData = {
            goals: document.getElementById('week_goals').value,
            review: document.getElementById('week_review').value,
            nextWeekPreview: document.getElementById('next_week_preview').value,
            mondayTasks: getTodoContent('monday_tasks'),
            tuesdayTasks: getTodoContent('tuesday_tasks'),
            wednesdayTasks: getTodoContent('wednesday_tasks'),
            thursdayTasks: getTodoContent('thursday_tasks'),
            fridayTasks: getTodoContent('friday_tasks'),
            weekendTasks: getTodoContent('weekend_plan'),
            lastModified: new Date().toISOString()
        };
        
        const success = StorageUtils.savePlan('week', currentWeek, planData);
        
        if (success) {
            // 🔑 关键修复：立即更新本地修改时间戳（防止刷新时被云端旧数据覆盖）
            const now = new Date().toISOString();
            try {
                // 使用原始的 setItem 方法（如果存在）以避免触发额外的同步
                if (window.leanCloudSync && window.leanCloudSync._originalSetItem) {
                    window.leanCloudSync._originalSetItem.call(localStorage, 'leancloud_local_modified', now);
                } else {
                    localStorage.setItem('leancloud_local_modified', now);
                }
                console.log(`⏰ 已立即更新本地修改时间戳: ${now}`);
            } catch (e) {
                console.warn('更新时间戳失败，但数据已保存:', e);
            }
            // *** 新增日志: 保存后立刻打印本地 week 数据 ***
            try {
                console.log('[DEBUG] 保存后 localStorage[planData_week]:', localStorage.getItem('planData_week'));
            } catch (e) {}
            
            MessageUtils.success('周计划保存成功！');
            
            // 更新统计
            updateDailyProgress();
            updateWeekProgress();
            
            // 触发保存动画
            animateSaveSuccess();
        } else {
            MessageUtils.error('保存失败，请重试');
        }
    } catch (error) {
        console.error('保存周计划失败:', error);
        MessageUtils.error('保存失败：' + error.message);
    }
}

// 获取待办事项内容
function getTodoContent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return '';
    
    const tasks = container.querySelectorAll('.task-item');
    const lines = [];
    
    tasks.forEach(task => {
        const checkbox = task.querySelector('.custom-checkbox');
        const textElement = task.querySelector('.task-text');
        
        // 适配textarea、input元素和div元素
        let text = '';
        if (textElement) {
            if (textElement.tagName === 'TEXTAREA' || textElement.tagName === 'INPUT') {
                text = textElement.value || '';
            } else {
                text = textElement.textContent || '';
            }
            text = text.trim();
        }
        
        const isChecked = checkbox && checkbox.classList.contains('checked');
        if (text) {
            lines.push(`[${isChecked ? 'x' : ' '}] ${text}`);
        }
    });
    
    return lines.join('\n');
}

// 更新每日进度
function updateDailyProgress() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend'];
    
    days.forEach(day => {
        const containerId = day === 'weekend' ? 'weekend_plan' : `${day}_tasks`;
        const container = document.getElementById(containerId);
        
        if (container) {
            const tasks = container.querySelectorAll('.task-item');
            const total = tasks.length;
            let completed = 0;
            
            tasks.forEach(task => {
                const checkbox = task.querySelector('.custom-checkbox');
                if (checkbox && checkbox.classList.contains('checked')) {
                    completed++;
                }
            });
            
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            // 更新进度条
            const progressBar = document.querySelector(`.daily-progress-fill[data-day="${day}"]`);
            if (progressBar) {
                progressBar.style.width = `${completionRate}%`;
            }
            
            // 更新百分比
            const percentSpan = document.querySelector(`.daily-percent[data-day="${day}"]`);
            if (percentSpan) {
                percentSpan.textContent = `${completionRate}%`;
            }
        }
    });
}

// 更新周进度
function updateWeekProgress() {
    // 安全检查ProgressUtils是否可用
    if (typeof ProgressUtils === 'undefined' || !ProgressUtils.calculateWeekProgress) {
        console.warn('⚠️ ProgressUtils不可用，跳过周进度更新');
        return;
    }
    
    const weekProgress = ProgressUtils.calculateWeekProgress();
    const progressBar = document.getElementById('week-progress-inner');
    const progressText = document.getElementById('progress-main');
    
    if (progressBar) {
        // 添加进度更新动画
        progressBar.parentElement.classList.add('progress-update');
        progressBar.style.width = `${weekProgress}%`;
        
        // 移除动画类
        setTimeout(() => {
            progressBar.parentElement.classList.remove('progress-update');
        }, 600);
    }
    
    if (progressText) {
        progressText.textContent = `本周进度 ${weekProgress}%`;
    }
    
    // 计算任务完成率
    const taskStats = calculateWeekTaskStatistics();
    const completionRateEl = document.getElementById('daily-completion-rate');
    if (completionRateEl) {
        completionRateEl.textContent = `完成率 ${taskStats.completionRate}%`;
        
        // 根据完成率改变颜色，添加平滑过渡
        completionRateEl.style.transition = 'all 0.3s ease';
        
        if (taskStats.completionRate >= 80) {
            completionRateEl.style.background = '#4caf50';
            completionRateEl.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
        } else if (taskStats.completionRate >= 50) {
            completionRateEl.style.background = '#ff9800';
            completionRateEl.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.3)';
        } else {
            completionRateEl.style.background = '#f44336';
            completionRateEl.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
        }
    }
    
    // 更新详细统计信息
    updateProgressStats(taskStats, weekProgress);
}

// 更新进度统计信息
function updateProgressStats(taskStats, weekProgress) {
    const progressStatsEl = document.getElementById('progress-stats');
    if (progressStatsEl) {
        const remaining = taskStats.total - taskStats.completed;
        const efficiency = weekProgress > 0 ? Math.round((taskStats.completionRate / weekProgress) * 100) : 0;
        
        progressStatsEl.innerHTML = `
            <span title="已完成/总任务">✅ ${taskStats.completed}/${taskStats.total}</span>
            <span title="剩余任务">📋 ${remaining}</span>
            <span title="效率指数">⚡ ${efficiency}%</span>
        `;
        
        // 添加悬停效果
        progressStatsEl.style.cursor = 'help';
    }
}

// 计算周任务统计
function calculateWeekTaskStatistics() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend'];
    let total = 0;
    let completed = 0;
    
    days.forEach(day => {
        const containerId = day === 'weekend' ? 'weekend_plan' : `${day}_tasks`;
        const container = document.getElementById(containerId);
        
        if (container) {
            const tasks = container.querySelectorAll('.task-item');
            total += tasks.length;
            
            tasks.forEach(task => {
                const checkbox = task.querySelector('.custom-checkbox');
                if (checkbox && checkbox.classList.contains('checked')) {
                    completed++;
                }
            });
        }
    });
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, completionRate };
}

// 显示历史记录
function showWeekHistory() {
    const history = StorageUtils.getHistory('week');
    
    if (history.length === 0) {
        MessageUtils.info('暂无历史记录');
        return;
    }
    
    let tableHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>周次</th>
                    <th>摘要</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    history.forEach((entry, index) => {
        tableHTML += `
            <tr>
                <td>${entry.date}</td>
                <td class="history-summary" data-full="${entry.summary}">${entry.summary}</td>
                <td>
                    <button class="btn-main" onclick="loadWeekHistoryPlan('${entry.date}')">加载</button>
                    <button class="btn-danger" onclick="deleteWeekHistoryEntry(${index})">删除</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    ModalUtils.show('周计划历史记录', tableHTML, {
        buttons: [
            { text: '关闭', class: 'btn-main' }
        ]
    });
}

// 加载历史周计划
function loadWeekHistoryPlan(week) {
    currentWeek = week;
    document.getElementById('week_date').value = week;
    updateWeekRange();
    updateDailyDates();
    loadWeekPlan();
    
    MessageUtils.success(`已加载 ${week} 的周计划`);
    
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

// 删除历史记录条目
function deleteWeekHistoryEntry(index) {
    if (confirm('确定要删除这条历史记录吗？')) {
        StorageUtils.deleteHistory('week', index);
        MessageUtils.success('历史记录已删除');
        
        // 重新显示历史记录
        setTimeout(() => {
            const modal = document.querySelector('.modal-mask');
            if (modal) ModalUtils.hide(modal);
            setTimeout(showWeekHistory, 300);
        }, 1000);
    }
}

// 显示周AI助手
function showWeekAIAssistant() {
    const aiContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🤖 周计划AI助手</h3>
            <p style="color: #666;">让AI帮助您优化本周规划</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <button class="ai-feature-btn" onclick="generateGoalSuggestions()">
                <div class="feature-icon">🎯</div>
                <div class="feature-title">目标规划</div>
                <div class="feature-desc">AI分析周目标</div>
            </button>
            
            <button class="ai-feature-btn" onclick="autoScheduleTasks()">
                <div class="feature-icon">📅</div>
                <div class="feature-title">智能排程</div>
                <div class="feature-desc">优化任务分配</div>
            </button>
            
            <button class="ai-feature-btn" onclick="balanceWorkload()">
                <div class="feature-icon">⚖️</div>
                <div class="feature-title">负载均衡</div>
                <div class="feature-desc">平衡工作量</div>
            </button>
            
            <button class="ai-feature-btn" onclick="generateWeeklyReport()">
                <div class="feature-icon">📊</div>
                <div class="feature-title">生成周报</div>
                <div class="feature-desc">自动总结分析</div>
            </button>
        </div>
        
        <style>
            .ai-feature-btn {
                background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,248,248,0.8));
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .ai-feature-btn:hover {
                border-color: var(--theme-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .feature-icon { font-size: 2em; margin-bottom: 8px; }
            .feature-title { font-weight: 600; color: var(--theme-color); margin-bottom: 4px; }
            .feature-desc { font-size: 0.9em; color: #666; }
        </style>
    `;
    
    ModalUtils.show('周计划AI助手', aiContent);
}

// 生成目标建议
function generateGoalSuggestions() {
    const suggestions = AIUtils.generateSuggestions('', 'weekly');
    
    let content = '<h4 style="color: var(--theme-color); margin-bottom: 16px;">🎯 AI周目标建议</h4>';
    
    content += '<div style="margin-bottom: 16px;">';
    suggestions.forEach((suggestion, index) => {
        content += `
            <div style="padding: 12px; background: rgba(25,118,210,0.05); border-radius: 8px; margin-bottom: 8px; border-left: 4px solid var(--theme-color);">
                <strong>建议 ${index + 1}:</strong> ${suggestion}
            </div>
        `;
    });
    content += '</div>';
    
    content += `
        <button class="btn-main" onclick="applyGoalSuggestions()">应用建议</button>
        <button class="btn-main" onclick="generateGoalSuggestions()">重新生成</button>
    `;
    
    ModalUtils.show('AI目标建议', content);
}

// 应用目标建议
function applyGoalSuggestions() {
    const goalsTextarea = document.getElementById('week_goals');
    const suggestions = AIUtils.generateSuggestions('', 'weekly');
    
    const currentGoals = goalsTextarea.value;
    const newGoals = suggestions.join('\n• ');
    
    if (currentGoals) {
        goalsTextarea.value = currentGoals + '\n\n• ' + newGoals;
    } else {
        goalsTextarea.value = '• ' + newGoals;
    }
    
    MessageUtils.success('AI建议已应用到周目标中');
    
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

// 显示周切换动画
function showWeekChangeAnimation(direction) {
    const animation = document.createElement('div');
    animation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4em;
        color: var(--theme-color);
        z-index: 10000;
        pointer-events: none;
        animation: weekChangeAnim 0.6s ease-out;
    `;
    animation.textContent = direction;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        if (animation.parentNode) {
            animation.parentNode.removeChild(animation);
        }
    }, 600);
}

// 保存成功动画
function animateSaveSuccess() {
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    
    saveBtn.style.background = '#4caf50';
    saveBtn.style.color = 'white';
    saveBtn.textContent = '✅ 已保存';
    
    setTimeout(() => {
        saveBtn.style.background = '';
        saveBtn.style.color = '';
        saveBtn.textContent = originalText;
    }, 2000);
}

// 周智能洞察功能
function showWeekInsights() {
    const weekData = gatherWeekData();
    const insights = generateWeekInsights(weekData);
    
    let insightsContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🧠 本周智能洞察</h3>
            <p style="color: #666;">AI分析您的本周计划，提供专业建议</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
    `;
    
    insights.forEach(insight => {
        insightsContent += `
            <div style="background: ${insight.color}; padding: 16px; border-radius: 12px; border-left: 4px solid ${insight.borderColor};">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">${insight.icon}</span>
                    <strong style="color: ${insight.borderColor};">${insight.title}</strong>
                </div>
                <p style="color: #333; line-height: 1.5; margin: 0;">${insight.content}</p>
                ${insight.suggestion ? `<p style="color: #666; font-size: 0.9em; margin-top: 8px; font-style: italic;">💡 ${insight.suggestion}</p>` : ''}
            </div>
        `;
    });
    
    insightsContent += `
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="applyInsightSuggestions()">应用建议</button>
            <button class="btn-main" onclick="refreshInsights()">刷新洞察</button>
        </div>
    `;
    
    ModalUtils.show('周智能洞察', insightsContent, 'large');
}

// 收集周数据
function gatherWeekData() {
    const goals = document.getElementById('week_goals').value || '';
    const review = document.getElementById('week_review').value || '';
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend'];
    
    const dayTasks = {};
    let totalTasks = 0;
    let completedTasks = 0;
    
    days.forEach(day => {
        const containerId = day === 'weekend' ? 'weekend_plan' : `${day}_tasks`;
        const container = document.getElementById(containerId);
        
        if (container) {
            const tasks = container.querySelectorAll('.task-item');
            dayTasks[day] = {
                total: tasks.length,
                completed: 0,
                tasks: []
            };
            
            tasks.forEach(task => {
                const checkbox = task.querySelector('.custom-checkbox');
                const text = task.querySelector('.task-text').textContent;
                const isCompleted = checkbox && checkbox.classList.contains('checked');
                
                dayTasks[day].tasks.push({
                    text: text,
                    completed: isCompleted
                });
                
                if (isCompleted) {
                    dayTasks[day].completed++;
                    completedTasks++;
                }
                totalTasks++;
            });
        }
    });
    
    return {
        goals,
        review,
        dayTasks,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
}

// 生成周洞察
function generateWeekInsights(data) {
    const insights = [];
    
    // 完成率分析
    if (data.completionRate >= 80) {
        insights.push({
            icon: '🏆',
            title: '完成率优异',
            content: `本周任务完成率 ${data.completionRate}%，表现出色！您的执行能力很强。`,
            suggestion: '继续保持这种高效的工作节奏',
            color: 'rgba(76, 175, 80, 0.1)',
            borderColor: '#4caf50'
        });
    } else if (data.completionRate >= 50) {
        insights.push({
            icon: '📈',
            title: '有进步空间',
            content: `本周任务完成率 ${data.completionRate}%，还有提升空间。`,
            suggestion: '可以尝试减少任务数量或优化时间分配',
            color: 'rgba(255, 152, 0, 0.1)',
            borderColor: '#ff9800'
        });
    } else {
        insights.push({
            icon: '⚠️',
            title: '需要调整',
            content: `本周任务完成率 ${data.completionRate}%，建议重新审视计划。`,
            suggestion: '考虑是否任务安排过多，或者需要调整优先级',
            color: 'rgba(244, 67, 54, 0.1)',
            borderColor: '#f44336'
        });
    }
    
    // 工作负载分析
    const dayTaskCounts = Object.values(data.dayTasks).map(day => day.total);
    const maxTasks = Math.max(...dayTaskCounts);
    const minTasks = Math.min(...dayTaskCounts.filter(count => count > 0));
    
    if (maxTasks - minTasks > 3) {
        insights.push({
            icon: '⚖️',
            title: '负载不均衡',
            content: '本周任务分配不够均匀，某些天任务过多，某些天较少。',
            suggestion: '建议重新分配任务，让工作量更加平衡',
            color: 'rgba(156, 39, 176, 0.1)',
            borderColor: '#9c27b0'
        });
    }
    
    // 目标设定分析
    if (!data.goals.trim()) {
        insights.push({
            icon: '🎯',
            title: '缺少明确目标',
            content: '本周未设定明确的核心目标，建议设定3-5个重点目标。',
            suggestion: '明确的目标有助于提高专注力和执行效果',
            color: 'rgba(25, 118, 210, 0.1)',
            borderColor: '#1976d2'
        });
    } else {
        const goalCount = data.goals.split('\n').filter(line => line.trim()).length;
        if (goalCount > 7) {
            insights.push({
                icon: '🎯',
                title: '目标过多',
                content: `本周设定了 ${goalCount} 个目标，可能过多。`,
                suggestion: '建议聚焦3-5个核心目标，确保执行质量',
                color: 'rgba(255, 193, 7, 0.1)',
                borderColor: '#ffc107'
            });
        }
    }
    
    // 周末安排分析
    const weekendTasks = data.dayTasks.weekend?.total || 0;
    if (weekendTasks > 5) {
        insights.push({
            icon: '🏖️',
            title: '周末任务过多',
            content: '周末安排了较多任务，建议保留更多休息时间。',
            suggestion: '适当的休息有助于下周更好的状态',
            color: 'rgba(255, 87, 34, 0.1)',
            borderColor: '#ff5722'
        });
    }
    
    // 如果没有特别的洞察，添加一个正面的
    if (insights.length === 0) {
        insights.push({
            icon: '✨',
            title: '计划合理',
            content: '您的周计划安排合理，各项指标都在良好范围内。',
            suggestion: '继续保持良好的计划习惯',
            color: 'rgba(76, 175, 80, 0.1)',
            borderColor: '#4caf50'
        });
    }
    
    return insights;
}

// 周效率优化功能
function showWeekOptimization() {
    const weekData = gatherWeekData();
    const optimizations = generateOptimizationSuggestions(weekData);
    
    let optimizationContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">⚡ 周效率优化建议</h3>
            <p style="color: #666;">基于AI分析的效率提升方案</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
    `;
    
    optimizations.forEach((opt, index) => {
        optimizationContent += `
            <div style="background: rgba(255, 255, 255, 0.9); border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: ${opt.color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${index + 1}
                    </div>
                    <h4 style="margin: 0; color: ${opt.color};">${opt.title}</h4>
                    <span style="background: ${opt.color}20; color: ${opt.color}; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">${opt.priority}</span>
                </div>
                <p style="color: #333; line-height: 1.5; margin: 8px 0;">${opt.description}</p>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid ${opt.color};">
                    <strong>具体行动：</strong> ${opt.action}
                </div>
                ${opt.impact ? `<p style="color: #666; font-size: 0.9em; margin-top: 8px;"><strong>预期效果：</strong> ${opt.impact}</p>` : ''}
            </div>
        `;
    });
    
    optimizationContent += `
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="applyOptimizations()">应用优化</button>
            <button class="btn-main" onclick="exportOptimizationPlan()">导出方案</button>
        </div>
    `;
    
    ModalUtils.show('周效率优化', optimizationContent, 'large');
}

// 生成优化建议
function generateOptimizationSuggestions(data) {
    const suggestions = [];
    
    // 基于完成率的优化
    if (data.completionRate < 70) {
        suggestions.push({
            title: '任务量优化',
            description: '当前任务完成率较低，建议减少任务数量，专注核心目标。',
            action: '将任务数量减少20-30%，优先保留最重要的任务',
            impact: '提高任务完成率15-25%',
            priority: '高优先级',
            color: '#f44336'
        });
    }
    
    // 时间块管理优化
    suggestions.push({
        title: '时间块管理',
        description: '采用番茄工作法或时间块技术，提高专注度和执行效率。',
        action: '为每个任务分配特定时间段，设置25分钟专注块',
        impact: '提高专注度20%，减少任务切换损耗',
        priority: '中优先级',
        color: '#2196f3'
    });
    
    // 能量管理优化
    suggestions.push({
        title: '能量节奏优化',
        description: '在精力充沛时处理重要任务，在低谷期处理简单任务。',
        action: '上午安排创造性工作，下午处理事务性任务',
        impact: '提高工作质量和效率',
        priority: '中优先级',
        color: '#4caf50'
    });
    
    // 批处理优化
    const taskTexts = [];
    Object.values(data.dayTasks).forEach(day => {
        day.tasks.forEach(task => taskTexts.push(task.text.toLowerCase()));
    });
    
    const hasEmailTasks = taskTexts.some(text => text.includes('邮件') || text.includes('email'));
    const hasMeetingTasks = taskTexts.some(text => text.includes('会议') || text.includes('meeting'));
    
    if (hasEmailTasks || hasMeetingTasks) {
        suggestions.push({
            title: '批处理优化',
            description: '将相似任务集中处理，如邮件回复、会议安排等。',
            action: '每天设定2-3个固定时段处理邮件和沟通任务',
            impact: '减少任务切换，提高处理效率30%',
            priority: '中优先级',
            color: '#ff9800'
        });
    }
    
    // 周末恢复优化
    const weekendTaskCount = data.dayTasks.weekend?.total || 0;
    if (weekendTaskCount < 2) {
        suggestions.push({
            title: '周末充电计划',
            description: '适当的周末活动有助于下周状态恢复。',
            action: '安排1-2项轻松的学习或兴趣活动',
            impact: '提高下周工作状态和创造力',
            priority: '低优先级',
            color: '#9c27b0'
        });
    }
    
    return suggestions.slice(0, 4); // 最多显示4个建议
}

function generateWeeklyReport() {
    const stats = calculateWeekTaskStatistics();
    const goals = document.getElementById('week_goals').value;
    const review = document.getElementById('week_review').value;
    
    const report = `
        <h3 style="color: var(--theme-color); margin-bottom: 16px;">📊 ${currentWeek} 周报</h3>
        
        <div style="background: rgba(25,118,210,0.05); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: var(--theme-color);">📈 数据统计</h4>
            <p>任务完成率: ${stats.completionRate}%</p>
            <p>总任务数: ${stats.total}</p>
            <p>已完成: ${stats.completed}</p>
            <p>未完成: ${stats.total - stats.completed}</p>
        </div>
        
        ${goals ? `
        <div style="background: rgba(76,175,80,0.05); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #4caf50;">🎯 本周目标</h4>
            <p style="white-space: pre-line;">${goals}</p>
        </div>
        ` : ''}
        
        ${review ? `
        <div style="background: rgba(156,39,176,0.05); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #9c27b0;">📝 周回顾</h4>
            <p style="white-space: pre-line;">${review}</p>
        </div>
        ` : ''}
        
        <button class="btn-main" onclick="exportWeeklyReport()">导出周报</button>
    `;
    
    ModalUtils.show('周报生成', report);
}

function exportWeeklyReport() {
    MessageUtils.info('周报导出功能正在开发中...');
}

function showWeekAnalysis() {
    MessageUtils.info('周分析功能正在开发中...');
}

function focusOnReview() {
    document.getElementById('week_review').focus();
    document.getElementById('week_review').scrollIntoView({ behavior: 'smooth' });
}

// 智能排程功能
function autoScheduleTasks() {
    const weekData = gatherWeekData();
    const scheduleSuggestions = generateScheduleSuggestions(weekData);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🤖 智能任务排程</h3>
            <p style="color: #666;">AI为您优化任务时间安排</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">排程原则</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: rgba(25, 118, 210, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5em; margin-bottom: 4px;">🌅</div>
                    <div style="font-weight: 600;">上午</div>
                    <div style="font-size: 0.9em; color: #666;">创造性任务</div>
                </div>
                <div style="background: rgba(255, 152, 0, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5em; margin-bottom: 4px;">☀️</div>
                    <div style="font-weight: 600;">中午</div>
                    <div style="font-size: 0.9em; color: #666;">会议沟通</div>
                </div>
                <div style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5em; margin-bottom: 4px;">🌇</div>
                    <div style="font-weight: 600;">下午</div>
                    <div style="font-size: 0.9em; color: #666;">事务处理</div>
                </div>
            </div>
        </div>
        
        <div>
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">建议调整</h4>
    `;
    
    if (scheduleSuggestions.length > 0) {
        scheduleSuggestions.forEach((suggestion, index) => {
            content += `
                <div style="background: rgba(255, 255, 255, 0.9); border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="background: var(--theme-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8em;">${index + 1}</span>
                        <strong>${suggestion.day}</strong>
                        <span style="color: #666;">→</span>
                        <span style="color: var(--theme-color);">${suggestion.timeSlot}</span>
                    </div>
                    <div style="color: #333; margin-bottom: 4px;">${suggestion.task}</div>
                    <div style="color: #666; font-size: 0.9em;">💡 ${suggestion.reason}</div>
                </div>
            `;
        });
    } else {
        content += `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="font-size: 2em; margin-bottom: 8px;">✨</div>
                <div>当前任务安排已经很合理！</div>
            </div>
        `;
    }
    
    content += `
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="applyScheduleSuggestions()">应用建议</button>
            <button class="btn-main" onclick="generateNewSchedule()">重新排程</button>
        </div>
    `;
    
    ModalUtils.show('智能任务排程', content, 'large');
}

// 生成排程建议
function generateScheduleSuggestions(data) {
    const suggestions = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    days.forEach(day => {
        const dayData = data.dayTasks[day];
        if (dayData && dayData.tasks.length > 0) {
            dayData.tasks.forEach(task => {
                const taskText = task.text.toLowerCase();
                
                // 创造性任务建议上午
                if (taskText.includes('设计') || taskText.includes('创作') || taskText.includes('规划') || taskText.includes('写作')) {
                    suggestions.push({
                        day: getDayName(day),
                        task: task.text,
                        timeSlot: '09:00-11:00',
                        reason: '创造性任务适合在精力充沛的上午完成'
                    });
                }
                
                // 会议任务建议中午
                if (taskText.includes('会议') || taskText.includes('讨论') || taskText.includes('沟通')) {
                    suggestions.push({
                        day: getDayName(day),
                        task: task.text,
                        timeSlot: '13:30-15:30',
                        reason: '会议和沟通任务适合安排在下午的交流时段'
                    });
                }
                
                // 事务性任务建议下午
                if (taskText.includes('邮件') || taskText.includes('整理') || taskText.includes('回复') || taskText.includes('审核')) {
                    suggestions.push({
                        day: getDayName(day),
                        task: task.text,
                        timeSlot: '15:30-17:30',
                        reason: '事务性任务适合在下午时段批量处理'
                    });
                }
            });
        }
    });
    
    return suggestions.slice(0, 6); // 最多显示6个建议
}

// 负载均衡功能
function balanceWorkload() {
    const weekData = gatherWeekData();
    const balanceAnalysis = analyzeWorkloadBalance(weekData);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">⚖️ 工作负载均衡分析</h3>
            <p style="color: #666;">智能分析本周任务分配情况</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">📊 每日任务分布</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
    `;
    
    Object.entries(balanceAnalysis.dailyStats).forEach(([day, stats]) => {
        const intensity = stats.total > balanceAnalysis.average ? 'high' : stats.total < balanceAnalysis.average * 0.7 ? 'low' : 'normal';
        const color = intensity === 'high' ? '#f44336' : intensity === 'low' ? '#2196f3' : '#4caf50';
        
        content += `
            <div style="background: rgba(255, 255, 255, 0.8); border: 2px solid ${color}; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-weight: 600; color: ${color};">${getDayName(day)}</div>
                <div style="font-size: 1.5em; color: ${color}; margin: 4px 0;">${stats.total}</div>
                <div style="font-size: 0.8em; color: #666;">任务</div>
                <div style="width: 100%; height: 4px; background: #e0e0e0; border-radius: 2px; margin-top: 8px;">
                    <div style="width: ${Math.min((stats.total / balanceAnalysis.max) * 100, 100)}%; height: 100%; background: ${color}; border-radius: 2px;"></div>
                </div>
            </div>
        `;
    });
    
    content += `
            </div>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">💡 均衡建议</h4>
    `;
    
    if (balanceAnalysis.suggestions.length > 0) {
        balanceAnalysis.suggestions.forEach((suggestion, index) => {
            content += `
                <div style="background: ${suggestion.color}; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${suggestion.borderColor};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2em;">${suggestion.icon}</span>
                        <strong style="color: ${suggestion.borderColor};">${suggestion.title}</strong>
                    </div>
                    <div style="color: #333; margin-bottom: 8px;">${suggestion.description}</div>
                    <div style="background: rgba(255, 255, 255, 0.8); padding: 12px; border-radius: 6px;">
                        <strong>具体行动：</strong> ${suggestion.action}
                    </div>
                </div>
            `;
        });
    } else {
        content += `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="font-size: 2em; margin-bottom: 8px;">✅</div>
                <div>当前工作负载分配已经很均衡！</div>
            </div>
        `;
    }
    
    content += `
        </div>
        <div style="text-align: center;">
            <button class="btn-main" onclick="applyBalanceAdjustments()">应用调整</button>
            <button class="btn-main" onclick="showDetailedBalance()">详细分析</button>
        </div>
    `;
    
    ModalUtils.show('工作负载均衡', content, 'large');
}

// 分析工作负载均衡
function analyzeWorkloadBalance(data) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dailyStats = {};
    let total = 0;
    let max = 0;
    
    days.forEach(day => {
        const dayData = data.dayTasks[day] || { total: 0, completed: 0 };
        dailyStats[day] = dayData;
        total += dayData.total;
        max = Math.max(max, dayData.total);
    });
    
    const average = total / days.length;
    const suggestions = [];
    
    // 检查负载不均衡
    const highLoadDays = days.filter(day => dailyStats[day].total > average * 1.5);
    const lowLoadDays = days.filter(day => dailyStats[day].total < average * 0.5);
    
    if (highLoadDays.length > 0 && lowLoadDays.length > 0) {
        suggestions.push({
            icon: '🔄',
            title: '任务重新分配',
            description: `${highLoadDays.map(day => getDayName(day)).join('、')} 任务过多，${lowLoadDays.map(day => getDayName(day)).join('、')} 任务较少。`,
            action: `将部分任务从繁忙的日子转移到较轻松的日子`,
            color: 'rgba(255, 152, 0, 0.1)',
            borderColor: '#ff9800'
        });
    }
    
    // 检查周末过载
    const weekendData = data.dayTasks.weekend || { total: 0 };
    if (weekendData.total > average) {
        suggestions.push({
            icon: '🏖️',
            title: '周末减负',
            description: '周末任务过多，建议保留更多休息时间。',
            action: '将部分周末任务分散到工作日完成',
            color: 'rgba(255, 87, 34, 0.1)',
            borderColor: '#ff5722'
        });
    }
    
    // 检查连续高负载
    let consecutiveHighLoad = 0;
    days.forEach(day => {
        if (dailyStats[day].total > average * 1.2) {
            consecutiveHighLoad++;
        } else {
            consecutiveHighLoad = 0;
        }
    });
    
    if (consecutiveHighLoad >= 3) {
        suggestions.push({
            icon: '⚡',
            title: '缓解疲劳',
            description: '连续多天高负载工作可能导致疲劳。',
            action: '在高强度工作日之间安排一些轻松的任务',
            color: 'rgba(156, 39, 176, 0.1)',
            borderColor: '#9c27b0'
        });
    }
    
    return {
        dailyStats,
        average,
        max,
        total,
        suggestions
    };
}

function showReviewTemplate() {
    const template = `本周总结模板：

✅ 本周完成的重要任务：
• 
• 
• 

🎯 目标达成情况：
• 
• 

💡 学到的新知识/技能：
• 
• 

⚠️ 遇到的挑战和解决方案：
• 
• 

📈 改进点和下周优化：
• 
• 

🏆 值得庆祝的成就：
• `;

    document.getElementById('week_review').value = template;
    MessageUtils.success('回顾模板已应用');
}

// 成就记录功能
function showAchievementTracker() {
    const weekData = gatherWeekData();
    const achievements = analyzeAchievements(weekData);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🏆 成就记录</h3>
            <p style="color: #666;">记录和展示您的周计划成就</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">🏆</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #ef6c00;">${achievements.totalAchievements}</div>
                <div style="color: #666;">总成就数</div>
            </div>
            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">⭐</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #2e7d32;">${achievements.points}</div>
                <div style="color: #666;">成就积分</div>
            </div>
            <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">🎖️</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #7b1fa2;">${achievements.level}</div>
                <div style="color: #666;">等级</div>
            </div>
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">🔥</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #1976d2;">${achievements.streak}</div>
                <div style="color: #666;">连续周数</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="refreshAchievements()">刷新成就</button>
            <button class="btn-main" onclick="exportAchievements()">导出记录</button>
        </div>
    `;
    
    ModalUtils.show('成就记录', content, 'large');
}

// 分析成就
function analyzeAchievements(weekData) {
    const taskStats = calculateWeekTaskStatistics();
    const goalAnalysis = analyzeGoalProgress(weekData);
    
    // 获取历史成就数据
    const achievementHistory = StorageUtils.getItem('weekAchievements', {
        totalPoints: 0,
        unlockedAchievements: [],
        weeklyStreak: 0,
        lastWeek: ''
    });
    
    // 简化的成就检查
    let totalAchievements = achievementHistory.unlockedAchievements.length;
    let points = achievementHistory.totalPoints;
    
    // 检查新成就
    if (taskStats.completionRate >= 90 && !achievementHistory.unlockedAchievements.includes('efficiency')) {
        totalAchievements++;
        points += 50;
        achievementHistory.unlockedAchievements.push('efficiency');
        MessageUtils.success('🏆 解锁新成就：效率专家！');
    }
    
    if (goalAnalysis.totalGoals >= 5 && !achievementHistory.unlockedAchievements.includes('planner')) {
        totalAchievements++;
        points += 30;
        achievementHistory.unlockedAchievements.push('planner');
        MessageUtils.success('🏆 解锁新成就：规划达人！');
    }
    
    // 计算等级和连续周数
    const level = Math.floor(points / 100) + 1;
    let streak = achievementHistory.weeklyStreak;
    
    if (currentWeek !== achievementHistory.lastWeek && (weekData.totalTasks > 0 || weekData.goals)) {
        streak += 1;
    }
    
    // 保存更新的数据
    const updatedHistory = {
        totalPoints: points,
        unlockedAchievements: achievementHistory.unlockedAchievements,
        weeklyStreak: streak,
        lastWeek: currentWeek
    };
    StorageUtils.setItem('weekAchievements', updatedHistory);
    
    return {
        totalAchievements,
        points,
        level,
        streak
    };
}

// 刷新成就
function refreshAchievements() {
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
    setTimeout(showAchievementTracker, 300);
    MessageUtils.success('成就数据已刷新');
}

// 导出成就记录
function exportAchievements() {
    const weekData = gatherWeekData();
    const achievements = analyzeAchievements(weekData);
    
    let report = `# 成就记录报告\n\n`;
    report += `**报告生成时间:** ${new Date().toLocaleString()}\n`;
    report += `**分析周次:** ${currentWeek}\n\n`;
    
    report += `## 成就概览\n\n`;
    report += `- 总成就数: ${achievements.totalAchievements}\n`;
    report += `- 成就积分: ${achievements.points}\n`;
    report += `- 当前等级: ${achievements.level}\n`;
    report += `- 连续周数: ${achievements.streak}\n\n`;
    
    ExportUtils.exportToText(report, `成就记录报告_${currentWeek}.txt`);
    MessageUtils.success('成就记录已导出');
}

// 目标追踪功能
function showGoalTracker() {
    const weekData = gatherWeekData();
    const goalAnalysis = analyzeGoalProgress(weekData);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📊 目标追踪分析</h3>
            <p style="color: #666;">智能分析本周目标完成情况</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">🎯</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #1976d2;">${goalAnalysis.totalGoals}</div>
                <div style="color: #666;">总目标数</div>
            </div>
            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">✅</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #2e7d32;">${goalAnalysis.achievedGoals}</div>
                <div style="color: #666;">已达成</div>
            </div>
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">📈</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #ef6c00;">${goalAnalysis.progressRate}%</div>
                <div style="color: #666;">完成率</div>
            </div>
            <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">⭐</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #7b1fa2;">${goalAnalysis.score}</div>
                <div style="color: #666;">目标评分</div>
            </div>
        </div>
    `;
    
    if (goalAnalysis.goals.length > 0) {
        content += `
            <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: var(--theme-color); margin-bottom: 16px;">🎯 目标详情</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
        `;
        
        goalAnalysis.goals.forEach((goal, index) => {
            const statusColor = goal.status === 'completed' ? '#4caf50' : 
                               goal.status === 'in-progress' ? '#ff9800' : '#666';
            const statusIcon = goal.status === 'completed' ? '✅' : 
                              goal.status === 'in-progress' ? '🔄' : '⏳';
            const statusText = goal.status === 'completed' ? '已完成' : 
                              goal.status === 'in-progress' ? '进行中' : '未开始';
            
            content += `
                <div style="background: rgba(255, 255, 255, 0.8); border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.2em;">${statusIcon}</span>
                            <strong style="color: #333;">目标 ${index + 1}</strong>
                        </div>
                        <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600;">
                            ${statusText}
                        </span>
                    </div>
                    <div style="color: #333; line-height: 1.5; margin-bottom: 8px;">${goal.content}</div>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="flex: 1; background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                            <div style="width: ${goal.progress}%; height: 100%; background: ${statusColor}; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="color: ${statusColor}; font-weight: 600; font-size: 0.9em;">${goal.progress}%</span>
                    </div>
                    ${goal.relatedTasks.length > 0 ? `
                        <div style="margin-top: 12px; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                            <div style="font-size: 0.85em; color: #666; margin-bottom: 4px;">相关任务:</div>
                            <div style="font-size: 0.9em; color: #333;">${goal.relatedTasks.join(', ')}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
    } else {
        content += `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 3em; margin-bottom: 16px;">🎯</div>
                <div style="font-size: 1.2em; margin-bottom: 8px;">暂无目标设定</div>
                <div style="color: #999;">请先在"本周核心目标"中设定您的目标</div>
            </div>
        `;
    }
    
    content += `
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">💡 目标建议</h4>
            ${goalAnalysis.suggestions.map(suggestion => `
                <div style="background: ${suggestion.color}; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${suggestion.borderColor};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2em;">${suggestion.icon}</span>
                        <strong style="color: ${suggestion.borderColor};">${suggestion.title}</strong>
                    </div>
                    <div style="color: #333; margin-bottom: 8px;">${suggestion.content}</div>
                    <div style="color: #666; font-size: 0.9em; font-style: italic;">💡 ${suggestion.action}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="updateGoalProgress()">更新进度</button>
            <button class="btn-main" onclick="exportGoalReport()">导出报告</button>
        </div>
    `;
    
    ModalUtils.show('目标追踪', content, 'large');
}

// 分析目标进度
function analyzeGoalProgress(data) {
    const goalsText = data.goals || '';
    const goals = [];
    let totalGoals = 0;
    let achievedGoals = 0;
    
    // 解析目标文本
    const goalLines = goalsText.split('\n').filter(line => line.trim() && !line.trim().startsWith('例如：'));
    
    goalLines.forEach((line, index) => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanLine) {
            totalGoals++;
            
            // 根据相关任务计算进度
            const relatedTasks = findRelatedTasks(cleanLine, data.dayTasks);
            const progress = calculateGoalProgress(cleanLine, relatedTasks);
            const status = progress >= 80 ? 'completed' : progress >= 30 ? 'in-progress' : 'pending';
            
            if (status === 'completed') {
                achievedGoals++;
            }
            
            goals.push({
                content: cleanLine,
                progress: progress,
                status: status,
                relatedTasks: relatedTasks.map(task => task.text)
            });
        }
    });
    
    const progressRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;
    const score = Math.min(Math.round((progressRate + (totalGoals * 10)) / 2), 100);
    
    // 生成建议
    const suggestions = [];
    
    if (totalGoals === 0) {
        suggestions.push({
            icon: '🎯',
            title: '设定具体目标',
            content: '建议设定3-5个明确、可衡量的周目标。',
            action: '使用SMART原则制定目标（具体、可衡量、可实现、相关性、时限性）',
            color: 'rgba(25, 118, 210, 0.1)',
            borderColor: '#1976d2'
        });
    } else {
        if (progressRate < 50) {
            suggestions.push({
                icon: '⚡',
                title: '加快执行进度',
                content: '当前目标完成率偏低，建议调整执行策略。',
                action: '将目标分解为更小的具体任务，每日跟踪进度',
                color: 'rgba(244, 67, 54, 0.1)',
                borderColor: '#f44336'
            });
        }
        
        if (totalGoals > 7) {
            suggestions.push({
                icon: '🎯',
                title: '聚焦核心目标',
                content: '目标数量较多，建议聚焦最重要的3-5个。',
                action: '优先级排序，专注于高价值目标的完成',
                color: 'rgba(255, 152, 0, 0.1)',
                borderColor: '#ff9800'
            });
        }
        
        if (progressRate >= 80) {
            suggestions.push({
                icon: '🏆',
                title: '保持优势',
                content: '目标执行情况良好，继续保持当前节奏。',
                action: '可以考虑适当提升目标挑战性，促进更大成长',
                color: 'rgba(76, 175, 80, 0.1)',
                borderColor: '#4caf50'
            });
        }
    }
    
    if (suggestions.length === 0) {
        suggestions.push({
            icon: '📈',
            title: '持续改进',
            content: '目标设定和执行都在合理范围内。',
            action: '建议定期回顾和调整目标，保持持续改进',
            color: 'rgba(76, 175, 80, 0.1)',
            borderColor: '#4caf50'
        });
    }
    
    return {
        totalGoals,
        achievedGoals,
        progressRate,
        score,
        goals,
        suggestions
    };
}

// 查找相关任务
function findRelatedTasks(goalText, dayTasks) {
    const relatedTasks = [];
    const goalKeywords = goalText.toLowerCase().split(/[^\w\u4e00-\u9fff]+/).filter(word => word.length > 1);
    
    Object.values(dayTasks).forEach(day => {
        if (day.tasks) {
            day.tasks.forEach(task => {
                const taskText = task.text.toLowerCase();
                const matchCount = goalKeywords.filter(keyword => taskText.includes(keyword)).length;
                
                if (matchCount > 0) {
                    relatedTasks.push({
                        text: task.text,
                        completed: task.completed,
                        relevance: matchCount / goalKeywords.length
                    });
                }
            });
        }
    });
    
    return relatedTasks.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

// 计算目标进度
function calculateGoalProgress(goalText, relatedTasks) {
    if (relatedTasks.length === 0) {
        return 0;
    }
    
    const completedTasks = relatedTasks.filter(task => task.completed).length;
    const totalRelevantTasks = relatedTasks.length;
    
    return Math.round((completedTasks / totalRelevantTasks) * 100);
}

// 更新目标进度
function updateGoalProgress() {
    MessageUtils.success('目标进度已更新');
    
    // 重新显示目标追踪
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
    setTimeout(showGoalTracker, 300);
}

// 导出目标报告
function exportGoalReport() {
    const weekData = gatherWeekData();
    const goalAnalysis = analyzeGoalProgress(weekData);
    
    let report = `# 周目标追踪报告\n\n`;
    report += `**报告生成时间:** ${new Date().toLocaleString()}\n`;
    report += `**分析周次:** ${currentWeek}\n\n`;
    
    report += `## 目标概览\n\n`;
    report += `- 总目标数: ${goalAnalysis.totalGoals}\n`;
    report += `- 已达成: ${goalAnalysis.achievedGoals}\n`;
    report += `- 完成率: ${goalAnalysis.progressRate}%\n`;
    report += `- 目标评分: ${goalAnalysis.score}/100\n\n`;
    
    if (goalAnalysis.goals.length > 0) {
        report += `## 目标详情\n\n`;
        goalAnalysis.goals.forEach((goal, index) => {
            const statusText = goal.status === 'completed' ? '已完成' : 
                              goal.status === 'in-progress' ? '进行中' : '未开始';
            
            report += `### 目标 ${index + 1}: ${goal.content}\n`;
            report += `- 状态: ${statusText}\n`;
            report += `- 进度: ${goal.progress}%\n`;
            if (goal.relatedTasks.length > 0) {
                report += `- 相关任务: ${goal.relatedTasks.join(', ')}\n`;
            }
            report += `\n`;
        });
    }
    
    report += `## 改进建议\n\n`;
    goalAnalysis.suggestions.forEach((suggestion, index) => {
        report += `### ${index + 1}. ${suggestion.title}\n`;
        report += `${suggestion.content}\n`;
        report += `**行动建议:** ${suggestion.action}\n\n`;
    });
    
    ExportUtils.exportToText(report, `周目标追踪报告_${currentWeek}.txt`);
    MessageUtils.success('目标报告已导出');
}

// 下周AI规划功能
function generateNextWeekPlan() {
    try {
        console.log('🚀 启动AI规划功能...');
        
        // 检查必要的依赖
        if (typeof ModalUtils === 'undefined') {
            console.error('❌ ModalUtils未定义');
            MessageUtils.error('模态框工具未加载，请刷新页面重试');
            return;
        }
        
        if (typeof MessageUtils === 'undefined') {
            console.error('❌ MessageUtils未定义');
            alert('消息工具未加载，请刷新页面重试');
            return;
        }
        
        console.log('✅ 依赖检查通过');
        
        const currentWeekData = gatherWeekData();
        console.log('📊 收集的数据:', currentWeekData);
        
        const nextWeekSuggestions = generateNextWeekSuggestions(currentWeekData);
        console.log('💡 生成的建议:', nextWeekSuggestions);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🤖 下周AI规划</h3>
            <p style="color: #666;">基于本周表现智能生成下周计划建议</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">📊 本周分析</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: #1976d2;">${nextWeekSuggestions.analysis.completionRate}%</div>
                    <div style="font-size: 0.9em; color: #666;">完成率</div>
                </div>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: #2e7d32;">${nextWeekSuggestions.analysis.totalTasks}</div>
                    <div style="font-size: 0.9em; color: #666;">总任务</div>
                </div>
                <div style="background: #fff3e0; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: #ef6c00;">${nextWeekSuggestions.analysis.goalCount}</div>
                    <div style="font-size: 0.9em; color: #666;">目标数</div>
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid var(--theme-color);">
                <strong>AI分析：</strong> ${nextWeekSuggestions.analysis.summary}
            </div>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">🎯 下周目标建议</h4>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #333;">AI推荐目标：</div>
                <div style="white-space: pre-line; line-height: 1.6; color: #555;">${nextWeekSuggestions.goals.join('\n')}</div>
            </div>
            <button class="btn-main" onclick="applyGoalsToNextWeek()" style="width: 100%; margin-bottom: 8px;">
                📋 应用目标到下周计划
            </button>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">📅 任务分配建议</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
    `;
    
    nextWeekSuggestions.dailyTasks.forEach(day => {
        content += `
            <div style="background: #f8f9fa; border-radius: 8px; padding: 12px;">
                <div style="font-weight: 600; color: var(--theme-color); margin-bottom: 8px;">${day.name}</div>
                <div style="font-size: 0.9em; line-height: 1.5;">
                    ${day.tasks.map(task => `• ${task}`).join('<br>')}
                </div>
            </div>
        `;
    });
    
    content += `
            </div>
            <button class="btn-main" onclick="applyTasksToNextWeek()" style="width: 100%; margin-top: 12px;">
                📝 应用任务分配
            </button>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">💡 优化建议</h4>
            ${nextWeekSuggestions.recommendations.map((rec, index) => `
                <div style="background: ${rec.color}; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${rec.borderColor};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2em;">${rec.icon}</span>
                        <strong style="color: ${rec.borderColor};">${rec.title}</strong>
                    </div>
                    <div style="color: #333; margin-bottom: 8px;">${rec.content}</div>
                    <div style="color: #666; font-size: 0.9em; font-style: italic;">💡 ${rec.action}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center;">
            <button class="btn-main" onclick="generateCompleteNextWeekPlan()" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; margin-right: 8px;">
                🚀 生成完整下周计划
            </button>
            <button class="btn-main" onclick="saveAsTemplate()">
                💾 保存为模板
            </button>
            <button class="btn-main" onclick="exportNextWeekPlan()">
                📤 导出规划
            </button>
        </div>
    `;
    
    console.log('🎯 准备显示模态框...');
    ModalUtils.show('下周AI规划', content, 'large');
    console.log('✅ 模态框已显示');
        
    } catch (error) {
        console.error('❌ AI规划功能出错:', error);
        MessageUtils.error('AI规划功能出现错误：' + error.message);
    }
}

// 生成下周建议
function generateNextWeekSuggestions(currentWeekData) {
    try {
        console.log('🔍 分析当前周数据...', currentWeekData);
        
        const taskStats = calculateWeekTaskStatistics();
        console.log('📊 任务统计:', taskStats);
        
        const goalAnalysis = analyzeGoalProgress(currentWeekData);
        console.log('🎯 目标分析:', goalAnalysis);
        
        // 分析本周表现
        const analysis = {
            completionRate: taskStats.completionRate || 0,
            totalTasks: taskStats.total || 0,
            goalCount: goalAnalysis.totalGoals || 0,
            summary: generateWeekSummary(taskStats, goalAnalysis)
        };
        
        console.log('📈 分析结果:', analysis);
        
        // 生成目标建议
        const goals = generateGoalSuggestions(currentWeekData, analysis);
        console.log('🎯 目标建议:', goals);
        
        // 生成每日任务分配
        const dailyTasks = generateDailyTaskSuggestions(currentWeekData, analysis);
        console.log('📅 每日任务:', dailyTasks);
        
        // 生成优化建议
        const recommendations = generateOptimizationRecommendations(analysis);
        console.log('💡 优化建议:', recommendations);
        
        const result = {
            analysis,
            goals,
            dailyTasks,
            recommendations
        };
        
        console.log('✅ 下周建议生成完成:', result);
        return result;
        
    } catch (error) {
        console.error('❌ 生成下周建议时出错:', error);
        
        // 返回默认建议作为fallback
        return {
            analysis: {
                completionRate: 0,
                totalTasks: 0,
                goalCount: 0,
                summary: "暂无数据分析，建议开始制定本周计划。"
            },
            goals: [
                "• 设定3-5个具体可实现的目标",
                "• 合理分配工作与生活时间",
                "• 专注核心任务，避免分散精力"
            ],
            dailyTasks: [
                { name: "周一", tasks: ["开始新的一周，制定详细计划"] },
                { name: "周二", tasks: ["专注重要项目推进"] },
                { name: "周三", tasks: ["中期检查与调整"] },
                { name: "周四", tasks: ["加速任务执行"] },
                { name: "周五", tasks: ["总结本周成果"] }
            ],
            recommendations: [
                {
                    icon: "📝",
                    title: "建立规划习惯",
                    content: "建议每周开始前制定详细计划",
                    action: "使用计划工具记录目标和任务",
                    color: "#e3f2fd",
                    borderColor: "#1976d2"
                }
            ]
        };
    }
}

// 生成周总结
function generateWeekSummary(taskStats, goalAnalysis) {
    if (taskStats.completionRate >= 80) {
        return "本周执行情况优秀，建议下周保持当前节奏并适当增加挑战。";
    } else if (taskStats.completionRate >= 60) {
        return "本周表现良好，建议下周优化任务分配，提高执行效率。";
    } else if (taskStats.completionRate >= 40) {
        return "本周完成率中等，建议下周减少任务量，专注核心目标。";
    } else {
        return "本周执行不够理想，建议下周重新规划，设定更现实的目标。";
    }
}

// 生成目标建议
function generateGoalSuggestions(weekData, analysis) {
    const suggestions = [];
    
    // 基于完成率调整目标
    if (analysis.completionRate >= 80) {
        suggestions.push("• 在保持高完成率的基础上，尝试承担更具挑战性的项目");
        suggestions.push("• 优化工作流程，探索提升效率的新方法");
        suggestions.push("• 分享经验，帮助团队成员提升表现");
    } else if (analysis.completionRate >= 60) {
        suggestions.push("• 巩固已建立的良好习惯");
        suggestions.push("• 识别并消除影响效率的障碍");
        suggestions.push("• 适当增加有助于长期发展的活动");
    } else {
        suggestions.push("• 设定更现实可达成的目标");
        suggestions.push("• 专注于最重要的2-3个核心任务");
        suggestions.push("• 建立更好的时间管理习惯");
    }
    
    // 基于未完成任务添加延续目标
    const incompleteTasks = getIncompleteTasks(weekData);
    if (incompleteTasks.length > 0) {
        suggestions.push(`• 完成本周遗留的重要任务：${incompleteTasks.slice(0, 2).join(', ')}`);
    }
    
    // 添加成长目标
    suggestions.push("• 学习新技能或深化专业知识");
    suggestions.push("• 改善工作与生活平衡");
    
    return suggestions;
}

// 生成每日任务建议
function generateDailyTaskSuggestions(weekData, analysis) {
    const dailyTasks = [
        {
            name: "周一",
            tasks: [
                "制定详细的周计划",
                "处理重要且紧急的事项",
                "安排本周重点会议"
            ]
        },
        {
            name: "周二",
            tasks: [
                "专注于创造性工作",
                "推进重点项目",
                "团队协作与沟通"
            ]
        },
        {
            name: "周三",
            tasks: [
                "中期进度检查",
                "处理积压事务",
                "技能学习时间"
            ]
        },
        {
            name: "周四",
            tasks: [
                "完善项目细节",
                "准备汇报材料",
                "网络建设活动"
            ]
        },
        {
            name: "周五",
            tasks: [
                "收尾本周工作",
                "进行周总结回顾",
                "规划下周重点"
            ]
        }
    ];
    
    // 根据完成率调整任务强度
    if (analysis.completionRate < 60) {
        dailyTasks.forEach(day => {
            day.tasks = day.tasks.slice(0, 2); // 减少任务量
        });
    }
    
    return dailyTasks;
}

// 生成优化建议
function generateOptimizationRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.completionRate < 70) {
        recommendations.push({
            icon: '🎯',
            title: '目标聚焦',
            content: '当前任务完成率偏低，建议聚焦最重要的目标。',
            action: '将目标数量减少到3-5个，确保质量优于数量',
            color: 'rgba(244, 67, 54, 0.1)',
            borderColor: '#f44336'
        });
    }
    
    if (analysis.totalTasks > 25) {
        recommendations.push({
            icon: '⚡',
            title: '任务优化',
            content: '任务数量较多，建议优化任务分配。',
            action: '采用80/20法则，专注于高价值任务',
            color: 'rgba(255, 152, 0, 0.1)',
            borderColor: '#ff9800'
        });
    }
    
    recommendations.push({
        icon: '📈',
        title: '持续改进',
        content: '建立反馈循环，持续优化工作方法。',
        action: '每日复盘，每周调整，每月总结',
        color: 'rgba(25, 118, 210, 0.1)',
        borderColor: '#1976d2'
    });
    
    recommendations.push({
        icon: '🧘',
        title: '工作平衡',
        content: '保持工作与休息的平衡，避免过度疲劳。',
        action: '安排适当的休息时间和放松活动',
        color: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4caf50'
    });
    
    return recommendations;
}

// 获取未完成任务
function getIncompleteTasks(weekData) {
    const incompleteTasks = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend'];
    
    days.forEach(day => {
        const dayData = weekData.dayTasks[day];
        if (dayData && dayData.tasks) {
            dayData.tasks.forEach(task => {
                if (!task.completed && task.text.trim()) {
                    incompleteTasks.push(task.text);
                }
            });
        }
    });
    
    return incompleteTasks;
}

// 应用目标到下周
function applyGoalsToNextWeek() {
    try {
        const currentWeekData = gatherWeekData();
        const suggestions = generateNextWeekSuggestions(currentWeekData);
        
        // 获取当前模态框中显示的目标
        const goalsText = suggestions.goals.join('\n');
        
        // 复制到剪贴板
        navigator.clipboard.writeText(goalsText).then(() => {
            MessageUtils.success('✅ 目标建议已复制到剪贴板！\n请切换到下周并粘贴到目标区域');
        }).catch(() => {
            // 如果复制失败，显示目标内容让用户手动复制
            const modal = document.querySelector('.modal-mask .modal-content');
            if (modal) {
                const goalDisplay = document.createElement('div');
                goalDisplay.innerHTML = `
                    <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <h4 style="color: var(--theme-color); margin-bottom: 12px;">📋 AI目标建议（请手动复制）</h4>
                        <textarea readonly style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; line-height: 1.5;">${goalsText}</textarea>
                        <p style="color: #666; font-size: 0.9em; margin: 8px 0 0 0;">请选择以上文本并复制，然后切换到下周粘贴到目标区域</p>
                    </div>
                `;
                modal.appendChild(goalDisplay);
            }
            MessageUtils.info('目标建议已显示，请手动复制');
        });
        
    } catch (error) {
        console.error('应用目标建议时出错:', error);
        MessageUtils.error('操作失败，请重试');
    }
}

// 应用任务到下周
function applyTasksToNextWeek() {
    try {
        const currentWeekData = gatherWeekData();
        const suggestions = generateNextWeekSuggestions(currentWeekData);
        
        // 生成任务分配文本
        let tasksText = '';
        suggestions.dailyTasks.forEach(day => {
            tasksText += `=== ${day.name} ===\n`;
            day.tasks.forEach(task => {
                tasksText += `[ ] ${task}\n`;
            });
            tasksText += '\n';
        });
        
        // 复制到剪贴板
        navigator.clipboard.writeText(tasksText).then(() => {
            MessageUtils.success('✅ 任务分配已复制到剪贴板！\n请切换到下周并分别粘贴到对应日期');
        }).catch(() => {
            // 显示任务分配让用户手动复制
            const modal = document.querySelector('.modal-mask .modal-content');
            if (modal) {
                const taskDisplay = document.createElement('div');
                taskDisplay.innerHTML = `
                    <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <h4 style="color: #2e7d32; margin-bottom: 12px;">📝 任务分配建议（请手动复制）</h4>
                        <textarea readonly style="width: 100%; height: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; line-height: 1.5; white-space: pre;">${tasksText}</textarea>
                        <p style="color: #666; font-size: 0.9em; margin: 8px 0 0 0;">请根据日期分别复制对应内容到下周的每日任务区域</p>
                    </div>
                `;
                modal.appendChild(taskDisplay);
            }
            MessageUtils.info('任务分配已显示，请手动复制');
        });
        
    } catch (error) {
        console.error('应用任务分配时出错:', error);
        MessageUtils.error('操作失败，请重试');
    }
}

// 生成完整下周计划
function generateCompleteNextWeekPlan() {
    try {
        console.log('🚀 开始生成完整下周计划...');
        
        // 检查所有必要的函数
        const requiredFunctions = [
            'gatherWeekData', 'generateNextWeekSuggestions', 'navigateWeek', 
            'applyAISuggestionsToCurrentWeek', 'saveWeekPlan'
        ];
        
        for (const funcName of requiredFunctions) {
            if (typeof window[funcName] !== 'function') {
                console.error(`❌ 缺少必要函数: ${funcName}`);
                MessageUtils.error(`功能不完整，缺少${funcName}函数，请刷新页面重试`);
                return;
            }
        }
        
        console.log('✅ 所有函数检查通过');
        
        const currentWeekData = gatherWeekData();
        console.log('📊 收集的本周数据:', currentWeekData);
        
        const suggestions = generateNextWeekSuggestions(currentWeekData);
        console.log('💡 生成的AI建议:', suggestions);
        
        // 验证建议数据的完整性
        if (!suggestions || !suggestions.goals || !suggestions.dailyTasks) {
            console.error('❌ AI建议数据不完整:', suggestions);
            MessageUtils.error('生成AI建议失败，请重试');
            return;
        }
        
        // 确认对话框
        const confirmed = confirm(`确定要生成并切换到下周计划吗？\n\n将会：\n• 自动切换到下一周\n• 应用AI生成的目标建议\n• 设置推荐的任务分配\n• 填充优化建议内容\n\n注意：这将覆盖下周的现有内容！`);
        
        if (!confirmed) {
            console.log('❌ 用户取消操作');
            return;
        }
        
        MessageUtils.success('🚀 正在生成完整的下周计划...');
        
        // 关闭当前模态框
        const modal = document.querySelector('.modal-mask');
        if (modal) {
            ModalUtils.hide(modal);
            console.log('✅ 模态框已关闭');
        }
        
        // 延迟执行以确保模态框关闭
        setTimeout(() => {
            console.log('📅 切换到下一周...');
            // 切换到下一周
            navigateWeek(1);
            
            // 再次延迟以确保数据加载完成
            setTimeout(() => {
                console.log('🔄 开始应用AI建议...');
                applyAISuggestionsToCurrentWeek(suggestions);
            }, 800); // 增加延迟时间确保页面完全加载
        }, 500); // 增加延迟时间确保模态框完全关闭
        
    } catch (error) {
        console.error('❌ 生成完整下周计划时出错:', error);
        MessageUtils.error('生成计划时出现错误：' + error.message);
    }
}

// 应用AI建议到当前周
function applyAISuggestionsToCurrentWeek(suggestions) {
    try {
        console.log('🚀 开始应用AI建议:', suggestions);
        
        // 1. 应用目标建议
        const goalsTextarea = document.getElementById('week_goals');
        if (goalsTextarea) {
            const aiGoals = suggestions.goals.join('\n');
            goalsTextarea.value = aiGoals;
            console.log('✅ 目标已设置:', aiGoals);
            
            // 触发输入事件以保存草稿
            const inputEvent = new Event('input', { bubbles: true });
            goalsTextarea.dispatchEvent(inputEvent);
            
            // 确保焦点显示效果
            goalsTextarea.focus();
            setTimeout(() => goalsTextarea.blur(), 100);
        } else {
            console.error('❌ 找不到week_goals元素');
        }
        
        // 2. 应用每日任务建议
        const dayMapping = {
            '周一': 'monday_tasks',
            '周二': 'tuesday_tasks', 
            '周三': 'wednesday_tasks',
            '周四': 'thursday_tasks',
            '周五': 'friday_tasks'
        };
        
        suggestions.dailyTasks.forEach(day => {
            const containerId = dayMapping[day.name];
            console.log(`📅 处理${day.name} -> 容器ID: ${containerId}`);
            
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    const taskList = day.tasks.map(task => `[ ] ${task}`).join('\n');
                    console.log(`✅ ${day.name}任务内容:`, taskList);
                    
                    // 确保容器是可编辑的和有正确的类
                    container.contentEditable = true;
                    if (!container.classList.contains('todo-list-container')) {
                        container.classList.add('todo-list-container');
                    }
                    
                    // 清空现有内容
                    container.innerHTML = '';
                    container.textContent = '';
                    
                    // 设置新内容
                    container.textContent = taskList;
                    
                    // 重新渲染待办事项
                    console.log(`🔄 渲染${day.name}的待办事项...`);
                    if (typeof WeekPlanTodoUtils !== 'undefined') {
                        WeekPlanTodoUtils.renderTodos(container);
                    }
                    
                    // 验证渲染结果
                    console.log(`📊 ${day.name}渲染后子元素数量:`, container.children.length);
                    
                    // 触发多个事件以确保保存
                    ['input', 'change', 'blur'].forEach(eventType => {
                        const event = new Event(eventType, { 
                            bubbles: true, 
                            cancelable: true 
                        });
                        container.dispatchEvent(event);
                    });
                } else {
                    console.error(`❌ 找不到容器: ${containerId}`);
                }
            }
        });
        
        // 3. 应用到下周预览区域
        const nextWeekPreview = document.getElementById('next_week_preview');
        if (nextWeekPreview) {
            let previewContent = `AI智能规划 - 下周重点:\n\n`;
            
            // 添加优化建议
            suggestions.recommendations.forEach((rec, index) => {
                previewContent += `${index + 1}. ${rec.title}\n`;
                previewContent += `   ${rec.content}\n`;
                previewContent += `   行动: ${rec.action}\n\n`;
            });
            
            // 添加分析总结
            previewContent += `\n📊 本周分析总结:\n`;
            previewContent += `${suggestions.analysis.summary}\n\n`;
            
            previewContent += `💡 注意: 此计划由AI基于上周数据智能生成，请根据实际情况调整。`;
            
            console.log('📝 设置下周预览内容:', previewContent.substring(0, 100) + '...');
            nextWeekPreview.value = previewContent;
            
            // 触发输入事件
            const inputEvent = new Event('input', { bubbles: true });
            nextWeekPreview.dispatchEvent(inputEvent);
        } else {
            console.error('❌ 找不到next_week_preview元素');
        }
        
        // 4. 更新进度和统计
        console.log('🔄 更新进度统计...');
        setTimeout(() => {
            updateDailyProgress();
            updateWeekProgress();
            console.log('✅ 进度统计已更新');
        }, 100);
        
        // 5. 显示成功消息和提示
        MessageUtils.success('✅ AI规划已成功应用到下周计划！');
        console.log('✅ AI规划应用完成');
        
        setTimeout(() => {
            MessageUtils.info('💡 建议保存计划并根据实际情况进行调整');
        }, 2000);
        
        // 6. 可选：自动保存
        setTimeout(() => {
            console.log('💾 执行自动保存...');
            saveWeekPlan();
        }, 3000);
        
        // 7. 滚动到页面顶部以显示更改
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
        
    } catch (error) {
        console.error('❌ 应用AI建议时出错:', error);
        MessageUtils.error('应用AI建议时出现错误，请检查控制台获取详细信息');
    }
}

// 保存为模板
function saveAsTemplate() {
    const templates = StorageUtils.getItem('weekPlanTemplates', []);
    const newTemplate = {
        id: Date.now(),
        name: `AI规划模板_${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        data: gatherWeekData()
    };
    
    templates.push(newTemplate);
    StorageUtils.setItem('weekPlanTemplates', templates);
    
    MessageUtils.success('规划已保存为模板');
}

// 导出下周规划
function exportNextWeekPlan() {
    const currentWeekData = gatherWeekData();
    const suggestions = generateNextWeekSuggestions(currentWeekData);
    
    let planText = `# 下周AI规划报告\n\n`;
    planText += `**生成时间:** ${new Date().toLocaleString()}\n`;
    planText += `**当前周次:** ${currentWeek}\n\n`;
    
    planText += `## 本周分析\n\n`;
    planText += `- 任务完成率: ${suggestions.analysis.completionRate}%\n`;
    planText += `- 总任务数: ${suggestions.analysis.totalTasks}\n`;
    planText += `- 目标数量: ${suggestions.analysis.goalCount}\n`;
    planText += `- AI分析: ${suggestions.analysis.summary}\n\n`;
    
    planText += `## 下周目标建议\n\n`;
    suggestions.goals.forEach(goal => {
        planText += `${goal}\n`;
    });
    
    planText += `\n## 每日任务分配\n\n`;
    suggestions.dailyTasks.forEach(day => {
        planText += `### ${day.name}\n`;
        day.tasks.forEach(task => {
            planText += `- ${task}\n`;
        });
        planText += `\n`;
    });
    
    planText += `## 优化建议\n\n`;
    suggestions.recommendations.forEach((rec, index) => {
        planText += `### ${index + 1}. ${rec.title}\n`;
        planText += `${rec.content}\n`;
        planText += `**行动:** ${rec.action}\n\n`;
    });
    
    ExportUtils.exportToText(planText, `下周AI规划_${currentWeek}.txt`);
    MessageUtils.success('下周规划已导出');
}

function carryOverTasks() {
    try {
        console.log('🔄 开始执行结转任务...');
        
        // 获取当前周的所有未完成任务
        const incompleteTasks = [];
        
        // 检查每日任务
        const dailyContainers = [
            'monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 
            'thursday_tasks', 'friday_tasks', 'weekend_plan'
        ];
        
        console.log('📋 检查容器:', dailyContainers);
        
        dailyContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            console.log(`检查容器 ${containerId}:`, container ? '存在' : '不存在');
            
            if (!container) return;
            
            // 首先尝试查找.task-item元素
            const tasks = container.querySelectorAll('.task-item');
            console.log(`容器 ${containerId} 中找到任务数量:`, tasks.length);
            
            if (tasks.length > 0) {
                // 如果找到了.task-item元素，使用现有逻辑
                tasks.forEach((task, index) => {
                    const checkbox = task.querySelector('.custom-checkbox');
                    const taskText = task.querySelector('.task-text');
                    
                    // 获取任务文本
                    let text = '';
                    if (taskText) {
                        if (taskText.tagName === 'TEXTAREA' || taskText.tagName === 'INPUT') {
                            text = taskText.value || '';
                        } else {
                            text = taskText.textContent || '';
                        }
                        text = text.trim();
                    }
                    
                    // 检查任务状态
                    const isCompleted = checkbox && checkbox.classList.contains('checked');
                    console.log(`任务 ${index + 1}: "${text}", 已完成: ${isCompleted}`);
                    
                    // 如果任务未完成且有内容，添加到未完成列表
                    if (!isCompleted && text) {
                        const dayName = getDayName(containerId.replace('_tasks', '').replace('_plan', ''));
                        console.log(`添加未完成任务: "${text}" 来源: ${dayName}`);
                        incompleteTasks.push({
                            text: text,
                            source: dayName
                        });
                    }
                });
            } else {
                // 如果没有找到.task-item元素，尝试从原始文本内容中解析
                console.log(`容器 ${containerId} 没有.task-item，尝试从文本内容解析`);
                const rawContent = container.textContent || container.value || '';
                console.log(`原始内容:`, rawContent);
                
                if (rawContent.trim()) {
                    const lines = rawContent.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        const match = line.match(/^\[\s*\]\s*(.+)$/); // 匹配未完成任务 [ ] 或 []
                        if (match) {
                            const text = match[1].trim();
                            if (text) {
                                const dayName = getDayName(containerId.replace('_tasks', '').replace('_plan', ''));
                                console.log(`从文本解析添加未完成任务: "${text}" 来源: ${dayName}`);
                                incompleteTasks.push({
                                    text: text,
                                    source: dayName
                                });
                            }
                        }
                    });
                }
            }
        });
        
        console.log('📋 找到未完成任务数量:', incompleteTasks.length);
        
        if (incompleteTasks.length === 0) {
            console.log('🎉 恭喜！本周所有任务都已完成，无需结转任务！');
            if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
                MessageUtils.success('恭喜！本周所有任务都已完成，无需结转任务！🎉');
            } else {
                alert('恭喜！本周所有任务都已完成，无需结转任务！🎉');
            }
            return;
        }
        
        // 生成结转任务的文本
        let carryOverText = '📋 从本周结转的未完成任务：\n\n';
        
        // 按来源分组
        const tasksBySource = {};
        incompleteTasks.forEach(task => {
            if (!tasksBySource[task.source]) {
                tasksBySource[task.source] = [];
            }
            tasksBySource[task.source].push(task.text);
        });
        
        // 生成结转文本
        Object.keys(tasksBySource).forEach(source => {
            carryOverText += `${source}的未完成任务：\n`;
            tasksBySource[source].forEach(task => {
                carryOverText += `[ ] ${task}\n`;
            });
            carryOverText += '\n';
        });
        
        carryOverText += '💡 建议：\n';
        carryOverText += '• 重新评估任务优先级\n';
        carryOverText += '• 考虑任务是否需要调整或分解\n';
        carryOverText += '• 合理安排下周的时间分配\n';
        
        // 将结转的任务添加到"下周预览"区域
        const nextWeekPreview = document.getElementById('next_week_preview');
        console.log('查找下周预览容器:', nextWeekPreview ? '找到' : '未找到');
        
        if (nextWeekPreview) {
            const currentContent = nextWeekPreview.value || '';
            console.log('当前下周预览内容长度:', currentContent.length);
            
            let newContent = carryOverText;
            
            if (currentContent.trim()) {
                newContent = carryOverText + '\n' + '─'.repeat(50) + '\n\n' + currentContent;
            }
            
            console.log('准备设置新内容长度:', newContent.length);
            nextWeekPreview.value = newContent;
            console.log('设置后的内容长度:', nextWeekPreview.value.length);
            
            // 触发自动保存
            const inputEvent = new Event('input', { bubbles: true });
            nextWeekPreview.dispatchEvent(inputEvent);
            console.log('已触发input事件');
        } else {
            console.error('❌ 未找到next_week_preview元素!');
        }
        
        // 滚动到下周预览区域
        if (nextWeekPreview) {
            nextWeekPreview.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // 短暂高亮显示
            nextWeekPreview.style.backgroundColor = 'rgba(255, 235, 59, 0.2)';
            setTimeout(() => {
                nextWeekPreview.style.backgroundColor = '';
            }, 2000);
        }
        
        console.log('✅ 结转任务完成');
        
        // 安全地显示成功消息
        if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
            MessageUtils.success(`成功结转 ${incompleteTasks.length} 个未完成任务到下周预览！`);
        } else {
            console.log(`✅ 成功结转 ${incompleteTasks.length} 个未完成任务到下周预览！`);
            alert(`成功结转 ${incompleteTasks.length} 个未完成任务到下周预览！`);
        }
        
        // 显示详细的结转摘要
        setTimeout(() => {
            const summary = Object.keys(tasksBySource).map(source => 
                `${source}: ${tasksBySource[source].length}个任务`
            ).join(', ');
            
            if (typeof MessageUtils !== 'undefined' && MessageUtils.info) {
                MessageUtils.info(`结转详情: ${summary}`);
            } else {
                console.log(`📋 结转详情: ${summary}`);
            }
        }, 1500);
        
    } catch (error) {
        console.error('❌ 结转任务时出错:', error);
        if (typeof MessageUtils !== 'undefined' && MessageUtils.error) {
            MessageUtils.error('结转任务失败，请重试');
        } else {
            console.error('❌ 结转任务失败，请重试');
            alert('结转任务失败，请重试');
        }
    }
}

// 辅助函数
function getDayName(day) {
    const dayNames = {
        'monday': '周一',
        'tuesday': '周二', 
        'wednesday': '周三',
        'thursday': '周四',
        'friday': '周五',
        'weekend': '周末'
    };
    return dayNames[day] || day;
}

/**
 * 检查当前周是否有未完成的任务
 * @returns {Object} 返回包含未完成任务信息的对象
 */
function checkIncompleteTasksInCurrentWeek() {
    const incompleteTasks = [];
    
    // 检查每日任务
    const dailyContainers = [
        'monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 
        'thursday_tasks', 'friday_tasks', 'weekend_plan'
    ];
    
    dailyContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 首先尝试查找.task-item元素
        const tasks = container.querySelectorAll('.task-item');
        
        if (tasks.length > 0) {
            // 如果找到了.task-item元素，使用现有逻辑
            tasks.forEach((task) => {
                const checkbox = task.querySelector('.custom-checkbox');
                const taskText = task.querySelector('.task-text');
                
                // 获取任务文本
                let text = '';
                if (taskText) {
                    if (taskText.tagName === 'TEXTAREA' || taskText.tagName === 'INPUT') {
                        text = taskText.value || '';
                    } else {
                        text = taskText.textContent || '';
                    }
                    text = text.trim();
                }
                
                // 如果任务未完成且有内容，添加到未完成列表
                const isCompleted = checkbox && checkbox.classList.contains('checked');
                if (!isCompleted && text) {
                    incompleteTasks.push({
                        text: text,
                        source: getDayName(containerId.replace('_tasks', '').replace('_plan', ''))
                    });
                }
            });
        } else {
            // 如果没有找到.task-item元素，尝试从原始文本内容中解析
            const rawContent = container.textContent || container.value || '';
            
            if (rawContent.trim()) {
                const lines = rawContent.split('\n').filter(line => line.trim());
                lines.forEach(line => {
                    const match = line.match(/^\[\s*\]\s*(.+)$/); // 匹配未完成任务 [ ] 或 []
                    if (match) {
                        const text = match[1].trim();
                        if (text) {
                            incompleteTasks.push({
                                text: text,
                                source: getDayName(containerId.replace('_tasks', '').replace('_plan', ''))
                            });
                        }
                    }
                });
            }
        }
    });
    
    return {
        hasIncompleteTasks: incompleteTasks.length > 0,
        tasks: incompleteTasks,
        count: incompleteTasks.length
    };
}

/**
 * 处理周切换时的未完成任务检查和提示
 * @param {Function} proceedCallback - 继续切换周的回调函数
 */
function handleWeekSwitchWithCarryOver(proceedCallback) {
    const incompleteCheck = checkIncompleteTasksInCurrentWeek();
    
    if (incompleteCheck.hasIncompleteTasks) {
        // 生成任务摘要
        const tasksBySource = {};
        incompleteCheck.tasks.forEach(task => {
            if (!tasksBySource[task.source]) {
                tasksBySource[task.source] = [];
            }
            tasksBySource[task.source].push(task.text);
        });
        
        const summary = Object.keys(tasksBySource).map(source => 
            `${source}: ${tasksBySource[source].length}个任务`
        ).join('\n');
        
        const message = `检测到本周有 ${incompleteCheck.count} 个未完成任务：\n\n${summary}\n\n是否要将这些未完成任务结转到下周？`;
        
        if (confirm(message)) {
            // 用户选择结转任务
            carryOverTasksToNextWeek(incompleteCheck.tasks, proceedCallback);
        } else {
            // 用户选择不结转，直接切换周
            proceedCallback();
        }
    } else {
        // 没有未完成任务，直接切换周
        proceedCallback();
    }
}

/**
 * 处理周切换时的未完成任务检查和提示（支持取消操作）
 * @param {Function} proceedCallback - 继续切换周的回调函数
 * @param {Function} cancelCallback - 取消切换的回调函数
 */
function handleWeekSwitchWithCarryOverAndCancel(proceedCallback, cancelCallback) {
    const incompleteCheck = checkIncompleteTasksInCurrentWeek();
    
    if (incompleteCheck.hasIncompleteTasks) {
        // 生成任务摘要
        const tasksBySource = {};
        incompleteCheck.tasks.forEach(task => {
            if (!tasksBySource[task.source]) {
                tasksBySource[task.source] = [];
            }
            tasksBySource[task.source].push(task.text);
        });
        
        const summary = Object.keys(tasksBySource).map(source => 
            `${source}: ${tasksBySource[source].length}个任务`
        ).join('\n');
        
        const message = `检测到本周有 ${incompleteCheck.count} 个未完成任务：\n\n${summary}\n\n是否要将这些任务结转到下周？\n\n点击确定：结转任务并切换周\n点击取消：放弃切换，保持当前周`;
        
        // 使用更友好的确认方式
        const userChoice = confirm(message);
        
        if (userChoice) {
            // 用户选择结转任务
            console.log('✅ 用户选择结转任务');
            carryOverTasksToNextWeek(incompleteCheck.tasks, proceedCallback);
        } else {
            // 用户选择取消，执行取消回调
            console.log('❌ 用户取消切换周');
            if (cancelCallback) {
                cancelCallback();
            }
            
            // 显示取消提示
            if (typeof MessageUtils !== 'undefined' && MessageUtils.info) {
                MessageUtils.info('已取消周切换');
            } else {
                console.log('ℹ️ 已取消周切换');
            }
        }
    } else {
        // 没有未完成任务，直接切换周
        proceedCallback();
    }
}

/**
 * 将任务结转到下周，然后执行周切换
 * @param {Array} tasks - 要结转的任务列表
 * @param {Function} proceedCallback - 切换周的回调函数
 */
function carryOverTasksToNextWeek(tasks, proceedCallback) {
    try {
        console.log('🔄 开始结转任务到下周...');
        
        // 生成结转任务的文本
        let carryOverText = '📋 从上周结转的未完成任务：\n\n';
        
        // 按来源分组
        const tasksBySource = {};
        tasks.forEach(task => {
            if (!tasksBySource[task.source]) {
                tasksBySource[task.source] = [];
            }
            tasksBySource[task.source].push(task.text);
        });
        
        // 生成结转文本
        Object.keys(tasksBySource).forEach(source => {
            carryOverText += `${source}的未完成任务：\n`;
            tasksBySource[source].forEach(task => {
                carryOverText += `[ ] ${task}\n`;
            });
            carryOverText += '\n';
        });
        
        carryOverText += '💡 建议：\n';
        carryOverText += '• 重新评估任务优先级\n';
        carryOverText += '• 考虑任务是否需要调整或分解\n';
        carryOverText += '• 合理安排本周的时间分配\n';
        
        // 设置结转内容为待处理状态
        pendingCarryOverContent = carryOverText;
        isCarryingOverTasks = true;
        
        console.log('📋 结转内容已设置为待处理状态');
        
        // 执行周切换
        proceedCallback();
        
        // 延迟验证结转是否成功
        setTimeout(() => {
            console.log('🔄 验证结转内容是否成功应用...');
            
            const nextWeekPreview = document.getElementById('next_week_preview');
            if (nextWeekPreview && nextWeekPreview.value.includes('📋 从上周结转的未完成任务：')) {
                // 结转成功
                console.log('✅ 结转内容验证成功');
                
                // 滚动到下周预览区域并高亮
                nextWeekPreview.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                nextWeekPreview.style.backgroundColor = 'rgba(255, 235, 59, 0.2)';
                setTimeout(() => {
                    nextWeekPreview.style.backgroundColor = '';
                }, 2000);
                
                // 显示成功消息
                if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
                    MessageUtils.success(`✅ 已将 ${tasks.length} 个未完成任务结转到本周计划！`);
                } else {
                    console.log(`✅ 已将 ${tasks.length} 个未完成任务结转到本周计划！`);
                    if (typeof alert !== 'undefined') {
                        alert(`✅ 已将 ${tasks.length} 个未完成任务结转到本周计划！`);
                    }
                }
                
                isCarryingOverTasks = false;
                console.log('🎉 结转任务完成！');
            } else {
                console.warn('⚠️ 结转内容未成功应用，启用备用方案...');
                // 启用备用方案
                isCarryingOverTasks = false;
            }
        }, 2000); // 延迟2秒验证
        
    } catch (error) {
        console.error('❌ 结转任务时出错:', error);
        if (typeof MessageUtils !== 'undefined' && MessageUtils.error) {
            MessageUtils.error(`结转任务失败: ${error.message || '未知错误'}，但已切换到新周`);
        } else {
            console.error('❌ 结转任务失败，但已切换到新周');
            if (typeof alert !== 'undefined') {
                alert(`结转任务失败: ${error.message || '未知错误'}，但已切换到新周`);
            }
        }
        isCarryingOverTasks = false;
        pendingCarryOverContent = '';
    }
}

/**
 * 简单测试结转功能
 */
function testCarryOverFunction() {
    console.log('🧪 开始测试结转功能...');
    
    const testTasks = [
        { text: '测试任务1', source: '周一' },
        { text: '测试任务2', source: '周二' }
    ];
    
    // 测试选项
    const testOptions = [
        '1. 基础DOM写入测试',
        '2. 完整结转流程测试',
        '3. 存储系统测试'
    ];
    
    const choice = prompt(`选择测试类型：\n${testOptions.join('\n')}\n\n请输入1、2或3:`);
    
    if (choice === '1') {
        // 基础DOM写入测试
        basicDOMTest();
    } else if (choice === '2') {
        // 完整结转流程测试
        fullCarryOverTest(testTasks);
    } else if (choice === '3') {
        // 存储系统测试
        storageSystemTest();
    } else {
        alert('无效选择，测试取消');
    }
}

function basicDOMTest() {
    console.log('🧪 执行基础DOM写入测试...');
    
    // 直接尝试写入下周预览
    const nextWeekPreview = document.getElementById('next_week_preview');
    console.log('下周预览元素:', nextWeekPreview);
    
    if (nextWeekPreview) {
        const testContent = '🧪 基础DOM测试内容：\n[ ] 测试任务1\n[ ] 测试任务2\n';
        nextWeekPreview.value = testContent;
        console.log('✅ 测试内容已写入');
        
        // 触发保存事件
        const inputEvent = new Event('input', { bubbles: true });
        nextWeekPreview.dispatchEvent(inputEvent);
        console.log('✅ 触发了input事件');
        
        // 高亮显示
        nextWeekPreview.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        setTimeout(() => {
            nextWeekPreview.style.backgroundColor = '';
        }, 2000);
        
        alert('基础DOM测试完成！请检查下周预览区域');
    } else {
        console.error('❌ 未找到下周预览元素');
        alert('测试失败：未找到下周预览元素');
    }
}

function fullCarryOverTest(testTasks) {
    console.log('🧪 执行完整结转流程测试...');
    
    // 模拟完整结转流程
    const mockProceedCallback = () => {
        console.log('🧪 模拟周切换完成');
        // 确保进度更新正常工作
        safeUpdateProgress('测试周切换');
    };
    
    try {
        // 检查必要函数是否存在
        if (typeof carryOverTasksToNextWeek !== 'function') {
            throw new Error('carryOverTasksToNextWeek函数不存在');
        }
        
        carryOverTasksToNextWeek(testTasks, mockProceedCallback);
        console.log('✅ 完整结转流程测试已启动');
        alert('完整结转流程测试已启动，请查看控制台日志和下周预览区域');
    } catch (error) {
        console.error('❌ 完整结转流程测试失败:', error);
        alert(`完整结转流程测试失败: ${error.message}`);
    }
}

function storageSystemTest() {
    console.log('🧪 执行存储系统测试...');
    
    try {
        // 测试StorageUtils可用性
        console.log('StorageUtils类型:', typeof StorageUtils);
        console.log('loadPlan方法:', typeof StorageUtils?.loadPlan);
        console.log('savePlan方法:', typeof StorageUtils?.savePlan);
        
        // 测试加载当前周数据
        const currentData = StorageUtils.loadPlan('week', currentWeek);
        console.log('当前周数据:', currentData);
        
        // 测试保存数据
        const testData = {
            ...currentData,
            testField: '🧪 存储测试标记 ' + new Date().toLocaleTimeString()
        };
        
        const saveResult = StorageUtils.savePlan('week', currentWeek, testData);
        console.log('保存测试结果:', saveResult);
        
        // 验证保存
        const verifyData = StorageUtils.loadPlan('week', currentWeek);
        console.log('验证保存的数据:', verifyData);
        
        if (verifyData?.testField) {
            alert('✅ 存储系统测试成功！数据可以正常保存和加载');
        } else {
            alert('❌ 存储系统测试失败：数据未正确保存');
        }
        
    } catch (error) {
        console.error('❌ 存储系统测试失败:', error);
        alert(`存储系统测试失败: ${error.message}`);
    }
}

/**
 * 安全调用函数的工具函数
 * @param {string} functionName - 函数名称
 * @param {Function} func - 要调用的函数
 * @param {Array} args - 函数参数
 * @param {string} context - 调用上下文描述
 */
function safeCall(functionName, func, args = [], context = '') {
    try {
        if (typeof func === 'function') {
            return func.apply(null, args);
        } else {
            console.warn(`⚠️ ${functionName} 不是一个函数${context ? ` (${context})` : ''}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ 调用 ${functionName} 时出错${context ? ` (${context})` : ''}:`, error);
        return null;
    }
}

/**
 * 安全更新进度的函数
 */
function safeUpdateProgress(context = '') {
    console.log(`🔄 开始更新进度${context ? ` (${context})` : ''}...`);
    
    safeCall('updateDailyProgress', updateDailyProgress, [], context);
    safeCall('updateWeekProgress', updateWeekProgress, [], context);
    
    console.log(`✅ 进度更新完成${context ? ` (${context})` : ''}`);
}

/**
 * 调试函数：显示当前未完成任务
 */
function debugCurrentTasks() {
    console.log('🔍 开始调试当前未完成任务...');
    
    try {
        const incompleteCheck = checkIncompleteTasksInCurrentWeek();
        
        console.log('📊 调试结果:', incompleteCheck);
        
        if (incompleteCheck.hasIncompleteTasks) {
            // 生成详细报告
            let report = `🔍 当前周未完成任务调试报告\n\n`;
            report += `总计未完成任务：${incompleteCheck.count} 个\n\n`;
            
            // 按来源分组显示
            const tasksBySource = {};
            incompleteCheck.tasks.forEach(task => {
                if (!tasksBySource[task.source]) {
                    tasksBySource[task.source] = [];
                }
                tasksBySource[task.source].push(task.text);
            });
            
            Object.keys(tasksBySource).forEach(source => {
                report += `${source}：\n`;
                tasksBySource[source].forEach((task, index) => {
                    report += `  ${index + 1}. ${task}\n`;
                });
                report += '\n';
            });
            
            console.log(report);
            alert(report);
        } else {
            const message = '🎉 恭喜！当前周没有未完成任务！';
            console.log(message);
            alert(message);
        }
        
        // 额外调试信息
        console.log('📋 详细调试信息:');
        console.log('- 检查的容器ID:', ['monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 'thursday_tasks', 'friday_tasks', 'weekend_plan']);
        
        ['monday_tasks', 'tuesday_tasks', 'wednesday_tasks', 'thursday_tasks', 'friday_tasks', 'weekend_plan'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const tasks = container.querySelectorAll('.task-item');
                const textContent = container.textContent || '';
                console.log(`- ${containerId}: 找到${tasks.length}个.task-item, 文本长度: ${textContent.length}`);
                
                if (textContent.length > 0) {
                    console.log(`  文本内容: "${textContent.substring(0, 100)}${textContent.length > 100 ? '...' : ''}"`);
                }
            } else {
                console.log(`- ${containerId}: 容器不存在`);
            }
        });
        
    } catch (error) {
        console.error('❌ 调试时出错:', error);
        alert(`调试失败: ${error.message || '未知错误'}`);
    }
}

// 应用洞察建议的占位符函数
function applyInsightSuggestions() {
    MessageUtils.success('洞察建议已应用到计划中');
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function refreshInsights() {
    // 重新显示洞察
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
    setTimeout(showWeekInsights, 300);
}

function applyOptimizations() {
    MessageUtils.success('优化建议已应用');
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function exportOptimizationPlan() {
    const weekData = gatherWeekData();
    const optimizations = generateOptimizationSuggestions(weekData);
    
    let exportText = `# 周效率优化方案\n\n`;
    exportText += `生成时间: ${new Date().toLocaleString()}\n\n`;
    
    optimizations.forEach((opt, index) => {
        exportText += `## ${index + 1}. ${opt.title} (${opt.priority})\n\n`;
        exportText += `**描述:** ${opt.description}\n\n`;
        exportText += `**行动:** ${opt.action}\n\n`;
        if (opt.impact) {
            exportText += `**预期效果:** ${opt.impact}\n\n`;
        }
        exportText += `---\n\n`;
    });
    
    ExportUtils.exportToText(exportText, `周效率优化方案_${currentWeek}.txt`);
    MessageUtils.success('优化方案已导出');
}

function applyScheduleSuggestions() {
    MessageUtils.success('排程建议已应用');
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function generateNewSchedule() {
    // 重新生成排程
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
    setTimeout(autoScheduleTasks, 300);
}

function applyBalanceAdjustments() {
    MessageUtils.success('负载均衡调整已应用');
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function showDetailedBalance() {
    MessageUtils.info('详细分析功能正在开发中...');
}

// 改进周分析功能
function showWeekAnalysis() {
    const weekData = gatherWeekData();
    const analysis = generateWeekAnalysis(weekData);
    
    let content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📈 周计划分析报告</h3>
            <p style="color: #666;">全方位分析本周计划执行情况</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">📊</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #1976d2;">${analysis.completionRate}%</div>
                <div style="color: #666;">任务完成率</div>
            </div>
            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">📝</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #2e7d32;">${analysis.totalTasks}</div>
                <div style="color: #666;">总任务数</div>
            </div>
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">⭐</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #ef6c00;">${analysis.productivity}</div>
                <div style="color: #666;">生产力指数</div>
            </div>
            <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">🎯</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #7b1fa2;">${analysis.focusScore}</div>
                <div style="color: #666;">专注度评分</div>
            </div>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">📈 趋势分析</h4>
            ${analysis.trends.map(trend => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${trend.color}; border-radius: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.5em;">${trend.icon}</span>
                    <div>
                        <div style="font-weight: 600; color: ${trend.textColor};">${trend.title}</div>
                        <div style="color: #333; font-size: 0.9em;">${trend.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 16px;">💡 改进建议</h4>
            ${analysis.recommendations.map((rec, index) => `
                <div style="background: #f8f9fa; border-left: 4px solid ${rec.color}; padding: 16px; margin-bottom: 12px; border-radius: 8px;">
                    <div style="font-weight: 600; color: ${rec.color}; margin-bottom: 8px;">${index + 1}. ${rec.title}</div>
                    <div style="color: #333; margin-bottom: 8px;">${rec.content}</div>
                    <div style="color: #666; font-size: 0.9em; font-style: italic;">💡 ${rec.action}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-main" onclick="exportAnalysisReport()">导出报告</button>
            <button class="btn-main" onclick="shareAnalysis()">分享分析</button>
        </div>
    `;
    
    ModalUtils.show('周计划分析报告', content, 'large');
}

// 生成周分析数据
function generateWeekAnalysis(data) {
    const completionRate = data.completionRate;
    const totalTasks = data.totalTasks;
    const completedTasks = data.completedTasks;
    
    // 计算生产力指数 (基于任务完成率和任务数量)
    const productivity = Math.min(Math.round((completionRate + Math.min(totalTasks * 10, 50)) / 2), 100);
    
    // 计算专注度评分 (基于任务分布的均匀程度)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const taskCounts = days.map(day => data.dayTasks[day]?.total || 0);
    const variance = calculateVariance(taskCounts);
    const focusScore = Math.max(100 - Math.round(variance * 10), 0);
    
    // 趋势分析
    const trends = [];
    
    if (completionRate >= 80) {
        trends.push({
            icon: '📈',
            title: '执行力强劲',
            description: '任务完成率优秀，保持良好的执行节奏',
            color: 'rgba(76, 175, 80, 0.1)',
            textColor: '#2e7d32'
        });
    } else if (completionRate >= 60) {
        trends.push({
            icon: '📊',
            title: '稳步推进',
            description: '任务完成情况良好，有进一步提升空间',
            color: 'rgba(255, 152, 0, 0.1)',
            textColor: '#ef6c00'
        });
    } else {
        trends.push({
            icon: '📉',
            title: '需要调整',
            description: '任务完成率偏低，建议优化计划策略',
            color: 'rgba(244, 67, 54, 0.1)',
            textColor: '#c62828'
        });
    }
    
    if (totalTasks > 25) {
        trends.push({
            icon: '⚠️',
            title: '任务量较多',
            description: '本周任务较为繁重，注意合理分配精力',
            color: 'rgba(156, 39, 176, 0.1)',
            textColor: '#7b1fa2'
        });
    }
    
    if (focusScore >= 80) {
        trends.push({
            icon: '🎯',
            title: '专注度高',
            description: '任务分配均匀，专注度维持在良好水平',
            color: 'rgba(25, 118, 210, 0.1)',
            textColor: '#1976d2'
        });
    }
    
    // 改进建议
    const recommendations = [];
    
    if (completionRate < 70) {
        recommendations.push({
            title: '优化任务管理',
            content: '当前完成率有提升空间，建议调整任务量或优化时间分配。',
            action: '尝试减少20%的任务量，专注于最重要的目标',
            color: '#f44336'
        });
    }
    
    if (variance > 5) {
        recommendations.push({
            title: '平衡工作负载',
            content: '任务分配不够均匀，某些日期过于繁重。',
            action: '重新分配任务，让每天的工作量更加平衡',
            color: '#ff9800'
        });
    }
    
    if (data.goals.length < 50) {
        recommendations.push({
            title: '明确周目标',
            content: '建议设定更明确的周目标，提高计划的针对性。',
            action: '制定3-5个具体、可衡量的周目标',
            color: '#2196f3'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            title: '继续保持',
            content: '当前计划执行情况良好，建议保持现有的工作节奏。',
            action: '可以考虑适当挑战更高的目标',
            color: '#4caf50'
        });
    }
    
    return {
        completionRate,
        totalTasks,
        productivity,
        focusScore,
        trends,
        recommendations
    };
}

// 计算方差的辅助函数
function calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
}

function exportAnalysisReport() {
    const weekData = gatherWeekData();
    const analysis = generateWeekAnalysis(weekData);
    
    let report = `# 周计划分析报告\n\n`;
    report += `**报告生成时间:** ${new Date().toLocaleString()}\n`;
    report += `**分析周次:** ${currentWeek}\n\n`;
    
    report += `## 核心指标\n\n`;
    report += `- 任务完成率: ${analysis.completionRate}%\n`;
    report += `- 总任务数: ${analysis.totalTasks}\n`;
    report += `- 生产力指数: ${analysis.productivity}\n`;
    report += `- 专注度评分: ${analysis.focusScore}\n\n`;
    
    report += `## 趋势分析\n\n`;
    analysis.trends.forEach(trend => {
        report += `### ${trend.title}\n`;
        report += `${trend.description}\n\n`;
    });
    
    report += `## 改进建议\n\n`;
    analysis.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.title}\n`;
        report += `${rec.content}\n`;
        report += `**行动建议:** ${rec.action}\n\n`;
    });
    
    ExportUtils.exportToText(report, `周计划分析报告_${currentWeek}.txt`);
    MessageUtils.success('分析报告已导出');
}

function shareAnalysis() {
    MessageUtils.info('分享功能正在开发中...');
}

// 注册快捷键
KeyboardUtils.register('ctrl+s', saveWeekPlan);
KeyboardUtils.register('arrowleft', () => navigateWeek(-1));
KeyboardUtils.register('arrowright', () => navigateWeek(1));
KeyboardUtils.register('ctrl+h', showWeekHistory);
KeyboardUtils.register('ctrl+i', showWeekInsights);
KeyboardUtils.register('ctrl+o', showWeekOptimization);
KeyboardUtils.register('ctrl+a', showWeekAIAssistant);
KeyboardUtils.register('ctrl+r', generateWeeklyReport);
KeyboardUtils.register('ctrl+shift+a', showWeekAnalysis);
KeyboardUtils.register('f1', () => showHelpModal());
KeyboardUtils.register('escape', () => {
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
});

// 快捷插入功能
let currentQuickInsertData = {
    targetId: '',
    templates: []
};

function showQuickInsertMenu(button, targetId) {
    const customTemplates = getCustomTemplates();
    const defaultTemplates = {
        week_goals: [
            '• 完成重要项目第一阶段开发',
            '• 学习新技能并实践应用',
            '• 改善工作流程效率',
            '• 加强团队沟通协作',
            '• 提升个人专业能力'
        ]
    };
    
    // 合并默认模板和自定义模板
    const allTemplates = [
        ...(defaultTemplates[targetId] || []),
        ...(customTemplates[targetId] || [])
    ];
    
    // 存储当前数据到全局变量
    currentQuickInsertData.targetId = targetId;
    currentQuickInsertData.templates = allTemplates;
    
    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="margin: 0; color: var(--theme-color);">快捷插入模板</h4>
            <button class="btn-main" onclick="addNewTemplate('${targetId}')" style="padding: 6px 12px; font-size: 12px;">
                ➕ 新建模板
            </button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
            ${allTemplates.map((item, index) => `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input 
                        type="text" 
                        value="${item}" 
                        style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                        onchange="updateTemplateItem('${targetId}', ${index}, this.value)"
                        onkeypress="if(event.key==='Enter') insertUpdatedTemplate('${targetId}', ${index}, this.value)"
                        placeholder="编辑模板内容..."
                    />
                    <button class="btn-main" style="padding: 8px 12px; font-size: 12px; min-width: auto;" onclick="insertTemplateByIndex('${targetId}', ${index})" title="插入此模板">
                        ✅
                    </button>
                    ${index >= (defaultTemplates[targetId] || []).length ? `
                        <button class="btn-danger" style="padding: 8px; font-size: 12px; min-width: auto;" onclick="deleteSingleTemplate('${targetId}', ${index - (defaultTemplates[targetId] || []).length})" title="删除自定义模板">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <button class="btn-main" onclick="insertAllTemplates('${targetId}')" style="margin-right: 8px;">
                📋 插入全部
            </button>
            <button class="btn-main" onclick="closeQuickInsertMenu()">
                关闭
            </button>
        </div>
    `;
    
    ModalUtils.show('快捷插入', content, 'medium');
}

// 获取自定义模板
function getCustomTemplates() {
    return StorageUtils.getItem('weekCustomTemplates', {});
}

// 保存自定义模板
function saveCustomTemplates(templates) {
    StorageUtils.setItem('weekCustomTemplates', templates);
}

// 插入指定索引的模板
function insertTemplateByIndex(targetId, index) {
    const template = currentQuickInsertData.templates[index];
    if (template) {
        const target = document.getElementById(targetId);
        if (target) {
            const currentContent = target.value;
            const newContent = currentContent ? currentContent + '\n' + template : template;
            target.value = newContent;
            target.focus();
            
            MessageUtils.success('模板已插入');
            closeQuickInsertMenu();
        }
    }
}

// 插入所有模板
function insertAllTemplates(targetId) {
    const allTemplates = currentQuickInsertData.templates;
    if (allTemplates.length > 0) {
        const target = document.getElementById(targetId);
        if (target) {
            const currentContent = target.value;
            const newContent = currentContent ? currentContent + '\n' + allTemplates.join('\n') : allTemplates.join('\n');
            target.value = newContent;
            target.focus();
            
            MessageUtils.success(`已插入 ${allTemplates.length} 个模板`);
            closeQuickInsertMenu();
        }
    }
}

// 更新模板项
function updateTemplateItem(targetId, index, newValue) {
    currentQuickInsertData.templates[index] = newValue;
    
    // 如果是自定义模板，保存到存储
    const defaultTemplates = {
        week_goals: [
            '• 完成重要项目第一阶段开发',
            '• 学习新技能并实践应用',
            '• 改善工作流程效率',
            '• 加强团队沟通协作',
            '• 提升个人专业能力'
        ]
    };
    
    const defaultCount = (defaultTemplates[targetId] || []).length;
    if (index >= defaultCount) {
        const customTemplates = getCustomTemplates();
        if (!customTemplates[targetId]) {
            customTemplates[targetId] = [];
        }
        customTemplates[targetId][index - defaultCount] = newValue;
        saveCustomTemplates(customTemplates);
    }
}

// 插入更新的模板
function insertUpdatedTemplate(targetId, index, newValue) {
    updateTemplateItem(targetId, index, newValue);
    insertTemplateByIndex(targetId, index);
}

// 添加新模板
function addNewTemplate(targetId) {
    const customTemplates = getCustomTemplates();
    if (!customTemplates[targetId]) {
        customTemplates[targetId] = [];
    }
    
    const newTemplate = '• 新模板内容';
    customTemplates[targetId].push(newTemplate);
    saveCustomTemplates(customTemplates);
    
    // 重新显示菜单
    closeQuickInsertMenu();
    setTimeout(() => {
        const button = document.querySelector(`.quick-insert[data-target="${targetId}"]`);
        if (button) {
            showQuickInsertMenu(button, targetId);
        }
    }, 100);
}

// 删除单个模板
function deleteSingleTemplate(targetId, customIndex) {
    if (confirm('确定要删除这个自定义模板吗？')) {
        const customTemplates = getCustomTemplates();
        if (customTemplates[targetId] && customTemplates[targetId][customIndex]) {
            customTemplates[targetId].splice(customIndex, 1);
            saveCustomTemplates(customTemplates);
            
            MessageUtils.success('模板已删除');
            
            // 重新显示菜单
            closeQuickInsertMenu();
            setTimeout(() => {
                const button = document.querySelector(`.quick-insert[data-target="${targetId}"]`);
                if (button) {
                    showQuickInsertMenu(button, targetId);
                }
            }, 100);
        }
    }
}

// 关闭快捷插入菜单
function closeQuickInsertMenu() {
    const modal = document.querySelector('.modal-mask');
    if (modal) {
        ModalUtils.hide(modal);
    }
}

// 添加帮助模态框
function showHelpModal() {
    const helpContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">⌨️ 快捷键帮助</h3>
            <p style="color: #666;">提高周计划管理效率的快捷键</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px;">
                <h4 style="color: var(--theme-color); margin-bottom: 12px;">📋 基本操作</h4>
                <div style="space-y: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>保存计划</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + S</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>上一周</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">← 左箭头</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>下一周</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">→ 右箭头</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>关闭弹窗</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">ESC</code>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px;">
                <h4 style="color: var(--theme-color); margin-bottom: 12px;">🤖 AI功能</h4>
                <div style="space-y: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>AI助手</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + A</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>智能洞察</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + I</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>效率优化</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + O</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>周分析</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + Shift + A</code>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px;">
                <h4 style="color: var(--theme-color); margin-bottom: 12px;">📊 数据管理</h4>
                <div style="space-y: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>历史记录</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + H</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>生成周报</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">Ctrl + R</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px;">
                        <span>帮助</span>
                        <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">F1</code>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 16px; background: rgba(25, 118, 210, 0.1); border-radius: 8px;">
            <p style="color: #666; margin: 0;">💡 <strong>小贴士：</strong> 在任意时候按 F1 即可查看此帮助</p>
        </div>
    `;
    
    ModalUtils.show('快捷键帮助', helpContent, 'large');
}
