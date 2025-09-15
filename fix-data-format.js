/**
 * 数据格式修复脚本
 * 用于修复感恩日记等页面的数据格式问题
 */

class DataFormatFixer {
    constructor() {
        this.fixedItems = [];
        this.errors = [];
    }

    /**
     * 修复感恩日记数据格式
     */
    fixGratitudeData() {
        try {
            console.log('🔧 开始修复感恩日记数据格式...');
            
            const stored = localStorage.getItem('gratitude_history');
            if (!stored) {
                console.log('📝 未发现感恩日记历史数据');
                return;
            }

            const parsed = JSON.parse(stored);
            console.log('🔍 当前数据类型:', typeof parsed, '是否为数组:', Array.isArray(parsed));

            if (Array.isArray(parsed)) {
                // 即使是数组，也要验证数据完整性
                const validRecords = parsed.filter(record => 
                    record && 
                    typeof record === 'object' && 
                    record.date && 
                    Array.isArray(record.gratitudes)
                );
                
                if (validRecords.length === parsed.length) {
                    console.log('✅ 感恩日记数据格式正确，无需修复');
                    return;
                } else {
                    console.log(`⚠️ 发现 ${parsed.length - validRecords.length} 条无效记录，正在清理...`);
                    localStorage.setItem('gratitude_history', JSON.stringify(validRecords));
                    this.fixedItems.push(`感恩日记：清理了 ${parsed.length - validRecords.length} 条无效记录`);
                    return;
                }
            }

            // 转换为数组格式
            let converted = [];
            
            if (parsed && typeof parsed === 'object') {
                // 检查是否是单个对象记录
                if (parsed.date && parsed.gratitudes) {
                    converted = [parsed];
                    console.log('🔄 发现单个对象记录，转换为数组');
                } else {
                    // 如果是多个记录的对象格式，尝试转换
                    for (let key in parsed) {
                        if (parsed[key] && typeof parsed[key] === 'object' && parsed[key].date) {
                            converted.push(parsed[key]);
                        }
                    }
                    console.log('🔄 发现多个对象记录，转换为数组');
                }
            }

            if (converted.length > 0) {
                // 按日期排序（最新的在前）
                converted.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                localStorage.setItem('gratitude_history', JSON.stringify(converted));
                this.fixedItems.push(`感恩日记：转换了 ${converted.length} 条记录`);
                console.log('✅ 感恩日记数据格式修复完成，转换了', converted.length, '条记录');
            } else {
                console.warn('⚠️ 无法转换感恩日记数据，数据可能损坏');
                this.errors.push('感恩日记数据无法转换');
            }

        } catch (error) {
            console.error('❌ 修复感恩日记数据时出错:', error);
            this.errors.push('感恩日记修复失败: ' + error.message);
        }
    }

    /**
     * 修复其他页面的类似问题
     */
    fixOtherPageData() {
        const dataKeys = [
            'mood_history',
            'habit_data',
            'reflection_history',
            'day_plan_history',
            'week_plan_history',
            'month_plan_history'
        ];

        dataKeys.forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (!stored) return;

                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return; // 已经是数组格式

                console.log(`🔧 修复 ${key} 数据格式...`);
                
                let converted = [];
                if (parsed && typeof parsed === 'object') {
                    if (parsed.date || parsed.id) {
                        // 单个对象
                        converted = [parsed];
                    } else {
                        // 多个对象
                        for (let subKey in parsed) {
                            if (parsed[subKey] && typeof parsed[subKey] === 'object') {
                                converted.push(parsed[subKey]);
                            }
                        }
                    }
                }

                if (converted.length > 0) {
                    localStorage.setItem(key, JSON.stringify(converted));
                    this.fixedItems.push(`${key}：转换了 ${converted.length} 条记录`);
                    console.log(`✅ ${key} 数据格式修复完成`);
                }

            } catch (error) {
                console.error(`❌ 修复 ${key} 时出错:`, error);
                this.errors.push(`${key} 修复失败: ${error.message}`);
            }
        });
    }

    /**
     * 清理无效的同步配置
     */
    cleanupSyncConfig() {
        try {
            console.log('🧹 清理无效同步配置...');
            
            const syncKeys = ['sync_config', 'syncConfig'];
            let cleaned = 0;

            syncKeys.forEach(key => {
                const config = localStorage.getItem(key);
                if (config) {
                    try {
                        const parsed = JSON.parse(config);
                        if (!parsed.enabled || !parsed.provider) {
                            localStorage.removeItem(key);
                            cleaned++;
                            console.log(`🗑️ 清理无效配置: ${key}`);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                        cleaned++;
                        console.log(`🗑️ 清理损坏配置: ${key}`);
                    }
                }
            });

            if (cleaned > 0) {
                this.fixedItems.push(`清理了 ${cleaned} 个无效同步配置`);
            }

        } catch (error) {
            console.error('❌ 清理同步配置时出错:', error);
            this.errors.push('同步配置清理失败: ' + error.message);
        }
    }

    /**
     * 执行所有修复操作
     */
    fixAll() {
        console.log('🚀 开始数据格式修复...');
        
        this.fixGratitudeData();
        this.fixOtherPageData();
        this.cleanupSyncConfig();
        
        // 显示修复结果
        this.showResults();
    }

    /**
     * 显示修复结果
     */
    showResults() {
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #28a745;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
        `;

        let content = '<h3 style="color: #28a745; margin-top: 0;">🔧 数据修复完成</h3>';

        if (this.fixedItems.length > 0) {
            content += '<div style="margin: 16px 0;"><strong>✅ 修复项目:</strong><ul>';
            this.fixedItems.forEach(item => {
                content += `<li style="margin: 4px 0;">${item}</li>`;
            });
            content += '</ul></div>';
        }

        if (this.errors.length > 0) {
            content += '<div style="margin: 16px 0;"><strong>❌ 错误项目:</strong><ul>';
            this.errors.forEach(error => {
                content += `<li style="margin: 4px 0; color: #dc3545;">${error}</li>`;
            });
            content += '</ul></div>';
        }

        if (this.fixedItems.length === 0 && this.errors.length === 0) {
            content += '<div style="color: #6c757d;">📝 未发现需要修复的数据格式问题</div>';
        }

        content += `
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="location.reload()" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    cursor: pointer;
                    margin-right: 10px;
                ">刷新页面</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    cursor: pointer;
                ">关闭</button>
            </div>
        `;

        resultDiv.innerHTML = content;
        document.body.appendChild(resultDiv);
    }
}

// 自动执行修复（如果页面加载完成）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const fixer = new DataFormatFixer();
            fixer.fixAll();
        }, 1000);
    });
} else {
    setTimeout(() => {
        const fixer = new DataFormatFixer();
        fixer.fixAll();
    }, 1000);
}

// 导出供手动调用
window.DataFormatFixer = DataFormatFixer;
