/**
 * 计划管理器 - 同步提供商实现
 * 支持GitHub、Google Drive、自建服务器等多种同步方式
 * Author: Plan Manager Team
 * Version: 1.0.0
 */

/**
 * 同步提供商基类
 */
class SyncProvider {
    constructor(settings) {
        this.settings = settings;
        this.name = 'Base Provider';
        this.connected = false;
    }

    async connect() {
        throw new Error('connect() method must be implemented by subclass');
    }

    async disconnect() {
        this.connected = false;
    }

    async uploadData(data) {
        throw new Error('uploadData() method must be implemented by subclass');
    }

    async downloadData() {
        throw new Error('downloadData() method must be implemented by subclass');
    }

    async testConnection() {
        try {
            await this.connect();
            return true;
        } catch (error) {
            console.error('连接测试失败:', error);
            return false;
        }
    }
}

/**
 * GitHub 同步提供商
 * 使用GitHub仓库作为数据存储
 */
class GitHubSyncProvider extends SyncProvider {
    constructor(settings) {
        super(settings);
        this.name = 'GitHub';
        this.baseUrl = 'https://api.github.com';
        this.dataFileName = 'plan-data.json';
        
        // 验证必需的设置
        this.validateSettings();
    }

    validateSettings() {
        const required = ['token', 'owner', 'repo'];
        const missing = required.filter(key => !this.settings[key]);
        
        if (missing.length > 0) {
            throw new Error(`GitHub同步缺少必需设置: ${missing.join(', ')}`);
        }
    }

    async connect() {
        try {
            // 验证token和仓库访问权限
            const response = await fetch(`${this.baseUrl}/repos/${this.settings.owner}/${this.settings.repo}`, {
                headers: {
                    'Authorization': `Bearer ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API请求失败: ${response.status} ${response.statusText}`);
            }

            this.connected = true;
            console.log('✅ GitHub连接成功');
            
        } catch (error) {
            console.error('❌ GitHub连接失败:', error);
            throw error;
        }
    }

    async uploadData(data) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const content = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // 首先尝试获取现有文件信息
            let sha = null;
            try {
                const existingFile = await this.getFileInfo();
                sha = existingFile.sha;
            } catch (error) {
                // 文件不存在，创建新文件
                console.log('文件不存在，将创建新文件');
            }

            const requestBody = {
                message: `数据同步 - ${new Date().toISOString()}`,
                content: encodedContent,
                branch: this.settings.branch || 'main'
            };

            if (sha) {
                requestBody.sha = sha;
            }

            const response = await fetch(
                `${this.baseUrl}/repos/${this.settings.owner}/${this.settings.repo}/contents/${this.dataFileName}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.settings.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                throw new Error(`上传失败: ${response.status} ${response.statusText}`);
            }

            console.log('✅ 数据已上传到GitHub');
            
        } catch (error) {
            console.error('❌ GitHub上传失败:', error);
            throw error;
        }
    }

    async downloadData() {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const fileInfo = await this.getFileInfo();
            const content = atob(fileInfo.content);
            const data = JSON.parse(decodeURIComponent(escape(content)));
            
            console.log('✅ 从GitHub下载数据成功');
            return data;
            
        } catch (error) {
            if (error.message.includes('404')) {
                console.log('GitHub上没有数据文件，返回空数据');
                return {};
            }
            console.error('❌ GitHub下载失败:', error);
            throw error;
        }
    }

    async getFileInfo() {
        const response = await fetch(
            `${this.baseUrl}/repos/${this.settings.owner}/${this.settings.repo}/contents/${this.dataFileName}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`获取文件信息失败: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}

/**
 * Google Drive 同步提供商
 * 使用Google Drive API进行数据同步
 */
class GoogleDriveSyncProvider extends SyncProvider {
    constructor(settings) {
        super(settings);
        this.name = 'Google Drive';
        this.baseUrl = 'https://www.googleapis.com/drive/v3';
        this.uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files';
        this.dataFileName = 'plan-manager-data.json';
        this.fileId = null;
        
        this.validateSettings();
    }

    validateSettings() {
        if (!this.settings.accessToken) {
            throw new Error('Google Drive同步缺少访问令牌');
        }
    }

    async connect() {
        try {
            // 测试API访问权限
            const response = await fetch(`${this.baseUrl}/about?fields=user`, {
                headers: {
                    'Authorization': `Bearer ${this.settings.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Google Drive API请求失败: ${response.status} ${response.statusText}`);
            }

            this.connected = true;
            console.log('✅ Google Drive连接成功');
            
            // 查找或创建数据文件
            await this.findOrCreateDataFile();
            
        } catch (error) {
            console.error('❌ Google Drive连接失败:', error);
            throw error;
        }
    }

    async findOrCreateDataFile() {
        try {
            // 搜索现有的数据文件
            const searchResponse = await fetch(
                `${this.baseUrl}/files?q=name='${this.dataFileName}' and trashed=false`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.settings.accessToken}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!searchResponse.ok) {
                throw new Error('搜索文件失败');
            }

            const searchResult = await searchResponse.json();
            
            if (searchResult.files && searchResult.files.length > 0) {
                this.fileId = searchResult.files[0].id;
                console.log('找到现有数据文件:', this.fileId);
            } else {
                console.log('未找到数据文件，将在首次上传时创建');
            }
            
        } catch (error) {
            console.error('查找数据文件失败:', error);
            throw error;
        }
    }

    async uploadData(data) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const content = JSON.stringify(data, null, 2);
            
            if (this.fileId) {
                // 更新现有文件
                await this.updateFile(content);
            } else {
                // 创建新文件
                await this.createFile(content);
            }
            
            console.log('✅ 数据已上传到Google Drive');
            
        } catch (error) {
            console.error('❌ Google Drive上传失败:', error);
            throw error;
        }
    }

    async createFile(content) {
        const metadata = {
            name: this.dataFileName,
            parents: this.settings.folderId ? [this.settings.folderId] : undefined
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('media', new Blob([content], {type: 'application/json'}));

        const response = await fetch(`${this.uploadUrl}?uploadType=multipart`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.settings.accessToken}`
            },
            body: form
        });

        if (!response.ok) {
            throw new Error(`创建文件失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        this.fileId = result.id;
        console.log('创建新文件成功:', this.fileId);
    }

    async updateFile(content) {
        const response = await fetch(`${this.uploadUrl}/${this.fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.settings.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: content
        });

        if (!response.ok) {
            throw new Error(`更新文件失败: ${response.status} ${response.statusText}`);
        }

        console.log('更新文件成功');
    }

    async downloadData() {
        if (!this.connected) {
            await this.connect();
        }

        if (!this.fileId) {
            console.log('没有找到数据文件，返回空数据');
            return {};
        }

        try {
            const response = await fetch(`${this.baseUrl}/files/${this.fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.settings.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`下载文件失败: ${response.status} ${response.statusText}`);
            }

            const content = await response.text();
            const data = JSON.parse(content);
            
            console.log('✅ 从Google Drive下载数据成功');
            return data;
            
        } catch (error) {
            console.error('❌ Google Drive下载失败:', error);
            throw error;
        }
    }
}

/**
 * 自建服务器同步提供商
 * 使用自建的HTTP API进行数据同步
 */
class ServerSyncProvider extends SyncProvider {
    constructor(settings) {
        super(settings);
        this.name = 'Server';
        this.validateSettings();
    }

    validateSettings() {
        const required = ['serverUrl'];
        const missing = required.filter(key => !this.settings[key]);
        
        if (missing.length > 0) {
            throw new Error(`服务器同步缺少必需设置: ${missing.join(', ')}`);
        }

        // 确保URL以/结尾
        if (!this.settings.serverUrl.endsWith('/')) {
            this.settings.serverUrl += '/';
        }
    }

    async connect() {
        try {
            // 测试服务器连接
            const response = await fetch(`${this.settings.serverUrl}health`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`服务器健康检查失败: ${response.status} ${response.statusText}`);
            }

            this.connected = true;
            console.log('✅ 服务器连接成功');
            
        } catch (error) {
            console.error('❌ 服务器连接失败:', error);
            throw error;
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.settings.apiKey) {
            headers['Authorization'] = `Bearer ${this.settings.apiKey}`;
        }

        if (this.settings.userId) {
            headers['X-User-ID'] = this.settings.userId;
        }

        return headers;
    }

    async uploadData(data) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const response = await fetch(`${this.settings.serverUrl}sync/upload`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    data: data,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`服务器上传失败: ${response.status} ${response.statusText}`);
            }

            console.log('✅ 数据已上传到服务器');
            
        } catch (error) {
            console.error('❌ 服务器上传失败:', error);
            throw error;
        }
    }

    async downloadData() {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const response = await fetch(`${this.settings.serverUrl}sync/download`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                console.log('服务器上没有数据，返回空数据');
                return {};
            }

            if (!response.ok) {
                throw new Error(`服务器下载失败: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ 从服务器下载数据成功');
            return result.data || {};
            
        } catch (error) {
            console.error('❌ 服务器下载失败:', error);
            throw error;
        }
    }
}

/**
 * WebRTC点对点同步提供商
 * 使用WebRTC实现设备间直接同步
 */
class WebRTCSyncProvider extends SyncProvider {
    constructor(settings) {
        super(settings);
        this.name = 'WebRTC';
        this.peerConnection = null;
        this.dataChannel = null;
        this.isInitiator = settings.isInitiator || false;
        this.signalUrl = settings.signalUrl || 'wss://your-signaling-server.com';
        this.roomId = settings.roomId || 'default-room';
    }

    async connect() {
        try {
            // 创建WebRTC连接
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            // 设置数据通道
            if (this.isInitiator) {
                this.dataChannel = this.peerConnection.createDataChannel('sync');
                this.setupDataChannel();
            } else {
                this.peerConnection.ondatachannel = (event) => {
                    this.dataChannel = event.channel;
                    this.setupDataChannel();
                };
            }

            // 连接信令服务器
            await this.connectSignaling();
            
            this.connected = true;
            console.log('✅ WebRTC连接成功');
            
        } catch (error) {
            console.error('❌ WebRTC连接失败:', error);
            throw error;
        }
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('数据通道已打开');
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleDataChannelMessage(message);
            } catch (error) {
                console.error('处理数据通道消息失败:', error);
            }
        };
    }

    async connectSignaling() {
        // 这里需要实现信令服务器的连接逻辑
        // 包括offer/answer交换和ICE候选交换
        console.log('连接信令服务器...');
        // 实际实现需要WebSocket连接到信令服务器
    }

    handleDataChannelMessage(message) {
        // 处理来自对等端的消息
        console.log('收到对等端消息:', message);
    }

    async uploadData(data) {
        if (!this.connected || !this.dataChannel || this.dataChannel.readyState !== 'open') {
            throw new Error('WebRTC连接未就绪');
        }

        try {
            const message = {
                type: 'sync-data',
                data: data,
                timestamp: new Date().toISOString()
            };

            this.dataChannel.send(JSON.stringify(message));
            console.log('✅ 数据已通过WebRTC发送');
            
        } catch (error) {
            console.error('❌ WebRTC发送失败:', error);
            throw error;
        }
    }

    async downloadData() {
        // WebRTC是双向的，这里可能需要请求数据
        return new Promise((resolve, reject) => {
            if (!this.connected || !this.dataChannel || this.dataChannel.readyState !== 'open') {
                reject(new Error('WebRTC连接未就绪'));
                return;
            }

            // 发送数据请求
            const requestMessage = {
                type: 'request-data',
                timestamp: new Date().toISOString()
            };

            this.dataChannel.send(JSON.stringify(requestMessage));
            
            // 设置响应处理器
            const originalHandler = this.dataChannel.onmessage;
            this.dataChannel.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'sync-data') {
                        resolve(message.data);
                        this.dataChannel.onmessage = originalHandler;
                    }
                } catch (error) {
                    reject(error);
                }
            };

            // 超时处理
            setTimeout(() => {
                reject(new Error('WebRTC数据请求超时'));
                this.dataChannel.onmessage = originalHandler;
            }, 10000);
        });
    }
}

/**
 * 联想个人云同步提供商
 * 使用WebDAV协议连接联想家庭存储设备
 */
class LenovoCloudSyncProvider extends SyncProvider {
    constructor(settings) {
        super(settings);
        this.name = 'Lenovo Cloud';
        this.dataFileName = 'plan-manager-sync.json';
        this.backupFileName = 'plan-manager-backup.json';
        
        // 默认配置
        this.settings = {
            url: settings.url || 'http://192.168.1.100:5005',
            username: settings.username,
            password: settings.password,
            timeout: settings.timeout || 30000,
            enableBackup: settings.enableBackup !== false
        };
        
        this.validateSettings();
    }

    validateSettings() {
        if (!this.settings.username || !this.settings.password) {
            throw new Error('联想云同步需要用户名和密码');
        }
    }

    getAuthHeader() {
        const credentials = btoa(`${this.settings.username}:${this.settings.password}`);
        return `Basic ${credentials}`;
    }

    async connect() {
        try {
            console.log('正在连接联想个人云...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);
            
            const response = await fetch(this.settings.url, {
                method: 'PROPFIND',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Depth': '1',
                    'Content-Type': 'application/xml'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (response.status === 401) {
                throw new Error('用户名或密码错误');
            }
            
            if (!response.ok) {
                throw new Error(`连接失败: ${response.status} ${response.statusText}`);
            }

            this.connected = true;
            console.log('✅ 联想个人云连接成功');
            
            // 测试文件读写权限
            await this.testWritePermission();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('连接超时，请检查网络和设备状态');
            }
            console.error('❌ 联想云连接失败:', error);
            throw error;
        }
    }

    async testWritePermission() {
        try {
            const testData = {
                test: true,
                timestamp: new Date().toISOString()
            };
            
            const testFileName = 'test-permission.json';
            const fileUrl = `${this.settings.url}/${testFileName}`;
            
            // 尝试写入测试文件
            const response = await fetch(fileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            if (!response.ok) {
                throw new Error('没有写入权限');
            }
            
            // 删除测试文件
            await fetch(fileUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': this.getAuthHeader()
                }
            });
            
            console.log('✅ 读写权限测试通过');
            
        } catch (error) {
            throw new Error(`权限测试失败: ${error.message}`);
        }
    }

    async uploadData(data) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            console.log('正在上传数据到联想个人云...');
            
            // 先备份现有数据
            if (this.settings.enableBackup) {
                await this.backupExistingData();
            }
            
            const uploadData = {
                ...data,
                syncInfo: {
                    uploadTime: new Date().toISOString(),
                    provider: 'Lenovo Cloud',
                    version: '1.0.0',
                    deviceInfo: {
                        userAgent: navigator.userAgent,
                        platform: this.getPlatform()
                    }
                }
            };
            
            const content = JSON.stringify(uploadData, null, 2);
            const fileUrl = `${this.settings.url}/${this.dataFileName}`;

            const response = await fetch(fileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: content
            });

            if (!response.ok) {
                throw new Error(`上传失败: ${response.status} ${response.statusText}`);
            }

            console.log('✅ 数据已成功上传到联想个人云');
            
        } catch (error) {
            console.error('❌ 联想云上传失败:', error);
            throw error;
        }
    }

    async downloadData() {
        if (!this.connected) {
            await this.connect();
        }

        try {
            console.log('正在从联想个人云下载数据...');
            
            const fileUrl = `${this.settings.url}/${this.dataFileName}`;
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader()
                }
            });

            if (response.status === 404) {
                console.log('联想云上没有数据文件，返回空数据');
                return {};
            }

            if (!response.ok) {
                throw new Error(`下载失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ 从联想个人云下载数据成功');
            
            // 返回纯净的数据，移除同步信息
            const { syncInfo, ...cleanData } = data;
            return cleanData;
            
        } catch (error) {
            console.error('❌ 联想云下载失败:', error);
            throw error;
        }
    }

    async backupExistingData() {
        try {
            const existingData = await this.downloadData();
            if (Object.keys(existingData).length > 0) {
                const backupUrl = `${this.settings.url}/${this.backupFileName}`;
                const backupData = {
                    ...existingData,
                    backupInfo: {
                        backupTime: new Date().toISOString(),
                        originalData: true
                    }
                };
                
                await fetch(backupUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(backupData, null, 2)
                });
                
                console.log('✅ 现有数据已备份');
            }
        } catch (error) {
            console.warn('⚠️ 数据备份失败:', error.message);
        }
    }

    getPlatform() {
        if (window.electronAPI) {
            return 'desktop-electron';
        } else if (window.navigator.standalone) {
            return 'mobile-pwa';
        } else {
            return 'web-browser';
        }
    }

    async getStorageInfo() {
        try {
            const response = await fetch(this.settings.url, {
                method: 'PROPFIND',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Depth': '0'
                }
            });
            
            if (response.ok) {
                // 解析WebDAV响应获取存储信息
                const text = await response.text();
                return { available: true, details: text };
            }
            
            return { available: false };
        } catch (error) {
            return { available: false, error: error.message };
        }
    }
}

// 导出同步提供商
if (typeof window !== 'undefined') {
    window.SyncProviders = {
        GitHubSyncProvider,
        GoogleDriveSyncProvider,
        ServerSyncProvider,
        WebRTCSyncProvider,
        LenovoCloudSyncProvider
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SyncProvider,
        GitHubSyncProvider,
        GoogleDriveSyncProvider,
        ServerSyncProvider,
        WebRTCSyncProvider
    };
}
