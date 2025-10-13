/**
 * LeanCloud 配置
 * 国内云服务，速度快，实时同步
 */

const leancloudConfig = {
    appId: 'bly33X1mKceGwbzforskqtvJ-gzGzoHsz',
    appKey: 'EFWFthoO91B8oBoofo3ID753',
    serverURL: 'https://bly33x1m.lc-cn-n1-shared.com'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = leancloudConfig;
} else {
    window.leancloudConfig = leancloudConfig;
}

console.log('✅ LeanCloud配置已加载');

