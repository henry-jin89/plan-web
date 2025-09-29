/**
 * Firebase配置 - 使用官方最新配置
 * 支持模块化SDK和兼容性SDK
 */

// 您的Firebase配置 - 官方提供
const firebaseConfig = {
    apiKey: "AIzaSyCDJRRK83dXaGsUiBtpgN5M0REJtV-3Uc0",
    authDomain: "plan-web-b0c39.firebaseapp.com",
    projectId: "plan-web-b0c39",
    storageBucket: "plan-web-b0c39.firebasestorage.app",
    messagingSenderId: "1087929904929",
    appId: "1:1087929904929:web:aa8790a7ee424fce3b1860",
    measurementId: "G-KFHYWN1P7D"
};

// 导出配置供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}

console.log('🔥 Firebase配置已加载');
