/**
 * 紧急修复脚本 - 确保页面能正常显示
 */

console.log('🚨 紧急修复脚本已加载');

// 确保页面内容可见
function ensureContentVisible() {
    console.log('🔧 执行紧急修复...');
    
    // 隐藏所有加载提示
    const loadingElements = [
        document.getElementById('loading-overlay'),
        document.querySelector('.loading'),
        document.querySelector('[id*="loading"]')
    ];
    
    loadingElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
            console.log('✅ 隐藏加载元素');
        }
    });
    
    // 确保主内容可见
    const mainContent = document.querySelector('.container') || 
                       document.querySelector('.main-content') ||
                       document.getElementById('main-content');
    
    if (mainContent) {
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        console.log('✅ 主内容已显示');
    }
    
    // 确保body可见
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    // 检查CSS是否加载
    const hasStyles = document.styleSheets.length > 0;
    if (!hasStyles) {
        console.warn('⚠️ CSS可能未加载，应用基础样式');
        document.body.style.cssText += `
            font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: #333;
            min-height: 100vh;
        `;
        
        if (mainContent) {
            mainContent.style.cssText += `
                max-width: 900px;
                margin: 30px auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                padding: 24px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            `;
        }
    }
    
    console.log('✅ 紧急修复完成');
}

// 立即执行
ensureContentVisible();

// DOM加载完成后再次执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureContentVisible);
} else {
    setTimeout(ensureContentVisible, 100);
}

// 延迟执行，确保其他脚本不会覆盖
setTimeout(ensureContentVisible, 1000);
setTimeout(ensureContentVisible, 3000);

// 提供手动修复功能
window.emergencyFix = function() {
    console.log('🔧 手动执行紧急修复');
    ensureContentVisible();
    
    // 额外的修复措施
    const allHiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
    allHiddenElements.forEach(element => {
        if (!element.id.includes('loading') && !element.classList.contains('modal')) {
            element.style.display = '';
            element.style.visibility = '';
        }
    });
    
    alert('紧急修复已执行！如果页面仍有问题，请刷新页面。');
};

// 在控制台提供帮助信息
console.log('%c🆘 如果页面仍然空白，请在控制台输入: emergencyFix()', 'color: #ff5722; font-size: 16px; font-weight: bold;');
