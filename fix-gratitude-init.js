/**
 * 感恩日记初始化修复脚本
 * 专门修复感恩日记的数据初始化和保存问题
 */

class GratitudeInitFixer {
    constructor() {
        this.fixedItems = [];
        this.errors = [];
    }

    /**
     * 修复感恩日记初始化问题
     */
    fixGratitudeInit() {
        try {
            console.log('🔧 开始修复感恩日记初始化问题...');

            // 1. 检查和修复localStorage数据
            this.fixLocalStorageData();

            // 2. 确保全局变量正确初始化
            this.ensureGlobalVariables();

            // 3. 重新初始化感恩日记
            this.reinitializeGratitude();

            // 4. 测试数据保存功能
            this.testDataSaving();

        } catch (error) {
            console.error('❌ 修复感恩日记初始化时出错:', error);
            this.errors.push('感恩日记初始化修复失败: ' + error.message);
        }
    }

    /**
     * 修复localStorage数据
     */
    fixLocalStorageData() {
        try {
            console.log('📦 检查localStorage数据...');
            
            const stored = localStorage.getItem('gratitude_history');
            if (!stored) {
                console.log('📝 未发现历史数据，初始化为空数组');
                localStorage.setItem('gratitude_history', JSON.stringify([]));
                this.fixedItems.push('初始化了空的感恩历史数据');
                return;
            }

            let parsed;
            try {
                parsed = JSON.parse(stored);
            } catch (e) {
                console.error('❌ 历史数据JSON解析失败，重置为空数组');
                localStorage.setItem('gratitude_history', JSON.stringify([]));
                this.fixedItems.push('重置了损坏的感恩历史数据');
                return;
            }

            // 确保是数组格式
            if (!Array.isArray(parsed)) {
                console.log('🔄 转换数据格式为数组...');
                let converted = [];
                
                if (parsed && typeof parsed === 'object') {
                    if (parsed.date && parsed.gratitudes) {
                        converted = [parsed];
                    } else {
                        for (let key in parsed) {
                            if (parsed[key] && typeof parsed[key] === 'object' && parsed[key].date) {
                                converted.push(parsed[key]);
                            }
                        }
                    }
                }
                
                localStorage.setItem('gratitude_history', JSON.stringify(converted));
                this.fixedItems.push(`转换了感恩数据格式，包含 ${converted.length} 条记录`);
            } else {
                // 验证数组中的数据完整性
                const validRecords = parsed.filter(record => 
                    record && 
                    typeof record === 'object' && 
                    record.date &&
                    (Array.isArray(record.gratitudes) || record.gratitudes === undefined)
                );

                if (validRecords.length !== parsed.length) {
                    console.log(`🧹 清理了 ${parsed.length - validRecords.length} 条无效记录`);
                    localStorage.setItem('gratitude_history', JSON.stringify(validRecords));
                    this.fixedItems.push(`清理了 ${parsed.length - validRecords.length} 条无效记录`);
                }
            }

        } catch (error) {
            console.error('❌ 修复localStorage数据时出错:', error);
            this.errors.push('localStorage数据修复失败: ' + error.message);
        }
    }

    /**
     * 确保全局变量正确初始化
     */
    ensureGlobalVariables() {
        try {
            console.log('🔧 检查全局变量...');

            // 确保currentGratitudeData存在
            if (typeof window.currentGratitudeData === 'undefined') {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const todayDate = `${year}-${month}-${day}`;

                window.currentGratitudeData = {
                    date: todayDate,
                    gratitudes: [],
                    summary: '',
                    timestamp: new Date().toISOString()
                };

                console.log('✅ 初始化了currentGratitudeData');
                this.fixedItems.push('初始化了全局感恩数据变量');
            }

        } catch (error) {
            console.error('❌ 确保全局变量时出错:', error);
            this.errors.push('全局变量初始化失败: ' + error.message);
        }
    }

    /**
     * 重新初始化感恩日记
     */
    reinitializeGratitude() {
        try {
            console.log('🔄 重新初始化感恩日记...');

            // 如果存在loadTodayGratitude函数，重新调用
            if (typeof window.loadTodayGratitude === 'function') {
                window.loadTodayGratitude();
                this.fixedItems.push('重新加载了今日感恩记录');
            }

            // 如果存在updateGratitudeStats函数，重新调用
            if (typeof window.updateGratitudeStats === 'function') {
                window.updateGratitudeStats();
                this.fixedItems.push('重新更新了感恩统计');
            }

        } catch (error) {
            console.error('❌ 重新初始化感恩日记时出错:', error);
            this.errors.push('重新初始化失败: ' + error.message);
        }
    }

    /**
     * 测试数据保存功能
     */
    testDataSaving() {
        try {
            console.log('🧪 测试数据保存功能...');

            // 创建测试数据
            const testData = {
                date: new Date().toISOString().split('T')[0],
                gratitudes: ['测试感恩项'],
                summary: '测试总结',
                timestamp: new Date().toISOString()
            };

            // 获取当前历史
            const currentHistory = JSON.parse(localStorage.getItem('gratitude_history') || '[]');
            
            // 添加测试数据
            const testHistory = [...currentHistory, testData];
            localStorage.setItem('gratitude_history', JSON.stringify(testHistory));

            // 验证保存
            const savedHistory = JSON.parse(localStorage.getItem('gratitude_history') || '[]');
            const testRecord = savedHistory.find(record => record.summary === '测试总结');

            if (testRecord) {
                console.log('✅ 数据保存测试通过');
                
                // 清理测试数据
                const cleanHistory = savedHistory.filter(record => record.summary !== '测试总结');
                localStorage.setItem('gratitude_history', JSON.stringify(cleanHistory));
                
                this.fixedItems.push('数据保存功能测试通过');
            } else {
                console.error('❌ 数据保存测试失败');
                this.errors.push('数据保存功能异常');
            }

        } catch (error) {
            console.error('❌ 测试数据保存功能时出错:', error);
            this.errors.push('数据保存测试失败: ' + error.message);
        }
    }

    /**
     * 显示修复结果
     */
    showResults() {
        console.log('🎉 感恩日记初始化修复完成！');
        
        if (this.fixedItems.length > 0) {
            console.log('✅ 已修复的问题:');
            this.fixedItems.forEach(item => console.log('  - ' + item));
        }
        
        if (this.errors.length > 0) {
            console.log('❌ 修复过程中的错误:');
            this.errors.forEach(error => console.log('  - ' + error));
        }
        
        if (this.fixedItems.length === 0 && this.errors.length === 0) {
            console.log('📝 未发现需要修复的问题');
        }

        // 在页面上显示通知
        this.showPageNotification();
    }

    /**
     * 在页面上显示通知
     */
    showPageNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            color: #2e7d32;
            max-width: 300px;
        `;
        
        const totalFixed = this.fixedItems.length;
        const totalErrors = this.errors.length;
        
        let message = '🔧 感恩日记修复完成';
        if (totalFixed > 0) {
            message += `\n✅ 修复了 ${totalFixed} 个问题`;
        }
        if (totalErrors > 0) {
            message += `\n⚠️ ${totalErrors} 个项目需要手动处理`;
        }
        if (totalFixed === 0 && totalErrors === 0) {
            message += '\n📝 未发现需要修复的问题';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * 执行所有修复操作
     */
    fixAll() {
        console.log('🚀 开始感恩日记全面修复...');
        
        this.fixGratitudeInit();
        
        // 延迟显示结果
        setTimeout(() => {
            this.showResults();
        }, 1000);
    }
}

// 自动执行修复（仅在感恩日记页面）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('gratitude_diary.html')) {
            setTimeout(() => {
                const fixer = new GratitudeInitFixer();
                fixer.fixAll();
            }, 2000);
        }
    });
} else {
    if (window.location.pathname.includes('gratitude_diary.html')) {
        setTimeout(() => {
            const fixer = new GratitudeInitFixer();
            fixer.fixAll();
        }, 2000);
    }
}

// 导出供手动调用
window.GratitudeInitFixer = GratitudeInitFixer;
