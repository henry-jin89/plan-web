// Firebase 配置文件
// 如果需要使用 Firebase 实时数据库同步，请在此配置

// 检查是否已有 Firebase 配置
if (typeof window !== 'undefined' && !window.firebaseConfigured) {
    console.log('📝 Firebase配置文件已加载（当前使用LeanCloud作为主要同步服务）');
    
    // 标记 Firebase 配置已加载
    window.firebaseConfigured = true;
    
    // 如果需要启用 Firebase，请取消下面的注释并配置您的项目信息
    /*
    const firebaseConfig = {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id"
    };
    
    // 初始化 Firebase
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase 已初始化');
    }
    */
}
