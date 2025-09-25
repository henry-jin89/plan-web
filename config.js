// 计划管理器配置文件
window.APP_CONFIG = {
    // 应用基本信息
    APP: {
        NAME: '计划管理器',
        VERSION: '1.0.0',
        AUTHOR: 'Plan Manager Team'
    },
    
    // 网站配置
    SITE: {
        URL: 'https://henry-jin89.github.io/plan-web/',
        NAME: '智能计划管理器',
        VERSION: '1.0.0'
    },
    
    // Google Drive API配置（如需使用Google Drive同步）
    GOOGLE_DRIVE: {
        CLIENT_ID: '1064003317166-2dg5o8f4n9dlj3f1hav8vglgoq9d0gnu.apps.googleusercontent.com',
        API_KEY: 'AIzaSyAzO_pnbFy181E3Gnz3LmZ_o-J-OmhHuDU',
        SCOPE: 'https://www.googleapis.com/auth/drive.file'
    },
    
    // 同步设置
    SYNC: {
        // 自动同步间隔（毫秒）
        AUTO_INTERVAL: 30000,
        // 是否在数据变更时立即同步
        SYNC_ON_CHANGE: true,
        // 冲突处理方式：'auto' 或 'manual'
        CONFLICT_RESOLUTION: 'manual',
        
        // GitHub自动同步配置
        // 要启用自动同步，请取消下面的注释并填写您的GitHub信息
        GITHUB_CONFIG: {
            enabled: false,  // 设置为true启用自动同步
            token: '',       // 您的GitHub Personal Access Token
            owner: '',       // 您的GitHub用户名
            repo: '',        // 仓库名称，建议使用 'plan-data'
            branch: 'main'   // 分支名称，通常是 'main' 或 'master'
            
            /* 设置示例：
            enabled: true,
            token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            owner: 'your-username',
            repo: 'plan-data',
            branch: 'main'
            */
        }
    },
    
    // 存储设置
    STORAGE: {
        // 本地存储前缀
        PREFIX: 'plan_manager_',
        // 是否启用本地备份
        BACKUP_ENABLED: true,
        // 备份保留天数
        BACKUP_DAYS: 30
    }
};