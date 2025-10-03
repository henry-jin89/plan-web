/**
 * 按钮功能诊断脚本
 * 用于检测所有按钮的状态和事件绑定情况
 */

(function() {
    'use strict';
    
    console.log('🔍 [诊断] 按钮功能诊断脚本已加载');
    
    // 等待DOM完全加载
    function runDiagnostics() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [诊断] 开始按钮功能全面诊断');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 定义需要检查的按钮
        const buttonsToCheck = [
            { id: 'quick-nav-btn', name: '快速导航', type: 'id' },
            { id: 'focus-mode-btn', name: '专注模式', type: 'id' },
            { id: 'energy-tracker-btn', name: '能量跟踪', type: 'id' },
            { id: 'smart-insights-btn', name: '智能洞察', type: 'id' },
            { id: 'productivity-analytics-btn', name: '生产力分析', type: 'id' },
            { id: 'priority-timer-btn', name: '番茄钟', type: 'id' },
            { id: 'ai-suggest-priorities-btn', name: 'AI建议', type: 'id' },
            { class: 'quick-insert', name: '快捷插入', type: 'class' },
            { class: 'save-btn', name: '保存计划', type: 'class' }
        ];
        
        console.log('📊 [诊断] 检查按钮元素：\n');
        
        buttonsToCheck.forEach((btn, index) => {
            const elements = btn.type === 'id' 
                ? [document.getElementById(btn.id)]
                : Array.from(document.querySelectorAll(`.${btn.class}`));
            
            if (btn.type === 'id') {
                const element = elements[0];
                if (element) {
                    console.log(`✅ ${index + 1}. ${btn.name} (${btn.id})`);
                    console.log(`   - 可见: ${element.offsetParent !== null ? '是' : '否'}`);
                    console.log(`   - 位置: x=${element.offsetLeft}, y=${element.offsetTop}`);
                    console.log(`   - onclick属性: ${element.getAttribute('onclick') || '无'}`);
                    
                    // 检查是否有事件监听器（间接方式）
                    const hasClickHandler = element.onclick !== null;
                    console.log(`   - 直接onclick: ${hasClickHandler ? '有' : '无'}`);
                } else {
                    console.log(`❌ ${index + 1}. ${btn.name} (${btn.id}) - 未找到！`);
                }
            } else {
                console.log(`📌 ${index + 1}. ${btn.name} (class: ${btn.class})`);
                console.log(`   - 找到数量: ${elements.length}`);
                elements.forEach((el, idx) => {
                    if (el) {
                        const target = el.getAttribute('data-target');
                        console.log(`     ${idx + 1}. 目标: ${target || '无'}, 可见: ${el.offsetParent !== null ? '是' : '否'}`);
                    }
                });
            }
        });
        
        // 检查全局函数
        console.log('\n📊 [诊断] 检查全局函数：\n');
        
        const functionsToCheck = [
            'startAIAnalysis',
            'showQuickNavigation',
            'toggleFocusMode',
            'showEnergyTracker',
            'handleSmartInsights',
            'handleProductivityAnalysis',
            'saveDayPlan',
            'showQuickInsertMenu'
        ];
        
        functionsToCheck.forEach((funcName, index) => {
            const funcType = typeof window[funcName];
            if (funcType === 'function') {
                console.log(`✅ ${index + 1}. ${funcName}: 已定义`);
            } else {
                console.log(`❌ ${index + 1}. ${funcName}: 未定义 (类型: ${funcType})`);
            }
        });
        
        // 检查重要对象
        console.log('\n📊 [诊断] 检查重要对象：\n');
        
        const objectsToCheck = [
            { name: 'geminiAssistant', desc: 'Gemini AI 助手' },
            { name: 'ModalUtils', desc: '模态框工具' },
            { name: 'DateUtils', desc: '日期工具' }
        ];
        
        objectsToCheck.forEach((obj, index) => {
            const objType = typeof window[obj.name];
            if (objType === 'object' || objType === 'function') {
                console.log(`✅ ${index + 1}. ${obj.desc} (${obj.name}): 已加载 (${objType})`);
            } else {
                console.log(`❌ ${index + 1}. ${obj.desc} (${obj.name}): 未加载 (类型: ${objType})`);
            }
        });
        
        // 检查脚本加载情况
        console.log('\n📊 [诊断] 检查脚本文件：\n');
        
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const importantScripts = [
            'day_plan.js',
            'gemini-ai-assistant.js',
            'ai-fix-universal.js',
            'common.js',
            'config.js'
        ];
        
        importantScripts.forEach((scriptName, index) => {
            const found = scripts.find(s => s.src.includes(scriptName));
            if (found) {
                console.log(`✅ ${index + 1}. ${scriptName}: 已加载`);
                console.log(`   - 路径: ${found.src}`);
            } else {
                console.log(`❌ ${index + 1}. ${scriptName}: 未找到`);
            }
        });
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [诊断] 诊断完成！');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 提供快速测试函数
        console.log('💡 [诊断] 可用的测试命令：');
        console.log('  - testButton("按钮ID") // 测试指定按钮');
        console.log('  - testAllButtons() // 模拟点击所有按钮');
        console.log('  - showDiagnosticReport() // 显示完整诊断报告\n');
    }
    
    // 测试单个按钮
    window.testButton = function(buttonId) {
        console.log(`\n🧪 [测试] 测试按钮: ${buttonId}`);
        const btn = document.getElementById(buttonId);
        
        if (!btn) {
            console.error(`❌ 按钮未找到: ${buttonId}`);
            return;
        }
        
        console.log('✅ 按钮找到，尝试点击...');
        
        // 尝试多种点击方式
        try {
            // 方式1: 直接调用onclick
            if (btn.onclick) {
                console.log('📌 方式1: 调用 onclick 属性');
                btn.onclick();
                console.log('✅ onclick 调用成功');
                return;
            }
            
            // 方式2: 触发click事件
            console.log('📌 方式2: 触发 click 事件');
            btn.click();
            console.log('✅ click 事件触发成功');
        } catch (error) {
            console.error('❌ 点击测试失败:', error);
        }
    };
    
    // 测试所有按钮
    window.testAllButtons = function() {
        console.log('\n🧪 [测试] 开始测试所有按钮...\n');
        
        const buttons = [
            'quick-nav-btn',
            'focus-mode-btn',
            'energy-tracker-btn',
            'smart-insights-btn'
        ];
        
        buttons.forEach((btnId, index) => {
            setTimeout(() => {
                console.log(`\n${index + 1}/${buttons.length} 测试: ${btnId}`);
                testButton(btnId);
            }, index * 100);
        });
    };
    
    // 显示诊断报告
    window.showDiagnosticReport = function() {
        runDiagnostics();
    };
    
    // 在DOM加载完成后自动运行诊断
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDiagnostics);
    } else {
        // DOM已经加载完成，延迟一点执行以确保其他脚本也加载完毕
        setTimeout(runDiagnostics, 500);
    }
    
    console.log('✅ [诊断] 按钮诊断工具已准备就绪');
})();

