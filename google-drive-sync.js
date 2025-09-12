// Google Drive 同步服务
class GoogleDriveSync {
    constructor() {
        this.isInitialized = false;
        this.isAuthorized = false;
        this.accessToken = null;
        this.appFolderId = null;
        this.clientId = null; // 需要在Google Cloud Console中创建
        this.apiKey = null;   // 需要在Google Cloud Console中创建
        this.scope = 'https://www.googleapis.com/auth/drive.file';
        this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    }

    // 初始化Google Drive API
    async init() {
        try {
            // 加载Google API
            await this.loadGoogleAPI();
            
            // 获取存储的配置
            const config = this.getStoredConfig();
            if (config.clientId && config.apiKey) {
                this.clientId = config.clientId;
                this.apiKey = config.apiKey;
                
                // 初始化API
                await this.initializeAPI();
                
                // 尝试自动登录
                await this.tryAutoLogin();
            }
            
            this.isInitialized = true;
            console.log('✅ Google Drive API 初始化完成');
        } catch (error) {
            console.error('❌ Google Drive API 初始化失败:', error);
            throw error;
        }
    }

    // 加载Google API脚本
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('auth2:client', resolve);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 初始化API客户端
    async initializeAPI() {
        await window.gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            discoveryDocs: [this.discoveryDoc],
            scope: this.scope
        });
        
        this.authInstance = window.gapi.auth2.getAuthInstance();
    }

    // 尝试自动登录
    async tryAutoLogin() {
        if (this.authInstance.isSignedIn.get()) {
            this.isAuthorized = true;
            this.accessToken = this.authInstance.currentUser.get().getAuthResponse().access_token;
            await this.ensureAppFolder();
            console.log('✅ 自动登录成功');
        }
    }

    // 配置API密钥
    configure(clientId, apiKey) {
        this.clientId = clientId;
        this.apiKey = apiKey;
        
        // 保存配置
        localStorage.setItem('googleDriveConfig', JSON.stringify({
            clientId,
            apiKey
        }));
    }

    // 获取存储的配置
    getStoredConfig() {
        const stored = localStorage.getItem('googleDriveConfig');
        return stored ? JSON.parse(stored) : {};
    }

    // 授权登录
    async authorize() {
        if (!this.isInitialized) {
            throw new Error('Google Drive API 未初始化');
        }

        try {
            const authResult = await this.authInstance.signIn();
            this.isAuthorized = true;
            this.accessToken = authResult.getAuthResponse().access_token;
            
            // 确保应用文件夹存在
            await this.ensureAppFolder();
            
            console.log('✅ Google Drive 授权成功');
            return true;
        } catch (error) {
            console.error('❌ Google Drive 授权失败:', error);
            throw error;
        }
    }

    // 注销
    async signOut() {
        if (this.authInstance) {
            await this.authInstance.signOut();
            this.isAuthorized = false;
            this.accessToken = null;
            this.appFolderId = null;
            console.log('✅ 已注销Google Drive');
        }
    }

    // 确保应用文件夹存在
    async ensureAppFolder() {
        try {
            // 搜索已存在的应用文件夹
            const response = await window.gapi.client.drive.files.list({
                q: "name='计划管理器数据' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                spaces: 'drive'
            });

            if (response.result.files.length > 0) {
                this.appFolderId = response.result.files[0].id;
                console.log('✅ 找到应用文件夹:', this.appFolderId);
            } else {
                // 创建应用文件夹
                const folderResponse = await window.gapi.client.drive.files.create({
                    resource: {
                        name: '计划管理器数据',
                        mimeType: 'application/vnd.google-apps.folder',
                        description: '计划管理器应用数据存储文件夹'
                    }
                });
                
                this.appFolderId = folderResponse.result.id;
                console.log('✅ 创建应用文件夹:', this.appFolderId);
            }
        } catch (error) {
            console.error('❌ 创建应用文件夹失败:', error);
            throw error;
        }
    }

    // 上传文件到Google Drive
    async uploadFile(fileName, content, mimeType = 'application/json') {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const metadata = {
                'name': fileName,
                'parents': [this.appFolderId],
                'description': `计划管理器数据文件 - ${new Date().toISOString()}`
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + mimeType + '\r\n\r\n' +
                content +
                close_delim;

            const request = window.gapi.client.request({
                'path': 'https://www.googleapis.com/upload/drive/v3/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });

            const response = await request;
            console.log('✅ 文件上传成功:', fileName, response.result.id);
            return response.result;
        } catch (error) {
            console.error('❌ 文件上传失败:', error);
            throw error;
        }
    }

    // 下载文件内容
    async downloadFile(fileId) {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            const response = await window.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            console.log('✅ 文件下载成功:', fileId);
            return response.body;
        } catch (error) {
            console.error('❌ 文件下载失败:', error);
            throw error;
        }
    }

    // 搜索文件
    async searchFiles(fileName) {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            const response = await window.gapi.client.drive.files.list({
                q: `name='${fileName}' and parents in '${this.appFolderId}' and trashed=false`,
                spaces: 'drive',
                orderBy: 'modifiedTime desc'
            });

            return response.result.files || [];
        } catch (error) {
            console.error('❌ 搜索文件失败:', error);
            throw error;
        }
    }

    // 更新文件
    async updateFile(fileId, content, mimeType = 'application/json') {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            const response = await window.gapi.client.request({
                'path': `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
                'method': 'PATCH',
                'params': {'uploadType': 'media'},
                'headers': {
                    'Content-Type': mimeType
                },
                'body': content
            });

            console.log('✅ 文件更新成功:', fileId);
            return response.result;
        } catch (error) {
            console.error('❌ 文件更新失败:', error);
            throw error;
        }
    }

    // 同步本地数据到云端
    async syncToCloud() {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            console.log('🔄 开始同步到云端...');
            
            // 获取所有本地数据
            const localData = this.getAllLocalData();
            
            // 创建同步数据包
            const syncData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: localData
            };

            const content = JSON.stringify(syncData, null, 2);
            const fileName = `sync-${Date.now()}.json`;

            // 搜索现有的同步文件
            const existingFiles = await this.searchFiles('latest-sync.json');
            
            if (existingFiles.length > 0) {
                // 更新现有文件
                await this.updateFile(existingFiles[0].id, content);
            } else {
                // 创建新文件
                await this.uploadFile('latest-sync.json', content);
            }

            // 同时创建一个带时间戳的备份
            await this.uploadFile(fileName, content);

            console.log('✅ 同步到云端完成');
            
            // 更新最后同步时间
            this.updateLastSyncTime();
            
            return true;
        } catch (error) {
            console.error('❌ 同步到云端失败:', error);
            throw error;
        }
    }

    // 从云端同步到本地
    async syncFromCloud() {
        if (!this.isAuthorized) {
            throw new Error('未授权Google Drive访问');
        }

        try {
            console.log('🔄 开始从云端同步...');
            
            // 搜索最新的同步文件
            const files = await this.searchFiles('latest-sync.json');
            
            if (files.length === 0) {
                console.log('⚠️ 云端没有找到同步数据');
                return false;
            }

            // 下载最新的同步数据
            const content = await this.downloadFile(files[0].id);
            const syncData = JSON.parse(content);

            // 检查版本兼容性
            if (!this.isVersionCompatible(syncData.version)) {
                throw new Error(`版本不兼容: ${syncData.version}`);
            }

            // 合并数据到本地
            this.mergeCloudDataToLocal(syncData.data);

            console.log('✅ 从云端同步完成');
            
            // 更新最后同步时间
            this.updateLastSyncTime();
            
            // 触发数据更新事件
            window.dispatchEvent(new CustomEvent('data-updated', { 
                detail: { source: 'cloud' } 
            }));
            
            return true;
        } catch (error) {
            console.error('❌ 从云端同步失败:', error);
            throw error;
        }
    }

    // 获取所有本地数据
    getAllLocalData() {
        const data = {};
        
        // 获取所有localStorage数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('plans_') || key.startsWith('habit') || key.startsWith('mood') || key.startsWith('gratitude')) {
                data[key] = localStorage.getItem(key);
            }
        }
        
        return data;
    }

    // 合并云端数据到本地
    mergeCloudDataToLocal(cloudData) {
        for (const [key, value] of Object.entries(cloudData)) {
            const localValue = localStorage.getItem(key);
            
            if (!localValue) {
                // 本地没有此数据，直接设置
                localStorage.setItem(key, value);
            } else {
                // 本地有数据，需要合并
                try {
                    const localData = JSON.parse(localValue);
                    const cloudDataParsed = JSON.parse(value);
                    const mergedData = this.mergeData(localData, cloudDataParsed);
                    localStorage.setItem(key, JSON.stringify(mergedData));
                } catch (error) {
                    console.warn('数据合并失败，使用云端数据:', key, error);
                    localStorage.setItem(key, value);
                }
            }
        }
    }

    // 合并数据策略
    mergeData(localData, cloudData) {
        // 简单的合并策略：云端数据优先，但保留本地的新增内容
        if (typeof localData === 'object' && typeof cloudData === 'object') {
            return { ...localData, ...cloudData };
        }
        return cloudData;
    }

    // 检查版本兼容性
    isVersionCompatible(version) {
        // 简单的版本检查，可以根据需要完善
        return true;
    }

    // 更新最后同步时间
    updateLastSyncTime() {
        const syncStatus = {
            lastSync: new Date().toISOString(),
            provider: 'google-drive'
        };
        localStorage.setItem('syncStatus', JSON.stringify(syncStatus));
    }

    // 获取同步状态
    getSyncStatus() {
        const stored = localStorage.getItem('syncStatus');
        const status = stored ? JSON.parse(stored) : {};
        
        return {
            isAuthorized: this.isAuthorized,
            lastSync: status.lastSync,
            provider: status.provider || 'google-drive'
        };
    }

    // 自动同步
    async autoSync() {
        if (!this.isAuthorized) {
            return;
        }

        try {
            // 检查是否需要同步
            const lastSync = this.getSyncStatus().lastSync;
            const now = new Date();
            const lastSyncTime = lastSync ? new Date(lastSync) : new Date(0);
            const diffMinutes = (now - lastSyncTime) / (1000 * 60);

            // 如果超过10分钟没有同步，执行自动同步
            if (diffMinutes > 10) {
                await this.syncToCloud();
                console.log('✅ 自动同步完成');
            }
        } catch (error) {
            console.error('❌ 自动同步失败:', error);
        }
    }
}

// 创建全局实例
window.googleDriveSync = new GoogleDriveSync();

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleDriveSync;
}
