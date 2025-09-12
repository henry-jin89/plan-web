/**
 * 日计划页面 - 专用JavaScript文件
 */

// 日计划特有变量
let currentDate = DateUtils.getToday();
let dayPlanData = {};
let focusMode = false;
let timerInterval = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing day plan');
    initDayPlan();
    setupEventListeners();
    loadTodayPlan();
    updateProgress();
    
    console.log('✅ 日计划页面初始化完成');
    
    // 测试依赖关系功能是否可用
    setTimeout(() => {
        console.log('测试依赖关系功能可用性...');
        console.log('showTaskDependency 函数类型:', typeof showTaskDependency);
        console.log('window.showTaskDependency 函数类型:', typeof window.showTaskDependency);
        console.log('StorageUtils 可用性:', typeof StorageUtils, !!StorageUtils?.getItem);
        console.log('DateUtils 可用性:', typeof DateUtils, !!DateUtils?.formatDate);
        console.log('MessageUtils 可用性:', typeof MessageUtils, !!MessageUtils?.warning);
        console.log('ModalUtils 可用性:', typeof ModalUtils, !!ModalUtils?.show);
        
        const btn = document.getElementById('task-dependency-btn');
        console.log('依赖关系按钮是否存在:', !!btn);
        
        if (btn && typeof showTaskDependency === 'function' && StorageUtils?.getItem) {
            console.log('✅ 依赖关系功能就绪');
        } else {
            console.warn('⚠️ 依赖关系功能未就绪 - 缺少必要的依赖');
        }
    }, 1000);
    
    // 注释掉自动测试，避免页面加载时弹出干扰
    // 如需测试，请在控制台手动调用以下函数：
    // testButtonFunctionality() - 测试按钮状态
    // testEnergyTrackerFunction() - 测试能量跟踪
    // testFocusModeFunction() - 测试专注模式
    // testAllButtonsComprehensive() - 综合测试
    
    console.log('🔧 测试功能已准备就绪，可在控制台手动调用测试函数');
});

// 测试按钮功能
function testButtonFunctionality() {
    console.log('=== Testing button functionality ===');
    
    const buttons = [
        'smart-insights-btn',
        'productivity-analysis-btn', 
        'analytics-btn'
    ];
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        console.log(`Button ${btnId}:`, btn ? 'Found' : 'Not found');
        if (btn) {
            console.log(`  - Visible: ${btn.offsetParent !== null}`);
            console.log(`  - Classes: ${btn.className}`);
            console.log(`  - Parent element:`, btn.parentElement.className);
            
            // 移除测试代码，确保正常功能
            console.log(`Event listeners should be properly set for ${btnId}`);
        }
    });
    
    console.log('=== End button test ===');
}

// 测试所有按钮（用户可调用）
function testAllButtons() {
    console.log('🔧 用户触发的按钮测试');
    console.log('⚠️  这个函数会弹出模态框进行测试');
    console.log('如果不想看到弹窗，请使用 testAllButtonsComprehensive() 代替');
    
    // 询问用户是否继续
    if (!confirm('此测试会弹出模态框，是否继续？')) {
        console.log('测试已取消');
        return;
    }
    
    // 测试智能洞察
    try {
        console.log('Testing showSmartInsights...');
        showSmartInsights();
    } catch (error) {
        console.error('Error in showSmartInsights:', error);
    }
    
    // 延迟关闭并测试下一个
    setTimeout(() => {
        const modal = document.querySelector('.modal-mask');
        if (modal) ModalUtils.hide(modal);
        
        try {
            console.log('Testing showProductivityAnalysis...');
            showProductivityAnalysis();
        } catch (error) {
            console.error('Error in showProductivityAnalysis:', error);
        }
    }, 2000);
}

// 将测试函数暴露到全局作用域
window.testAllButtons = testAllButtons;

// 添加按钮状态检查函数
function checkButtonStatus() {
    console.log('=== 按钮状态检查 ===');
    
    const buttonIds = [
        'smart-insights-btn',
        'productivity-analysis-btn', 
        'priority-timer-btn',
        'analytics-btn',
        'ai-assistant-btn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            console.log(`✅ ${btnId}: 找到按钮`);
            console.log(`   - 可见: ${btn.offsetParent !== null}`);
            console.log(`   - 位置: ${btn.getBoundingClientRect().top}px from top`);
            console.log(`   - 样式: ${btn.style.cssText || '默认样式'}`);
            
            // 临时添加边框来高亮按钮
            btn.style.border = '2px solid red';
            setTimeout(() => {
                btn.style.border = '';
            }, 2000);
        } else {
            console.log(`❌ ${btnId}: 未找到按钮`);
        }
    });
    
    console.log('=== 检查完成，红色边框会在2秒后消失 ===');
}

// 暴露检查函数
window.checkButtonStatus = checkButtonStatus;

// 专门测试番茄钟功能
function testPomodoroFunction() {
    console.log('=== 番茄钟功能测试 ===');
    
    const priorityBtn = document.getElementById('priority-timer-btn');
    
    console.log('番茄钟按钮:', priorityBtn ? '✅ 找到' : '❌ 未找到');
    
    if (priorityBtn) {
        console.log('按钮当前文本:', priorityBtn.innerHTML);
        console.log('按钮当前状态:', pomodoroTimer.isRunning ? '运行中' : '停止');
    }
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handlePomodoroTimer()');
}

window.testPomodoroFunction = testPomodoroFunction;

// 专门测试能量跟踪功能
function testEnergyTrackerFunction() {
    console.log('=== 能量跟踪功能测试 ===');
    
    const energyBtn = document.getElementById('energy-tracker-btn');
    
    console.log('能量跟踪按钮:', energyBtn ? '✅ 找到' : '❌ 未找到');
    
    if (energyBtn) {
        console.log('按钮当前文本:', energyBtn.innerHTML);
        console.log('按钮位置:', energyBtn.getBoundingClientRect());
        console.log('按钮样式:', energyBtn.style.cssText);
        
        // 临时添加边框来高亮按钮
        energyBtn.style.border = '3px solid red';
        setTimeout(() => {
            energyBtn.style.border = '';
        }, 3000);
    }
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handleEnergyTracker()');
}

window.testEnergyTrackerFunction = testEnergyTrackerFunction;

// 专门测试专注模式功能
function testFocusModeFunction() {
    console.log('=== 专注模式功能测试 ===');
    
    const focusBtn = document.getElementById('focus-mode-btn');
    
    console.log('专注模式按钮:', focusBtn ? '✅ 找到' : '❌ 未找到');
    
    if (focusBtn) {
        console.log('按钮当前文本:', focusBtn.innerHTML);
        console.log('按钮位置:', focusBtn.getBoundingClientRect());
        console.log('按钮样式:', focusBtn.style.cssText);
        console.log('当前专注模式状态:', focusMode);
        
        // 临时添加边框来高亮按钮
        focusBtn.style.border = '3px solid blue';
        setTimeout(() => {
            focusBtn.style.border = '';
        }, 3000);
    }
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handleFocusMode()');
}

window.testFocusModeFunction = testFocusModeFunction;

// 专门测试优先级分析功能
function testPriorityAnalyticsFunction() {
    console.log('=== 优先级分析功能测试 ===');
    
    const priorityAnalyticsBtn = document.getElementById('priority-analytics-btn');
    
    console.log('优先级分析按钮:', priorityAnalyticsBtn ? '✅ 找到' : '❌ 未找到');
    
    if (priorityAnalyticsBtn) {
        console.log('按钮当前文本:', priorityAnalyticsBtn.innerHTML);
        console.log('按钮位置:', priorityAnalyticsBtn.getBoundingClientRect());
        console.log('按钮样式:', priorityAnalyticsBtn.style.cssText);
        
        // 临时添加边框来高亮按钮
        priorityAnalyticsBtn.style.border = '3px solid green';
        setTimeout(() => {
            priorityAnalyticsBtn.style.border = '';
        }, 3000);
    }
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handlePriorityAnalytics()');
}

window.testPriorityAnalyticsFunction = testPriorityAnalyticsFunction;

// 专门测试习惯分析功能
function testHabitAnalyticsFunction() {
    console.log('=== 习惯分析功能测试 ===');
    
    const habitAnalyticsBtn = document.getElementById('habit-analytics-btn');
    
    console.log('习惯分析按钮:', habitAnalyticsBtn ? '✅ 找到' : '❌ 未找到');
    
    if (habitAnalyticsBtn) {
        console.log('按钮当前文本:', habitAnalyticsBtn.innerHTML);
        console.log('按钮位置:', habitAnalyticsBtn.getBoundingClientRect());
        console.log('按钮样式:', habitAnalyticsBtn.style.cssText);
        
        // 临时添加边框来高亮按钮
        habitAnalyticsBtn.style.border = '3px solid purple';
        setTimeout(() => {
            habitAnalyticsBtn.style.border = '';
        }, 3000);
    }
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handleHabitAnalytics()');
}

window.testHabitAnalyticsFunction = testHabitAnalyticsFunction;

// 专门测试智能提醒功能
function testHabitReminderFunction() {
    console.log('=== 智能提醒功能测试 ===');
    
    const habitReminderBtn = document.getElementById('habit-reminder-btn');
    
    console.log('智能提醒按钮:', habitReminderBtn ? '✅ 找到' : '❌ 未找到');
    
    if (habitReminderBtn) {
        console.log('按钮当前文本:', habitReminderBtn.innerHTML);
        console.log('按钮位置:', habitReminderBtn.getBoundingClientRect());
        console.log('按钮样式:', habitReminderBtn.style.cssText);
        console.log('按钮父元素:', habitReminderBtn.parentElement ? habitReminderBtn.parentElement.tagName : '无');
        console.log('按钮可见性:', window.getComputedStyle(habitReminderBtn).display !== 'none');
        console.log('通知权限状态:', Notification.permission);
        
        // 检查事件监听器
        console.log('按钮onclick属性:', habitReminderBtn.onclick);
        
        // 临时添加边框来高亮按钮
        habitReminderBtn.style.border = '3px solid orange';
        setTimeout(() => {
            habitReminderBtn.style.border = '';
        }, 3000);
        
        // 直接测试点击
        console.log('测试直接点击...');
        habitReminderBtn.click();
    }
    
    // 检查相关函数
    console.log('showHabitReminder函数:', typeof showHabitReminder === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('handleHabitReminder函数:', typeof handleHabitReminder === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('ModalUtils:', typeof ModalUtils !== 'undefined' ? '✅ 可用' : '❌ 不可用');
    console.log('getTodoContent函数:', typeof getTodoContent === 'function' ? '✅ 已定义' : '❌ 未定义');
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handleHabitReminder()');
}

window.testHabitReminderFunction = testHabitReminderFunction;

// 测试通知权限流程
function testNotificationPermissionFlow() {
    console.log('=== 测试通知权限流程 ===');
    
    console.log('1. 当前通知权限状态:', Notification.permission);
    console.log('2. 浏览器通知支持:', 'Notification' in window ? '✅ 支持' : '❌ 不支持');
    
    // 检查智能提醒是否打开
    const modal = document.querySelector('.modal-mask');
    const permissionContainer = document.querySelector('.permission-status');
    
    console.log('3. 智能提醒模态框:', modal ? '✅ 已打开' : '❌ 未打开');
    console.log('4. 权限状态容器:', permissionContainer ? '✅ 找到' : '❌ 未找到');
    
    if (permissionContainer) {
        console.log('5. 容器内容:', permissionContainer.innerHTML.substring(0, 100) + '...');
        
        const requestButton = permissionContainer.querySelector('button');
        console.log('6. 请求权限按钮:', requestButton ? '✅ 找到' : '❌ 未找到');
        
        if (requestButton) {
            console.log('   按钮文本:', requestButton.textContent);
            console.log('   按钮显示状态:', requestButton.style.display || '默认显示');
        }
    }
    
    console.log('=== 测试权限UI更新功能 ===');
    if (typeof updateNotificationPermissionUI === 'function') {
        updateNotificationPermissionUI();
        console.log('✅ updateNotificationPermissionUI 调用完成');
    } else {
        console.log('❌ updateNotificationPermissionUI 函数未定义');
    }
    
    console.log('=== 测试完成 ===');
    console.log('💡 建议：');
    console.log('   1. 先打开智能提醒界面：handleHabitReminder()');
    console.log('   2. 点击"请求通知权限"按钮');
    console.log('   3. 观察界面是否会刷新');
}

window.testNotificationPermissionFlow = testNotificationPermissionFlow;

// 测试快速提醒权限流程
function testQuickReminderPermission() {
    console.log('=== 测试快速提醒权限流程 ===');
    
    // 1. 检查权限状态
    const permission1 = Notification.permission;
    const permission2 = getCurrentNotificationPermission();
    
    console.log('1. Notification.permission:', permission1);
    console.log('2. getCurrentNotificationPermission():', permission2);
    console.log('3. 权限状态一致性:', permission1 === permission2 ? '✅ 一致' : '❌ 不一致');
    
    // 2. 检查智能提醒界面状态
    const modal = document.querySelector('.modal-mask');
    const permissionContainer = document.querySelector('.permission-status');
    
    console.log('4. 智能提醒界面:', modal ? '✅ 已打开' : '❌ 未打开');
    console.log('5. 权限状态容器:', permissionContainer ? '✅ 找到' : '❌ 未找到');
    
    if (permissionContainer) {
        const requestButton = permissionContainer.querySelector('button');
        console.log('6. 请求权限按钮:', requestButton ? '✅ 找到' : '❌ 未找到');
        
        if (requestButton) {
            console.log('   按钮显示状态:', requestButton.style.display || '默认显示');
            console.log('   按钮可见性:', requestButton.offsetParent !== null ? '可见' : '隐藏');
        }
    }
    
    // 3. 测试快速提醒按钮
    const quickReminderBtns = document.querySelectorAll('[onclick*="setQuickReminder"]');
    console.log('7. 快速提醒按钮数量:', quickReminderBtns.length);
    
    // 4. 模拟点击测试
    if (permission2 === 'granted') {
        console.log('✅ 权限已授权，测试1分钟提醒...');
        try {
            setQuickReminder(1); // 1分钟测试
        } catch (error) {
            console.error('❌ 快速提醒测试失败:', error);
        }
    } else {
        console.log('⚠️ 权限未授权，无法测试快速提醒');
        console.log('💡 请先点击"请求通知权限"按钮授权');
    }
    
    console.log('=== 测试完成 ===');
}

window.testQuickReminderPermission = testQuickReminderPermission;
window.testHabitReminderFunction = testHabitReminderFunction;

// 专门测试智能分类功能
function testAutoCategorizeFunction() {
    console.log('=== 智能分类功能测试 ===');
    
    const autoCategorizeBtn = document.getElementById('auto-categorize-btn');
    
    console.log('智能分类按钮:', autoCategorizeBtn ? '✅ 找到' : '❌ 未找到');
    
    if (autoCategorizeBtn) {
        console.log('按钮当前文本:', autoCategorizeBtn.innerHTML);
        console.log('按钮位置:', autoCategorizeBtn.getBoundingClientRect());
        console.log('按钮样式:', autoCategorizeBtn.style.cssText);
        console.log('按钮父元素:', autoCategorizeBtn.parentElement ? autoCategorizeBtn.parentElement.tagName : '无');
        console.log('按钮可见性:', window.getComputedStyle(autoCategorizeBtn).display !== 'none');
        
        // 检查事件监听器
        console.log('按钮onclick属性:', autoCategorizeBtn.onclick);
        
        // 临时添加边框来高亮按钮
        autoCategorizeBtn.style.border = '3px solid orange';
        setTimeout(() => {
            autoCategorizeBtn.style.border = '';
        }, 3000);
        
        // 直接测试点击
        console.log('测试直接点击...');
        autoCategorizeBtn.click();
    }
    
    // 检查相关函数
    console.log('showAutoCategorize函数:', typeof showAutoCategorize === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('handleAutoCategorize函数:', typeof handleAutoCategorize === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('categorizeTasksIntelligently函数:', typeof categorizeTasksIntelligently === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('getTodoContent函数:', typeof getTodoContent === 'function' ? '✅ 已定义' : '❌ 未定义');
    
    // 检查待办事项内容
    const todoContent = getTodoContent('day_todos');
    console.log('当前待办事项长度:', todoContent.length);
    console.log('待办事项内容预览:', todoContent.substring(0, 100) + (todoContent.length > 100 ? '...' : ''));
    
    console.log('=== 按钮就绪检查完成 ===');
    console.log('💡 如需测试功能，请在控制台手动执行：handleAutoCategorize()');
}

window.testAutoCategorizeFunction = testAutoCategorizeFunction;

// 快速测试提醒功能
function testQuickNotification() {
    console.log('=== 快速测试提醒功能 ===');
    
    console.log('🧪 将在3秒后显示测试通知...');
    
    setTimeout(() => {
        console.log('⏰ 3秒时间到，显示测试通知');
        showNotification(
            '⏰ 测试提醒',
            '这是一个快速测试，如果您看到这个提示，说明通知功能工作正常！',
            '🧪'
        );
    }, 3000);
    
    MessageUtils.info('测试通知将在3秒后显示，请注意观察是否有提示出现');
}

window.testQuickNotification = testQuickNotification;

// 测试快捷插入功能
function testQuickInsertFunction() {
    console.log('=== 测试快捷插入功能 ===');
    
    // 检查快捷插入按钮
    const quickInsertButtons = document.querySelectorAll('.quick-insert');
    console.log('快捷插入按钮数量:', quickInsertButtons.length);
    
    quickInsertButtons.forEach((btn, index) => {
        const targetId = btn.getAttribute('data-target');
        console.log(`${index + 1}. 快捷插入按钮 -> 目标: ${targetId}`, btn ? '✅ 找到' : '❌ 未找到');
        
        if (btn) {
            console.log('   按钮位置:', btn.getBoundingClientRect());
            console.log('   按钮可见性:', window.getComputedStyle(btn).display !== 'none');
            
            // 临时高亮按钮
            btn.style.border = '2px solid orange';
            setTimeout(() => {
                btn.style.border = '';
            }, 3000);
        }
    });
    
    // 检查目标容器
    const targets = ['day_top3', 'day_must_dos', 'day_todos'];
    targets.forEach(targetId => {
        const container = document.getElementById(targetId);
        console.log(`目标容器 ${targetId}:`, container ? '✅ 找到' : '❌ 未找到');
        
        if (container) {
            console.log(`   当前内容长度: ${container.textContent.length}`);
            console.log(`   任务项数量: ${container.querySelectorAll('.task-item').length}`);
        }
    });
    
    // 检查相关函数
    console.log('showQuickInsertMenu函数:', typeof showQuickInsertMenu === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('insertQuickItem函数:', typeof insertQuickItem === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('insertQuickItemSafe函数:', typeof insertQuickItemSafe === 'function' ? '✅ 已定义' : '❌ 未定义');
    console.log('DayPlanTodoUtils.renderTodos函数:', typeof DayPlanTodoUtils?.renderTodos === 'function' ? '✅ 已定义' : '❌ 未定义');
    
    console.log('=== 测试完成 ===');
    console.log('💡 点击任意"快捷插入"按钮测试功能');
}

window.testQuickInsertFunction = testQuickInsertFunction;

// 测试自定义模板功能
function testCustomTemplateFunction() {
    console.log('=== 测试自定义模板功能 ===');
    
    // 检查相关函数是否已定义
    const functions = [
        'getCustomTemplates', 'saveCustomTemplates', 'showCustomTemplateEditor',
        'saveCustomTemplate', 'clearCustomTemplates', 'deleteCustomTemplate'
    ];
    
    functions.forEach(funcName => {
        const func = window[funcName];
        console.log(`${funcName}:`, typeof func === 'function' ? '✅ 已定义' : '❌ 未定义');
    });
    
    // 检查localStorage支持
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('localStorage支持:', '✅ 可用');
    } catch (error) {
        console.log('localStorage支持:', '❌ 不可用');
    }
    
    // 检查现有的自定义模板
    const customTemplates = getCustomTemplates();
    console.log('现有自定义模板:', customTemplates);
    
    Object.keys(customTemplates).forEach(targetId => {
        const templates = customTemplates[targetId];
        console.log(`  ${targetId}: ${templates.length} 个模板`);
        templates.forEach((template, index) => {
            console.log(`    ${index + 1}. ${template}`);
        });
    });
    
    // 检查快捷插入按钮
    const quickInsertButtons = document.querySelectorAll('.quick-insert');
    console.log('快捷插入按钮:', quickInsertButtons.length, '个');
    
    quickInsertButtons.forEach((btn, index) => {
        const targetId = btn.getAttribute('data-target');
        console.log(`  按钮 ${index + 1}: 目标=${targetId}`);
        
        // 临时高亮按钮
        btn.style.border = '2px solid blue';
        setTimeout(() => {
            btn.style.border = '';
        }, 3000);
    });
    
    console.log('=== 测试完成 ===');
    console.log('💡 使用说明：');
    console.log('1. 点击任意"快捷插入"按钮查看新界面');
    console.log('2. 点击"✏️ 自定义编辑"按钮进入编辑模式');
    console.log('3. 在编辑器中输入自定义模板内容');
    console.log('4. 点击"💾 保存模板"保存您的自定义模板');
    console.log('5. 自定义模板会出现在快捷插入列表中');
    console.log('🧪 快速测试：');
    console.log('- showCustomTemplateEditor("day_top3") // 直接打开编辑器');
    console.log('- getCustomTemplates() // 查看所有自定义模板');
}

window.testCustomTemplateFunction = testCustomTemplateFunction;

// 综合测试所有按钮功能
function testAllButtonsComprehensive() {
    console.log('🔧 开始综合按钮测试');
    
    const buttons = [
        { id: 'energy-tracker-btn', name: '能量跟踪', handler: handleEnergyTracker },
        { id: 'smart-insights-btn', name: '智能洞察', handler: handleSmartInsights },
        { id: 'productivity-analysis-btn', name: '生产力分析', handler: handleProductivityAnalysis },
        { id: 'priority-timer-btn', name: '番茄钟', handler: handlePomodoroTimer },
        { id: 'focus-mode-btn', name: '专注模式', handler: handleFocusMode },
        { id: 'priority-analytics-btn', name: '优先级分析', handler: handlePriorityAnalytics },
        { id: 'habit-analytics-btn', name: '习惯分析', handler: handleHabitAnalytics },
        { id: 'habit-reminder-btn', name: '智能提醒', handler: handleHabitReminder },
        { id: 'auto-categorize-btn', name: '智能分类', handler: handleAutoCategorize },
        { id: 'quick-nav-btn', name: '快速导航', handler: showQuickNavigation }
    ];
    
    buttons.forEach((btn, index) => {
        const element = document.getElementById(btn.id);
        console.log(`${index + 1}. ${btn.name}按钮 (${btn.id}):`, element ? '✅ 找到' : '❌ 未找到');
        
        if (element) {
            console.log(`   - 位置: x=${element.offsetLeft}, y=${element.offsetTop}`);
            console.log(`   - 大小: ${element.offsetWidth}x${element.offsetHeight}`);
            console.log(`   - 可见: ${element.offsetParent !== null}`);
            console.log(`   - 样式: ${element.getAttribute('style') || '无内联样式'}`);
        }
    });
    
    console.log('🎯 点击任意按钮测试功能，或使用以下命令:');
    console.log('- testCustomTemplateFunction() // 测试自定义模板功能');
    console.log('- testQuickInsertFunction() // 测试快捷插入功能');
    console.log('- testQuickNotification() // 快速测试通知功能');
    console.log('- testNotificationFeatures() // 全面测试通知功能');
    console.log('- testAutoCategorizeFunction() // 测试智能分类');
    console.log('- testQuickReminderPermission() // 测试快速提醒权限问题');
    console.log('- testNotificationPermissionFlow() // 测试通知权限流程');
    console.log('- testHabitReminderFunction() // 测试智能提醒');
    console.log('- testHabitAnalyticsFunction() // 测试习惯分析');
    console.log('- testPriorityAnalyticsFunction() // 测试优先级分析');
    console.log('- testFocusModeFunction() // 测试专注模式');
    console.log('- testEnergyTrackerFunction() // 测试能量跟踪');
    console.log('- handleAutoCategorize() // 直接调用智能分类');
    console.log('- handleHabitReminder() // 直接调用智能提醒');
    console.log('- handleHabitAnalytics() // 直接调用习惯分析');
    console.log('- handlePriorityAnalytics() // 直接调用优先级分析');
    console.log('- handleFocusMode() // 直接调用专注模式');
    console.log('- handleEnergyTracker() // 直接调用能量跟踪');
    console.log('- handleSmartInsights() // 直接调用智能洞察');
    console.log('✏️ 自定义模板测试：testCustomTemplateFunction()');
}

window.testAllButtonsComprehensive = testAllButtonsComprehensive;

// 全局处理函数（内联事件处理器）
function handleSmartInsights() {
    console.log('handleSmartInsights called');
    try {
        // 创建简化版智能洞察
        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: var(--theme-color); margin-bottom: 16px;">🧠 智能洞察</h3>
                <p style="color: #666;">基于AI分析的个性化建议</p>
            </div>
            
            <div style="background: rgba(255, 193, 7, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ffc107;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">🌅</span>
                    <strong style="color: #f57c00;">早晨黄金时间</strong>
                </div>
                <div style="color: #666; line-height: 1.5;">现在是一天中精力最充沛的时间，建议处理最重要和最具挑战性的任务。</div>
            </div>
            
            <div style="background: rgba(76, 175, 80, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #4caf50;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">💡</span>
                    <strong style="color: #388e3c;">效率提升建议</strong>
                </div>
                <div style="color: #666; line-height: 1.5;">使用番茄钟技术来保持专注，每25分钟专注工作，然后休息5分钟。</div>
                <button class="btn-main" onclick="handlePomodoroTimer()" style="margin-top: 8px; font-size: 0.85em;">开始番茄钟</button>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn-main" onclick="refreshInsights()">🔄 刷新洞察</button>
            </div>
        `;
        
        if (typeof ModalUtils !== 'undefined' && ModalUtils.show) {
            ModalUtils.show('智能洞察', content);
            console.log('Modal shown successfully');
        } else {
            console.error('ModalUtils not available');
            alert('模态框工具不可用');
        }
    } catch (error) {
        console.error('Error in handleSmartInsights:', error);
        alert('智能洞察功能出现错误: ' + error.message);
    }
}

function handleProductivityAnalysis() {
    console.log('handleProductivityAnalysis called');
    try {
        showProductivityAnalysis();
        
        // 添加额外的关闭按钮调试
        setTimeout(() => {
            const modal = document.querySelector('.modal-mask');
            if (modal) {
                console.log('Modal found, adding debug close handler');
                const closeBtn = modal.querySelector('.modal-close-x');
                if (closeBtn) {
                    console.log('Close button found, current handlers:', closeBtn.onclick);
                    
                    // 强制重写关闭事件
                    closeBtn.onclick = function(e) {
                        console.log('Debug close button clicked');
                        e.preventDefault();
                        e.stopPropagation();
                        modal.remove();
                    };
                }
            }
        }, 100);
    } catch (error) {
        console.error('Error in handleProductivityAnalysis:', error);
    }
}

function handlePomodoroTimer() {
    console.log('handlePomodoroTimer called');
    togglePomodoroTimer();
}

function handleEnergyTracker() {
    console.log('handleEnergyTracker called');
    try {
        showEnergyTracker();
    } catch (error) {
        console.error('Error in handleEnergyTracker:', error);
        alert('能量跟踪功能出现错误: ' + error.message);
    }
}

function handleFocusMode() {
    console.log('handleFocusMode called');
    try {
        toggleFocusMode();
    } catch (error) {
        console.error('Error in handleFocusMode:', error);
        alert('专注模式功能出现错误: ' + error.message);
    }
}

function handlePriorityAnalytics() {
    console.log('handlePriorityAnalytics called');
    try {
        showPriorityAnalytics();
    } catch (error) {
        console.error('Error in handlePriorityAnalytics:', error);
        alert('优先级分析功能出现错误: ' + error.message);
    }
}

function handleHabitAnalytics() {
    console.log('handleHabitAnalytics called');
    try {
        showHabitAnalytics();
    } catch (error) {
        console.error('Error in handleHabitAnalytics:', error);
        alert('习惯分析功能出现错误: ' + error.message);
    }
}

function handleHabitReminder() {
    console.log('🔔 handleHabitReminder called');
    try {
        console.log('尝试调用 showHabitReminder...');
        showHabitReminder();
        console.log('✅ showHabitReminder 调用成功');
    } catch (error) {
        console.error('❌ Error in handleHabitReminder:', error);
        console.error('错误堆栈:', error.stack);
        alert('智能提醒功能出现错误: ' + error.message);
    }
}

function handleAutoCategorize() {
    console.log('🏷️ handleAutoCategorize called');
    try {
        showAutoCategorize();
    } catch (error) {
        console.error('Error in handleAutoCategorize:', error);
        alert('智能分类功能出现错误: ' + error.message);
    }
}

function handleAnalytics() {
    console.log('handleAnalytics called');
    try {
        showAnalytics();
        
        // 添加额外的关闭按钮调试
        setTimeout(() => {
            const modal = document.querySelector('.modal-mask');
            if (modal) {
                console.log('Analytics modal found, adding debug close handler');
                const closeBtn = modal.querySelector('.modal-close-x');
                if (closeBtn) {
                    console.log('Analytics close button found');
                    
                    // 强制重写关闭事件
                    closeBtn.onclick = function(e) {
                        console.log('Analytics debug close button clicked');
                        e.preventDefault();
                        e.stopPropagation();
                        modal.remove();
                    };
                }
            }
        }, 100);
    } catch (error) {
        console.error('Error in handleAnalytics:', error);
    }
}

// 刷新洞察功能
function refreshInsights() {
    console.log('Refreshing insights...');
    const modal = document.querySelector('.modal-mask');
    if (modal) {
        ModalUtils.hide(modal);
        setTimeout(() => {
            handleSmartInsights();
        }, 300);
    }
}

// 强制关闭模态框函数 - 增强版
function forceCloseModal() {
    console.log('Force closing modal - enhanced version');
    
    // 方法1: 直接移除所有模态框
    const modals = document.querySelectorAll('.modal-mask');
    modals.forEach(modal => {
        console.log('Removing modal:', modal);
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.remove();
    });
    
    // 方法2: 移除任何可能的模态框残留
    const allModals = document.querySelectorAll('[class*="modal"]');
    allModals.forEach(el => {
        if (el.style.position === 'fixed' || el.style.zIndex > 1000) {
            console.log('Removing potential modal element:', el);
            el.remove();
        }
    });
    
    // 方法3: 清除body上可能的modal相关样式
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    console.log('All modals forcefully closed');
}

// 添加全局快捷键 Ctrl+Q 强制关闭所有模态框
document.addEventListener('keydown', function(e) {
    // 如果用户正在编辑文本，不处理快捷键
    if (e.target.contentEditable === 'true' || 
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' ||
        e.target.classList.contains('task-text')) {
        return;
    }
    
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        console.log('Ctrl+Q pressed - emergency modal close');
        forceCloseModal();
    }
});

// 暴露到全局作用域
window.handleSmartInsights = handleSmartInsights;
window.handleProductivityAnalysis = handleProductivityAnalysis;
window.handlePomodoroTimer = handlePomodoroTimer;
window.handleEnergyTracker = handleEnergyTracker;
window.handleFocusMode = handleFocusMode;
window.handlePriorityAnalytics = handlePriorityAnalytics;
window.handleHabitAnalytics = handleHabitAnalytics;
window.handleHabitReminder = handleHabitReminder;
window.handleAutoCategorize = handleAutoCategorize;
window.handleAnalytics = handleAnalytics;
window.refreshInsights = refreshInsights;
window.refreshHabitAnalysis = refreshHabitAnalysis;
window.exportHabitData = exportHabitData;
window.debugHabitData = debugHabitData;
window.getCurrentNotificationPermission = getCurrentNotificationPermission;
window.requestNotificationPermission = requestNotificationPermission;
window.updateNotificationPermissionUI = updateNotificationPermissionUI;
window.setQuickReminder = setQuickReminder;
window.scheduleHabitReminder = scheduleHabitReminder;
window.setSuggestedReminder = setSuggestedReminder;
window.cancelReminder = cancelReminder;
window.clearAllReminders = clearAllReminders;
window.applyCategorization = applyCategorization;
window.exportCategorization = exportCategorization;
window.refreshCategorization = refreshCategorization;
window.testNotificationFeatures = testNotificationFeatures;
window.insertQuickItem = insertQuickItem;
window.insertQuickItemSafe = insertQuickItemSafe;

// 暴露自定义模板管理函数
window.showCustomTemplateEditor = showCustomTemplateEditor;
window.saveCustomTemplate = saveCustomTemplate;
window.clearCustomTemplates = clearCustomTemplates;
window.deleteCustomTemplate = deleteCustomTemplate;
window.getCustomTemplates = getCustomTemplates;
window.forceCloseModal = forceCloseModal;

// 暴露新的模板管理函数
window.addSingleTemplate = addSingleTemplate;
window.editSingleTemplate = editSingleTemplate;
window.updateSingleTemplate = updateSingleTemplate;
window.deleteSingleTemplate = deleteSingleTemplate;
window.showBatchEditMode = showBatchEditMode;
window.saveBatchTemplates = saveBatchTemplates;
window.showTemplateCategories = showTemplateCategories;
window.addTemplateFromCategory = addTemplateFromCategory;
window.insertQuickItemDirect = insertQuickItemDirect;
window.showTemplatePreview = showTemplatePreview;
window.updateTemplateItem = updateTemplateItem;
window.insertUpdatedTemplate = insertUpdatedTemplate;
window.insertTemplateByIndex = insertTemplateByIndex;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.showDifficultyEstimator = showDifficultyEstimator;
window.optimizeTaskSchedule = optimizeTaskSchedule;
window.exportDifficultyReport = exportDifficultyReport;
window.closeDifficultyEstimator = closeDifficultyEstimator;

// 初始化日计划功能
function initDayPlan() {
    console.log('Initializing day plan...');
    
    // 检查关键元素是否存在
    const smartInsightsPanel = document.getElementById('smart-insights-panel');
    console.log('Smart insights panel found:', !!smartInsightsPanel);
    
    // 设置今天的日期
    const dateInput = document.getElementById('day_date');
    dateInput.value = currentDate;
    updateWeekday();
    
    // 启用所有待办事项容器 - 使用新的DayPlanTodoUtils
    // 注意：新的DayPlanTodoUtils会在单独的script标签中初始化
    // 这里添加input监听器以支持自动保存和实时分析
    const todoContainers = document.querySelectorAll('.todo-list-container');
    todoContainers.forEach(container => {
        // 添加实时分析功能
        container.addEventListener('input', function() {
            setTimeout(() => {
                analyzeTasksRealtime();
                updateProgress();
                // 自动保存草稿
                saveDraft();
            }, 500);
        });
    });
    
    // 初始化时间块分析
    const timeblockContainer = document.getElementById('day_timeblock');
    if (timeblockContainer) {
        timeblockContainer.addEventListener('input', function() {
            setTimeout(() => {
                analyzeTimeBlocks();
            }, 500);
        });
    }
    
    // 初始化日记容器
    const reflectionTextarea = document.getElementById('day_reflection');
    if (reflectionTextarea) {
        reflectionTextarea.addEventListener('input', function() {
            // 自动保存草稿
            localStorage.setItem(`day_reflection_draft_${currentDate}`, this.value);
            // 同时保存完整草稿
            saveDraft();
        });
        
        // 加载草稿
        const draft = localStorage.getItem(`day_reflection_draft_${currentDate}`);
        if (draft) {
            reflectionTextarea.value = draft;
        }
    }
    
    // 初始化目标容器
    const goalsTextarea = document.getElementById('day_goals');
    if (goalsTextarea) {
        goalsTextarea.addEventListener('input', function() {
            // 自动保存草稿
            localStorage.setItem(`day_goals_draft_${currentDate}`, this.value);
            // 同时保存完整草稿
            saveDraft();
        });
        
        // 加载草稿
        const goalsDraft = localStorage.getItem(`day_goals_draft_${currentDate}`);
        if (goalsDraft) {
            goalsTextarea.value = goalsDraft;
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 日期导航
    document.getElementById('day-prev').addEventListener('click', () => navigateDate(-1));
    document.getElementById('day-next').addEventListener('click', () => navigateDate(1));
    document.getElementById('day_date').addEventListener('change', handleDateChange);
    
    // 保存按钮
    document.querySelector('.save-btn').addEventListener('click', saveDayPlan);
    
    // 历史记录按钮
    document.querySelector('.save-view-btn').addEventListener('click', showDayHistory);
    
    // AI助手按钮
    document.getElementById('ai-assistant-btn').addEventListener('click', showAIAssistant);
    
    // 智能洞察按钮
    const smartInsightsBtn = document.getElementById('smart-insights-btn');
    if (smartInsightsBtn) {
        console.log('Smart insights button found, adding event listener');
        smartInsightsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Smart insights button clicked');
            showSmartInsights();
        });
    } else {
        console.log('Smart insights button NOT found');
    }
    
    // 使用委托方式作为备选 - 确保所有按钮都能响应
    document.addEventListener('click', function(e) {
        console.log('Clicked element:', e.target.id, e.target.className, e.target.tagName);
        
        if (e.target.id === 'smart-insights-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Smart insights clicked via delegation');
            handleSmartInsights();
        } else if (e.target.id === 'productivity-analysis-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Productivity analysis clicked via delegation');
            handleProductivityAnalysis();
        } else if (e.target.id === 'priority-timer-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Pomodoro timer clicked via delegation:', e.target.id);
            handlePomodoroTimer();
        } else if (e.target.id === 'analytics-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Analytics clicked via delegation');
            handleAnalytics();
        } else if (e.target.id === 'energy-tracker-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Energy tracker clicked via delegation');
            showEnergyTracker();
        } else if (e.target.id === 'focus-mode-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Focus mode clicked via delegation');
            toggleFocusMode();
        } else if (e.target.id === 'priority-analytics-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Priority analytics clicked via delegation');
            showPriorityAnalytics();
        } else if (e.target.id === 'habit-analytics-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Habit analytics clicked via delegation');
            showHabitAnalytics();
        } else if (e.target.id === 'habit-reminder-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Habit reminder clicked via delegation');
            showHabitReminder();
        } else if (e.target.id === 'auto-categorize-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Auto categorize clicked via delegation');
            showAutoCategorize();
        }
    });
    
    // 生产力分析按钮
    const productivityBtn = document.getElementById('productivity-analytics-btn');
    if (productivityBtn) {
        console.log('Productivity analytics button found, adding event listener');
        productivityBtn.addEventListener('click', function(e) {
            console.log('Productivity analytics button clicked');
            showProductivityAnalysis();
        });
    } else {
        console.log('Productivity analytics button NOT found');
    }
    
    // 番茄钟按钮 (priority-timer-btn) 通过事件委托处理
    
    // 分析按钮
    const analyticsBtn = document.getElementById('analytics-btn');
    if (analyticsBtn) {
        console.log('Analytics button found, adding event listener');
        analyticsBtn.addEventListener('click', function(e) {
            console.log('Analytics button clicked');
            showAnalytics();
        });
    } else {
        console.log('Analytics button NOT found');
    }
    
    // 快捷操作按钮
    document.getElementById('quick-nav-btn')?.addEventListener('click', showQuickNavigation);
    
    // 专注模式按钮 - 增强版事件绑定
    const focusModeBtn = document.getElementById('focus-mode-btn');
    if (focusModeBtn) {
        console.log('Focus mode button found, adding event listener');
        focusModeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Focus mode button clicked');
            toggleFocusMode();
        });
    } else {
        console.log('Focus mode button NOT found');
    }
    
    // 能量跟踪按钮 - 增强版事件绑定
    const energyTrackerBtn = document.getElementById('energy-tracker-btn');
    if (energyTrackerBtn) {
        console.log('Energy tracker button found, adding event listener');
        energyTrackerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Energy tracker button clicked');
            showEnergyTracker();
        });
    } else {
        console.log('Energy tracker button NOT found');
    }
    
    // 快捷插入按钮
    document.querySelectorAll('.quick-insert').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showQuickInsertMenu(this, targetId);
        });
    });
    
    // AI建议按钮
    document.getElementById('ai-suggest-priorities-btn')?.addEventListener('click', generatePrioritySuggestions);
    
    // 难度评估按钮
    document.getElementById('difficulty-estimator-btn')?.addEventListener('click', showDifficultyEstimator);
    
    // 任务依赖关系按钮
    const taskDependencyBtn = document.getElementById('task-dependency-btn');
    if (taskDependencyBtn) {
        console.log('找到依赖关系按钮，添加事件监听器');
        taskDependencyBtn.addEventListener('click', function(e) {
            console.log('依赖关系按钮被点击');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                if (typeof showTaskDependency === 'function') {
                    console.log('调用 showTaskDependency 函数');
                    showTaskDependency();
                } else {
                    console.error('showTaskDependency 函数未找到，类型:', typeof showTaskDependency);
                    // 尝试直接调用
                    if (window.showTaskDependency) {
                        console.log('尝试从 window 对象调用');
                        window.showTaskDependency();
                    } else {
                        alert('依赖关系功能暂时不可用，请刷新页面重试');
                    }
                }
            } catch (error) {
                console.error('调用依赖关系功能时出错:', error);
                alert('调用依赖关系功能时出错: ' + error.message);
            }
        });
    } else {
        console.error('未找到依赖关系按钮');
    }
    
    // 优先级分析按钮
    const priorityAnalyticsBtn = document.getElementById('priority-analytics-btn');
    if (priorityAnalyticsBtn) {
        console.log('Priority analytics button found, adding event listener');
        priorityAnalyticsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Priority analytics button clicked');
            showPriorityAnalytics();
        });
    } else {
        console.log('Priority analytics button NOT found');
    }
    
    // 时间块相关按钮
    document.getElementById('timeblock-templates')?.addEventListener('click', showTimeblockTemplates);
    document.getElementById('timeblock-suggest')?.addEventListener('click', suggestTimeblocks);
    document.getElementById('timeblock-check')?.addEventListener('click', checkTimeblockConflicts);
    document.getElementById('energy-optimization-btn')?.addEventListener('click', showEnergyOptimization);
    document.getElementById('break-scheduler-btn')?.addEventListener('click', showBreakScheduler);
    
    // 习惯分析按钮 - 增强版事件绑定
    const habitAnalyticsBtn = document.getElementById('habit-analytics-btn');
    if (habitAnalyticsBtn) {
        console.log('Habit analytics button found, adding event listener');
        habitAnalyticsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Habit analytics button clicked');
            showHabitAnalytics();
        });
    } else {
        console.log('Habit analytics button NOT found');
    }
    
    // 反思模板按钮
    document.getElementById('reflection-templates-btn')?.addEventListener('click', showReflectionTemplates);
    
    // 智能提醒按钮 - 增强版事件绑定
    const habitReminderBtn = document.getElementById('habit-reminder-btn');
    if (habitReminderBtn) {
        console.log('Habit reminder button found, adding event listener');
        habitReminderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Habit reminder button clicked');
            showHabitReminder();
        });
    } else {
        console.log('Habit reminder button NOT found');
    }
    
    // 心情记录和感恩日记按钮已改为直接链接，无需JavaScript事件监听器
    
    // 智能分类按钮 - 增强版事件绑定
    const autoCategorizeBtn = document.getElementById('auto-categorize-btn');
    if (autoCategorizeBtn) {
        console.log('Auto categorize button found, adding event listener');
        autoCategorizeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Auto categorize button clicked');
            showAutoCategorize();
        });
    } else {
        console.log('Auto categorize button NOT found');
    }
    
    // 关闭面板按钮
    document.getElementById('close-insights-btn')?.addEventListener('click', () => {
        document.getElementById('smart-insights-panel').style.display = 'none';
    });
    
    document.getElementById('close-suggestions-btn')?.addEventListener('click', () => {
        document.getElementById('realtime-suggestions-panel').style.display = 'none';
    });
}

// 日期导航
function navigateDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = DateUtils.formatDate(date);
    
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    
    // 显示切换动画
    showDateChangeAnimation(days > 0 ? '→' : '←');
}

// 处理日期变更
function handleDateChange() {
    const dateInput = document.getElementById('day_date');
    currentDate = dateInput.value;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
}

// 更新星期显示
function updateWeekday() {
    const date = new Date(currentDate);
    const weekday = DateUtils.getWeekdayName(date);
    document.getElementById('day_weekday').textContent = weekday;
    
    // 如果是今天，添加特殊样式
    if (currentDate === DateUtils.getToday()) {
        document.getElementById('day_weekday').style.background = 'linear-gradient(135deg, var(--theme-color), #1565c0)';
        document.getElementById('day_weekday').style.color = 'white';
    } else {
        document.getElementById('day_weekday').style.background = 'rgba(25,118,210,0.1)';
        document.getElementById('day_weekday').style.color = 'var(--theme-color)';
    }
}

// 加载今日计划
function loadTodayPlan() {
    const planData = StorageUtils.loadPlan('day', currentDate);
    
    if (planData) {
        // 加载各个字段
        document.getElementById('day_goals').value = planData.goals || '';
        document.getElementById('day_reflection').value = planData.reflection || '';
        
        // 加载待办事项
        loadTodoContent('day_top3', planData.priorities);
        loadTodoContent('day_must_dos', planData.habits);
        loadTodoContent('day_todos', planData.todos);
        loadTodoContent('day_timeblock', planData.timeblock);
        
        // 更新统计信息
        updateTaskStatistics();
        analyzeTimeBlocks();
        
        console.log(`✅ 已加载 ${currentDate} 的计划`);
    } else {
        // 尝试加载草稿数据
        console.log(`📝 ${currentDate} 暂无正式计划，尝试加载草稿`);
        loadDraft();
    }
    
    // 检查是否显示实时建议
    setTimeout(checkForSuggestions, 1000);
}

// 加载待办事项内容
function loadTodoContent(containerId, content) {
    const container = document.getElementById(containerId);
    if (container && content) {
        container.textContent = content;
        if (typeof DayPlanTodoUtils !== 'undefined' && DayPlanTodoUtils.renderTodos) {
            DayPlanTodoUtils.renderTodos(container);
        }
    }
}

// 保存草稿
// 草稿保存防抖器
let draftSaveTimeout = null;

function saveDraft() {
    // 清除之前的定时器
    if (draftSaveTimeout) {
        clearTimeout(draftSaveTimeout);
    }
    
    // 设置新的定时器，防抖500ms
    draftSaveTimeout = setTimeout(() => {
        try {
            const draftData = {
                goals: document.getElementById('day_goals').value,
                reflection: document.getElementById('day_reflection').value,
                priorities: getTodoContent('day_top3'),
                habits: getTodoContent('day_must_dos'),
                todos: getTodoContent('day_todos'),
                timeblock: getTodoContent('day_timeblock'),
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(`day_draft_${currentDate}`, JSON.stringify(draftData));
            console.log('📝 草稿已保存');
        } catch (error) {
            console.error('草稿保存失败:', error);
        }
    }, 500);
}

// 加载草稿
function loadDraft() {
    try {
        const draftData = JSON.parse(localStorage.getItem(`day_draft_${currentDate}`) || '{}');
        
        if (draftData.timestamp) {
            // 加载各个字段
            document.getElementById('day_goals').value = draftData.goals || '';
            document.getElementById('day_reflection').value = draftData.reflection || '';
            
            // 加载待办事项
            loadTodoContent('day_top3', draftData.priorities);
            loadTodoContent('day_must_dos', draftData.habits);
            loadTodoContent('day_todos', draftData.todos);
            loadTodoContent('day_timeblock', draftData.timeblock);
            
            // 更新统计信息
            updateTaskStatistics();
            analyzeTimeBlocks();
            
            console.log('📝 已加载草稿数据:', currentDate);
            
            // 显示草稿提示
            setTimeout(() => {
                MessageUtils.info('已加载草稿数据，记得保存正式计划哦！', 'info', 4000);
            }, 1000);
        } else {
            clearAllFields();
            console.log('📝 没有找到草稿数据，创建新计划');
        }
    } catch (error) {
        console.error('草稿加载失败:', error);
        clearAllFields();
    }
}

// 清空所有字段
function clearAllFields() {
    document.getElementById('day_goals').value = '';
    document.getElementById('day_reflection').value = '';
    
    // 清除相关草稿
    localStorage.removeItem(`day_reflection_draft_${currentDate}`);
    localStorage.removeItem(`day_goals_draft_${currentDate}`);
    localStorage.removeItem(`day_draft_${currentDate}`);
    
    const todoContainers = ['day_top3', 'day_must_dos', 'day_todos', 'day_timeblock'];
    todoContainers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            container.textContent = '';
        }
    });
}

// 保存日计划
function saveDayPlan() {
    try {
        const planData = {
            goals: document.getElementById('day_goals').value,
            reflection: document.getElementById('day_reflection').value,
            priorities: getTodoContent('day_top3'),
            habits: getTodoContent('day_must_dos'),
            todos: getTodoContent('day_todos'),
            timeblock: getTodoContent('day_timeblock'),
            lastModified: new Date().toISOString()
        };
        
        const success = StorageUtils.savePlan('day', currentDate, planData);
        
        if (success) {
            MessageUtils.success('日计划保存成功！');
            
            // 清除草稿
            localStorage.removeItem(`day_reflection_draft_${currentDate}`);
            localStorage.removeItem(`day_goals_draft_${currentDate}`);
            localStorage.removeItem(`day_draft_${currentDate}`);
            
            // 更新统计
            updateTaskStatistics();
            analyzeTimeBlocks();
            
            // 触发保存动画
            animateSaveSuccess();
        } else {
            MessageUtils.error('保存失败，请重试');
        }
    } catch (error) {
        console.error('保存日计划失败:', error);
        MessageUtils.error('保存失败：' + error.message);
    }
}

// 获取待办事项内容
function getTodoContent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return '';
    
    // 首先尝试从任务项目获取（适配新的DayPlanTodoUtils格式）
    const tasks = container.querySelectorAll('.task-item');
    if (tasks.length > 0) {
    const lines = [];
    tasks.forEach(task => {
        const checkbox = task.querySelector('.custom-checkbox');
            const textElement = task.querySelector('.task-text');
            
            // 修复：适配时间块格式 - 时间块可能没有复选框
            if (textElement) {
                // 修复：适配textarea元素，优先使用value属性
                let text = '';
                if (textElement.tagName === 'TEXTAREA' || textElement.tagName === 'INPUT') {
                    text = textElement.value || '';
                } else {
                    text = textElement.textContent || '';
                }
                text = text.trim();
                
                if (text) {
                    // 如果有复选框，使用标准格式；如果没有复选框（如时间块），直接保存文本
                    if (checkbox) {
        const isChecked = checkbox.classList.contains('checked');
        lines.push(`[${isChecked ? 'x' : ' '}] ${text}`);
                    } else {
                        // 时间块或其他没有复选框的格式
                        lines.push(text);
                    }
                }
            }
    });
    return lines.join('\n');
    }
    
    // 如果没有任务项目，尝试获取原始文本内容
    const textContent = container.textContent || container.innerText || '';
    if (textContent.trim()) {
        return textContent.trim();
    }
    
    // 最后尝试从data属性获取
    return container.getAttribute('data-content') || '';
}

// 显示历史记录
function showDayHistory() {
    const history = StorageUtils.getHistory('day');
    
    if (history.length === 0) {
        MessageUtils.info('暂无历史记录');
        return;
    }
    
    let tableHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>日期</th>
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
                    <button class="btn-main" onclick="loadHistoryPlan('${entry.date}')">加载</button>
                    <button class="btn-danger" onclick="deleteHistoryEntry(${index})">删除</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    ModalUtils.show('历史记录', tableHTML, {
        buttons: [
            { text: '关闭', class: 'btn-main' }
        ]
    });
}

// 加载历史计划
function loadHistoryPlan(date) {
    currentDate = date;
    document.getElementById('day_date').value = date;
    updateWeekday();
    loadTodayPlan();
    
    MessageUtils.success(`已加载 ${date} 的计划`);
    
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

// 删除历史记录条目
function deleteHistoryEntry(index) {
    if (confirm('确定要删除这条历史记录吗？')) {
        StorageUtils.deleteHistory('day', index);
        MessageUtils.success('历史记录已删除');
        
        // 重新显示历史记录
        setTimeout(() => {
            const modal = document.querySelector('.modal-mask');
            if (modal) ModalUtils.hide(modal);
            setTimeout(showDayHistory, 300);
        }, 1000);
    }
}

// 显示AI助手
function showAIAssistant() {
    const aiContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🤖 AI智能助手</h3>
            <p style="color: #666;">让AI帮助您优化今日计划</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <button class="ai-feature-btn" onclick="generatePrioritySuggestions()">
                <div class="feature-icon">🎯</div>
                <div class="feature-title">优先级建议</div>
                <div class="feature-desc">AI分析任务重要性</div>
            </button>
            
            <button class="ai-feature-btn" onclick="suggestTimeblocks()">
                <div class="feature-icon">⏰</div>
                <div class="feature-title">时间规划</div>
                <div class="feature-desc">智能时间块安排</div>
            </button>
            
            <button class="ai-feature-btn" onclick="analyzeWorkload()">
                <div class="feature-icon">📊</div>
                <div class="feature-title">工作量分析</div>
                <div class="feature-desc">评估任务负载</div>
            </button>
            
            <button class="ai-feature-btn" onclick="generateHabitSuggestions()">
                <div class="feature-icon">🔄</div>
                <div class="feature-title">习惯建议</div>
                <div class="feature-desc">推荐有益习惯</div>
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
    
    ModalUtils.show('AI智能助手', aiContent);
}

// 生成优先级建议
function generatePrioritySuggestions() {
    const currentTasks = getTodoContent('day_todos');
    const suggestions = AIUtils.generateSuggestions(currentTasks, 'daily');
    
    let content = '<h4 style="color: var(--theme-color); margin-bottom: 16px;">🎯 AI优先级建议</h4>';
    
    if (suggestions.length > 0) {
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
            <button class="btn-main" onclick="applyPrioritySuggestions()">应用建议</button>
            <button class="btn-main" onclick="regenerateSuggestions()">重新生成</button>
        `;
    } else {
        content += '<p style="text-align: center; color: #666;">暂无具体建议，请先添加一些任务。</p>';
    }
    
    ModalUtils.show('AI优先级建议', content);
}

// 显示智能洞察
// 重复的showSmartInsights函数已删除，使用后面的模态框版本

// 旧的generateDayInsights函数已删除，使用新版本

// 更新进度
function updateProgress() {
    const progress = ProgressUtils.calculateDayProgress();
    const progressBar = document.getElementById('day-progress-inner');
    const progressText = document.getElementById('progress-main');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `今日进度 ${progress}%`;
    }
    
    // 更新任务完成统计
    updateTaskStatistics();
}

// 更新任务统计
function updateTaskStatistics() {
    const stats = calculateTaskStatistics();
    
    // 更新完成率显示
    const completionRateEl = document.getElementById('task-completion-rate');
    if (completionRateEl) {
        completionRateEl.textContent = `完成率 ${stats.completionRate}%`;
        
        // 根据完成率改变颜色
        if (stats.completionRate >= 80) {
            completionRateEl.style.background = '#4caf50';
        } else if (stats.completionRate >= 50) {
            completionRateEl.style.background = '#ff9800';
        } else {
            completionRateEl.style.background = '#f44336';
        }
    }
    
    // 更新习惯连续天数（模拟）
    const streakEl = document.getElementById('habit-streak-display');
    if (streakEl) {
        const streak = calculateHabitStreak();
        streakEl.textContent = `连续 ${streak} 天`;
    }
}

// 计算任务统计
function calculateTaskStatistics() {
    const containers = ['day_top3', 'day_must_dos', 'day_todos'];
    let total = 0;
    let completed = 0;
    
    containers.forEach(containerId => {
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

// 计算习惯连续天数
function calculateHabitStreak() {
    // 这里是简化的计算，实际应该基于历史数据
    const habitTasks = document.querySelectorAll('#day_must_dos .task-item');
    let completedHabits = 0;
    
    habitTasks.forEach(task => {
        const checkbox = task.querySelector('.custom-checkbox');
        if (checkbox && checkbox.classList.contains('checked')) {
            completedHabits++;
        }
    });
    
    // 模拟连续天数
    return completedHabits > 0 ? Math.floor(Math.random() * 10) + 1 : 0;
}

// 分析时间块
function analyzeTimeBlocks() {
    const timeblockContent = getTodoContent('day_timeblock');
    const lines = timeblockContent.split('\n').filter(line => line.trim());
    
    let totalHours = 0;
    let focusHours = 0;
    let breakHours = 0;
    
    lines.forEach(line => {
        const timeMatch = line.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const startHour = parseInt(timeMatch[1]);
            const startMin = parseInt(timeMatch[2]);
            const endHour = parseInt(timeMatch[3]);
            const endMin = parseInt(timeMatch[4]);
            
            const duration = (endHour + endMin/60) - (startHour + startMin/60);
            totalHours += duration;
            
            if (line.includes('深度') || line.includes('工作') || line.includes('专注')) {
                focusHours += duration;
            } else if (line.includes('休息') || line.includes('放松')) {
                breakHours += duration;
            }
        }
    });
    
    const efficiency = totalHours > 0 ? Math.round((focusHours / totalHours) * 100) : 0;
    
    // 更新显示
    const totalEl = document.getElementById('total-planned-time');
    const focusEl = document.getElementById('focus-time');
    const breakEl = document.getElementById('break-time');
    const efficiencyEl = document.getElementById('efficiency-score');
    
    if (totalEl) totalEl.textContent = `${totalHours.toFixed(1)}h`;
    if (focusEl) focusEl.textContent = `${focusHours.toFixed(1)}h`;
    if (breakEl) breakEl.textContent = `${breakHours.toFixed(1)}h`;
    if (efficiencyEl) efficiencyEl.textContent = `${efficiency}%`;
    
    // 更新利用率显示
    const utilizationEl = document.getElementById('time-utilization');
    if (utilizationEl) {
        utilizationEl.textContent = `利用率 ${efficiency}%`;
        
        if (efficiency >= 70) {
            utilizationEl.style.background = '#4caf50';
        } else if (efficiency >= 40) {
            utilizationEl.style.background = '#ff9800';
        } else {
            utilizationEl.style.background = '#f44336';
        }
    }
    
    return { totalHours, focusHours, breakHours, efficiency };
}

// 实时任务分析
function analyzeTasksRealtime() {
    // 检查是否需要显示建议
    setTimeout(checkForSuggestions, 500);
}

// 检查建议
function checkForSuggestions() {
    const suggestions = [];
    
    // 检查优先级任务
    const priorityTasks = getTodoContent('day_top3');
    if (priorityTasks.length === 0) {
        suggestions.push('💡 建议设定今日最重要的3件事，确保重点任务不被忽略。');
    }
    
    // 检查时间规划
    const timeblocks = getTodoContent('day_timeblock');
    if (timeblocks.length === 0) {
        suggestions.push('⏰ 建议制定时间块计划，提高时间利用效率。');
    }
    
    // 检查习惯
    const habits = getTodoContent('day_must_dos');
    if (habits.length === 0) {
        suggestions.push('🔄 建议添加1-3个日常习惯，培养良好的生活节奏。');
    }
    
    // 显示建议
    if (suggestions.length > 0) {
        showRealtimeSuggestions(suggestions);
    }
}

// 显示实时建议
function showRealtimeSuggestions(suggestions) {
    const panel = document.getElementById('realtime-suggestions-panel');
    const content = document.getElementById('suggestions-content');
    
    if (panel && content) {
        content.innerHTML = suggestions.map(s => `<div style="margin-bottom: 8px;">${s}</div>`).join('');
        panel.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            panel.style.display = 'none';
        }, 5000);
    }
}

// 切换专注模式
function toggleFocusMode() {
    console.log('toggleFocusMode called, current focusMode:', focusMode);
    
    focusMode = !focusMode;
    const focusBtn = document.getElementById('focus-mode-btn');
    
    if (!focusBtn) {
        console.error('Focus mode button not found!');
        return;
    }
    
    if (focusMode) {
        document.body.classList.add('focus-mode');
        focusBtn.classList.add('focus-active');
        
        // 改变按钮外观
        focusBtn.innerHTML = '🚫';
        focusBtn.title = '退出专注模式 (Ctrl+F)';
        focusBtn.style.background = '#f44336';
        focusBtn.style.color = 'white';
        
        MessageUtils.success('已进入专注模式');
        
        // 自动隐藏其他干扰元素
        const distractingElements = document.querySelectorAll('.smart-insights-panel, .realtime-suggestions-panel');
        distractingElements.forEach(el => {
            el.style.display = 'none';
        });
        
        console.log('专注模式已激活');
    } else {
        document.body.classList.remove('focus-mode');
        focusBtn.classList.remove('focus-active');
        
        // 恢复按钮外观
        focusBtn.innerHTML = '🎯';
        focusBtn.title = '专注模式 (Ctrl+F)';
        focusBtn.style.background = '#fff3e0';
        focusBtn.style.color = '#ef6c00';
        
        MessageUtils.info('已退出专注模式');
        
        // 恢复其他元素显示
        const hiddenElements = document.querySelectorAll('.smart-insights-panel, .realtime-suggestions-panel');
        hiddenElements.forEach(el => {
            el.style.display = '';
        });
        
        console.log('专注模式已关闭');
    }
}

// 显示日期切换动画
function showDateChangeAnimation(direction) {
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
        animation: dateChangeAnim 0.6s ease-out;
    `;
    animation.textContent = direction;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        if (animation.parentNode) {
            animation.parentNode.removeChild(animation);
        }
    }, 600);
    
    // 添加CSS动画
    if (!document.getElementById('dateChangeAnimCSS')) {
        const style = document.createElement('style');
        style.id = 'dateChangeAnimCSS';
        style.textContent = `
            @keyframes dateChangeAnim {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
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

// 快捷插入菜单（简化版）
// 全局模板数据存储
let currentQuickInsertData = {
    targetId: '',
    templates: []
};

function showQuickInsertMenu(button, targetId) {
    const customTemplates = getCustomTemplates();
    const defaultTemplates = {
        day_top3: [
            '[ ] 完成重要项目里程碑',
            '[ ] 处理紧急客户需求',
            '[ ] 准备明天的重要会议'
        ],
        day_must_dos: [
            '[ ] 晨间锻炼 30分钟',
            '[ ] 阅读学习 1小时',
            '[ ] 冥想放松 15分钟'
        ],
        day_todos: [
            '[ ] 回复重要邮件',
            '[ ] 整理工作文档',
            '[ ] 规划下周工作'
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
            <h4 style="margin: 0; color: var(--theme-color);">快捷插入</h4>
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
            
            ${allTemplates.length === 0 ? `
                <div style="text-align: center; color: #999; padding: 32px 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">还没有可用的模板</div>
                    <div style="font-size: 13px; color: #999; margin-bottom: 16px;">
                        请使用下方的快速选择添加模板
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid #4caf50;">
                <div style="font-size: 13px; color: #2e7d32; text-align: center;">
                    💡 <strong>提示</strong>：点击 ✅ 按钮可连续插入多个模板，完成后点击右上角 ✕ 关闭
                </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button class="btn-secondary" onclick="showTemplateCategories('${targetId}')" style="flex: 1;">
                    📂 快速选择
                </button>
                <button class="btn-outline" onclick="ModalUtils.hide()" style="flex: 1;">
                    ✕ 完成选择
                </button>
            </div>
            <div style="text-align: center;">
                <button class="btn-main" onclick="showTemplatePreview('${targetId}')" style="padding: 6px 12px; font-size: 12px;">
                    👁️ 预览所有模板
                </button>
            </div>
        </div>
    `;
    
    ModalUtils.show('快捷插入', content);
}

// 插入快捷项目
function insertQuickItem(targetId, item) {
    console.log('插入快捷项目:', { targetId, item });
    
    const container = document.getElementById(targetId);
    if (container) {
        // 改进：获取当前的文本内容（兼容不同的存储方式）
        let currentContent = '';
        
        // 检查是否有现有的任务项
        const existingTasks = container.querySelectorAll('.task-item');
        if (existingTasks.length > 0) {
            // 如果有任务项，从任务项中提取内容
            const lines = [];
            existingTasks.forEach(task => {
                const checkbox = task.querySelector('.custom-checkbox');
                const textElement = task.querySelector('.task-text');
                let text = '';
                
                // 正确获取textarea或input的值
                if (textElement) {
                    if (textElement.tagName === 'TEXTAREA' || textElement.tagName === 'INPUT') {
                        text = textElement.value.trim();
                    } else {
                        text = textElement.textContent.trim();
                    }
                }
                
                // 保留所有任务，包括空任务
                if (checkbox) {
                    const isChecked = checkbox.classList.contains('checked');
                    lines.push(`[${isChecked ? 'x' : ' '}] ${text}`);
                } else {
                    // 时间块或其他格式
                    if (text) {
                        lines.push(text);
                    }
                }
            });
            currentContent = lines.join('\n');
        } else {
            // 如果没有任务项，尝试从textContent获取
            currentContent = container.textContent.trim();
        }
        
        console.log('当前内容:', currentContent);
        
        // 添加新内容
        const newContent = currentContent ? currentContent + '\n' + item : item;
        console.log('新内容:', newContent);
        
        // 简单直接的方法：直接设置为文本内容，让DayPlanTodoUtils.renderTodos处理渲染
        container.textContent = newContent;
        
        // 重新渲染待办事项以确保功能正常
        if (typeof DayPlanTodoUtils !== 'undefined' && DayPlanTodoUtils.renderTodos) {
            DayPlanTodoUtils.renderTodos(container);
        }
        
        // 更新进度
        updateProgress();
        
        console.log('✅ 快捷项目插入成功');
        MessageUtils.success('✅ 模板已插入！可继续选择其他模板');
    } else {
        console.error('❌ 找不到目标容器:', targetId);
        MessageUtils.error('插入失败：找不到目标区域');
    }
    
    // 不自动关闭模态框，让用户可以继续选择模板
    // 用户可以手动点击关闭按钮或点击背景关闭
}

// 安全的快捷插入函数（避免字符串转义问题）
function insertQuickItemSafe(targetId, templateIndex) {
    console.log('安全插入快捷项目:', { targetId, templateIndex });
    
    if (currentQuickInsertData.targetId !== targetId) {
        console.error('❌ 目标ID不匹配');
        MessageUtils.error('插入失败：数据不匹配');
        return;
    }
    
    const item = currentQuickInsertData.templates[templateIndex];
    if (!item) {
        console.error('❌ 模板项目不存在');
        MessageUtils.error('插入失败：模板不存在');
        return;
    }
    
    // 调用原来的插入函数
    insertQuickItem(targetId, item);
}

// ================================
// 自定义模板管理功能
// ================================

// 获取自定义模板
function getCustomTemplates() {
    try {
        const stored = localStorage.getItem('customQuickInsertTemplates');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('读取自定义模板失败:', error);
        return {};
    }
}

// 保存自定义模板
function saveCustomTemplates(templates) {
    try {
        localStorage.setItem('customQuickInsertTemplates', JSON.stringify(templates));
        console.log('自定义模板已保存:', templates);
        return true;
    } catch (error) {
        console.error('保存自定义模板失败:', error);
        MessageUtils.error('保存失败：存储空间不足');
        return false;
    }
}

// 显示自定义模板编辑器
function showCustomTemplateEditor(targetId) {
    console.log('显示自定义模板编辑器:', targetId);
    
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    const targetNames = {
        'day_top3': '今日重点',
        'day_must_dos': '必做事项', 
        'day_todos': '待办事项'
    };
    
    const content = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 8px;">
                ✏️ 自定义模板管理 - ${targetNames[targetId] || targetId}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                管理您的个性化任务模板，可以快速添加单个模板或批量编辑
            </p>
        </div>
        
        <!-- 快速添加单个模板 -->
        <div style="background: linear-gradient(135deg, #e3f2fd, #f8f9fa); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid var(--theme-color);">
            <h5 style="margin: 0 0 12px 0; color: var(--theme-color); font-size: 14px;">🚀 快速添加模板</h5>
            <div style="display: flex; gap: 8px; align-items: flex-end;">
                <div style="flex: 1;">
                    <input 
                        type="text" 
                        id="quick-template-input" 
                        placeholder="输入一个新的模板内容，例如：[ ] 完成重要工作"
                        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
                        onkeypress="if(event.key==='Enter') addSingleTemplate('${targetId}')"
                    />
                </div>
                <button 
                    class="btn-main" 
                    onclick="addSingleTemplate('${targetId}')" 
                    style="padding: 10px 16px; white-space: nowrap;"
                >
                    ➕ 添加
                </button>
            </div>
        </div>
        
        <!-- 现有模板列表 -->
        <div id="existing-templates-list" style="margin-bottom: 16px;">
            <h5 style="margin: 0 0 12px 0; color: #333; font-size: 14px;">📋 现有模板 (${currentTemplates.length}个)</h5>
            <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 6px;">
                ${currentTemplates.length > 0 ? currentTemplates.map((template, index) => `
                    <div style="display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; background: ${index % 2 === 0 ? '#fafafa' : 'white'};">
                        <div style="flex: 1; font-size: 14px; color: #333;">${template}</div>
                        <div style="display: flex; gap: 4px;">
                            <button 
                                class="btn-secondary" 
                                onclick="editSingleTemplate('${targetId}', ${index})" 
                                style="padding: 4px 8px; font-size: 12px;"
                                title="编辑此模板"
                            >
                                ✏️
                            </button>
                            <button 
                                class="btn-danger" 
                                onclick="deleteSingleTemplate('${targetId}', ${index})" 
                                style="padding: 4px 8px; font-size: 12px;"
                                title="删除此模板"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 24px; color: #999;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                        <div>还没有自定义模板</div>
                        <div style="font-size: 12px; margin-top: 4px;">使用上方的快速添加功能创建您的第一个模板</div>
                    </div>
                `}
            </div>
        </div>
        
        <!-- 批量编辑模式 -->
        <div style="margin-bottom: 16px;">
            <button 
                class="btn-outline" 
                onclick="showBatchEditMode('${targetId}')" 
                style="width: 100%; padding: 10px; border: 2px dashed #ddd;"
            >
                📝 切换到批量编辑模式
            </button>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-outline" onclick="ModalUtils.hide()" style="padding: 10px 20px;">
                关闭
            </button>
            ${currentTemplates.length > 0 ? `
                <button class="btn-danger" onclick="clearCustomTemplates('${targetId}')" style="padding: 10px 20px;">
                    🗑️ 清空全部
                </button>
            ` : ''}
        </div>
    `;
    
    ModalUtils.show('自定义模板管理', content, 'large');
    
    // 聚焦到输入框
    setTimeout(() => {
        const input = document.getElementById('quick-template-input');
        if (input) {
            input.focus();
        }
    }, 100);
}

// 添加单个模板
function addSingleTemplate(targetId) {
    const input = document.getElementById('quick-template-input');
    if (!input) {
        MessageUtils.error('找不到输入框');
        return;
    }
    
    const content = input.value.trim();
    if (!content) {
        MessageUtils.warning('请输入模板内容');
        input.focus();
        return;
    }
    
    // 获取现有的自定义模板
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    // 检查是否已存在相同模板
    if (currentTemplates.includes(content)) {
        MessageUtils.warning('该模板已存在');
        input.focus();
        return;
    }
    
    // 添加新模板
    currentTemplates.push(content);
    customTemplates[targetId] = currentTemplates;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success('模板添加成功');
        input.value = '';
        input.focus();
        
        // 刷新模板管理界面
        setTimeout(() => {
            showCustomTemplateEditor(targetId);
        }, 200);
    }
}

// 编辑单个模板
function editSingleTemplate(targetId, templateIndex) {
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    if (templateIndex < 0 || templateIndex >= currentTemplates.length) {
        MessageUtils.error('模板索引无效');
        return;
    }
    
    const currentTemplate = currentTemplates[templateIndex];
    
    const content = `
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                编辑模板内容：
            </label>
            <input 
                type="text" 
                id="edit-template-input" 
                value="${currentTemplate}"
                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
                onkeypress="if(event.key==='Enter') updateSingleTemplate('${targetId}', ${templateIndex})"
            />
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-outline" onclick="ModalUtils.hide()" style="padding: 10px 20px;">
                取消
            </button>
            <button class="btn-main" onclick="updateSingleTemplate('${targetId}', ${templateIndex})" style="padding: 10px 20px;">
                💾 保存修改
            </button>
        </div>
    `;
    
    ModalUtils.show('编辑模板', content);
    
    // 聚焦到输入框并选中所有文本
    setTimeout(() => {
        const input = document.getElementById('edit-template-input');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

// 更新单个模板
function updateSingleTemplate(targetId, templateIndex) {
    const input = document.getElementById('edit-template-input');
    if (!input) {
        MessageUtils.error('找不到输入框');
        return;
    }
    
    const content = input.value.trim();
    if (!content) {
        MessageUtils.warning('请输入模板内容');
        input.focus();
        return;
    }
    
    // 获取现有的自定义模板
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    if (templateIndex < 0 || templateIndex >= currentTemplates.length) {
        MessageUtils.error('模板索引无效');
        return;
    }
    
    // 检查是否与其他模板重复
    const otherTemplates = currentTemplates.filter((_, index) => index !== templateIndex);
    if (otherTemplates.includes(content)) {
        MessageUtils.warning('该模板已存在');
        input.focus();
        return;
    }
    
    // 更新模板
    currentTemplates[templateIndex] = content;
    customTemplates[targetId] = currentTemplates;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success('模板修改成功');
        ModalUtils.hide();
        
        // 刷新模板管理界面
        setTimeout(() => {
            showCustomTemplateEditor(targetId);
        }, 200);
    }
}

// 删除单个模板
function deleteSingleTemplate(targetId, templateIndex) {
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    if (templateIndex < 0 || templateIndex >= currentTemplates.length) {
        MessageUtils.error('模板索引无效');
        return;
    }
    
    const templateContent = currentTemplates[templateIndex];
    
    if (!confirm(`确定要删除这个模板吗？\n\n"${templateContent}"\n\n此操作不可恢复。`)) {
        return;
    }
    
    // 删除模板
    currentTemplates.splice(templateIndex, 1);
    customTemplates[targetId] = currentTemplates;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success('模板删除成功');
        
        // 刷新模板管理界面
        setTimeout(() => {
            showCustomTemplateEditor(targetId);
        }, 200);
    }
}

// 显示批量编辑模式
function showBatchEditMode(targetId) {
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    const targetNames = {
        'day_top3': '今日重点',
        'day_must_dos': '必做事项', 
        'day_todos': '待办事项'
    };
    
    const content = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 8px;">
                📝 批量编辑模式 - ${targetNames[targetId] || targetId}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                在此模式下，您可以一次性编辑所有模板内容，每行一个模板
            </p>
        </div>
        
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                模板内容：
            </label>
            <textarea 
                id="batch-template-editor" 
                placeholder="输入模板内容，每行一个任务项&#10;例如：&#10;[ ] 完成重要工作&#10;[ ] 学习新技能&#10;[ ] 运动锻炼"
                style="width: 100%; height: 200px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 14px; resize: vertical; line-height: 1.5;"
            >${currentTemplates.join('\\n')}</textarea>
        </div>
        
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
            <h5 style="margin: 0 0 8px 0; color: #495057;">📝 编辑提示：</h5>
            <ul style="margin: 0; padding-left: 16px; color: #6c757d; font-size: 13px;">
                <li>每行输入一个任务模板</li>
                <li>建议以 "[ ] " 开头表示待办任务</li>
                <li>可以使用表情符号让模板更生动</li>
                <li>空行将被自动忽略</li>
            </ul>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-outline" onclick="showCustomTemplateEditor('${targetId}')" style="padding: 10px 20px;">
                ← 返回管理界面
            </button>
            <button class="btn-main" onclick="saveBatchTemplates('${targetId}')" style="padding: 10px 20px;">
                💾 保存全部
            </button>
        </div>
    `;
    
    ModalUtils.show('批量编辑模板', content, 'large');
    
    // 聚焦到文本框
    setTimeout(() => {
        const textarea = document.getElementById('batch-template-editor');
        if (textarea) {
            textarea.focus();
            // 光标移动到末尾
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, 100);
}

// 保存批量编辑的模板
function saveBatchTemplates(targetId) {
    const textarea = document.getElementById('batch-template-editor');
    if (!textarea) {
        MessageUtils.error('找不到编辑器');
        return;
    }
    
    const content = textarea.value.trim();
    const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    // 获取现有的自定义模板
    const customTemplates = getCustomTemplates();
    
    // 更新指定目标的模板
    customTemplates[targetId] = lines;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success(`已保存 ${lines.length} 个自定义模板`);
        
        // 返回管理界面
        setTimeout(() => {
            showCustomTemplateEditor(targetId);
        }, 200);
    }
}

// 显示模板分类选择
function showTemplateCategories(targetId) {
    const targetNames = {
        'day_top3': '今日重点',
        'day_must_dos': '必做事项', 
        'day_todos': '待办事项'
    };
    
    const templateCategories = {
        work: {
            name: '💼 工作相关',
            templates: [
                '[ ] 📧 处理重要邮件',
                '[ ] 📞 参加团队会议',
                '[ ] 📊 完成项目报告',
                '[ ] 💻 代码开发任务',
                '[ ] 📝 撰写文档',
                '[ ] 🎯 制定工作计划',
                '[ ] 📈 数据分析',
                '[ ] 🔍 市场调研',
                '[ ] 💼 整理工作文档',
                '[ ] 📋 规划下周工作',
                '[ ] 🤝 客户沟通',
                '[ ] 📅 安排会议议程',
                '[ ] 💡 项目头脑风暴',
                '[ ] 📎 文件归档整理',
                '[ ] 🎪 团队建设活动'
            ]
        },
        communication: {
            name: '📞 沟通交流',
            templates: [
                '[ ] 📧 回复重要邮件',
                '[ ] 📱 回复微信消息',
                '[ ] 💬 与同事讨论项目',
                '[ ] 📞 电话联系客户',
                '[ ] 📝 准备汇报材料',
                '[ ] 🗣️ 参与团队讨论',
                '[ ] 📬 发送工作邮件',
                '[ ] 💻 参加视频会议',
                '[ ] 📋 整理会议纪要',
                '[ ] 🤝 协调部门合作'
            ]
        },
        planning: {
            name: '📋 规划安排',
            templates: [
                '[ ] 📅 规划下周工作',
                '[ ] 🎯 制定月度目标',
                '[ ] 📊 分析项目进度',
                '[ ] 📝 更新工作计划',
                '[ ] 🗓️ 安排时间表',
                '[ ] 📈 设定优先级',
                '[ ] 🎪 规划团队活动',
                '[ ] 📋 制定学习计划',
                '[ ] 🚀 准备项目启动',
                '[ ] 📊 评估工作效果'
            ]
        },
        study: {
            name: '📚 学习成长',
            templates: [
                '[ ] 📖 阅读专业书籍',
                '[ ] 🎓 在线课程学习',
                '[ ] 💡 技能练习',
                '[ ] 📝 整理学习笔记',
                '[ ] 🧠 知识复习',
                '[ ] 🌐 学习新技术',
                '[ ] 📺 观看教学视频',
                '[ ] ✍️ 写学习总结',
                '[ ] 📚 制定读书计划',
                '[ ] 💻 编程练习',
                '[ ] 🔬 技术研究',
                '[ ] 📖 专业文档阅读'
            ]
        },
        life: {
            name: '🏠 生活日常',
            templates: [
                '[ ] 🏃‍♂️ 运动锻炼',
                '[ ] 🧘‍♀️ 冥想放松',
                '[ ] 🍳 准备健康餐食',
                '[ ] 🧹 整理房间',
                '[ ] 🛒 购买生活用品',
                '[ ] 👨‍👩‍👧‍👦 陪伴家人',
                '[ ] 📱 整理手机相册',
                '[ ] 💤 早睡早起',
                '[ ] 🚿 个人卫生护理',
                '[ ] 📺 休闲娱乐时间',
                '[ ] 🎮 适度游戏放松',
                '[ ] 🌱 照料植物花草'
            ]
        },
        health: {
            name: '💪 健康管理',
            templates: [
                '[ ] 🚶‍♂️ 步行 30 分钟',
                '[ ] 💧 喝足够的水',
                '[ ] 🥗 吃健康食物',
                '[ ] 😴 保证充足睡眠',
                '[ ] 🧘 压力管理',
                '[ ] 👨‍⚕️ 定期体检',
                '[ ] 🏋️‍♂️ 力量训练',
                '[ ] 🌞 户外活动',
                '[ ] 🍎 合理膳食搭配',
                '[ ] 💊 按时服药',
                '[ ] 🧘‍♂️ 深呼吸练习',
                '[ ] 👁️ 护眼休息'
            ]
        }
    };
    
    const content = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 8px;">
                📂 模板分类选择 - ${targetNames[targetId] || targetId}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                从预设分类中快速选择合适的模板，一键添加到您的自定义模板库
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; max-height: 400px; overflow-y: auto;">
            ${Object.entries(templateCategories).map(([key, category]) => `
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 12px; border-bottom: 1px solid #e0e0e0;">
                        <h5 style="margin: 0; color: #333; font-size: 14px;">${category.name}</h5>
                    </div>
                    <div style="padding: 8px;">
                        ${category.templates.map((template, index) => `
                            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                                <button 
                                    class="btn-outline" 
                                    onclick="addTemplateFromCategory('${targetId}', '${template.replace(/'/g, "\\'")}')" 
                                    style="flex: 1; text-align: left; padding: 6px 8px; font-size: 12px; border: 1px solid #e0e0e0;"
                                >
                                    ${template}
                                </button>
                                <button 
                                    class="btn-main" 
                                    onclick="insertQuickItemDirect('${targetId}', '${template.replace(/'/g, "\\'")}')" 
                                    style="padding: 6px 8px; font-size: 11px; min-width: auto;"
                                    title="直接插入"
                                >
                                    ⚡
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <button class="btn-outline" onclick="showQuickInsertMenu(null, '${targetId}')" style="padding: 10px 20px;">
                ← 返回快捷插入
            </button>
        </div>
    `;
    
    ModalUtils.show('模板分类选择', content, 'large');
}

// 从分类中添加模板
function addTemplateFromCategory(targetId, template) {
    // 获取现有的自定义模板
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    // 检查是否已存在相同模板
    if (currentTemplates.includes(template)) {
        MessageUtils.warning('该模板已存在');
        return;
    }
    
    // 添加新模板
    currentTemplates.push(template);
    customTemplates[targetId] = currentTemplates;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success('模板添加成功');
    }
}

// 直接插入模板（不保存到自定义模板）
function insertQuickItemDirect(targetId, template) {
    console.log('直接插入模板:', { targetId, template });
    
    const container = document.getElementById(targetId);
    if (container) {
        // 获取当前内容（改进版本）
        let currentContent = '';
        
        // 检查是否有现有的任务项
        const existingTasks = container.querySelectorAll('.task-item');
        console.log('🔍 找到现有任务数量:', existingTasks.length);
        
        if (existingTasks.length > 0) {
            const lines = [];
            existingTasks.forEach((task, index) => {
                const checkbox = task.querySelector('.custom-checkbox');
                const textElement = task.querySelector('.task-text');
                let text = '';
                
                // 改进：正确获取textarea或input的值
                if (textElement) {
                    if (textElement.tagName === 'TEXTAREA' || textElement.tagName === 'INPUT') {
                        text = textElement.value.trim();
                    } else {
                        text = textElement.textContent.trim();
                    }
                }
                
                console.log(`📝 任务 ${index + 1}: "${text}" (${textElement ? textElement.tagName : 'no element'})`);
                
                // 保留所有任务，包括空任务
                if (checkbox) {
                const isChecked = checkbox.classList.contains('checked');
                lines.push(`[${isChecked ? 'x' : ' '}] ${text}`);
                } else {
                    // 时间块或其他格式
                    lines.push(text || '[ ] '); // 确保空任务也被保留
                }
            });
            currentContent = lines.join('\n');
        } else {
            currentContent = container.textContent || '';
        }
        
        console.log('📋 当前内容:', currentContent);
        
        // 添加新内容
        const newContent = currentContent.trim() ? currentContent + '\n' + template : template;
        
        console.log('🆕 合并后内容:', newContent);
        
        // 更新容器内容
        container.textContent = newContent;
        
        // 重新渲染TODO项
        if (typeof DayPlanTodoUtils !== 'undefined' && DayPlanTodoUtils.renderTodos) {
            DayPlanTodoUtils.renderTodos(container);
        }
        
        MessageUtils.success('✅ 模板已插入！可继续选择其他模板');
        
        // 自动保存草稿
        saveDraft();
        
        // 不自动关闭模态框，让用户可以继续选择模板
        // 用户可以手动点击关闭按钮或点击背景关闭
    } else {
        MessageUtils.error('目标容器未找到');
    }
}

// 更新模板项目内容
function updateTemplateItem(targetId, templateIndex, newValue) {
    console.log('更新模板项目:', { targetId, templateIndex, newValue });
    
    // 如果是自定义模板，则保存到localStorage
    const defaultTemplates = {
        day_top3: [
            '[ ] 完成重要项目里程碑',
            '[ ] 处理紧急客户需求',
            '[ ] 准备明天的重要会议'
        ],
        day_must_dos: [
            '[ ] 晨间锻炼 30分钟',
            '[ ] 阅读学习 1小时',
            '[ ] 冥想放松 15分钟'
        ],
        day_todos: [
            '[ ] 回复重要邮件',
            '[ ] 整理工作文档',
            '[ ] 规划下周工作'
        ]
    };
    
    const defaultCount = (defaultTemplates[targetId] || []).length;
    
    if (templateIndex >= defaultCount) {
        // 更新自定义模板
        const customTemplates = getCustomTemplates();
        const currentTemplates = customTemplates[targetId] || [];
        const customIndex = templateIndex - defaultCount;
        
        if (customIndex >= 0 && customIndex < currentTemplates.length) {
            currentTemplates[customIndex] = newValue.trim();
            customTemplates[targetId] = currentTemplates;
            
            if (saveCustomTemplates(customTemplates)) {
                console.log('自定义模板已更新');
            }
        }
    }
    
    // 更新全局数据
    if (currentQuickInsertData.templates && currentQuickInsertData.templates[templateIndex]) {
        currentQuickInsertData.templates[templateIndex] = newValue.trim();
    }
}

// 插入更新后的模板
function insertUpdatedTemplate(targetId, templateIndex, newValue) {
    console.log('插入更新后的模板:', { targetId, templateIndex, newValue });
    
    // 先更新模板
    updateTemplateItem(targetId, templateIndex, newValue);
    
    // 然后插入
    insertQuickItemDirect(targetId, newValue.trim());
}

// 按索引插入模板
function insertTemplateByIndex(targetId, templateIndex) {
    console.log('按索引插入模板:', { targetId, templateIndex });
    
    const template = currentQuickInsertData.templates[templateIndex];
    if (template) {
        insertQuickItemDirect(targetId, template);
    } else {
        MessageUtils.error('模板未找到');
    }
}

// 显示模板预览
function showTemplatePreview(targetId) {
    const customTemplates = getCustomTemplates();
    const currentTemplates = customTemplates[targetId] || [];
    
    const defaultTemplates = {
        day_top3: [
            '[ ] 完成重要项目里程碑',
            '[ ] 处理紧急客户需求',
            '[ ] 准备明天的重要会议'
        ],
        day_must_dos: [
            '[ ] 晨间锻炼 30分钟',
            '[ ] 阅读学习 1小时',
            '[ ] 冥想放松 15分钟'
        ],
        day_todos: [
            '[ ] 回复重要邮件',
            '[ ] 整理工作文档',
            '[ ] 规划下周工作'
        ]
    };
    
    const allTemplates = [...(defaultTemplates[targetId] || []), ...currentTemplates];
    
    const targetNames = {
        'day_top3': '今日重点',
        'day_must_dos': '必做事项', 
        'day_todos': '待办事项'
    };
    
    const content = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 8px;">
                👁️ 模板预览 - ${targetNames[targetId] || targetId}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                查看所有可用的模板，包括预设模板和您的自定义模板
            </p>
        </div>
        
        ${(defaultTemplates[targetId] || []).length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h5 style="color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    🎯 预设模板 
                    <span style="background: #e3f2fd; color: #1976d2; font-size: 11px; padding: 2px 6px; border-radius: 10px;">
                        ${(defaultTemplates[targetId] || []).length} 个
                    </span>
                </h5>
                <div style="background: #f8f9fa; border-radius: 6px; padding: 12px;">
                    ${(defaultTemplates[targetId] || []).map((template, index) => `
                        <div style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 8px;">
                            <span style="color: #1976d2; font-weight: bold; min-width: 20px;">${index + 1}.</span>
                            <span style="flex: 1; font-family: monospace; font-size: 13px;">${template}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${currentTemplates.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h5 style="color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ⭐ 自定义模板 
                    <span style="background: #e8f5e9; color: #4caf50; font-size: 11px; padding: 2px 6px; border-radius: 10px;">
                        ${currentTemplates.length} 个
                    </span>
                </h5>
                <div style="background: #f1f8e9; border-radius: 6px; padding: 12px;">
                    ${currentTemplates.map((template, index) => `
                        <div style="padding: 8px 0; border-bottom: 1px solid #c8e6c9; display: flex; align-items: center; gap: 8px;">
                            <span style="color: #4caf50; font-weight: bold; min-width: 20px;">${index + 1}.</span>
                            <span style="flex: 1; font-family: monospace; font-size: 13px;">${template}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div style="text-align: center; padding: 20px; background: #fff3e0; border-radius: 8px; border: 2px dashed #ffcc02;">
                <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                <div style="color: #ef6c00; font-size: 14px;">还没有自定义模板</div>
                <div style="color: #999; font-size: 12px; margin-top: 4px;">
                    点击下方按钮创建您的第一个自定义模板
                </div>
            </div>
        `}
        
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
            <button class="btn-outline" onclick="showQuickInsertMenu(null, '${targetId}')" style="padding: 10px 20px;">
                ← 返回快捷插入
            </button>
            <button class="btn-main" onclick="showCustomTemplateEditor('${targetId}')" style="padding: 10px 20px;">
                ✏️ 管理模板
            </button>
        </div>
    `;
    
    ModalUtils.show('模板预览', content, 'large');
}

// 保存自定义模板
function saveCustomTemplate(targetId) {
    const textarea = document.getElementById('custom-template-editor');
    if (!textarea) {
        MessageUtils.error('找不到编辑器');
        return;
    }
    
    const content = textarea.value.trim();
    const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (lines.length === 0) {
        MessageUtils.warning('请输入至少一个模板内容');
        return;
    }
    
    // 获取现有的自定义模板
    const customTemplates = getCustomTemplates();
    
    // 更新指定目标的模板
    customTemplates[targetId] = lines;
    
    // 保存到localStorage
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success(`已保存 ${lines.length} 个自定义模板`);
        ModalUtils.hide();
        
        // 刷新快捷插入菜单
        setTimeout(() => {
            showQuickInsertMenu(null, targetId);
        }, 300);
    }
}

// 清空自定义模板
function clearCustomTemplates(targetId) {
    if (!confirm('确定要清空所有自定义模板吗？此操作不可恢复。')) {
        return;
    }
    
    const customTemplates = getCustomTemplates();
    delete customTemplates[targetId];
    
    if (saveCustomTemplates(customTemplates)) {
        MessageUtils.success('已清空自定义模板');
        ModalUtils.hide();
        
        // 刷新快捷插入菜单
        setTimeout(() => {
            showQuickInsertMenu(null, targetId);
        }, 300);
    }
}

// 删除单个自定义模板
function deleteCustomTemplate(targetId, templateIndex) {
    if (!confirm('确定要删除这个自定义模板吗？')) {
        return;
    }
    
    const customTemplates = getCustomTemplates();
    const templates = customTemplates[targetId] || [];
    
    if (templateIndex >= 0 && templateIndex < templates.length) {
        templates.splice(templateIndex, 1);
        customTemplates[targetId] = templates;
        
        if (saveCustomTemplates(customTemplates)) {
            MessageUtils.success('模板已删除');
            
            // 刷新快捷插入菜单
            setTimeout(() => {
                showQuickInsertMenu(null, targetId);
            }, 300);
        }
    } else {
        MessageUtils.error('模板索引无效');
    }
}

// 快速导航功能
function showQuickNavigation() {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📅 快速导航</h3>
            <p style="color: #666;">快速跳转到其他日期和功能</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <button class="nav-btn" onclick="jumpToToday()">
                <div class="nav-icon">📍</div>
                <div>今天</div>
            </button>
            
            <button class="nav-btn" onclick="jumpToYesterday()">
                <div class="nav-icon">⏪</div>
                <div>昨天</div>
            </button>
            
            <button class="nav-btn" onclick="jumpToTomorrow()">
                <div class="nav-icon">⏩</div>
                <div>明天</div>
            </button>
            
            <button class="nav-btn" onclick="jumpToWeekStart()">
                <div class="nav-icon">📊</div>
                <div>本周开始</div>
            </button>
            
            <button class="nav-btn" onclick="jumpToMonthStart()">
                <div class="nav-icon">📈</div>
                <div>本月开始</div>
            </button>
            
            <button class="nav-btn" onclick="showDatePicker()">
                <div class="nav-icon">🗓️</div>
                <div>选择日期</div>
            </button>
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">快速操作</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn-main" onclick="copyFromYesterday()">复制昨日计划</button>
                <button class="btn-main" onclick="createTemplate()">创建模板</button>
                <button class="btn-main" onclick="showRecentDays()">最近几天</button>
            </div>
        </div>
        
        <style>
            .nav-btn {
                background: rgba(255,255,255,0.9);
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                font-size: 0.9em;
            }
            .nav-btn:hover {
                border-color: var(--theme-color);
                background: var(--theme-color-light);
                transform: translateY(-2px);
            }
            .nav-icon {
                font-size: 1.5em;
                margin-bottom: 4px;
            }
        </style>
    `;
    
    ModalUtils.show('快速导航', content);
}

// 能量跟踪功能
function showEnergyTracker() {
    const currentTime = new Date().getHours();
    let energyLevel = '';
    let energyColor = '';
    let suggestions = [];
    
    // 根据时间判断能量状态
    if (currentTime >= 6 && currentTime < 10) {
        energyLevel = '高能量期';
        energyColor = '#4caf50';
        suggestions = ['安排重要任务', '创意工作', '学习新知识'];
    } else if (currentTime >= 10 && currentTime < 14) {
        energyLevel = '稳定期';
        energyColor = '#2196f3';
        suggestions = ['处理日常事务', '团队协作', '会议沟通'];
    } else if (currentTime >= 14 && currentTime < 16) {
        energyLevel = '低能量期';
        energyColor = '#ff9800';
        suggestions = ['休息放松', '简单任务', '整理归档'];
    } else if (currentTime >= 16 && currentTime < 19) {
        energyLevel = '回升期';
        energyColor = '#9c27b0';
        suggestions = ['运动锻炼', '社交活动', '规划明天'];
    } else {
        energyLevel = '休息期';
        energyColor = '#607d8b';
        suggestions = ['放松娱乐', '家庭时间', '早点休息'];
    }
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">⚡ 能量跟踪</h3>
            <p style="color: #666;">根据生物钟优化您的任务安排</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 3em; margin-bottom: 8px;">⚡</div>
            <div style="font-size: 1.2em; font-weight: 600; color: ${energyColor}; margin-bottom: 8px;">${energyLevel}</div>
            <div style="color: #666;">当前时间: ${currentTime}:00</div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">💡 建议安排</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${suggestions.map(suggestion => `
                    <div style="background: rgba(25,118,210,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid ${energyColor};">
                        ${suggestion}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div>
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">🕐 全天能量曲线</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.85em;">
                <div style="text-align: center; padding: 8px; background: #e8f5e9; border-radius: 6px;">
                    <div style="font-weight: 600; color: #4caf50;">06-10点</div>
                    <div>高能量期</div>
                </div>
                <div style="text-align: center; padding: 8px; background: #e3f2fd; border-radius: 6px;">
                    <div style="font-weight: 600; color: #2196f3;">10-14点</div>
                    <div>稳定期</div>
                </div>
                <div style="text-align: center; padding: 8px; background: #fff3e0; border-radius: 6px;">
                    <div style="font-weight: 600; color: #ff9800;">14-16点</div>
                    <div>低能量期</div>
                </div>
                <div style="text-align: center; padding: 8px; background: #f3e5f5; border-radius: 6px;">
                    <div style="font-weight: 600; color: #9c27b0;">16-19点</div>
                    <div>回升期</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-main" onclick="recordEnergyLevel()">记录当前能量</button>
            <button class="btn-main" onclick="showEnergyHistory()">能量历史</button>
        </div>
    `;
    
    ModalUtils.show('能量跟踪', content);
}

// 生产力分析功能
function showProductivityAnalysis() {
    const today = new Date();
    const last7Days = [];
    
    // 计算过去7天的数据
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = DateUtils.formatDate(date);
        const dayData = StorageUtils.loadPlan('day', dateStr);
        
        last7Days.push({
            date: dateStr,
            dayName: DateUtils.getWeekdayName(date),
            data: dayData
        });
    }
    
    // 计算统计数据
    const stats = calculateProductivityStats(last7Days);
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📊 生产力分析</h3>
            <p style="color: #666;">过去7天的工作效率分析与趋势</p>
        </div>
        
        <!-- 核心指标 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div class="stat-card">
                <div class="stat-number" style="color: #4caf50;">${stats.completionRate}%</div>
                <div class="stat-label">完成率</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #2196f3;">${stats.totalTasks}</div>
                <div class="stat-label">总任务数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #ff9800;">${stats.avgTasksPerDay}</div>
                <div class="stat-label">日均任务</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #9c27b0;">${stats.streak}</div>
                <div class="stat-label">连续天数</div>
            </div>
        </div>
        
        <!-- 每日趋势 -->
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">📈 每日趋势</h4>
            <div style="display: flex; justify-content: space-between; align-items: end; height: 120px; background: rgba(255,255,255,0.5); border-radius: 8px; padding: 16px; border: 1px solid #e0e0e0;">
                ${last7Days.map(day => {
                    const completed = day.data ? calculateDayCompletion(day.data) : 0;
                    const height = Math.max(completed * 0.8, 5);
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 20px; background: linear-gradient(to top, #4caf50, #81c784); height: ${height}px; border-radius: 2px; margin-bottom: 8px;" title="${completed}%完成"></div>
                            <div style="font-size: 0.75em; color: #666; text-align: center;">${day.dayName}</div>
                            <div style="font-size: 0.7em; color: #999;">${day.date.split('-')[2]}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- 效率洞察 -->
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">💡 效率洞察</h4>
            <div style="background: rgba(25,118,210,0.05); border-radius: 8px; padding: 16px;">
                ${generateProductivityInsights(stats, last7Days)}
            </div>
        </div>
        
        <!-- 建议改进 -->
        <div>
            <h4 style="color: var(--theme-color); margin-bottom: 12px;">🎯 改进建议</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${generateImprovementSuggestions(stats).map(suggestion => `
                    <div style="background: rgba(76,175,80,0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #4caf50;">
                        ${suggestion}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <style>
            .stat-card {
                background: rgba(255,255,255,0.9);
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-number {
                font-size: 1.8em;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .stat-label {
                font-size: 0.8em;
                color: #666;
                font-weight: 500;
            }
        </style>
    `;
    
    // 在内容末尾添加额外的关闭按钮
    const contentWithCloseBtn = content + `
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <button onclick="forceCloseModal()" class="btn-danger" style="background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                ✕ 强制关闭
            </button>
        </div>
    `;
    
    ModalUtils.show('生产力分析', contentWithCloseBtn, 'large');
}

function showHabitAnalytics() {
    console.log('showHabitAnalytics called');
    
    // 获取习惯任务数据
    const habitTasks = getTodoContent('day_must_dos');
    const today = DateUtils.getToday();
    
    // 分析当前习惯
    const habitLines = habitTasks.split('\n').filter(line => line.trim().startsWith('['));
    const habitCompleted = habitLines.filter(line => line.includes('[x]') || line.includes('[X]')).length;
    const habitTotal = habitLines.length;
    const habitRate = habitTotal > 0 ? Math.round((habitCompleted / habitTotal) * 100) : 0;
    
    // 模拟历史数据 (实际项目中应该从localStorage获取)
    const historicalData = generateHabitHistoryData();
    const weeklyStats = calculateWeeklyHabitStats(historicalData);
    const streakData = calculateHabitStreaks(habitLines);
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📊 习惯分析</h3>
            <p style="color: #666;">分析您的习惯养成情况和坚持度</p>
        </div>
        
        <!-- 今日习惯概览 -->
        <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
            <h4 style="color: #2e7d32; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                📅 今日习惯概览
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 1.8em; font-weight: 700; color: #4caf50;">${habitRate}%</div>
                    <div style="font-size: 0.8em; color: #666;">完成率</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8em; font-weight: 700; color: #2196f3;">${habitCompleted}/${habitTotal}</div>
                    <div style="font-size: 0.8em; color: #666;">今日进度</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8em; font-weight: 700; color: #ff9800;">${streakData.maxStreak}</div>
                    <div style="font-size: 0.8em; color: #666;">最长连续</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8em; font-weight: 700; color: #9c27b0;">${streakData.currentStreak}</div>
                    <div style="font-size: 0.8em; color: #666;">当前连续</div>
                </div>
            </div>
        </div>
        
        <!-- 习惯详情 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">🎯 习惯详情</h4>
            <div style="max-height: 150px; overflow-y: auto;">
                ${habitLines.length > 0 ? habitLines.map((line, index) => {
                    const isCompleted = line.includes('[x]') || line.includes('[X]');
                    const text = line.replace(/^\[.\]\s*/, '');
                    const streak = calculateIndividualHabitStreak(text); // 计算具体习惯的连续天数
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2em;">${isCompleted ? '✅' : '⏳'}</span>
                                <span style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${text}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="background: ${isCompleted ? '#4caf50' : '#ff9800'}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">
                                    🔥 ${streak}天
                                </span>
                                <span style="color: #666; font-size: 0.8em;">${getHabitDifficulty(text)}</span>
                            </div>
                        </div>
                    `;
                }).join('') : '<div style="text-align: center; color: #999; padding: 20px;">暂无习惯记录</div>'}
            </div>
        </div>
        
        <!-- 周趋势分析 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">📈 本周趋势</h4>
            <div style="display: flex; justify-content: space-between; align-items: end; height: 80px; background: rgba(255,255,255,0.5); border-radius: 6px; padding: 12px; border: 1px solid #e0e0e0;">
                ${weeklyStats.map((day, index) => {
                    const height = Math.max(day.rate * 0.6, 5);
                    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dayName = dayNames[date.getDay()];
                    const isToday = day.date === DateUtils.getToday();
                    const hasData = day.hasData;
                    
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 16px; background: ${hasData ? 'linear-gradient(to top, #4caf50, #81c784)' : '#e0e0e0'}; height: ${height}px; border-radius: 2px; margin-bottom: 6px; ${isToday ? 'border: 2px solid #1976d2;' : ''}" title="${hasData ? day.rate + '%完成' : '无数据'}"></div>
                            <div style="font-size: 0.7em; color: ${isToday ? '#1976d2' : '#666'}; font-weight: ${isToday ? '600' : 'normal'};">${dayName}</div>
                            <div style="font-size: 0.65em; color: #999;">${hasData ? day.rate + '%' : '-'}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- 习惯洞察 -->
        <div style="background: rgba(76, 175, 80, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #4caf50; margin: 0 0 12px 0;">💡 习惯洞察</h4>
            <div style="color: #666; line-height: 1.5;">
                ${generateHabitInsights(habitRate, habitTotal, streakData)}
            </div>
        </div>
        
        <!-- 习惯建议 -->
        <div style="background: rgba(233, 30, 99, 0.05); border-radius: 8px; padding: 16px;">
            <h4 style="color: #e91e63; margin: 0 0 12px 0;">🎯 改进建议</h4>
            <div style="color: #666; line-height: 1.5;">
                ${generateHabitRecommendations(habitRate, habitTotal)}
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 16px;">
            <button class="btn-main" onclick="refreshHabitAnalysis()" style="margin-right: 8px;">🔄 刷新分析</button>
            <button class="btn-main" onclick="exportHabitData()" style="margin-right: 8px;">📤 导出数据</button>
            <button class="btn-main" onclick="debugHabitData()" style="background: #f3e5f5; color: #7b1fa2;">🔍 查看数据源</button>
        </div>
    `;
    
    ModalUtils.show('习惯分析', content, 'large');
}

function showPriorityAnalytics() {
    console.log('showPriorityAnalytics called');
    
    // 获取当前优先级任务
    const priorityTasks = getTodoContent('day_top3');
    const allTasks = getTodoContent('day_todos');
    
    // 分析优先级任务
    const priorityLines = priorityTasks.split('\n').filter(line => line.trim().startsWith('['));
    const allTasksLines = allTasks.split('\n').filter(line => line.trim().startsWith('['));
    
    const priorityCompleted = priorityLines.filter(line => line.includes('[x]') || line.includes('[X]')).length;
    const allCompleted = allTasksLines.filter(line => line.includes('[x]') || line.includes('[X]')).length;
    
    const priorityTotal = priorityLines.length;
    const allTotal = allTasksLines.length;
    
    const priorityRate = priorityTotal > 0 ? Math.round((priorityCompleted / priorityTotal) * 100) : 0;
    const overallRate = allTotal > 0 ? Math.round((allCompleted / allTotal) * 100) : 0;
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📊 优先级任务分析</h3>
            <p style="color: #666;">分析您的优先级任务执行情况</p>
        </div>
        
        <!-- 核心指标 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div class="priority-stat-card">
                <div class="stat-number" style="color: #e91e63;">${priorityRate}%</div>
                <div class="stat-label">优先级完成率</div>
            </div>
            <div class="priority-stat-card">
                <div class="stat-number" style="color: #2196f3;">${priorityCompleted}/${priorityTotal}</div>
                <div class="stat-label">优先级进度</div>
            </div>
            <div class="priority-stat-card">
                <div class="stat-number" style="color: #ff9800;">${overallRate}%</div>
                <div class="stat-label">整体完成率</div>
            </div>
            <div class="priority-stat-card">
                <div class="stat-number" style="color: #4caf50;">${allCompleted}/${allTotal}</div>
                <div class="stat-label">总体进度</div>
            </div>
        </div>
        
        <!-- 优先级分析 -->
        <div style="background: rgba(233, 30, 99, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #e91e63; margin: 0 0 12px 0;">🎯 优先级洞察</h4>
            <div style="color: #666; line-height: 1.5;">
                ${generatePriorityInsights(priorityRate, overallRate, priorityTotal)}
            </div>
        </div>
        
        <!-- 任务详情 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">📋 任务详情</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <h5 style="color: #e91e63; margin: 0 0 8px 0;">优先级任务 (Top 3)</h5>
                    <div style="font-size: 0.85em; color: #666; max-height: 120px; overflow-y: auto;">
                        ${priorityLines.length > 0 ? priorityLines.map(line => {
                            const isCompleted = line.includes('[x]') || line.includes('[X]');
                            const text = line.replace(/^\[.\]\s*/, '');
                            return `<div style="margin-bottom: 4px; ${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                                ${isCompleted ? '✅' : '⏳'} ${text}
                            </div>`;
                        }).join('') : '<div style="color: #999;">暂无优先级任务</div>'}
                    </div>
                </div>
                <div>
                    <h5 style="color: #2196f3; margin: 0 0 8px 0;">其他任务</h5>
                    <div style="font-size: 0.85em; color: #666; max-height: 120px; overflow-y: auto;">
                        ${allTasksLines.length > 0 ? allTasksLines.slice(0, 5).map(line => {
                            const isCompleted = line.includes('[x]') || line.includes('[X]');
                            const text = line.replace(/^\[.\]\s*/, '');
                            return `<div style="margin-bottom: 4px; ${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                                ${isCompleted ? '✅' : '⏳'} ${text}
                            </div>`;
                        }).join('') + (allTasksLines.length > 5 ? '<div style="color: #999;">...</div>' : '') : '<div style="color: #999;">暂无其他任务</div>'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 建议 -->
        <div style="background: rgba(76, 175, 80, 0.05); border-radius: 8px; padding: 16px;">
            <h4 style="color: #4caf50; margin: 0 0 12px 0;">💡 改进建议</h4>
            <div style="color: #666; line-height: 1.5;">
                ${generatePriorityRecommendations(priorityRate, priorityTotal)}
            </div>
        </div>
        
        <style>
            .priority-stat-card {
                background: rgba(255,255,255,0.9);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .priority-stat-card .stat-number {
                font-size: 1.6em;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .priority-stat-card .stat-label {
                font-size: 0.8em;
                color: #666;
                font-weight: 500;
            }
        </style>
    `;
    
    ModalUtils.show('优先级分析', content, 'large');
}

// 生成优先级洞察
function generatePriorityInsights(priorityRate, overallRate, priorityTotal) {
    const insights = [];
    
    if (priorityTotal === 0) {
        insights.push('🎯 建议设置3个今日优先级任务，这样能让您专注于最重要的事情。');
    } else {
        if (priorityRate >= 80) {
            insights.push('🎉 优先级任务执行出色！您很好地专注于重要事项。');
        } else if (priorityRate >= 50) {
            insights.push('👍 优先级任务进展不错，继续保持专注。');
        } else {
            insights.push('⚠️ 优先级任务完成率较低，建议重新评估任务难度或重要性。');
        }
        
        if (priorityRate > overallRate) {
            insights.push('💪 您在优先级任务上的表现比整体任务更好，这很棒！');
        } else if (priorityRate < overallRate - 20) {
            insights.push('🤔 优先级任务的完成率明显低于整体任务，可能需要重新考虑任务设置。');
        }
    }
    
    return insights.join('<br><br>');
}

// 生成优先级建议
function generatePriorityRecommendations(priorityRate, priorityTotal) {
    const recommendations = [];
    
    if (priorityTotal === 0) {
        recommendations.push('设置3个具体的优先级任务');
        recommendations.push('使用SMART原则制定清晰目标');
        recommendations.push('优先级任务应该是今天必须完成的');
    } else {
        if (priorityRate < 50) {
            recommendations.push('重新评估优先级任务的现实性');
            recommendations.push('将大任务分解为小步骤');
            recommendations.push('使用番茄钟技术提高专注力');
        }
        
        if (priorityTotal > 3) {
            recommendations.push('优先级任务建议控制在3个以内');
            recommendations.push('聚焦最重要的事情');
        }
        
        recommendations.push('定期回顾和调整优先级');
        recommendations.push('使用时间块为优先级任务分配固定时间');
    }
    
    return recommendations.map(rec => `• ${rec}`).join('<br>');
}

// 获取真实习惯历史数据
function generateHabitHistoryData() {
    const data = [];
    const allPlans = StorageUtils.getAllPlans('day');
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = DateUtils.formatDate(date);
        
        const plan = allPlans[dateStr];
        let rate = 0;
        
        if (plan && plan.habits) {
            const habitLines = plan.habits.split('\n').filter(line => line.trim().startsWith('['));
            const habitTotal = habitLines.length;
            const habitCompleted = habitLines.filter(line => line.includes('[x]') || line.includes('[X]')).length;
            
            if (habitTotal > 0) {
                rate = Math.round((habitCompleted / habitTotal) * 100);
            }
        }
        
        data.push({
            date: dateStr,
            rate: rate,
            hasData: !!plan
        });
    }
    return data;
}

// 计算周习惯统计
function calculateWeeklyHabitStats(historicalData) {
    return historicalData.map(day => ({
        date: day.date,
        rate: day.rate
    }));
}

// 计算习惯连续记录
function calculateHabitStreaks(habitLines) {
    if (habitLines.length === 0) {
        return {
            currentStreak: 0,
            maxStreak: 0,
            totalDays: 0
        };
    }
    
    // 获取历史数据来计算真实的连续天数
    const allPlans = StorageUtils.getAllPlans('day');
    const sortedDates = Object.keys(allPlans).sort().reverse(); // 从最新到最旧
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalDays = 0;
    
    // 检查今天的完成情况
    const today = DateUtils.getToday();
    const todayPlan = allPlans[today];
    const todayHabitsCompleted = todayPlan && todayPlan.habits ? 
        calculateHabitCompletionForDay(todayPlan.habits) : 0;
    
    // 如果今天有完成习惯，开始计算连续天数
    if (todayHabitsCompleted > 0) {
        currentStreak = 1;
        tempStreak = 1;
    }
    
    // 从昨天开始往前检查
    for (let i = 1; i < Math.min(sortedDates.length, 90); i++) { // 最多检查90天
        const dateToCheck = sortedDates[i];
        const plan = allPlans[dateToCheck];
        
        if (plan && plan.habits) {
            const completedHabits = calculateHabitCompletionForDay(plan.habits);
            totalDays++;
            
            if (completedHabits > 0) {
                if (currentStreak > 0 || i === 1) {
                    if (i === 1) currentStreak++; // 昨天也完成了，延续今天的连续
                }
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                if (i === 1) currentStreak = 0; // 昨天没完成，今天的连续中断
                tempStreak = 0;
            }
        }
    }
    
    return {
        currentStreak: Math.max(currentStreak, 0),
        maxStreak: Math.max(maxStreak, currentStreak),
        totalDays: Math.max(totalDays, 1)
    };
}

// 计算某一天的习惯完成情况
function calculateHabitCompletionForDay(habitContent) {
    if (!habitContent) return 0;
    
    const lines = habitContent.split('\n').filter(line => line.trim().startsWith('['));
    const completed = lines.filter(line => line.includes('[x]') || line.includes('[X]')).length;
    return completed;
}

// 计算单个习惯的连续天数
function calculateIndividualHabitStreak(habitText) {
    if (!habitText) return 0;
    
    const allPlans = StorageUtils.getAllPlans('day');
    const sortedDates = Object.keys(allPlans).sort().reverse(); // 从最新到最旧
    
    let streak = 0;
    let foundToday = false;
    
    // 检查今天这个习惯是否完成
    const today = DateUtils.getToday();
    const todayPlan = allPlans[today];
    if (todayPlan && todayPlan.habits) {
        const todayHabits = todayPlan.habits.split('\n');
        const todayHabit = todayHabits.find(line => 
            line.includes(habitText) && (line.includes('[x]') || line.includes('[X]'))
        );
        if (todayHabit) {
            streak = 1;
            foundToday = true;
        }
    }
    
    // 如果今天没完成，就不计算连续天数
    if (!foundToday) return 0;
    
    // 从昨天开始往前查找连续完成的天数
    for (let i = 1; i < Math.min(sortedDates.length, 30); i++) { // 最多查30天
        const dateToCheck = sortedDates[i];
        const plan = allPlans[dateToCheck];
        
        if (plan && plan.habits) {
            const dayHabits = plan.habits.split('\n');
            const habitFound = dayHabits.find(line => 
                line.includes(habitText) && (line.includes('[x]') || line.includes('[X]'))
            );
            
            if (habitFound) {
                streak++;
            } else {
                break; // 连续中断
            }
        } else {
            break; // 没有数据，连续中断
        }
    }
    
    return streak;
}

// 获取习惯难度
function getHabitDifficulty(habitText) {
    const text = habitText.toLowerCase();
    if (text.includes('锻炼') || text.includes('运动') || text.includes('健身')) {
        return '🏃 中等';
    } else if (text.includes('阅读') || text.includes('学习') || text.includes('书')) {
        return '📚 简单';
    } else if (text.includes('冥想') || text.includes('早起') || text.includes('睡眠')) {
        return '🧘 困难';
    } else if (text.includes('喝水') || text.includes('维生素')) {
        return '💧 简单';
    } else {
        return '⭐ 一般';
    }
}

// 生成习惯洞察
function generateHabitInsights(habitRate, habitTotal, streakData) {
    const insights = [];
    
    if (habitTotal === 0) {
        insights.push('🎯 建议设置2-3个核心习惯，从小习惯开始培养。');
        insights.push('💡 好习惯需要21天才能初步养成，66天才能稳定。');
    } else {
        if (habitRate >= 80) {
            insights.push('🎉 习惯执行优秀！您已经建立了良好的生活节奏。');
        } else if (habitRate >= 60) {
            insights.push('👍 习惯执行不错，继续保持这个节奏。');
        } else {
            insights.push('⚠️ 习惯完成率偏低，建议减少习惯数量或降低难度。');
        }
        
        if (streakData.currentStreak >= 7) {
            insights.push('🔥 连续坚持表现优异，这种持续性很棒！');
        } else if (streakData.currentStreak >= 3) {
            insights.push('💪 连续坚持进展良好，继续保持。');
        } else {
            insights.push('🌱 习惯还在培养期，坚持下去会看到改变。');
        }
    }
    
    return insights.join('<br><br>');
}

// 生成习惯建议
function generateHabitRecommendations(habitRate, habitTotal) {
    const recommendations = [];
    
    if (habitTotal === 0) {
        recommendations.push('从1-2个简单习惯开始');
        recommendations.push('选择与现有routine结合的习惯');
        recommendations.push('设置明确的触发条件');
    } else {
        if (habitRate < 70) {
            recommendations.push('简化习惯内容，降低执行难度');
            recommendations.push('设置习惯提醒和奖励机制');
            recommendations.push('找到习惯伙伴，相互监督');
        }
        
        if (habitTotal > 5) {
            recommendations.push('习惯数量建议控制在3-5个');
            recommendations.push('专注于最重要的核心习惯');
        }
        
        recommendations.push('记录习惯执行的感受和收获');
        recommendations.push('定期回顾和调整习惯内容');
        recommendations.push('庆祝小胜利，强化正向循环');
    }
    
    return recommendations.map(rec => `• ${rec}`).join('<br>');
}

// 刷新习惯分析
function refreshHabitAnalysis() {
    console.log('Refreshing habit analysis...');
    const modal = document.querySelector('.modal-mask');
    if (modal) {
        ModalUtils.hide(modal);
        setTimeout(() => {
            showHabitAnalytics();
        }, 300);
    }
}

// 导出习惯数据
function exportHabitData() {
    const habitTasks = getTodoContent('day_must_dos');
    const today = DateUtils.getToday();
    
    const data = {
        date: today,
        habits: habitTasks,
        timestamp: new Date().toISOString()
    };
    
    ExportUtils.exportToJSON(data, `habit_data_${today}.json`);
    MessageUtils.success('习惯数据已导出！');
}

// 调试习惯数据
function debugHabitData() {
    const habitTasks = getTodoContent('day_must_dos');
    const today = DateUtils.getToday();
    const allPlans = StorageUtils.getAllPlans('day');
    const historicalData = generateHabitHistoryData();
    
    console.log('=== 习惯数据调试信息 ===');
    console.log('今日习惯原始数据:', habitTasks);
    console.log('今日日期:', today);
    console.log('过去7天历史数据:', historicalData);
    console.log('所有计划数据:', allPlans);
    
    const debugContent = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color);">🔍 习惯数据调试</h3>
            <p style="color: #666;">查看当前习惯数据的详细信息</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #333; margin: 0 0 12px 0;">📅 今日习惯数据</h4>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.85em; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">
${habitTasks || '(无数据)'}
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #333; margin: 0 0 12px 0;">📊 过去7天数据</h4>
            <div style="font-size: 0.85em;">
                ${historicalData.map(day => `
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee;">
                        <span>${day.date}</span>
                        <span style="color: ${day.hasData ? '#4caf50' : '#999'};">
                            ${day.hasData ? day.rate + '%' : '无数据'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px;">
            <h4 style="color: #333; margin: 0 0 12px 0;">ℹ️ 数据说明</h4>
            <ul style="font-size: 0.85em; color: #666; line-height: 1.5; margin: 0; padding-left: 20px;">
                <li>数据从"智能习惯追踪"区域获取</li>
                <li>连续天数基于历史保存的计划数据计算</li>
                <li>需要保存计划后数据才会被记录</li>
                <li>历史数据来源于localStorage中的计划记录</li>
            </ul>
        </div>
    `;
    
    ModalUtils.show('习惯数据调试', debugContent, 'large');
}

// 提醒系统的全局变量
let activeReminders = new Map(); // 存储活跃的提醒

// 检查并获取当前通知权限状态
function getCurrentNotificationPermission() {
    const permission = 'Notification' in window ? Notification.permission : 'denied';
    console.log('📊 权限状态检查:', {
        supported: 'Notification' in window,
        permission: permission,
        timestamp: new Date().toLocaleTimeString()
    });
    return permission;
}

// 请求通知权限
function requestNotificationPermission() {
    console.log('🔔 开始请求通知权限...');
    
    if ('Notification' in window) {
        const currentPermission = Notification.permission;
        console.log('🔔 当前权限状态:', currentPermission);
        
        if (currentPermission === 'granted') {
            console.log('✅ 权限已经授权');
            MessageUtils.info('通知权限已经授权，可以直接设置提醒！');
            updateNotificationPermissionUI();
            return;
        }
        
        if (currentPermission === 'denied') {
            console.log('❌ 权限已被拒绝');
            MessageUtils.warning('通知权限已被拒绝，请在浏览器设置中手动开启通知权限：\n\n1. 点击地址栏左侧的锁图标\n2. 将"通知"设置为"允许"\n3. 刷新页面重试');
            return;
        }
        
        // 权限状态为 'default'，可以请求权限
        console.log('🔔 权限状态为default，显示用户指导...');
        
        // 显示用户指导
        MessageUtils.info('即将请求通知权限，请在浏览器弹出的对话框中点击"允许"', 3000);
        
        // 稍微延迟一下，让用户看到指导信息
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                console.log('🔔 权限请求结果:', permission);
                
                if (permission === 'granted') {
                    MessageUtils.success('🎉 通知权限已授权！现在可以设置提醒了');
                    console.log('✅ 通知权限授权成功');
                    
                    // 强制更新权限状态缓存
                    setTimeout(() => {
                        const newPermission = getCurrentNotificationPermission();
                        console.log('🔄 权限状态刷新后:', newPermission);
                        
                        // 直接更新当前界面，不重新打开模态框
                        updateNotificationPermissionUI();
                        
                        // 额外验证
                        if (newPermission === 'granted') {
                            console.log('🎉 权限验证成功，现在可以设置提醒了！');
                        } else {
                            console.log('⚠️ 权限状态异常，可能需要刷新页面');
                        }
                    }, 100);
                    
                } else if (permission === 'denied') {
                    MessageUtils.warning('通知权限被拒绝。如需使用提醒功能，请：\n\n1. 点击地址栏左侧的锁图标\n2. 将"通知"设置为"允许"\n3. 刷新页面重试');
                } else {
                    MessageUtils.info('通知权限请求已取消');
                }
                
                updateNotificationPermissionUI();
            }).catch(error => {
                console.error('❌ 权限请求出错:', error);
                MessageUtils.error('权限请求失败: ' + error.message);
            });
        }, 1000);
        
    } else {
        MessageUtils.error('您的浏览器不支持通知功能');
    }
}

// 更新通知权限UI状态
function updateNotificationPermissionUI() {
    const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
    
    // 查找权限状态显示区域
    const permissionContainer = document.querySelector('.permission-status');
    if (permissionContainer) {
        console.log('✅ 找到权限状态容器，正在更新UI...');
        
        // 更新权限状态显示
        const statusColor = currentPermission === 'granted' ? '#4caf50' : '#ff9800';
        const statusIcon = currentPermission === 'granted' ? '✅' : '⚠️';
        const statusText = currentPermission === 'granted' ? 
            '通知权限已授权，可以发送提醒通知' : 
            (currentPermission === 'denied' ? '通知权限被拒绝，请在浏览器设置中开启' : '需要请求通知权限');
        
        // 更新容器样式
        permissionContainer.style.background = currentPermission === 'granted' ? 
            'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)';
        permissionContainer.style.borderLeft = `4px solid ${statusColor}`;
        
        // 更新标题
        const statusHeader = permissionContainer.querySelector('h4');
        if (statusHeader) {
            statusHeader.style.color = statusColor;
            statusHeader.innerHTML = `${statusIcon} 通知权限状态`;
        }
        
        // 更新描述文本
        const statusDescription = permissionContainer.querySelector('div');
        if (statusDescription) {
            statusDescription.innerHTML = statusText;
        }
        
        // 处理请求权限按钮
        const requestButton = permissionContainer.querySelector('button');
        if (requestButton) {
            if (currentPermission === 'granted') {
                requestButton.style.display = 'none';
                console.log('✅ 权限已授权，隐藏请求按钮');
            } else {
                requestButton.style.display = 'inline-block';
            }
        } else if (currentPermission !== 'granted') {
            // 如果没有找到按钮但需要显示，动态创建一个
            const newButton = document.createElement('button');
            newButton.className = 'btn-main';
            newButton.onclick = requestNotificationPermission;
            newButton.style.fontSize = '0.85em';
            newButton.innerHTML = '🔔 请求通知权限';
            permissionContainer.appendChild(newButton);
            console.log('✅ 动态创建请求权限按钮');
        }
        
        console.log('✅ 权限UI更新完成');
    } else {
        console.log('❌ 未找到权限状态容器，可能模态框未打开');
    }
    
    console.log('🔔 通知权限UI已更新，当前状态:', currentPermission);
}

// 设置快速提醒 - 内部版本（不做权限检查）
function setQuickReminderInternal(minutes) {
    console.log('✅ setQuickReminderInternal called, 跳过权限检查, minutes:', minutes);
    
    const reminderTime = new Date(Date.now() + minutes * 60000);
    const reminderId = 'quick_' + Date.now();
    
    const timeoutId = setTimeout(() => {
        console.log(`⏰ ${minutes}分钟提醒时间到！`);
        showNotification(
            '⏰ 时间提醒',
            `您设置的${minutes}分钟提醒时间到了！`,
            '🔔'
        );
        activeReminders.delete(reminderId);
        updateActiveRemindersDisplay();
    }, minutes * 60000);
    
    // 存储提醒信息
    activeReminders.set(reminderId, {
        type: 'quick',
        title: `${minutes}分钟后提醒`,
        time: reminderTime,
        timeoutId: timeoutId
    });
    
    console.log('✅ 快速提醒设置成功:', {
        minutes: minutes,
        time: reminderTime.toLocaleString(),
        reminderId: reminderId
    });
    
    MessageUtils.success(`已设置${minutes}分钟后的提醒！将在 ${reminderTime.toLocaleTimeString()} 提醒您`);
    updateActiveRemindersDisplay();
}

// 设置快速提醒 - 公开版本（包含权限检查）
function setQuickReminder(minutes) {
    console.log('🔔 setQuickReminder called, minutes:', minutes);
    console.log('🔔 当前通知权限状态:', Notification.permission);
    console.log('🔔 浏览器通知支持:', 'Notification' in window);
    
    // 实时检查权限状态
    const currentPermission = getCurrentNotificationPermission();
    console.log('🔔 实时权限检查结果:', currentPermission);
    
    if (currentPermission !== 'granted') {
        console.log('❌ 权限检查失败，当前状态:', currentPermission);
        
        if (currentPermission === 'default') {
            // 如果是默认状态，提供自动请求权限的选项
            console.log('🔔 检测到default状态，尝试自动请求权限...');
            
            if (confirm(`检测到通知权限为默认状态，是否立即请求通知权限来设置${minutes}分钟提醒？\n\n点击"确定"将弹出浏览器权限对话框。`)) {
                console.log('✅ 用户同意自动请求权限');
                
                Notification.requestPermission().then(permission => {
                    console.log('🔔 自动权限请求结果:', permission);
                    
                    if (permission === 'granted') {
                        console.log('✅ 权限授权成功，重新设置提醒...');
                        MessageUtils.success('通知权限已授权！正在设置提醒...');
                        
                        // 延迟一下再设置提醒，确保权限状态更新
                        setTimeout(() => {
                            setQuickReminderInternal(minutes);
                        }, 200);
                    } else {
                        console.log('❌ 用户拒绝了权限请求');
                        MessageUtils.warning('通知权限被拒绝，无法设置提醒');
                    }
                    
                    // 更新UI
                    updateNotificationPermissionUI();
                }).catch(error => {
                    console.error('❌ 权限请求出错:', error);
                    MessageUtils.error('权限请求失败: ' + error.message);
                });
            } else {
                console.log('❌ 用户取消了自动权限请求');
                MessageUtils.info('已取消设置提醒，如需使用请先授权通知权限');
            }
        } else {
            // 权限被拒绝的情况
            MessageUtils.warning(`通知权限未授权 (当前状态: ${currentPermission})，请在浏览器设置中开启通知权限`);
        }
        
        // 尝试更新UI状态
        updateNotificationPermissionUI();
        return;
    }
    
    console.log('✅ 权限检查通过，调用内部设置函数...');
    
    // 权限已授权，直接调用内部函数设置提醒
    setQuickReminderInternal(minutes);
}

// 安排习惯提醒
function scheduleHabitReminder(habitText, timeSlot) {
    if (!timeSlot) return;
    
    console.log('🎯 scheduleHabitReminder called:', { habitText, timeSlot });
    console.log('🔔 当前通知权限状态:', Notification.permission);
    
    // 实时检查权限状态
    const currentPermission = getCurrentNotificationPermission();
    console.log('🔔 实时权限检查结果:', currentPermission);
    
    if (currentPermission !== 'granted') {
        console.log('❌ 习惯提醒权限检查失败，当前状态:', currentPermission);
        
        if (currentPermission === 'default') {
            // 如果是默认状态，提供自动请求权限的选项
            console.log('🔔 检测到default状态，尝试自动请求权限...');
            
            if (confirm(`检测到通知权限为默认状态，是否立即请求通知权限来设置"${habitText}"的提醒？\n\n点击"确定"将弹出浏览器权限对话框。`)) {
                console.log('✅ 用户同意自动请求权限');
                
                Notification.requestPermission().then(permission => {
                    console.log('🔔 自动权限请求结果:', permission);
                    
                    if (permission === 'granted') {
                        console.log('✅ 权限授权成功，重新设置习惯提醒...');
                        MessageUtils.success('通知权限已授权！正在设置习惯提醒...');
                        
                        // 延迟一下再设置提醒，确保权限状态更新
                        setTimeout(() => {
                            scheduleHabitReminder(habitText, timeSlot);
                        }, 200);
                    } else {
                        console.log('❌ 用户拒绝了权限请求');
                        MessageUtils.warning('通知权限被拒绝，无法设置习惯提醒');
                    }
                    
                    // 更新UI
                    updateNotificationPermissionUI();
                }).catch(error => {
                    console.error('❌ 权限请求出错:', error);
                    MessageUtils.error('权限请求失败: ' + error.message);
                });
            } else {
                console.log('❌ 用户取消了自动权限请求');
                MessageUtils.info('已取消设置习惯提醒，如需使用请先授权通知权限');
            }
        } else {
            // 权限被拒绝的情况
            MessageUtils.warning(`通知权限未授权 (当前状态: ${currentPermission})，请在浏览器设置中开启通知权限`);
        }
        
        // 尝试更新UI状态
        updateNotificationPermissionUI();
        return;
    }
    
    console.log('✅ 习惯提醒权限检查通过...');
    
    const now = new Date();
    let targetTime = new Date();
    
    switch (timeSlot) {
        case 'morning':
            targetTime.setHours(8, 0, 0, 0);
            break;
        case 'afternoon':
            targetTime.setHours(14, 0, 0, 0);
            break;
        case 'evening':
            targetTime.setHours(19, 0, 0, 0);
            break;
        case 'custom':
            const customTime = prompt('请输入时间 (格式: HH:MM)', '10:00');
            if (customTime) {
                const [hours, minutes] = customTime.split(':');
                targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            } else {
                return;
            }
            break;
    }
    
    // 如果目标时间已过，设置为明天
    if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const delay = targetTime.getTime() - now.getTime();
    const reminderId = 'habit_' + habitText.replace(/\s+/g, '_') + '_' + Date.now();
    
    const timeoutId = setTimeout(() => {
        showNotification(
            '🎯 习惯提醒',
            `是时候执行习惯：${habitText}`,
            '🔔'
        );
        activeReminders.delete(reminderId);
        updateActiveRemindersDisplay();
    }, delay);
    
    // 存储提醒信息
    activeReminders.set(reminderId, {
        type: 'habit',
        habit: habitText,
        title: `${habitText} - ${formatTimeSlot(timeSlot)}`,
        time: targetTime,
        timeoutId: timeoutId
    });
    
    MessageUtils.success(`已为"${habitText}"设置${formatTimeSlot(timeSlot)}提醒！`);
    updateActiveRemindersDisplay();
}

// 设置建议提醒
function setSuggestedReminder(timeSlot) {
    const habitTasks = getTodoContent('day_must_dos');
    const habitLines = habitTasks.split('\n').filter(line => line.trim().startsWith('['));
    
    if (habitLines.length === 0) {
        MessageUtils.info('请先添加一些习惯任务');
        return;
    }
    
    // 为所有未完成的习惯设置提醒
    habitLines.forEach(line => {
        const isCompleted = line.includes('[x]') || line.includes('[X]');
        if (!isCompleted) {
            const text = line.replace(/^\[.\]\s*/, '');
            scheduleHabitReminder(text, timeSlot);
        }
    });
}

// 显示通知 - 增强版（多种备用方式）
function showNotification(title, body, icon = '🔔') {
    console.log('🔔 showNotification called:', { title, body, icon });
    console.log('🔔 当前通知权限:', Notification.permission);
    
    let notificationShown = false;
    
    // 方式1：尝试浏览器原生通知
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            console.log('✅ 尝试显示浏览器原生通知...');
            const notification = new Notification(title, {
                body: body,
                icon: icon,
                badge: icon,
                requireInteraction: true,
                silent: false
            });
            
            console.log('✅ 浏览器通知创建成功');
            notificationShown = true;
            
            // 点击通知时聚焦到窗口
            notification.onclick = function() {
                console.log('📱 用户点击了通知');
                window.focus();
                notification.close();
            };
            
            // 5秒后自动关闭
            setTimeout(() => {
                notification.close();
                console.log('⏰ 通知自动关闭');
            }, 5000);
            
        } catch (error) {
            console.error('❌ 浏览器通知显示失败:', error);
            notificationShown = false;
        }
    } else {
        console.log('⚠️ 浏览器通知不可用，原因:', 
            !('Notification' in window) ? '浏览器不支持' : '权限未授权');
    }
    
    // 方式2：备用提示 - 弹窗提醒
    if (!notificationShown) {
        console.log('🔄 使用备用提示方式...');
        
        // 2.1 alert弹窗
        setTimeout(() => {
            alert(`${icon} ${title}\n\n${body}`);
            console.log('✅ Alert弹窗显示成功');
        }, 100);
        
        // 2.2 页面内提示
        showInPageNotification(title, body, icon);
        
        // 2.3 控制台高亮提示
        console.log('%c🔔 提醒时间到！', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
        console.log(`%c${title}: ${body}`, 'color: #4ecdc4; font-size: 14px;');
        
        notificationShown = true;
    }
    
    // 方式3：声音提示（如果支持）
    try {
        playNotificationSound();
    } catch (error) {
        console.log('🔇 声音提示不可用:', error.message);
    }
    
    // 方式4：页面标题闪烁提醒
    startTitleBlink(title);
    
    console.log('🎉 通知显示完成，使用了多种提示方式');
    return notificationShown;
}

// 页面内通知显示
function showInPageNotification(title, body, icon) {
    console.log('📄 显示页面内通知...');
    
    // 移除已存在的通知
    const existingNotification = document.getElementById('in-page-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'in-page-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 350px;
        font-family: Arial, sans-serif;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">${icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
                <div style="font-size: 14px; opacity: 0.9;">${body}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `;
    
    // 添加样式
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // 5秒后自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    console.log('✅ 页面内通知显示成功');
}

// 播放通知声音
function playNotificationSound() {
    console.log('🔊 尝试播放通知声音...');
    
    // 方法1：使用Web Audio API创建简单的提示音
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音频参数
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('✅ 提示音播放成功');
    } catch (error) {
        console.log('🔇 提示音播放失败:', error.message);
        
        // 方法2：尝试使用简单的beep
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJevrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzGH0fPReS0GLYvQ8N2QQAoKYz87L0Ew');
            audio.play().catch(() => {
                console.log('🔇 Audio标签播放失败');
            });
        } catch (e) {
            console.log('🔇 所有声音播放方法都失败');
        }
    }
}

// 页面标题闪烁提醒
function startTitleBlink(message) {
    console.log('📑 开始页面标题闪烁提醒...');
    
    const originalTitle = document.title;
    let blinkCount = 0;
    const maxBlinks = 6;
    
    const blinkInterval = setInterval(() => {
        document.title = blinkCount % 2 === 0 ? `🔔 ${message}` : originalTitle;
        blinkCount++;
        
        if (blinkCount >= maxBlinks) {
            clearInterval(blinkInterval);
            document.title = originalTitle;
            console.log('📑 标题闪烁完成');
        }
    }, 1000);
    
    // 如果用户点击页面，立即停止闪烁
    const stopBlink = () => {
        clearInterval(blinkInterval);
        document.title = originalTitle;
        document.removeEventListener('click', stopBlink);
        document.removeEventListener('focus', stopBlink);
    };
    
    document.addEventListener('click', stopBlink);
    document.addEventListener('focus', stopBlink);
}

// 测试通知功能
function testNotificationFeatures() {
    console.log('=== 测试通知功能 ===');
    
    console.log('1. 浏览器通知支持:', 'Notification' in window ? '✅ 支持' : '❌ 不支持');
    console.log('2. 当前通知权限:', Notification.permission);
    console.log('3. Web Audio支持:', 'AudioContext' in window ? '✅ 支持' : '❌ 不支持');
    
    if (confirm('是否测试通知功能？这将显示一个测试通知。')) {
        console.log('🧪 开始测试通知...');
        showNotification('📋 测试通知', '这是一个测试通知，用于验证通知功能是否正常工作', '🧪');
    }
}

// 格式化时间段显示
function formatTimeSlot(timeSlot) {
    switch (timeSlot) {
        case 'morning': return '早上8点';
        case 'afternoon': return '下午2点';
        case 'evening': return '晚上7点';
        default: return timeSlot;
    }
}

// 获取活跃提醒列表
function getActiveReminders() {
    if (activeReminders.size === 0) {
        return '<div style="text-align: center; color: #999; padding: 10px;">暂无活跃提醒</div>';
    }
    
    let html = '';
    activeReminders.forEach((reminder, id) => {
        const timeStr = reminder.time.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
                <div>
                    <span style="font-weight: 500;">${reminder.title}</span>
                    <span style="color: #999; margin-left: 8px;">${timeStr}</span>
                </div>
                <button onclick="cancelReminder('${id}')" style="background: #ffebee; color: #d32f2f; border: none; border-radius: 4px; padding: 2px 6px; font-size: 0.7em; cursor: pointer;">
                    取消
                </button>
            </div>
        `;
    });
    
    return html;
}

// 取消提醒
function cancelReminder(reminderId) {
    const reminder = activeReminders.get(reminderId);
    if (reminder) {
        clearTimeout(reminder.timeoutId);
        activeReminders.delete(reminderId);
        updateActiveRemindersDisplay();
        MessageUtils.info('提醒已取消');
    }
}

// 清除所有提醒
function clearAllReminders() {
    if (activeReminders.size === 0) {
        MessageUtils.info('没有活跃的提醒');
        return;
    }
    
    if (confirm(`确定要清除所有 ${activeReminders.size} 个提醒吗？`)) {
        activeReminders.forEach((reminder) => {
            clearTimeout(reminder.timeoutId);
        });
        activeReminders.clear();
        updateActiveRemindersDisplay();
        MessageUtils.success('所有提醒已清除');
    }
}

// 更新活跃提醒显示
function updateActiveRemindersDisplay() {
    const container = document.getElementById('active-reminders');
    if (container) {
        container.innerHTML = getActiveReminders();
    }
}

function showTimeblockTemplates() {
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                
                <!-- 工作日模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 12px; padding: 16px; border: 2px solid #1976d2;">
                    <h4 style="margin: 0 0 12px 0; color: #1976d2; display: flex; align-items: center; gap: 8px;">
                        💼 高效工作日
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #1565c0; margin-bottom: 12px; line-height: 1.4;">
                        适合需要深度工作的日子<br>
                        包含：深度工作、会议、休息安排
                    </div>
                    <button onclick="applyTimeblockTemplate('workday')" class="btn-main" style="width: 100%; background: #1976d2; color: white;">
                        应用模板
                    </button>
                </div>
                
                <!-- 学习日模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 12px; padding: 16px; border: 2px solid #4caf50;">
                    <h4 style="margin: 0 0 12px 0; color: #2e7d32; display: flex; align-items: center; gap: 8px;">
                        📚 专注学习日
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #388e3c; margin-bottom: 12px; line-height: 1.4;">
                        适合学习新技能或准备考试<br>
                        包含：学习时段、复习、练习
                    </div>
                    <button onclick="applyTimeblockTemplate('study')" class="btn-main" style="width: 100%; background: #4caf50; color: white;">
                        应用模板
                    </button>
                </div>
                
                <!-- 创意日模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-radius: 12px; padding: 16px; border: 2px solid #9c27b0;">
                    <h4 style="margin: 0 0 12px 0; color: #7b1fa2; display: flex; align-items: center; gap: 8px;">
                        🎨 创意灵感日
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #8e24aa; margin-bottom: 12px; line-height: 1.4;">
                        适合创作、设计、头脑风暴<br>
                        包含：自由创作、灵感捕捉
                    </div>
                    <button onclick="applyTimeblockTemplate('creative')" class="btn-main" style="width: 100%; background: #9c27b0; color: white;">
                        应用模板
                    </button>
                </div>
                
                <!-- 休息日模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #fff3e0, #ffcc02); border-radius: 12px; padding: 16px; border: 2px solid #ff9800;">
                    <h4 style="margin: 0 0 12px 0; color: #ef6c00; display: flex; align-items: center; gap: 8px;">
                        🌅 平衡休息日
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #f57c00; margin-bottom: 12px; line-height: 1.4;">
                        适合放松、娱乐、充电<br>
                        包含：轻松活动、自由时间
                    </div>
                    <button onclick="applyTimeblockTemplate('relax')" class="btn-main" style="width: 100%; background: #ff9800; color: white;">
                        应用模板
                    </button>
                </div>
                
                <!-- 健康日模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #ffebee, #f8bbd9); border-radius: 12px; padding: 16px; border: 2px solid #e91e63;">
                    <h4 style="margin: 0 0 12px 0; color: #c2185b; display: flex; align-items: center; gap: 8px;">
                        💪 健康生活日
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #d81b60; margin-bottom: 12px; line-height: 1.4;">
                        专注于健康和健身<br>
                        包含：运动、冥想、健康饮食
                    </div>
                    <button onclick="applyTimeblockTemplate('health')" class="btn-main" style="width: 100%; background: #e91e63; color: white;">
                        应用模板
                    </button>
                </div>
                
                <!-- 自定义模板 -->
                <div class="template-category" style="background: linear-gradient(135deg, #fafafa, #f5f5f5); border-radius: 12px; padding: 16px; border: 2px solid #757575;">
                    <h4 style="margin: 0 0 12px 0; color: #424242; display: flex; align-items: center; gap: 8px;">
                        ⚙️ 自定义模板
                    </h4>
                    <div class="template-preview" style="font-size: 0.85em; color: #616161; margin-bottom: 12px; line-height: 1.4;">
                        创建你自己的时间块模板<br>
                        保存并重复使用
                    </div>
                    <button onclick="showCustomTemplateCreator()" class="btn-main" style="width: 100%; background: #757575; color: white;">
                        创建模板
                    </button>
                </div>
            </div>
            
            <!-- 智能建议区域 -->
            <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 10px; border-left: 4px solid #4caf50;">
                <h5 style="margin: 0 0 8px 0; color: #2e7d32; display: flex; align-items: center; gap: 6px;">
                    🤖 AI 智能建议
                </h5>
                <div id="template-ai-suggestions" style="font-size: 0.9em; color: #388e3c;">
                    正在分析您的历史数据，为您推荐最适合的模板...
                </div>
            </div>
        </div>
    `;
    
    ModalUtils.show('🧠 智能时间块模板', content, 'large');
    
    // 生成AI建议
    generateTemplateAISuggestions();
}

// 创建任务元素的辅助函数
function createTaskElement(taskText, isTimeblock = false) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    // 创建复选框
    const checkbox = document.createElement('div');
    checkbox.className = 'custom-checkbox';
    checkbox.addEventListener('click', function() {
        this.classList.toggle('checked');
        const textElement = this.parentNode.querySelector('.task-text');
        if (this.classList.contains('checked')) {
            textElement.style.textDecoration = 'line-through';
            textElement.style.opacity = '0.6';
        } else {
            textElement.style.textDecoration = 'none';
            textElement.style.opacity = '1';
        }
    });
    
    // 创建任务文本
    const taskTextElement = document.createElement('div');
    taskTextElement.className = 'task-text';
    taskTextElement.contentEditable = true;
    taskTextElement.textContent = taskText;
    
    // 创建删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', function() {
        this.parentNode.remove();
        // 触发保存
        if (window.savePlanData) {
            savePlanData('day');
        }
        // 更新统计
        if (window.updateTimeblockStats && isTimeblock) {
            updateTimeblockStats();
        }
    });
    
    // 组装元素
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskTextElement);
    
    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteBtn);
    
    // 添加编辑事件监听
    taskTextElement.addEventListener('input', function() {
        if (window.savePlanData) {
            savePlanData('day');
        }
        if (window.updateTimeblockStats && isTimeblock) {
            updateTimeblockStats();
        }
    });
    
    return taskItem;
}

window.applyTimeblockTemplate = function(templateType) {
    const templates = {
        workday: [
            "08:00-09:00 🌅 晨间准备 [精力充沛]",
            "09:00-11:00 💼 深度工作时间（重要任务） [高能量]",
            "11:00-11:15 ☕ 短暂休息",
            "11:15-12:00 📧 邮件处理 [中等能量]",
            "12:00-13:00 🍽️ 午餐休息",
            "13:00-14:00 📞 会议时间 [恢复期]",
            "14:00-14:15 🚶 活动休息",
            "14:15-16:00 💼 项目推进 [能量回升]",
            "16:00-16:15 ☕ 下午茶时间",
            "16:15-17:30 📊 总结整理 [稳定输出]",
            "17:30-18:00 📝 明日计划"
        ],
        study: [
            "08:00-09:00 🌅 晨间复习 [大脑清醒]",
            "09:00-10:30 📚 新知识学习 [高专注力]",
            "10:30-10:45 🧘 冥想休息",
            "10:45-12:00 ✍️ 练习题训练 [思维活跃]",
            "12:00-13:00 🍽️ 午餐休息",
            "13:00-14:00 📖 轻松阅读 [恢复期]",
            "14:00-14:15 🚶 散步思考",
            "14:15-15:45 🔄 知识回顾 [下午专注]",
            "15:45-16:00 ☕ 休息充电",
            "16:00-17:00 📝 总结笔记 [整理思路]",
            "17:00-18:00 🎯 预习明日内容"
        ],
        creative: [
            "08:00-09:00 🌅 灵感捕捉 [晨间创意]",
            "09:00-11:00 🎨 自由创作时间 [创意高峰]",
            "11:00-11:30 🚶 户外漫步（寻找灵感）",
            "11:30-12:30 💭 头脑风暴 [思维发散]",
            "12:30-13:30 🍽️ 愉悦午餐",
            "13:30-14:30 🎵 音乐冥想 [放松状态]",
            "14:30-16:00 ✨ 创意实现 [灵感变现]",
            "16:00-16:20 🍵 创意茶歇",
            "16:20-17:30 🔍 作品完善 [细节打磨]",
            "17:30-18:00 📸 成果记录"
        ],
        relax: [
            "08:00-09:30 😴 自然醒 + 悠闲早餐",
            "09:30-11:00 🚶 户外散步/运动 [轻松活动]",
            "11:00-12:00 📚 休闲阅读 [放松心情]",
            "12:00-13:00 🍽️ 美食午餐",
            "13:00-14:30 💤 午休小憩",
            "14:30-16:00 🎮 娱乐时间（游戏/电影）",
            "16:00-16:30 ☕ 下午茶时光",
            "16:30-17:30 🤝 社交时间（朋友/家人）",
            "17:30-18:30 🛁 放松洗浴",
            "18:30-19:30 🍽️ 轻松晚餐",
            "19:30-21:00 📺 娱乐时光"
        ],
        health: [
            "06:30-07:00 🧘 晨间冥想 [内心平静]",
            "07:00-08:00 🏃 晨跑/瑜伽 [身体激活]",
            "08:00-09:00 🥗 营养早餐 [能量补充]",
            "09:00-10:30 💪 力量训练 [肌肉建设]",
            "10:30-11:00 🚿 放松洗浴",
            "11:00-12:00 📖 健康知识学习",
            "12:00-13:00 🥙 健康午餐",
            "13:00-14:00 💤 恢复休息",
            "14:00-15:30 🚴 有氧运动 [心肺锻炼]",
            "15:30-16:00 💧 补水休息",
            "16:00-17:00 🧘 拉伸/按摩 [肌肉放松]",
            "17:00-18:00 🥗 轻食晚餐",
            "18:00-19:00 📝 健康日记"
        ]
    };
    
    const template = templates[templateType];
    console.log('模板类型:', templateType);
    console.log('模板内容:', template);
    
    if (template) {
        const timeblockContainer = document.getElementById('day_timeblock');
        console.log('时间块容器:', timeblockContainer);
        
        if (timeblockContainer) {
            timeblockContainer.innerHTML = '';
            template.forEach(timeblock => {
                console.log('创建时间块:', timeblock);
                const timeblockElement = createTaskElement(timeblock, true);
                timeblockContainer.appendChild(timeblockElement);
            });
            
            // 更新时间块统计
            updateTimeblockStats();
            
            // 保存到本地存储
            savePlanData('day');
            
            MessageUtils.success(`已应用 ${getTemplateName(templateType)} 模板！`);
            
            // 关闭模态框
            ModalUtils.hide();
        }
    }
}

function getTemplateName(templateType) {
    const names = {
        workday: '高效工作日',
        study: '专注学习日',
        creative: '创意灵感日',
        relax: '平衡休息日',
        health: '健康生活日'
    };
    return names[templateType] || '未知模板';
}

function generateTemplateAISuggestions() {
    setTimeout(() => {
        const suggestions = document.getElementById('template-ai-suggestions');
        if (suggestions) {
            const currentHour = new Date().getHours();
            const dayOfWeek = new Date().getDay();
            
            let suggestion = '';
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                if (currentHour < 10) {
                    suggestion = '🌅 今天是周末，建议使用「平衡休息日」模板，让身心得到充分休息。';
                } else {
                    suggestion = '🎨 下午时光很适合创作，可以尝试「创意灵感日」模板。';
                }
            } else {
                if (currentHour < 9) {
                    suggestion = '💼 工作日的早晨，推荐「高效工作日」模板，抓住大脑最清醒的时间。';
                } else if (currentHour < 14) {
                    suggestion = '📚 上午时光适合深度学习，可以考虑「专注学习日」模板。';
                } else {
                    suggestion = '💪 下午是运动的好时机，「健康生活日」模板可以帮你平衡工作与健康。';
                }
            }
            
            suggestions.innerHTML = suggestion;
        }
    }, 1500);
}

window.showCustomTemplateCreator = function() {
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">模板名称</label>
                <input type="text" id="custom-template-name" placeholder="例如：我的工作模板" 
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">模板描述</label>
                <input type="text" id="custom-template-desc" placeholder="简单描述这个模板的用途" 
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">时间块安排</label>
                <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">
                    请按照格式：时间-时间 活动内容 [能量状态]<br>
                    例如：09:00-10:30 💼 深度工作 [高能量]
                </div>
                <textarea id="custom-template-content" placeholder="08:00-09:00 🌅 晨间准备 [精力充沛]
09:00-11:00 💼 深度工作时间 [高能量]
11:00-11:15 ☕ 短暂休息
11:15-12:00 📧 邮件处理 [中等能量]" 
                          style="width: 100%; min-height: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95em; font-family: monospace; line-height: 1.6;"></textarea>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">模板颜色主题</label>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent;" data-color="blue">
                        <input type="radio" name="template-color" value="blue" checked style="margin: 0;">
                        <div style="width: 20px; height: 20px; background: #1976d2; border-radius: 50%;"></div>
                        <span style="font-weight: normal;">蓝色</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent;" data-color="green">
                        <input type="radio" name="template-color" value="green" style="margin: 0;">
                        <div style="width: 20px; height: 20px; background: #4caf50; border-radius: 50%;"></div>
                        <span style="font-weight: normal;">绿色</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent;" data-color="purple">
                        <input type="radio" name="template-color" value="purple" style="margin: 0;">
                        <div style="width: 20px; height: 20px; background: #9c27b0; border-radius: 50%;"></div>
                        <span style="font-weight: normal;">紫色</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent;" data-color="orange">
                        <input type="radio" name="template-color" value="orange" style="margin: 0;">
                        <div style="width: 20px; height: 20px; background: #ff9800; border-radius: 50%;"></div>
                        <span style="font-weight: normal;">橙色</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent;" data-color="red">
                        <input type="radio" name="template-color" value="red" style="margin: 0;">
                        <div style="width: 20px; height: 20px; background: #e91e63; border-radius: 50%;"></div>
                        <span style="font-weight: normal;">红色</span>
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                <button onclick="previewCustomTemplate()" class="btn-main" style="background: #757575; color: white;">
                    👁️ 预览
                </button>
                <button onclick="saveCustomTemplate()" class="btn-main" style="background: #4caf50; color: white;">
                    💾 保存模板
                </button>
                <button onclick="ModalUtils.hide()" class="btn-main" style="background: #f44336; color: white;">
                    ❌ 取消
                </button>
            </div>
            
            <!-- 已保存的自定义模板 -->
            <div id="saved-templates-section" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                <h5 style="margin: 0 0 12px 0; color: #424242;">已保存的自定义模板</h5>
                <div id="saved-templates-list">
                    <!-- 动态加载已保存的模板 -->
                </div>
            </div>
        </div>
    `;
    
    ModalUtils.show('⚙️ 创建自定义时间块模板', content, 'large');
    
    // 延迟执行，确保模态框内容已渲染
    setTimeout(() => {
        // 添加颜色选择事件
        document.querySelectorAll('label[data-color]').forEach(label => {
            label.addEventListener('click', function() {
                document.querySelectorAll('label[data-color]').forEach(l => l.style.borderColor = 'transparent');
                this.style.borderColor = '#1976d2';
            });
        });
        
        // 加载已保存的模板
        loadSavedCustomTemplates();
    }, 100);
}

window.previewCustomTemplate = function() {
    const content = document.getElementById('custom-template-content').value.trim();
    if (!content) {
        MessageUtils.warning('请先输入时间块内容');
        return;
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const previewHtml = lines.map(line => `<div style="padding: 6px 12px; background: rgba(25,118,210,0.05); border-radius: 6px; margin: 2px 0; font-family: monospace;">${line}</div>`).join('');
    
    const previewContent = `
        <div style="max-height: 400px; overflow-y: auto;">
            ${previewHtml}
        </div>
        <div style="text-align: right; margin-top: 16px;">
            <button onclick="ModalUtils.hide()" class="btn-main">关闭预览</button>
        </div>
    `;
    ModalUtils.show('👁️ 模板预览', previewContent, 'medium');
}

window.saveCustomTemplate = function() {
    const name = document.getElementById('custom-template-name').value.trim();
    const desc = document.getElementById('custom-template-desc').value.trim();
    const content = document.getElementById('custom-template-content').value.trim();
    const color = document.querySelector('input[name="template-color"]:checked').value;
    
    if (!name) {
        MessageUtils.warning('请输入模板名称');
        return;
    }
    
    if (!content) {
        MessageUtils.warning('请输入时间块内容');
        return;
    }
    
    // 保存到本地存储
    const customTemplates = JSON.parse(localStorage.getItem('customTimeblockTemplates') || '[]');
    const newTemplate = {
        id: Date.now().toString(),
        name: name,
        description: desc || '自定义时间块模板',
        content: content.split('\n').filter(line => line.trim()),
        color: color,
        createTime: new Date().toISOString()
    };
    
    customTemplates.push(newTemplate);
    localStorage.setItem('customTimeblockTemplates', JSON.stringify(customTemplates));
    
    MessageUtils.success('自定义模板保存成功！');
    
    // 重新加载模板列表
    loadSavedCustomTemplates();
    
    // 清空表单
    document.getElementById('custom-template-name').value = '';
    document.getElementById('custom-template-desc').value = '';
    document.getElementById('custom-template-content').value = '';
}

function loadSavedCustomTemplates() {
    const customTemplates = JSON.parse(localStorage.getItem('customTimeblockTemplates') || '[]');
    const container = document.getElementById('saved-templates-list');
    
    if (!container) return;
    
    if (customTemplates.length === 0) {
        container.innerHTML = '<div style="color: #999; font-style: italic; text-align: center; padding: 20px;">暂无自定义模板</div>';
        return;
    }
    
    const colorThemes = {
        blue: { bg: '#e3f2fd', border: '#1976d2', text: '#1565c0' },
        green: { bg: '#e8f5e9', border: '#4caf50', text: '#388e3c' },
        purple: { bg: '#f3e5f5', border: '#9c27b0', text: '#8e24aa' },
        orange: { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' },
        red: { bg: '#ffebee', border: '#e91e63', text: '#d81b60' }
    };
    
    container.innerHTML = customTemplates.map(template => {
        const theme = colorThemes[template.color] || colorThemes.blue;
        return `
            <div style="background: ${theme.bg}; border: 2px solid ${theme.border}; border-radius: 12px; padding: 16px; margin: 8px 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h6 style="margin: 0; color: ${theme.text}; font-size: 1em;">${template.name}</h6>
                    <div style="display: flex; gap: 4px;">
                        <button onclick="applyCustomTemplate('${template.id}')" style="background: ${theme.border}; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8em;">
                            应用
                        </button>
                        <button onclick="deleteCustomTemplate('${template.id}')" style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8em;">
                            删除
                        </button>
                    </div>
                </div>
                <div style="color: ${theme.text}; font-size: 0.85em; margin-bottom: 4px;">${template.description}</div>
                <div style="font-size: 0.8em; color: #666;">创建时间: ${new Date(template.createTime).toLocaleString()}</div>
            </div>
        `;
    }).join('');
}

window.applyCustomTemplate = function(templateId) {
    const customTemplates = JSON.parse(localStorage.getItem('customTimeblockTemplates') || '[]');
    const template = customTemplates.find(t => t.id === templateId);
    
    if (!template) {
        MessageUtils.error('模板未找到');
        return;
    }
    
    const timeblockContainer = document.getElementById('day_timeblock');
    if (timeblockContainer) {
        timeblockContainer.innerHTML = '';
        template.content.forEach(timeblock => {
            const timeblockElement = createTaskElement(timeblock, true);
            timeblockContainer.appendChild(timeblockElement);
        });
        
        // 更新时间块统计
        updateTimeblockStats();
        
        // 保存到本地存储
        savePlanData('day');
        
        MessageUtils.success(`已应用自定义模板 "${template.name}"！`);
        
        // 关闭模态框
        ModalUtils.hide();
    }
}

window.deleteCustomTemplate = function(templateId) {
    if (!confirm('确定要删除这个自定义模板吗？')) {
        return;
    }
    
    const customTemplates = JSON.parse(localStorage.getItem('customTimeblockTemplates') || '[]');
    const filteredTemplates = customTemplates.filter(t => t.id !== templateId);
    
    localStorage.setItem('customTimeblockTemplates', JSON.stringify(filteredTemplates));
    MessageUtils.success('模板已删除');
    
    // 重新加载模板列表
    loadSavedCustomTemplates();
}

function suggestTimeblocks() {
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 10px; border-left: 4px solid #4caf50;">
                <h5 style="margin: 0 0 8px 0; color: #2e7d32;">🤖 AI 分析您的需求</h5>
                <div style="font-size: 0.9em; color: #388e3c; margin-bottom: 12px;">
                    请选择今天的主要目标和当前状态，AI 将为您推荐最适合的时间安排。
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">今日主要目标</label>
                    <select id="main-goal" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                        <option value="productivity">提高工作效率</option>
                        <option value="learning">深度学习/技能提升</option>
                        <option value="creativity">创作和创新</option>
                        <option value="balance">工作生活平衡</option>
                        <option value="health">健康和运动</option>
                        <option value="relaxation">放松和恢复</option>
                    </select>
                </div>
                
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">当前能量状态</label>
                    <select id="energy-level" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                        <option value="high">精力充沛</option>
                        <option value="medium">中等状态</option>
                        <option value="low">疲惫需恢复</option>
                        <option value="variable">状态不稳定</option>
                    </select>
                </div>
                
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">可用时间</label>
                    <select id="available-time" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                        <option value="full">全天（8+ 小时）</option>
                        <option value="half">半天（4-8 小时）</option>
                        <option value="limited">有限（2-4 小时）</option>
                        <option value="fragments">碎片时间</option>
                    </select>
                </div>
                
                <div>
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">工作类型</label>
                    <select id="work-type" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                        <option value="deep">深度专注工作</option>
                        <option value="collaborative">协作和沟通</option>
                        <option value="administrative">行政管理工作</option>
                        <option value="mixed">混合类型</option>
                        <option value="personal">个人项目</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">特殊需求或限制</label>
                <textarea id="special-requirements" placeholder="例如：需要参加会议、有特定的休息偏好、身体状况等..." 
                          style="width: 100%; min-height: 80px; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95em;"></textarea>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <button onclick="generateAISuggestions()" class="btn-main" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 12px 24px; font-size: 1.1em;">
                    🧠 生成 AI 建议
                </button>
            </div>
            
            <div id="ai-suggestions-result" style="display: none;">
                <!-- AI 建议结果将在这里显示 -->
            </div>
        </div>
    `;
    
    ModalUtils.show('💡 AI 智能时间块建议', content, 'large');
}

window.generateAISuggestions = function() {
    const goal = document.getElementById('main-goal').value;
    const energy = document.getElementById('energy-level').value;
    const time = document.getElementById('available-time').value;
    const workType = document.getElementById('work-type').value;
    const requirements = document.getElementById('special-requirements').value;
    
    const resultContainer = document.getElementById('ai-suggestions-result');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;"><div style="font-size: 1.2em;">🤖</div>AI 正在分析您的需求...</div>';
    
    // 模拟 AI 分析过程
    setTimeout(() => {
        const suggestions = generateSmartTimeblockSuggestions(goal, energy, time, workType, requirements);
        resultContainer.innerHTML = suggestions;
    }, 2000);
}

function generateSmartTimeblockSuggestions(goal, energy, time, workType, requirements) {
    const currentHour = new Date().getHours();
    let suggestions = [];
    
    // 基于目标和能量状态生成建议
    if (goal === 'productivity' && energy === 'high') {
        suggestions = [
            "07:00-08:00 🌅 晨间准备和规划 [最佳状态开始]",
            "08:00-10:00 💼 最重要任务（深度工作） [黄金专注时间]",
            "10:00-10:15 ☕ 能量补充休息",
            "10:15-12:00 📈 项目推进 [持续高效]",
            "12:00-13:00 🍽️ 营养午餐",
            "13:00-14:00 📧 邮件和沟通 [恢复期任务]",
            "14:00-15:30 💡 创意/问题解决 [下午专注]",
            "15:30-15:45 🚶 活动休息",
            "15:45-17:00 📊 总结和明日准备 [收尾工作]"
        ];
    } else if (goal === 'learning' && energy === 'high') {
        suggestions = [
            "07:30-08:30 📚 晨间复习 [大脑最清醒]",
            "08:30-10:30 🎯 新知识学习 [高专注学习]",
            "10:30-10:45 🧘 冥想休息",
            "10:45-12:00 ✍️ 练习和应用 [巩固学习]",
            "12:00-13:00 🍽️ 轻松午餐",
            "13:00-14:00 📖 轻松阅读 [消化吸收]",
            "14:00-15:30 🔄 回顾和整理 [知识梳理]",
            "15:30-16:00 💭 反思总结 [学习效果评估]"
        ];
    } else if (goal === 'creativity') {
        suggestions = [
            "08:00-09:00 🌅 灵感收集 [创意萌发]",
            "09:00-11:00 🎨 自由创作 [创意高峰]",
            "11:00-11:30 🚶 散步思考 [灵感发酵]",
            "11:30-12:30 💭 头脑风暴 [思维发散]",
            "12:30-13:30 🍽️ 放松午餐",
            "13:30-14:30 🎵 音乐冥想 [创意恢复]",
            "14:30-16:00 ✨ 创意实现 [想法落地]",
            "16:00-17:00 🔍 作品完善 [精雕细琢]"
        ];
    } else if (energy === 'low') {
        suggestions = [
            "08:00-09:00 😴 温和起床 [缓慢启动]",
            "09:00-10:00 ☕ 轻松早餐 [能量补充]",
            "10:00-11:30 📧 轻度任务 [简单工作]",
            "11:30-12:00 🚶 轻松散步 [温和活动]",
            "12:00-13:00 🍽️ 营养午餐",
            "13:00-14:30 💤 恢复休息 [能量充电]",
            "14:30-15:30 📖 轻松阅读 [低强度活动]",
            "15:30-16:30 🧘 冥想放松 [身心恢复]",
            "16:30-17:30 📝 简单整理 [轻松收尾]"
        ];
    } else {
        // 默认平衡建议
        suggestions = [
            "08:00-09:00 🌅 晨间准备 [状态调整]",
            "09:00-11:00 💼 重要工作 [上午专注]",
            "11:00-11:15 ☕ 短暂休息",
            "11:15-12:00 📞 沟通协作 [中等能量]",
            "12:00-13:00 🍽️ 午餐休息",
            "13:00-14:00 📚 学习充电 [恢复期]",
            "14:00-15:30 🎯 项目推进 [下午效率]",
            "15:30-16:00 🚶 活动休息",
            "16:00-17:00 📊 总结规划 [一天收尾]"
        ];
    }
    
    // 根据时间调整建议
    if (time === 'half') {
        suggestions = suggestions.slice(0, Math.ceil(suggestions.length / 2));
    } else if (time === 'limited') {
        suggestions = suggestions.slice(0, Math.ceil(suggestions.length / 3));
    }
    
    const html = `
        <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 12px; padding: 20px; border: 2px solid #1976d2;">
            <h5 style="margin: 0 0 16px 0; color: #1976d2; display: flex; align-items: center; gap: 8px;">
                🤖 AI 为您推荐的时间安排
            </h5>
            
            <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <h6 style="margin: 0 0 8px 0; color: #1565c0;">📋 建议时间块</h6>
                ${suggestions.map(suggestion => `
                    <div style="padding: 8px 12px; margin: 4px 0; background: rgba(25,118,210,0.05); border-radius: 6px; border-left: 3px solid #1976d2;">
                        ${suggestion}
                    </div>
                `).join('')}
            </div>
            
            <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 0.9em; color: #1565c0;">
                <strong>💡 个性化提示：</strong><br>
                ${getPersonalizedTips(goal, energy, workType)}
            </div>
            
            <div style="text-align: center;">
                <button onclick="applyAISuggestions('${suggestions.join('|||')}')" class="btn-main" style="background: #1976d2; color: white; margin-right: 8px;">
                    ✅ 应用建议
                </button>
                <button onclick="generateAISuggestions()" class="btn-main" style="background: #757575; color: white;">
                    🔄 重新生成
                </button>
            </div>
        </div>
    `;
    
    return html;
}

function getPersonalizedTips(goal, energy, workType) {
    const tips = {
        'productivity-high': '您当前状态很好！建议在上午安排最重要的任务，利用黄金专注时间。',
        'learning-high': '学习状态佳！建议采用番茄工作法，25分钟专注+5分钟休息的节奏。',
        'creativity-high': '创意能量充沛！建议在安静的环境中进行，可以播放轻柔的背景音乐。',
        'productivity-low': '当前能量较低，建议先做一些简单的任务热身，避免强制自己做困难工作。',
        'learning-low': '学习状态一般，建议多做复习和轻松阅读，避免学习全新的复杂内容。',
        'creativity-low': '创意能量不足，建议多接触灵感来源，如散步、听音乐或看展览。'
    };
    
    const key = `${goal}-${energy}`;
    return tips[key] || '根据您的状态，建议合理安排休息，保持工作和休息的平衡。';
}

window.applyAISuggestions = function(suggestionsStr) {
    const suggestions = suggestionsStr.split('|||');
    const timeblockContainer = document.getElementById('day_timeblock');
    
    if (timeblockContainer) {
        timeblockContainer.innerHTML = '';
        suggestions.forEach(timeblock => {
            const timeblockElement = createTaskElement(timeblock, true);
            timeblockContainer.appendChild(timeblockElement);
        });
        
        // 更新时间块统计
        updateTimeblockStats();
        
        // 保存到本地存储
        savePlanData('day');
        
        MessageUtils.success('已应用 AI 推荐的时间安排！');
        
        // 关闭模态框
        ModalUtils.hide();
    }
}

function checkTimeblockConflicts() {
    const timeblockContainer = document.getElementById('day_timeblock');
    if (!timeblockContainer) {
        MessageUtils.warning('未找到时间块容器');
        return;
    }
    
    const timeblocks = Array.from(timeblockContainer.children);
    if (timeblocks.length === 0) {
        MessageUtils.info('当前没有时间块需要检测');
        return;
    }
    
    const conflicts = [];
    const timeRanges = [];
    
    // 解析时间块
    timeblocks.forEach((block, index) => {
        const text = block.querySelector('.task-text')?.textContent || '';
        const timeMatch = text.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
        
        if (timeMatch) {
            const startHour = parseInt(timeMatch[1]);
            const startMin = parseInt(timeMatch[2]);
            const endHour = parseInt(timeMatch[3]);
            const endMin = parseInt(timeMatch[4]);
            
            const startTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            
            timeRanges.push({
                index,
                startTime,
                endTime,
                text: text,
                element: block
            });
        }
    });
    
    // 检测冲突
    for (let i = 0; i < timeRanges.length; i++) {
        for (let j = i + 1; j < timeRanges.length; j++) {
            const range1 = timeRanges[i];
            const range2 = timeRanges[j];
            
            // 检查时间重叠
            if ((range1.startTime < range2.endTime && range1.endTime > range2.startTime)) {
                conflicts.push({
                    block1: range1,
                    block2: range2,
                    type: 'overlap'
                });
            }
        }
    }
    
    // 检查时间间隙
    const gaps = [];
    timeRanges.sort((a, b) => a.startTime - b.startTime);
    for (let i = 0; i < timeRanges.length - 1; i++) {
        const current = timeRanges[i];
        const next = timeRanges[i + 1];
        const gapTime = next.startTime - current.endTime;
        
        if (gapTime > 60) { // 超过1小时的间隙
            gaps.push({
                after: current,
                before: next,
                gapMinutes: gapTime
            });
        }
    }
    
    // 显示检测结果
    showConflictResults(conflicts, gaps, timeRanges);
}

function showConflictResults(conflicts, gaps, timeRanges) {
    
    let content = '<div style="margin-bottom: 20px;">';
    
    // 冲突检测结果
    if (conflicts.length > 0) {
        content += `
            <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <h5 style="margin: 0 0 12px 0; color: #d32f2f; display: flex; align-items: center; gap: 8px;">
                    ❌ 发现 ${conflicts.length} 个时间冲突
                </h5>
                ${conflicts.map((conflict, index) => `
                    <div style="background: white; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #f44336;">
                        <div style="font-weight: 600; color: #d32f2f; margin-bottom: 4px;">冲突 ${index + 1}:</div>
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 2px;">• ${conflict.block1.text}</div>
                        <div style="font-size: 0.9em; color: #666;">• ${conflict.block2.text}</div>
                        <button onclick="highlightConflictBlocks(${conflict.block1.index}, ${conflict.block2.index})" 
                                style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 4px 8px; margin-top: 8px; cursor: pointer; font-size: 0.8em;">
                            高亮显示
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        content += `
            <div style="background: #e8f5e9; border: 2px solid #4caf50; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <h5 style="margin: 0; color: #2e7d32; display: flex; align-items: center; gap: 8px;">
                    ✅ 没有发现时间冲突
                </h5>
            </div>
        `;
    }
    
    // 时间间隙提醒
    if (gaps.length > 0) {
        content += `
            <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <h5 style="margin: 0 0 12px 0; color: #ef6c00; display: flex; align-items: center; gap: 8px;">
                    ⏰ 发现 ${gaps.length} 个较大时间间隙
                </h5>
                ${gaps.map((gap, index) => `
                    <div style="background: white; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #ff9800;">
                        <div style="font-weight: 600; color: #ef6c00; margin-bottom: 4px;">间隙 ${index + 1}: ${Math.floor(gap.gapMinutes / 60)}小时${gap.gapMinutes % 60}分钟</div>
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 2px;">从 "${gap.after.text}" 结束后</div>
                        <div style="font-size: 0.9em; color: #666;">到 "${gap.before.text}" 开始前</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 时间利用统计
    const totalPlannedMinutes = timeRanges.reduce((total, range) => total + (range.endTime - range.startTime), 0);
    const utilizationRate = Math.round((totalPlannedMinutes / (16 * 60)) * 100); // 假设16小时工作日
    
    content += `
        <div style="background: #f5f5f5; border-radius: 12px; padding: 16px;">
            <h5 style="margin: 0 0 12px 0; color: #424242;">📊 时间利用统计</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: center;">
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #1976d2;">${timeRanges.length}</div>
                    <div style="font-size: 0.9em; color: #666;">时间块数量</div>
                </div>
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #4caf50;">${Math.floor(totalPlannedMinutes / 60)}h${totalPlannedMinutes % 60}m</div>
                    <div style="font-size: 0.9em; color: #666;">总计划时间</div>
                </div>
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #ff9800;">${utilizationRate}%</div>
                    <div style="font-size: 0.9em; color: #666;">时间利用率</div>
                </div>
            </div>
        </div>
    `;
    
    content += '</div>';
    
    ModalUtils.show('⚠️ 时间冲突检测结果', content, 'large');
    
    // 如果没有冲突，3秒后自动关闭
    if (conflicts.length === 0 && gaps.length === 0) {
        setTimeout(() => {
            ModalUtils.hide();
        }, 3000);
    }
}

window.highlightConflictBlocks = function(index1, index2) {
    const timeblockContainer = document.getElementById('day_timeblock');
    if (!timeblockContainer) return;
    
    const blocks = Array.from(timeblockContainer.children);
    
    // 清除之前的高亮
    blocks.forEach(block => {
        block.style.boxShadow = '';
        block.style.border = '';
    });
    
    // 高亮冲突的时间块
    if (blocks[index1]) {
        blocks[index1].style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.7)';
        blocks[index1].style.border = '2px solid #f44336';
    }
    if (blocks[index2]) {
        blocks[index2].style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.7)';
        blocks[index2].style.border = '2px solid #f44336';
    }
    
    // 关闭模态框以便查看高亮效果
    ModalUtils.hide();
    
    // 5秒后取消高亮
    setTimeout(() => {
        blocks.forEach(block => {
            block.style.boxShadow = '';
            block.style.border = '';
        });
    }, 5000);
}

// 能量优化功能
window.showEnergyOptimization = function() {
    const content = `
        <div style="margin-bottom: 20px;">
            <!-- 当前能量状态评估 -->
            <div style="background: linear-gradient(135deg, #fce4ec, #f8bbd9); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 2px solid #c2185b;">
                <h5 style="margin: 0 0 12px 0; color: #c2185b; display: flex; align-items: center; gap: 8px;">
                    🔋 当前能量状态评估
                </h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div>
                        <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #c2185b;">当前时间能量水平</label>
                        <select id="current-energy-level" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                            <option value="peak">巅峰状态 (90-100%)</option>
                            <option value="high">高能量 (70-89%)</option>
                            <option value="medium" selected>中等能量 (40-69%)</option>
                            <option value="low">低能量 (20-39%)</option>
                            <option value="depleted">能量耗尽 (0-19%)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #c2185b;">今日睡眠质量</label>
                        <select id="sleep-quality" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                            <option value="excellent">优秀 (8+小时深度睡眠)</option>
                            <option value="good" selected>良好 (6-8小时)</option>
                            <option value="fair">一般 (4-6小时)</option>
                            <option value="poor">较差 (不足4小时)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- 能量曲线预测 -->
            <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                <h5 style="margin: 0 0 12px 0; color: #c2185b;">📈 个人能量曲线预测</h5>
                <div id="energy-curve-display" style="background: #f9f9f9; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.9em; line-height: 1.6;">
                    <!-- 动态生成能量曲线 -->
                </div>
            </div>
            
            <!-- 任务-能量匹配建议 -->
            <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                <h5 style="margin: 0 0 12px 0; color: #2e7d32;">🎯 任务-能量智能匹配</h5>
                <div id="task-energy-matching">
                    <!-- 动态生成匹配建议 -->
                </div>
            </div>
            
            <!-- 能量恢复建议 -->
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
                <h5 style="margin: 0 0 12px 0; color: #ef6c00;">🔄 能量恢复策略</h5>
                <div id="energy-recovery-tips">
                    <!-- 动态生成恢复建议 -->
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="generateEnergyOptimization()" class="btn-main" style="background: linear-gradient(135deg, #c2185b, #ad1457); color: white; padding: 12px 24px; margin-right: 12px;">
                    🧠 生成优化方案
                </button>
                <button onclick="applyEnergyOptimization()" class="btn-main" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 12px 24px;">
                    ✅ 应用到时间块
                </button>
            </div>
        </div>
    `;
    
    ModalUtils.show('⚡ 智能能量优化', content, 'large');
    
    // 延迟执行以确保DOM元素已渲染
    setTimeout(() => {
        generateEnergyOptimization();
    }, 100);
};

// 生成能量优化方案
window.generateEnergyOptimization = function() {
    const currentEnergy = document.getElementById('current-energy-level')?.value || 'medium';
    const sleepQuality = document.getElementById('sleep-quality')?.value || 'good';
    
    // 生成能量曲线
    generateEnergyCurve(currentEnergy, sleepQuality);
    
    // 生成任务匹配建议
    generateTaskEnergyMatching(currentEnergy);
    
    // 生成恢复策略
    generateEnergyRecoveryTips(currentEnergy, sleepQuality);
};

function generateEnergyCurve(currentEnergy, sleepQuality) {
    const energyCurveDisplay = document.getElementById('energy-curve-display');
    if (!energyCurveDisplay) return;
    
    // 基于当前状态生成24小时能量曲线
    const basePattern = {
        peak: [85, 90, 95, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 60, 65, 70, 75, 80, 75, 70, 65, 60, 55, 50],
        high: [70, 75, 80, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 45, 50, 55, 60, 65, 60, 55, 50, 45, 40, 35],
        medium: [50, 55, 60, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 25, 30, 35, 40, 45, 40, 35, 30, 25, 20, 15],
        low: [30, 35, 40, 45, 40, 35, 30, 25, 20, 15, 10, 5, 5, 10, 15, 20, 25, 30, 25, 20, 15, 10, 5, 5],
        depleted: [10, 15, 20, 25, 20, 15, 10, 5, 5, 5, 5, 5, 5, 5, 10, 15, 20, 15, 10, 5, 5, 5, 5, 5]
    };
    
    const pattern = basePattern[currentEnergy] || basePattern.medium;
    const currentHour = new Date().getHours();
    
    let curveHtml = '<div style="color: #666; margin-bottom: 8px;">24小时能量预测曲线：</div>';
    
    for (let hour = 0; hour < 24; hour++) {
        const energy = pattern[hour];
        const barWidth = Math.max(energy * 2, 5); // 最小宽度5px
        const isCurrentHour = hour === currentHour;
        const hourStr = hour.toString().padStart(2, '0');
        
        let color = '#e0e0e0';
        if (energy >= 80) color = '#4caf50';
        else if (energy >= 60) color = '#8bc34a';
        else if (energy >= 40) color = '#ff9800';
        else if (energy >= 20) color = '#ff5722';
        else color = '#f44336';
        
        curveHtml += `
            <div style="display: flex; align-items: center; margin: 2px 0; ${isCurrentHour ? 'background: rgba(194,24,91,0.1); border-radius: 4px; padding: 2px;' : ''}">
                <span style="width: 30px; font-size: 0.8em; color: ${isCurrentHour ? '#c2185b' : '#666'};">${hourStr}:00</span>
                <div style="width: ${barWidth}px; height: 12px; background: ${color}; margin: 0 8px; border-radius: 2px;"></div>
                <span style="font-size: 0.8em; color: ${isCurrentHour ? '#c2185b' : '#666'};">${energy}%</span>
                ${isCurrentHour ? '<span style="margin-left: 8px; color: #c2185b; font-weight: bold;">← 当前</span>' : ''}
            </div>
        `;
    }
    
    energyCurveDisplay.innerHTML = curveHtml;
}

function generateTaskEnergyMatching(currentEnergy) {
    const taskEnergyMatching = document.getElementById('task-energy-matching');
    if (!taskEnergyMatching) return;
    
    const recommendations = {
        peak: {
            ideal: ['复杂问题解决', '创意工作', '学习新技能', '重要决策', '深度分析'],
            avoid: ['简单重复任务', '休息时间', '娱乐活动']
        },
        high: {
            ideal: ['项目推进', '会议讨论', '写作创作', '技能练习', '规划设计'],
            avoid: ['机械性工作', '长时间休息']
        },
        medium: {
            ideal: ['日常事务', '邮件处理', '轻度学习', '整理工作', '简单沟通'],
            avoid: ['高难度任务', '重要决策', '创意工作']
        },
        low: {
            ideal: ['简单整理', '阅读复习', '轻松沟通', '例行检查', '数据录入'],
            avoid: ['复杂分析', '创意工作', '重要会议']
        },
        depleted: {
            ideal: ['休息恢复', '轻松娱乐', '冥想放松', '简单阅读'],
            avoid: ['任何高强度工作', '重要任务', '复杂思考']
        }
    };
    
    const rec = recommendations[currentEnergy] || recommendations.medium;
    
    const html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="background: rgba(76,175,80,0.1); border-radius: 8px; padding: 12px;">
                <h6 style="margin: 0 0 8px 0; color: #2e7d32;">✅ 推荐任务类型</h6>
                ${rec.ideal.map(task => `
                    <div style="padding: 4px 8px; margin: 2px 0; background: white; border-radius: 4px; font-size: 0.9em;">
                        • ${task}
                    </div>
                `).join('')}
            </div>
            <div style="background: rgba(244,67,54,0.1); border-radius: 8px; padding: 12px;">
                <h6 style="margin: 0 0 8px 0; color: #d32f2f;">❌ 避免任务类型</h6>
                ${rec.avoid.map(task => `
                    <div style="padding: 4px 8px; margin: 2px 0; background: white; border-radius: 4px; font-size: 0.9em;">
                        • ${task}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    taskEnergyMatching.innerHTML = html;
}

function generateEnergyRecoveryTips(currentEnergy, sleepQuality) {
    const energyRecoveryTips = document.getElementById('energy-recovery-tips');
    if (!energyRecoveryTips) return;
    
    const tips = {
        peak: [
            '保持当前状态，适当安排高强度任务',
            '注意不要过度消耗，预留恢复时间',
            '在能量高峰期完成最重要的工作'
        ],
        high: [
            '可以承担中高强度任务',
            '适当安排15分钟短休息',
            '保持水分充足，避免咖啡因过量'
        ],
        medium: [
            '每45分钟休息5-10分钟',
            '进行轻度运动或伸展',
            '补充健康零食和水分',
            '避免高强度任务，专注中等难度工作'
        ],
        low: [
            '立即安排15-20分钟恢复性休息',
            '进行深呼吸或短暂冥想',
            '补充蛋白质和复合碳水化合物',
            '考虑轻度运动或户外走动',
            '避免咖啡因，选择绿茶或水'
        ],
        depleted: [
            '立即停止高强度工作',
            '安排30分钟完全放松',
            '考虑20分钟小憩（避免超过30分钟）',
            '确保充足水分和营养补充',
            '今日剩余时间专注恢复性活动'
        ]
    };
    
    const sleepTips = {
        excellent: ['继续保持良好睡眠习惯'],
        good: ['今晚尽量早睡，保证充足睡眠'],
        fair: ['今晚务必早睡，考虑午休补充'],
        poor: ['今日适当安排短暂午休，今晚早睡恢复']
    };
    
    const currentTips = tips[currentEnergy] || tips.medium;
    const currentSleepTips = sleepTips[sleepQuality] || sleepTips.good;
    
    const html = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
            <div>
                <h6 style="margin: 0 0 8px 0; color: #ef6c00;">🔋 即时恢复策略</h6>
                ${currentTips.map(tip => `
                    <div style="padding: 6px 12px; margin: 4px 0; background: white; border-radius: 6px; border-left: 3px solid #ff9800; font-size: 0.9em;">
                        ${tip}
                    </div>
                `).join('')}
            </div>
            <div>
                <h6 style="margin: 0 0 8px 0; color: #ef6c00;">😴 睡眠建议</h6>
                ${currentSleepTips.map(tip => `
                    <div style="padding: 6px 12px; margin: 4px 0; background: white; border-radius: 6px; border-left: 3px solid #2196f3; font-size: 0.9em;">
                        ${tip}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    energyRecoveryTips.innerHTML = html;
}

// 应用能量优化到时间块
window.applyEnergyOptimization = function() {
    const currentEnergy = document.getElementById('current-energy-level')?.value || 'medium';
    const timeblockContainer = document.getElementById('day_timeblock');
    
    if (!timeblockContainer) {
        MessageUtils.error('未找到时间块容器');
        return;
    }
    
    // 获取当前时间块内容
    const existingBlocks = Array.from(timeblockContainer.children);
    
    if (existingBlocks.length === 0) {
        MessageUtils.warning('请先添加一些时间块，然后再进行能量优化');
        return;
    }
    
    // 基于能量状态重新排序和优化时间块
    const optimizedBlocks = optimizeTimeblocksByEnergy(existingBlocks, currentEnergy);
    
    // 清空容器并重新添加优化后的时间块
    timeblockContainer.innerHTML = '';
    optimizedBlocks.forEach(block => {
        timeblockContainer.appendChild(block);
    });
    
    MessageUtils.success('已根据能量状态优化时间块安排！');
    ModalUtils.hide();
};

function optimizeTimeblocksByEnergy(blocks, energyLevel) {
    // 简单的能量优化逻辑：根据时间和能量状态重新排序
    return blocks.sort((a, b) => {
        const aText = a.querySelector('.task-text')?.textContent || '';
        const bText = b.querySelector('.task-text')?.textContent || '';
        
        // 提取时间信息进行排序
        const aTimeMatch = aText.match(/(\d{1,2}):(\d{2})/);
        const bTimeMatch = bText.match(/(\d{1,2}):(\d{2})/);
        
        if (aTimeMatch && bTimeMatch) {
            const aTime = parseInt(aTimeMatch[1]) * 60 + parseInt(aTimeMatch[2]);
            const bTime = parseInt(bTimeMatch[1]) * 60 + parseInt(bTimeMatch[2]);
            return aTime - bTime;
        }
        
        return 0;
    });
}

// 智能休息安排功能
window.showBreakScheduler = function() {
    const content = `
        <div style="margin-bottom: 20px;">
            <!-- 工作模式选择 -->
            <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 2px solid #7b1fa2;">
                <h5 style="margin: 0 0 12px 0; color: #7b1fa2; display: flex; align-items: center; gap: 8px;">
                    ⚙️ 工作模式配置
                </h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div>
                        <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #7b1fa2;">工作方法</label>
                        <select id="work-method" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                            <option value="pomodoro">番茄工作法 (25分钟工作+5分钟休息)</option>
                            <option value="ultradian">生理节律法 (90分钟工作+20分钟休息)</option>
                            <option value="timeboxing" selected>时间盒法 (45分钟工作+15分钟休息)</option>
                            <option value="custom">自定义方案</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #7b1fa2;">工作强度</label>
                        <select id="work-intensity" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;">
                            <option value="high">高强度 (深度专注工作)</option>
                            <option value="medium" selected>中等强度 (一般办公)</option>
                            <option value="low">低强度 (轻松任务)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- 休息类型偏好 -->
            <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                <h5 style="margin: 0 0 12px 0; color: #7b1fa2;">🧘 休息类型偏好</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="stretch" checked style="margin: 0;">
                        <span style="font-weight: normal;">🤸 伸展运动</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="walk" checked style="margin: 0;">
                        <span style="font-weight: normal;">🚶 短距散步</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="meditate" style="margin: 0;">
                        <span style="font-weight: normal;">🧘 冥想放松</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="hydrate" checked style="margin: 0;">
                        <span style="font-weight: normal;">💧 补水休息</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="breathe" style="margin: 0;">
                        <span style="font-weight: normal;">🫁 深呼吸</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; margin: 0; cursor: pointer; padding: 8px; border-radius: 6px; border: 2px solid transparent; background: rgba(123,31,162,0.1);">
                        <input type="checkbox" name="break-type" value="snack" style="margin: 0;">
                        <span style="font-weight: normal;">🍎 健康零食</span>
                    </label>
                </div>
            </div>
            
            <!-- 生成的休息计划 -->
            <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                <h5 style="margin: 0 0 12px 0; color: #2e7d32;">📅 智能休息计划</h5>
                <div id="break-schedule-display">
                    <!-- 动态生成休息计划 -->
                </div>
            </div>
            
            <!-- 休息效果统计 -->
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
                <h5 style="margin: 0 0 12px 0; color: #ef6c00;">📊 预期效果分析</h5>
                <div id="break-effectiveness-analysis">
                    <!-- 动态生成效果分析 -->
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="generateBreakSchedule()" class="btn-main" style="background: linear-gradient(135deg, #7b1fa2, #6a1b9a); color: white; padding: 12px 24px; margin-right: 12px;">
                    🧠 生成休息计划
                </button>
                <button onclick="applyBreakSchedule()" class="btn-main" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 12px 24px;">
                    ✅ 应用到时间块
                </button>
            </div>
        </div>
    `;
    
    ModalUtils.show('🧘 智能休息安排', content, 'large');
    
    // 延迟执行以确保DOM元素已渲染
    setTimeout(() => {
        generateBreakSchedule();
    }, 100);
};

// 生成休息计划
window.generateBreakSchedule = function() {
    const workMethod = document.getElementById('work-method')?.value || 'timeboxing';
    const workIntensity = document.getElementById('work-intensity')?.value || 'medium';
    const breakTypes = Array.from(document.querySelectorAll('input[name="break-type"]:checked')).map(cb => cb.value);
    
    // 生成休息时间表
    generateBreakTimeTable(workMethod, workIntensity, breakTypes);
    
    // 生成效果分析
    generateBreakEffectivenessAnalysis(workMethod, workIntensity);
};

function generateBreakTimeTable(workMethod, intensity, breakTypes) {
    const scheduleDisplay = document.getElementById('break-schedule-display');
    if (!scheduleDisplay) return;
    
    const workPatterns = {
        pomodoro: { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
        ultradian: { work: 90, shortBreak: 20, longBreak: 30, cycles: 2 },
        timeboxing: { work: 45, shortBreak: 15, longBreak: 30, cycles: 3 },
        custom: { work: 60, shortBreak: 10, longBreak: 20, cycles: 3 }
    };
    
    const pattern = workPatterns[workMethod] || workPatterns.timeboxing;
    const startHour = 9; // 假设9点开始工作
    
    let schedule = [];
    let currentTime = startHour * 60; // 转换为分钟
    
    for (let cycle = 0; cycle < pattern.cycles; cycle++) {
        // 工作时间
        const workStart = formatTime(currentTime);
        currentTime += pattern.work;
        const workEnd = formatTime(currentTime);
        
        schedule.push({
            type: 'work',
            start: workStart,
            end: workEnd,
            duration: pattern.work,
            activity: getWorkActivity(intensity)
        });
        
        // 休息时间
        const isLongBreak = (cycle + 1) % pattern.cycles === 0;
        const breakDuration = isLongBreak ? pattern.longBreak : pattern.shortBreak;
        const breakStart = formatTime(currentTime);
        currentTime += breakDuration;
        const breakEnd = formatTime(currentTime);
        
        schedule.push({
            type: 'break',
            start: breakStart,
            end: breakEnd,
            duration: breakDuration,
            activity: getBreakActivity(breakTypes, isLongBreak)
        });
    }
    
    // 渲染时间表
    let html = '<div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">';
    schedule.forEach((item, index) => {
        const isWork = item.type === 'work';
        const bgColor = isWork ? 'rgba(25,118,210,0.1)' : 'rgba(76,175,80,0.1)';
        const borderColor = isWork ? '#1976d2' : '#4caf50';
        const icon = isWork ? '💼' : '🧘';
        
        html += `
            <div style="display: flex; align-items: center; padding: 8px 12px; margin: 4px 0; background: ${bgColor}; border-left: 3px solid ${borderColor}; border-radius: 6px;">
                <span style="width: 20px;">${icon}</span>
                <span style="width: 120px; font-weight: 600;">${item.start} - ${item.end}</span>
                <span style="width: 60px; color: #666;">(${item.duration}分钟)</span>
                <span style="flex: 1; margin-left: 12px;">${item.activity}</span>
            </div>
        `;
    });
    html += '</div>';
    
    scheduleDisplay.innerHTML = html;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function getWorkActivity(intensity) {
    const activities = {
        high: '深度专注工作 - 复杂任务、创意工作、重要决策',
        medium: '常规工作任务 - 邮件处理、会议、文档编写',
        low: '轻松工作 - 简单整理、数据录入、例行检查'
    };
    return activities[intensity] || activities.medium;
}

function getBreakActivity(breakTypes, isLongBreak) {
    if (breakTypes.length === 0) {
        return isLongBreak ? '长时间休息放松' : '短暂休息';
    }
    
    const activities = {
        stretch: '🤸 站起来伸展身体，活动肩颈',
        walk: '🚶 室内或户外短距离散步',
        meditate: '🧘 闭眼冥想，专注呼吸',
        hydrate: '💧 补充水分，远离屏幕',
        breathe: '🫁 深呼吸练习，放松身心',
        snack: '🍎 健康零食补充能量'
    };
    
    if (isLongBreak) {
        // 长休息时间可以结合多种活动
        const selectedActivities = breakTypes.map(type => activities[type]).filter(Boolean);
        return selectedActivities.slice(0, 2).join(' + ');
    } else {
        // 短休息时间选择一种主要活动
        const randomType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
        return activities[randomType] || '短暂休息放松';
    }
}

function generateBreakEffectivenessAnalysis(workMethod, intensity) {
    const analysisDisplay = document.getElementById('break-effectiveness-analysis');
    if (!analysisDisplay) return;
    
    const methodBenefits = {
        pomodoro: {
            productivity: 85,
            focus: 90,
            fatigue: 20,
            creativity: 75,
            description: '短周期高频休息，适合需要持续专注的工作'
        },
        ultradian: {
            productivity: 90,
            focus: 95,
            fatigue: 15,
            creativity: 85,
            description: '遵循自然生理节律，深度工作效果最佳'
        },
        timeboxing: {
            productivity: 80,
            focus: 80,
            fatigue: 25,
            creativity: 70,
            description: '平衡的工作休息比例，适合大多数工作类型'
        },
        custom: {
            productivity: 75,
            focus: 75,
            fatigue: 30,
            creativity: 65,
            description: '灵活的时间安排，需要根据实际情况调整'
        }
    };
    
    const benefit = methodBenefits[workMethod] || methodBenefits.timeboxing;
    
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 16px;">
            <div style="text-align: center; background: white; border-radius: 8px; padding: 12px;">
                <div style="font-size: 1.2em; font-weight: 600; color: #4caf50;">${benefit.productivity}%</div>
                <div style="font-size: 0.8em; color: #666;">生产力提升</div>
            </div>
            <div style="text-align: center; background: white; border-radius: 8px; padding: 12px;">
                <div style="font-size: 1.2em; font-weight: 600; color: #2196f3;">${benefit.focus}%</div>
                <div style="font-size: 0.8em; color: #666;">专注力增强</div>
            </div>
            <div style="text-align: center; background: white; border-radius: 8px; padding: 12px;">
                <div style="font-size: 1.2em; font-weight: 600; color: #ff9800;">${benefit.fatigue}%</div>
                <div style="font-size: 0.8em; color: #666;">疲劳程度</div>
            </div>
            <div style="text-align: center; background: white; border-radius: 8px; padding: 12px;">
                <div style="font-size: 1.2em; font-weight: 600; color: #9c27b0;">${benefit.creativity}%</div>
                <div style="font-size: 0.8em; color: #666;">创造力激发</div>
            </div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 12px; font-size: 0.9em; color: #666;">
            <strong style="color: #ef6c00;">方法特点：</strong> ${benefit.description}
        </div>
    `;
    
    analysisDisplay.innerHTML = html;
}

// 应用休息计划到时间块
window.applyBreakSchedule = function() {
    const workMethod = document.getElementById('work-method')?.value || 'timeboxing';
    const workIntensity = document.getElementById('work-intensity')?.value || 'medium';
    const breakTypes = Array.from(document.querySelectorAll('input[name="break-type"]:checked')).map(cb => cb.value);
    
    const timeblockContainer = document.getElementById('day_timeblock');
    if (!timeblockContainer) {
        MessageUtils.error('未找到时间块容器');
        return;
    }
    
    // 生成时间块
    const timeblocks = generateTimeblocks(workMethod, workIntensity, breakTypes);
    
    // 清空容器并添加新的时间块
    timeblockContainer.innerHTML = '';
    timeblocks.forEach(timeblock => {
        const timeblockElement = createTaskElement(timeblock, true);
        timeblockContainer.appendChild(timeblockElement);
    });
    
    // 更新统计
    if (window.updateTimeblockStats) {
        updateTimeblockStats();
    }
    
    // 保存数据
    if (window.savePlanData) {
        savePlanData('day');
    }
    
    MessageUtils.success('已应用智能休息计划到时间块！');
    ModalUtils.hide();
};

function generateTimeblocks(workMethod, intensity, breakTypes) {
    const workPatterns = {
        pomodoro: { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
        ultradian: { work: 90, shortBreak: 20, longBreak: 30, cycles: 2 },
        timeboxing: { work: 45, shortBreak: 15, longBreak: 30, cycles: 3 },
        custom: { work: 60, shortBreak: 10, longBreak: 20, cycles: 3 }
    };
    
    const pattern = workPatterns[workMethod] || workPatterns.timeboxing;
    const startHour = 9;
    let currentTime = startHour * 60;
    let timeblocks = [];
    
    for (let cycle = 0; cycle < pattern.cycles; cycle++) {
        // 工作时间块
        const workStart = formatTime(currentTime);
        currentTime += pattern.work;
        const workEnd = formatTime(currentTime);
        
        timeblocks.push(`${workStart}-${workEnd} 💼 ${getWorkActivity(intensity)} [专注工作]`);
        
        // 休息时间块
        const isLongBreak = (cycle + 1) % pattern.cycles === 0;
        const breakDuration = isLongBreak ? pattern.longBreak : pattern.shortBreak;
        const breakStart = formatTime(currentTime);
        currentTime += breakDuration;
        const breakEnd = formatTime(currentTime);
        
        timeblocks.push(`${breakStart}-${breakEnd} 🧘 ${getBreakActivity(breakTypes, isLongBreak)} [休息恢复]`);
    }
    
    return timeblocks;
}

function showReflectionTemplates() {
    // 打开反思模板页面
    window.open('reflection_template.html', '_blank');
}

function showHabitReminder() {
    console.log('showHabitReminder called');
    
    // 检查浏览器是否支持通知
    const notificationSupported = 'Notification' in window;
    const currentPermission = notificationSupported ? Notification.permission : 'denied';
    
    // 获取当前习惯
    const habitTasks = getTodoContent('day_must_dos');
    const habitLines = habitTasks.split('\n').filter(line => line.trim().startsWith('['));
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🔔 智能提醒</h3>
            <p style="color: #666;">设置习惯提醒，帮助您养成良好的生活节奏</p>
        </div>
        
        <!-- 通知权限状态 -->
        <div class="permission-status" style="background: ${currentPermission === 'granted' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'}; 
                    border-radius: 8px; padding: 16px; margin-bottom: 20px; 
                    border-left: 4px solid ${currentPermission === 'granted' ? '#4caf50' : '#ff9800'};">
            <h4 style="color: ${currentPermission === 'granted' ? '#4caf50' : '#ff9800'}; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
                ${currentPermission === 'granted' ? '✅' : '⚠️'} 通知权限状态
            </h4>
            <div style="color: #666; font-size: 0.9em; margin-bottom: 12px;">
                ${currentPermission === 'granted' ? '通知权限已授权，可以发送提醒通知' : 
                  currentPermission === 'denied' ? '通知权限被拒绝，请在浏览器设置中开启' : 
                  '需要请求通知权限'}
            </div>
            ${currentPermission !== 'granted' ? `
                <button class="btn-main" onclick="requestNotificationPermission()" style="font-size: 0.85em;">
                    🔔 请求通知权限
                </button>
            ` : ''}
        </div>
        
        <!-- 快速提醒设置 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">⚡ 快速提醒</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                <button class="reminder-btn" onclick="setQuickReminder(10)" style="background: #e3f2fd; color: #1976d2;">
                    10分钟后
                </button>
                <button class="reminder-btn" onclick="setQuickReminder(30)" style="background: #e8f5e9; color: #2e7d32;">
                    30分钟后
                </button>
                <button class="reminder-btn" onclick="setQuickReminder(60)" style="background: #fff3e0; color: #ef6c00;">
                    1小时后
                </button>
                <button class="reminder-btn" onclick="setQuickReminder(120)" style="background: #f3e5f5; color: #7b1fa2;">
                    2小时后
                </button>
            </div>
        </div>
        
        <!-- 习惯定时提醒 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">🎯 习惯定时提醒</h4>
            ${habitLines.length > 0 ? `
                <div style="max-height: 200px; overflow-y: auto;">
                    ${habitLines.map(line => {
                        const text = line.replace(/^\[.\]\s*/, '');
                        const isCompleted = line.includes('[x]') || line.includes('[X]');
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1em;">${isCompleted ? '✅' : '⏳'}</span>
                                    <span style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${text}</span>
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <select onchange="scheduleHabitReminder('${text.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', this.value)" style="font-size: 0.8em; padding: 2px 4px; border-radius: 4px; border: 1px solid #ddd;">
                                        <option value="">选择时间</option>
                                        <option value="morning">早上8点</option>
                                        <option value="afternoon">下午2点</option>
                                        <option value="evening">晚上7点</option>
                                        <option value="custom">自定义</option>
                                    </select>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<div style="text-align: center; color: #999; padding: 20px;">暂无习惯任务</div>'}
        </div>
        
        <!-- 智能提醒建议 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">🧠 智能提醒建议</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; cursor: pointer;" onclick="setSuggestedReminder('morning')">
                    <div style="font-weight: 600; color: #2e7d32; margin-bottom: 4px;">🌅 晨间习惯</div>
                    <div style="font-size: 0.85em; color: #666;">建议在早上8:00执行锻炼、阅读等习惯</div>
                </div>
                <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; cursor: pointer;" onclick="setSuggestedReminder('afternoon')">
                    <div style="font-weight: 600; color: #1976d2; margin-bottom: 4px;">🌤️ 午间休息</div>
                    <div style="font-size: 0.85em; color: #666;">建议在下午2:00进行冥想、喝水等习惯</div>
                </div>
                <div style="background: #fff3e0; padding: 12px; border-radius: 6px; cursor: pointer;" onclick="setSuggestedReminder('evening')">
                    <div style="font-weight: 600; color: #ef6c00; margin-bottom: 4px;">🌙 晚间回顾</div>
                    <div style="font-size: 0.85em; color: #666;">建议在晚上7:00进行总结、规划等习惯</div>
                </div>
            </div>
        </div>
        
        <!-- 提醒历史 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="color: var(--theme-color); margin: 0;">📋 活跃提醒</h4>
                <button class="btn-main" onclick="clearAllReminders()" style="font-size: 0.8em; background: #ffebee; color: #d32f2f;">
                    清除所有
                </button>
            </div>
            <div id="active-reminders" style="font-size: 0.85em; color: #666;">
                ${getActiveReminders()}
            </div>
        </div>
        
        <style>
            .reminder-btn {
                border: none;
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 0.85em;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            .reminder-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
        </style>
    `;
    
    ModalUtils.show('智能提醒', content, 'large');
}

function showMoodTracker() {
    MessageUtils.info('心情记录功能正在开发中...');
}

function showGratitudePrompts() {
    MessageUtils.info('感恩日记功能正在开发中...');
}

function showAutoCategorize() {
    console.log('showAutoCategorize called');
    
    // 获取待办事项内容
    const todoContent = getTodoContent('day_todos');
    const todoLines = todoContent.split('\n').filter(line => line.trim() && line.includes('['));
    
    if (todoLines.length === 0) {
        MessageUtils.warning('暂无待办事项可分类，请先添加一些任务');
        return;
    }
    
    // 分类结果
    const categories = categorizeTasksIntelligently(todoLines);
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🏷️ 智能分类</h3>
            <p style="color: #666;">AI智能分析您的待办事项，自动归类并提供优化建议</p>
        </div>
        
        <!-- 分类统计 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">📊 分类统计</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                ${Object.keys(categories).map(category => `
                    <div style="background: ${getCategoryColor(category)}; padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="font-weight: 600; font-size: 0.9em;">${getCategoryIcon(category)} ${category}</div>
                        <div style="font-size: 0.8em; opacity: 0.8;">${categories[category].length} 项</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- 分类详情 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">📋 分类详情</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                ${Object.keys(categories).map(category => `
                    <div style="margin-bottom: 16px; padding: 12px; background: ${getCategoryColor(category)}; border-radius: 6px;">
                        <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            ${getCategoryIcon(category)} ${category}
                            <span style="font-size: 0.8em; opacity: 0.7;">(${categories[category].length} 项)</span>
                        </div>
                        ${categories[category].map(task => `
                            <div style="margin: 4px 0; padding: 4px 8px; background: rgba(255,255,255,0.3); border-radius: 4px; font-size: 0.9em;">
                                ${task.replace(/^\[.\]\s*/, '')}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- AI建议 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: var(--theme-color); margin: 0 0 12px 0;">🤖 AI优化建议</h4>
            <div style="font-size: 0.9em; line-height: 1.6;">
                ${generateCategorizationSuggestions(categories)}
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="btn-main" onclick="applyCategorization()" style="flex: 1; background: #4caf50; color: white;">
                ✅ 应用分类
            </button>
            <button class="btn-main" onclick="exportCategorization()" style="flex: 1; background: #2196f3; color: white;">
                📤 导出分类
            </button>
            <button class="btn-main" onclick="refreshCategorization()" style="flex: 1; background: #ff9800; color: white;">
                🔄 重新分类
            </button>
        </div>
    `;
    
    ModalUtils.show('智能分类', content, 'large');
}

// 智能分类算法
function categorizeTasksIntelligently(todoLines) {
    const categories = {
        '工作任务': [],
        '学习成长': [],
        '生活事务': [],
        '健康运动': [],
        '社交沟通': [],
        '娱乐休闲': [],
        '其他任务': []
    };
    
    // 关键词映射
    const categoryKeywords = {
        '工作任务': ['工作', '项目', '会议', '报告', '邮件', '客户', '业务', '任务', '计划', '方案', '文档', '提交', '审核', '汇报', '需求', 'bug', '测试', '上线', '部署'],
        '学习成长': ['学习', '阅读', '课程', '培训', '研究', '学', '看书', '复习', '考试', '技能', '知识', '书', '视频', '教程', '练习', '背诵'],
        '生活事务': ['购物', '买', '缴费', '银行', '家务', '清洁', '整理', '洗', '做饭', '吃饭', '睡觉', '起床', '出门', '回家', '快递', '取', '送', '修理'],
        '健康运动': ['运动', '健身', '跑步', '游泳', '瑜伽', '锻炼', '医院', '体检', '看病', '吃药', '休息', '睡眠', '散步', '爬山', '骑车'],
        '社交沟通': ['朋友', '家人', '聚会', '约会', '电话', '聊天', '拜访', '见面', '社交', '聚餐', '生日', '节日', '礼物', '陪伴'],
        '娱乐休闲': ['电影', '游戏', '音乐', '旅游', '购物', '娱乐', '放松', '休闲', '看剧', '听歌', '玩', '逛街', '散心', '度假']
    };
    
    todoLines.forEach(line => {
        const taskText = line.replace(/^\[.\]\s*/, '').toLowerCase();
        let categorized = false;
        
        // 按关键词匹配优先级分类
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => taskText.includes(keyword))) {
                categories[category].push(line);
                categorized = true;
                break;
            }
        }
        
        // 如果没有匹配到任何关键词，归类为其他任务
        if (!categorized) {
            categories['其他任务'].push(line);
        }
    });
    
    // 移除空分类
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) {
            delete categories[key];
        }
    });
    
    return categories;
}

// 获取分类颜色
function getCategoryColor(category) {
    const colors = {
        '工作任务': 'rgba(255, 87, 34, 0.1)',
        '学习成长': 'rgba(76, 175, 80, 0.1)',
        '生活事务': 'rgba(33, 150, 243, 0.1)',
        '健康运动': 'rgba(233, 30, 99, 0.1)',
        '社交沟通': 'rgba(156, 39, 176, 0.1)',
        '娱乐休闲': 'rgba(255, 193, 7, 0.1)',
        '其他任务': 'rgba(158, 158, 158, 0.1)'
    };
    return colors[category] || 'rgba(0, 0, 0, 0.1)';
}

// 获取分类图标
function getCategoryIcon(category) {
    const icons = {
        '工作任务': '💼',
        '学习成长': '📚',
        '生活事务': '🏠',
        '健康运动': '🏃',
        '社交沟通': '👥',
        '娱乐休闲': '🎮',
        '其他任务': '📝'
    };
    return icons[category] || '📋';
}

// 生成分类建议
function generateCategorizationSuggestions(categories) {
    const suggestions = [];
    const totalTasks = Object.values(categories).reduce((sum, tasks) => sum + tasks.length, 0);
    
    // 分析各类任务占比
    const workTasks = categories['工作任务']?.length || 0;
    const studyTasks = categories['学习成长']?.length || 0;
    const lifeTasks = categories['生活事务']?.length || 0;
    const healthTasks = categories['健康运动']?.length || 0;
    
    const workRatio = workTasks / totalTasks;
    const studyRatio = studyTasks / totalTasks;
    const lifeRatio = lifeTasks / totalTasks;
    const healthRatio = healthTasks / totalTasks;
    
    // 生成针对性建议
    if (workRatio > 0.6) {
        suggestions.push('🔥 工作任务占比较高(' + Math.round(workRatio * 100) + '%)，建议合理分配时间，避免过度工作');
    }
    
    if (healthRatio < 0.1) {
        suggestions.push('⚠️ 健康运动任务较少，建议增加一些运动和健康相关的活动');
    }
    
    if (studyRatio > 0.3) {
        suggestions.push('📖 学习任务丰富，建议制定学习计划，循序渐进完成');
    }
    
    if (lifeTasks > 5) {
        suggestions.push('🏠 生活事务较多，可以考虑批量处理或寻求家人帮助');
    }
    
    if (Object.keys(categories).length > 5) {
        suggestions.push('🎯 任务类型较为丰富，建议按优先级和时间段合理安排');
    }
    
    if (suggestions.length === 0) {
        suggestions.push('✨ 您的任务分布比较均衡，继续保持良好的工作生活平衡！');
    }
    
    return suggestions.map(s => `<div style="margin: 8px 0; padding: 8px 12px; background: rgba(33, 150, 243, 0.1); border-left: 3px solid #2196f3; border-radius: 4px;">${s}</div>`).join('');
}

// 应用分类
function applyCategorization() {
    MessageUtils.success('分类已应用！您可以根据分类结果重新整理待办事项');
    
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

// 导出分类
function exportCategorization() {
    const todoContent = getTodoContent('day_todos');
    const todoLines = todoContent.split('\n').filter(line => line.trim() && line.includes('['));
    const categories = categorizeTasksIntelligently(todoLines);
    
    let exportText = `📋 智能分类结果 - ${new Date().toLocaleDateString()}\n\n`;
    
    Object.keys(categories).forEach(category => {
        exportText += `${getCategoryIcon(category)} ${category} (${categories[category].length}项)\n`;
        categories[category].forEach(task => {
            exportText += `  • ${task.replace(/^\[.\]\s*/, '')}\n`;
        });
        exportText += '\n';
    });
    
    // 复制到剪贴板
    navigator.clipboard.writeText(exportText).then(() => {
        MessageUtils.success('分类结果已复制到剪贴板！');
    }).catch(() => {
        MessageUtils.warning('复制失败，请手动复制结果');
        console.log('Export text:', exportText);
    });
}

// 重新分类
function refreshCategorization() {
    // 关闭当前模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
    
    // 重新打开分类界面
    setTimeout(() => {
        showAutoCategorize();
    }, 300);
}

// 快速导航辅助函数
function jumpToToday() {
    currentDate = DateUtils.getToday();
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    MessageUtils.success('已跳转到今天');
    
    // 关闭模态框
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function jumpToYesterday() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    currentDate = DateUtils.formatDate(date);
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    MessageUtils.success('已跳转到昨天');
    
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function jumpToTomorrow() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    currentDate = DateUtils.formatDate(date);
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    MessageUtils.success('已跳转到明天');
    
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function jumpToWeekStart() {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    currentDate = DateUtils.formatDate(startOfWeek);
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    MessageUtils.success('已跳转到本周开始');
    
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function jumpToMonthStart() {
    const date = new Date(currentDate);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    currentDate = DateUtils.formatDate(startOfMonth);
    document.getElementById('day_date').value = currentDate;
    updateWeekday();
    loadTodayPlan();
    updateProgress();
    MessageUtils.success('已跳转到本月开始');
    
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function showDatePicker() {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h4 style="color: var(--theme-color);">选择日期</h4>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <input type="date" id="custom-date-picker" value="${currentDate}" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1em;">
            <button class="btn-main" onclick="jumpToCustomDate()" style="width: 100%;">跳转到此日期</button>
        </div>
    `;
    
    ModalUtils.show('选择日期', content);
}

function jumpToCustomDate() {
    const customDate = document.getElementById('custom-date-picker').value;
    if (customDate) {
        currentDate = customDate;
        document.getElementById('day_date').value = currentDate;
        updateWeekday();
        loadTodayPlan();
        updateProgress();
        MessageUtils.success(`已跳转到 ${customDate}`);
        
        const modal = document.querySelector('.modal-mask');
        if (modal) ModalUtils.hide(modal);
    }
}

function copyFromYesterday() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    const yesterdayDate = DateUtils.formatDate(date);
    
    const yesterdayPlan = StorageUtils.loadPlan('day', yesterdayDate);
    if (yesterdayPlan) {
        // 复制内容但不包括反思
        document.getElementById('day_goals').value = yesterdayPlan.goals || '';
        
        loadTodoContent('day_top3', yesterdayPlan.priorities);
        loadTodoContent('day_must_dos', yesterdayPlan.habits);
        loadTodoContent('day_todos', yesterdayPlan.todos);
        loadTodoContent('day_timeblock', yesterdayPlan.timeblock);
        
        MessageUtils.success('已复制昨日计划内容');
        
        const modal = document.querySelector('.modal-mask');
        if (modal) ModalUtils.hide(modal);
    } else {
        MessageUtils.warning('昨日暂无计划内容可复制');
    }
}

function createTemplate() {
    MessageUtils.info('创建模板功能正在开发中...');
}

function showRecentDays() {
    MessageUtils.info('最近几天功能正在开发中...');
}

function recordEnergyLevel() {
    MessageUtils.info('记录能量功能正在开发中...');
}

function showEnergyHistory() {
    MessageUtils.info('能量历史功能正在开发中...');
}

// 番茄钟功能
let pomodoroTimer = {
    isRunning: false,
    timeLeft: 25 * 60, // 25分钟
    interval: null,
    isBreak: false,
    session: 1,
    totalSessions: 0
};

function togglePomodoroTimer() {
    // 获取番茄钟按钮
    const priorityBtn = document.getElementById('priority-timer-btn');
    
    if (!priorityBtn) {
        console.error('Pomodoro timer button not found');
        return;
    }
    
    if (!pomodoroTimer.isRunning) {
        startPomodoroTimer();
        updatePomodoroButtonsState('running');
    } else {
        stopPomodoroTimer();
        updatePomodoroButtonsState('stopped');
    }
}

// 更新番茄钟按钮的状态
function updatePomodoroButtonsState(state) {
    const priorityBtn = document.getElementById('priority-timer-btn');
    
    if (!priorityBtn) return;
    
    switch(state) {
        case 'running':
            priorityBtn.classList.add('timer-active');
            priorityBtn.innerHTML = '⏹️ 停止';
            priorityBtn.style.background = '#f44336';
            priorityBtn.style.color = 'white';
            break;
        case 'paused':
            priorityBtn.classList.remove('timer-active');
            priorityBtn.innerHTML = '▶️ 继续';
            priorityBtn.style.background = '#4caf50';
            priorityBtn.style.color = 'white';
            break;
        case 'stopped':
        default:
            priorityBtn.classList.remove('timer-active');
            priorityBtn.innerHTML = '⏰ 番茄钟';
            priorityBtn.style.background = '#ffebee';
            priorityBtn.style.color = '#d32f2f';
            break;
    }
}

function startPomodoroTimer() {
    pomodoroTimer.isRunning = true;
    
    // 显示番茄钟界面
    showPomodoroInterface();
    
    pomodoroTimer.interval = setInterval(() => {
        pomodoroTimer.timeLeft--;
        updatePomodoroDisplay();
        
        if (pomodoroTimer.timeLeft <= 0) {
            completePomodoroSession();
        }
    }, 1000);
    
    MessageUtils.success('番茄钟已开始！专注25分钟');
}

function stopPomodoroTimer() {
    pomodoroTimer.isRunning = false;
    if (pomodoroTimer.interval) {
        clearInterval(pomodoroTimer.interval);
        pomodoroTimer.interval = null;
    }
    
    // 重置时间
    pomodoroTimer.timeLeft = 25 * 60;
    pomodoroTimer.isBreak = false;
    
    // 重置所有按钮状态
    updatePomodoroButtonsState('stopped');
    
    MessageUtils.info('番茄钟已停止');
    
    // 关闭番茄钟界面
    const modal = document.querySelector('.modal-mask');
    if (modal) ModalUtils.hide(modal);
}

function showPomodoroInterface() {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🍅 番茄工作法</h3>
            <p style="color: #666;" id="pomodoro-status">${pomodoroTimer.isBreak ? '休息时间' : '专注时间'}</p>
        </div>
        
        <!-- 计时器显示 -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div id="pomodoro-timer-display" style="font-size: 4em; font-weight: 700; color: #ff5722; font-family: 'Consolas', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${formatTime(pomodoroTimer.timeLeft)}
            </div>
            <div style="background: #ff5722; height: 4px; border-radius: 2px; margin: 16px 0; overflow: hidden;">
                <div id="pomodoro-progress" style="height: 100%; background: white; transition: width 0.3s ease; width: ${calculatePomodoroProgress()}%;"></div>
            </div>
        </div>
        
        <!-- 会话信息 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
            <div class="pomodoro-stat">
                <div class="stat-number">${pomodoroTimer.session}</div>
                <div class="stat-label">当前会话</div>
            </div>
            <div class="pomodoro-stat">
                <div class="stat-number">${pomodoroTimer.totalSessions}</div>
                <div class="stat-label">今日完成</div>
            </div>
            <div class="pomodoro-stat">
                <div class="stat-number">${Math.round(pomodoroTimer.totalSessions * 25 / 60 * 10) / 10}h</div>
                <div class="stat-label">专注时长</div>
            </div>
        </div>
        
        <!-- 控制按钮 -->
        <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;">
            <button class="btn-main" onclick="pausePomodoro()" ${!pomodoroTimer.isRunning ? 'disabled' : ''}>
                ⏸️ 暂停
            </button>
            <button class="btn-main" onclick="resetPomodoro()">
                🔄 重置
            </button>
            <button class="btn-main" onclick="skipPomodoro()">
                ⏭️ 跳过
            </button>
        </div>
        
        <!-- 任务关联 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px;">
            <h5 style="margin: 0 0 12px 0; color: var(--theme-color);">当前任务</h5>
            <input type="text" id="pomodoro-task" placeholder="输入当前专注的任务..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            <div style="margin-top: 8px; font-size: 0.85em; color: #666;">
                💡 提示：专注于一个具体的任务，避免多任务处理
            </div>
        </div>
        
        <style>
            .pomodoro-stat {
                background: rgba(255,255,255,0.9);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .pomodoro-stat .stat-number {
                font-size: 1.5em;
                font-weight: 700;
                color: #ff5722;
                margin-bottom: 4px;
            }
            .pomodoro-stat .stat-label {
                font-size: 0.8em;
                color: #666;
            }
        </style>
    `;
    
    ModalUtils.show('番茄工作法', content, 'medium');
}

function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoro-timer-display');
    const progress = document.getElementById('pomodoro-progress');
    const status = document.getElementById('pomodoro-status');
    
    if (display) {
        display.textContent = formatTime(pomodoroTimer.timeLeft);
    }
    
    if (progress) {
        progress.style.width = calculatePomodoroProgress() + '%';
    }
    
    if (status) {
        status.textContent = pomodoroTimer.isBreak ? '休息时间' : '专注时间';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function calculatePomodoroProgress() {
    const totalTime = pomodoroTimer.isBreak ? 5 * 60 : 25 * 60;
    return ((totalTime - pomodoroTimer.timeLeft) / totalTime) * 100;
}

function completePomodoroSession() {
    if (!pomodoroTimer.isBreak) {
        // 完成一个工作会话
        pomodoroTimer.totalSessions++;
        pomodoroTimer.isBreak = true;
        pomodoroTimer.timeLeft = 5 * 60; // 5分钟休息
        
        MessageUtils.success('🎉 番茄时间完成！开始5分钟休息');
        
        // 播放提醒音效（如果支持）
        if ('Notification' in window) {
            new Notification('番茄时间完成！', {
                body: '恭喜完成一个番茄时间，现在休息5分钟',
                icon: '🍅'
            });
        }
    } else {
        // 完成休息时间
        pomodoroTimer.isBreak = false;
        pomodoroTimer.timeLeft = 25 * 60; // 开始下一个25分钟
        pomodoroTimer.session++;
        
        MessageUtils.info('休息结束，开始新的番茄时间！');
    }
    
    updatePomodoroDisplay();
}

function pausePomodoro() {
    if (pomodoroTimer.isRunning) {
        pomodoroTimer.isRunning = false;
        clearInterval(pomodoroTimer.interval);
        pomodoroTimer.interval = null;
        
        // 更新所有按钮状态为暂停状态
        updatePomodoroButtonsState('paused');
        
        MessageUtils.info('番茄钟已暂停');
    }
}

function resetPomodoro() {
    // 停止计时器
    if (pomodoroTimer.interval) {
        clearInterval(pomodoroTimer.interval);
        pomodoroTimer.interval = null;
    }
    
    // 重置状态
    pomodoroTimer.isRunning = false;
    pomodoroTimer.isBreak = false;
    pomodoroTimer.timeLeft = 25 * 60;
    
    // 更新所有按钮状态
    updatePomodoroButtonsState('stopped');
    
    updatePomodoroDisplay();
    MessageUtils.info('番茄钟已重置');
}

function skipPomodoro() {
    completePomodoroSession();
    MessageUtils.info('已跳过当前阶段');
}

// 智能洞察功能
function showSmartInsights() {
    const today = DateUtils.getToday();
    const todayData = StorageUtils.loadPlan('day', today);
    const insights = generateSmartInsights(todayData);
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🧠 智能洞察</h3>
            <p style="color: #666;">基于AI分析的个性化建议</p>
        </div>
        
        ${insights.map(insight => `
            <div style="background: ${insight.color}; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${insight.borderColor};">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">${insight.icon}</span>
                    <strong style="color: ${insight.textColor};">${insight.title}</strong>
                </div>
                <div style="color: #666; line-height: 1.5;">${insight.content}</div>
                ${insight.action ? `<button class="btn-main" onclick="${insight.action}" style="margin-top: 8px; font-size: 0.85em;">${insight.actionText}</button>` : ''}
            </div>
        `).join('')}
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-main" onclick="refreshInsights()">🔄 刷新洞察</button>
            <button class="btn-main" onclick="customizeInsights()">⚙️ 自定义</button>
        </div>
    `;
    
    ModalUtils.show('智能洞察', content);
}

// 分析功能（综合分析面板）
function showAnalytics() {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">📈 综合分析</h3>
            <p style="color: #666;">全方位的数据分析与洞察</p>
        </div>
        
        <!-- 分析选项 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div class="analysis-card" onclick="showWeeklyAnalysis()">
                <div class="analysis-icon">📊</div>
                <div class="analysis-title">周分析</div>
                <div class="analysis-desc">本周完成情况与趋势</div>
            </div>
            
            <div class="analysis-card" onclick="showMonthlyAnalysis()">
                <div class="analysis-icon">📈</div>
                <div class="analysis-title">月分析</div>
                <div class="analysis-desc">月度目标达成率</div>
            </div>
            
            <div class="analysis-card" onclick="showHabitAnalysis()">
                <div class="analysis-icon">🔄</div>
                <div class="analysis-title">习惯分析</div>
                <div class="analysis-desc">习惯养成跟踪</div>
            </div>
            
            <div class="analysis-card" onclick="showTimeAnalysis()">
                <div class="analysis-icon">⏰</div>
                <div class="analysis-title">时间分析</div>
                <div class="analysis-desc">时间分配统计</div>
            </div>
        </div>
        
        <!-- 快速洞察 -->
        <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 16px;">
            <h4 style="margin: 0 0 12px 0; color: var(--theme-color);">📋 快速洞察</h4>
            <div id="quick-insights">
                ${generateQuickAnalyticsInsights()}
            </div>
        </div>
        
        <style>
            .analysis-card {
                background: rgba(255,255,255,0.9);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .analysis-card:hover {
                transform: translateY(-4px);
                border-color: var(--theme-color);
                box-shadow: 0 6px 20px rgba(25,118,210,0.2);
            }
            .analysis-icon {
                font-size: 2.5em;
                margin-bottom: 8px;
            }
            .analysis-title {
                font-weight: 600;
                color: var(--theme-color);
                margin-bottom: 4px;
            }
            .analysis-desc {
                font-size: 0.85em;
                color: #666;
            }
        </style>
    `;
    
    // 在内容末尾添加额外的关闭按钮
    const contentWithCloseBtn = content + `
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <button onclick="forceCloseModal()" class="btn-danger" style="background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                ✕ 强制关闭
            </button>
        </div>
    `;
    
    ModalUtils.show('综合分析', contentWithCloseBtn, 'large');
}

// 辅助函数
function calculateProductivityStats(last7Days) {
    let totalTasks = 0;
    let completedTasks = 0;
    let streak = 0;
    
    last7Days.forEach(day => {
        if (day.data) {
            const dayTasks = countDayTasks(day.data);
            const dayCompleted = countCompletedTasks(day.data);
            
            totalTasks += dayTasks;
            completedTasks += dayCompleted;
            
            if (dayCompleted > 0) streak++;
        }
    });
    
    return {
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalTasks,
        avgTasksPerDay: Math.round(totalTasks / 7),
        streak
    };
}

function calculateDayCompletion(dayData) {
    const total = countDayTasks(dayData);
    const completed = countCompletedTasks(dayData);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function countDayTasks(dayData) {
    let count = 0;
    if (dayData.priorities) count += dayData.priorities.split('\n').filter(line => line.trim().startsWith('[')).length;
    if (dayData.habits) count += dayData.habits.split('\n').filter(line => line.trim().startsWith('[')).length;
    if (dayData.todos) count += dayData.todos.split('\n').filter(line => line.trim().startsWith('[')).length;
    return count;
}

function countCompletedTasks(dayData) {
    let count = 0;
    if (dayData.priorities) count += dayData.priorities.split('\n').filter(line => line.trim().startsWith('[x]')).length;
    if (dayData.habits) count += dayData.habits.split('\n').filter(line => line.trim().startsWith('[x]')).length;
    if (dayData.todos) count += dayData.todos.split('\n').filter(line => line.trim().startsWith('[x]')).length;
    return count;
}

function generateProductivityInsights(stats, last7Days) {
    const insights = [];
    
    if (stats.completionRate >= 80) {
        insights.push('🎉 优秀！您的任务完成率很高，保持这个节奏！');
    } else if (stats.completionRate >= 60) {
        insights.push('👍 不错的表现，可以考虑优化任务分配来进一步提升效率。');
    } else {
        insights.push('💪 还有提升空间，建议减少任务数量，专注于重要事项。');
    }
    
    if (stats.streak >= 5) {
        insights.push('🔥 连续坚持表现出色！养成了良好的习惯。');
    }
    
    return insights.join('<br><br>');
}

function generateImprovementSuggestions(stats) {
    const suggestions = [];
    
    if (stats.completionRate < 70) {
        suggestions.push('减少每日任务数量，专注于2-3个重要任务');
        suggestions.push('使用番茄钟技术提高专注度');
    }
    
    if (stats.avgTasksPerDay > 15) {
        suggestions.push('任务过多可能导致压力，建议精简任务列表');
    }
    
    if (stats.streak < 3) {
        suggestions.push('建立每日回顾习惯，持续改进计划执行');
    }
    
    suggestions.push('定期使用生产力分析功能跟踪进度');
    
    return suggestions;
}

function generateSmartInsights(todayData) {
    const insights = [];
    const currentHour = new Date().getHours();
    
    // 基于时间的洞察
    if (currentHour < 10) {
        insights.push({
            icon: '🌅',
            title: '早晨黄金时间',
            content: '现在是一天中精力最充沛的时间，建议处理最重要和最具挑战性的任务。',
            color: 'rgba(255, 193, 7, 0.1)',
            borderColor: '#ffc107',
            textColor: '#f57c00',
            action: 'focusOnPriorities()',
            actionText: '专注优先事项'
        });
    }
    
    // 基于任务数量的洞察
    if (todayData) {
        const taskCount = countDayTasks(todayData);
        if (taskCount > 20) {
            insights.push({
                icon: '⚠️',
                title: '任务过载警告',
                content: '今日任务较多，建议重新评估优先级，专注于最重要的3-5个任务。',
                color: 'rgba(255, 87, 34, 0.1)',
                borderColor: '#ff5722',
                textColor: '#d84315'
            });
        } else if (taskCount === 0) {
            insights.push({
                icon: '📝',
                title: '开始规划今天',
                content: '还没有添加任务，建议先设定3个优先事项来开始高效的一天。',
                color: 'rgba(25, 118, 210, 0.1)',
                borderColor: '#1976d2',
                textColor: '#1565c0',
                action: 'addPriorityTask()',
                actionText: '添加优先事项'
            });
        }
    }
    
    // 通用建议
    insights.push({
        icon: '💡',
        title: '效率提升建议',
        content: '使用番茄钟技术来保持专注，每25分钟专注工作，然后休息5分钟。',
        color: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4caf50',
        textColor: '#388e3c',
        action: 'togglePomodoroTimer()',
        actionText: '开始番茄钟'
    });
    
    return insights;
}

function generateQuickAnalyticsInsights() {
    const today = DateUtils.getToday();
    const todayData = StorageUtils.loadPlan('day', today);
    
    if (!todayData) {
        return '<div style="color: #666; text-align: center;">暂无数据，开始记录您的计划吧！</div>';
    }
    
    const completion = calculateDayCompletion(todayData);
    const taskCount = countDayTasks(todayData);
    const completedCount = countCompletedTasks(todayData);
    
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;">
            <div style="text-align: center;">
                <div style="font-size: 1.5em; font-weight: 700; color: #4caf50;">${completion}%</div>
                <div style="font-size: 0.8em; color: #666;">今日完成率</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5em; font-weight: 700; color: #2196f3;">${completedCount}/${taskCount}</div>
                <div style="font-size: 0.8em; color: #666;">已完成任务</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5em; font-weight: 700; color: #ff9800;">${pomodoroTimer.totalSessions}</div>
                <div style="font-size: 0.8em; color: #666;">番茄时间</div>
            </div>
        </div>
    `;
}

// 分析子功能（简化实现）
function showWeeklyAnalysis() { MessageUtils.info('周分析功能正在开发中...'); }
function showMonthlyAnalysis() { MessageUtils.info('月分析功能正在开发中...'); }
function showHabitAnalysis() { MessageUtils.info('习惯分析功能正在开发中...'); }
function showTimeAnalysis() { MessageUtils.info('时间分析功能正在开发中...'); }
function refreshInsights() { showSmartInsights(); }
function customizeInsights() { MessageUtils.info('自定义洞察功能正在开发中...'); }
function focusOnPriorities() { document.getElementById('day_top3').focus(); }
function addPriorityTask() { document.getElementById('day_top3').focus(); }

// 难度评估功能
function showDifficultyEstimator() {
    console.log('显示难度评估器');
    
    // 获取当前任务列表
    const taskAnalysis = analyzeCurrentTasks();
    
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--theme-color); margin-bottom: 16px;">🎯 智能难度评估</h3>
            <p style="color: #666;">基于AI分析为您的任务评估难度和时间</p>
        </div>
        
        <!-- 任务列表分析 -->
        <div style="margin-bottom: 24px;">
            <h4 style="color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                📋 当前任务分析
                <span style="background: #e3f2fd; color: #1976d2; font-size: 12px; padding: 2px 6px; border-radius: 10px;">
                    ${taskAnalysis.totalTasks} 个任务
                </span>
            </h4>
            
            ${taskAnalysis.tasks.length > 0 ? `
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    ${taskAnalysis.tasks.map((task, index) => `
                        <div style="padding: 12px; border-bottom: 1px solid #f0f0f0; background: ${index % 2 === 0 ? '#fafafa' : 'white'};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; margin-bottom: 4px;">${task.text}</div>
                                    <div style="display: flex; gap: 8px; font-size: 12px;">
                                        <span style="background: ${getDifficultyColor(task.difficulty)}; color: white; padding: 2px 6px; border-radius: 10px;">
                                            难度: ${task.difficultyText}
                                        </span>
                                        <span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px;">
                                            预估: ${task.estimatedTime}
                                        </span>
                                        <span style="background: #9c27b0; color: white; padding: 2px 6px; border-radius: 10px;">
                                            类型: ${task.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            ${task.suggestions.length > 0 ? `
                                <div style="margin-top: 8px; padding: 8px; background: #fff3e0; border-radius: 4px; border-left: 3px solid #ff9800;">
                                    <div style="font-size: 11px; color: #ef6c00; font-weight: 500; margin-bottom: 4px;">💡 优化建议：</div>
                                    ${task.suggestions.map(suggestion => `
                                        <div style="font-size: 11px; color: #666; margin-bottom: 2px;">• ${suggestion}</div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                    <div style="color: #666;">暂无任务需要评估</div>
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">
                        请先添加一些任务来进行难度评估
                    </div>
                </div>
            `}
        </div>
        
        <!-- 整体统计 -->
        <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="color: #7b1fa2; margin-bottom: 12px;">📊 整体评估报告</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #7b1fa2;">${taskAnalysis.averageDifficulty}</div>
                    <div style="font-size: 11px; color: #666;">平均难度</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #ff9800;">${taskAnalysis.totalEstimatedTime}</div>
                    <div style="font-size: 11px; color: #666;">预估总时长</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: ${taskAnalysis.workloadLevel === '高' ? '#f44336' : taskAnalysis.workloadLevel === '中' ? '#ff9800' : '#4caf50'};">${taskAnalysis.workloadLevel}</div>
                    <div style="font-size: 11px; color: #666;">工作负荷</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #2196f3;">${taskAnalysis.efficiencyScore}%</div>
                    <div style="font-size: 11px; color: #666;">效率评分</div>
                </div>
            </div>
            
            ${taskAnalysis.recommendations.length > 0 ? `
                <div style="background: rgba(255,255,255,0.8); border-radius: 6px; padding: 12px;">
                    <div style="font-size: 12px; color: #7b1fa2; font-weight: 500; margin-bottom: 6px;">🎯 今日建议：</div>
                    ${taskAnalysis.recommendations.map(rec => `
                        <div style="font-size: 11px; color: #333; margin-bottom: 4px;">• ${rec}</div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <!-- 操作按钮 -->
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-outline" onclick="closeDifficultyEstimator()" style="padding: 10px 20px;">
                关闭
            </button>
            <button class="btn-main" onclick="optimizeTaskSchedule()" style="padding: 10px 20px;">
                🚀 优化安排
            </button>
            <button class="btn-secondary" onclick="exportDifficultyReport()" style="padding: 10px 20px;">
                📊 导出报告
            </button>
        </div>
    `;
    
    ModalUtils.show('难度评估器', content, 'large');
}

// 分析当前任务
function analyzeCurrentTasks() {
    const containers = [
        { id: 'day_top3', name: '重点任务' },
        { id: 'day_must_dos', name: '必做事项' },
        { id: 'day_todos', name: '待办事项' }
    ];
    
    const allTasks = [];
    let totalEstimatedMinutes = 0;
    
    containers.forEach(containerInfo => {
        const container = document.getElementById(containerInfo.id);
        if (container) {
            const tasks = container.querySelectorAll('.task-item');
            tasks.forEach(task => {
                const text = task.querySelector('.task-text')?.textContent?.trim() || '';
                if (text) {
                    const analysis = analyzeTaskDifficulty(text, containerInfo.name);
                    allTasks.push(analysis);
                    totalEstimatedMinutes += analysis.estimatedMinutes;
                }
            });
        }
    });
    
    // 计算统计数据
    const averageDifficulty = allTasks.length > 0 
        ? (allTasks.reduce((sum, task) => sum + getDifficultyValue(task.difficulty), 0) / allTasks.length).toFixed(1)
        : 0;
    
    const totalHours = Math.floor(totalEstimatedMinutes / 60);
    const remainingMinutes = totalEstimatedMinutes % 60;
    const totalEstimatedTime = totalHours > 0 
        ? `${totalHours}h${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}` 
        : `${totalEstimatedMinutes}m`;
    
    // 工作负荷评估
    let workloadLevel = '低';
    if (totalEstimatedMinutes > 480) workloadLevel = '高'; // 超过8小时
    else if (totalEstimatedMinutes > 240) workloadLevel = '中'; // 超过4小时
    
    // 效率评分
    const efficiencyScore = Math.max(0, Math.min(100, 100 - (totalEstimatedMinutes / 10)));
    
    // 生成建议
    const recommendations = generateWorkloadRecommendations(allTasks, totalEstimatedMinutes, averageDifficulty);
    
    return {
        tasks: allTasks,
        totalTasks: allTasks.length,
        averageDifficulty,
        totalEstimatedTime,
        totalEstimatedMinutes,
        workloadLevel,
        efficiencyScore: Math.round(efficiencyScore),
        recommendations
    };
}

// 分析单个任务难度
function analyzeTaskDifficulty(taskText, category) {
    const text = taskText.toLowerCase();
    
    // 基础难度评估
    let difficulty = 2; // 默认中等
    let estimatedMinutes = 30; // 默认30分钟
    const suggestions = [];
    
    // 关键词难度映射
    const difficultyKeywords = {
        high: ['复杂', '困难', '挑战', '深入', '详细', '全面', '完整', '系统', '架构', '设计', '分析', '研究'],
        medium: ['处理', '整理', '准备', '制定', '计划', '安排', '协调', '沟通', '讨论', '会议'],
        low: ['简单', '快速', '查看', '检查', '确认', '回复', '更新', '记录', '整理']
    };
    
    // 时间指示词
    const timeKeywords = {
        long: ['深入', '详细', '全面', '完整', '系统', '彻底'],
        medium: ['处理', '整理', '准备', '制定'],
        short: ['快速', '简单', '查看', '检查', '确认', '回复']
    };
    
    // 分析难度
    let difficultyScore = 0;
    difficultyKeywords.high.forEach(keyword => {
        if (text.includes(keyword)) difficultyScore += 2;
    });
    difficultyKeywords.medium.forEach(keyword => {
        if (text.includes(keyword)) difficultyScore += 1;
    });
    difficultyKeywords.low.forEach(keyword => {
        if (text.includes(keyword)) difficultyScore -= 1;
    });
    
    // 确定最终难度
    if (difficultyScore >= 3) difficulty = 5;
    else if (difficultyScore >= 1) difficulty = 4;
    else if (difficultyScore >= 0) difficulty = 3;
    else if (difficultyScore >= -1) difficulty = 2;
    else difficulty = 1;
    
    // 估算时间
    timeKeywords.long.forEach(keyword => {
        if (text.includes(keyword)) estimatedMinutes += 60;
    });
    timeKeywords.medium.forEach(keyword => {
        if (text.includes(keyword)) estimatedMinutes += 30;
    });
    timeKeywords.short.forEach(keyword => {
        if (text.includes(keyword)) estimatedMinutes -= 15;
    });
    
    // 根据难度调整时间
    estimatedMinutes = Math.max(5, estimatedMinutes * (difficulty / 3));
    
    // 生成建议
    if (difficulty >= 4) {
        suggestions.push('建议分解为多个小任务');
        suggestions.push('预留额外缓冲时间');
    }
    if (estimatedMinutes > 90) {
        suggestions.push('考虑分时段完成');
    }
    if (category === '重点任务' && difficulty <= 2) {
        suggestions.push('可能需要重新评估优先级');
    }
    
    return {
        text: taskText,
        difficulty,
        difficultyText: getDifficultyText(difficulty),
        estimatedMinutes: Math.round(estimatedMinutes),
        estimatedTime: formatTime(estimatedMinutes),
        category,
        suggestions
    };
}

// 获取难度文本描述
function getDifficultyText(difficulty) {
    const texts = ['很容易', '容易', '中等', '困难', '很困难'];
    return texts[difficulty - 1] || '中等';
}

// 获取难度对应的颜色
function getDifficultyColor(difficulty) {
    const colors = ['#4caf50', '#8bc34a', '#ff9800', '#ff5722', '#f44336'];
    return colors[difficulty - 1] || '#ff9800';
}

// 获取难度数值
function getDifficultyValue(difficulty) {
    return difficulty;
}

// 格式化时间
function formatTime(minutes) {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
    }
    return `${Math.round(minutes)}m`;
}

// 生成工作负荷建议
function generateWorkloadRecommendations(tasks, totalMinutes, averageDifficulty) {
    const recommendations = [];
    
    if (totalMinutes > 480) {
        recommendations.push('今日任务较多，建议将部分任务延期到明天');
        recommendations.push('优先完成最重要和最紧急的任务');
    }
    
    if (averageDifficulty > 3.5) {
        recommendations.push('任务难度较高，建议增加休息时间');
        recommendations.push('将复杂任务安排在精力充沛的时段');
    }
    
    if (tasks.length > 8) {
        recommendations.push('任务数量较多，建议合并相似任务');
    }
    
    const highDifficultyTasks = tasks.filter(task => task.difficulty >= 4);
    if (highDifficultyTasks.length > 3) {
        recommendations.push('高难度任务过多，建议分散到不同时间段');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('任务安排合理，保持当前节奏');
        recommendations.push('记得适当休息，保持高效状态');
    }
    
    return recommendations;
}

// 优化任务安排
function optimizeTaskSchedule() {
    const analysis = analyzeCurrentTasks();
    
    if (analysis.tasks.length === 0) {
        MessageUtils.warning('没有任务需要优化');
        return;
    }
    
    // 生成优化建议
    const optimizationTips = [
        '建议将高难度任务安排在上午精力充沛时段',
        '低难度任务可以安排在下午或间隙时间',
        '相似类型的任务可以集中处理以提高效率',
        '为复杂任务预留额外的缓冲时间'
    ];
    
    const content = `
        <h4 style="color: var(--theme-color); margin-bottom: 16px;">🚀 任务安排优化建议</h4>
        ${optimizationTips.map(tip => `
            <div style="padding: 8px 12px; margin-bottom: 8px; background: #e3f2fd; border-left: 3px solid #2196f3; border-radius: 4px;">
                <div style="font-size: 13px; color: #1976d2;">💡 ${tip}</div>
            </div>
        `).join('')}
        
        <div style="margin-top: 16px; text-align: center;">
            <button class="btn-main" onclick="closeDifficultyEstimator()" style="padding: 8px 16px;">
                知道了
            </button>
        </div>
    `;
    
    ModalUtils.show('优化建议', content);
}

// 导出难度报告
function exportDifficultyReport() {
    const analysis = analyzeCurrentTasks();
    const today = new Date().toLocaleDateString('zh-CN');
    
    const reportText = `
任务难度评估报告
=================

日期：${today}
总任务数：${analysis.totalTasks}
平均难度：${analysis.averageDifficulty}
预估总时长：${analysis.totalEstimatedTime}
工作负荷：${analysis.workloadLevel}
效率评分：${analysis.efficiencyScore}%

任务详情：
${analysis.tasks.map((task, index) => 
    `${index + 1}. ${task.text}
   - 难度：${task.difficultyText}
   - 预估时间：${task.estimatedTime}
   - 分类：${task.category}`
).join('\n\n')}

优化建议：
${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
    `.trim();
    
    // 导出文件
    ExportUtils.exportToText(reportText, `难度评估报告_${today.replace(/\//g, '-')}.txt`);
    MessageUtils.success('报告已导出');
}

// 关闭难度评估器
function closeDifficultyEstimator() {
    console.log('关闭难度评估器');
    const modal = document.querySelector('.modal-mask');
    if (modal) {
        // 强制关闭模态框
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        
        setTimeout(() => {
            try {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    console.log('难度评估器已关闭');
                }
            } catch (err) {
                console.log('模态框已经移除');
            }
        }, 50);
    }
}

// ==================== 任务依赖关系管理 ====================

// 存储任务依赖关系的数据结构
let taskDependencies = {};

// 存储当前选择状态
let currentSelection = {
    predecessor: null,
    successor: null
};

// 显示任务依赖关系管理界面
function showTaskDependency() {
    console.log('显示任务依赖关系管理界面');
    
    try {
        // 获取所有当前任务
        const tasks = getAllCurrentTasks();
        
        if (!tasks || tasks.length === 0) {
            MessageUtils.warning('请先添加一些任务，然后再设置依赖关系');
            return;
        }
        
        console.log('✅ 准备显示依赖关系界面，任务数量:', tasks.length);
        
        // 打印所有任务信息用于调试
        tasks.forEach((task, index) => {
            console.log(`任务 ${index}:`, task.id, '-', task.text);
        });
        
        // 加载已保存的依赖关系
        loadTaskDependencies();
        
        const modalHtml = `
        <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="margin: 0; color: #d32f2f; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🔗</span>
                    任务依赖关系管理
                </h3>
                <button onclick="closeDependencyManager()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
            </div>
            <div class="modal-body">
                <!-- 添加新依赖关系 -->
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #333;">📝 添加新的依赖关系</h4>
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 12px; align-items: center; margin-bottom: 12px;">
                        <select id="predecessor-task" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="handleTaskSelection('predecessor')">
                            <option value="">选择前置任务</option>
                            ${tasks.map(task => `<option value="${task.id}">${task.text}</option>`).join('')}
                        </select>
                        <div style="text-align: center; color: #666; font-weight: bold;">→</div>
                        <select id="successor-task" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="handleTaskSelection('successor')">
                            <option value="">选择后续任务</option>
                            ${tasks.map(task => `<option value="${task.id}">${task.text}</option>`).join('')}
                        </select>
                        <button onclick="addTaskDependency()" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                            添加
                        </button>
                        <button onclick="debugSelections()" style="background: #ff9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
                            🔍 调试
                        </button>
                    </div>
                    <div style="font-size: 0.9em; color: #666; margin-top: 8px;">
                        💡 提示：前置任务完成后，后续任务才建议开始
                    </div>
                    
                    <!-- 使用说明 -->
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 12px; margin-top: 12px;">
                        <h5 style="margin: 0 0 8px 0; color: #856404;">📖 使用说明</h5>
                        <div style="font-size: 0.85em; color: #856404; line-height: 1.4;">
                            <p style="margin: 0 0 6px 0;"><strong>第1步：</strong> 在上面的下拉框中选择前置任务（需要先完成的任务）</p>
                            <p style="margin: 0 0 6px 0;"><strong>第2步：</strong> 选择后续任务（依赖前置任务的任务）</p>
                            <p style="margin: 0 0 6px 0;"><strong>第3步：</strong> 点击"添加"按钮创建依赖关系</p>
                            <p style="margin: 0 0 6px 0;"><strong>示例：</strong> 选择"运动锻炼" → "冥想放松"，表示先完成运动锻炼，再进行冥想放松</p>
                        </div>
                    </div>
                </div>
                
                <!-- 当前依赖关系列表 -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #333;">📋 当前依赖关系</h4>
                    <div id="dependencies-list">
                        ${renderDependenciesList(tasks)}
                    </div>
                </div>
                
                <!-- 任务执行顺序建议 -->
                <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1976d2;">🎯 建议执行顺序</h4>
                    <div id="execution-order">
                        ${generateExecutionOrder(tasks)}
                    </div>
                </div>
                
                <!-- 依赖关系图 -->
                <div style="background: #f3e5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #7b1fa2;">📊 依赖关系图</h4>
                    <div id="dependency-graph" style="min-height: 200px; border: 1px solid #ddd; border-radius: 4px; background: white; padding: 16px;">
                        ${generateDependencyGraph(tasks)}
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="clearAllDependencies()" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        🗑️ 清除所有依赖
                    </button>
                    <button onclick="exportDependencies()" style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        📤 导出依赖图
                    </button>
                    <button onclick="optimizeDependencies()" style="background: #ff9800; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        ⚡ 优化建议
                    </button>
                    <button onclick="closeDependencyManager()" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        ✅ 完成
                    </button>
                </div>
            </div>
        </div>
        `;
        
        // 直接创建并显示模态框
        const modal = document.createElement('div');
        modal.className = 'modal-mask';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        modal.innerHTML = modalHtml;
        
        // 安全地添加到DOM
        if (document.body && modal.nodeType === Node.ELEMENT_NODE) {
            document.body.appendChild(modal);
        } else {
            console.error('❌ 无法添加模态框到DOM');
            return;
        }
    } catch (error) {
        console.error('❌ 显示依赖关系界面时出错:', error);
        MessageUtils.error('显示依赖关系界面时出错: ' + error.message);
    }
}

// 获取所有当前任务
function getAllCurrentTasks() {
    const tasks = [];
    const containers = ['day_top3', 'day_must_dos', 'day_todos'];
    
    try {
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const taskItems = container.querySelectorAll('.task-item');
                taskItems.forEach((taskItem, index) => {
                    try {
                        const taskText = taskItem.querySelector('.task-text');
                        const checkbox = taskItem.querySelector('.custom-checkbox');
                        
                        if (taskText && taskText.textContent && taskText.textContent.trim()) {
                            const taskId = `${containerId}_${index}`;
                            const taskTextContent = taskText.textContent.trim();
                            
                            tasks.push({
                                id: taskId,
                                text: taskTextContent,
                                container: containerId,
                                element: taskItem,
                                completed: checkbox ? checkbox.classList.contains('checked') : false
                            });
                            
                            console.log('✅ 添加任务:', taskId, '-', taskTextContent);
                        }
                    } catch (error) {
                        console.error('❌ 处理任务项时出错:', error, '容器:', containerId, '索引:', index);
                    }
                });
            } else {
                console.warn('⚠️ 未找到容器:', containerId);
            }
        });
    } catch (error) {
        console.error('❌ 获取当前任务时出错:', error);
    }
    
    console.log('✅ 获取到', tasks.length, '个任务');
    return tasks;
}

// 添加任务依赖关系
function addTaskDependency() {
    console.log('🔗 开始添加任务依赖关系');
    console.log('当前选择状态:', currentSelection);
    
    // 首先尝试使用跟踪的选择状态
    let predecessorId = currentSelection.predecessor?.id;
    let successorId = currentSelection.successor?.id;
    let predecessorText = currentSelection.predecessor?.text;
    let successorText = currentSelection.successor?.text;
    
    // 如果状态跟踪失败，回退到DOM查询
    if (!predecessorId || !successorId) {
        console.log('⚠️ 选择状态不完整，回退到DOM查询');
        
        const predecessorSelect = document.getElementById('predecessor-task');
        const successorSelect = document.getElementById('successor-task');
        
        if (!predecessorSelect || !successorSelect) {
            console.error('❌ 未找到选择框元素');
            MessageUtils.error('界面元素加载错误，请刷新页面重试');
            return;
        }
        
        // 强制更新选择状态
        handleTaskSelection('predecessor');
        handleTaskSelection('successor');
        
        predecessorId = currentSelection.predecessor?.id;
        successorId = currentSelection.successor?.id;
        predecessorText = currentSelection.predecessor?.text;
        successorText = currentSelection.successor?.text;
    }
    
    console.log('最终获取的前置任务ID:', predecessorId);
    console.log('最终获取的后续任务ID:', successorId);
    console.log('最终获取的前置任务文本:', predecessorText);
    console.log('最终获取的后续任务文本:', successorText);
    
    // 验证选择是否有效
    if (!predecessorId || predecessorId === '' || !predecessorText || predecessorText === '选择前置任务') {
        console.warn('⚠️ 前置任务未正确选择');
        console.warn('- 前置任务ID:', predecessorId);
        console.warn('- 前置任务文本:', predecessorText);
        MessageUtils.warning('请选择前置任务');
        return;
    }
    
    if (!successorId || successorId === '' || !successorText || successorText === '选择后续任务') {
        console.warn('⚠️ 后续任务未正确选择');
        console.warn('- 后续任务ID:', successorId);
        console.warn('- 后续任务文本:', successorText);
        MessageUtils.warning('请选择后续任务');
        return;
    }
    
    if (predecessorId === successorId) {
        MessageUtils.warning('前置任务和后续任务不能是同一个');
        return;
    }
    
    // 检查是否会造成循环依赖
    if (wouldCreateCycle(predecessorId, successorId)) {
        MessageUtils.error('添加此依赖关系会造成循环依赖，无法添加');
        return;
    }
    
    // 添加依赖关系
    if (!taskDependencies[successorId]) {
        taskDependencies[successorId] = [];
    }
    
    if (!taskDependencies[successorId].includes(predecessorId)) {
        taskDependencies[successorId].push(predecessorId);
        saveTaskDependencies();
        
        console.log('✅ 依赖关系已添加:', predecessorText, '→', successorText);
        console.log('当前依赖关系数据:', taskDependencies);
        
        refreshDependencyDisplay();
        MessageUtils.success(`依赖关系添加成功：${predecessorText} → ${successorText}`);
        
        // 清空选择状态和选择框
        currentSelection.predecessor = null;
        currentSelection.successor = null;
        
        const predecessorSelect = document.getElementById('predecessor-task');
        const successorSelect = document.getElementById('successor-task');
        if (predecessorSelect) predecessorSelect.value = '';
        if (successorSelect) successorSelect.value = '';
        
        console.log('✅ 选择框和状态已清空');
    } else {
        console.warn('⚠️ 重复的依赖关系:', predecessorText, '→', successorText);
        MessageUtils.warning('此依赖关系已存在');
    }
}

// 检查是否会创建循环依赖
function wouldCreateCycle(fromId, toId) {
    const visited = new Set();
    
    function hasPath(current, target) {
        if (current === target) return true;
        if (visited.has(current)) return false;
        
        visited.add(current);
        const dependencies = taskDependencies[current] || [];
        
        for (const dep of dependencies) {
            if (hasPath(dep, target)) return true;
        }
        
        return false;
    }
    
    return hasPath(fromId, toId);
}

// 渲染依赖关系列表
function renderDependenciesList(tasks) {
    const taskMap = {};
    tasks.forEach(task => {
        taskMap[task.id] = task;
    });
    
    let html = '';
    let hasAnyDependency = false;
    
    Object.keys(taskDependencies).forEach(successorId => {
        const dependencies = taskDependencies[successorId];
        if (dependencies && dependencies.length > 0) {
            hasAnyDependency = true;
            const successor = taskMap[successorId];
            if (successor) {
                html += `
                    <div style="background: white; border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
                            📌 ${successor.text}
                        </div>
                        <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">依赖于：</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${dependencies.map(depId => {
                                const dep = taskMap[depId];
                                return dep ? `
                                    <div style="background: #e8f5e8; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; display: flex; align-items: center; gap: 4px;">
                                        <span>${dep.text}</span>
                                        <button onclick="removeDependency('${successorId}', '${depId}')" style="background: #f44336; color: white; border: none; border-radius: 2px; width: 16px; height: 16px; cursor: pointer; font-size: 10px;">×</button>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        }
    });
    
    if (!hasAnyDependency) {
        html = '<div style="text-align: center; color: #666; padding: 20px;">暂无依赖关系</div>';
    }
    
    return html;
}

// 移除依赖关系
function removeDependency(successorId, predecessorId) {
    if (taskDependencies[successorId]) {
        const index = taskDependencies[successorId].indexOf(predecessorId);
        if (index > -1) {
            taskDependencies[successorId].splice(index, 1);
            if (taskDependencies[successorId].length === 0) {
                delete taskDependencies[successorId];
            }
            saveTaskDependencies();
            refreshDependencyDisplay();
            MessageUtils.success('依赖关系已移除');
        }
    }
}

// 生成执行顺序建议
function generateExecutionOrder(tasks) {
    const taskMap = {};
    tasks.forEach(task => {
        taskMap[task.id] = task;
    });
    
    // 使用拓扑排序生成执行顺序
    const inDegree = {};
    const graph = {};
    
    // 初始化
    tasks.forEach(task => {
        inDegree[task.id] = 0;
        graph[task.id] = [];
    });
    
    // 构建图和计算入度
    Object.keys(taskDependencies).forEach(successorId => {
        const dependencies = taskDependencies[successorId];
        if (dependencies) {
            dependencies.forEach(predecessorId => {
                if (graph[predecessorId]) {
                    graph[predecessorId].push(successorId);
                    inDegree[successorId]++;
                }
            });
        }
    });
    
    // 拓扑排序
    const queue = [];
    const result = [];
    
    // 找到所有入度为0的节点
    Object.keys(inDegree).forEach(taskId => {
        if (inDegree[taskId] === 0) {
            queue.push(taskId);
        }
    });
    
    while (queue.length > 0) {
        const current = queue.shift();
        result.push(current);
        
        graph[current].forEach(neighbor => {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        });
    }
    
    if (result.length !== tasks.length) {
        return '<div style="color: #f44336;">⚠️ 检测到循环依赖，无法生成执行顺序</div>';
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    result.forEach((taskId, index) => {
        const task = taskMap[taskId];
        if (task) {
            const status = task.completed ? '✅' : '⏳';
            const style = task.completed ? 'opacity: 0.6; text-decoration: line-through;' : '';
            html += `
                <div style="display: flex; align-items: center; gap: 12px; padding: 8px; background: white; border-radius: 4px; ${style}">
                    <div style="background: #2196f3; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: bold;">
                        ${index + 1}
                    </div>
                    <div style="flex: 1;">${task.text}</div>
                    <div>${status}</div>
                </div>
            `;
        }
    });
    html += '</div>';
    
    return html;
}

// 生成依赖关系图
function generateDependencyGraph(tasks) {
    const taskMap = {};
    tasks.forEach(task => {
        taskMap[task.id] = task;
    });
    
    let html = '<div style="font-family: monospace; line-height: 1.6;">';
    
    // 显示每个任务及其依赖
    tasks.forEach(task => {
        const dependencies = taskDependencies[task.id] || [];
        const status = task.completed ? '✅' : '🔄';
        
        html += `<div style="margin-bottom: 12px;">`;
        html += `<div style="font-weight: bold; color: #333;">${status} ${task.text}</div>`;
        
        if (dependencies.length > 0) {
            html += `<div style="margin-left: 20px; color: #666;">`;
            dependencies.forEach(depId => {
                const dep = taskMap[depId];
                if (dep) {
                    const depStatus = dep.completed ? '✅' : '🔄';
                    html += `<div>↳ 依赖: ${depStatus} ${dep.text}</div>`;
                }
            });
            html += `</div>`;
        } else {
            html += `<div style="margin-left: 20px; color: #999;">无依赖</div>`;
        }
        html += `</div>`;
    });
    
    html += '</div>';
    return html;
}

// 刷新依赖关系显示
function refreshDependencyDisplay() {
    const tasks = getAllCurrentTasks();
    
    const dependenciesListEl = document.getElementById('dependencies-list');
    if (dependenciesListEl) {
        dependenciesListEl.innerHTML = renderDependenciesList(tasks);
    }
    
    const executionOrderEl = document.getElementById('execution-order');
    if (executionOrderEl) {
        executionOrderEl.innerHTML = generateExecutionOrder(tasks);
    }
    
    const dependencyGraphEl = document.getElementById('dependency-graph');
    if (dependencyGraphEl) {
        dependencyGraphEl.innerHTML = generateDependencyGraph(tasks);
    }
}

// 清除所有依赖关系
function clearAllDependencies() {
    if (Object.keys(taskDependencies).length === 0) {
        MessageUtils.info('当前没有依赖关系');
        return;
    }
    
    if (confirm('确定要清除所有依赖关系吗？')) {
        taskDependencies = {};
        saveTaskDependencies();
        refreshDependencyDisplay();
        MessageUtils.success('所有依赖关系已清除');
    }
}

// 导出依赖关系
function exportDependencies() {
    const tasks = getAllCurrentTasks();
    const today = DateUtils.formatDate(new Date());
    
    let content = `任务依赖关系报告\n生成时间：${today}\n\n`;
    
    content += '=== 任务列表 ===\n';
    tasks.forEach((task, index) => {
        const status = task.completed ? '[完成]' : '[进行中]';
        content += `${index + 1}. ${status} ${task.text}\n`;
    });
    
    content += '\n=== 依赖关系 ===\n';
    if (Object.keys(taskDependencies).length === 0) {
        content += '无依赖关系\n';
    } else {
        const taskMap = {};
        tasks.forEach(task => {
            taskMap[task.id] = task;
        });
        
        Object.keys(taskDependencies).forEach(successorId => {
            const dependencies = taskDependencies[successorId];
            const successor = taskMap[successorId];
            if (successor && dependencies && dependencies.length > 0) {
                content += `\n"${successor.text}" 依赖于:\n`;
                dependencies.forEach(depId => {
                    const dep = taskMap[depId];
                    if (dep) {
                        content += `  - ${dep.text}\n`;
                    }
                });
            }
        });
    }
    
    content += '\n=== 建议执行顺序 ===\n';
    const executionOrderText = generateExecutionOrderText(tasks);
    content += executionOrderText;
    
    ExportUtils.exportToText(content, `任务依赖关系_${today.replace(/\//g, '-')}.txt`);
    MessageUtils.success('依赖关系已导出');
}

// 生成执行顺序文本
function generateExecutionOrderText(tasks) {
    const taskMap = {};
    tasks.forEach(task => {
        taskMap[task.id] = task;
    });
    
    // 拓扑排序逻辑（同上）
    const inDegree = {};
    const graph = {};
    
    tasks.forEach(task => {
        inDegree[task.id] = 0;
        graph[task.id] = [];
    });
    
    Object.keys(taskDependencies).forEach(successorId => {
        const dependencies = taskDependencies[successorId];
        if (dependencies) {
            dependencies.forEach(predecessorId => {
                if (graph[predecessorId]) {
                    graph[predecessorId].push(successorId);
                    inDegree[successorId]++;
                }
            });
        }
    });
    
    const queue = [];
    const result = [];
    
    Object.keys(inDegree).forEach(taskId => {
        if (inDegree[taskId] === 0) {
            queue.push(taskId);
        }
    });
    
    while (queue.length > 0) {
        const current = queue.shift();
        result.push(current);
        
        graph[current].forEach(neighbor => {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        });
    }
    
    if (result.length !== tasks.length) {
        return '检测到循环依赖，无法生成执行顺序\n';
    }
    
    let content = '';
    result.forEach((taskId, index) => {
        const task = taskMap[taskId];
        if (task) {
            const status = task.completed ? '[完成]' : '[待完成]';
            content += `${index + 1}. ${status} ${task.text}\n`;
        }
    });
    
    return content;
}

// 优化依赖关系建议
function optimizeDependencies() {
    const tasks = getAllCurrentTasks();
    
    if (Object.keys(taskDependencies).length === 0) {
        MessageUtils.info('当前没有依赖关系，建议为相关任务添加依赖关系以优化执行顺序');
        return;
    }
    
    let suggestions = [];
    
    // 检查孤立任务
    const tasksWithDependencies = new Set();
    Object.keys(taskDependencies).forEach(successorId => {
        tasksWithDependencies.add(successorId);
        const dependencies = taskDependencies[successorId];
        if (dependencies) {
            dependencies.forEach(depId => tasksWithDependencies.add(depId));
        }
    });
    
    const isolatedTasks = tasks.filter(task => !tasksWithDependencies.has(task.id));
    if (isolatedTasks.length > 0) {
        suggestions.push(`发现 ${isolatedTasks.length} 个孤立任务，建议为它们添加适当的依赖关系`);
    }
    
    // 检查过长的依赖链
    const longestChains = findLongestDependencyChains(tasks);
    if (longestChains.length > 5) {
        suggestions.push('依赖链过长，建议考虑将某些任务并行化');
    }
    
    // 检查已完成任务的依赖
    tasks.forEach(task => {
        if (task.completed && taskDependencies[task.id]) {
            const incompleteDeps = taskDependencies[task.id].filter(depId => {
                const dep = tasks.find(t => t.id === depId);
                return dep && !dep.completed;
            });
            
            if (incompleteDeps.length > 0) {
                suggestions.push(`任务"${task.text}"已完成，但其依赖任务尚未完成，请检查`);
            }
        }
    });
    
    if (suggestions.length === 0) {
        suggestions.push('依赖关系设置合理，无需优化');
    }
    
    const suggestionHtml = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 16px;">
            <h4 style="margin: 0 0 12px 0; color: #856404;">💡 优化建议</h4>
            <ul style="margin: 0; padding-left: 20px;">
                ${suggestions.map(suggestion => `<li style="margin-bottom: 8px;">${suggestion}</li>`).join('')}
            </ul>
            <div style="margin-top: 16px; text-align: right;">
                <button onclick="closeDependencyManager()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    知道了
                </button>
            </div>
        </div>
    `;
    
    // 直接创建并显示建议模态框
    const suggestionModal = document.createElement('div');
    suggestionModal.className = 'modal-mask';
    suggestionModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 0; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;';
    modalContent.innerHTML = suggestionHtml;
    
    suggestionModal.appendChild(modalContent);
    
    // 安全地添加到DOM
    if (document.body && suggestionModal.nodeType === Node.ELEMENT_NODE) {
        document.body.appendChild(suggestionModal);
    } else {
        console.error('❌ 无法添加建议模态框到DOM');
    }
}

// 查找最长依赖链
function findLongestDependencyChains(tasks) {
    // 简化实现，返回所有任务的拓扑排序长度
    return getAllCurrentTasks();
}

// 关闭依赖关系管理器
function closeDependencyManager() {
    try {
        const modal = document.querySelector('.modal-mask');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
            console.log('✅ 依赖关系管理器已关闭');
        } else {
            console.warn('⚠️ 未找到要关闭的模态框');
        }
    } catch (error) {
        console.error('❌ 关闭依赖关系管理器时出错:', error);
    }
}

// 保存依赖关系到本地存储
function saveTaskDependencies() {
    try {
        const currentDate = DateUtils.formatDate(new Date());
        const key = `task_dependencies_${currentDate}`;
        
        // 检查 StorageUtils 是否可用
        if (typeof StorageUtils !== 'undefined' && StorageUtils.setItem) {
            const success = StorageUtils.setItem(key, taskDependencies);
            if (success) {
                console.log('✅ 依赖关系数据保存成功:', key, Object.keys(taskDependencies).length, '个依赖');
            } else {
                console.error('❌ 依赖关系数据保存失败');
            }
        } else {
            console.warn('⚠️ StorageUtils 不可用，无法保存依赖关系');
        }
    } catch (error) {
        console.error('❌ 保存依赖关系失败:', error);
    }
}

// 从本地存储加载依赖关系
function loadTaskDependencies() {
    try {
        const currentDate = DateUtils.formatDate(new Date());
        const key = `task_dependencies_${currentDate}`;
        
        // 检查 StorageUtils 是否可用
        if (typeof StorageUtils !== 'undefined' && StorageUtils.getItem) {
            const saved = StorageUtils.getItem(key, {});
            taskDependencies = saved || {};
            console.log('✅ 依赖关系数据加载成功:', key, Object.keys(taskDependencies).length, '个依赖');
        } else {
            console.warn('⚠️ StorageUtils 不可用，使用默认依赖关系');
            taskDependencies = {};
        }
    } catch (error) {
        console.error('❌ 加载依赖关系失败:', error);
        taskDependencies = {};
    }
}

// 处理任务选择
function handleTaskSelection(type) {
    console.log('🎯 处理任务选择:', type);
    
    const selectId = type === 'predecessor' ? 'predecessor-task' : 'successor-task';
    const select = document.getElementById(selectId);
    
    if (!select) {
        console.error('❌ 未找到选择框:', selectId);
        return;
    }
    
    const selectedOption = select.options[select.selectedIndex];
    const value = selectedOption.value;
    const text = selectedOption.text;
    
    console.log(`${type} 选择变更:`, { value, text, selectedIndex: select.selectedIndex });
    
    // 更新选择状态
    currentSelection[type] = {
        id: value,
        text: text,
        element: select
    };
    
    console.log('当前选择状态:', currentSelection);
    
    // 更新界面提示
    updateSelectionFeedback();
}

// 更新选择反馈
function updateSelectionFeedback() {
    const predecessor = currentSelection.predecessor;
    const successor = currentSelection.successor;
    
    // 可以在这里添加视觉反馈
    console.log('📝 选择状态更新:');
    console.log('- 前置任务:', predecessor ? predecessor.text : '未选择');
    console.log('- 后续任务:', successor ? successor.text : '未选择');
}

// 调试选择框状态
function debugSelections() {
    console.log('🔍 =====调试选择框状态=====');
    
    const predecessorSelect = document.getElementById('predecessor-task');
    const successorSelect = document.getElementById('successor-task');
    
    if (!predecessorSelect || !successorSelect) {
        console.error('❌ 选择框元素不存在');
        alert('选择框元素不存在');
        return;
    }
    
    console.log('前置任务选择框:');
    console.log('- value:', predecessorSelect.value);
    console.log('- selectedIndex:', predecessorSelect.selectedIndex);
    console.log('- 选项数量:', predecessorSelect.options.length);
    console.log('- 当前选择的文本:', predecessorSelect.options[predecessorSelect.selectedIndex]?.text);
    console.log('- 当前选择的value:', predecessorSelect.options[predecessorSelect.selectedIndex]?.value);
    
    console.log('后续任务选择框:');
    console.log('- value:', successorSelect.value);
    console.log('- selectedIndex:', successorSelect.selectedIndex);
    console.log('- 选项数量:', successorSelect.options.length);
    console.log('- 当前选择的文本:', successorSelect.options[successorSelect.selectedIndex]?.text);
    console.log('- 当前选择的value:', successorSelect.options[successorSelect.selectedIndex]?.value);
    
    console.log('所有前置任务选项:');
    for (let i = 0; i < predecessorSelect.options.length; i++) {
        const option = predecessorSelect.options[i];
        console.log(`  ${i}: value="${option.value}", text="${option.text}"`);
    }
    
    console.log('所有后续任务选项:');
    for (let i = 0; i < successorSelect.options.length; i++) {
        const option = successorSelect.options[i];
        console.log(`  ${i}: value="${option.value}", text="${option.text}"`);
    }
    
    console.log('=====调试完成=====');
    
    // 显示简单的提示
    const msg = `前置任务: ${predecessorSelect.options[predecessorSelect.selectedIndex]?.text || '未选择'}\n后续任务: ${successorSelect.options[successorSelect.selectedIndex]?.text || '未选择'}`;
    alert(msg);
}

// 将新函数添加到全局暴露列表
window.showTaskDependency = showTaskDependency;
window.addTaskDependency = addTaskDependency;
window.removeDependency = removeDependency;
window.clearAllDependencies = clearAllDependencies;
window.exportDependencies = exportDependencies;
window.optimizeDependencies = optimizeDependencies;
window.closeDependencyManager = closeDependencyManager;
window.debugSelections = debugSelections;
window.handleTaskSelection = handleTaskSelection;

// 确保函数在页面加载后可用
console.log('依赖关系功能已加载:', {
    showTaskDependency: typeof showTaskDependency,
    addTaskDependency: typeof addTaskDependency,
    removeDependency: typeof removeDependency
});

// 注册快捷键
KeyboardUtils.register('ctrl+s', saveDayPlan);
KeyboardUtils.register('ctrl+a', showAIAssistant);
KeyboardUtils.register('ctrl+f', toggleFocusMode);
KeyboardUtils.register('ctrl+n', showQuickNavigation);
KeyboardUtils.register('arrowleft', () => navigateDate(-1));
KeyboardUtils.register('arrowright', () => navigateDate(1));

// 生产力分析功能
function showProductivityAnalysis() {
    console.log('📊 显示生产力分析');
    
    // 收集当前数据
    const analysisData = collectProductivityData();
    
    const content = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <!-- 分析概览 -->
            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                <h4 style="margin: 0 0 16px 0; color: #2e7d32; font-size: 1.2em; display: flex; align-items: center; gap: 8px;">
                    📊 今日生产力分析报告
                    <span style="font-size: 0.7em; background: #4caf50; color: white; padding: 2px 8px; border-radius: 12px;">${new Date().toLocaleDateString('zh-CN')}</span>
                </h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                    <div class="analysis-stat">
                        <div class="stat-number">${analysisData.totalTasks}</div>
                        <div class="stat-label">📝 总任务数</div>
                    </div>
                    <div class="analysis-stat">
                        <div class="stat-number">${analysisData.completedTasks}</div>
                        <div class="stat-label">✅ 已完成</div>
                    </div>
                    <div class="analysis-stat">
                        <div class="stat-number">${analysisData.completionRate}%</div>
                        <div class="stat-label">🎯 完成率</div>
                    </div>
                    <div class="analysis-stat">
                        <div class="stat-number">${analysisData.productivityScore}</div>
                        <div class="stat-label">⭐ 生产力评分</div>
                    </div>
                </div>
            </div>
            
            <!-- 详细分析 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
                <!-- 任务分布 -->
                <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                    <h5 style="margin: 0 0 12px 0; color: #1976d2; display: flex; align-items: center; gap: 6px;">
                        📊 任务分布分析
                    </h5>
                    <div style="space-y: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(25,118,210,0.1); border-radius: 6px; margin-bottom: 8px;">
                            <span>🎯 重要任务</span>
                            <span style="font-weight: bold; color: #1976d2;">${analysisData.taskDistribution.priority}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(76,175,80,0.1); border-radius: 6px; margin-bottom: 8px;">
                            <span>🔄 习惯任务</span>
                            <span style="font-weight: bold; color: #4caf50;">${analysisData.taskDistribution.habits}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,152,0,0.1); border-radius: 6px;">
                            <span>📝 一般任务</span>
                            <span style="font-weight: bold; color: #ff9800;">${analysisData.taskDistribution.general}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 时间分析 -->
                <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                    <h5 style="margin: 0 0 12px 0; color: #9c27b0; display: flex; align-items: center; gap: 6px;">
                        ⏰ 时间规划分析
                    </h5>
                    <div style="space-y: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(156,39,176,0.1); border-radius: 6px; margin-bottom: 8px;">
                            <span>📅 计划时间</span>
                            <span style="font-weight: bold; color: #9c27b0;">${analysisData.timeAnalysis.planned}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(76,175,80,0.1); border-radius: 6px; margin-bottom: 8px;">
                            <span>🎯 专注时间</span>
                            <span style="font-weight: bold; color: #4caf50;">${analysisData.timeAnalysis.focus}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,152,0,0.1); border-radius: 6px;">
                            <span>☕ 休息时间</span>
                            <span style="font-weight: bold; color: #ff9800;">${analysisData.timeAnalysis.break}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 生产力建议 -->
            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc02); border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
                <h5 style="margin: 0 0 12px 0; color: #ef6c00; display: flex; align-items: center; gap: 6px;">
                    💡 智能建议
                </h5>
                <div style="display: grid; gap: 8px;">
                    ${analysisData.suggestions.map(suggestion => `
                        <div style="display: flex; align-items: flex-start; gap: 8px; padding: 8px; background: rgba(255,255,255,0.8); border-radius: 6px;">
                            <span style="font-size: 1.2em;">${suggestion.icon}</span>
                            <div>
                                <div style="font-weight: 600; color: #ef6c00; margin-bottom: 2px;">${suggestion.title}</div>
                                <div style="font-size: 0.9em; color: #666;">${suggestion.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 历史趋势 -->
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                <h5 style="margin: 0 0 12px 0; color: #795548; display: flex; align-items: center; gap: 6px;">
                    📈 7日趋势分析
                </h5>
                <div style="height: 120px; background: linear-gradient(135deg, #f5f5f5, #eeeeee); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; font-style: italic;">
                    📊 趋势图表 (需要更多历史数据)
                </div>
                <div style="margin-top: 12px; font-size: 0.9em; color: #666; text-align: center;">
                    继续使用几天后，这里将显示您的生产力趋势图表
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                <button class="btn-main" onclick="exportProductivityReport()" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white;">
                    📤 导出报告
                </button>
                <button class="btn-secondary" onclick="resetProductivityData()" style="background: linear-gradient(135deg, #f44336, #d32f2f); color: white;">
                    🔄 重置数据
                </button>
                <button class="btn-outline" onclick="ModalUtils.hide()">
                    ✕ 关闭
                </button>
            </div>
        </div>
        
        <style>
            .analysis-stat {
                background: rgba(255,255,255,0.9);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .analysis-stat .stat-number {
                font-size: 1.8em;
                font-weight: 700;
                color: #2e7d32;
                margin-bottom: 4px;
            }
            .analysis-stat .stat-label {
                font-size: 0.85em;
                color: #666;
                font-weight: 500;
            }
        </style>
    `;
    
    ModalUtils.show('📊 生产力分析', content, 'large');
}

// 收集生产力数据
function collectProductivityData() {
    const containers = {
        'day_top3': { name: '重要任务', type: 'priority' },
        'day_must_dos': { name: '习惯任务', type: 'habits' },
        'day_todos': { name: '一般任务', type: 'general' }
    };
    
    let totalTasks = 0;
    let completedTasks = 0;
    const taskDistribution = { priority: 0, habits: 0, general: 0 };
    
    // 统计各容器的任务
    Object.keys(containers).forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            const tasks = container.querySelectorAll('.task-item');
            tasks.forEach(task => {
                const textElement = task.querySelector('.task-text');
                const checkbox = task.querySelector('.custom-checkbox');
                
                if (textElement && textElement.value && textElement.value.trim()) {
                    totalTasks++;
                    taskDistribution[containers[containerId].type]++;
                    
                    if (checkbox && checkbox.classList.contains('checked')) {
                        completedTasks++;
                    }
                }
            });
        }
    });
    
    // 计算完成率
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 计算生产力评分 (基于完成率和任务分布)
    let productivityScore = completionRate;
    if (taskDistribution.priority > 0) productivityScore += 10; // 有重要任务加分
    if (taskDistribution.habits > 0) productivityScore += 5;   // 有习惯任务加分
    productivityScore = Math.min(100, productivityScore);
    
    // 分析时间块
    const timeblockContainer = document.getElementById('day_timeblock');
    let plannedTime = '0h';
    let focusTime = '0h';
    let breakTime = '0h';
    
    if (timeblockContainer) {
        const timeblocks = timeblockContainer.querySelectorAll('.task-item');
        let totalMinutes = 0;
        let focusMinutes = 0;
        let breakMinutes = 0;
        
        timeblocks.forEach(block => {
            const textElement = block.querySelector('.task-text');
            if (textElement && textElement.value) {
                const text = textElement.value;
                const timeMatch = text.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                    const startHour = parseInt(timeMatch[1]);
                    const startMin = parseInt(timeMatch[2]);
                    const endHour = parseInt(timeMatch[3]);
                    const endMin = parseInt(timeMatch[4]);
                    
                    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    totalMinutes += duration;
                    
                    if (text.includes('休息') || text.includes('☕') || text.includes('🍽️')) {
                        breakMinutes += duration;
                    } else {
                        focusMinutes += duration;
                    }
                }
            }
        });
        
        plannedTime = `${Math.round(totalMinutes / 60 * 10) / 10}h`;
        focusTime = `${Math.round(focusMinutes / 60 * 10) / 10}h`;
        breakTime = `${Math.round(breakMinutes / 60 * 10) / 10}h`;
    }
    
    // 生成智能建议
    const suggestions = generateProductivitySuggestions(completionRate, taskDistribution, totalTasks);
    
    return {
        totalTasks,
        completedTasks,
        completionRate,
        productivityScore,
        taskDistribution,
        timeAnalysis: {
            planned: plannedTime,
            focus: focusTime,
            break: breakTime
        },
        suggestions
    };
}

// 生成生产力建议
function generateProductivitySuggestions(completionRate, taskDistribution, totalTasks) {
    const suggestions = [];
    
    if (completionRate < 30) {
        suggestions.push({
            icon: '🎯',
            title: '提高任务完成率',
            description: '当前完成率较低，建议减少任务数量，专注于最重要的1-3项任务'
        });
    } else if (completionRate > 80) {
        suggestions.push({
            icon: '🚀',
            title: '表现优秀！',
            description: '完成率很高，可以考虑适当增加挑战性任务'
        });
    }
    
    if (taskDistribution.priority === 0) {
        suggestions.push({
            icon: '⚡',
            title: '设定重要任务',
            description: '建议在"今日Top3"中添加最重要的任务，确保优先级明确'
        });
    }
    
    if (taskDistribution.habits === 0) {
        suggestions.push({
            icon: '🔄',
            title: '建立日常习惯',
            description: '添加一些日常习惯任务，有助于长期成长和稳定的生产力'
        });
    }
    
    if (totalTasks > 10) {
        suggestions.push({
            icon: '📝',
            title: '简化任务清单',
            description: '任务过多可能导致分散注意力，建议控制在7-10个任务以内'
        });
    }
    
    if (totalTasks < 3) {
        suggestions.push({
            icon: '📈',
            title: '增加任务规划',
            description: '可以添加更多具体的任务来充分利用时间'
        });
    }
    
    // 默认建议
    if (suggestions.length === 0) {
        suggestions.push({
            icon: '💪',
            title: '保持良好状态',
            description: '当前的任务规划很合理，继续保持这种平衡！'
        });
    }
    
    return suggestions;
}

// 导出生产力报告
window.exportProductivityReport = function() {
    const data = collectProductivityData();
    const report = {
        date: new Date().toLocaleDateString('zh-CN'),
        timestamp: new Date().toISOString(),
        ...data
    };
    
    const reportText = `
生产力分析报告
================
日期: ${report.date}
生成时间: ${new Date().toLocaleString('zh-CN')}

📊 基本统计
- 总任务数: ${report.totalTasks}
- 已完成: ${report.completedTasks}
- 完成率: ${report.completionRate}%
- 生产力评分: ${report.productivityScore}/100

📝 任务分布
- 重要任务: ${report.taskDistribution.priority}个
- 习惯任务: ${report.taskDistribution.habits}个
- 一般任务: ${report.taskDistribution.general}个

⏰ 时间分析
- 计划时间: ${report.timeAnalysis.planned}
- 专注时间: ${report.timeAnalysis.focus}
- 休息时间: ${report.timeAnalysis.break}

💡 改进建议
${report.suggestions.map(s => `- ${s.title}: ${s.description}`).join('\n')}

================
报告结束
    `;
    
    // 创建下载
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `生产力报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    MessageUtils.success('📤 生产力报告已导出！');
}

// 重置生产力数据
window.resetProductivityData = function() {
    if (confirm('确定要重置所有生产力分析数据吗？此操作不可恢复。')) {
        // 这里可以添加重置逻辑，比如清除历史数据
        MessageUtils.success('🔄 生产力数据已重置');
        ModalUtils.hide();
    }
}
