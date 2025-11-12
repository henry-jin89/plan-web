/**
 * 计划表系统 - 通用JavaScript文件
 * 包含所有页面共享的函数和工具
 */

// 全局变量
let currentPlanType = 'day';
let planData = {};

// 页面初始化管理器
const pageInit = {
    tasks: [],
    completed: [],
    
    addTask: function(name, func) {
        this.tasks.push({ name, func });
    },
    
    runAll: function() {
        this.tasks.forEach(task => {
            try {
                task.func();
                this.completed.push(task.name);
            } catch (error) {
                console.error(`初始化任务失败: ${task.name}`, error);
            }
        });
    }
};

// 本地存储工具函数
const StorageUtils = {
    /**
     * 保存计划数据到localStorage
     * @param {string} type - 计划类型 (day, week, month, etc.)
     * @param {string} date - 日期键
     * @param {object} data - 计划数据
     */
    savePlan: function(type, date, data) {
        try {
            const storageKey = `planData_${type}`;
            let allPlans = JSON.parse(localStorage.getItem(storageKey) || '{}');
            allPlans[date] = {
                ...data,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(allPlans));
            
            // 保存到历史记录
            this.saveToHistory(type, date, data);
            
            console.log(`✅ ${type}计划已保存:`, date);
            return true;
        } catch (error) {
            console.error(`❌ 保存${type}计划失败:`, error);
            return false;
        }
    },

    /**
     * 从localStorage加载计划数据
     * @param {string} type - 计划类型
     * @param {string} date - 日期键
     * @returns {object|null} 计划数据
     */
    loadPlan: function(type, date) {
        try {
            const storageKey = `planData_${type}`;
            const allPlans = JSON.parse(localStorage.getItem(storageKey) || '{}');
            return allPlans[date] || null;
        } catch (error) {
            console.error(`❌ 加载${type}计划失败:`, error);
            return null;
        }
    },

    /**
     * 通用存储方法 - 保存任意数据到localStorage
     * @param {string} key - 存储键
     * @param {any} value - 要保存的值
     */
    setItem: function(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error('❌ 保存数据失败:', key, error);
            return false;
        }
    },

    /**
     * 通用获取方法 - 从localStorage获取数据
     * @param {string} key - 存储键
     * @param {any} defaultValue - 默认值
     * @returns {any} 获取的数据或默认值
     */
    getItem: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error('❌ 获取数据失败:', key, error);
            return defaultValue;
        }
    },

    /**
     * 删除存储的数据
     * @param {string} key - 存储键
     */
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('❌ 删除数据失败:', key, error);
            return false;
        }
    },

    /**
     * 获取所有计划数据
     * @param {string} type - 计划类型
     * @returns {object} 所有计划数据
     */
    getAllPlans: function(type) {
        try {
            const storageKey = `planData_${type}`;
            return JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch (error) {
            console.error(`❌ 获取所有${type}计划失败:`, error);
            return {};
        }
    },

    /**
     * 保存到历史记录
     * @param {string} type - 计划类型
     * @param {string} date - 日期键
     * @param {object} data - 计划数据
     */
    saveToHistory: function(type, date, data) {
        try {
            const historyKey = `planHistory_${type}`;
            let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            const historyEntry = {
                date: date,
                timestamp: new Date().toISOString(),
                summary: this.generateSummary(data),
                data: JSON.parse(JSON.stringify(data)) // 深拷贝
            };
            
            history.unshift(historyEntry);
            
            // 只保留最近50条记录
            if (history.length > 50) {
                history = history.slice(0, 50);
            }
            
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    },

    /**
     * 获取历史记录
     * @param {string} type - 计划类型
     * @returns {array} 历史记录数组
     */
    getHistory: function(type) {
        try {
            const historyKey = `planHistory_${type}`;
            return JSON.parse(localStorage.getItem(historyKey) || '[]');
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    },

    /**
     * 生成计划摘要
     * @param {object} data - 计划数据
     * @returns {string} 摘要文本
     */
    generateSummary: function(data) {
        const summaryParts = [];
        
        if (data.goals && data.goals.trim()) {
            summaryParts.push(`目标: ${data.goals.slice(0, 30)}...`);
        }
        
        if (data.priorities && data.priorities.trim()) {
            summaryParts.push(`优先级: ${data.priorities.slice(0, 30)}...`);
        }
        
        if (data.todos && data.todos.trim()) {
            const todoCount = (data.todos.match(/\[.\]/g) || []).length;
            summaryParts.push(`待办事项: ${todoCount}项`);
        }
        
        return summaryParts.join(' | ') || '空白计划';
    },

    /**
     * 删除历史记录
     * @param {string} type - 计划类型
     * @param {number} index - 记录索引
     */
    deleteHistory: function(type, index) {
        try {
            const historyKey = `planHistory_${type}`;
            let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            history.splice(index, 1);
            localStorage.setItem(historyKey, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('删除历史记录失败:', error);
            return false;
        }
    },

    /**
     * 清空所有数据
     * @param {string} type - 计划类型
     */
    clearAll: function(type) {
        try {
            localStorage.removeItem(`planData_${type}`);
            localStorage.removeItem(`planHistory_${type}`);
            console.log(`✅ 已清空所有${type}计划数据`);
            return true;
        } catch (error) {
            console.error(`❌ 清空${type}计划数据失败:`, error);
            return false;
        }
    }
};

// 日期处理工具函数
const DateUtils = {
    /**
     * 格式化日期为YYYY-MM-DD格式
     * @param {Date} date - 日期对象
     * @returns {string} 格式化的日期字符串
     */
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 获取今天的日期字符串
     * @returns {string} 今天的日期 (YYYY-MM-DD)
     */
    getToday: function() {
        return this.formatDate(new Date());
    },

    /**
     * 获取星期几的中文名称
     * @param {Date} date - 日期对象
     * @returns {string} 星期几
     */
    getWeekdayName: function(date) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
    },

    /**
     * 获取月份的中文名称
     * @param {Date} date - 日期对象
     * @returns {string} 月份名称
     */
    getMonthName: function(date) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    },

    /**
     * 获取季度信息
     * @param {Date} date - 日期对象
     * @returns {object} 季度信息
     */
    getQuarterInfo: function(date) {
        const month = date.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const year = date.getFullYear();
        
        return {
            year: year,
            quarter: quarter,
            name: `${year}年第${quarter}季度`,
            startMonth: (quarter - 1) * 3 + 1,
            endMonth: quarter * 3
        };
    },

    /**
     * 解析日期字符串
     * @param {string} dateStr - 日期字符串
     * @returns {Date} 日期对象
     */
    parseDate: function(dateStr) {
        return new Date(dateStr);
    },

    /**
     * 获取日期范围内的所有日期
     * @param {Date} startDate - 开始日期
     * @param {Date} endDate - 结束日期
     * @returns {Array} 日期数组
     */
    getDateRange: function(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }
};

// 待办事项功能
const TodoUtils = {
    /**
     * 在指定容器中启用待办事项功能
     * @param {HTMLElement} container - 容器元素
     */
    enableTodoFunctionality: function(container) {
        if (!container) return;

        // 为容器添加contenteditable属性
        container.contentEditable = true;
        
        // 监听输入事件 - 简化处理
        container.addEventListener('input', (e) => {
            // 如果是任务文本输入，不做任何处理
            if (e.target.classList && e.target.classList.contains('task-text')) {
                return;
            }
            
            // 对于容器直接输入，延迟处理
            clearTimeout(container.inputDelay);
            container.inputDelay = setTimeout(() => {
                this.delayedProcessInput(container);
            }, 1500); // 增加到1.5秒延迟
        });

        // 监听回车键
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // 如果是Shift+Enter，允许换行
                if (e.shiftKey) {
                    return; // 允许默认的换行行为
                }
                
                // 普通回车键处理
                e.preventDefault();
                console.log('回车键被按下，目标元素:', e.target);
                
                // 清除输入延迟
                clearTimeout(container.inputDelay);
                
                // 直接添加新的待办事项，保留用户输入
                this.addNewTodoItemSimple(container);
            }
        });

        // 监听失去焦点事件
        container.addEventListener('blur', (e) => {
            // 清除所有延迟
            clearTimeout(container.inputDelay);
            clearTimeout(this.renderTimer);
            
            // 延迟处理，确保焦点真正离开
            setTimeout(() => {
                // 再次检查焦点是否真的离开了容器
                const currentActive = document.activeElement;
                if (!container.contains(currentActive)) {
                    this.processContainerInput(container);
                    this.updateContainerContent(container);
                }
            }, 300);
        });

        // 监听点击事件（用于复选框）
        container.addEventListener('click', (e) => {
            this.handleTodoClick(e);
        });

        // 初始化现有内容
        this.initExistingTodos(container);
    },

    /**
     * 延迟处理输入（简化版）
     * @param {HTMLElement} container - 容器元素
     */
    delayedProcessInput: function(container) {
        const content = container.textContent;
        if (!content || !content.trim()) return;
        
        console.log('延迟处理输入:', content);
        
        // 检查是否需要转换格式
        const lines = content.split('\n');
        let needsProcessing = false;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.match(/^\[.\]/)) {
                needsProcessing = true;
            }
        });
        
        if (needsProcessing) {
            console.log('需要处理，转换为待办事项格式');
            this.processContainerInput(container);
        } else {
            console.log('内容已是待办事项格式，直接渲染');
            this.renderTodos(container);
        }
    },

    /**
     * 处理待办事项输入
     * @param {Event} e - 输入事件
     * @param {HTMLElement} container - 容器元素
     */
    handleTodoInput: function(e, container) {
        // 如果输入目标是任务文本元素，更新容器内容
        if (e.target.classList && e.target.classList.contains('task-text')) {
            this.updateContainerContent(container);
            return;
        }
        
        // 如果是容器直接输入，处理自动格式化
        if (e.target === container) {
            this.processContainerInput(container);
        }
    },

    /**
     * 处理容器直接输入
     * @param {HTMLElement} container - 容器元素
     */
    processContainerInput: function(container) {
        const content = container.textContent;
        if (!content || !content.trim()) return;
        
        console.log('处理容器输入:', content);
        
        // 分行处理
        const lines = content.split('\n');
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.match(/^\[.\]/)) {
                return `[ ] ${trimmed}`;
            }
            return line;
        });
        
        const newContent = processedLines.join('\n');
        
        // 更新内容
        if (newContent !== content) {
            container.textContent = newContent;
            console.log('内容已转换为:', newContent);
        }
        
        // 立即渲染
        this.renderTodos(container);
    },

    /**
     * 添加新的待办事项（简化版）
     * @param {HTMLElement} container - 容器元素
     */
    addNewTodoItemSimple: function(container) {
        console.log('添加新的待办事项，保留用户输入');
        
        // 获取当前的原始内容（保留用户刚输入的文字）
        const currentContent = container.textContent || '';
        console.log('当前原始内容:', currentContent);
        
        // 如果内容为空，直接添加一个空的待办事项
        if (currentContent.trim() === '') {
            container.textContent = '[ ] ';
            this.renderTodos(container);
            return;
        }
        
        // 处理用户输入的内容
        const lines = currentContent.split('\n');
        const processedLines = [];
        
        // 处理每一行
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed) {
                // 如果不是待办事项格式，转换为待办事项
                if (!trimmed.match(/^\[.\]/)) {
                    processedLines.push(`[ ] ${trimmed}`);
                } else {
                    processedLines.push(line);
                }
            }
        });
        
        // 添加新的空白待办事项
        processedLines.push('[ ] ');
        
        const newContent = processedLines.join('\n');
        console.log('处理后的内容:', newContent);
        
        // 更新容器内容
        container.textContent = newContent;
        
        console.log('开始渲染待办事项');
        
        // 立即渲染
        this.renderTodos(container);
        
        // 延迟聚焦到新创建的任务（最后一个）
        setTimeout(() => {
            const taskItems = container.querySelectorAll('.task-item');
            const lastTask = taskItems[taskItems.length - 1];
            if (lastTask) {
                const taskText = lastTask.querySelector('.task-text');
                if (taskText) {
                    console.log('聚焦到新任务文本');
                    taskText.focus();
                    // 光标设置到开始位置（空白任务）
                    try {
                        const range = document.createRange();
                        const selection = window.getSelection();
                        if (taskText.firstChild) {
                            range.setStart(taskText.firstChild, 0);
                            range.setEnd(taskText.firstChild, 0);
                        } else {
                            range.selectNodeContents(taskText);
                            range.collapse(true);
                        }
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.error('设置新任务光标失败:', e);
                    }
                }
            }
        }, 150);
    },

    /**
     * 从任务中添加新的待办事项
     * @param {HTMLElement} container - 容器元素
     * @param {HTMLElement} currentTaskText - 当前任务文本元素
     */
    addNewTodoItemFromTask: function(container, currentTaskText) {
        console.log('从任务中添加新的待办事项');
        
        // 确保当前任务的内容被保存
        const currentText = currentTaskText.textContent.trim();
        console.log('当前任务内容:', currentText);
        
        // 获取所有任务元素
        const allTasks = container.querySelectorAll('.task-item');
        const currentTask = currentTaskText.closest('.task-item');
        const currentIndex = Array.from(allTasks).indexOf(currentTask);
        
        console.log('当前任务索引:', currentIndex, '总任务数:', allTasks.length);
        
        // 直接收集所有任务的当前状态
        const taskContents = [];
        allTasks.forEach((task, index) => {
            const taskText = task.querySelector('.task-text');
            const checkbox = task.querySelector('.custom-checkbox');
            const isChecked = checkbox && checkbox.classList.contains('checked');
            const text = taskText ? taskText.textContent.trim() : '';
            
            console.log(`任务 ${index}:`, text, isChecked ? '[完成]' : '[未完成]');
            
            if (text) {
                const prefix = isChecked ? '[x]' : '[ ]';
                taskContents.push(`${prefix} ${text}`);
            } else {
                // 即使没有文字，也保留空的任务位置
                taskContents.push('[ ] ');
            }
        });
        
        // 在当前任务后插入新的空白任务
        if (currentIndex >= 0 && currentIndex < taskContents.length) {
            taskContents.splice(currentIndex + 1, 0, '[ ] ');
            console.log('在索引', currentIndex + 1, '插入新任务');
        } else {
            // 如果索引有问题，就添加到末尾
            taskContents.push('[ ] ');
            console.log('添加到末尾');
        }
        
        const newContent = taskContents.join('\n');
        console.log('新的容器内容:', newContent);
        
        // 清空容器并重新设置内容
        container.innerHTML = '';
        container.textContent = newContent;
        
        // 渲染
        this.renderTodos(container);
        
        // 聚焦到新创建的任务
        setTimeout(() => {
            const updatedTasks = container.querySelectorAll('.task-item');
            const targetIndex = currentIndex >= 0 ? currentIndex + 1 : updatedTasks.length - 1;
            const newTask = updatedTasks[targetIndex];
            
            console.log('尝试聚焦到任务', targetIndex, '总任务数:', updatedTasks.length);
            
            if (newTask) {
                const newTaskText = newTask.querySelector('.task-text');
                if (newTaskText) {
                    console.log('聚焦到新创建的任务');
                    newTaskText.focus();
                    // 设置光标到开始位置
                    try {
                        const range = document.createRange();
                        const selection = window.getSelection();
                        if (newTaskText.firstChild) {
                            range.setStart(newTaskText.firstChild, 0);
                            range.setEnd(newTaskText.firstChild, 0);
                        } else {
                            range.selectNodeContents(newTaskText);
                            range.collapse(true);
                        }
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.error('设置新任务光标失败:', e);
                    }
                }
            } else {
                console.error('找不到新创建的任务');
            }
        }, 200);
    },

    /**
     * 添加新的待办事项（原版本保留）
     * @param {HTMLElement} container - 容器元素
     */
    addNewTodoItem: function(container) {
        const content = container.textContent;
        const newContent = content.endsWith('\n') ? content + '[ ] ' : content + '\n[ ] ';
        container.textContent = newContent;
        this.setCursorToEnd(container);
        this.renderTodos(container);
    },

    /**
     * 在当前任务后添加新的待办事项
     * @param {HTMLElement} taskTextElement - 任务文本元素
     */
    addNewTodoItemAfterCurrent: function(taskTextElement) {
        const container = taskTextElement.closest('.todo-list-container');
        if (!container) return;

        // 更新容器内容以包含当前所有任务的最新状态
        this.updateContainerContent(container);
        
        // 获取当前任务在容器中的位置
        const taskItem = taskTextElement.closest('.task-item');
        const allTaskItems = Array.from(container.querySelectorAll('.task-item'));
        const currentIndex = allTaskItems.indexOf(taskItem);
        
        if (currentIndex === -1) return;
        
        // 获取容器的所有行
        const content = container.textContent;
        const lines = content.split('\n');
        const todoLines = lines.filter(line => line.trim() && line.match(/^\[.\]/));
        
        // 在当前任务后插入新的待办事项
        todoLines.splice(currentIndex + 1, 0, '[ ] ');
        
        // 更新容器内容
        container.textContent = todoLines.join('\n');
        this.renderTodos(container);
        
        // 尝试聚焦到新添加的任务
        setTimeout(() => {
            const newTaskItems = container.querySelectorAll('.task-item');
            if (newTaskItems[currentIndex + 1]) {
                const newTaskText = newTaskItems[currentIndex + 1].querySelector('.task-text');
                if (newTaskText) {
                    newTaskText.focus();
                }
            }
        }, 50);
    },

    /**
     * 处理待办事项点击
     * @param {Event} e - 点击事件
     */
    handleTodoClick: function(e) {
        console.log('点击事件:', e.target, e.target.classList);
        
        if (e.target.classList.contains('custom-checkbox')) {
            console.log('点击了复选框');
            e.preventDefault();
            e.stopPropagation();
            this.toggleTodoItem(e.target);
        } else if (e.target.classList.contains('task-delete-btn')) {
            console.log('点击了删除按钮');
            e.preventDefault();
            e.stopPropagation();
            this.deleteTodoItem(e.target);
        } else {
            console.log('点击了其他元素:', e.target.className);
        }
    },

    /**
     * 切换待办事项状态
     * @param {HTMLElement} checkbox - 复选框元素
     */
    toggleTodoItem: function(checkbox) {
        console.log('切换待办事项状态');
        const taskItem = checkbox.closest('.task-item');
        const taskText = taskItem.querySelector('.task-text');
        const container = taskItem.closest('.todo-list-container');
        
        const isChecked = checkbox.classList.contains('checked');
        console.log('当前状态:', isChecked ? '已完成' : '未完成');
        
        if (isChecked) {
            // 取消完成状态
            checkbox.classList.remove('checked');
            checkbox.style.backgroundColor = 'transparent';
            checkbox.style.borderColor = '#ddd';
            checkbox.innerHTML = '';
            
            taskText.style.textDecoration = 'none';
            taskText.style.opacity = '1';
            console.log('设置为未完成状态');
        } else {
            // 设置为完成状态
            checkbox.classList.add('checked');
            checkbox.style.backgroundColor = '#4caf50';
            checkbox.style.borderColor = '#4caf50';
            checkbox.innerHTML = '✓';
            checkbox.style.color = 'white';
            checkbox.style.fontSize = '12px';
            checkbox.style.fontWeight = 'bold';
            
            taskText.style.textDecoration = 'line-through';
            taskText.style.opacity = '0.6';
            console.log('设置为完成状态');
        }
        
        // 更新容器内容
        this.updateContainerContent(container);
        
        // 触发自动草稿保存
        if (typeof window.saveDraft === 'function') {
            window.saveDraft();
        }
        
        console.log('状态切换完成');
    },

    /**
     * 删除待办事项
     * @param {HTMLElement} deleteBtn - 删除按钮
     */
    deleteTodoItem: function(deleteBtn) {
        const taskItem = deleteBtn.closest('.task-item');
        const container = taskItem.closest('.todo-list-container');
        const taskText = taskItem.querySelector('.task-text').textContent;
        
        // 添加删除确认（可选，对于快速操作可能过于繁琐）
        // const confirmed = confirm(`确定要删除任务 "${taskText}" 吗？`);
        // if (!confirmed) return;
        
        console.log(`🗑️ 删除任务: "${taskText}"`);
        
        // 添加删除动画
        taskItem.style.transition = 'all 0.3s ease';
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-20px)';
        
        // 延迟删除以显示动画
        setTimeout(() => {
            taskItem.remove();
            this.updateContainerContent(container);
            
            console.log('✅ 任务删除完成，容器内容已更新');
            
            // 触发自动草稿保存
            if (typeof window.saveDraft === 'function') {
                window.saveDraft();
            }
            
            // 显示删除成功提示
            if (typeof MessageUtils !== 'undefined' && MessageUtils.success) {
                MessageUtils.success(`已删除任务: ${taskText.length > 20 ? taskText.substring(0, 20) + '...' : taskText}`);
            }
        }, 300);
    },

    /**
     * 渲染待办事项（优化后的渲染策略）
     * @param {HTMLElement} container - 容器元素
     */
    renderTodos: function(container) {
        console.log('开始渲染待办事项，内容:', container.textContent);
        
        // 检查容器是否正在被编辑（但排除刚添加新项目的情况）
        const activeElement = document.activeElement;
        const isTaskBeingEdited = activeElement && 
            activeElement.classList.contains('task-text') && 
            container.contains(activeElement);
        
        // 如果有任务正在被编辑，延迟渲染
        if (isTaskBeingEdited) {
            console.log('任务正在被编辑，延迟渲染');
            clearTimeout(this.renderTimer);
            this.renderTimer = setTimeout(() => {
                this.safeRender(container);
            }, 1000);
            return;
        }
        
        console.log('立即渲染');
        this.safeRender(container);
    },

    /**
     * 安全渲染待办事项
     * @param {HTMLElement} container - 容器元素
     */
    safeRender: function(container) {
        const content = container.textContent;
        if (!content || !content.trim()) return;
        
        const lines = content.split('\n').filter(line => line.trim());
        
        // 找到所有待办事项格式的行（放宽条件）
        const validTodoLines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.match(/^\[.\]/); // 只要以 [.] 开头就认为是有效的
        });
        
        // 如果没有待办事项行，不渲染
        if (validTodoLines.length === 0) {
            return;
        }
        
        // 检查是否已经是正确的DOM结构
        const existingTasks = container.querySelectorAll('.task-item');
        if (existingTasks.length === validTodoLines.length) {
            // 如果任务数量匹配，检查内容是否匹配
            let contentMatches = true;
            existingTasks.forEach((taskItem, index) => {
                const taskText = taskItem.querySelector('.task-text');
                const expectedText = validTodoLines[index].replace(/^\[.\]\s*/, '');
                if (taskText && taskText.textContent !== expectedText) {
                    contentMatches = false;
                }
            });
            
            if (contentMatches) {
                return; // 内容匹配，不需要重新渲染
            }
        }
        
        // 清空并重新渲染
        container.innerHTML = '';
        
        validTodoLines.forEach((line, index) => {
            try {
                const taskItem = this.createTodoElement(line.trim());
                if (taskItem && taskItem.nodeType === Node.ELEMENT_NODE) {
                    container.appendChild(taskItem);
                }
            } catch (error) {
                console.error('❌ 创建待办事项元素时出错:', error, '行内容:', line);
            }
        });
        
        console.log(`✅ 渲染了 ${validTodoLines.length} 个待办事项`);
    },

    /**
     * 创建待办事项DOM元素
     * @param {string} todoText - 待办事项文本
     * @returns {HTMLElement} 待办事项元素
     */
    createTodoElement: function(todoText) {
        const isChecked = todoText.startsWith('[x]') || todoText.startsWith('[X]');
        const text = todoText.replace(/^\[.\]\s*/, '');
        
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        taskContent.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px;
            border-radius: 4px;
            background: white;
            margin-bottom: 4px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s ease;
        `;
        
        // 添加悬停效果
        taskContent.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.borderColor = '#d0d0d0';
        });
        
        taskContent.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
            this.style.borderColor = '#e0e0e0';
        });
        
        const checkbox = document.createElement('div');
        checkbox.className = 'custom-checkbox';
        if (isChecked) checkbox.classList.add('checked');
        
        // 确保复选框有视觉样式
        checkbox.style.cssText = `
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 8px;
            transition: all 0.2s ease;
        `;
        
        // 如果已选中，添加勾选标记
        if (isChecked) {
            checkbox.style.backgroundColor = '#4caf50';
            checkbox.style.borderColor = '#4caf50';
            checkbox.innerHTML = '✓';
            checkbox.style.color = 'white';
            checkbox.style.fontSize = '12px';
            checkbox.style.fontWeight = 'bold';
        }
        
        // 添加悬停效果
        checkbox.addEventListener('mouseenter', function() {
            if (!this.classList.contains('checked')) {
                this.style.borderColor = '#2196f3';
                this.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
            }
        });
        
        checkbox.addEventListener('mouseleave', function() {
            if (!this.classList.contains('checked')) {
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = 'transparent';
            }
        });
        
        const taskTextEl = document.createElement('div');
        taskTextEl.className = 'task-text';
        taskTextEl.contentEditable = true;
        taskTextEl.textContent = text;
        taskTextEl.style.cssText = `
            flex: 1;
            outline: none;
            padding: 4px 8px;
            border-radius: 3px;
            line-height: 1.4;
            min-height: 20px;
            word-wrap: break-word;
            transition: all 0.2s ease;
        `;
        
        // 添加输入事件监听器来触发草稿保存
        taskTextEl.addEventListener('input', function() {
            setTimeout(() => {
                if (typeof window.saveDraft === 'function') {
                    window.saveDraft();
                }
            }, 500); // 延迟500ms避免频繁保存
        });
        
        // 任务文本的键盘事件处理
        taskTextEl.addEventListener('keydown', function(e) {
            console.log(`任务文本键盘输入: ${e.key}`);
            
            if (e.key === 'Enter') {
                // 如果是Shift+Enter，允许在任务内换行
                if (e.shiftKey) {
                    console.log('Shift+Enter: 任务内换行');
                    return; // 允许默认换行
                }
                
                // 普通回车：创建新的待办事项
                e.preventDefault();
                e.stopPropagation();
                console.log('普通回车: 从任务中创建新待办事项');
                
                const container = this.closest('.todo-list-container');
                if (container && window.TodoUtils) {
                    // 保存当前任务的内容
                    const currentText = this.textContent.trim();
                    console.log('当前任务文本:', currentText);
                    
                    // 直接添加新的待办事项（不需要先更新容器）
                    window.TodoUtils.addNewTodoItemFromTask(container, this);
                }
            } else {
                // 其他键盘操作阻止冒泡，但允许默认行为
                e.stopPropagation();
                console.log(`${e.key} - 事件冒泡已阻止，浏览器正常处理编辑`);
            }
        });
        
        // 添加焦点事件处理
        taskTextEl.addEventListener('focus', function() {
            console.log('任务文本获得焦点，可以编辑');
            console.log('contentEditable状态:', this.contentEditable);
            console.log('是否可编辑:', this.isContentEditable);
            
            this.style.outline = '2px solid var(--theme-color)';
            this.style.backgroundColor = 'rgba(25, 118, 210, 0.05)';
            
            // 确保contentEditable属性正确设置
            if (!this.isContentEditable) {
                console.warn('元素不可编辑，重新设置contentEditable');
                this.contentEditable = true;
            }
        });
        
        taskTextEl.addEventListener('blur', function() {
            console.log('任务文本失去焦点');
            this.style.outline = 'none';
            this.style.backgroundColor = 'transparent';
            
            // 更新容器内容
            const container = this.closest('.todo-list-container');
            if (container && window.TodoUtils) {
                window.TodoUtils.updateContainerContent(container);
            }
        });
        
        if (isChecked) {
            taskTextEl.style.textDecoration = 'line-through';
            taskTextEl.style.opacity = '0.6';
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '删除此项';
        deleteBtn.style.cssText = `
            background: transparent;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 18px;
            line-height: 1;
            margin-left: 8px;
            transition: all 0.2s ease;
            opacity: 0.6;
        `;
        
        // 删除按钮悬停效果
        deleteBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#ff5252';
            this.style.color = 'white';
            this.style.opacity = '1';
        });
        
        deleteBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = '#999';
            this.style.opacity = '0.6';
        });
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskTextEl);
        taskContent.appendChild(deleteBtn);
        taskItem.appendChild(taskContent);
        
        return taskItem;
    },

    /**
     * 初始化现有待办事项
     * @param {HTMLElement} container - 容器元素
     */
    initExistingTodos: function(container) {
        const content = container.textContent;
        if (content && content.includes('[')) {
            this.renderTodos(container);
        }
    },

    /**
     * 设置光标到容器末尾
     * @param {HTMLElement} container - 容器元素
     */
    setCursorToEnd: function(container) {
        try {
            container.focus();
            
            const range = document.createRange();
            const selection = window.getSelection();
            
            // 如果容器有文本内容
            if (container.firstChild && container.firstChild.nodeType === Node.TEXT_NODE) {
                const textNode = container.firstChild;
                range.setStart(textNode, textNode.textContent.length);
                range.setEnd(textNode, textNode.textContent.length);
            } else {
                // 如果没有文本节点，创建一个
                const textNode = document.createTextNode('');
                container.appendChild(textNode);
                range.setStart(textNode, 0);
                range.setEnd(textNode, 0);
            }
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            console.log('光标已设置到末尾');
        } catch (e) {
            console.error('设置光标位置失败:', e);
            // 备用方法
            try {
                container.focus();
                if (typeof container.setSelectionRange === 'function') {
                    const len = container.textContent.length;
                    container.setSelectionRange(len, len);
                }
            } catch (e2) {
                console.error('备用光标设置也失败:', e2);
            }
        }
    },

    /**
     * 只更新容器数据，不重新渲染HTML（避免输入时丢失焦点）
     * @param {HTMLElement} container - 容器元素
     */
    updateContainerDataOnly: function(container) {
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
        
        const newContent = lines.join('\n');
        container.setAttribute('data-content', newContent);
        // 注意：这里不设置textContent和不调用renderTodos，保持HTML结构不变
        
        // 触发input事件以保存到localStorage
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        container.dispatchEvent(inputEvent);
    },

    /**
     * 更新容器内容（只保存数据，不重新渲染）
     * @param {HTMLElement} container - 容器元素
     */
    updateContainerContent: function(container) {
        const tasks = container.querySelectorAll('.task-item');
        const lines = [];
        
        tasks.forEach(task => {
            const checkbox = task.querySelector('.custom-checkbox');
            const textEl = task.querySelector('.task-text');
            if (textEl && textEl.textContent.trim()) {
                const text = textEl.textContent.trim();
                const isChecked = checkbox && checkbox.classList.contains('checked');
                lines.push(`[${isChecked ? 'x' : ' '}] ${text}`);
            }
        });
        
        const newContent = lines.join('\n');
        console.log('保存容器内容:', newContent);
        
        // 只保存数据到属性中
        container.setAttribute('data-content', newContent);
        
        // 触发input事件以保存到localStorage
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        container.dispatchEvent(inputEvent);
        
        // 触发进度更新（如果在周计划页面）
        if (typeof updateDailyProgress === 'function') {
            setTimeout(() => {
                updateDailyProgress();
                if (typeof updateWeekProgress === 'function') {
                    updateWeekProgress();
                }
            }, 100);
        }
    }
};

// 消息提示工具
const MessageUtils = {
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, info, warning)
     * @param {number} duration - 显示时长(毫秒)
     */
    show: function(message, type = 'info', duration = 3000) {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast message-${type}`;
        messageEl.textContent = message;
        
        // 设置样式
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px'
        });
        
        // 设置背景色
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 显示动画
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    },
    
    success: function(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error: function(message, duration) {
        this.show(message, 'error', duration);
    },
    
    warning: function(message, duration) {
        this.show(message, 'warning', duration);
    },
    
    info: function(message, duration) {
        this.show(message, 'info', duration);
    }
};

// 模态框工具
const ModalUtils = {
    /**
     * 显示模态框
     * @param {string} title - 标题
     * @param {string|HTMLElement} content - 内容
     * @param {string|Object} sizeOrOptions - 尺寸('large'|'medium'|'small')或选项对象
     */
    show: function(title, content, sizeOrOptions = {}) {
        // 处理第三个参数：可以是字符串(尺寸)或对象(选项)
        let options = {};
        if (typeof sizeOrOptions === 'string') {
            options.size = sizeOrOptions;
        } else {
            options = sizeOrOptions;
        }
        
        const modal = this.create(title, content, options);
        document.body.appendChild(modal);
        
        // 显示动画
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 10);
        
        return modal;
    },

    /**
     * 创建模态框
     * @param {string} title - 标题
     * @param {string|HTMLElement} content - 内容
     * @param {Object} options - 选项
     */
    create: function(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-mask';
        modal.style.display = 'none';
        
        const box = document.createElement('div');
        box.className = 'modal-box';
        
        // 处理尺寸
        if (options.size) {
            box.classList.add(`modal-box-${options.size}`);
        }
        
        const titleEl = document.createElement('h3');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-x';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('type', 'button');
        closeBtn.style.cursor = 'pointer';
        
        // 简单直接的关闭方法
        closeBtn.onmousedown = function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('Force closing modal immediately');
            
            // 立即隐藏
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            
            // 延迟移除以确保隐藏生效
            setTimeout(() => {
                try {
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                        console.log('Modal removed successfully');
                    }
                } catch (err) {
                    console.log('Modal already removed');
                }
            }, 50);
            
            return false;
        };
        
        const contentEl = document.createElement('div');
        contentEl.className = 'modal-content';
        
        if (typeof content === 'string') {
            contentEl.innerHTML = content;
        } else {
            contentEl.appendChild(content);
        }
        
        box.appendChild(closeBtn);
        box.appendChild(titleEl);
        box.appendChild(contentEl);
        
        if (options.buttons) {
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            
            options.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = btn.class || 'btn-main';
                button.textContent = btn.text;
                button.onclick = () => {
                    if (btn.handler) btn.handler();
                    if (btn.close !== false) this.hide(modal);
                };
                buttonGroup.appendChild(button);
            });
            
            box.appendChild(buttonGroup);
        }
        
        modal.appendChild(box);
        
        // 点击背景关闭 - 简化版
        modal.onmousedown = (e) => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('Background clicked, closing modal');
                
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                
                setTimeout(() => {
                    try {
                        if (modal && modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    } catch (err) {
                        console.log('Modal already removed via background');
                    }
                }, 50);
                
                return false;
            }
        };
        
        // 阻止盒子内部点击冒泡，但不阻止关闭按钮
        box.onmousedown = (e) => {
            if (!e.target.classList.contains('modal-close-x')) {
                e.stopPropagation();
            }
        };
        
        // ESC键关闭 - 简化版
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                console.log('ESC key pressed, closing modal');
                
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                
                setTimeout(() => {
                    try {
                        if (modal && modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    } catch (err) {
                        console.log('Modal already removed via ESC');
                    }
                }, 50);
                
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        return modal;
    },

    /**
     * 隐藏模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    hide: function(modal) {
        if (!modal) {
            return; // 不存在，直接返回
        }
        
        // 检查是否已经在关闭过程中
        if (modal.classList.contains('closing')) {
            return;
        }
        
        // 标记为正在关闭
        modal.classList.add('closing');
        modal.style.display = 'none';
        
        // 立即移除
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        console.log('Modal closed successfully');
    }
};

// 进度计算工具
const ProgressUtils = {
    /**
     * 计算日进度
     * @param {Date} date - 当前日期
     * @returns {number} 进度百分比 (0-100)
     */
    calculateDayProgress: function(date = new Date()) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        
        const totalMs = endOfDay - startOfDay;
        const passedMs = now - startOfDay;
        
        return Math.round((passedMs / totalMs) * 100);
    },

    /**
     * 计算周进度
     * @param {Date} date - 当前日期
     * @returns {number} 进度百分比 (0-100)
     */
    calculateWeekProgress: function(date = new Date()) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // 周日作为一周开始
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        const totalMs = endOfWeek - startOfWeek;
        const passedMs = now - startOfWeek;
        
        return Math.round((passedMs / totalMs) * 100);
    },

    /**
     * 计算月进度
     * @param {Date} date - 当前日期
     * @returns {number} 进度百分比 (0-100)
     */
    calculateMonthProgress: function(date = new Date()) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const totalMs = endOfMonth - startOfMonth;
        const passedMs = now - startOfMonth;
        
        return Math.round((passedMs / totalMs) * 100);
    },

    /**
     * 计算年进度
     * @param {Date} date - 当前日期
     * @returns {number} 进度百分比 (0-100)
     */
    calculateYearProgress: function(date = new Date()) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
        
        const totalMs = endOfYear - startOfYear;
        const passedMs = now - startOfYear;
        
        return Math.round((passedMs / totalMs) * 100);
    },

    /**
     * 更新进度条显示
     * @param {string} elementId - 进度条元素ID
     * @param {number} progress - 进度值 (0-100)
     * @param {string} text - 进度文本
     */
    updateProgressBar: function(elementId, progress, text) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        const progressText = document.getElementById(elementId.replace('-inner', '-text'));
        if (progressText && text) {
            progressText.textContent = text;
        }
    }
};

// 导出工具
const ExportUtils = {
    /**
     * 导出为JSON
     * @param {Object} data - 要导出的数据
     * @param {string} filename - 文件名
     */
    exportToJSON: function(data, filename = 'plan_data.json') {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * 导出为文本
     * @param {string} text - 要导出的文本
     * @param {string} filename - 文件名
     */
    exportToText: function(text, filename = 'plan.txt') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        this.downloadBlob(blob, filename);
    },

    /**
     * 下载Blob文件
     * @param {Blob} blob - Blob对象
     * @param {string} filename - 文件名
     */
    downloadBlob: function(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// 快捷键管理
const KeyboardUtils = {
    shortcuts: {},
    
    /**
     * 注册快捷键
     * @param {string} key - 快捷键 (如: 'ctrl+s', 'alt+n')
     * @param {Function} handler - 处理函数
     */
    register: function(key, handler) {
        this.shortcuts[key.toLowerCase()] = handler;
    },

    /**
     * 初始化快捷键监听
     */
    init: function() {
        document.addEventListener('keydown', (e) => {
            // 如果用户正在编辑可编辑元素，不处理快捷键
            if (e.target.contentEditable === 'true' || 
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' ||
                e.target.classList.contains('task-text')) {
                console.log('正在编辑文本，跳过快捷键处理:', e.target);
                return;
            }
            
            const key = this.getKeyString(e);
            const handler = this.shortcuts[key];
            
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        });
    },

    /**
     * 获取按键字符串
     * @param {KeyboardEvent} e - 键盘事件
     * @returns {string} 按键字符串
     */
    getKeyString: function(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        
        const key = e.key.toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            parts.push(key);
        }
        
        return parts.join('+');
    }
};

// AI功能模拟工具
const AIUtils = {
    /**
     * 模拟AI生成建议
     * @param {string} context - 上下文
     * @param {string} type - 建议类型
     * @returns {Array} 建议数组
     */
    generateSuggestions: function(context, type) {
        // 这里是模拟的AI功能，实际项目中应该调用真实的AI API
        const suggestions = {
            daily: [
                '安排30分钟的晨间锻炼',
                '预留1小时处理邮件',
                '设置番茄工作法时间块',
                '安排15分钟的冥想时间',
                '预留时间进行学习和阅读'
            ],
            weekly: [
                '制定本周的重点目标',
                '安排团队会议和一对一',
                '预留时间进行项目规划',
                '安排家庭时间和休闲活动',
                '设置每日复盘时间'
            ],
            monthly: [
                '设定月度OKR目标',
                '规划重要项目里程碑',
                '安排技能提升计划',
                '制定健康和运动计划',
                '安排家庭和朋友聚会'
            ]
        };
        
        return suggestions[type] || suggestions.daily;
    },

    /**
     * 分析文本并生成洞察
     * @param {string} text - 要分析的文本
     * @returns {Object} 分析结果
     */
    analyzeText: function(text) {
        const words = text.split(/\s+/).length;
        const tasks = (text.match(/\[.\]/g) || []).length;
        const completedTasks = (text.match(/\[x\]/gi) || []).length;
        
        return {
            wordCount: words,
            taskCount: tasks,
            completedTasks: completedTasks,
            completionRate: tasks > 0 ? Math.round((completedTasks / tasks) * 100) : 0,
            suggestions: this.generateSuggestions(text, 'daily')
        };
    }
};

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', function() {
    // --- 认证保护（静态站点前端门禁） ---
    try {
        (function() {
            // 允许匿名访问的页面：登录页与若干诊断页（按需调整）
            const publicFiles = [
                'login.html',
                'leancloud-test.html',
                'debug.html',
                'clear-cache.html',
                'sync-test.html',
                'mobile-debug.html'
            ];

            const pathname = window.location.pathname || '';
            // 取出文件名（若路径以 / 结尾，视为 index.html）
            let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            if (!filename) filename = 'index.html';

            // 如果当前页面不是公开页，则检查本地 auth_token
            if (!publicFiles.includes(filename)) {
                try {
                    const token = localStorage.getItem('auth_token');
                    if (!token) {
                        // 跳转到登录页并携带当前页面作为 redirect 参数
                        const redirectTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
                        const loginUrl = window.location.origin + '/plan-web/login.html?redirect=' + redirectTo;
                        console.log('📛 未检测到登录凭证，跳转到登录页：', loginUrl);
                        window.location.replace(loginUrl);
                        return; // 停止后续页面初始化，等待登录后重定向回来
                    } else {
                        console.log('🔒 已检测到 auth_token，允许访问页面');
                    }
                } catch (e) {
                    console.warn('⚠️ 检查 auth_token 时出错，允许继续加载页面（降级安全）', e);
                }
            } else {
                console.log('📢 公开页面，无需登录:', filename);
            }
        })();
    } catch (err) {
        console.warn('⚠️ 认证保护初始化失败:', err);
    }

    // 初始化快捷键
    KeyboardUtils.init();
    
    // 注册通用快捷键
    KeyboardUtils.register('ctrl+s', function() {
        // 触发保存功能
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) saveBtn.click();
    });

    // 运行所有初始化任务
    pageInit.runAll();
    
    console.log('✅ 通用功能初始化完成');
});

// 全局可用的函数别名
window.enableTodoFunctionality = TodoUtils.enableTodoFunctionality.bind(TodoUtils);
window.savePlan = StorageUtils.savePlan.bind(StorageUtils);
window.loadPlan = StorageUtils.loadPlan.bind(StorageUtils);
window.showMessage = MessageUtils.show.bind(MessageUtils);
window.showModal = ModalUtils.show.bind(ModalUtils);

// 在页面右上角显示“个人中心”下拉（显示用户名、登出、切换账号）
(function() {
    function createAuthDropdown() {
        try {
            if (document.getElementById('auth-dropdown-root')) return;

            const user = localStorage.getItem('auth_user');
            if (!user) return; // 未登录则不显示

            const root = document.createElement('div');
            root.id = 'auth-dropdown-root';
            root.style.cssText = 'position:fixed;top:12px;right:12px;z-index:10001;';

            // Inject theme styles for auth dropdown (including mobile optimizations)
            if (!document.getElementById('auth-dropdown-styles')) {
                const style = document.createElement('style');
                style.id = 'auth-dropdown-styles';
                style.textContent = `
                    #auth-dropdown-root { font-family: -apple-system,BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft Yahei", Arial, sans-serif; }
                    #auth-badge-button { background: linear-gradient(135deg, rgba(102,126,234,0.12), rgba(118,75,162,0.06)); border: 1px solid rgba(102,126,234,0.12); }
                    #auth-badge-button:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.12); }
                    #auth-dropdown-menu { min-width: 220px; border: 1px solid rgba(38, 53, 92, 0.06); }
                    #auth-dropdown-menu div, #auth-dropdown-menu button { transition: background 0.15s ease; }
                    #auth-dropdown-menu button { background: transparent; border: none; text-align: left; }
                    #auth-dropdown-menu button:hover { background: rgba(102,126,234,0.06); }
                    #auth-dropdown-menu button.switch { color: #2563eb; font-weight:600; }
                    #auth-dropdown-menu button.logout { color: #b02a2a; font-weight:600; }
                    /* Mobile: make dropdown full width and larger touch targets */
                    @media (max-width: 600px) {
                        #auth-dropdown-root { top: 8px; right: 8px; left: 8px; display:flex; justify-content:flex-end; }
                        #auth-dropdown-menu { position: fixed !important; top: 56px !important; right: 8px !important; left: 8px !important; min-width: auto !important; border-radius: 10px; padding: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.18); }
                        #auth-badge-button { padding: 8px 12px; }
                        #auth-dropdown-menu button { padding: 12px 10px; font-size: 16px; }
                    }
                `;
                document.head.appendChild(style);
            }

            const badge = document.createElement('button');
            badge.id = 'auth-badge-button';
            badge.setAttribute('aria-haspopup', 'true');
            badge.setAttribute('aria-expanded', 'false');
            badge.style.cssText = [
                'display:flex','align-items:center','gap:8px',
                'background:rgba(255,255,255,0.95)','border-radius:20px',
                'padding:6px 10px','box-shadow:0 6px 18px rgba(0,0,0,0.12)',
                'border:1px solid rgba(0,0,0,0.04)','cursor:pointer','font-size:13px'
            ].join(';');

            const avatar = document.createElement('div');
            avatar.textContent = (user[0] || '').toUpperCase();
            avatar.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#eef2ff;color:#3b4db7;display:flex;align-items:center;justify-content:center;font-weight:700;';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = user;
            nameSpan.style.fontWeight = '600';

            const caret = document.createElement('span');
            caret.textContent = '▾';
            caret.style.cssText = 'margin-left:6px;color:#888;font-size:12px';

            badge.appendChild(avatar);
            badge.appendChild(nameSpan);
            badge.appendChild(caret);
            root.appendChild(badge);

            const menu = document.createElement('div');
            menu.id = 'auth-dropdown-menu';
            menu.style.cssText = [
                'position:absolute','top:46px','right:0','min-width:180px',
                'background:#fff','border-radius:8px','box-shadow:0 10px 30px rgba(0,0,0,0.12)',
                'padding:8px','display:none','flex-direction:column','gap:6px','font-size:14px'
            ].join(';');

            const userRow = document.createElement('div');
            userRow.textContent = `用户: ${user}`;
            userRow.style.cssText = 'padding:8px 10px;border-radius:6px;color:#333;font-weight:600;';

            const switchBtn = document.createElement('button');
            switchBtn.textContent = '切换账号';
            switchBtn.style.cssText = 'padding:8px 10px;border-radius:6px;border:none;background:#f5f7ff;color:#2b4db7;cursor:pointer;text-align:left;';
            switchBtn.addEventListener('click', () => {
                try {
                    // 弹出内嵌登录模态，不离开当前页
                    const content = `
                        <div style="display:flex;flex-direction:column;gap:10px;min-width:260px;">
                            <div style="display:flex;flex-direction:column;">
                                <label style="font-weight:600;margin-bottom:6px;">账号</label>
                                <input id="switch-username" type="text" placeholder="请输入账号" style="padding:8px;border:1px solid #e6eefc;border-radius:6px;">
                            </div>
                            <div style="display:flex;flex-direction:column;">
                                <label style="font-weight:600;margin-bottom:6px;">密码</label>
                                <input id="switch-password" type="password" placeholder="请输入密码" style="padding:8px;border:1px solid #e6eefc;border-radius:6px;">
                            </div>
                    <div style="display:flex;gap:12px;align-items:center;">
                                <div style="flex:1">
                                    <div style="display:flex;flex-direction:column;">
                                        <div style="display:flex;gap:8px;margin-bottom:6px;">
                                            <div style="width:36px;height:36px;border-radius:6px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2b4db7;border:1px solid rgba(43,77,183,0.08);" id="switch-display-1">-</div>
                                            <div style="width:36px;height:36px;border-radius:6px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2b4db7;border:1px solid rgba(43,77,183,0.08);" id="switch-display-2">-</div>
                                            <div style="width:36px;height:36px;border-radius:6px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2b4db7;border:1px solid rgba(43,77,183,0.08);" id="switch-display-3">-</div>
                                            <div style="width:36px;height:36px;border-radius:6px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2b4db7;border:1px solid rgba(43,77,183,0.08);" id="switch-display-4">-</div>
                                        </div>
                                        <div style="display:flex;gap:8px;">
                                            <input id="switch-digit-1" type="tel" inputmode="numeric" maxlength="1" style="width:36px;height:36px;text-align:center;border-radius:6px;border:1px solid #e6eefc;">
                                            <input id="switch-digit-2" type="tel" inputmode="numeric" maxlength="1" style="width:36px;height:36px;text-align:center;border-radius:6px;border:1px solid #e6eefc;">
                                            <input id="switch-digit-3" type="tel" inputmode="numeric" maxlength="1" style="width:36px;height:36px;text-align:center;border-radius:6px;border:1px solid #e6eefc;">
                                            <input id="switch-digit-4" type="tel" inputmode="numeric" maxlength="1" style="width:36px;height:36px;text-align:center;border-radius:6px;border:1px solid #e6eefc;">
                                            <button id="switch-send-code-btn" class="btn secondary" type="button" style="padding:8px 10px;border-radius:6px;margin-left:8px;">发送验证码</button>
                                        </div>
                                    </div>
                                    <div id="switch-note" style="color:#666;font-size:13px;margin-top:6px;">点击“发送验证码”生成四位数显示（仅演示）。请在下方分别输入4个数字。</div>
                                </div>
                            </div>
                        </div>
                    `;

                    const modal = ModalUtils.show('切换账号', content, {
                        buttons: [
                            { text: '取消', class: 'btn-main' },
                            { text: '登录并切换', class: 'btn-main', handler: function() {
                                try {
                                    const uEl = document.getElementById('switch-username');
                                    const pEl = document.getElementById('switch-password');
                                    const cEl = document.getElementById('switch-code');
                                    const username = uEl ? uEl.value.trim() : '';
                                    const password = pEl ? pEl.value : '';
                                    const code = cEl ? cEl.value.trim() : '';

                                    if (!username) { MessageUtils.error('请输入账号'); return; }
                                    if (!password) { MessageUtils.error('请输入密码'); return; }
                                    if (!/^[0-9]{4}$/.test(code)) { MessageUtils.error('请输入4位验证码'); return; }

                                    const storedCode = localStorage.getItem('login_demo_code');
                                    const expiry = Number(localStorage.getItem('login_demo_code_expiry') || 0);
                                    if (!storedCode || Date.now() > expiry) { MessageUtils.error('验证码不存在或已过期'); return; }
                                    if (code !== storedCode) { MessageUtils.error('验证码错误'); return; }

                                    // 登录成功：写入 token 和用户
                                    const token = btoa(username + ':' + Date.now());
                                    localStorage.setItem('auth_token', token);
                                    localStorage.setItem('auth_user', username);
                                    // 清理临时验证码
                                    localStorage.removeItem('login_demo_code');
                                    localStorage.removeItem('login_demo_code_expiry');

                                    MessageUtils.success('登录并切换成功');
                                    // 不刷新页面：更新当前下拉与徽章显示
                                    try {
                                        // update nameSpan and avatar if present in scope
                                        if (nameSpan && avatar) {
                                            nameSpan.textContent = username;
                                            avatar.textContent = (username[0] || '').toUpperCase();
                                        } else {
                                            // fallback: try to find existing elements
                                            const ns = document.querySelector('#auth-badge-button span');
                                            const av = document.querySelector('#auth-badge-button div');
                                            if (ns) ns.textContent = username;
                                            if (av) av.textContent = (username[0] || '').toUpperCase();
                                        }
                                    } catch (e) {
                                        console.warn('更新徽章失败:', e);
                                    }

                                    // 关闭模态框并收起菜单
                                    try {
                                        if (typeof ModalUtils !== 'undefined' && modal) {
                                            ModalUtils.hide(modal);
                                        } else if (modal && modal.parentNode) {
                                            modal.parentNode.removeChild(modal);
                                        }
                                    } catch (e) {
                                        console.warn('关闭模态失败:', e);
                                    }
                                } catch (e) {
                                    console.warn('切换登录失败:', e);
                                    MessageUtils.error('登录失败');
                                }
                            } }
                        ]
                    });

                    // 设置发送验证码按钮行为
                    setTimeout(() => {
                        const sendBtn = document.getElementById('switch-send-code-btn');
                        if (sendBtn) {
                            sendBtn.addEventListener('click', () => {
                                const uEl = document.getElementById('switch-username');
                                const username = uEl ? uEl.value.trim() : '';
                                if (!username) { MessageUtils.warning('请输入账号以接收验证码'); return; }
                                const code = String(Math.floor(1000 + Math.random() * 9000));
                                const expiry = Date.now() + 2 * 60 * 1000; // 2分钟
                                try {
                                    localStorage.setItem('login_demo_code', code);
                                    localStorage.setItem('login_demo_code_expiry', String(expiry));
                                } catch (e) { console.warn(e); }
                                // 更新显示区（四个单元格）
                                try {
                                    for (let i=1;i<=4;i++){
                                        const d = document.getElementById('switch-display-'+i);
                                        if (d) d.textContent = code.charAt(i-1);
                                    }
                                    // clear inputs
                                    for (let i=1;i<=4;i++){
                                        const di = document.getElementById('switch-digit-'+i);
                                        if (di) di.value = '';
                                    }
                                    // focus first input
                                    const first = document.getElementById('switch-digit-1');
                                    if (first) first.focus();
                                } catch(e) { console.warn(e); }
                                console.log('【演示】切换账号验证码：', username, code);
                                MessageUtils.success('验证码已发送（演示环境将在控制台显示）');
                            });
                        }

                        // wire up digit inputs to auto-advance/backspace
                        for (let i=1;i<=4;i++){
                            const el = document.getElementById('switch-digit-'+i);
                            if (!el) continue;
                            el.addEventListener('input', function(e){
                                this.value = this.value.replace(/[^0-9]/g,'').slice(-1);
                                if (this.value && i<4) {
                                    const next = document.getElementById('switch-digit-'+(i+1));
                                    if (next) next.focus();
                                }
                            });
                            el.addEventListener('keydown', function(e){
                                if (e.key === 'Backspace' && !this.value && i>1) {
                                    const prev = document.getElementById('switch-digit-'+(i-1));
                                    if (prev) prev.focus();
                                }
                            });
                            // support paste
                            el.addEventListener('paste', function(e){
                                e.preventDefault();
                                const paste = (e.clipboardData||window.clipboardData).getData('text').replace(/\\D/g,'').slice(0,4);
                                for (let j=0;j<paste.length;j++){
                                    const dst = document.getElementById('switch-digit-'+(j+1));
                                    if (dst) dst.value = paste.charAt(j);
                                }
                            });
                        }
                    }, 60);
                } catch (e) {
                    console.warn(e);
                }
            });

            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = '退出登录';
            logoutBtn.style.cssText = 'padding:8px 10px;border-radius:6px;border:none;background:#fff4f4;color:#b02a2a;cursor:pointer;text-align:left;';
            logoutBtn.addEventListener('click', () => {
                try {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                } catch (e) { console.warn(e); }
                const redirect = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
                window.location.replace(window.location.origin + '/plan-web/login.html?redirect=' + redirect);
            });

            menu.appendChild(userRow);
            menu.appendChild(switchBtn);
            menu.appendChild(logoutBtn);
            root.appendChild(menu);
            document.body.appendChild(root);

            // Toggle logic
            function closeMenu() {
                menu.style.display = 'none';
                badge.setAttribute('aria-expanded', 'false');
            }
            function openMenu() {
                menu.style.display = 'flex';
                badge.setAttribute('aria-expanded', 'true');
            }
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menu.style.display === 'flex') closeMenu(); else openMenu();
            });
            // click outside to close
            document.addEventListener('click', (e) => {
                if (!root.contains(e.target)) closeMenu();
            }, { passive: true });
            // Esc to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMenu();
            });
        } catch (e) {
            console.warn('创建个人中心下拉失败:', e);
        }
    }

    document.addEventListener('DOMContentLoaded', createAuthDropdown);
    setTimeout(createAuthDropdown, 800);
})();
