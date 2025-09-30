/**
 * Gemini AI 智能助手 - 计划分析与建议系统
 * 使用 Gemini 2.5 Pro API 分析用户的所有计划数据并提供个性化建议
 */

class GeminiAIAssistant {
    constructor() {
        this.apiKey = 'AIzaSyD7tgSS0HlGVxFHvzzQ96yL5WJiZ_caelM';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.storageKey = 'gemini_ai_suggestions';
        this.lastAnalysisKey = 'last_ai_analysis_time';
        this.isAnalyzing = false;
    }

    /**
     * 收集所有页面的计划数据
     */
    collectAllPlanData() {
        const allData = {
            timestamp: new Date().toISOString(),
            plans: {},
            summary: {}
        };

        // 收集各类计划数据
        const planTypes = [
            { key: 'day', name: '日计划' },
            { key: 'week', name: '周计划' },
            { key: 'month', name: '月计划' },
            { key: 'quarter', name: '季度计划' },
            { key: 'halfyear', name: '半年计划' },
            { key: 'year', name: '年计划' }
        ];

        planTypes.forEach(type => {
            const data = this.getPlanData(`planData_${type.key}`);
            if (data && Object.keys(data).length > 0) {
                allData.plans[type.key] = {
                    name: type.name,
                    data: data,
                    count: Object.keys(data).length
                };
            }
        });

        // 收集功能数据
        const features = [
            { key: 'habit', name: '习惯追踪' },
            { key: 'mood', name: '心情记录' },
            { key: 'gratitude', name: '感恩日记' },
            { key: 'reflection', name: '反思模板' },
            { key: 'schedule', name: '月度日程' }
        ];

        features.forEach(feature => {
            const data = this.getPlanData(`planData_${feature.key}`);
            if (data && Object.keys(data).length > 0) {
                allData.plans[feature.key] = {
                    name: feature.name,
                    data: data,
                    count: Object.keys(data).length
                };
            }
        });

        // 统计摘要
        allData.summary = {
            totalPlans: Object.keys(allData.plans).length,
            totalEntries: Object.values(allData.plans).reduce((sum, p) => sum + p.count, 0),
            hasData: Object.keys(allData.plans).length > 0
        };

        return allData;
    }

    /**
     * 获取指定类型的计划数据
     */
    getPlanData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`读取 ${key} 失败:`, e);
            return null;
        }
    }

    /**
     * 构建发送给 Gemini 的提示词
     */
    buildPrompt(planData) {
        let prompt = `你是一位专业的生活规划和时间管理专家。请分析以下用户的计划数据，并提供个性化的建议和洞察。

📊 **用户计划数据概览**：
- 总计划类型: ${planData.summary.totalPlans}
- 总记录数: ${planData.summary.totalEntries}
- 分析时间: ${new Date().toLocaleString('zh-CN')}

`;

        // 添加各类计划的详细数据
        Object.entries(planData.plans).forEach(([key, value]) => {
            prompt += `\n📋 **${value.name}**：\n`;
            prompt += `- 记录数: ${value.count}\n`;
            
            // 提取关键信息（最多显示最近3条）
            const entries = Object.entries(value.data).slice(-3);
            entries.forEach(([date, content]) => {
                prompt += `  • ${date}: ${JSON.stringify(content).substring(0, 150)}...\n`;
            });
        });

        prompt += `

请基于以上数据，提供以下分析：

1. **整体评估** (2-3句话)
   - 用户的计划习惯如何？
   - 哪些方面做得好？

2. **关键洞察** (3-5点)
   - 发现的模式和趋势
   - 潜在的问题或改进空间
   - 目标与行动的一致性

3. **具体建议** (5-7条)
   - 如何优化时间管理
   - 如何提高执行力
   - 如何平衡不同维度的计划
   - 习惯培养建议
   - 目标设定建议

4. **行动计划** (3-5条)
   - 立即可以采取的具体行动
   - 优先级排序

请用中文回答，语言温暖、专业且富有激励性。使用 Markdown 格式，包含适当的表情符号。`;

        return prompt;
    }

    /**
     * 调用 Gemini API 获取建议
     */
    async getAISuggestions(planData) {
        const prompt = this.buildPrompt(planData);
        
        try {
            console.log('🤖 正在调用 Gemini AI...');
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0) {
                const suggestion = result.candidates[0].content.parts[0].text;
                return {
                    success: true,
                    suggestion: suggestion,
                    timestamp: new Date().toISOString(),
                    planData: planData
                };
            } else {
                throw new Error('API 返回数据格式错误');
            }
        } catch (error) {
            console.error('❌ Gemini API 调用失败:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 保存 AI 建议到本地存储
     */
    saveSuggestion(suggestionData) {
        try {
            // 获取历史建议
            const history = this.getSuggestionHistory();
            
            // 添加新建议（保留最近10条）
            history.unshift(suggestionData);
            if (history.length > 10) {
                history.splice(10);
            }
            
            // 保存到 localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            localStorage.setItem(this.lastAnalysisKey, suggestionData.timestamp);
            
            console.log('✅ AI 建议已保存');
            return true;
        } catch (e) {
            console.error('❌ 保存 AI 建议失败:', e);
            return false;
        }
    }

    /**
     * 获取建议历史
     */
    getSuggestionHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取建议历史失败:', e);
            return [];
        }
    }

    /**
     * 获取最新的建议
     */
    getLatestSuggestion() {
        const history = this.getSuggestionHistory();
        return history.length > 0 ? history[0] : null;
    }

    /**
     * 执行完整的分析流程
     */
    async analyzeAndSuggest() {
        if (this.isAnalyzing) {
            console.log('⚠️ 正在分析中，请稍候...');
            return { success: false, error: '分析进行中' };
        }

        this.isAnalyzing = true;

        try {
            // 1. 收集数据
            console.log('📊 正在收集计划数据...');
            const planData = this.collectAllPlanData();
            
            if (!planData.summary.hasData) {
                this.isAnalyzing = false;
                return {
                    success: false,
                    error: '暂无计划数据',
                    message: '请先在各个计划页面中添加一些内容，然后再使用 AI 分析功能。'
                };
            }

            // 2. 调用 AI
            console.log('🤖 正在分析数据...');
            const result = await this.getAISuggestions(planData);
            
            if (result.success) {
                // 3. 保存结果
                this.saveSuggestion(result);
                console.log('✅ 分析完成！');
            }
            
            this.isAnalyzing = false;
            return result;
            
        } catch (error) {
            console.error('❌ 分析过程出错:', error);
            this.isAnalyzing = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 显示建议的 UI
     */
    showSuggestionModal(suggestionData) {
        // 移除旧的模态框
        const oldModal = document.getElementById('ai-suggestion-modal');
        if (oldModal) {
            oldModal.remove();
        }

        // 创建新的模态框
        const modal = document.createElement('div');
        modal.id = 'ai-suggestion-modal';
        modal.innerHTML = `
            <div class="ai-modal-overlay">
                <div class="ai-modal-content">
                    <div class="ai-modal-header">
                        <h2>🤖 AI 智能分析与建议</h2>
                        <button class="ai-modal-close" onclick="document.getElementById('ai-suggestion-modal').remove()">✕</button>
                    </div>
                    <div class="ai-modal-body">
                        <div class="ai-timestamp">
                            分析时间: ${new Date(suggestionData.timestamp).toLocaleString('zh-CN')}
                        </div>
                        <div class="ai-suggestion-content markdown-body">
                            ${this.markdownToHtml(suggestionData.suggestion)}
                        </div>
                    </div>
                    <div class="ai-modal-footer">
                        <button class="ai-btn ai-btn-secondary" onclick="geminiAssistant.showHistory()">查看历史建议</button>
                        <button class="ai-btn ai-btn-primary" onclick="document.getElementById('ai-suggestion-modal').remove()">知道了</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 简单的 Markdown 转 HTML
     */
    markdownToHtml(markdown) {
        let html = markdown;
        
        // 标题
        html = html.replace(/### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/# (.*?)$/gm, '<h1>$1</h1>');
        
        // 粗体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 列表
        html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
        
        // 换行
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // 清理空段落
        html = html.replace(/<p>\s*<\/p>/g, '');
        
        return html;
    }

    /**
     * 显示历史建议
     */
    showHistory() {
        const history = this.getSuggestionHistory();
        
        if (history.length === 0) {
            alert('暂无历史建议');
            return;
        }

        // 移除旧的模态框
        const oldModal = document.getElementById('ai-suggestion-modal');
        if (oldModal) {
            oldModal.remove();
        }

        // 创建历史列表
        const modal = document.createElement('div');
        modal.id = 'ai-suggestion-modal';
        modal.innerHTML = `
            <div class="ai-modal-overlay">
                <div class="ai-modal-content">
                    <div class="ai-modal-header">
                        <h2>📚 历史建议记录</h2>
                        <button class="ai-modal-close" onclick="document.getElementById('ai-suggestion-modal').remove()">✕</button>
                    </div>
                    <div class="ai-modal-body">
                        <div class="ai-history-list">
                            ${history.map((item, index) => `
                                <div class="ai-history-item" onclick="geminiAssistant.showHistoryItem(${index})">
                                    <div class="ai-history-date">
                                        ${new Date(item.timestamp).toLocaleString('zh-CN')}
                                    </div>
                                    <div class="ai-history-preview">
                                        ${item.suggestion.substring(0, 100)}...
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="ai-modal-footer">
                        <button class="ai-btn ai-btn-primary" onclick="document.getElementById('ai-suggestion-modal').remove()">关闭</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 显示历史记录的某一项
     */
    showHistoryItem(index) {
        const history = this.getSuggestionHistory();
        if (history[index]) {
            this.showSuggestionModal(history[index]);
        }
    }
}

// 创建全局实例
const geminiAssistant = new GeminiAIAssistant();

console.log('🤖 Gemini AI 助手已加载');
